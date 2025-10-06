"""API URL routing for the products app.

This file exists to provide a distinct URL module for API endpoints so
we don't include `products.urls` twice (which causes Django's
namespace warning). Add API-specific view routes here (or wire a DRF
router) instead of reusing the app's HTML view urlpatterns.
"""
from django.urls import path, include

# Example placeholder - import and register DRF routers here if needed
urlpatterns = [
    # path('', include('products.api_views')),
]
