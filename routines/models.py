from django import forms
from .models import Routine, RoutineStep
from products.models import Product


class RoutineCreateForm(forms.Form):
    routine_name = forms.CharField(
        max_length=100,
        label='Routine name',
    )
    routine_type = forms.ChoiceField(
        choices=Routine.ROUTINE_CHOICES,
        label='Type',
    )

    # Step fields with optional product selection
    step1 = forms.CharField(
        max_length=200, required=False, label='Step 1'
    )
    product1 = forms.ModelChoiceField(
        queryset=Product.objects.none(),
        required=False,
        label='Product (optional)',
        empty_label='-- No product selected --',
        widget=forms.Select(attrs={'class': 'product-select'}),
    )

    step2 = forms.CharField(
        max_length=200, required=False, label='Step 2'
    )
    product2 = forms.ModelChoiceField(
        queryset=Product.objects.none(),
        required=False,
        label='Product (optional)',
        empty_label='-- No product selected --',
        widget=forms.Select(attrs={'class': 'product-select'}),
    )

    step3 = forms.CharField(
        max_length=200, required=False, label='Step 3'
    )
    product3 = forms.ModelChoiceField(
        queryset=Product.objects.none(),
        required=False,
        label='Product (optional)',
        empty_label='-- No product selected --',
        widget=forms.Select(attrs={'class': 'product-select'}),
    )

    step4 = forms.CharField(
        max_length=200, required=False, label='Step 4'
    )
    product4 = forms.ModelChoiceField(
        queryset=Product.objects.none(),
        required=False,
        label='Product (optional)',
        empty_label='-- No product selected --',
        widget=forms.Select(attrs={'class': 'product-select'}),
    )

    step5 = forms.CharField(
        max_length=200, required=False, label='Step 5'
    )
    product5 = forms.ModelChoiceField(
        queryset=Product.objects.none(),
        required=False,
        label='Product (optional)',
        empty_label='-- No product selected --',
        widget=forms.Select(attrs={'class': 'product-select'}),
    )

    # Extended steps 6-10
    step6 = forms.CharField(
        max_length=200, required=False, label='Step 6'
    )
    product6 = forms.ModelChoiceField(
        queryset=Product.objects.none(),
        required=False,
        label='Product (optional)',
        empty_label='-- No product selected --',
        widget=forms.Select(attrs={'class': 'product-select'}),
    )

    step7 = forms.CharField(
        max_length=200, required=False, label='Step 7'
    )
    product7 = forms.ModelChoiceField(
        queryset=Product.objects.none(),
        required=False,
        label='Product (optional)',
        empty_label='-- No product selected --',
        widget=forms.Select(attrs={'class': 'product-select'}),
    )

    step8 = forms.CharField(
        max_length=200, required=False, label='Step 8'
    )
    product8 = forms.ModelChoiceField(
        queryset=Product.objects.none(),
        required=False,
        label='Product (optional)',
        empty_label='-- No product selected --',
        widget=forms.Select(attrs={'class': 'product-select'}),
    )

    step9 = forms.CharField(
        max_length=200, required=False, label='Step 9'
    )
    product9 = forms.ModelChoiceField(
        queryset=Product.objects.none(),
        required=False,
        label='Product (optional)',
        empty_label='-- No product selected --',
        widget=forms.Select(attrs={'class': 'product-select'}),
    )

    step10 = forms.CharField(
        max_length=200, required=False, label='Step 10'
    )
    product10 = forms.ModelChoiceField(
        queryset=Product.objects.none(),
        required=False,
        label='Product (optional)',
        empty_label='-- No product selected --',
        widget=forms.Select(attrs={'class': 'product-select'}),
    )

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)

        # Show only the user's products
        if user:
            user_products = Product.objects.filter(user=user)
            for i in range(1, 11):
                field = self.fields.get(f'product{i}')
                if field is not None:
                    field.queryset = user_products

    def clean(self):
        cleaned = super().clean()
        name = cleaned.get('routine_name')
        rtype = cleaned.get('routine_type')

        if not name:
            raise forms.ValidationError(
                'Please provide a name for your routine.'
            )
        if not rtype:
            raise forms.ValidationError(
                'Please select a routine type.'
            )

        # Ensure at least one step provided
        steps = [cleaned.get(f'step{i}') for i in range(1, 11)]
        if not any(steps):
            raise forms.ValidationError(
                'Add at least one step for the routine.'
            )
        return cleaned
