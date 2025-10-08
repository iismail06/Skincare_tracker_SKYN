

/* ==========================================================================
   UTILITY FUNCTIONS
   Common utility functions used throughout the application
   ========================================================================== */

/**
 * Helper to read CSS custom properties from the document root
 * @param {string} name - The name of the CSS variable (including --prefix)
 * @returns {string|null} The value of the CSS variable, or null if not found
 */
function getCssVar(name) {
  try {
    const val = getComputedStyle(document.documentElement).getPropertyValue(name);
    return val ? val.trim().replace(/^"|"$/g, '') : null;
  } catch (e) {
    return null;
  }
}

/**
 * Shows a success message toast notification
 * @param {string} message - The message to display
 */
function showSuccessMessage(message) {
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.className = 'toast success';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 1rem;
    border-radius: 4px;
    z-index: 1001;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Fade in
  setTimeout(() => toast.style.opacity = '1', 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
}

/**
 * Shows an error message toast notification
 * @param {string} message - The message to display
 */
function showErrorMessage(message) {
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.className = 'toast error';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #dc3545;
    color: white;
    padding: 1rem;
    border-radius: 4px;
    z-index: 1001;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Fade in
  setTimeout(() => toast.style.opacity = '1', 10);
  
  // Remove after 5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 5000);
}

/**
 * Gets the CSRF token from cookies
 * @returns {string} The CSRF token
 */
function getCsrfToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

/**
 * Simple debounce function
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce delay in milliseconds
 * @returns {Function} - The debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/* ==========================================================================
   INITIALIZATION
   Main initialization that runs when DOM is loaded
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function() {
  // Initialize theme functionality
  initTheme();
  
  // Initialize navigation
  initNavigation();
  
  // Initialize page-specific functionality
  initPageSpecificFunctions();
  
  // Setup common UI elements
  setupCommonElements();
});

/* ==========================================================================
   THEME FUNCTIONALITY
   Handles dark/light theme switching with localStorage persistence
   ========================================================================== */

/**
 * Initialize theme functionality
 */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Set up initial theme based on local storage or system preference
  const currentTheme = localStorage.getItem('theme');
  
  if (currentTheme) {
    // If a preference exists in localStorage, use that
    document.body.classList.toggle('dark-theme', currentTheme === 'dark');
    updateThemeToggleIcon(currentTheme === 'dark');
  } else {
    // Otherwise, use the system preference
    document.body.classList.toggle('dark-theme', prefersDarkScheme.matches);
    updateThemeToggleIcon(prefersDarkScheme.matches);
    // Save the system preference to localStorage
    localStorage.setItem('theme', prefersDarkScheme.matches ? 'dark' : 'light');
  }
  
  // Add event listener for theme toggle button
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Listen for system theme changes
  prefersDarkScheme.addEventListener('change', function(e) {
    // Only update if the user hasn't set a preference
    if (!localStorage.getItem('theme')) {
      document.body.classList.toggle('dark-theme', e.matches);
      updateThemeToggleIcon(e.matches);
    }
  });
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
  // Toggle the theme
  document.body.classList.toggle('dark-theme');
  const isDarkTheme = document.body.classList.contains('dark-theme');
  
  // Update the icon
  updateThemeToggleIcon(isDarkTheme);
  
  // Save the preference to localStorage
  localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
}

/**
 * Update the theme toggle icon based on the current theme
 * @param {boolean} isDarkTheme - Whether the current theme is dark
 */
function updateThemeToggleIcon(isDarkTheme) {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  // Update icon classes
  const icon = themeToggle.querySelector('i') || themeToggle;
  if (isDarkTheme) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
}

/* ==========================================================================
   NAVIGATION
   Handles mobile navigation menu functionality
   ========================================================================== */

/**
 * Initialize navigation functionality
 */
function initNavigation() {
  const menuToggle = document.querySelector('.hamburger-menu');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (!menuToggle || !mobileMenu) return;
  
  // Toggle menu on hamburger click
  menuToggle.addEventListener('click', function() {
    this.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(event) {
    if (!mobileMenu.contains(event.target) && 
        !menuToggle.contains(event.target) && 
        mobileMenu.classList.contains('active')) {
      
      menuToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  });
  
  // Close menu when pressing escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && mobileMenu.classList.contains('active')) {
      menuToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  });
}

/* ==========================================================================
   CALENDAR FUNCTIONALITY
   Handles calendar display and interactions
   ========================================================================== */

/**
 * Initialize calendar if it exists on the page
 */
function initCalendar() {
  const calendarContainer = document.querySelector('.calendar-container');
  if (!calendarContainer) return;
  
  // Initialize calendar state
  const today = new Date();
  const currentMonth = {
    date: new Date(today.getFullYear(), today.getMonth(), 1),
    events: []
  };

  // Render initial calendar
  renderCalendar(currentMonth.date);
  
  // Add event listeners for month navigation
  const prevMonthBtn = document.querySelector('.calendar-prev-month');
  const nextMonthBtn = document.querySelector('.calendar-next-month');
  const todayBtn = document.querySelector('.calendar-today');
  
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      currentMonth.date = new Date(currentMonth.date.getFullYear(), currentMonth.date.getMonth() - 1, 1);
      renderCalendar(currentMonth.date);
    });
  }
  
  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
      currentMonth.date = new Date(currentMonth.date.getFullYear(), currentMonth.date.getMonth() + 1, 1);
      renderCalendar(currentMonth.date);
    });
  }
  
  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      currentMonth.date = new Date(today.getFullYear(), today.getMonth(), 1);
      renderCalendar(currentMonth.date);
    });
  }
  
  // Listen for routine data updates
  document.addEventListener('dashboardDataReady', function(event) {
    if (event.detail && event.detail.routineData) {
      currentMonth.events = event.detail.routineData;
      renderCalendar(currentMonth.date);
    }
  });
  
  // Listen for routine step updates
  document.addEventListener('routineStepUpdated', function() {
    // Refresh calendar data if needed
    fetchCalendarEvents();
  });
}

/**
 * Render the calendar for a given month
 * @param {Date} date - Date object representing the month to display
 */
function renderCalendar(date) {
  const calendarContainer = document.querySelector('.calendar-container');
  if (!calendarContainer) return;
  
  const month = date.getMonth();
  const year = date.getFullYear();
  
  // Update month/year display
  const monthYearElement = document.querySelector('.calendar-month-year');
  if (monthYearElement) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    monthYearElement.textContent = `${monthNames[month]} ${year}`;
  }
  
  // Get the first day of the month
  const firstDay = new Date(year, month, 1);
  
  // Get the last day of the month
  const lastDay = new Date(year, month + 1, 0);
  
  // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
  const startingDayOfWeek = firstDay.getDay();
  
  // Calculate number of days in the month
  const daysInMonth = lastDay.getDate();
  
  // Create calendar grid
  const calendarGrid = document.querySelector('.calendar-grid');
  if (!calendarGrid) return;
  
  // Clear previous calendar
  calendarGrid.innerHTML = '';
  
  // Add day headers (Sun, Mon, etc.)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  daysOfWeek.forEach(day => {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day-header';
    dayElement.textContent = day;
    calendarGrid.appendChild(dayElement);
  });
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    calendarGrid.appendChild(emptyDay);
  }
  
  // Add days of the month
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    // Check if it's today
    if (isCurrentMonth && day === today.getDate()) {
      dayElement.classList.add('today');
    }
    
    const dateNum = document.createElement('span');
    dateNum.className = 'calendar-date-num';
    dateNum.textContent = day;
    dayElement.appendChild(dateNum);
    
    // Add event indicators if there are events on this day
    const currentDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const eventsForDay = window.dashboardData?.routineData?.filter(event => 
      event.date === currentDate
    );
    
    if (eventsForDay && eventsForDay.length > 0) {
      const eventContainer = document.createElement('div');
      eventContainer.className = 'calendar-event-indicators';
      
      eventsForDay.forEach(event => {
        const eventIndicator = document.createElement('span');
        eventIndicator.className = 'calendar-event-indicator';
        eventIndicator.style.backgroundColor = getCssVar('--color-primary') || '#4caf50';
        
        if (event.completed) {
          eventIndicator.classList.add('completed');
        }
        
        eventContainer.appendChild(eventIndicator);
      });
      
      dayElement.appendChild(eventContainer);
      
      // Make clickable if there are events
      dayElement.classList.add('has-events');
      dayElement.setAttribute('data-date', currentDate);
      dayElement.addEventListener('click', () => showDayDetail(currentDate));
    }
    
    calendarGrid.appendChild(dayElement);
  }
}

/**
 * Show detail for a specific day
 * @param {string} dateString - Date in YYYY-MM-DD format
 */
function showDayDetail(dateString) {
  // Implementation would go here
  console.log('Show events for date:', dateString);
}

/**
 * Fetch calendar events from the server
 */
function fetchCalendarEvents() {
  // Implementation would go here
}

/* ==========================================================================
   ROUTINES FUNCTIONALITY
   Handles routine steps management
   ========================================================================== */

/**
 * Initialize routines functionality
 */
function initRoutines() {
  // Setup routine step form listeners
  const routineForms = document.querySelectorAll('.routine-form');
  routineForms.forEach(form => {
    form.addEventListener('submit', handleRoutineFormSubmit);
  });
  
  // Add event listeners for routine step checkboxes
  document.addEventListener('click', function(event) {
    const step = event.target.closest('.routine-step');
    if (step && event.target.classList.contains('step-checkbox')) {
      handleRoutineStepUpdate(step);
    }
  });
}

/**
 * Handles routine step updates (completion status)
 * @param {HTMLElement} step - The routine step element
 */
function handleRoutineStepUpdate(step) {
  const stepId = step.dataset.stepId;
  const isChecked = step.querySelector('.step-checkbox').checked;
  
  // Make AJAX request to update step completion status
  fetch(`/routines/update_step/${stepId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken(),
    },
    body: JSON.stringify({
      completed: isChecked
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    if (data.status === 'success') {
      step.classList.toggle('completed', isChecked);
      showSuccessMessage('Routine step updated');
      
      // Dispatch event for calendar/dashboard updates
      const event = new CustomEvent('routineStepUpdated', {
        detail: { stepId, completed: isChecked }
      });
      document.dispatchEvent(event);
    } else {
      showErrorMessage('Could not update routine step');
    }
  })
  .catch(error => {
    console.error('Error updating routine step:', error);
    showErrorMessage('Failed to update routine step');
  });
}

/**
 * Handles routine form submission
 * @param {Event} event - The form submission event
 */
function handleRoutineFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  fetch(form.action, {
    method: form.method,
    body: formData,
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      showSuccessMessage(data.message || 'Routine saved successfully');
      
      // If redirect URL provided, navigate to it
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        // Otherwise, update the UI as needed
        if (data.html) {
          const container = document.querySelector('#routines-container');
          if (container) {
            container.innerHTML = data.html;
            initRoutines(); // Re-initialize listeners for new content
          }
        }
      }
    } else {
      showErrorMessage(data.message || 'Error saving routine');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showErrorMessage('An error occurred while processing your request');
  });
}

/* ==========================================================================
   PRODUCTS FUNCTIONALITY
   Handles product management
   ========================================================================== */

/**
 * Initialize products functionality
 */
function initProducts() {
  initProductForms();
  initProductSearch();
  initProductDeleteButtons();
}

/**
 * Initializes product form submissions
 */
function initProductForms() {
  const productForms = document.querySelectorAll('.product-form');
  productForms.forEach(form => {
    form.addEventListener('submit', handleProductFormSubmit);
  });
}

/**
 * Handles product form submission
 * @param {Event} event - The form submission event
 */
function handleProductFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  // Show loading state
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Saving...';
  submitButton.disabled = true;
  
  fetch(form.action, {
    method: form.method,
    body: formData,
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      showSuccessMessage(data.message || 'Product saved successfully');
      
      // If redirect URL provided, navigate to it
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      }
    } else {
      showErrorMessage(data.message || 'Error saving product');
      
      // If form errors were returned, update the form to show them
      if (data.errors) {
        Object.entries(data.errors).forEach(([field, errors]) => {
          const fieldElement = form.querySelector(`[name="${field}"]`);
          if (fieldElement) {
            fieldElement.classList.add('is-invalid');
            
            // Create or update error message
            let errorElement = form.querySelector(`#${field}-error`);
            if (!errorElement) {
              errorElement = document.createElement('div');
              errorElement.id = `${field}-error`;
              errorElement.className = 'invalid-feedback';
              fieldElement.parentNode.appendChild(errorElement);
            }
            errorElement.textContent = errors.join(' ');
          }
        });
      }
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showErrorMessage('An error occurred while processing your request');
  })
  .finally(() => {
    // Restore button state
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  });
}

/**
 * Initializes product search functionality
 */
function initProductSearch() {
  const searchInput = document.querySelector('#product-search');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', debounce(function() {
    const searchTerm = this.value.trim();
    const productsContainer = document.querySelector('#products-list');
    
    if (!productsContainer) return;
    
    if (searchTerm.length < 2) {
      // Show all products if search term is too short
      document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = '';
      });
      return;
    }
    
    // Filter products based on search term
    document.querySelectorAll('.product-card').forEach(card => {
      const productName = card.querySelector('.product-name').textContent.toLowerCase();
      const productBrand = card.querySelector('.product-brand')?.textContent.toLowerCase() || '';
      
      if (productName.includes(searchTerm.toLowerCase()) || productBrand.includes(searchTerm.toLowerCase())) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }, 300));
}

/**
 * Initializes product delete buttons
 */
function initProductDeleteButtons() {
  document.querySelectorAll('.delete-product-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (confirm('Are you sure you want to delete this product?')) {
        const productId = this.dataset.productId;
        
        fetch(`/products/delete/${productId}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            // Remove the product element from the DOM
            const productElement = document.querySelector(`.product-card[data-product-id="${productId}"]`);
            if (productElement) {
              productElement.remove();
            }
            showSuccessMessage('Product deleted successfully');
          } else {
            showErrorMessage(data.message || 'Error deleting product');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          showErrorMessage('An error occurred while deleting the product');
        });
      }
      });
    });
  }

/* ==========================================================================
   COMMON UI FUNCTIONALITY
   Shared UI elements and functionality
   ========================================================================== */

/**
 * Initialize page-specific functions based on the current page
 */
function initPageSpecificFunctions() {
  // Dashboard page initialization
  if (document.querySelector('.dashboard-page')) {
    initCalendar();
    initRoutines();
  }
  
  // Product page initialization
  if (document.querySelector('.products-page')) {
    initProducts();
  }

  // Combined pages that need both routines and products
  if (document.querySelector('.routines-products-page')) {
    initRoutines();
    initProducts();
  }
}

/**
 * Setup common UI elements used across the application
 */
function setupCommonElements() {
  // Setup any tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(tooltipTriggerEl => {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Setup popovers if any
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.forEach(popoverTriggerEl => {
    new bootstrap.Popover(popoverTriggerEl);
  });
  
  // Setup routine step dropdowns for profile page
  setupRoutineStepDropdowns();
}

/**
 * Setup routine step dropdowns
 */
function setupRoutineStepDropdowns() {
  const stepSelects = document.querySelectorAll('.routine-step-select');
  if (!stepSelects.length) return;

  stepSelects.forEach(select => {
    select.addEventListener('change', function() {
      const selectedOption = this.options[this.selectedIndex];
      const productField = document.querySelector('#product-for-' + this.dataset.stepId);
      
      if (productField) {
        productField.value = selectedOption.dataset.productId || '';
      }
    });
  })
};