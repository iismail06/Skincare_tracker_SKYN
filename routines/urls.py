from django.urls import path
from . import views

app_name = 'routines'

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('add/', views.add_routine, name='add'),
    path('edit/<int:pk>/', views.edit_routine, name='edit'),
    path('mark-complete/', views.mark_routine_complete, name='mark_complete'),
    path('checklist/', views.routine_checklist_view, name='checklist'),
    path('my/', views.my_routines, name='my_routines'),
    path('<int:pk>/', views.detail, name='detail'),
]