from datetime import date, timedelta
import calendar
import json

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.http import require_http_methods

from .forms import RoutineCreateForm
from .models import DailyCompletion, Routine, RoutineStep
from products.models import Product
from users.models import UserProfile


@login_required
def dashboard(request):
    """Dashboard: routines, progress, calendar and products."""
    weekly_routine = Routine.objects.filter(
        user=request.user, routine_type="weekly"
    ).first()
    monthly_routine = Routine.objects.filter(
        user=request.user, routine_type="monthly"
    ).first()
    hair_routine = Routine.objects.filter(
        user=request.user, routine_type="hair"
    ).first()
    body_routine = Routine.objects.filter(
        user=request.user, routine_type="body"
    ).first()
    special_routine = Routine.objects.filter(
        user=request.user, routine_type="special"
    ).first()
    seasonal_routine = Routine.objects.filter(
        user=request.user, routine_type="seasonal"
    ).first()

    today = date.today()
    year = today.year
    month = today.month

    start_date = date(year, month, 1)
    last_day = calendar.monthrange(year, month)[1]
    end_date = date(year, month, last_day)

    try:
        morning_routine = Routine.objects.filter(
            user=request.user, routine_type="morning"
        ).first()
        evening_routine = Routine.objects.filter(
            user=request.user, routine_type="evening"
        ).first()
        completions = DailyCompletion.objects.filter(
            user=request.user, date__gte=start_date, date__lte=end_date
        )
    except Exception:
        messages.error(
            request,
            "We're having trouble loading your routines. Try refreshing.",
        )
        morning_routine = None
        evening_routine = None
        completions = DailyCompletion.objects.none()

    # === Today's progress ===
    today_completions = DailyCompletion.objects.filter(
        user=request.user, date=today
    )
    total_steps_today = 0
    completed_steps_today = 0

    if morning_routine:
        morning_steps = morning_routine.steps.count()
        total_steps_today += morning_steps
        completed_morning = today_completions.filter(
            routine_step__routine=morning_routine, completed=True
        ).count()
        completed_steps_today += completed_morning

    if evening_routine:
        evening_steps = evening_routine.steps.count()
        total_steps_today += evening_steps
        completed_evening = today_completions.filter(
            routine_step__routine=evening_routine, completed=True
        ).count()
        completed_steps_today += completed_evening

    today_progress = 0
    if total_steps_today > 0:
        today_progress = int(
            (completed_steps_today / total_steps_today) * 100
        )

    # === Current streak ===
    current_streak = 0
    check_date = today
    while True:
        day_completions = DailyCompletion.objects.filter(
            user=request.user, date=check_date
        )
        daily_total = 0
        daily_completed = 0

        if morning_routine:
            daily_total += morning_routine.steps.count()
            daily_completed += day_completions.filter(
                routine_step__routine=morning_routine, completed=True
            ).count()
        if evening_routine:
            daily_total += evening_routine.steps.count()
            daily_completed += day_completions.filter(
                routine_step__routine=evening_routine, completed=True
            ).count()

        if daily_total > 0 and daily_completed == daily_total:
            current_streak += 1
            check_date -= timedelta(days=1)
        else:
            break

    # === Milestones ===
    milestone_message = None
    milestone_emoji = None
    milestones = [
        (30, "Fantastic! One month streak!", "🎯"),
        (14, "Two weeks strong! Keep it up!", "🔥"),
        (7, "One week streak! You're on fire!", "🚀"),
        (3, "Great start! Building habits!", "👏"),
        (1, "First day completed! Welcome!", "🎊"),
    ]
    for threshold, message, emoji in milestones:
        if current_streak >= threshold:
            milestone_message = message
            milestone_emoji = emoji
            break

    # === This week's progress ===
    week_start = today - timedelta(days=today.weekday())
    week_progress = []
    day_names = ["M", "T", "W", "T", "F", "S", "S"]

    for i in range(7):
        day = week_start + timedelta(days=i)
        day_completions = DailyCompletion.objects.filter(
            user=request.user, date=day
        )
        day_total = 0
        day_completed = 0

        if morning_routine:
            day_total += morning_routine.steps.count()
            day_completed += day_completions.filter(
                routine_step__routine=morning_routine, completed=True
            ).count()
        if evening_routine:
            day_total += evening_routine.steps.count()
            day_completed += day_completions.filter(
                routine_step__routine=evening_routine, completed=True
            ).count()

        if day > today:
            status = "future"
        elif day == today:
            status = "current"
        elif day_total > 0 and day_completed == day_total:
            status = "completed"
        else:
            status = "incomplete"

        week_progress.append(
            {"day": day_names[i], "status": status, "date": day}
        )

    # === Calendar completion map ===
    completion_map = {}
    for comp in completions:
        date_key = comp.date.strftime("%Y-%m-%d")
        step_type = (
            comp.routine_step.routine.routine_type
            if hasattr(comp.routine_step.routine, "routine_type")
            else None
        )
        if date_key not in completion_map:
            completion_map[date_key] = {"morning": False, "evening": False}
        if step_type in ["morning", "evening"] and comp.completed:
            completion_map[date_key][step_type] = True

    routine_events = []
    for day in range(1, last_day + 1):
        day_date = date(year, month, day)
        date_key = day_date.strftime("%Y-%m-%d")
        status = "not_done"
        if date_key in completion_map:
            morning_done = completion_map[date_key]["morning"]
            evening_done = completion_map[date_key]["evening"]
            if morning_done and evening_done:
                status = "completed"
            elif morning_done:
                status = "morning"
            elif evening_done:
                status = "evening"
        routine_events.append({"date": date_key, "status": status})

    # Weekly and monthly due dates
    weekly_steps = RoutineStep.objects.filter(
        routine__user=request.user, frequency="weekly"
    )
    weekly_due_dates = []
    for step in weekly_steps:
        for day in range(1, last_day + 1):
            day_date = date(year, month, day)
            if day_date.weekday() == 0:
                weekly_due_dates.append(
                    {
                        "date": day_date.strftime("%Y-%m-%d"),
                        "step_name": step.step_name,
                        "routine_type": step.routine.routine_type,
                    }
                )

    weekly_due_dates_json = json.dumps(weekly_due_dates)

    monthly_steps = RoutineStep.objects.filter(
        routine__user=request.user, frequency="monthly"
    )
    monthly_due_dates = []
    for step in monthly_steps:
        monthly_due_dates.append(
            {
                "date": start_date.strftime("%Y-%m-%d"),
                "step_name": step.step_name,
                "routine_type": step.routine.routine_type,
            }
        )
    monthly_due_dates_json = json.dumps(monthly_due_dates)

    routine_events_json = json.dumps(routine_events)

    # === Handle POST submissions (existing logic) ===
    if request.method == "POST":
        try:
            routine_id = int(request.POST.get("routine_id") or 0)
        except (TypeError, ValueError):
            routine_id = 0

        if routine_id:
            routine = Routine.objects.filter(
                pk=routine_id, user=request.user
            ).first()
            if routine:
                today = date.today()
                for step in routine.steps.all():
                    checked = bool(
                        request.POST.get(f"completed_{step.id}", False)
                    )
                    if step.completed != checked:
                        step.completed = checked
                        step.save()

                    daily_completion, created = DailyCompletion.objects.get_or_create(
                        user=request.user,
                        routine_step=step,
                        date=today,
                        defaults={"completed": checked},
                    )
                    if not created and daily_completion.completed != checked:
                        daily_completion.completed = checked
                        daily_completion.save()

        return redirect(request.path)

    today_completed_step_ids = set(
        today_completions.filter(completed=True).values_list(
            "routine_step_id", flat=True
        )
    )

    # === Skin type and products ===
    user_skin_type = None
    try:
        profile = UserProfile.objects.filter(user=request.user).first()
        user_skin_type = profile.skin_type if profile else None
    except Exception:
        user_skin_type = None

    skin_type_products = (
        Product.objects.filter(user=request.user, skin_type=user_skin_type)
        .exclude(skin_type__isnull=True)
        .exclude(skin_type="")
        .all()[:5]
        if user_skin_type
        else []
    )

    favorite_products = Product.objects.filter(
        user=request.user, is_favorite=True
    )[:5]

    # === Product expiry events ===
    expiry_threshold = today + timedelta(days=90)
    expiring_products = Product.objects.filter(
        user=request.user,
        expiry_date__lte=expiry_threshold,
        expiry_date__gte=today,
    ).order_by("expiry_date")

    expiry_events = []
    for product in expiring_products:
        days_until_expiry = (product.expiry_date - today).days
        if days_until_expiry < 0:
            status = "expired"
        elif days_until_expiry <= 30:
            status = "warning"
        else:
            status = "info"

        expiry_events.append(
            {
                "date": product.expiry_date.strftime("%Y-%m-%d"),
                "title": f"{product.name} expires",
                "type": "expiry",
                "status": status,
                "product_name": product.name,
                "brand": product.brand,
                "days_until": days_until_expiry,
                "expiry_date": product.expiry_date.strftime("%Y-%m-%d"),
            }
        )

    # Mark if favorites were used on days (simplified)
    for event in routine_events:
        if event.get("date") and event.get("status") in [
            "completed",
            "morning",
            "evening",
        ]:
            event["favorite_used"] = favorite_products.exists()

    return render(
        request,
        "routines/dashboard.html",
        {
            "morning_routine": morning_routine,
            "evening_routine": evening_routine,
            "weekly_routine": weekly_routine,
            "monthly_routine": monthly_routine,
            "hair_routine": hair_routine,
            "body_routine": body_routine,
            "special_routine": special_routine,
            "seasonal_routine": seasonal_routine,
            "routine_events_json": routine_events_json,
            "weekly_due_dates_json": weekly_due_dates_json,
            "monthly_due_dates_json": monthly_due_dates_json,
            "today_progress": today_progress,
            "completed_steps_today": completed_steps_today,
            "total_steps_today": total_steps_today,
            "current_streak": current_streak,
            "milestone_message": milestone_message,
            "milestone_emoji": milestone_emoji,
            "week_progress": week_progress,
            "today_completed_step_ids": today_completed_step_ids,
            "user_skin_type": user_skin_type,
            "skin_type_products": skin_type_products,
            "favorite_products": favorite_products,
            "expiring_products": expiring_products,
            "expiry_events_json": json.dumps(expiry_events),
        },
    )


@login_required
def add_routine(request):
    """Create a routine. GET renders, POST creates it."""
    if request.method == "POST":
        form = RoutineCreateForm(request.POST, user=request.user)
        if form.is_valid():
            data = form.cleaned_data
            routine = Routine.objects.create(
                user=request.user,
                name=data["routine_name"],
                routine_type=data["routine_type"],
            )
            order = 1
            inferred_freq = (
                data["routine_type"]
                if data["routine_type"] in ("weekly", "monthly")
                else "daily"
            )

            for i in range(1, 11):
                step_text = data.get(f"step{i}")
                product = data.get(f"product{i}")
                if step_text:
                    RoutineStep.objects.create(
                        routine=routine,
                        step_name=step_text,
                        order=order,
                        product=product,
                        frequency=inferred_freq,
                    )
                    order += 1

            if (
                request.headers.get("x-requested-with") == "XMLHttpRequest"
                or request.META.get("HTTP_X_REQUESTED_WITH")
                == "XMLHttpRequest"
            ):
                return JsonResponse(
                    {
                        "success": True,
                        "id": routine.id,
                        "name": routine.name,
                        "detail_url": reverse("routines:dashboard"),
                    }
                )

            request.session["last_added_routine_name"] = routine.name
            return redirect(reverse("routines:add"))
        else:
            if (
                request.headers.get("x-requested-with") == "XMLHttpRequest"
                or request.META.get("HTTP_X_REQUESTED_WITH") == "XMLHttpRequest"
            ):
                errors = {k: list(v) for k, v in form.errors.items()}
                return JsonResponse(
                    {
                        "success": False,
                        "errors": errors,
                        "non_field_errors": list(form.non_field_errors()),
                    },
                    status=400,
                )

            for err in form.non_field_errors():
                messages.error(request, err)

            context = {
                "form": form,
                "is_editing": False,
                "page_title": "Create New Routine",
            }
            return render(request, "routines/add_routine.html", context)

    initial = {}
    pre_type = request.GET.get("type")
    if pre_type:
        initial["routine_type"] = pre_type

    form = RoutineCreateForm(initial=initial, user=request.user)
    just_created_name = request.session.pop("last_added_routine_name", None)
    context = {
        "form": form,
        "is_editing": False,
        "page_title": "Create New Routine",
        "just_created_name": just_created_name,
    }
    return render(request, "routines/add_routine.html", context)


@login_required
def my_routines(request):
    """Show a user's morning and evening routines."""
    morning_routine = Routine.objects.filter(
        user=request.user, routine_type="morning"
    ).first()
    evening_routine = Routine.objects.filter(
        user=request.user, routine_type="evening"
    ).first()
    return render(
        request,
        "routines/dashboard.html",
        {"morning_routine": morning_routine, "evening_routine": evening_routine},
    )


@login_required
def edit_routine(request, pk):
    """Edit an existing routine; reuses add template."""
    routine = get_object_or_404(Routine, pk=pk, user=request.user)

    if request.method == "POST":
        form = RoutineCreateForm(request.POST, user=request.user)
        if form.is_valid():
            data = form.cleaned_data
            routine.name = data["routine_name"]
            routine.routine_type = data["routine_type"]
            routine.save()

            desired_steps = []
            for i in range(1, 11):
                name = data.get(f"step{i}")
                product = data.get(f"product{i}")
                if name:
                    desired_steps.append({"name": name, "product": product})

            default_freq = (
                routine.routine_type
                if routine.routine_type in ("weekly", "monthly")
                else "daily"
            )

            existing_steps = list(routine.steps.all().order_by("order"))
            max_len = max(len(existing_steps), len(desired_steps))
            for idx in range(max_len):
                desired = desired_steps[idx] if idx < len(desired_steps) else None
                existing = existing_steps[idx] if idx < len(existing_steps) else None
                position = idx + 1

                if desired and existing:
                    existing.step_name = desired["name"]
                    existing.product = desired["product"]
                    existing.order = position
                    existing.save()
                elif desired and not existing:
                    RoutineStep.objects.create(
                        routine=routine,
                        step_name=desired["name"],
                        order=position,
                        product=desired["product"],
                        frequency=default_freq,
                    )
                elif existing and not desired:
                    existing.delete()

            return redirect("routines:dashboard")
        else:
            context = {
                "form": form,
                "routine": routine,
                "is_editing": True,
                "page_title": f"Edit {routine.name}",
            }
            return render(request, "routines/add_routine.html", context)
    else:
        existing_steps = list(routine.steps.all().order_by("order"))
        initial_data = {
            "routine_name": routine.name,
            "routine_type": routine.routine_type,
        }
        for i, step in enumerate(existing_steps, 1):
            initial_data[f"step{i}"] = step.step_name
            if step.product:
                initial_data[f"product{i}"] = step.product.id

        form = RoutineCreateForm(initial=initial_data, user=request.user)
        context = {
            "form": form,
            "routine": routine,
            "is_editing": True,
            "page_title": f"Edit {routine.name}",
        }
        return render(request, "routines/add_routine.html", context)


@login_required
@require_http_methods(["POST"])
def mark_routine_complete(request):
    """AJAX: mark all steps in a routine complete for today."""
    try:
        data = json.loads(request.body)
        routine_id = data.get("routine_id")
        routine_type = data.get("routine_type")

        if not routine_id:
            return JsonResponse(
                {"success": False, "error": "Routine ID is required"}
            )

        routine = get_object_or_404(Routine, id=routine_id, user=request.user)
        today = date.today()
        completed_count = 0

        for step in routine.steps.all():
            completion, created = DailyCompletion.objects.get_or_create(
                user=request.user,
                routine_step=step,
                date=today,
                defaults={"completed": True, "completed_at": timezone.now()},
            )
            if not created and not completion.completed:
                completion.completed = True
                completion.completed_at = timezone.now()
                completion.save()
            completed_count += 1

        return JsonResponse(
            {
                "success": True,
                "message": (
                    f"Marked {completed_count} steps complete for "
                    f"{routine_type} routine"
                ),
            }
        )
    except json.JSONDecodeError:
        return JsonResponse(
            {"success": False, "error": "Invalid data format"}
        )
    except Exception as e:
        return JsonResponse(
            {"success": False, "error": f"Error: {str(e)}"}
        )


@login_required
@require_http_methods(["POST"])
def toggle_step_completion(request):
    """AJAX: toggle a single step completion for today."""
    try:
        data = json.loads(request.body)
        step_id = data.get("step_id")
        if not step_id:
            return JsonResponse(
                {"success": False, "error": "Step ID is required"}
            )

        try:
            step = RoutineStep.objects.get(
                id=step_id, routine__user=request.user
            )
        except RoutineStep.DoesNotExist:
            return JsonResponse(
                {"success": False, "error": "Step not found or access denied"}
            )

        today = date.today()
        completion, created = DailyCompletion.objects.get_or_create(
            user=request.user, routine_step=step, date=today,
            defaults={"completed": False}
        )

        completion.completed = not completion.completed
        completion.completed_at = (
            timezone.now() if completion.completed else None
        )
        completion.save()

        return JsonResponse(
            {
                "success": True,
                "completed": completion.completed,
                "step_name": step.step_name,
                "message": (
                    "Completed: " if completion.completed else "Unchecked: "
                ) + step.step_name,
            }
        )
    except json.JSONDecodeError:
        return JsonResponse(
            {"success": False, "error": "Invalid JSON data"}
        )
    except Exception as e:
        return JsonResponse(
            {"success": False, "error": f"Error: {str(e)}"}
        )


@login_required
def get_routine_data(request, pk):
    """Return routine data for modal editing (JSON)."""
    try:
        routine = get_object_or_404(Routine, pk=pk, user=request.user)
        steps_data = []
        for step in routine.steps.all().order_by("order"):
            steps_data.append(
                {
                    "step_name": step.step_name,
                    "product_id": step.product.id if step.product else None,
                    "order": step.order,
                }
            )

        return JsonResponse(
            {
                "success": True,
                "routine_name": routine.name,
                "routine_type": routine.routine_type,
                "steps": steps_data,
            }
        )
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)})


@login_required
def delete_routine(request, pk):
    """Delete a routine and redirect to dashboard."""
    if request.method == "POST":
        try:
            routine = get_object_or_404(Routine, pk=pk, user=request.user)
            routine_name = routine.name
            routine.delete()

            if request.headers.get("Content-Type") == "application/json":
                return JsonResponse(
                    {
                        "success": True,
                        "message": (
                            f'Routine "{routine_name}" deleted successfully'
                        ),
                    }
                )
            else:
                messages.success(
                    request,
                    f'Routine "{routine_name}" deleted successfully',
                )
                return redirect("routines:dashboard")
        except Exception as e:
            if request.headers.get("Content-Type") == "application/json":
                return JsonResponse({"success": False, "error": str(e)})
            else:
                messages.error(
                    request, "Error deleting routine. Please try again."
                )
                return redirect("routines:dashboard")
    else:
        return redirect("routines:dashboard")
