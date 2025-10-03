"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path, include
from users import views as user_views

urlpatterns = [
    path('admin/', admin.site.urls),                           # Admin panel
    path('', user_views.home, name='home'),                    # Homepage
    path('accounts/', include('django.contrib.auth.urls')),    # Login, logout, etc.
    path('signup/', user_views.signup, name='signup'),         # Custom signup
    path('profile/', include('users.urls')),                   # Profile pages
    path('routines/', include('routines.urls')),               # Routine functionality
    path('products/', include('products.urls')),               # Product management
    path('api/products/', include('products.urls')),           # API endpoints
]