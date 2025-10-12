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
            # Only add placeholder for input fields, not select elements
            if not isinstance(field.widget, forms.Select):
                field.widget.attrs['placeholder'] = field.label


class ProfileQuestionnaireForm(forms.ModelForm):
    """Simple skincare profile questionnaire - beginner friendly"""
    
    class Meta:
        model = UserProfile
        fields = [
            'skin_type', 
            'main_concern', 
            'current_routine', 
            'main_goal', 
            'additional_notes',
            'prefers_natural'
        ]
        
        widgets = {
            'skin_type': forms.Select(attrs={'class': 'form-control'}),
            'main_concern': forms.Select(attrs={'class': 'form-control'}),
            'current_routine': forms.Select(attrs={'class': 'form-control'}),
            'main_goal': forms.Select(attrs={'class': 'form-control'}),
            'additional_notes': forms.Textarea(attrs={
                'class': 'form-control', 
                'rows': 3,
                'placeholder': 'Tell us about any other skincare concerns or goals...'
            }),
        }
        
        labels = {
            'skin_type': 'What\'s your skin type?',
            'main_concern': 'What\'s your main skin concern?',
            'current_routine': 'Do you currently have a skincare routine?',
            'main_goal': 'What\'s your primary skincare goal?',
            'additional_notes': 'Additional notes (optional)',
            'prefers_natural': 'I prefer natural/organic products',
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add empty option for dropdowns - beginner technique
        self.fields['skin_type'].empty_label = "Select your skin type"
        self.fields['main_concern'].empty_label = "Select your main concern"
        self.fields['current_routine'].empty_label = "Select one"
        self.fields['main_goal'].empty_label = "Select your main goal"


class UserUpdateForm(forms.ModelForm):
    """Allow editing of basic account fields like name and email"""

    first_name = forms.CharField(required=False)
    last_name = forms.CharField(required=False)
    email = forms.EmailField(required=False)

    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'email',
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-control'
            # These are all text fields, so placeholder is valid
            field.widget.attrs['placeholder'] = field.label


class ProfileDetailsForm(forms.ModelForm):
    """Profile edit form that includes age fields plus questionnaire fields"""
    
    from .widgets import AccessibleTextarea, AccessibleCheckbox

    class Meta:
        model = UserProfile
        fields = [
            'date_of_birth',
            'age_range',
            'skin_type',
            'main_concern',
            'current_routine',
            'main_goal',
            'skin_concerns',
            'additional_notes',
            'prefers_natural',
        ]
        widgets = {
            'date_of_birth': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'age_range': forms.Select(attrs={'class': 'form-control'}),
            'skin_type': forms.Select(attrs={'class': 'form-control'}),
            'main_concern': forms.Select(attrs={'class': 'form-control'}),
            'current_routine': forms.Select(attrs={'class': 'form-control'}),
            'main_goal': forms.Select(attrs={'class': 'form-control'}),
            'skin_concerns': AccessibleTextarea(attrs={'class': 'form-control', 'rows': 2}),
            'additional_notes': AccessibleTextarea(attrs={'class': 'form-control', 'rows': 3}),
            'prefers_natural': AccessibleCheckbox(),
        }
        labels = {
            'date_of_birth': 'Date of birth (optional)',
            'age_range': 'Age range',
            'skin_type': 'Skin type',
            'main_concern': 'Main concern',
            'current_routine': 'Current routine level',
            'main_goal': 'Main goal',
            'skin_concerns': 'Other skin concerns',
            'additional_notes': 'Additional notes',
            'prefers_natural': 'I prefer natural/organic products',
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Provide an empty option for selects
        if 'age_range' in self.fields:
            self.fields['age_range'].required = False
        for name in ['skin_type', 'main_concern', 'current_routine', 'main_goal']:
            if name in self.fields:
                self.fields[name].empty_label = 'Select one'