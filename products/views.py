from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.urls import reverse
from rest_framework import generics, permissions
from rest_framework.response import Response

from .models import Product
from .forms import ProductForm
from .serializers import ProductSerializer, ProductCreateSerializer


@login_required
def product_list(request):
    """Show all products for the current user."""
    products = Product.objects.filter(user=request.user)
    # Fetch routines for add-to-routine UI
    from routines.models import Routine
    routines = Routine.objects.filter(user=request.user).order_by('routine_type', 'name')
    return render(
        request,
        'products/product_list.html',
        {'products': products, 'routines': routines},
    )


@login_required
def product_create(request):
    """Add a new product."""
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                product = form.save(commit=False)
                product.user = request.user
                product.save()
                success_msg = (
                    'Product "{}" added successfully!'
                ).format(product.name)
                messages.success(request, success_msg)

                if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                    return JsonResponse(
                        {
                            'status': 'success',
                            'message': success_msg,
                            'redirect_url': reverse('products:list'),
                        }
                    )
                return redirect('products:list')
            except Exception:
                err_msg = (
                    "Sorry, we couldn't save your product. "
                    "Please try again."
                )
                messages.error(request, err_msg)
                if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                    return JsonResponse(
                        {'status': 'error', 'message': err_msg},
                        status=500,
                    )
        else:
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse(
                    {
                        'status': 'error',
                        'message': 'Please correct the errors below.',
                        'errors': form.errors,
                    },
                    status=400,
                )
    else:
        form = ProductForm()

    return render(
        request,
        'products/product_form.html',
        {'form': form, 'title': 'Add New Product'},
    )


@login_required
def product_edit(request, pk):
    """Edit an existing product."""
    product = get_object_or_404(Product, pk=pk, user=request.user)

    if request.method == 'POST':
        form = ProductForm(
            request.POST, request.FILES, instance=product
        )
        if form.is_valid():
            form.save()
            success_msg = (
                'Product "{}" updated successfully!'
            ).format(product.name)
            messages.success(request, success_msg)
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse(
                    {
                        'status': 'success',
                        'message': success_msg,
                        'redirect_url': reverse('products:list'),
                    }
                )
            return redirect('products:list')
        else:
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse(
                    {
                        'status': 'error',
                        'message': 'Please correct the errors below.',
                        'errors': form.errors,
                    },
                    status=400,
                )
    else:
        form = ProductForm(instance=product)

    return render(
        request,
        'products/product_form.html',
        {
            'form': form,
            'title': 'Edit {}'.format(product.name),
            'product': product,
        },
    )


@login_required
def product_delete(request, pk):
    """Delete a product."""
    product = get_object_or_404(Product, pk=pk, user=request.user)

    if request.method == 'POST':
        product_name = product.name
        product.delete()
        messages.success(
            request,
            'Product "{}" deleted successfully!'.format(product_name),
        )
        return redirect('products:list')

    return render(
        request,
        'products/product_delete.html',
        {'product': product},
    )


class ProductListCreateAPIView(generics.ListCreateAPIView):
    """API endpoint for listing and creating products."""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateSerializer
        return ProductSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def list(self, request, *args, **kwargs):
        """Return user's products; fallback to suggestions on error."""
        try:
            return super().list(request, *args, **kwargs)
        except Exception:
            category = request.GET.get('category', 'moisturizer')
            suggestions = (
                ProductBrowseByCategoryAPIView()
                .create_default_suggestions(category)
            )
            serializer = ProductSerializer(
                suggestions, many=True, context={'request': request}
            )
            return Response(serializer.data)


class ProductRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):
    """API endpoint for single product retrieve/update/delete."""
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(user=self.request.user)


class ProductBrowseByCategoryAPIView(generics.ListAPIView):
    """API endpoint for browsing products by category."""
    serializer_class = ProductSerializer
    permission_classes = []  # Public browsing allowed

    def get_queryset(self):
        category = self.kwargs.get('category', 'moisturizer')
        db_products = Product.objects.filter(
            product_type=category
        ).order_by('brand', 'name')[:10]
        if len(db_products) >= 4:
            return db_products
        return self.create_default_suggestions(category)

    def create_default_suggestions(self, category):
        """Create default product suggestions when DB is empty."""
        default_products = {
            'cleanser': [
                {
                    'name': 'Hydrating Foaming Oil Cleanser',
                    'brand': 'CeraVe',
                    'ingredients': (
                        'Hyaluronic Acid, Ceramides, Niacinamide'
                    ),
                },
                {
                    'name': 'Gentle Skin Cleanser',
                    'brand': 'Cetaphil',
                    'ingredients': 'Sodium Cocoyl Glycinate, Glycerin',
                },
                {
                    'name': 'Ultra Gentle Daily Cleanser',
                    'brand': 'Neutrogena',
                    'ingredients': 'Glycerin, Polyglyceryl-4 Caprate',
                },
                {
                    'name': 'Squalane Cleanser',
                    'brand': 'The Ordinary',
                    'ingredients': 'Squalane, Aqua, Coco-Caprylate',
                },
            ],
            'moisturizer': [
                {
                    'name': 'Daily Facial Moisturizing Lotion',
                    'brand': 'CeraVe',
                    'ingredients': 'Hyaluronic Acid, Ceramides',
                },
                {
                    'name': 'Hydro Boost Water Gel',
                    'brand': 'Neutrogena',
                    'ingredients': 'Hyaluronic Acid, Glycerin',
                },
                {
                    'name': 'Daily Facial Moisturizer',
                    'brand': 'Cetaphil',
                    'ingredients': 'Macadamia Oil, Dimethicone',
                },
                {
                    'name': 'Natural Moisturizing Factors + HA',
                    'brand': 'The Ordinary',
                    'ingredients': 'Sodium Hyaluronate, PCA',
                },
            ],
            'sunscreen': [
                {
                    'name': 'AM Facial Moisturizing Lotion SPF 30',
                    'brand': 'CeraVe',
                    'ingredients': 'Zinc Oxide, Niacinamide',
                },
                {
                    'name': 'Ultra Sheer Dry-Touch SPF 45',
                    'brand': 'Neutrogena',
                    'ingredients': 'Avobenzone, Homosalate, Octisalate',
                },
                {
                    'name': 'UV Clear Broad-Spectrum SPF 46',
                    'brand': 'EltaMD',
                    'ingredients': 'Zinc Oxide, Niacinamide',
                },
                {
                    'name': 'Invisible Zinc Oxide SPF 50',
                    'brand': 'Blue Lizard',
                    'ingredients': 'Zinc Oxide, Titanium Dioxide',
                },
            ],
            'serum': [
                {
                    'name': 'Vitamin C + E Ferulic Acid Serum',
                    'brand': 'Skinceuticals',
                    'ingredients': 'L-Ascorbic Acid, Vitamin E, Ferulic Acid',
                },
                {
                    'name': 'Niacinamide 10% + Zinc 1%',
                    'brand': 'The Ordinary',
                    'ingredients': 'Niacinamide, Zinc PCA',
                },
                {
                    'name': 'Hyaluronic Acid 2% + B5',
                    'brand': 'The Ordinary',
                    'ingredients': 'Sodium Hyaluronate, Panthenol',
                },
                {
                    'name': 'Vitamin C Brightening Serum',
                    'brand': 'Mad Hippie',
                    'ingredients': 'Sodium Ascorbyl Phosphate, HA',
                },
            ],
            'toner': [
                {
                    'name': 'Alcohol-Free Toner',
                    'brand': 'Thayers',
                    'ingredients': 'Witch Hazel, Aloe Vera',
                },
                {
                    'name': 'Ultra Gentle Toner',
                    'brand': 'Neutrogena',
                    'ingredients': 'Glycerin, Cucumber Extract',
                },
                {
                    'name': 'Clarifying Toner',
                    'brand': 'CeraVe',
                    'ingredients': 'Niacinamide, Hyaluronic Acid',
                },
            ],
        }

        products_data = default_products.get(
            category, default_products['moisturizer']
        )

        suggestions = []
        for i, pdata in enumerate(products_data):
            product = Product(
                id=9000 + i,
                name=pdata['name'],
                brand=pdata['brand'],
                product_type=category,
                ingredients=pdata.get('ingredients', ''),
                description='Popular {} product'.format(category),
                external_id='default_{}_{}'.format(category, i),
            )
            suggestions.append(product)

        return suggestions


@login_required
def quick_add_product(request):
    """AJAX endpoint for quick product add during routine creation."""
    if request.method != 'POST':
        return JsonResponse(
            {'success': False, 'error': 'Invalid request method.'},
            status=405,
        )

    try:
        name = request.POST.get('name', '').strip()
        brand = request.POST.get('brand', '').strip()
        product_type = request.POST.get('product_type', '').strip()

        if not name or not brand or not product_type:
            return JsonResponse(
                {
                    'success': False,
                    'error': 'Name, brand, and product type are required.',
                },
                status=400,
            )

        product = Product.objects.create(
            user=request.user,
            name=name,
            brand=brand,
            product_type=product_type,
        )

        return JsonResponse(
            {
                'success': True,
                'product': {
                    'id': product.id,
                    'name': product.name,
                    'brand': product.brand,
                    'product_type': product.product_type,
                    'display_name': '{} - {}'.format(
                        product.brand, product.name
                    ),
                },
            }
        )
    except Exception:
        return JsonResponse(
            {
                'success': False,
                'error': 'An error occurred while adding the product.',
            },
            status=500,
        )
