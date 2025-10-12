from django.forms.widgets import Textarea, CheckboxInput

class AccessibleTextarea(Textarea):
    """Textarea widget that doesn't include aria-describedby attributes without help text"""
    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        if 'aria-describedby' in context['widget']['attrs']:
            del context['widget']['attrs']['aria-describedby']
        return context
        
class AccessibleCheckbox(CheckboxInput):
    """Checkbox widget that doesn't include aria-describedby attributes without help text"""
    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        if 'aria-describedby' in context['widget']['attrs']:
            del context['widget']['attrs']['aria-describedby']
        return context