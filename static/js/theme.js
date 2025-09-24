// 🌙 Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggle.textContent = '☀️ Light Mode';
    }
    
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-theme');
        
        // Update button text and save preference
        if (body.classList.contains('dark-theme')) {
            themeToggle.textContent = '☀️ Light Mode';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.textContent = '🌙 Dark Mode';
            localStorage.setItem('theme', 'light');
        }
    });
});
