from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=False, help_text='Optional: We can send you skincare tips!')
    age = forms.IntegerField(
        required=False, 
        min_value=13, 
        max_value=120,
        help_text='Optional: Helps us recommend age-appropriate products'
    )
    
    class Meta:
        model = User
        fields = ('username', 'email', 'age', 'password1', 'password2')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Customize field labels and help text
        self.fields['username'].help_text = 'Choose a unique username'
        self.fields['age'].label = 'Age (optional)'
        self.fields['password1'].help_text = 'Your password should be secure'
        self.fields['password2'].help_text = 'Confirm your password'
        
        # Add CSS classes for styling
        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-control'
            field.widget.attrs['placeholder'] = field.label