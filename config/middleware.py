"""Custom middleware for performance optimization and security."""
from django.utils.safestring import mark_safe
from django.conf import settings
import re

class SecurityHeadersMiddleware:
    """Add security headers to all responses."""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.cookie_consent_added = False
        
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
        
        # Only modify HTML responses
        if hasattr(response, 'content') and response.get('Content-Type', '').startswith('text/html'):
            # Inject cookie consent code directly into HTML responses
            self._inject_cookie_consent(response)
        
        return response
    
    def _inject_cookie_consent(self, response):
        """Inject cookie consent banner code directly into HTML responses."""
        content = response.content.decode('utf-8')
        
        # Don't inject if already present
        if 'class="cookie-consent"' in content:
            return
        
        # CSS for cookie consent banner
        cookie_css = """
        <style>
        .cookie-consent {
            position: fixed; bottom: 0; left: 0; right: 0;
            background: rgba(33, 37, 41, 0.95); color: white; padding: 1rem;
            z-index: 9999; box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
            display: flex; justify-content: space-between; align-items: center;
            flex-wrap: wrap; gap: 1rem;
        }
        .cookie-consent p { margin: 0; flex: 1; }
        .cookie-consent-buttons { display: flex; gap: 0.5rem; }
        .cookie-consent button {
            padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;
        }
        .cookie-accept { background-color: #28a745; color: white; }
        .cookie-decline { background-color: transparent; color: white; border: 1px solid white; }
        @media (max-width: 768px) {
            .cookie-consent { flex-direction: column; align-items: flex-start; }
            .cookie-consent-buttons { width: 100%; }
        }
        </style>
        """
        
        # JavaScript for cookie consent functionality
        cookie_js = """
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            if (!localStorage.getItem('cookieConsent')) {
                const banner = document.createElement('div');
                banner.className = 'cookie-consent';
                banner.innerHTML = `
                    <p>This website uses cookies to enhance your experience. Some cookies are required for the site to function, 
                    while others help us understand how you use the site.</p>
                    <div class="cookie-consent-buttons">
                        <button class="cookie-decline">Decline Non-Essential</button>
                        <button class="cookie-accept">Accept All</button>
                    </div>
                `;
                
                banner.querySelector('.cookie-accept').addEventListener('click', function() {
                    localStorage.setItem('cookieConsent', 'accepted');
                    banner.remove();
                });
                
                banner.querySelector('.cookie-decline').addEventListener('click', function() {
                    localStorage.setItem('cookieConsent', 'declined');
                    banner.remove();
                });
                
                document.body.appendChild(banner);
            }
        });
        </script>
        """
        
        # Insert both CSS and JS before closing body tag
        if '</body>' in content:
            modified_content = content.replace('</body>', f"{cookie_css}{cookie_js}</body>")
            response.content = modified_content.encode('utf-8')
            
            # Update content-length header
            if 'Content-Length' in response:
                response['Content-Length'] = str(len(response.content))