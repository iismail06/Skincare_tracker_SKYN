from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth import login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from .forms import CustomUserCreationForm
from .models import UserProfile
from django.contrib.auth.decorators import login_required

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
        # For now, just redirect to home after submission
        # Later we can save this data to a UserProfile model
        skin_type = request.POST.get('skin_type')
        skin_concerns = request.POST.getlist('skin_concerns')
        current_routine = request.POST.get('current_routine')
        goals = request.POST.get('goals')
        
        messages.success(request, 'Profile completed! You can update it anytime.')
        return redirect('home')
    
    return render(request, 'profile_questionnaire.html')

def simple_logout(request):
    """Handle user logout"""
    logout(request)
    messages.success(request, 'You have been logged out successfully.')
    return redirect('home')

@login_required
def profile_view(request):
    profile = getattr(request.user, 'profile', None)
    return render(request, 'users/profile.html', {'user': request.user, 'profile': profile})