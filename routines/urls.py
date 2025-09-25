from django.urls import path
from . import views

app_name = 'routines'

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('add/', views.add_routine, name='add_routine'),
    path('edit/<int:routine_id>/', views.edit_routine, name='edit_routine'),
    path('delete/<int:routine_id>/', views.delete_routine, name='delete_routine'),
]