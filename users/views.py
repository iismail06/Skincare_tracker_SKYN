from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth import login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from .forms import CustomUserCreationForm
from .models import UserProfile
from django.contrib.auth.decorators import login_required
from routines.forms import RoutineCreateForm
from routines.models import Routine, RoutineStep, DailyCompletion
from django.urls import reverse

def home(request):
    """Home page view with proper template"""
    return render(request, 'home.html')

def signup(request):
    """Handle user registration with custom form"""
    # If a logged-in user visits signup, redirect them home
    if request.user.is_authenticated:
        return redirect('home')

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

@login_required
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
    """Simplified profile page: show user info and allow saving personal notes."""
    # Get existing profile if present
    profile = UserProfile.objects.filter(user=request.user).first()

    # Handle notes save only
    if request.method == 'POST' and request.POST.get('action') == 'save_notes':
        notes = request.POST.get('additional_notes', '').strip()
        # Ensure a profile exists before saving notes
        profile, _created = UserProfile.objects.get_or_create(user=request.user)
        profile.additional_notes = notes
        profile.save()
        messages.success(request, 'Your notes have been saved.')
        return redirect('users:profile')

    # Optional: provide light routine counts (no heavy logic)
    routines = request.user.routine_set.all()
    routine_counts = {
        'total': routines.count(),
        'morning': routines.filter(routine_type='morning').count(),
        'evening': routines.filter(routine_type='evening').count(),
        'weekly': routines.filter(routine_type='weekly').count(),
        'monthly': routines.filter(routine_type='monthly').count(),
        'hair': routines.filter(routine_type='hair').count(),
        'body': routines.filter(routine_type='body').count(),
        'special': routines.filter(routine_type='special').count(),
        'seasonal': routines.filter(routine_type='seasonal').count(),
    }

    # Lightweight widgets for profile (duplicated from dashboard at a small scale)
    # 1) Streak calculation (based on morning/evening routines)
    from datetime import date, timedelta
    today = date.today()
    morning_routine = routines.filter(routine_type='morning').first()
    evening_routine = routines.filter(routine_type='evening').first()
    current_streak = 0
    check_date = today
    while True:
        day_completions = DailyCompletion.objects.filter(user=request.user, date=check_date)
        daily_total = 0
        daily_completed = 0
        if morning_routine:
            daily_total += morning_routine.steps.count()
            daily_completed += day_completions.filter(routine_step__routine=morning_routine, completed=True).count()
        if evening_routine:
            daily_total += evening_routine.steps.count()
            daily_completed += day_completions.filter(routine_step__routine=evening_routine, completed=True).count()
        if daily_total > 0 and daily_completed == daily_total:
            current_streak += 1
            check_date -= timedelta(days=1)
        else:
            break

    # 2) Profile widgets (no duplication with dashboard)
    from products.models import Product
    # Top Rated: rating >= 4, sort by rating then recent updates
    top_rated = Product.objects.filter(user=request.user, rating__gte=4).order_by('-rating', '-updated_at')[:3]
    # Recently Added: newest first
    recent_products = Product.objects.filter(user=request.user).order_by('-created_at')[:3]
    # In Your Routines: distinct products referenced by any routine step
    product_ids = (
        RoutineStep.objects
        .filter(routine__user=request.user, product__isnull=False)
        .values_list('product_id', flat=True)
        .distinct()[:3]
    )
    in_routines = Product.objects.filter(id__in=list(product_ids))
    # Unrated to rate: products without a rating
    unrated_to_rate = Product.objects.filter(user=request.user, rating__isnull=True)[:3]

    return render(request, 'users/profile.html', {
        'user': request.user,
        'profile': profile,
        'routine_counts': routine_counts,
        'current_streak': current_streak,
        'top_rated': top_rated,
        'recent_products': recent_products,
        'in_routines': in_routines,
        'unrated_to_rate': unrated_to_rate,
    })


@login_required
def profile_edit(request):
    # Ensure we fetch the existing UserProfile by user to avoid creating duplicates
    profile = UserProfile.objects.filter(user=request.user).first()
    from .forms import ProfileDetailsForm, UserUpdateForm

    if request.method == 'POST':
        user_form = UserUpdateForm(request.POST, instance=request.user)
        profile_form = ProfileDetailsForm(request.POST, instance=profile)
        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            prof = profile_form.save(commit=False)
            prof.user = request.user
            prof.save()
            messages.success(request, 'Profile updated successfully.')
            return redirect('users:profile')
    else:
        user_form = UserUpdateForm(instance=request.user)
        profile_form = ProfileDetailsForm(instance=profile)

    return render(request, 'users/profile_edit.html', {
        'user_form': user_form,
        'profile_form': profile_form,
    })