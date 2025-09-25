from django.urls import path
from . import views

app_name = 'routines'

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('add/', views.add_routine, name='add_routine'),
]