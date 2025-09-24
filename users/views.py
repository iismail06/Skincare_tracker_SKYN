from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from django.contrib.auth import login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from .forms import CustomUserCreationForm, ProfileQuestionnaireForm
from .models import UserProfile

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
            messages.success(request, f'Welcome to SkinTrack, {user.username}!')
            return redirect('users:profile_questionnaire')
    else:
        form = CustomUserCreationForm()
    return render(request, 'signup.html', {'form': form})

def profile_questionnaire(request):
    """Handle profile questionnaire with proper form and database saving"""
    # Get or create user profile
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    if request.method == 'POST':
        form = ProfileQuestionnaireForm(request.POST, instance=profile)
        if form.is_valid():
            # Save the form data to the database
            form.save()
            messages.success(request, 'Profile completed! You can update it anytime.')
            return redirect('home')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        # Show form with existing data (if any)
        form = ProfileQuestionnaireForm(instance=profile)
    
    return render(request, 'profile_questionnaire.html', {'form': form})

def simple_logout(request):
    """Handle user logout"""
    logout(request)
    messages.success(request, 'You have been logged out successfully.')
    return redirect('home')