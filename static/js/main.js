

// ...existing code...
// Initialize routine step dropdowns for profile page (must be after function definition)
setupRoutineStepDropdowns();
/**
 * Theme Toggle Functionality
 * Handles dark/light theme switching with localStorage persistence
 */
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  
  // Check for saved theme preference or default to 'light'
  const currentTheme = localStorage.getItem('theme') || 'light';
  
  if (currentTheme === 'dark') {
    body.classList.add('dark-theme');
    themeToggle.textContent = '☀️';
  } else {
    themeToggle.textContent = '🌙';
  }
  
  themeToggle.addEventListener('click', function() {
    body.classList.toggle('dark-theme');
    
    if (body.classList.contains('dark-theme')) {
      themeToggle.textContent = '☀️';
      localStorage.setItem('theme', 'dark');
    } else {
      themeToggle.textContent = '🌙';
      localStorage.setItem('theme', 'light');
    }
  });
});

/**
 * Helper to read CSS custom properties from the document root
 * Returns the value as a string (raw), or null if not found
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
 * Mobile Hamburger Menu Functionality
 * Handles responsive navigation menu toggle
 */
document.addEventListener('DOMContentLoaded', function() {
  const hamburgerMenu = document.getElementById('hamburger-menu');
  const navLinks = document.getElementById('nav-links');
  
  if (hamburgerMenu && navLinks) {
    hamburgerMenu.addEventListener('click', function() {
      // Toggle active class on hamburger button
      hamburgerMenu.classList.toggle('active');
      
      // Toggle active class on nav links
      navLinks.classList.toggle('active');
      
      // Prevent body scroll when menu is open
      if (navLinks.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
    
    // Close menu when clicking on nav links
    const navLinkItems = navLinks.querySelectorAll('a');
    navLinkItems.forEach(link => {
      link.addEventListener('click', function() {
        hamburgerMenu.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      const isClickInsideNav = navLinks.contains(event.target) || 
                              hamburgerMenu.contains(event.target);
      
      if (!isClickInsideNav && navLinks.classList.contains('active')) {
        hamburgerMenu.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
    
    // Close menu on window resize if screen becomes larger
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
        hamburgerMenu.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
});

/**
 * Simple Calendar Component
 * Displays a monthly calendar with routine events and status indicators
 */
(function() {
  const root = document.querySelector('#calendar');
  if (!root) return;

  const events = (window.ROUTINE_EVENTS && Array.isArray(window.ROUTINE_EVENTS)) ? window.ROUTINE_EVENTS : [];
  const eventsByDate = {};
  
  events.forEach(function(ev) {
    if (!ev || !ev.date) return;
    eventsByDate[ev.date] = ev;
  });

  const state = {
    year: (new Date()).getFullYear(),
    month: (new Date()).getMonth() // 0-indexed
  };

  /**
   * Renders the calendar interface
   */
  function render() {
    root.innerHTML = '';

    // Create header with navigation
    const header = document.createElement('div');
    header.className = 'sc-header';
    
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '<';
    prevBtn.addEventListener('click', function() { changeMonth(-1); });
    
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '>';
    nextBtn.addEventListener('click', function() { changeMonth(1); });
    
    const title = document.createElement('div');
    title.className = 'sc-title';
    title.textContent = new Date(state.year, state.month).toLocaleString(undefined, { 
      month: 'long', 
      year: 'numeric' 
    });

    header.appendChild(prevBtn);
    header.appendChild(title);
    header.appendChild(nextBtn);
    root.appendChild(header);

    // Create days of week header
    const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dowRow = document.createElement('div');
    dowRow.className = 'sc-dow';
    
    dow.forEach(function(d) {
      const cell = document.createElement('div');
      cell.className = 'sc-dow-cell';
      cell.textContent = d;
      dowRow.appendChild(cell);
    });
    root.appendChild(dowRow);

    // Create calendar grid
    const grid = document.createElement('div');
    grid.className = 'sc-grid';

    const first = new Date(state.year, state.month, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(state.year, state.month + 1, 0).getDate();

    // Add empty cells for days before month start
    for (let i = 0; i < startWeekday; i++) {
      const blank = document.createElement('div');
      blank.className = 'sc-cell sc-other';
      grid.appendChild(blank);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = toDateKey(state.year, state.month, day);
      const cell = document.createElement('div');
      cell.className = 'sc-cell sc-day';
      cell.dataset.date = dateKey;
      cell.id = 'calendar-day-' + dateKey;

      const num = document.createElement('div');
      num.className = 'sc-day-num';
      num.textContent = day;
      cell.appendChild(num);

      // Add status icon
      const icon = document.createElement('div');
      icon.className = 'sc-day-icon';
      
      const ev = eventsByDate[dateKey];
      
      // Check if the date is in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      const cellDate = new Date(state.year, state.month, day);
      const isFutureDay = cellDate > today;
      
      // Set status indicators based on event data
        if (ev) {
        if (ev.status === 'completed') {
          icon.textContent = '🟢';
          cell.classList.add('sc-day-completed');
        } else if (ev.status === 'not_done') {
          if (isFutureDay) {
            // Future days - add class but leave empty (no marker)
            cell.classList.add('sc-day-future');
            icon.textContent = '';
          } else {
            // Past missed days - red dot
            icon.textContent = '•';
            const errorColor = getCssVar('--error-color');
            if (errorColor) icon.style.color = errorColor;
            icon.style.fontSize = '2rem';
            cell.classList.add('sc-day-not-done');
          }
        } else if (ev.status === 'morning') {
          icon.textContent = '☀️';
          cell.classList.add('sc-day-morning');
        } else if (ev.status === 'evening') {
          icon.textContent = '🌙';
          cell.classList.add('sc-day-evening');
        }
      } else if (isFutureDay) {
        // Future days with no events
        cell.classList.add('sc-day-future');
      }
      
      cell.appendChild(icon);

      cell.addEventListener('click', function(e) {
        showDetails(this.dataset.date);
      });

      grid.appendChild(cell);
    }

    // Apply heatmap coloring based on routine events
    if (window.ROUTINE_EVENTS && Array.isArray(window.ROUTINE_EVENTS)) {
      window.ROUTINE_EVENTS.forEach(function(event) {
        const dayElem = document.getElementById('calendar-day-' + event.date);
        if (dayElem) {
          dayElem.classList.remove('sc-day-completed', 'sc-day-not-done', 'sc-day-morning', 'sc-day-evening');
          
          if (event.status === 'completed') {
            dayElem.classList.add('sc-day-completed');
          } else if (event.status === 'morning') {
            dayElem.classList.add('sc-day-morning');
          } else if (event.status === 'evening') {
            dayElem.classList.add('sc-day-evening');
          } else {
            dayElem.classList.add('sc-day-not-done');
          }
        }
      });
    }

    // Highlight weekly step reminders
    let weeklyDueDates = [];
    try {
      weeklyDueDates = JSON.parse('{{ weekly_due_dates_json|default:"[]"|escapejs }}');
    } catch (e) {
      // Ignore parsing errors
    }
    
    weeklyDueDates.forEach(function(item) {
      const dayElem = document.getElementById('calendar-day-' + item.date);
      if (dayElem) {
        const weeklyRgb = getCssVar('--accent-color-bg-lighter-rgb');
        const weeklyBorder = weeklyRgb ? ('rgb(' + weeklyRgb + ')') : getCssVar('--accent-step-weekly');
        if (weeklyBorder) dayElem.style.border = '2px solid ' + weeklyBorder;
        dayElem.title = 'Weekly step: ' + item.step_name + ' (' + item.routine_type + ')';
      }
    });

    // Highlight monthly step reminders
    let monthlyDueDates = [];
    try {
      monthlyDueDates = JSON.parse('{{ monthly_due_dates_json|default:"[]"|escapejs }}');
    } catch (e) {
      // Ignore parsing errors
    }
    
    monthlyDueDates.forEach(function(item) {
      const dayElem = document.getElementById('calendar-day-' + item.date);
      if (dayElem) {
        const monthlyBorder = getCssVar('--accent-step-monthly');
        if (monthlyBorder) dayElem.style.border = '2px solid ' + monthlyBorder;
        dayElem.title = 'Monthly step: ' + item.step_name + ' (' + item.routine_type + ')';
      }
    });

    // Add trailing empty cells to complete the grid
    const totalCells = startWeekday + daysInMonth;
    const trailing = (7 - (totalCells % 7)) % 7;
    for (let t = 0; t < trailing; t++) {
      const blank2 = document.createElement('div');
      blank2.className = 'sc-cell sc-other';
      grid.appendChild(blank2);
    }

    root.appendChild(grid);

    // Add details section
    const details = document.createElement('div');
    details.className = 'sc-details';
    details.style.display = 'none';
    root.appendChild(details);
  }

  /**
   * Shows event details for a specific date
   * @param {string} dateKey - Date in YYYY-MM-DD format
   */
  function showDetails(dateKey) {
    const details = root.querySelector('.sc-details');
    const ev = eventsByDate[dateKey];
    details.innerHTML = '';

    const parts = dateKey.split('-');
    const display = parts[2] + '-' + parts[1] + '-' + parts[0].slice(2);
    const heading = document.createElement('h4');
    heading.textContent = display;
    details.appendChild(heading);

    let found = false;
    
    // Show weekly routine info if present
    if (window.weeklyDueDates && Array.isArray(window.weeklyDueDates)) {
      window.weeklyDueDates.forEach(function(item) {
        if (item.date === dateKey) {
          const div = document.createElement('div');
          div.className = 'sc-event';
          div.innerHTML = '<b>Weekly Routine Step:</b> ' + item.step_name + 
                        ' <span class="badge badge-warning">(' + item.routine_type + ')</span>';
          details.appendChild(div);
          found = true;
        }
      });
    }
    
    // Show monthly routine info if present
    if (window.monthlyDueDates && Array.isArray(window.monthlyDueDates)) {
      window.monthlyDueDates.forEach(function(item) {
        if (item.date === dateKey) {
          const div = document.createElement('div');
          div.className = 'sc-event';
          div.innerHTML = '<b>Monthly Routine Step:</b> ' + item.step_name + 
                        ' <span class="badge badge-info">(' + item.routine_type + ')</span>';
          details.appendChild(div);
          found = true;
        }
      });
    }

    if (!ev && !found) {
      const p = document.createElement('p');
      p.textContent = 'No events';
      details.appendChild(p);
    } else if (ev) {
      const div = document.createElement('div');
      div.className = 'sc-event';
      
      const name = document.createElement('div');
      name.textContent = ev.eventName || '(Unnamed)';
      
      const status = document.createElement('div');
      status.textContent = (ev.status === 'completed') ? 'Completed' : 'Missed';
      status.className = (ev.status === 'completed') ? 'sc-ok' : 'sc-miss';
      
      div.appendChild(name);
      div.appendChild(status);
      details.appendChild(div);
    }
    
    details.style.display = 'block';
  }

  /**
   * Converts year, month, day to date key string
   * @param {number} y - Year
   * @param {number} m - Month (0-indexed)
   * @param {number} d - Day
   * @returns {string} Date in YYYY-MM-DD format
   */
  function toDateKey(y, m, d) {
    const mm = (m + 1).toString().padStart(2, '0');
    const dd = d.toString().padStart(2, '0');
    return y + '-' + mm + '-' + dd;
  }

  /**
   * Changes the displayed month
   * @param {number} delta - Number of months to change (+1 or -1)
   */
  function changeMonth(delta) {
    state.month += delta;
    if (state.month < 0) { 
      state.month = 11; 
      state.year -= 1; 
    }
    if (state.month > 11) { 
      state.month = 0; 
      state.year += 1; 
    }
    render();
  }

  // Initialize calendar
  render();
})();

/**
 * Product Suggestions for Add Product Form
 * Handles category browsing and auto-filling of product forms
 */
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    const categorySelect = document.getElementById('category-browse');
    const loadingDiv = document.getElementById('suggestions-loading');
    const suggestionsDiv = document.getElementById('product-suggestions');
    const suggestionsGrid = document.getElementById('suggestions-grid');
    const productForm = document.getElementById('product-form');
    
    // Only run if we're on the product form page
    if (!categorySelect || !productForm) return;
    
    /**
     * Handles category selection and fetches products
     */
    categorySelect.addEventListener('change', function() {
      const category = this.value;
      
      if (!category) {
        suggestionsDiv.style.display = 'none';
        return;
      }
      
      // Show loading state
      loadingDiv.style.display = 'block';
      suggestionsDiv.style.display = 'none';
      suggestionsGrid.innerHTML = '';
      
      // Fetch products from API
  fetch('/products/api/browse/' + category + '/')
        .then(function(response) {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then(function(products) {
          loadingDiv.style.display = 'none';
          
            if (products.length === 0) {
            suggestionsGrid.innerHTML = '<p class="muted-message">' +
              'No products found for this category. Try importing some first!</p>';
          } else {
            // Create product cards
            products.forEach(function(product) {
              const card = createProductCard(product);
              suggestionsGrid.appendChild(card);
            });
          }
          
          suggestionsDiv.style.display = 'block';
        })
        .catch(function(error) {
          console.error('Error fetching products:', error);
          loadingDiv.style.display = 'none';
          suggestionsGrid.innerHTML = '<p class="error-message">' +
            'Error loading suggestions. Please try again.</p>';
          suggestionsDiv.style.display = 'block';
        });
    });
    
    /**
     * Creates a product card element
     * @param {Object} product - Product data object
     * @returns {HTMLElement} Product card element
     */
    function createProductCard(product) {
      const card = document.createElement('div');
      card.className = 'suggestion-card';
      card.style.cursor = 'pointer';
      
      const productTypeDisplay = product.product_type_display || product.product_type;
      
      card.innerHTML = 
        '<h5>' + escapeHtml(product.name) + '</h5>' +
        '<p><strong>Brand:</strong> ' + escapeHtml(product.brand) + '</p>' +
        (product.ingredients ? 
          '<p><strong>Key ingredients:</strong> ' + escapeHtml(product.ingredients.substring(0, 100)) + 
          (product.ingredients.length > 100 ? '...' : '') + '</p>' : '') +
        '<div class="product-type">' + escapeHtml(productTypeDisplay) + '</div>';
      
      // Add click handler to auto-fill form
      card.addEventListener('click', function() {
        fillProductForm(product);
        
        // Scroll to form and highlight it briefly
        productForm.scrollIntoView({behavior: 'smooth', block: 'center'});
        var highlightColor = getCssVar('--accent-color-bg-lighter');
        if (highlightColor) {
          productForm.style.backgroundColor = highlightColor;
          setTimeout(function() { productForm.style.backgroundColor = ''; }, 2000);
        }
      });
      
      return card;
    }
    
    /**
     * Fills the product form with selected product data
     * @param {Object} product - Product data object
     */
    function fillProductForm(product) {
      // Fill basic fields
      setFormField('name', product.name);
      setFormField('brand', product.brand);
      setFormField('product_type', product.product_type);
      
      // Fill optional fields if they exist
      if (product.ingredients) {
        setFormField('ingredients', product.ingredients);
      }
      if (product.description) {
        setFormField('description', product.description);
      }
      
      // Reset category dropdown
      categorySelect.value = '';
      suggestionsDiv.style.display = 'none';
      
      // Focus on the first form field
      const nameField = document.querySelector('input[name="name"]');
      if (nameField) nameField.focus();
    }
    
    /**
     * Helper to set form field values
     * @param {string} fieldName - Name of the form field
     * @param {string} value - Value to set
     */
    function setFormField(fieldName, value) {
      const field = document.querySelector('input[name="' + fieldName + '"], select[name="' + fieldName + '"], textarea[name="' + fieldName + '"]');
      if (field) {
        field.value = value;
        
        // Trigger change event for any listeners
        const event = new Event('change', { bubbles: true });
        field.dispatchEvent(event);
      }
    }
    
    /**
     * Simple HTML escaping for security
     * @param {string} text - Text to escape
     * @returns {string} Escaped HTML text
     */
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  });
})();

/**
 * Dashboard Progress Bar Functionality
 * Sets progress bar width from data attributes
 */
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
      const progress = progressBar.getAttribute('data-progress') || 0;
      progressBar.style.width = progress + '%';
    }
  });
})();

/**
 * Calendar Data Initialization
 * Sets up routine events and expiry events for calendar display
 */
(function() {
  // Initialize routine events
  if (typeof window.ROUTINE_EVENTS === 'undefined') {
    window.ROUTINE_EVENTS = {};
  }
  
  // Initialize expiry events
  if (typeof window.EXPIRY_EVENTS === 'undefined') {
    window.EXPIRY_EVENTS = [];
  }

  // Listen for data ready event from dashboard template
  document.addEventListener('dashboardDataReady', function() {
    console.log('Dashboard data loaded and ready');
    // Any additional processing can go here
  });
})();

/**
 * Dashboard Step Management
 * Handles individual step completion and routine completion
 */
(function() {
  /**
   * Toggles completion status of an individual routine step
   * @param {string|number} stepId - The ID of the step to toggle
   */
  window.toggleStepCompletion = function(stepId) {
    // Basic validation
    if (!stepId) {
      alert('Error: Step not found');
      return;
    }

    console.log('Toggling completion for step ID:', stepId);

    // Get CSRF token
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    if (!csrfToken) {
      alert('Error: Security token not found');
      return;
    }

    // Send request to Django backend
    fetch('/routines/toggle-step/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken.value
      },
      body: JSON.stringify({
        step_id: stepId
      })
    })
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(function(data) {
      if (data.success) {
        console.log('Success:', data.message);
        // Update the progress display without full page reload
        updateProgressDisplay();
      } else {
        // Show error and revert checkbox
        alert('Error: ' + (data.error || 'Unknown error occurred'));
        // Find the checkbox and revert its state
        const checkbox = document.querySelector(`[data-step-id="${stepId}"]`);
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
        }
      }
    })
    .catch(function(error) {
      console.error('Network error:', error);
      alert('Error: Could not connect to server');
      // Revert checkbox state on error
      const checkbox = document.querySelector(`[data-step-id="${stepId}"]`);
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
      }
    });
  };

  /**
   * Updates the progress display without full page reload
   */
  function updateProgressDisplay() {
    // Count completed checkboxes
    const totalCheckboxes = document.querySelectorAll('.step-checkbox').length;
    const completedCheckboxes = document.querySelectorAll('.step-checkbox:checked').length;
    
    // Update progress percentage
    const progressPercent = totalCheckboxes > 0 ? Math.round((completedCheckboxes / totalCheckboxes) * 100) : 0;
    
    // Update the progress display in the DOM
    const progressElement = document.querySelector('.progress-stat h3');
    if (progressElement) {
      progressElement.textContent = progressPercent + '%';
    }
    
    const progressText = document.querySelector('.progress-stat p');
    if (progressText) {
      progressText.textContent = `${completedCheckboxes} of ${totalCheckboxes} steps completed today`;
    }
    
    // Update progress bar if it exists
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
      progressBar.style.width = progressPercent + '%';
    }
  }

  /**
   * Marks an entire routine as complete
   * @param {string|number} routineId - The ID of the routine to mark complete
   * @param {string} routineType - The type of routine (morning, evening, weekly, monthly)
   */
  window.markRoutineComplete = function(routineId, routineType) {
    // Basic validation
    if (!routineId) {
      alert('Error: Routine not found');
      return;
    }

    console.log('Marking ' + routineType + ' routine as complete...');

    // Get CSRF token
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    if (!csrfToken) {
      alert('Error: Security token not found');
      return;
    }

    // Send request to Django backend
    fetch('/routines/mark-complete/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken.value
      },
      body: JSON.stringify({
        routine_id: routineId,
        routine_type: routineType
      })
    })
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(function(data) {
      if (data.success) {
        console.log('Success:', data.message);
        window.location.reload();
      } else {
        alert('Error: ' + (data.error || 'Unknown error occurred'));
      }
    })
    .catch(function(error) {
      console.error('Network error:', error);
      alert('Error: Could not connect to server');
    });
  };

  // Initialize event listeners when page loads
  document.addEventListener('DOMContentLoaded', function() {
    // Find all step checkboxes and add event listeners
    const checkboxes = document.querySelectorAll('.step-checkbox');
    checkboxes.forEach(function(checkbox) {
      checkbox.addEventListener('change', function() {
        const stepId = this.getAttribute('data-step-id');
        if (stepId) {
          toggleStepCompletion(stepId);
        }
      });
    });
  });
})();

/**
 * Routine Step Dropdowns for Profile Page
 * Dynamically updates step options based on routine type
 * Supports all 8 routine types with custom input capability
 * Used in templates/users/profile.html
 */
function setupRoutineStepDropdowns() {
  const stepOptionsByType = {
    morning: [
      "Gentle Cleanse",
      "Toner",
      "Essence", 
      "Vitamin C Serum",
      "Light Moisturizer",
      "Eye Cream",
      "SPF / Sunscreen"
    ],
    evening: [
      "Double Cleanse",
      "Toner",
      "Essence",
      "Treatment Serum",
      "Retinol / Acid Treatment",
      "Eye Cream",
      "Moisturizer",
      "Face Oil",
      "Spot Treatment",
      "Lip Treatment"
    ],
    weekly: [
      "Deep Cleanse",
      "Exfoliation",
      "Clay Mask",
      "Hydrating Mask",
      "Hair Mask",
      "Body Scrub",
      "Intensive Treatment"
    ],
    monthly: [
      "Professional Treatment",
      "Deep Repair Mask",
      "Intensive Serum",
      "Barrier Repair",
      "Reset Treatment"
    ],
    hair: [
      "Clarifying Shampoo",
      "Shampoo",
      "Conditioner",
      "Deep Hair Mask",
      "Leave-in Treatment",
      "Hair Oil",
      "Scalp Treatment",
      "Heat Protectant"
    ],
    body: [
      "Body Wash",
      "Body Scrub",
      "Body Lotion",
      "Body Oil",
      "Deodorant",
      "Hand Cream",
      "Foot Treatment"
    ],
    special: [
      "Prep Treatment",
      "Priming Serum",
      "Glow Treatment",
      "Hydration Boost",
      "Setting Treatment",
      "Special Occasion Mask"
    ],
    seasonal: [
      "Season Prep",
      "Climate Adjustment",
      "Barrier Repair",
      "Humidity Control",
      "Weather Protection",
      "Transition Treatment"
    ]
  };

  function setStepOptions(routineType) {
    const options = stepOptionsByType[routineType] || stepOptionsByType.morning;
    
    // Find all step selects in the current form (works with dynamic steps)
    const stepSelects = document.querySelectorAll('.step-item select[id^="step"]');
    
    stepSelects.forEach((select, index) => {
      if (select) {
        // Build options HTML with custom option
        let optionsHTML = '<option value="">Select step</option>';
        optionsHTML += options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
        optionsHTML += '<option value="custom">✏️ Custom Step...</option>';
        
        select.innerHTML = optionsHTML;
        
        // Remove existing event listeners to avoid duplicates
        select.removeEventListener('change', select._stepHandler);
        
        // Add event listener for custom option
        select._stepHandler = function() {
          const stepNumber = select.id.replace('step', '');
          handleStepSelection(this, stepNumber);
        };
        select.addEventListener('change', select._stepHandler);
      }
    });
  }
  
  function handleStepSelection(selectElement, stepNumber) {
    const customInputId = `custom-step${stepNumber}`;
    let customInput = document.getElementById(customInputId);
    
    if (selectElement.value === 'custom') {
      // Create custom input if it doesn't exist
      if (!customInput) {
        customInput = document.createElement('input');
        customInput.type = 'text';
        customInput.id = customInputId;
        customInput.name = `step${stepNumber}`;
        customInput.className = 'form-control custom-step-input';
        customInput.placeholder = 'Enter custom step name...';
        customInput.style.marginTop = '5px';
        
        // Insert after the select
        selectElement.parentNode.insertBefore(customInput, selectElement.nextSibling);
      }
      
      // Hide select, show input, focus input
      selectElement.style.display = 'none';
      customInput.style.display = 'block';
      customInput.focus();
      
      // Add event listener to go back to select if input is empty and loses focus
      customInput.addEventListener('blur', function() {
        if (!this.value.trim()) {
          selectElement.style.display = 'block';
          this.style.display = 'none';
          selectElement.value = '';
        }
      });
      
    } else {
      // Remove custom input if it exists and hide it
      if (customInput) {
        customInput.style.display = 'none';
        customInput.value = '';
      }
      selectElement.style.display = 'block';
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    const routineType = document.getElementById('routine_type');
    if (routineType && document.querySelector('.step-item select[id^="step"]')) {
      setStepOptions(routineType.value);
      routineType.addEventListener('change', function() {
        setStepOptions(this.value);
      });
    }
    
    // Initialize dynamic steps if step containers exist
    if (document.querySelector('.step-item')) {
      const initDynamicSteps = setupDynamicSteps();
      initDynamicSteps();
    }
  });
}

/**
 * Dynamic Step Management (Add/Remove Steps 1-10)
 * Handles adding and removing steps without numbering
 */
function setupDynamicSteps() {
  let currentStepCount = 4; // Start with 4 steps
  const maxSteps = 10;
  const minSteps = 1;
  
  function updateStepCount() {
    const stepCountElement = document.querySelector('.step-count');
    if (stepCountElement) {
      stepCountElement.textContent = `${currentStepCount} step${currentStepCount !== 1 ? 's' : ''}`;
    }
    
    // Update button states
    const addBtn = document.getElementById('add-step-btn');
    const removeBtn = document.getElementById('remove-step-btn');
    
    if (addBtn) {
      addBtn.disabled = currentStepCount >= maxSteps;
    }
    
    if (removeBtn) {
      removeBtn.disabled = currentStepCount <= minSteps;
    }
  }
  
  function createStepItem(stepNumber) {
    const stepItem = document.createElement('div');
    stepItem.className = 'step-item';
    stepItem.setAttribute('data-step', stepNumber);
    
    stepItem.innerHTML = `
      <select id="step${stepNumber}" name="step${stepNumber}" class="step-select"></select>
    `;
    
    return stepItem;
  }
  
  function addStep() {
    if (currentStepCount >= maxSteps) return;
    
    currentStepCount++;
    const container = document.getElementById('steps-container');
    const newStep = createStepItem(currentStepCount);
    container.appendChild(newStep);
    
    // Populate the new step with options based on current routine type
    const routineType = document.getElementById('routine_type');
    if (routineType && routineType.value) {
      // Apply step options to the new step
      setStepOptions(routineType.value);
    }
    
    updateStepCount();
  }
  
  function removeLastStep() {
    if (currentStepCount <= minSteps) return; // Don't allow removing when at minimum
    
    // Remove the last step
    const lastStep = document.querySelector(`.step-item[data-step="${currentStepCount}"]`);
    if (lastStep) {
      lastStep.remove();
      currentStepCount--;
      updateStepCount();
    }
  }
  
  
  // Initialization function to be called from main DOMContentLoaded
  function initializeDynamicSteps() {
    // Set up add step button
    const addBtn = document.getElementById('add-step-btn');
    if (addBtn) {
      addBtn.addEventListener('click', addStep);
    }
    
    // Set up remove step button
    const removeBtn = document.getElementById('remove-step-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', removeLastStep);
    }
    
    updateStepCount();
  }
  
  // Return initialization function for external access
  return initializeDynamicSteps;
}

/* ==========================================================================
   PROFILE PAGE JAVASCRIPT
   ========================================================================== */

/**
 * Initialize user products data for JavaScript
 * Converts Django JSON data to format usable by profile page features
 */
function initializeProfileData() {
  try {
    // Get user products from the JSON script tag
    const userProductsData = document.getElementById('user-products-data');
    if (userProductsData) {
      window.USER_PRODUCTS = JSON.parse(userProductsData.textContent);
      // Convert to desired format: [{id:..., label:...}, ...]
      window.USER_PRODUCTS = window.USER_PRODUCTS.map(function(p) {
        return { id: p[0], label: p[1] + ' - ' + p[2] };
      });
      document.dispatchEvent(new CustomEvent('profileDataReady'));
    }
  } catch (e) {
    console.error('Error initializing profile data:', e);
    window.USER_PRODUCTS = [];
  }
}

/**
 * Inline editing functionality for routines
 */
function enableInlineEditing() {
  // Handle edit button clicks
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('edit-btn')) {
      const routineId = e.target.getAttribute('data-routine-id');
      const listItem = document.querySelector(`li[data-routine-id="${routineId}"]`);
      
      if (listItem) {
        // Hide display mode, show edit form
        const displayDiv = listItem.querySelector('.routine-display');
        const editDiv = listItem.querySelector('.routine-edit-form');
        
        if (displayDiv && editDiv) {
          displayDiv.style.display = 'none';
          editDiv.style.display = 'block';
        }
      }
    }
    
    // Handle cancel button clicks
    if (e.target.classList.contains('cancel-btn')) {
      const listItem = e.target.closest('li[data-routine-id]');
      if (listItem) {
        // Show display mode, hide edit form
        const displayDiv = listItem.querySelector('.routine-display');
        const editDiv = listItem.querySelector('.routine-edit-form');
        
        if (displayDiv && editDiv) {
          displayDiv.style.display = 'block';
          editDiv.style.display = 'none';
        }
      }
    }
    
    // Handle delete button clicks - simple confirmation
    if (e.target.classList.contains('delete-btn')) {
      const routineId = e.target.getAttribute('data-routine-id');
      const routineName = e.target.getAttribute('data-routine-name');
      
      if (confirm(`Are you sure you want to delete "${routineName}"? This action cannot be undone.`)) {
        deleteRoutine(routineId);
      }
    }
  });
  
  // Handle inline form submissions
  document.addEventListener('submit', function(e) {
    if (e.target.classList.contains('inline-edit-form')) {
      e.preventDefault();
      
      const form = e.target;
      const routineId = form.getAttribute('data-routine-id');
      const formData = new FormData(form);
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
      
      if (!csrfToken) {
        console.error('CSRF token not found');
        return;
      }
      
      // Add the action to formData
      formData.append('action', 'edit_routine');
      formData.append('routine_id', routineId);
      
      // Show loading state
      const saveBtn = form.querySelector('.save-btn');
      const originalText = saveBtn.innerHTML;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      saveBtn.disabled = true;
      
      // Submit the form
      fetch(window.location.href, {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRFToken': csrfToken.value
        }
      })
      .then(response => {
        if (response.ok) {
          // Reload the page to show updated data
          window.location.reload();
        } else {
          throw new Error('Save failed');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error saving routine. Please try again.');
        
        // Reset button state
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
      });
    }
  });
}

function deleteRoutine(routineId) {
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
  if (!csrfToken) {
    console.error('CSRF token not found');
    return;
  }
  
  fetch(`/routines/delete/${routineId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken.value
    },
    body: JSON.stringify({})
  })
  .then(response => {
    if (response.ok) {
      // Reload the page to show updated data
      window.location.reload();
    } else {
      throw new Error('Delete failed');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error deleting routine. Please try again.');
  });
}

/**
 * Initialize profile page functionality when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
  // Initialize profile data if on profile page
  if (document.getElementById('user-products-data')) {
    initializeProfileData();
  }
  
  // Enable inline editing functionality
  enableInlineEditing();
});
