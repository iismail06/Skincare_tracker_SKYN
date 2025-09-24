from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

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