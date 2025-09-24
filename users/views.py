from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth import login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from .forms import CustomUserCreationForm

def home(request):
    """Home page view with proper template"""
    return render(request, 'home.html')

def signup(request):
    """Handle user registration with custom form"""
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f'Welcome to SkinTrack, {user.username}!')
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