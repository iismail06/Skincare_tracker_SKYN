from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

app_name = 'users'

urlpatterns = [
    path('logout/', views.simple_logout, name='logout'),
    path('profile-questionnaire/', views.profile_questionnaire, name='profile_questionnaire'),
    path('profile/', views.profile_view, name='profile'),
]