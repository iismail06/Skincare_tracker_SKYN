import requests
import time
from django.contrib.auth.models import User
from .models import Product


def map_category_to_product_type(categories):
    """Map Open Beauty Facts categories to our product types"""
    if not categories:
        return 'other'
    
    categories_lower = categories.lower()
    
    # Mapping Open Beauty Facts categories to our choices
    if any(word in categories_lower for word in ['cleanser', 'cleansing', 'face wash', 'gel cleanser']):
        return 'cleanser'
    elif any(word in categories_lower for word in ['toner', 'tonic']):
        return 'toner'
    elif any(word in categories_lower for word in ['serum']):
        return 'serum'
    elif any(word in categories_lower for word in ['moisturizer', 'moisturiser', 'cream', 'lotion', 'face cream']):
        return 'moisturizer'
    elif any(word in categories_lower for word in ['sunscreen', 'sun protection', 'spf']):
        return 'sunscreen'
    elif any(word in categories_lower for word in ['exfoliant', 'scrub', 'peeling']):
        return 'exfoliant'
    elif any(word in categories_lower for word in ['mask', 'face mask']):
        return 'mask'
    elif any(word in categories_lower for word in ['eye cream', 'eye care']):
        return 'eye_cream'
    elif any(word in categories_lower for word in ['oil', 'face oil']):
        return 'oil'
    elif any(word in categories_lower for word in ['essence']):
        return 'essence'
    elif any(word in categories_lower for word in ['spot treatment', 'acne treatment']):
        return 'spot_treatment'
    elif any(word in categories_lower for word in ['retinol', 'retinoid']):
        return 'retinol'
    elif any(word in categories_lower for word in ['vitamin c', 'vitamin-c']):
        return 'vitamin_c'
    else:
        return 'other'


def fetch_products_from_openbeautyfacts(category='moisturizer', limit=10):
    """
    Fetch products from Open Beauty Facts API by category
    
    Args:
        category: Product category to search for (e.g., 'moisturizer', 'cleanser')
        limit: Maximum number of products to fetch
        
    Returns:
        List of product dictionaries
    """
    
    # Open Beauty Facts API endpoint for cosmetics
    base_url = "https://world.openbeautyfacts.org/cgi/search.pl"
    
    # Search parameters
    params = {
        'search_terms': f'{category} face skin care',
        'search_simple': '1',
        'action': 'process',
        'json': '1',
        'page_size': limit,
        'sort_by': 'popularity'
    }
    
    try:
        print(f"🔍 Searching Open Beauty Facts for '{category}' products...")
        response = requests.get(base_url, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        if 'products' not in data:
            print("❌ No products found in response")
            return []
            
        products = data['products']
        print(f"✅ Found {len(products)} products")
        
        processed_products = []
        
        for product in products:
            # Extract product information safely
            product_name = product.get('product_name', 'Unknown Product')
            brand = product.get('brands', 'Unknown Brand')
            
            # Skip products with missing essential data
            if not product_name or product_name == 'Unknown Product':
                continue
                
            # Clean up brand name (take first brand if multiple)
            if brand and ',' in brand:
                brand = brand.split(',')[0].strip()
            
            processed_product = {
                'name': product_name[:200],  # Limit to model field length
                'brand': brand[:100] if brand else 'Unknown Brand',
                'product_type': map_category_to_product_type(product.get('categories', '')),
                'ingredients': product.get('ingredients_text', ''),
                'description': product.get('generic_name', ''),
                'external_id': product.get('_id', ''),
            }
            
            processed_products.append(processed_product)
            
        print(f"📦 Processed {len(processed_products)} valid products")
        return processed_products
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching data from Open Beauty Facts: {e}")
        return []
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return []


def save_products_to_database(products, user, overwrite=False):
    """
    Save fetched products to the database
    
    Args:
        products: List of product dictionaries from fetch_products_from_openbeautyfacts
        user: Django User instance to associate products with
        overwrite: If True, update existing products. If False, skip duplicates.
        
    Returns:
        Dictionary with counts of created, updated, and skipped products
    """
    
    created_count = 0
    updated_count = 0
    skipped_count = 0
    
    for product_data in products:
        try:
            # Check if product already exists for this user
            existing_product = Product.objects.filter(
                user=user,
                name=product_data['name'],
                brand=product_data['brand']
            ).first()
            
            if existing_product:
                if overwrite:
                    # Update existing product
                    for key, value in product_data.items():
                        setattr(existing_product, key, value)
                    existing_product.save()
                    updated_count += 1
                    print(f"✏️  Updated: {product_data['brand']} - {product_data['name']}")
                else:
                    skipped_count += 1
                    print(f"⏭️  Skipped (already exists): {product_data['brand']} - {product_data['name']}")
            else:
                # Create new product
                Product.objects.create(user=user, **product_data)
                created_count += 1
                print(f"✅ Created: {product_data['brand']} - {product_data['name']}")
                
        except Exception as e:
            print(f"❌ Error saving product {product_data.get('name', 'Unknown')}: {e}")
            skipped_count += 1
    
    return {
        'created': created_count,
        'updated': updated_count,
        'skipped': skipped_count
    }


def import_openbeautyfacts_products(category, user, limit=10, overwrite=False):
    """
    Main function to import products from Open Beauty Facts
    
    Args:
        category: Product category to search for
        user: Django User instance
        limit: Maximum number of products to fetch
        overwrite: Whether to update existing products
        
    Returns:
        Dictionary with import statistics
    """
    
    print(f"🚀 Starting import of {category} products from Open Beauty Facts...")
    
    # Fetch products from API
    products = fetch_products_from_openbeautyfacts(category, limit)
    
    if not products:
        return {'error': 'No products fetched from Open Beauty Facts'}
    
    # Save products to database
    results = save_products_to_database(products, user, overwrite)
    
    print(f"🎉 Import completed!")
    print(f"   📊 Created: {results['created']}")
    print(f"   ✏️  Updated: {results['updated']}")
    print(f"   ⏭️  Skipped: {results['skipped']}")
    
    return results