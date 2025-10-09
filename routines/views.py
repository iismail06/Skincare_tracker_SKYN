from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib import messages
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .forms import RoutineCreateForm
from django.contrib.auth.decorators import login_required
from users.models import UserProfile
from .models import Routine, RoutineStep, DailyCompletion
from products.models import Product
from datetime import date


@login_required
def dashboard(request):
    weekly_routine = Routine.objects.filter(user=request.user, routine_type='weekly').first()
    monthly_routine = Routine.objects.filter(user=request.user, routine_type='monthly').first()
    hair_routine = Routine.objects.filter(user=request.user, routine_type='hair').first()
    body_routine = Routine.objects.filter(user=request.user, routine_type='body').first()
    special_routine = Routine.objects.filter(user=request.user, routine_type='special').first()
    seasonal_routine = Routine.objects.filter(user=request.user, routine_type='seasonal').first()
    """
    Dashboard view that shows user's routines with real progress tracking.
    
    This function calculates:
    - Today's completion percentage
    - Current streak of consecutive completed days
    - This week's daily progress
    - Calendar data for the month
    """

    import calendar
    from datetime import date, timedelta
    import json

    # Get current date information
    today = date.today()
    year = today.year
    month = today.month
    
    # Calculate the first and last day of current month for calendar
    start_date = date(year, month, 1)
    last_day = calendar.monthrange(year, month)[1]
    end_date = date(year, month, last_day)

    # Get user's routines (morning and evening) with error handling
    try:
        morning_routines = Routine.objects.filter(user=request.user, routine_type='morning')
        evening_routines = Routine.objects.filter(user=request.user, routine_type='evening')
        morning_routine = morning_routines.first()  # Get the first (should be only one)
        evening_routine = evening_routines.first()  # Get the first (should be only one)

        # Get all completion records for this month (for calendar display)
        completions = DailyCompletion.objects.filter(user=request.user, date__gte=start_date, date__lte=end_date)
    except Exception as e:
        messages.error(request, "We're having trouble loading your routines. Please try refreshing the page.")
        # Set safe defaults so the page still loads
        morning_routine = None
        evening_routine = None
        completions = DailyCompletion.objects.none()

    # === CALCULATE TODAY'S PROGRESS ===
    today_completions = DailyCompletion.objects.filter(user=request.user, date=today)
    total_steps_today = 0
    completed_steps_today = 0
    
    # Count morning routine steps
    if morning_routine:
        morning_steps = morning_routine.steps.count()
        total_steps_today += morning_steps
        completed_morning = today_completions.filter(routine_step__routine=morning_routine, completed=True).count()
        completed_steps_today += completed_morning
    
    # Count evening routine steps
    if evening_routine:
        evening_steps = evening_routine.steps.count()
        total_steps_today += evening_steps
        completed_evening = today_completions.filter(routine_step__routine=evening_routine, completed=True).count()
        completed_steps_today += completed_evening

    # Calculate percentage (avoid division by zero)
    today_progress = 0
    if total_steps_today > 0:
        today_progress = int((completed_steps_today / total_steps_today) * 100)

    # === CALCULATE CURRENT STREAK ===
    current_streak = 0
    check_date = today
    
    # Keep checking previous days until we find an incomplete day
    while True:
        day_completions = DailyCompletion.objects.filter(user=request.user, date=check_date)
        daily_total = 0
        daily_completed = 0
        
        # Count total and completed steps for this day
        if morning_routine:
            daily_total += morning_routine.steps.count()
            daily_completed += day_completions.filter(routine_step__routine=morning_routine, completed=True).count()
        if evening_routine:
            daily_total += evening_routine.steps.count()
            daily_completed += day_completions.filter(routine_step__routine=evening_routine, completed=True).count()
        
        # If this day was fully completed, add to streak and check previous day
        if daily_total > 0 and daily_completed == daily_total:
            current_streak += 1
            check_date -= timedelta(days=1)
        else:
            # Streak broken, stop counting
            break

    # === CALCULATE MILESTONE MESSAGES ===
    milestone_message = None
    milestone_emoji = None
    
    # Define milestone thresholds and messages
    milestones = [
        (30, " Fantastic! One month streak!", "🎯"),
        (14, " Two weeks strong! Keep it up!", "🔥"),
        (7, " One week streak! You're on fire!", "🚀"),
        (3, " Great start! Building habits!", "👏"),
        (1, " First day completed! Welcome!", "🎊")
    ]
    
    # Find the appropriate milestone message
    for threshold, message, emoji in milestones:
        if current_streak >= threshold:
            milestone_message = message
            milestone_emoji = emoji
            break

    # === CALCULATE THIS WEEK'S PROGRESS ===
    # Get Monday of current week
    week_start = today - timedelta(days=today.weekday())  # Monday = 0
    week_progress = []
    day_names = ['M', 'T', 'W', 'T', 'F', 'S', 'S']  # Monday to Sunday
    
    # Check each day of the week
    for i in range(7):
        day = week_start + timedelta(days=i)
        day_completions = DailyCompletion.objects.filter(user=request.user, date=day)
        day_total = 0
        day_completed = 0
        
        # Count steps for this day
        if morning_routine:
            day_total += morning_routine.steps.count()
            day_completed += day_completions.filter(routine_step__routine=morning_routine, completed=True).count()
        if evening_routine:
            day_total += evening_routine.steps.count()
            day_completed += day_completions.filter(routine_step__routine=evening_routine, completed=True).count()
        
        # Determine status for display
        if day > today:
            status = 'future'  # Future days
        elif day == today:
            status = 'current'  # Today
        elif day_total > 0 and day_completed == day_total:
            status = 'completed'  # Fully completed past day
        else:
            status = 'incomplete'  # Incomplete past day
        
        week_progress.append({
            'day': day_names[i],
            'status': status,
            'date': day
        })

    # === PREPARE CALENDAR DATA ===
    # Build a dictionary to track completion status for each date
    # Format: {date: {'morning': True/False, 'evening': True/False}}
    completion_map = {}
    for comp in completions:
        date_key = comp.date.strftime('%Y-%m-%d')  # Convert date to string format
        
        # Get the routine type (morning or evening)
        step_type = comp.routine_step.routine.routine_type if hasattr(comp.routine_step.routine, 'routine_type') else None
        
        # Initialize the date entry if it doesn't exist
        if date_key not in completion_map:
            completion_map[date_key] = {'morning': False, 'evening': False}
        
        # Mark as completed if this step was completed
        if step_type in ['morning', 'evening'] and comp.completed:
            completion_map[date_key][step_type] = True

    # Create events list for calendar display (used by JavaScript)
    routine_events = []
    for day in range(1, last_day + 1):
        day_date = date(year, month, day)
        date_key = day_date.strftime('%Y-%m-%d')
        
        # Determine overall status for this day
        status = 'not_done'  # Default status
        if date_key in completion_map:
            morning_done = completion_map[date_key]['morning']
            evening_done = completion_map[date_key]['evening']
            
            if morning_done and evening_done:
                status = 'completed'  # Both routines completed
            elif morning_done:
                status = 'morning'    # Only morning completed
            elif evening_done:
                status = 'evening'    # Only evening completed
            else:
                status = 'not_done'   # Neither completed
        
        routine_events.append({'date': date_key, 'status': status})
    # === COLLECT WEEKLY STEPS AND DUE DATES (moved here) ===
    weekly_steps = RoutineStep.objects.filter(routine__user=request.user, frequency='weekly')
    weekly_due_dates = []
    # For simplicity, default weekly steps to Monday (weekday=0)
    for step in weekly_steps:
        for day in range(1, last_day + 1):
            day_date = date(year, month, day)
            if day_date.weekday() == 0:  # Monday
                weekly_due_dates.append({
                    'date': day_date.strftime('%Y-%m-%d'),
                    'step_name': step.step_name,
                    'routine_type': step.routine.routine_type
                })
    weekly_due_dates_json = json.dumps(weekly_due_dates)

    # Monthly routine due dates (default: first day of month)
    monthly_steps = RoutineStep.objects.filter(routine__user=request.user, frequency='monthly')
    monthly_due_dates = []
    for step in monthly_steps:
        monthly_due_dates.append({
            'date': start_date.strftime('%Y-%m-%d'),
            'step_name': step.step_name,
            'routine_type': step.routine.routine_type
        })
    monthly_due_dates_json = json.dumps(monthly_due_dates)

    # Convert to JSON for JavaScript calendar
    routine_events_json = json.dumps(routine_events)

    # === HANDLE FORM SUBMISSIONS (EXISTING FUNCTIONALITY) ===
    if request.method == 'POST':
        # Original completion tracking functionality
        try:
            # Get routine ID from form submission
            routine_id = int(request.POST.get('routine_id') or 0)
        except (TypeError, ValueError):
            # If conversion fails, set to 0 (invalid)
            routine_id = 0
        
        if routine_id:
            # Find the routine and make sure it belongs to current user
            routine = Routine.objects.filter(pk=routine_id, user=request.user).first()
            if routine:
                today = date.today()
                # Process each step in the routine
                for step in routine.steps.all():
                    # Check if this step was marked as completed in the form
                    checked = bool(request.POST.get(f'completed_{step.id}', False))
                    
                    # Update the step's completed status (for UI display)
                    if step.completed != checked:
                        step.completed = checked
                        step.save()
                    
                    # Create or update the daily completion record
                    daily_completion, created = DailyCompletion.objects.get_or_create(
                        user=request.user,
                        routine_step=step,
                        date=today,
                        defaults={'completed': checked}
                    )
                    # If record already existed, update it
                    if not created and daily_completion.completed != checked:
                        daily_completion.completed = checked
                        daily_completion.save()
        
        # Redirect to same page to prevent double-submission
        return redirect(request.path)

    # === PREPARE STEP COMPLETION DATA FOR TEMPLATE ===
    today_completed_step_ids = set(
        today_completions.filter(completed=True).values_list('routine_step_id', flat=True)
    )

    # === SKIN TYPE WIDGET DATA ===
    # Get user's skin type from their profile (if available)
    user_skin_type = None
    try:
        profile = UserProfile.objects.filter(user=request.user).first()
        user_skin_type = profile.skin_type if profile else None
    except Exception:
        user_skin_type = None
    
    # Get products that match user's skin type and are favorites
    skin_type_products = Product.objects.filter(
        user=request.user,
        skin_type=user_skin_type
    ).exclude(skin_type__isnull=True).exclude(skin_type='')[:5] if user_skin_type else []
    
    favorite_products = Product.objects.filter(
        user=request.user,
        is_favorite=True
    )[:5]

    # === PRODUCT EXPIRY DATA FOR CALENDAR ===
    # Get products expiring in the next 90 days
    from datetime import timedelta
    expiry_threshold = today + timedelta(days=90)
    expiring_products = Product.objects.filter(
        user=request.user,
        expiry_date__lte=expiry_threshold,
        expiry_date__gte=today
    ).order_by('expiry_date')

    # Create expiry events for calendar
    expiry_events = []
    for product in expiring_products:
        days_until_expiry = (product.expiry_date - today).days
        status = 'expired' if days_until_expiry < 0 else 'warning' if days_until_expiry <= 30 else 'info'
        
        expiry_events.append({
            'date': product.expiry_date.strftime('%Y-%m-%d'),
            'title': f'{product.name} expires',
            'type': 'expiry',
            'status': status,
            'product_name': product.name,
            'brand': product.brand,
            'days_until': days_until_expiry,
            'expiry_date': product.expiry_date.strftime('%Y-%m-%d'),
        })

    # === FAVORITE PRODUCT USAGE IN CALENDAR ===

    for event in routine_events:
        event_date = event.get('date')
        if event_date and event.get('status') in ['completed', 'morning', 'evening']:
            # Check if favorite products were used on this date
            # This is a simplified version - you could enhance to track actual usage
            event['favorite_used'] = favorite_products.exists()

    # === SEND DATA TO TEMPLATE ===
    # Pass all calculated data to the HTML template
    return render(request, 'routines/dashboard.html', {
        'morning_routine': morning_routine,
        'evening_routine': evening_routine,
        'weekly_routine': weekly_routine,
        'monthly_routine': monthly_routine,
        'hair_routine': hair_routine,
        'body_routine': body_routine,
        'special_routine': special_routine,
        'seasonal_routine': seasonal_routine,
        'routine_events_json': routine_events_json,
        'weekly_due_dates_json': weekly_due_dates_json,
        'monthly_due_dates_json': monthly_due_dates_json,
        'today_progress': today_progress,
        'completed_steps_today': completed_steps_today,
        'total_steps_today': total_steps_today,
        'current_streak': current_streak,
        'milestone_message': milestone_message,
        'milestone_emoji': milestone_emoji,
        'week_progress': week_progress,
        'today_completed_step_ids': today_completed_step_ids,
        'user_skin_type': user_skin_type,
        'skin_type_products': skin_type_products,
        'favorite_products': favorite_products,
        'expiring_products': expiring_products,
        'expiry_events_json': json.dumps(expiry_events),
    })


@login_required
def add_routine(request):
    """Accept POSTs from profile inline form; validate and create routine or render profile with errors."""
    if request.method == 'POST':
        form = RoutineCreateForm(request.POST, user=request.user)
        if form.is_valid():
            data = form.cleaned_data
            routine = Routine.objects.create(
                user=request.user,
                name=data['routine_name'],
                routine_type=data['routine_type']
            )
            order = 1
            # Infer step frequency from routine type for calendar reminders
            if data['routine_type'] in ('weekly', 'monthly'):
                inferred_freq = data['routine_type']
            else:
                inferred_freq = 'daily'

            for i in range(1, 6):
                step_text = data.get(f'step{i}')
                product = data.get(f'product{i}')
                if step_text:
                    RoutineStep.objects.create(
                        routine=routine, 
                        step_name=step_text, 
                        order=order,
                        product=product,
                        frequency=inferred_freq
                    )
                    order += 1
            # store created routine id in session so profile view can show richer inline success
            request.session['last_added_routine_id'] = routine.id

            # If this is an AJAX request, return JSON so client can update UI without full reload
            if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'id': routine.id,
                    'name': routine.name,
                    # point to the dashboard where checklists are now managed
                    'detail_url': reverse('routines:dashboard')
                })

            return redirect(reverse('users:profile'))
        else:
            # For non-AJAX requests, store a minimal errors/data snapshot in session and redirect
            errors = {k: list(v) for k, v in form.errors.items()}
            non_field = list(form.non_field_errors())
            request.session['add_routine_errors'] = errors
            request.session['add_routine_non_field_errors'] = non_field
            # store posted data to re-populate the form
            request.session['add_routine_data'] = {k: v for k, v in request.POST.items()}

            if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': errors, 'non_field_errors': non_field}, status=400)

            return redirect(reverse('users:profile'))

    # For GET, redirect to profile (form lives there)
    return redirect(reverse('users:profile'))


@login_required
def my_routines(request):
    """Show all of a user's routines (renders dashboard summary)."""
    morning_routines = Routine.objects.filter(user=request.user, routine_type='morning')
    evening_routines = Routine.objects.filter(user=request.user, routine_type='evening')
    morning_routine = morning_routines.first()
    evening_routine = evening_routines.first()
    return render(request, 'routines/dashboard.html', {
        'morning_routine': morning_routine,
        'evening_routine': evening_routine,
    })


@login_required
def edit_routine(request, pk):
    """
    Edit an existing routine.
    
    This view allows users to modify their existing routines.
    It reuses the add_routine template but populates it with existing data.
    """
    # Get the routine to edit (make sure it belongs to current user)
    routine = get_object_or_404(Routine, pk=pk, user=request.user)
    
    if request.method == 'POST':
        # Handle form submission to update the routine
        form = RoutineCreateForm(request.POST, user=request.user)
        if form.is_valid():
            data = form.cleaned_data
            
            # Update the routine
            routine.name = data['routine_name']
            routine.routine_type = data['routine_type']
            routine.save()
            
            # Delete existing steps and create new ones
            routine.steps.all().delete()
            
            order = 1
            # Infer step frequency from routine type for calendar reminders
            if data['routine_type'] in ('weekly', 'monthly'):
                inferred_freq = data['routine_type']
            else:
                inferred_freq = 'daily'

            for i in range(1, 6):
                step_text = data.get(f'step{i}')
                product = data.get(f'product{i}')
                if step_text:
                    RoutineStep.objects.create(
                        routine=routine, 
                        step_name=step_text, 
                        order=order,
                        product=product,
                        frequency=inferred_freq
                    )
                    order += 1
            
            # Redirect back to dashboard
            return redirect('routines:dashboard')
        else:
            # If form has errors, render the template with errors
            context = {
                'form': form,
                'routine': routine,
                'is_editing': True,
                'page_title': f'Edit {routine.name}'
            }
            return render(request, 'routines/add_routine.html', context)
    
    else:
        # GET request - populate form with existing data
        existing_steps = list(routine.steps.all()[:5])  # Get up to 5 steps
        
        # Prepare initial data for the form
        initial_data = {
            'routine_name': routine.name,
            'routine_type': routine.routine_type,
        }
        
        # Add existing steps to initial data
        for i, step in enumerate(existing_steps, 1):
            initial_data[f'step{i}'] = step.step_name
            if step.product:
                initial_data[f'product{i}'] = step.product.id
        
        # Create form with initial data
        form = RoutineCreateForm(initial=initial_data, user=request.user)
        
        context = {
            'form': form,
            'routine': routine,
            'is_editing': True,
            'page_title': f'Edit {routine.name}'
        }
        return render(request, 'routines/add_routine.html', context)


@login_required
@require_http_methods(["POST"])
def mark_routine_complete(request):
    """
    AJAX endpoint to mark all steps in a routine as complete for today.
    
    This function:
    1. Receives routine_id from the frontend
    2. Finds all steps in that routine
    3. Marks each step as completed for today's date
    4. Returns success/error message to frontend
    """
    try:
        # Parse the JSON data sent from frontend
        data = json.loads(request.body)
        routine_id = data.get('routine_id')
        routine_type = data.get('routine_type')  # 'morning' or 'evening'
        
        # Basic validation
        if not routine_id:
            return JsonResponse({'success': False, 'error': 'Routine ID is required'})
        
        # Get the routine (make sure it belongs to current user)
        routine = get_object_or_404(Routine, id=routine_id, user=request.user)
        today = date.today()
        
        # Mark all steps in this routine as complete for today
        completed_count = 0
        for step in routine.steps.all():
            # Create or update completion record for this step
            completion, created = DailyCompletion.objects.get_or_create(
                user=request.user,
                routine_step=step,
                date=today,
                defaults={
                    'completed': True, 
                    'completed_at': timezone.now()
                }
            )
            
            # If record already existed but wasn't completed, mark it complete
            if not created and not completion.completed:
                completion.completed = True
                completion.completed_at = timezone.now()
                completion.save()
            
            completed_count += 1
        
        # Return success response
        return JsonResponse({
            'success': True, 
            'message': f'Marked {completed_count} steps complete for {routine_type} routine'
        })
        
    except json.JSONDecodeError:
        # Handle invalid JSON data
        return JsonResponse({'success': False, 'error': 'Invalid data format'})
    except Exception as e:
        # Handle any other errors
        return JsonResponse({'success': False, 'error': f'Error: {str(e)}'})


@login_required
@require_http_methods(["POST"])
def toggle_step_completion(request):
    """
    AJAX endpoint to toggle completion status of individual routine steps.
    
    This allows users to check/uncheck individual steps in their routine cards
    on the dashboard for more granular progress tracking.
    """
    try:
        # Parse the JSON data from request body
        data = json.loads(request.body)
        step_id = data.get('step_id')
        
        if not step_id:
            return JsonResponse({'success': False, 'error': 'Step ID is required'})
        
        # Get the routine step and verify it belongs to current user
        try:
            step = RoutineStep.objects.get(id=step_id, routine__user=request.user)
        except RoutineStep.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Step not found or access denied'})
        
        # Get today's date
        today = date.today()
        
        # Get or create completion record for this step and date
        completion, created = DailyCompletion.objects.get_or_create(
            user=request.user,
            routine_step=step,
            date=today,
            defaults={'completed': False}
        )
        
        # Toggle the completion status
        completion.completed = not completion.completed
        completion.completed_at = timezone.now() if completion.completed else None
        completion.save()
        
        # Return success response with new status
        return JsonResponse({
            'success': True, 
            'completed': completion.completed,
            'step_name': step.step_name,
            'message': f'{"Completed" if completion.completed else "Unchecked"}: {step.step_name}'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON data'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': f'Error: {str(e)}'})


@login_required
def get_routine_data(request, pk):
    """Get routine data for modal editing"""
    try:
        routine = get_object_or_404(Routine, pk=pk, user=request.user)
        steps_data = []
        
        for step in routine.steps.all().order_by('order'):
            steps_data.append({
                'step_name': step.step_name,
                'product_id': step.product.id if step.product else None,
                'order': step.order
            })
        
        return JsonResponse({
            'success': True,
            'routine_name': routine.name,
            'routine_type': routine.routine_type,
            'steps': steps_data
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})




@login_required
def delete_routine(request, pk):
    """
    Delete a routine and all its associated steps.
    """
    if request.method == 'POST':
        try:
            routine = get_object_or_404(Routine, pk=pk, user=request.user)
            routine_name = routine.name
            routine.delete()
            
            if request.headers.get('Content-Type') == 'application/json':
                return JsonResponse({'success': True, 'message': f'Routine "{routine_name}" deleted successfully'})
            else:
                messages.success(request, f'Routine "{routine_name}" deleted successfully')
                return redirect('users:profile')
                
        except Exception as e:
            if request.headers.get('Content-Type') == 'application/json':
                return JsonResponse({'success': False, 'error': str(e)})
            else:
                messages.error(request, 'Error deleting routine. Please try again.')
                return redirect('users:profile')
    else:
        # GET request - redirect to profile
        return redirect('users:profile')

