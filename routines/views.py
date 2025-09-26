
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib import messages
from django.http import JsonResponse
from django.utils import timezone
from .forms import RoutineCreateForm
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Routine, RoutineStep


@login_required
def dashboard(request):
    """Show user's routines"""
    morning_routines = Routine.objects.filter(user=request.user, routine_type='morning')
    evening_routines = Routine.objects.filter(user=request.user, routine_type='evening')

    morning_routine = morning_routines.first()
    evening_routine = evening_routines.first()

    return render(request, 'routines/dashboard.html', {
        'morning_routine': morning_routine,
        'evening_routine': evening_routine,
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
                    'detail_url': reverse('routines:detail', args=[routine.id])
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
    return render(request, 'routines/detail.html', {
        'routine': routine,
        'steps': steps,
    })


