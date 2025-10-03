from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth import login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from .forms import CustomUserCreationForm
from .models import UserProfile
from django.contrib.auth.decorators import login_required
from routines.forms import RoutineCreateForm
from routines.models import Routine, RoutineStep
from django.urls import reverse

def home(request):
    """Home page view with proper template"""
    return render(request, 'home.html')

def signup(request):
    """Handle user registration with custom form"""
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            
            # Create or update user profile with age range
            age_range = form.cleaned_data.get('age_range')
            if age_range:
                UserProfile.objects.create(user=user, age_range=age_range)
            else:
                UserProfile.objects.create(user=user)
            
            login(request, user)
            messages.success(request, f'Welcome to SKYN, {user.username}!')
            return redirect('users:profile_questionnaire')
    else:
        form = CustomUserCreationForm()
    return render(request, 'signup.html', {'form': form})

def profile_questionnaire(request):
    """Handle profile questionnaire"""
    if request.method == 'POST':
        # Get or create user profile
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        # Create form with existing profile data and POST data
        from .forms import ProfileQuestionnaireForm
        form = ProfileQuestionnaireForm(request.POST, instance=profile)
        
        if form.is_valid():
            profile = form.save(commit=False)
            profile.user = request.user
            profile.save()
            messages.success(request, 'Profile completed! You can update it anytime.')
            return redirect('home')
        else:
            # If form is invalid, render with errors
            return render(request, 'profile_questionnaire.html', {'form': form})
    else:
        # GET request - show empty form or pre-filled if profile exists
        profile = UserProfile.objects.filter(user=request.user).first()
        from .forms import ProfileQuestionnaireForm
        form = ProfileQuestionnaireForm(instance=profile)
    
    return render(request, 'profile_questionnaire.html', {'form': form})

def simple_logout(request):
    """Handle user logout"""
    logout(request)
    messages.success(request, 'You have been logged out successfully.')
    return redirect('home')

@login_required
def profile_view(request):
    profile = getattr(request.user, 'profile', None)
    routines = request.user.routine_set.all()
    # Handle inline add-routine form submission here for a cleaner flow.
    added_ok = False
    form = RoutineCreateForm(user=request.user)  # Initialize form with user
    last_added_routine = None

    # If redirected from routines.add_routine, it can set a session id for the last added routine
    last_added_id = request.session.pop('last_added_routine_id', None)
    if last_added_id:
        last_added_routine = Routine.objects.filter(pk=last_added_id, user=request.user).first()
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
            for i in range(1, 6):
                step_text = data.get(f'step{i}')
                if step_text:
                    RoutineStep.objects.create(routine=routine, step_name=step_text, order=order)
                    order += 1
            messages.success(request, 'Routine added successfully.')
            added_ok = True
            # expose the created routine so the template can show its name/link inline
            last_added_routine = routine
            # refresh routines queryset
            routines = request.user.routine_set.all()
        else:
            # form with errors will be passed to template
            pass

    # If redirected back from routines.add_routine with errors/data in session, reconstruct a form
    add_errors = request.session.pop('add_routine_errors', None)
    add_non_field = request.session.pop('add_routine_non_field_errors', None)
    add_data = request.session.pop('add_routine_data', None)
    if add_data is not None:
        # create a bound form so template can show errors and previous values
        form = RoutineCreateForm(add_data, user=request.user)
        if add_errors:
            # manually set form._errors from session data
            from django.forms.utils import ErrorDict, ErrorList
            ed = ErrorDict()
            for k, v in (add_errors or {}).items():
                ed[k] = ErrorList(v)
            form._errors = ed
        if add_non_field:
            # non-field errors
            form._non_form_errors = ErrorList(add_non_field)

    return render(request, 'users/profile.html', {
        'user': request.user,
        'profile': profile,
        'routines': routines,
        'added_ok': added_ok,
        'added_routine_form': form,
        'last_added_routine': last_added_routine,
    })


@login_required
def profile_edit(request):
    # Ensure we fetch the existing UserProfile by user to avoid creating duplicates
    profile = UserProfile.objects.filter(user=request.user).first()
    from .forms import ProfileQuestionnaireForm

    if request.method == 'POST':
        form = ProfileQuestionnaireForm(request.POST, instance=profile)
        if form.is_valid():
            prof = form.save(commit=False)
            prof.user = request.user
            prof.save()
            messages.success(request, 'Profile updated successfully.')
            return redirect('users:profile')
    else:
        form = ProfileQuestionnaireForm(instance=profile)

    return render(request, 'users/profile_edit.html', {'form': form})