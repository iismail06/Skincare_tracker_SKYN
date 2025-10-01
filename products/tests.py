from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Product
from .forms import ProductForm

class ProductModelTest(TestCase):
    """Test the Product model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
    
    def test_create_product(self):
        """Test creating a product"""
        product = Product.objects.create(
            name='CeraVe Cleanser',
            brand='CeraVe',
            product_type='cleanser',
            notes='Great for sensitive skin',
            user=self.user
        )
        
        self.assertEqual(product.name, 'CeraVe Cleanser')
        self.assertEqual(product.brand, 'CeraVe')
        self.assertEqual(product.product_type, 'cleanser')
        self.assertEqual(product.user, self.user)
        self.assertEqual(str(product), 'CeraVe - CeraVe Cleanser')
    
    def test_product_ordering(self):
        """Test products are ordered by brand, then name"""
        Product.objects.create(name='Cleanser', brand='ZZZ Brand', user=self.user, product_type='cleanser')
        Product.objects.create(name='Serum', brand='AAA Brand', user=self.user, product_type='serum')
        Product.objects.create(name='Moisturizer', brand='AAA Brand', user=self.user, product_type='moisturizer')
        
        products = list(Product.objects.all())
        self.assertEqual(products[0].brand, 'AAA Brand')
        self.assertEqual(products[1].brand, 'AAA Brand')
        self.assertEqual(products[2].brand, 'ZZZ Brand')


class ProductFormTest(TestCase):
    """Test the ProductForm"""
    
    def test_valid_form(self):
        """Test form with valid data"""
        form_data = {
            'name': 'The Ordinary Niacinamide',
            'brand': 'The Ordinary',
            'product_type': 'serum',
            'notes': 'Use morning and evening'
        }
        form = ProductForm(data=form_data)
        self.assertTrue(form.is_valid())
    
    def test_form_missing_required_fields(self):
        """Test form with missing required fields"""
        form_data = {
            'notes': 'Some notes'
        }
        form = ProductForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('name', form.errors)
        self.assertIn('brand', form.errors)
        self.assertIn('product_type', form.errors)


class ProductViewTest(TestCase):
    """Test the Product views"""
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            password='otherpass123'
        )
        
        # Create test products
        self.product1 = Product.objects.create(
            name='Test Cleanser',
            brand='Test Brand',
            product_type='cleanser',
            user=self.user
        )
        self.product2 = Product.objects.create(
            name='Other Product',
            brand='Other Brand',
            product_type='serum',
            user=self.other_user
        )
    
    def test_product_list_requires_login(self):
        """Test that product list requires authentication"""
        response = self.client.get(reverse('products:list'))
        self.assertEqual(response.status_code, 302)  # Redirect to login
    
    def test_product_list_shows_user_products_only(self):
        """Test that users only see their own products"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('products:list'))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Cleanser')
        self.assertNotContains(response, 'Other Product')
    
    def test_product_create_get(self):
        """Test GET request to create product page"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('products:create'))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Add New Product')
    
    def test_product_create_post_valid(self):
        """Test POST request to create product with valid data"""
        self.client.login(username='testuser', password='testpass123')
        
        data = {
            'name': 'New Moisturizer',
            'brand': 'New Brand',
            'product_type': 'moisturizer',
            'notes': 'Great for dry skin'
        }
        
        response = self.client.post(reverse('products:create'), data)
        
        # Should redirect to product list after successful creation
        self.assertEqual(response.status_code, 302)
        
        # Check product was created
        product = Product.objects.get(name='New Moisturizer')
        self.assertEqual(product.user, self.user)
        self.assertEqual(product.brand, 'New Brand')
    
    def test_product_edit_get(self):
        """Test GET request to edit product page"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('products:edit', kwargs={'pk': self.product1.pk}))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Edit Test Cleanser')
        self.assertContains(response, 'Test Brand')
    
    def test_product_edit_post_valid(self):
        """Test POST request to edit product with valid data"""
        self.client.login(username='testuser', password='testpass123')
        
        data = {
            'name': 'Updated Cleanser',
            'brand': 'Updated Brand',
            'product_type': 'cleanser',
            'notes': 'Updated notes'
        }
        
        response = self.client.post(reverse('products:edit', kwargs={'pk': self.product1.pk}), data)
        
        # Should redirect after successful edit
        self.assertEqual(response.status_code, 302)
        
        # Check product was updated
        product = Product.objects.get(pk=self.product1.pk)
        self.assertEqual(product.name, 'Updated Cleanser')
        self.assertEqual(product.brand, 'Updated Brand')
    
    def test_product_edit_other_user_product(self):
        """Test that users cannot edit other users' products"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('products:edit', kwargs={'pk': self.product2.pk}))
        
        # Should return 404 since user doesn't own this product
        self.assertEqual(response.status_code, 404)
    
    def test_product_delete_get(self):
        """Test GET request to delete product page"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('products:delete', kwargs={'pk': self.product1.pk}))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Delete Product')
        self.assertContains(response, 'Test Cleanser')
    
    def test_product_delete_post(self):
        """Test POST request to delete product"""
        self.client.login(username='testuser', password='testpass123')
        
        # Confirm product exists
        self.assertTrue(Product.objects.filter(pk=self.product1.pk).exists())
        
        response = self.client.post(reverse('products:delete', kwargs={'pk': self.product1.pk}))
        
        # Should redirect after successful deletion
        self.assertEqual(response.status_code, 302)
        
        # Check product was deleted
        self.assertFalse(Product.objects.filter(pk=self.product1.pk).exists())
    
    def test_product_delete_other_user_product(self):
        """Test that users cannot delete other users' products"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.post(reverse('products:delete', kwargs={'pk': self.product2.pk}))
        
        # Should return 404 since user doesn't own this product
        self.assertEqual(response.status_code, 404)
        
        # Product should still exist
        self.assertTrue(Product.objects.filter(pk=self.product2.pk).exists())


class ProductImageTest(TestCase):
    """Test product image upload functionality"""
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
    
    def test_product_with_image(self):
        """Test creating product with image"""
        # Create a fake image file
        image = SimpleUploadedFile(
            name='test_image.jpg',
            content=b'fake_image_content',
            content_type='image/jpeg'
        )
        
        product = Product.objects.create(
            name='Test Product',
            brand='Test Brand',
            product_type='cleanser',
            user=self.user,
            image=image
        )
        
        self.assertTrue(product.image)
        self.assertIn('products/', product.image.name)


class ProductRoutineIntegrationTest(TestCase):
    """Test product integration with routines"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
        self.product = Product.objects.create(
            name='Test Cleanser',
            brand='Test Brand',
            product_type='cleanser',
            user=self.user
        )
    
    def test_product_can_be_linked_to_routine_step(self):
        """Test that products can be linked to routine steps"""
        from routines.models import Routine, RoutineStep
        
        # Create a routine
        routine = Routine.objects.create(
            user=self.user,
            name='Morning Routine',
            routine_type='morning'
        )
        
        # Create a routine step with linked product
        step = RoutineStep.objects.create(
            routine=routine,
            step_name='Cleanse face',
            order=1,
            product=self.product
        )
        
        # Test the relationship
        self.assertEqual(step.product, self.product)
        self.assertEqual(step.product.name, 'Test Cleanser')
    
    def test_product_deletion_doesnt_break_routine_step(self):
        """Test that deleting a product doesn't break routine steps"""
        from routines.models import Routine, RoutineStep
        
        # Create routine with product
        routine = Routine.objects.create(
            user=self.user,
            name='Morning Routine',
            routine_type='morning'
        )
        
        step = RoutineStep.objects.create(
            routine=routine,
            step_name='Cleanse face',
            order=1,
            product=self.product
        )
        
        # Delete the product
        self.product.delete()
        
        # Refresh step from database
        step.refresh_from_db()
        
        # Step should still exist but product should be None
        self.assertIsNone(step.product)
        self.assertEqual(step.step_name, 'Cleanse face')
