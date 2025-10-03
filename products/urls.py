from django.urls import path
from . import views

app_name = 'products'

urlpatterns = [
    # Web interface URLs
    path('', views.product_list, name='list'),
    path('add/', views.product_create, name='create'),
    path('edit/<int:pk>/', views.product_edit, name='edit'),
    path('delete/<int:pk>/', views.product_delete, name='delete'),
    
    # API URLs
    path('api/', views.ProductListCreateAPIView.as_view(), name='api_list_create'),
    path('api/<int:pk>/', views.ProductRetrieveUpdateDestroyAPIView.as_view(), name='api_detail'),
]