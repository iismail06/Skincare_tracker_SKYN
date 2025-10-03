from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Product
from .forms import ProductForm
from .serializers import ProductSerializer, ProductCreateSerializer

# Create your views here.

@login_required
def product_list(request):
    """Show all products for the current user"""
    products = Product.objects.filter(user=request.user)
    return render(request, 'products/product_list.html', {'products': products})

@login_required
def product_create(request):
    """Add a new product"""
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            product = form.save(commit=False)
            product.user = request.user
            product.save()
            messages.success(request, f'Product "{product.name}" added successfully!')
            return redirect('products:list')
    else:
        form = ProductForm()
    
    return render(request, 'products/product_form.html', {
        'form': form,
        'title': 'Add New Product'
    })

@login_required
def product_edit(request, pk):
    """Edit an existing product"""
    product = get_object_or_404(Product, pk=pk, user=request.user)
    
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES, instance=product)
        if form.is_valid():
            form.save()
            messages.success(request, f'Product "{product.name}" updated successfully!')
            return redirect('products:list')
    else:
        form = ProductForm(instance=product)
    
    return render(request, 'products/product_form.html', {
        'form': form,
        'title': f'Edit {product.name}',
        'product': product
    })

@login_required
def product_delete(request, pk):
    """Delete a product"""
    product = get_object_or_404(Product, pk=pk, user=request.user)
    
    if request.method == 'POST':
        product_name = product.name
        product.delete()
        messages.success(request, f'Product "{product_name}" deleted successfully!')
        return redirect('products:list')
    
    return render(request, 'products/product_delete.html', {'product': product})


# API Views for REST endpoints

class ProductListCreateAPIView(generics.ListCreateAPIView):
    """API endpoint for listing and creating products"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only return products for the authenticated user
        return Product.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateSerializer
        return ProductSerializer
    
    def perform_create(self, serializer):
        # Automatically set the user when creating a product
        serializer.save(user=self.request.user)


class ProductRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """API endpoint for retrieving, updating, and deleting a specific product"""
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only return products for the authenticated user
        return Product.objects.filter(user=self.request.user)


class ProductBrowseByCategoryAPIView(generics.ListAPIView):
    """API endpoint for browsing products by category (for suggestions)"""
    serializer_class = ProductSerializer
    permission_classes = []  # No authentication required for browsing
    
    def get_queryset(self):
        category = self.kwargs.get('category', 'moisturizer')
        
        # Return products from this category, regardless of user
        # This gives suggestions from all imported products
        return Product.objects.filter(
            product_type=category
        ).distinct('name', 'brand')[:10]  # Limit to 10 unique suggestions
