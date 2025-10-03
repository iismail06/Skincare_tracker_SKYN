from django import forms
from .models import Product

class ProductForm(forms.ModelForm):
    """Simple form for adding and editing products"""
    
    class Meta:
        model = Product
        fields = ['name', 'brand', 'product_type', 'notes']
        
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter product name'
            }),
            'brand': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter brand name'
            }),
            'product_type': forms.Select(attrs={
                'class': 'form-control'
            }),
            'notes': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Add any notes about this product (optional)'
            }),
        }