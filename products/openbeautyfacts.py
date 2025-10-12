import requests
from django.contrib.auth.models import User
from .models import Product


def map_category_to_product_type(categories):
    """Map Open Beauty Facts categories to our product types."""
    if not categories:
        return 'other'

    categories_lower = categories.lower()

    if any(
        word in categories_lower
        for word in [
            'cleanser',
            'cleansing',
            'face wash',
            'gel cleanser',
        ]
    ):
        return 'cleanser'

    if any(word in categories_lower for word in ['toner', 'tonic']):
        return 'toner'

    if any(word in categories_lower for word in ['serum']):
        return 'serum'

    if any(
        word in categories_lower
        for word in [
            'moisturizer',
            'moisturiser',
            'cream',
            'lotion',
            'face cream',
        ]
    ):
        return 'moisturizer'

    if any(
        word in categories_lower
        for word in ['sunscreen', 'sun protection', 'spf']
    ):
        return 'sunscreen'

    if any(word in categories_lower for word in ['exfoliant', 'scrub',
                                                 'peeling']):
        return 'exfoliant'

    if any(word in categories_lower for word in ['mask', 'face mask']):
        return 'mask'

    if any(word in categories_lower for word in ['eye cream', 'eye care']):
        return 'eye_cream'

    if any(word in categories_lower for word in ['oil', 'face oil']):
        return 'oil'

    if any(word in categories_lower for word in ['essence']):
        return 'essence'

    if any(
        word in categories_lower
        for word in ['spot treatment', 'acne treatment']
    ):
        return 'spot_treatment'

    if any(word in categories_lower for word in ['retinol', 'retinoid']):
        return 'retinol'

    if any(
        word in categories_lower
        for word in ['vitamin c', 'vitamin-c']
    ):
        return 'vitamin_c'

    return 'other'


def fetch_products_from_openbeautyfacts(category='moisturizer',
                                        limit=10):
    """Fetch products from Open Beauty Facts API by category."""
    base_url = "https://world.openbeautyfacts.org/cgi/search.pl"

    params = {
        'search_terms': f'{category} face skin care',
        'search_simple': '1',
        'action': 'process',
        'json': '1',
        'page_size': limit,
        'sort_by': 'popularity',
    }

    try:
        print(
            "🔍 Searching Open Beauty Facts for '{}' products..."
            .format(category)
        )
        response = requests.get(base_url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()

        if 'products' not in data:
            print("❌ No products found in response")
            return []

        products = data['products']
        print("✅ Found {} products".format(len(products)))

        processed_products = []

        for product in products:
            name = product.get('product_name', 'Unknown Product')
            brand = product.get('brands', 'Unknown Brand')

            if not name or name == 'Unknown Product':
                continue

            if brand and ',' in brand:
                brand = brand.split(',')[0].strip()

            processed_product = {
                'name': name[:200],
                'brand': brand[:100] if brand else 'Unknown Brand',
                'product_type': map_category_to_product_type(
                    product.get('categories', '')
                ),
                'ingredients': product.get('ingredients_text', ''),
                'description': product.get('generic_name', ''),
                'external_id': product.get('_id', ''),
            }

            processed_products.append(processed_product)

        print("📦 Processed {} valid products"
              .format(len(processed_products)))
        return processed_products

    except requests.exceptions.RequestException as exc:
        print("❌ Error fetching data from Open Beauty Facts: {}".format(exc))
        return []
    except Exception as exc:
        print("❌ Unexpected error: {}".format(exc))
        return []


def save_products_to_database(products, user, overwrite=False):
    """Save fetched products to the database."""
    created_count = 0
    updated_count = 0
    skipped_count = 0

    for pdata in products:
        try:
            existing = Product.objects.filter(
                user=user,
                name=pdata['name'],
                brand=pdata['brand'],
            ).first()

            if existing:
                if overwrite:
                    for key, value in pdata.items():
                        setattr(existing, key, value)
                    existing.save()
                    updated_count += 1
                    print(
                        "✏️  Updated: {} - {}"
                        .format(pdata['brand'], pdata['name'])
                    )
                else:
                    skipped_count += 1
                    print(
                        "⏭️  Skipped (exists): {} - {}"
                        .format(pdata['brand'], pdata['name'])
                    )
            else:
                Product.objects.create(user=user, **pdata)
                created_count += 1
                print(
                    "✅ Created: {} - {}"
                    .format(pdata['brand'], pdata['name'])
                )

        except Exception as exc:
            print(
                "❌ Error saving product {}: {}"
                .format(pdata.get('name', 'Unknown'), exc)
            )
            skipped_count += 1

    return {
        'created': created_count,
        'updated': updated_count,
        'skipped': skipped_count,
    }


def import_openbeautyfacts_products(category, user, limit=10, overwrite=False):
    """Main function to import products from Open Beauty Facts."""
    print(
        "🚀 Starting import of '{}' products..."
        .format(category)
    )
    products = fetch_products_from_openbeautyfacts(category, limit)

    if not products:
        return {'error': 'No products fetched from Open Beauty Facts'}

    results = save_products_to_database(products, user, overwrite)

    print("🎉 Import completed!")
    print("   📊 Created: {}".format(results['created']))
    print("   ✏️  Updated: {}".format(results['updated']))
    print("   ⏭️  Skipped: {}".format(results['skipped']))

    return results
