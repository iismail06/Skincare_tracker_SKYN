from django.urls import path
from . import views

app_name = 'products'

urlpatterns = [
    path('', views.product_list, name='list'),
    path('add/', views.product_create, name='create'),
    path('edit/<int:pk>/', views.product_edit, name='edit'),
    path('delete/<int:pk>/', views.product_delete, name='delete'),
]