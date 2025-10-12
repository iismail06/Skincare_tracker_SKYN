"""Custom middleware for performance optimization and security."""
from django.utils.safestring import mark_safe
from django.conf import settings
import re

class SecurityHeadersMiddleware:
    """Add security headers to all responses."""
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        response = self.get_response(request)
        
        # Add security and performance headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Implement Content Security Policy (CSP)
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://code.jquery.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com https://cdnjs.cloudflare.com",
            "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
            "img-src 'self' data: https://res.cloudinary.com",
            "connect-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
            "frame-src 'self'"
            # We will add the trusted-types directive later after proper implementation
        ]
        response['Content-Security-Policy'] = '; '.join(csp_directives)
        
        # Only add these headers for non-static files (WhiteNoise handles static files)
        if not request.path.startswith('/static/'):
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            
        return response
    
class CookieConsentMiddleware:
    """Add cookie consent banner to HTML responses."""
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        response = self.get_response(request)
        
        # Skip non-HTML responses
        if not hasattr(response, 'content') or not response.get('Content-Type', '').startswith('text/html'):
            return response
            
        # Try to work with the content
        try:
            content = response.content.decode('utf-8')
            
            # Skip if banner already injected
            if 'cookie-consent' in content:
                return response
                
            # Skip if no HTML structure to modify
            if '</head>' not in content or '</body>' not in content:
                return response
                
            # Prepare our CSS and JS
            css = '.cookie-consent{position:fixed;bottom:0;left:0;right:0;background:rgba(33,37,41,0.95);color:white;padding:1rem;z-index:9999;box-shadow:0 -2px 10px rgba(0,0,0,0.15);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}.cookie-consent p{margin:0;flex:1}.cookie-consent-buttons{display:flex;gap:.5rem}.cookie-consent button{padding:.5rem 1rem;border:none;border-radius:4px;cursor:pointer;font-weight:bold}.cookie-accept{background-color:#28a745;color:white}.cookie-decline{background-color:transparent;color:white;border:1px solid white}@media(max-width:768px){.cookie-consent{flex-direction:column;align-items:flex-start}.cookie-consent-buttons{width:100%}}'
            
            js = """
            <script>
            document.addEventListener('DOMContentLoaded',function(){if(!localStorage.getItem('cookieConsent')){const banner=document.createElement('div');banner.className='cookie-consent';banner.innerHTML='<p>This website uses cookies to enhance your experience.</p><div class="cookie-consent-buttons"><button class="cookie-decline">Decline</button><button class="cookie-accept">Accept</button></div>';banner.querySelector('.cookie-accept').addEventListener('click',function(){localStorage.setItem('cookieConsent','accepted');banner.remove()});banner.querySelector('.cookie-decline').addEventListener('click',function(){localStorage.setItem('cookieConsent','declined');banner.remove()});document.body.appendChild(banner)}});
            </script>
            """
            
            # Insert CSS in head
            modified = content.replace('</head>', f'<style>{css}</style></head>')
            # Insert JS before end of body
            modified = modified.replace('</body>', f'{js}</body>')
            
            # Update response
            response.content = modified.encode('utf-8')
            
            # Update content length if needed
            if 'Content-Length' in response:
                response['Content-Length'] = str(len(response.content))
                
        except (UnicodeDecodeError, AttributeError):
            # If any error occurs, return the original response
            pass
            
        return response