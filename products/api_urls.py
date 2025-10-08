"""API URL routing for the products app.

This file exists to provide a distinct URL module for API endpoints so
we don't include `products.urls` twice (which causes Django's
namespace warning). Add API-specific view routes here (or wire a DRF
router) instead of reusing the app's HTML view urlpatterns.
"""
from django.urls import path, include
from . import views

# API endpoints for products
urlpatterns = [
    # List and create products
    path('', views.ProductListCreateAPIView.as_view(), name='product-list-create'),
    
    # Retrieve, update, delete specific product
    path('<int:pk>/', views.ProductRetrieveUpdateDestroyAPIView.as_view(), name='product-detail'),
    
    # Browse products by category (for suggestions)
    path('browse/<str:category>/', views.ProductBrowseByCategoryAPIView.as_view(), name='product-browse-category'),
]
