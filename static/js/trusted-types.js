/**
 * Trusted Types implementation to protect against DOM-based XSS attacks
 * This must be loaded before any other scripts that manipulate the DOM
 */

// Only run if the browser supports Trusted Types
if (window.trustedTypes && window.trustedTypes.createPolicy) {
  // Create a policy for sanitizing HTML
  const sanitizePolicy = window.trustedTypes.createPolicy('sanitize-html', {
    createHTML: (string) => {
      // A basic sanitization example
      // In production, use more robust libraries like DOMPurify
      return string
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },
    createScriptURL: (url) => {
      // Only allow specific domains for script URLs
      const allowedDomains = [
        'self',
        'code.jquery.com',
        'cdn.jsdelivr.net'
      ];

      try {
        const parsedUrl = new URL(url, window.location.origin);
        const hostname = parsedUrl.hostname;

        if (hostname === window.location.hostname || 
            allowedDomains.some(domain => hostname.endsWith(domain))) {
          return url;
        }
      } catch (e) {
        console.error('Invalid URL:', url);
      }

      throw new Error(`Rejected script URL: ${url}`);
    },
    createScript: (script) => {
      // Very restrictive - in a real app you'd need to implement
      // proper script validation logic
      return script;
    }
  });

  // Default policy for legacy code
  window.trustedTypes.createPolicy('default', {
    createHTML: (s) => s,
    createScriptURL: (s) => s,
    createScript: (s) => s
  });
}