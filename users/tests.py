from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from .forms import CustomUserCreationForm

# =============================================================================
# TEST CLASS 1: SIGNUP PAGE TESTS
# =============================================================================
class BeginnerSignupTests(TestCase):
    """Simple tests for the signup page - easy to understand!"""
    
    def setUp(self):
        """This runs before each test - like preparing your workspace"""
        # Create a fake browser to test with
        self.fake_browser = Client()
        # Get the signup page URL
        self.signup_page = reverse('signup')
    
    def test_can_see_signup_page(self):
        """Test #1: Check if signup page loads when you visit it"""
        # Go to the signup page (like clicking a link)
        response = self.fake_browser.get(self.signup_page)
        
        # Check if page loaded successfully (200 means "OK, page found!")
        self.assertEqual(response.status_code, 200)
        
        # Check if we can see "Join SkinTrack" text on the page
        self.assertContains(response, 'Join SkinTrack')
        
        print("✅ Test passed: Signup page loads correctly!")
    
    def test_can_create_new_user(self):
        """Test #2: Check if we can create a new user account"""
        # Fill out the signup form (like typing in the boxes)
        signup_info = {
            'username': 'sarah_skincare',
            'email': 'sarah@example.com',
            'age_range': '25_30',
            'password1': 'mypassword123',
            'password2': 'mypassword123'
        }
        
        # Submit the form (like clicking "Sign Up" button)
        response = self.fake_browser.post(self.signup_page, signup_info)
        
        # Check if we get redirected after signup (302 means "redirect")
        self.assertEqual(response.status_code, 302)
        
        # Check if the user actually got created in the database
        user_exists = User.objects.filter(username='sarah_skincare').exists()
        self.assertTrue(user_exists)
        
        print("✅ Test passed: New user account created successfully!")
    
    def test_passwords_must_match(self):
        """Test #3: Check if form rejects mismatched passwords"""
        # Try to signup with different passwords (this should fail!)
        bad_signup_info = {
            'username': 'testuser',
            'password1': 'password123',
            'password2': 'differentpassword'  # Oops! Doesn't match!
        }
        
        # Create the form with bad data
        form = CustomUserCreationForm(bad_signup_info)
        
        # Form should be invalid (reject the bad data)
        self.assertFalse(form.is_valid())
        
        print("✅ Test passed: Form correctly rejects mismatched passwords!")
    
    def test_email_is_optional(self):
        """Test #4: Check if signup works without email"""
        # Try signup without email (should still work!)
        signup_without_email = {
            'username': 'noemailuser',
            'password1': 'strongpassword123',  # Made password stronger
            'password2': 'strongpassword123'
            # No email field - that's OK!
        }
        
        # Create form without email
        form = CustomUserCreationForm(signup_without_email)
        
        # Debug: If form is invalid, show why
        if not form.is_valid():
            print(f"❌ Form errors: {form.errors}")
        
        # Form should still be valid
        self.assertTrue(form.is_valid())
        
        print("✅ Test passed: Signup works without email!")

# =============================================================================
# TEST CLASS 2: PROFILE QUESTIONNAIRE TESTS  
# =============================================================================
class BeginnerQuestionnaireTests(TestCase):
    """Simple tests for the skincare questionnaire page"""
    
    def setUp(self):
        """Prepare for questionnaire tests"""
        # Create fake browser
        self.fake_browser = Client()
        
        # Create a test user to login with
        self.test_user = User.objects.create_user(
            username='skincare_lover', 
            password='test123'
        )
        
        # Get questionnaire page URL
        self.questionnaire_page = reverse('users:profile_questionnaire')
    
    def test_can_see_questionnaire_page(self):
        """Test #5: Check if questionnaire page loads"""
        # Go to questionnaire page
        response = self.fake_browser.get(self.questionnaire_page)
        
        # Should load successfully
        self.assertEqual(response.status_code, 200)
        
        print("✅ Test passed: Questionnaire page loads!")


