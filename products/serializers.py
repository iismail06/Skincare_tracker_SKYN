from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model"""
    
    # Make user read-only since it will be set automatically
    user = serializers.StringRelatedField(read_only=True)
    
    # Add display name for product type
    product_type_display = serializers.CharField(source='get_product_type_display', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'brand', 
            'product_type',
            'product_type_display',
            'notes',
            'image',
            'ingredients',
            'description',
            'external_id',
            'rating',
            'expiry_date',
            'is_favorite',
            'skin_type',
            'user',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating products (without user field)"""
    
    class Meta:
        model = Product
        fields = [
            'name',
            'brand',
            'product_type', 
            'notes',
            'image',
            'ingredients',
            'description',
            'rating',
            'expiry_date',
            'is_favorite',
            'skin_type'
        ]