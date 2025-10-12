from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth import login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import CustomUserCreationForm
from .models import UserProfile
from routines.models import RoutineStep, DailyCompletion


def home(request):
    """Home page view with proper template."""
    return render(request, 'home.html')


def signup(request):
    """Handle user registration with custom form."""
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            age_range = form.cleaned_data.get('age_range')
            if age_range:
                UserProfile.objects.create(user=user, age_range=age_range)
            else:
                UserProfile.objects.create(user=user)

            login(request, user)
            messages.success(
                request,
                f'Welcome to SKYN, {user.username}!'
            )
            return redirect(
                'users:profile_questionnaire'
            )
    else:
        form = CustomUserCreationForm()

    return render(request, 'signup.html', {'form': form})


@login_required
def profile_questionnaire(request):
    """Handle profile questionnaire."""
    from .forms import ProfileQuestionnaireForm

    if request.method == 'POST':
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        form = ProfileQuestionnaireForm(request.POST, instance=profile)

        if form.is_valid():
            profile = form.save(commit=False)
            profile.user = request.user
            profile.save()
            messages.success(
                request,
                'Profile completed! You can update it anytime.'
            )
            return redirect('home')
        else:
            return render(
                request,
                'profile_questionnaire.html',
                {'form': form}
            )
    else:
        profile = UserProfile.objects.filter(user=request.user).first()
        form = ProfileQuestionnaireForm(instance=profile)

    return render(request, 'profile_questionnaire.html', {'form': form})


def simple_logout(request):
    """Handle user logout."""
    logout(request)
    messages.success(
        request,
        'You have been logged out successfully.'
    )
    return redirect('home')


@login_required
def profile_view(request):
    """Simplified profile page: show user info and allow saving notes."""
    profile = UserProfile.objects.filter(user=request.user).first()

    if request.method == 'POST' and request.POST.get('action') == 'save_notes':
        notes = request.POST.get('additional_notes', '').strip()
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.additional_notes = notes
        profile.save()
        messages.success(
            request,
            'Your notes have been saved.'
        )
        return redirect('users:profile')

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

    from datetime import date, timedelta
    today = date.today()
    morning_routine = routines.filter(routine_type='morning').first()
    evening_routine = routines.filter(routine_type='evening').first()

    current_streak = 0
    check_date = today
    while True:
        day_completions = DailyCompletion.objects.filter(
            user=request.user,
            date=check_date
        )
        daily_total = 0
        daily_completed = 0
        if morning_routine:
            daily_total += morning_routine.steps.count()
            daily_completed += day_completions.filter(
                routine_step__routine=morning_routine,
                completed=True
            ).count()
        if evening_routine:
            daily_total += evening_routine.steps.count()
            daily_completed += day_completions.filter(
                routine_step__routine=evening_routine,
                completed=True
            ).count()
        if daily_total > 0 and daily_completed == daily_total:
            current_streak += 1
            check_date -= timedelta(days=1)
        else:
            break

    from products.models import Product
    top_rated = Product.objects.filter(
        user=request.user,
        rating__gte=4
    ).order_by('-rating', '-updated_at')[:3]

    recent_products = Product.objects.filter(
        user=request.user
    ).
