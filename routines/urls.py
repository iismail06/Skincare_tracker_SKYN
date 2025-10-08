from django.urls import path
from . import views

app_name = 'routines'

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('add/', views.add_routine, name='add'),
    path('edit/<int:pk>/', views.edit_routine, name='edit'),
    path('delete/<int:pk>/', views.delete_routine, name='delete'),
    path('get-routine-data/<int:pk>/', views.get_routine_data, name='get_routine_data'),
    path('mark-complete/', views.mark_routine_complete, name='mark_complete'),
    path('toggle-step/', views.toggle_step_completion, name='toggle_step'),
    path('my/', views.my_routines, name='my_routines'),
]