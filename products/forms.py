from django import forms
from .models import Product

class ProductForm(forms.ModelForm):
    """Enhanced form for adding and editing products with all fields"""
    
    class Meta:
        model = Product
        fields = ['name', 'brand', 'product_type', 'rating', 'expiry_date', 'is_favorite', 'skin_type', 'ingredients', 'notes']
        
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
            'rating': forms.Select(attrs={
                'class': 'form-control'
            }),
            'expiry_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'is_favorite': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'skin_type': forms.Select(attrs={
                'class': 'form-control'
            }),
            'ingredients': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'List key ingredients (optional)'
            }),
            'notes': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'Add any notes about this product (optional)'
            }),
        }