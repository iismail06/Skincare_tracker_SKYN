from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('', views.profile, name='profile'),           # /profile/
    path('edit/', views.profile_edit, name='profile_edit'),  # /profile/edit/
    path('logout/', views.simple_logout, name='logout'),     # /profile/logout/
]