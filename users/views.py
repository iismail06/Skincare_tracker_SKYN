from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth import login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages

def home(request):
    """Simple home page view"""
    if request.user.is_authenticated:
        return HttpResponse(f"<h1>Welcome back, {request.user.username}!</h1><p>Your SkinTrack dashboard is coming soon...</p><p><a href='/admin/'>Go to Admin</a> | <a href='/profile/logout/'>Logout</a></p>")
    else:
        return HttpResponse("<h1>Welcome to SkinTrack!</h1><p>Your skincare tracking app is working!</p><p><a href='/accounts/login/'>Login</a> | <a href='/signup/'>Sign Up</a> | <a href='/admin/'>Admin</a></p>")

def signup(request):
    """Handle user registration"""
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f'Welcome to SkinTrack, {user.username}!')
            return redirect('home')
    else:
        form = UserCreationForm()
    return render(request, 'signup.html', {'form': form})

def simple_logout(request):
    """Handle user logout"""
    logout(request)
    messages.success(request, 'You have been logged out successfully.')
    return redirect('home')