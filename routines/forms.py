from django import forms
from .models import Routine, RoutineStep


class RoutineCreateForm(forms.Form):
    routine_name = forms.CharField(max_length=100, label='Routine name')
    routine_type = forms.ChoiceField(choices=Routine.ROUTINE_CHOICES, label='Type')
    step1 = forms.CharField(max_length=200, required=False, label='Step 1')
    step2 = forms.CharField(max_length=200, required=False, label='Step 2')
    step3 = forms.CharField(max_length=200, required=False, label='Step 3')
    step4 = forms.CharField(max_length=200, required=False, label='Step 4')
    step5 = forms.CharField(max_length=200, required=False, label='Step 5')

    def clean(self):
        cleaned = super().clean()
        name = cleaned.get('routine_name')
        rtype = cleaned.get('routine_type')
        if not name:
            raise forms.ValidationError('Please provide a name for your routine.')
        if not rtype:
            raise forms.ValidationError('Please select a routine type.')
        # Ensure at least one step provided
        steps = [cleaned.get(f'step{i}') for i in range(1, 6)]
        if not any(steps):
            raise forms.ValidationError('Add at least one step for the routine.')
        return cleaned
