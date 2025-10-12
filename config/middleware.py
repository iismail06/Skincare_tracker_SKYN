"""Custom middleware for development without security restrictions."""
from django.utils.safestring import mark_safe
from django.conf import settings
import re

class SecurityHeadersMiddleware:
    """Development version - minimal headers, no HTTPS requirements."""
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Force scheme to HTTP for development
        if hasattr(request, 'META'):
            request.META['HTTP_X_FORWARDED_PROTO'] = 'http'
            request.META['wsgi.url_scheme'] = 'http'
            
        response = self.get_response(request)
        
        # Remove any headers that might force HTTPS
        for header in ['Strict-Transport-Security', 'Content-Security-Policy']:
            if header in response:
                del response[header]
                
        # Set very permissive Content-Security-Policy for development
        response['Content-Security-Policy'] = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
        
        return response
    
