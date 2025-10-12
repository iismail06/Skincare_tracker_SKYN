"""Custom middleware for performance optimization."""

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
            "script-src 'self' 'unsafe-inline' https://code.jquery.com https://cdn.jsdelivr.net",
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https://res.cloudinary.com",
            "connect-src 'self'",
            "frame-src 'self'",
            "require-trusted-types-for 'script'"  # Add Trusted Types for DOM-XSS protection
        ]
        response['Content-Security-Policy'] = '; '.join(csp_directives)
        
        # Only add these headers for non-static files (WhiteNoise handles static files)
        if not request.path.startswith('/static/'):
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        
        return response