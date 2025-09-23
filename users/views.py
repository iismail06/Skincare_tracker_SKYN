from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth import login, logout
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import redirect
from .models import UserProfile


# Create your views here.

def home(request):
    """Simple home page view"""
    return HttpResponse("<h1>Welcome to SKYN Tracker!</h1><p>Your skincare tracking app is working!</p><p><a href='/admin/'>Go to Admin</a></p>")

def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()           # Create new user
            login(request, user)         # Automatically log them in
            return redirect('home')      # Send them to dashboard
    else:
        form = UserCreationForm()       # Show empty form
    return render(request, 'signup.html', {'form': form})


def simple_logout(request):
    logout(request)          # Clear user session
    return redirect('home')  # Send back to homepage

    if not request.user.is_authenticated:
     return redirect('login')  # Send to login if not logged in