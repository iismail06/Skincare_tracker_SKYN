from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib import messages
from django.http import JsonResponse
from django.utils import timezone
from .forms import RoutineCreateForm
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Routine, RoutineStep, DailyCompletion
from datetime import date


@login_required
def dashboard(request):
    """Show user's routines"""

    import calendar
    from datetime import date, timedelta
    import json

    today = date.today()
    year = today.year
    month = today.month
    # Get first and last day of the month
    start_date = date(year, month, 1)
    last_day = calendar.monthrange(year, month)[1]
    end_date = date(year, month, last_day)

    morning_routines = Routine.objects.filter(user=request.user, routine_type='morning')
    evening_routines = Routine.objects.filter(user=request.user, routine_type='evening')
    morning_routine = morning_routines.first()
    evening_routine = evening_routines.first()

    # Query all completions for this user in this month
    completions = DailyCompletion.objects.filter(user=request.user, date__gte=start_date, date__lte=end_date)

    # Build a dict: {date: {'morning': bool, 'evening': bool}}
    completion_map = {}
    for comp in completions:
        dkey = comp.date.strftime('%Y-%m-%d')
        step_type = comp.routine_step.routine.routine_type if hasattr(comp.routine_step.routine, 'routine_type') else None
        if dkey not in completion_map:
            completion_map[dkey] = {'morning': False, 'evening': False}
        if step_type in ['morning', 'evening'] and comp.completed:
            completion_map[dkey][step_type] = True

    # Build events list for JS
    routine_events = []
    for day in range(1, last_day+1):
        d = date(year, month, day)
        dkey = d.strftime('%Y-%m-%d')
        status = 'not_done'
        if dkey in completion_map:
            m = completion_map[dkey]['morning']
            e = completion_map[dkey]['evening']
            if m and e:
                status = 'completed'
            elif m:
                status = 'morning'
            elif e:
                status = 'evening'
            else:
                status = 'not_done'
        routine_events.append({'date': dkey, 'status': status})

    routine_events_json = json.dumps(routine_events)

    # Handle checklist POSTs from dashboard (each form sends routine_id)
    if request.method == 'POST':
        try:
            rid = int(request.POST.get('routine_id') or 0)
        except (TypeError, ValueError):
            rid = 0
        if rid:
            routine = Routine.objects.filter(pk=rid, user=request.user).first()
            if routine:
                today = date.today()
                for step in routine.steps.all():
                    checked = bool(request.POST.get(f'completed_{step.id}', False))
                    # Update RoutineStep.completed for UI
                    if step.completed != checked:
                        step.completed = checked
                        step.save()
                    # Create or update DailyCompletion record
                    dc, created = DailyCompletion.objects.get_or_create(
                        user=request.user,
                        routine_step=step,
                        date=today,
                        defaults={'completed': checked}
                    )
                    if not created and dc.completed != checked:
                        dc.completed = checked
                        dc.save()
        return redirect(request.path)

    return render(request, 'routines/dashboard.html', {
        'morning_routine': morning_routine,
        'evening_routine': evening_routine,
        'routine_events_json': routine_events_json,
    })


@login_required
def add_routine(request):
    """Accept POSTs from profile inline form; validate and create routine or render profile with errors."""
    if request.method == 'POST':
        form = RoutineCreateForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            routine = Routine.objects.create(
                user=request.user,
                name=data['routine_name'],
                routine_type=data['routine_type']
            )
            order = 1
            for i in range(1, 6):
                step_text = data.get(f'step{i}')
                if step_text:
                    RoutineStep.objects.create(routine=routine, step_name=step_text, order=order)
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
def routine_checklist_view(request):
    """Display a daily/weekly checklist with calendar toggle"""
    routine = Routine.objects.filter(user=request.user).first()

    if not routine:
        routine = None

    show_calendar = request.GET.get('show', '1')  # toggle calendar

    if request.method == 'POST' and routine:
        for step in routine.steps.all():
            step.completed = bool(request.POST.get(f'completed_{step.id}', False))
            step.save()

    context = {
        'routine': routine,
        'user': request.user,
        'show_calendar': show_calendar == '1',
    }
    return render(request, 'routines/routine_checklist.html', context)


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
def detail(request, pk):
    """Show routine detail and steps"""
    routine = get_object_or_404(Routine, pk=pk, user=request.user)
    steps = routine.steps.all()
    # If the user submitted the checklist, update step completion flags
    if request.method == 'POST':
        for step in steps:
            checked = bool(request.POST.get(f'completed_{step.id}', False))
            if step.completed != checked:
                step.completed = checked
                step.save()
        # stay on the same page after saving
        return redirect(request.path)
    # detail page removed; redirect users to the dashboard where checklists are managed
    return redirect('routines:dashboard')


