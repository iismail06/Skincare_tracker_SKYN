from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse

# Create your models here.

class Product(models.Model):
    """A skincare product that users can add to their collection"""
    
    PRODUCT_TYPE_CHOICES = [
        ('cleanser', 'Cleanser'),
        ('toner', 'Toner'),
        ('serum', 'Serum'),
        ('moisturizer', 'Moisturizer'),
        ('sunscreen', 'Sunscreen'),
        ('exfoliant', 'Exfoliant'),
        ('mask', 'Face Mask'),
        ('eye_cream', 'Eye Cream'),
        ('oil', 'Face Oil'),
        ('essence', 'Essence'),
        ('spot_treatment', 'Spot Treatment'),
        ('retinol', 'Retinol/Retinoid'),
        ('vitamin_c', 'Vitamin C'),
        ('other', 'Other'),
    ]
    
    # Core product information
    name = models.CharField(max_length=200, help_text="Product name")
    brand = models.CharField(max_length=100, help_text="Brand name")
    product_type = models.CharField(
        max_length=20, 
        choices=PRODUCT_TYPE_CHOICES,
        help_text="Type of skincare product"
    )
    
    # Optional details
    notes = models.TextField(
        blank=True, 
        null=True,
        help_text="Personal notes about this product (ingredients, effects, etc.)"
    )
    image = models.ImageField(
        upload_to='products/',
        blank=True,
        null=True,
        help_text="Product image (optional)"
    )
    
    # Relationships and metadata
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='products',
        help_text="User who owns this product"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['brand', 'name']
        unique_together = ['user', 'name', 'brand']  # Prevent duplicate products per user
    
    def __str__(self):
        return f"{self.brand} - {self.name}"
    
    def get_absolute_url(self):
        return reverse('products:detail', kwargs={'pk': self.pk})
    
    def get_product_type_display_badge(self):
        """Return product type in a format suitable for UI badges"""
        return self.get_product_type_display()
