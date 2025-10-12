from django.db import models
from django.contrib.auth.models import User


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
    age_range = models.CharField(
        max_length=20, choices=AGE_RANGE_CHOICES, null=True, blank=True
    )
    skin_type = models.CharField(
        max_length=50, choices=SKIN_TYPE_CHOICES, null=True, blank=True
    )
    skin_concerns = models.TextField(
        blank=True, help_text="Describe your main skin concerns"
    )
    main_concern = models.CharField(
        max_length=50,
        choices=[
            ('acne', 'Acne'),
            ('dryness', 'Dryness'),
            ('aging', 'Anti-aging'),
            ('sensitivity', 'Sensitivity'),
            ('oiliness', 'Excess oil'),
        ],
        null=True,
        blank=True,
    )
    current_routine = models.CharField(
        max_length=20, choices=ROUTINE_LEVEL_CHOICES, null=True, blank=True
    )
    main_goal = models.CharField(
        max_length=50,
        choices=[
            ('clear_skin', 'Clear skin'),
            ('moisturized', 'Better hydration'),
            ('anti_aging', 'Anti-aging'),
            ('simple_routine', 'Simple routine'),
        ],
        null=True,
        blank=True,
    )
    additional_notes = models.TextField(
        blank=True, help_text="Any other skincare concerns or goals"
    )
    prefers_natural = models.BooleanField(
        default=False, help_text="I prefer natural/organic products"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username
