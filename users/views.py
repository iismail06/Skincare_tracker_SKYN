from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

def home(request):
    """Simple home page view"""
    return HttpResponse("<h1>Welcome to SKYN Tracker!</h1><p>Your skincare tracking app is working!</p><p><a href='/admin/'>Go to Admin</a></p>")
