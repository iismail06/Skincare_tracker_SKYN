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
        
        # Only add these headers for non-static files (WhiteNoise handles static files)
        if not request.path.startswith('/static/'):
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        
        return response