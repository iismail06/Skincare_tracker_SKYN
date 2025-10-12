/**
 * Cookie Consent Manager
 * Helps comply with GDPR and other privacy regulations
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user already made a choice
    if (!localStorage.getItem('cookieConsent')) {
        // Create and show the cookie banner
        showCookieBanner();
    } else if (localStorage.getItem('cookieConsent') === 'accepted') {
        // User accepted cookies, enable analytics and third-party scripts
        enableThirdPartyScripts();
    }
});

/**
 * Creates and displays the cookie consent banner
 */
function showCookieBanner() {
    // Create banner element
    const banner = document.createElement('div');
    banner.className = 'cookie-consent';
    
    // Banner content with privacy information
    banner.innerHTML = `
        <p>This website uses cookies to enhance your experience. Some cookies are required for the site to function, 
        while others help us understand how you use the site. You can choose to accept or decline non-essential cookies.</p>
        <div class="cookie-consent-buttons">
            <button class="cookie-decline">Decline Non-Essential</button>
            <button class="cookie-accept">Accept All</button>
        </div>
    `;
    
    // Add event listeners to buttons
    banner.querySelector('.cookie-accept').addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'accepted');
        enableThirdPartyScripts();
        banner.remove();
    });
    
    banner.querySelector('.cookie-decline').addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'declined');
        banner.remove();
    });
    
    // Add banner to page
    document.body.appendChild(banner);
}

/**
 * Enables third-party scripts after consent
 */
function enableThirdPartyScripts() {
    // This is where you would dynamically load third-party scripts
    // For example, analytics, marketing trackers, etc.
    
    // Example: Google Analytics (commented out, add your own)
    /*
    const gaScript = document.createElement('script');
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=YOUR-GA-ID';
    gaScript.async = true;
    document.head.appendChild(gaScript);
    
    window.dataLayer = window.dataLayer || [];
    function gtag() {dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'YOUR-GA-ID');
    */
}