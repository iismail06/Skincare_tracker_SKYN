from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from products.openbeautyfacts import import_openbeautyfacts_products


class Command(BaseCommand):
    help = 'Import skincare products from Open Beauty Facts API'

    def add_arguments(self, parser):
        # Required category argument
        parser.add_argument(
            'category',
            type=str,
            help='Product category to import (e.g., moisturizer, cleanser, sunscreen)'
        )
        
        # Optional arguments
        parser.add_argument(
            '--user',
            type=str,
            default='admin',
            help='Username to associate products with (default: admin)'
        )
        
        parser.add_argument(
            '--limit',
            type=int,
            default=10,
            help='Maximum number of products to import (default: 10)'
        )
        
        parser.add_argument(
            '--overwrite',
            action='store_true',
            help='Update existing products instead of skipping them'
        )

    def handle(self, *args, **options):
        category = options['category']
        username = options['user']
        limit = options['limit']
        overwrite = options['overwrite']
        
        # Get or create user
        try:
            user = User.objects.get(username=username)
            self.stdout.write(f"✅ Using existing user: {username}")
        except User.DoesNotExist:
            # Create a basic user for demo purposes
            user = User.objects.create_user(
                username=username,
                email=f"{username}@example.com",
                password='defaultpassword123'
            )
            self.stdout.write(
                self.style.WARNING(f"⚠️  Created new user: {username} (password: defaultpassword123)")
            )
        
        # Validate category
        valid_categories = [
            'cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 
            'exfoliant', 'mask', 'eye cream', 'oil', 'essence',
            'spot treatment', 'retinol', 'vitamin c'
        ]
        
        if category.lower() not in [cat.lower() for cat in valid_categories]:
            self.stdout.write(
                self.style.WARNING(f"⚠️  '{category}' is not a standard category, but we'll try anyway!")
            )
        
        # Start import process
        self.stdout.write(f"🚀 Starting import of '{category}' products...")
        self.stdout.write(f"📊 Settings: limit={limit}, user={username}, overwrite={overwrite}")
        
        try:
            # Import products
            results = import_openbeautyfacts_products(
                category=category,
                user=user,
                limit=limit,
                overwrite=overwrite
            )
            
            if 'error' in results:
                raise CommandError(f"❌ Import failed: {results['error']}")
            
            # Display results
            self.stdout.write("\n" + "="*50)
            self.stdout.write(self.style.SUCCESS("🎉 IMPORT COMPLETED SUCCESSFULLY!"))
            self.stdout.write("="*50)
            self.stdout.write(f"📊 RESULTS:")
            self.stdout.write(f"   ✅ Created: {results['created']} new products")
            self.stdout.write(f"   ✏️  Updated: {results['updated']} existing products") 
            self.stdout.write(f"   ⏭️  Skipped: {results['skipped']} products")
            self.stdout.write("\n💡 TIP: You can now view these products in your app or via the API!")
            self.stdout.write(f"🔗 Try: GET /api/products/api/ to see all products for {username}")
            
        except Exception as e:
            raise CommandError(f"❌ Import failed with error: {str(e)}")


# Example usage displayed when someone runs --help
"""
EXAMPLES:

Basic import:
  python manage.py import_openbeautyfacts moisturizer

Import more products:
  python manage.py import_openbeautyfacts "vitamin c serum" --limit 20

Import for specific user:
  python manage.py import_openbeautyfacts cleanser --user myusername

Update existing products:
  python manage.py import_openbeautyfacts sunscreen --overwrite

Popular categories to try:
  - moisturizer
  - cleanser  
  - sunscreen
  - "vitamin c serum"
  - "retinol cream"
  - "face mask"
"""