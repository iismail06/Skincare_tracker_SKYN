from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class UserProfile(models.Model):
    AGE_RANGE_CHOICES = [
        ('under_16', 'Under 16'),
        ('16_24', '16-24'),
        ('25_30', '25-30'),
        ('31_40', '31-40'),
        ('41_50', '41-50'),
        ('above_50', 'Above 50'),
    ]
    
    SKIN_TYPE_CHOICES = [
        ('oily', 'Oily'),
        ('dry', 'Dry'),
        ('combination', 'Combination'),
        ('sensitive', 'Sensitive'),
        ('normal', 'Normal'),
    ]
    
    ROUTINE_LEVEL_CHOICES = [
        ('none', 'No routine'),
        ('basic', 'Basic (cleanser + moisturizer)'),
        ('moderate', 'Moderate (3-5 products)'),
        ('extensive', 'Extensive (5+ products)'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date_of_birth = models.DateField(null=True, blank=True)
    age_range = models.CharField(max_length=20, choices=AGE_RANGE_CHOICES, null=True, blank=True)
    
    # Questionnaire fields
    skin_type = models.CharField(max_length=20, choices=SKIN_TYPE_CHOICES, null=True, blank=True)
    skin_concerns = models.JSONField(default=list, blank=True)  # Store multiple concerns as JSON
    current_routine = models.CharField(max_length=20, choices=ROUTINE_LEVEL_CHOICES, null=True, blank=True)
    skincare_goals = models.JSONField(default=list, blank=True)  # Store multiple goals as JSON
    custom_goals = models.TextField(blank=True)
    
    # Preferences
    prefers_vegan = models.BooleanField(default=False)
    prefers_fragrance_free = models.BooleanField(default=False)
    prefers_cruelty_free = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username
