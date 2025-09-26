from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Routine, RoutineStep

# Create your views here.

@login_required
def dashboard(request):
    """Show user's routines"""
    # Get the user's routines using filter (returns empty list if none found)
    morning_routines = Routine.objects.filter(user=request.user, routine_type='morning')
    evening_routines = Routine.objects.filter(user=request.user, routine_type='evening')
    
    # Get first routine or None if no routines exist
    morning_routine = morning_routines.first()
    evening_routine = evening_routines.first()
    
    return render(request, 'routines/dashboard.html', {
        'morning_routine': morning_routine,
        'evening_routine': evening_routine,
    })


@login_required
def add_routine(request):
    """Add a new routine"""
    if request.method == 'POST':
        # Get form data
        routine_name = request.POST['routine_name']
        routine_type = request.POST['routine_type']
        
        # Create the routine
        routine = Routine.objects.create(
            user=request.user,
            name=routine_name,
            routine_type=routine_type
        )
        
        # Add steps
        step1 = request.POST.get('step1', '')
        step2 = request.POST.get('step2', '')
        step3 = request.POST.get('step3', '')
        step4 = request.POST.get('step4', '')
        step5 = request.POST.get('step5', '')
        
        steps = [step1, step2, step3, step4, step5]
        
        order = 1
        for step in steps:
            if step:  # If step is not empty
                RoutineStep.objects.create(
                    routine=routine,
                    step_name=step,
                    order=order
                )
                order += 1
        
        return redirect('routines:dashboard')
    
    return render(request, 'routines/add_routine.html')
@login_required
def routine_checklist_view(request):
    """Display a daily/weekly checklist with calendar toggle"""
    # Pick first routine as example
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

