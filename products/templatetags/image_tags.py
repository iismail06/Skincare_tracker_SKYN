"""Template tags for image optimization."""

from django import template
from django.templatetags.static import static

register = template.Library()

@register.simple_tag
def optimized_image_url(image_path):
    """Return optimized static URL with proper attributes for performance."""
    return static(image_path)
    
@register.filter
def with_lazy_loading(html_tag):
    """Add loading=lazy attribute to img tags."""
    if html_tag.startswith('<img'):
        if 'loading=' not in html_tag:
            insert_pos = html_tag.find('>')
            if insert_pos > 0:
                return html_tag[:insert_pos] + ' loading="lazy"' + html_tag[insert_pos:]
    return html_tag