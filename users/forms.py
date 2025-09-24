from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import UserProfile

class CustomUserCreationForm(UserCreationForm):
    AGE_RANGE_CHOICES = [
        ('', 'Select your age range (optional)'),
        ('under_16', 'Under 16'),
        ('16_24', '16-24'),
        ('25_30', '25-30'),
        ('31_40', '31-40'),
        ('41_50', '41-50'),
        ('above_50', 'Above 50'),
    ]

    email = forms.EmailField(required=False)
    age_range = forms.ChoiceField(
        choices=AGE_RANGE_CHOICES,
        required=False,
    )
    
    class Meta:
        model = User
        fields = ('username', 'email', 'age_range', 'password1', 'password2')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Customize field labels and help text
        self.fields['username'].help_text = 'Choose a unique username'
        self.fields['age_range'].label = 'Age Range (optional)'
        self.fields['password1'].help_text = 'Your password should be secure'
        self.fields['password2'].help_text = 'Confirm your password'
        
        # Add CSS classes for styling
        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-control'
            field.widget.attrs['placeholder'] = field.label


class ProfileQuestionnaireForm(forms.ModelForm):
    """Form for skincare profile questionnaire"""
    
    SKIN_CONCERN_CHOICES = [
        ('acne', 'Acne'),
        ('aging', 'Anti-aging'),
        ('dryness', 'Dryness'),
        ('oiliness', 'Oiliness'),
        ('sensitivity', 'Sensitivity'),
        ('pigmentation', 'Dark spots/Pigmentation'),
    ]
    
    SKINCARE_GOAL_CHOICES = [
        ('acne_free', 'Acne-free skin'),
        ('moisturized', 'Better moisturized skin'),
        ('hyperpigmentation', 'Reduce hyperpigmentation'),
        ('easier_routine', 'Easier/simpler routine'),
        ('anti_aging', 'Anti-aging benefits'),
        ('even_tone', 'More even skin tone'),
    ]
    
    # Multiple choice fields
    skin_concerns = forms.MultipleChoiceField(
        choices=SKIN_CONCERN_CHOICES,
        widget=forms.CheckboxSelectMultiple,
        required=False,
        label="Primary skin concerns (check all that apply)"
    )
    
    skincare_goals = forms.MultipleChoiceField(
        choices=SKINCARE_GOAL_CHOICES,
        widget=forms.CheckboxSelectMultiple,
        required=False,
        label="Skincare goals (check all that apply)"
    )
    
    class Meta:
        model = UserProfile
        fields = [
            'skin_type', 
            'skin_concerns', 
            'current_routine', 
            'skincare_goals', 
            'custom_goals',
            'prefers_vegan',
            'prefers_fragrance_free', 
            'prefers_cruelty_free'
        ]
        
        widgets = {
            'skin_type': forms.Select(attrs={'class': 'form-control'}),
            'current_routine': forms.Select(attrs={'class': 'form-control'}),
            'custom_goals': forms.Textarea(attrs={
                'class': 'form-control', 
                'rows': 3,
                'placeholder': 'Any other specific goals you\'d like to achieve...'
            }),
        }
        
        labels = {
            'skin_type': 'What\'s your skin type?',
            'current_routine': 'Do you currently have a skincare routine?',
            'custom_goals': 'Other goals (optional)',
            'prefers_vegan': 'I prefer vegan products',
            'prefers_fragrance_free': 'I prefer fragrance-free products',
            'prefers_cruelty_free': 'I prefer cruelty-free products',
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add empty option for dropdowns
        self.fields['skin_type'].empty_label = "Select your skin type"
        self.fields['current_routine'].empty_label = "Select one"