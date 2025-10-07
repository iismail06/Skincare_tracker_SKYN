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
            try:
                product = form.save(commit=False)
                product.user = request.user
                product.save()
                messages.success(request, f'Product "{product.name}" added successfully!')
                return redirect('products:list')
            except Exception as e:
                messages.error(request, "Sorry, we couldn't save your product. Please try again.")
                # Form will be re-displayed with the user's data still filled in
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
        # Only return products for the authenticated user. Listing is handled
        # in `list()` so that we can return serialized default suggestion
        # objects when the user has no products without breaking DRF internals.
        return Product.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateSerializer
        return ProductSerializer
    
    def perform_create(self, serializer):
        # Automatically set the user when creating a product
        serializer.save(user=self.request.user)

    def list(self, request, *args, **kwargs):
        """Return the user's products or default suggestions when empty."""
        qs = self.get_queryset()
        if qs.exists():
            return super().list(request, *args, **kwargs)

        # No user products — supply serialized default suggestions
        category = request.GET.get('category', 'moisturizer')
        suggestions = ProductBrowseByCategoryAPIView().create_default_suggestions(category)
        serializer = ProductSerializer(suggestions, many=True, context={'request': request})
        return Response(serializer.data)


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
        
        # Get products from database first
        db_products = Product.objects.filter(
            product_type=category
        ).distinct('name', 'brand')[:10]
        
        # If we have enough products, return them
        if len(db_products) >= 4:
            return db_products
        
        # Otherwise, create default suggestions
        return self.create_default_suggestions(category)
    
    def create_default_suggestions(self, category):
        """Create default product suggestions when database is empty"""
        
        # Popular products by category
        default_products = {
            'cleanser': [
                {'name': 'Hydrating Foaming Oil Cleanser', 'brand': 'CeraVe', 'ingredients': 'Hyaluronic Acid, Ceramides, Niacinamide'},
                {'name': 'Gentle Skin Cleanser', 'brand': 'Cetaphil', 'ingredients': 'Sodium Cocoyl Glycinate, Glycerin'},
                {'name': 'Ultra Gentle Daily Cleanser', 'brand': 'Neutrogena', 'ingredients': 'Glycerin, Polyglyceryl-4 Caprate'},
                {'name': 'Squalane Cleanser', 'brand': 'The Ordinary', 'ingredients': 'Squalane, Aqua, Coco-Caprylate'},
                {'name': 'Oil Cleanser', 'brand': 'DHC', 'ingredients': 'Olea Europaea, Phenoxyethanol'},
            ],
            'moisturizer': [
                {'name': 'Daily Facial Moisturizing Lotion', 'brand': 'CeraVe', 'ingredients': 'Hyaluronic Acid, Ceramides, MVE Technology'},
                {'name': 'Hydro Boost Water Gel', 'brand': 'Neutrogena', 'ingredients': 'Hyaluronic Acid, Dimethicone, Glycerin'},
                {'name': 'Daily Facial Moisturizer', 'brand': 'Cetaphil', 'ingredients': 'Macadamia Oil, Dimethicone, Glycerin'},
                {'name': 'Natural Moisturizing Factors + HA', 'brand': 'The Ordinary', 'ingredients': 'Sodium Hyaluronate, Arginine, PCA'},
                {'name': 'Dramatically Different Moisturizing Lotion', 'brand': 'Clinique', 'ingredients': 'Water, Mineral Oil, Glycerin'},
            ],
            'sunscreen': [
                {'name': 'AM Facial Moisturizing Lotion SPF 30', 'brand': 'CeraVe', 'ingredients': 'Zinc Oxide, Niacinamide, Hyaluronic Acid'},
                {'name': 'Ultra Sheer Dry-Touch SPF 45', 'brand': 'Neutrogena', 'ingredients': 'Avobenzone, Homosalate, Octisalate'},
                {'name': 'UV Clear Broad-Spectrum SPF 46', 'brand': 'EltaMD', 'ingredients': 'Zinc Oxide, Octinoxate, Niacinamide'},
                {'name': 'Invisible Zinc Oxide SPF 50', 'brand': 'Blue Lizard', 'ingredients': 'Zinc Oxide, Titanium Dioxide'},
                {'name': 'Anthelios Melt-in Milk SPF 60', 'brand': 'La Roche-Posay', 'ingredients': 'Avobenzone, Homosalate, Octisalate'},
            ],
            'serum': [
                {'name': 'Vitamin C + E Ferulic Acid Serum', 'brand': 'Skinceuticals', 'ingredients': 'L-Ascorbic Acid, Vitamin E, Ferulic Acid'},
                {'name': 'Niacinamide 10% + Zinc 1%', 'brand': 'The Ordinary', 'ingredients': 'Niacinamide, Zinc PCA, Dimethyl Isosorbide'},
                {'name': 'Hyaluronic Acid 2% + B5', 'brand': 'The Ordinary', 'ingredients': 'Sodium Hyaluronate, Panthenol'},
                {'name': 'Vitamin C Brightening Serum', 'brand': 'Mad Hippie', 'ingredients': 'Sodium Ascorbyl Phosphate, Hyaluronic Acid'},
                {'name': 'B3 Multi-Renewal Serum', 'brand': 'No7', 'ingredients': 'Niacinamide, Panthenol, Hyaluronic Acid'},
            ],
            'toner': [
                {'name': 'Alcohol-Free Toner', 'brand': 'Thayers', 'ingredients': 'Witch Hazel, Aloe Vera, Grapefruit'},
                {'name': 'Ultra Gentle Toner', 'brand': 'Neutrogena', 'ingredients': 'Glycerin, Cucumber Extract'},
                {'name': 'Clarifying Toner', 'brand': 'CeraVe', 'ingredients': 'Niacinamide, Hyaluronic Acid, Vitamin B5'},
                {'name': 'Glycolic Acid 7% Toning Solution', 'brand': 'The Ordinary', 'ingredients': 'Glycolic Acid, Amino Acids, Ginseng'},
                {'name': 'Calming Rose Toner', 'brand': 'Heritage Store', 'ingredients': 'Rosewater, Glycerin'},
            ],
            'retinol': [
                {'name': 'Retinol 0.5% in Squalane', 'brand': 'The Ordinary', 'ingredients': 'Retinol, Squalane, Caprylic Triglyceride'},
                {'name': 'A313 Retinoid Cream', 'brand': 'Avibon', 'ingredients': 'Retinyl Palmitate, Petrolatum'},
                {'name': 'Retinol Correxion Deep Wrinkle Serum', 'brand': 'RoC', 'ingredients': 'Retinol, Magnesium Ascorbyl Phosphate'},
                {'name': 'Time Revolution Night Repair Ampoule', 'brand': 'Missha', 'ingredients': 'Retinol, Niacinamide, Adenosine'},
                {'name': 'Retinol Anti-Aging Cream', 'brand': 'LilyAna Naturals', 'ingredients': 'Retinol, Hyaluronic Acid, Vitamin E'},
            ],
            'essence': [
                {'name': 'Time Revolution First Treatment Essence', 'brand': 'Missha', 'ingredients': 'Fermented Yeast Extract, Niacinamide'},
                {'name': 'Fresh Herb Origin Serum', 'brand': 'Natural Republic', 'ingredients': 'Centella Asiatica, Green Tea Extract'},
                {'name': 'Snail Secretion Filtrate Essence', 'brand': 'COSRX', 'ingredients': 'Snail Secretion Filtrate, Betaine'},
                {'name': 'Galactomyces 95 Tone Balancing Essence', 'brand': 'COSRX', 'ingredients': 'Galactomyces Ferment Filtrate, Niacinamide'},
                {'name': 'Rice Water Bright Cleansing Foam', 'brand': 'The Face Shop', 'ingredients': 'Rice Water, Glycerin, Sorbitol'},
            ],
            'vitamin_c': [
                {'name': 'Vitamin C + E Ferulic Acid Serum', 'brand': 'Skinceuticals', 'ingredients': 'L-Ascorbic Acid, Vitamin E, Ferulic Acid'},
                {'name': 'Vitamin C Suspension 23% + HA Spheres 2%', 'brand': 'The Ordinary', 'ingredients': 'L-Ascorbic Acid, Hyaluronic Acid'},
                {'name': 'Magnesium Ascorbyl Phosphate 10%', 'brand': 'The Ordinary', 'ingredients': 'Magnesium Ascorbyl Phosphate, Panthenol'},
                {'name': 'Vitamin C Brightening Serum', 'brand': 'Mad Hippie', 'ingredients': 'Sodium Ascorbyl Phosphate, Hyaluronic Acid'},
                {'name': 'C E Ferulic', 'brand': 'SkinCeuticals', 'ingredients': 'L-Ascorbic Acid, Alpha Tocopherol, Ferulic Acid'},
            ],
            'exfoliant': [
                {'name': 'BHA Liquid Exfoliant', 'brand': 'Paula\'s Choice', 'ingredients': 'Salicylic Acid, Green Tea Extract'},
                {'name': 'AHA 30% + BHA 2% Peeling Solution', 'brand': 'The Ordinary', 'ingredients': 'Glycolic Acid, Lactic Acid, Salicylic Acid'},
                {'name': 'Lactic Acid 10% + HA', 'brand': 'The Ordinary', 'ingredients': 'Lactic Acid, Sodium Hyaluronate'},
                {'name': 'Glycolic Acid 7% Toning Solution', 'brand': 'The Ordinary', 'ingredients': 'Glycolic Acid, Amino Acids, Ginseng'},
                {'name': 'Gentle Daily Peel', 'brand': 'Drunk Elephant', 'ingredients': 'AHA/BHA Complex, Peptides'},
            ],
            'mask': [
                {'name': 'Aztec Secret Indian Healing Clay', 'brand': 'Aztec Secret', 'ingredients': 'Bentonite Clay, Montmorillonite'},
                {'name': 'Honey Oatmeal Mask', 'brand': 'Freeman', 'ingredients': 'Manuka Honey, Oatmeal, Colloidal Oatmeal'},
                {'name': 'Hydrating B5 Gel Mask', 'brand': 'SkinCeuticals', 'ingredients': 'Hyaluronic Acid, Vitamin B5'},
                {'name': 'Dead Sea Mud Mask', 'brand': 'AHAVA', 'ingredients': 'Dead Sea Mud, Aloe Vera, Dunaliella Algae'},
                {'name': 'Charcoal Face Mask', 'brand': 'Origins', 'ingredients': 'Activated Charcoal, White China Clay'},
            ],
            'eye_cream': [
                {'name': 'Eye Repair Cream', 'brand': 'CeraVe', 'ingredients': 'Ceramides, Hyaluronic Acid, Niacinamide'},
                {'name': 'Caffeine Solution 5% + EGCG', 'brand': 'The Ordinary', 'ingredients': 'Caffeine, EGCG, Hyaluronic Acid'},
                {'name': 'All About Eyes', 'brand': 'Clinique', 'ingredients': 'Cucumber Extract, Barley Extract'},
                {'name': 'Retinol Eye Cream', 'brand': 'RoC', 'ingredients': 'Retinol, Mineral Complex'},
                {'name': 'Advanced Night Repair Eye', 'brand': 'Estée Lauder', 'ingredients': 'ChronoluxCB™, Caffeine'},
            ],
            'oil': [
                {'name': 'Squalane Oil', 'brand': 'The Ordinary', 'ingredients': '100% Plant-Derived Squalane'},
                {'name': 'Rosehip Seed Oil', 'brand': 'The Ordinary', 'ingredients': '100% Organic Cold-Pressed Rose Hip Fruit Extract'},
                {'name': 'Marula Oil', 'brand': 'Drunk Elephant', 'ingredients': '100% Virgin Marula Oil'},
                {'name': 'Jojoba Oil', 'brand': 'The Ordinary', 'ingredients': '100% Organic Cold-Pressed Jojoba Oil'},
                {'name': 'Argan Oil', 'brand': 'Josie Maran', 'ingredients': '100% Pure Argan Oil'},
            ],
            'spot_treatment': [
                {'name': 'Rapid Clear Stubborn Acne Spot Gel', 'brand': 'Neutrogena', 'ingredients': 'Benzoyl Peroxide, Salicylic Acid'},
                {'name': 'Drying Lotion', 'brand': 'Mario Badescu', 'ingredients': 'Salicylic Acid, Zinc Oxide, Calamine'},
                {'name': 'Blemish + Age Defense', 'brand': 'SkinCeuticals', 'ingredients': 'Salicylic Acid, LHA, Glycolic Acid'},
                {'name': 'Tea Tree Oil Blemish Stick', 'brand': 'The Body Shop', 'ingredients': 'Tea Tree Oil, Salicylic Acid'},
                {'name': 'Acne Treatment', 'brand': 'La Roche-Posay', 'ingredients': 'Benzoyl Peroxide, LHA'},
            ],
        }
        
        # Get default products for this category, fallback to moisturizer if category not found
        products_data = default_products.get(category, default_products['moisturizer'])
        
        # Create temporary Product instances (not saved to database)
        suggestions = []
        for i, product_data in enumerate(products_data):
            product = Product(
                id=9000 + i,  # Use high integer IDs to avoid conflicts
                name=product_data['name'],
                brand=product_data['brand'],
                product_type=category,
                ingredients=product_data['ingredients'],
                description=f"Popular {category} product",
                external_id=f"default_{category}_{i}"
            )
            suggestions.append(product)
        
        return suggestions
