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
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date_of_birth = models.DateField(null=True, blank=True)
    age_range = models.CharField(max_length=20, choices=AGE_RANGE_CHOICES, null=True, blank=True)
    skin_type = models.CharField(max_length=50, choices=[
        ('Oily', 'Oily'),
        ('Dry', 'Dry'),
        ('Combination', 'Combination'),
        ('Sensitive', 'Sensitive'),
    ])
    skin_concerns = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username
