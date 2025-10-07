

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
      fetch('/api/products/api/browse/' + category + '/')
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

  /**
   * Opens edit modal and populates with routine data
   * @param {string|number} routineId - The ID of the routine to edit
   * @param {string} routineName - The name of the routine
   * @param {string} routineType - The type of routine
   */
  window.openEditModal = function(routineId, routineName, routineType) {
    // Populate basic fields
    const editIdField = document.getElementById('edit-routine-id');
    const editNameField = document.getElementById('edit-routine-name');
    const editTypeField = document.getElementById('edit-routine-type');
    
    if (editIdField) editIdField.value = routineId;
    if (editNameField) editNameField.value = routineName;
    if (editTypeField) editTypeField.value = routineType;
    
    // Clear all step fields first
    for (let i = 1; i <= 5; i++) {
      const stepField = document.getElementById('edit-step' + i);
      const productField = document.getElementById('edit-product' + i);
      if (stepField) stepField.value = '';
      if (productField) productField.value = '';
    }
    
    // Load existing steps via AJAX
    fetch(`/routines/get-routine-data/${routineId}/`)
      .then(response => response.json())
      .then(data => {
        // Populate step fields with existing data
        data.steps.forEach((step, index) => {
          if (index < 5) {
            const stepField = document.getElementById('edit-step' + (index + 1));
            const productField = document.getElementById('edit-product' + (index + 1));
            
            if (stepField) stepField.value = step.step_name;
            if (productField && step.product_id) {
              productField.value = step.product_id;
            }
          }
        });
      })
      .catch(error => {
        console.log('Could not load routine details:', error);
        // Modal will still open with basic info
      });
    
    // Show the modal (assumes Bootstrap is available)
    const modalElement = document.getElementById('editRoutineModal');
    if (modalElement && typeof bootstrap !== 'undefined') {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
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
 * Routine Form Management
 * Handles add/remove step fields and AJAX form submission for routine creation
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('steps-container');
    const form = document.getElementById('add-routine-form');
    if (!container || !form) return;

    // Configuration
    const MAX_STEPS = 5;
    
    // Create add/remove step controls
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.textContent = 'Add step';
    addBtn.className = 'btn btn-primary btn-sm step-control u-margin-top-sm';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove last step';
    removeBtn.className = 'btn btn-primary btn-sm step-control u-margin-left-sm';

    container.parentNode.insertBefore(addBtn, container.nextSibling);
    container.parentNode.insertBefore(removeBtn, addBtn.nextSibling);

    /**
     * Counts the number of step input fields
     * @returns {number} Number of text input fields
     */
    function countInputs() {
      return container.querySelectorAll('input[type="text"]').length;
    }

    /**
     * Adds a new step input field
     */
    addBtn.addEventListener('click', function () {
      const count = countInputs();
      if (count >= MAX_STEPS) return;
      
      const next = count + 1;
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'step' + next;
      input.placeholder = 'Step ' + next;
      input.className = 'input-block';
      container.appendChild(input);
    });

    /**
     * Removes the last step input field
     */
    removeBtn.addEventListener('click', function () {
      const inputs = container.querySelectorAll('input[type="text"]');
      if (inputs.length <= 1) return;
      
      const last = inputs[inputs.length - 1];
      container.removeChild(last);
    });

    // AJAX form submission setup
    const submitBtn = document.getElementById('add-routine-submit');
    const ajaxUrl = form.getAttribute('data-ajax-url');

    // Wire dismiss for server-rendered success block if present
    if (document.getElementById('inline-success')) {
      wireDismiss();
    }

    /**
     * Clears form validation errors
     */
    function clearFormErrors() {
      const errs = form.querySelectorAll('.error');
      errs.forEach(function (el) { el.remove(); });
      
      const nonField = form.querySelector('.non-field-errors');
      if (nonField) nonField.remove();
    }

    /**
     * Renders inline success message
     * @param {Object} data - Response data containing routine information
     */
    function renderInlineSuccess(data) {
      let inline = document.getElementById('inline-success');
      if (!inline) {
        // Create a new inline block above the form
        inline = document.createElement('div');
        inline.id = 'inline-success';
        inline.className = 'inline-success u-margin-top-sm';
        form.parentNode.parentNode.insertBefore(inline, form.parentNode);
      }
      
      inline.innerHTML = '<div><small class="muted-success">Added</small>' +
        '<div><strong id="inline-success-name">' + (data.name || '') + '</strong></div></div>' +
        '<div class="inline-success-actions">' +
        '<a id="inline-success-view" class="btn btn-primary btn-sm" href="' + (data.detail_url || '#') + '">View</a>' +
        '<button type="button" class="inline-dismiss" id="inline-success-dismiss" aria-label="Dismiss">✕</button>' +
        '</div>';
      
      wireDismiss();
    }

    /**
     * Wires up the dismiss functionality for success messages
     */
    function wireDismiss() {
      const dismiss = document.getElementById('inline-success-dismiss');
      if (dismiss) {
        dismiss.addEventListener('click', function () {
          const el = document.getElementById('inline-success');
          if (el) el.remove();
        });
      }
    }

    /**
     * Prepends a new routine to the routines list
     * @param {Object} data - Routine data to display
     */
    function prependRoutineToList(data) {
      let list = document.querySelector('.routines-list');
      if (!list) {
        // Create list and insert
        list = document.createElement('ul');
        list.className = 'routines-list';
        form.parentNode.parentNode.appendChild(list);
      }
      
      const li = document.createElement('li');
      li.innerHTML = '<strong>' + (data.name || '') + '</strong> - ' + (data.routine_type || '') + 
        ' <a href="' + (data.detail_url || '#') + '" class="btn btn-primary btn-sm u-margin-left-md">View</a>';
      
      // Add to top
      if (list.firstChild) {
        list.insertBefore(li, list.firstChild);
      } else {
        list.appendChild(li);
      }
    }

    /**
     * Handles form submission with AJAX
     */
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      clearFormErrors();
      if (!ajaxUrl) return form.submit();

      const formData = new FormData(form);
      const headers = {'X-Requested-With': 'XMLHttpRequest'};

      submitBtn.disabled = true;

      fetch(ajaxUrl, {
        method: 'POST', 
        body: formData, 
        headers: headers, 
        credentials: 'same-origin'
      })
        .then(function (resp) {
          if (!resp.ok) return resp.json().then(function (j) { throw j; });
          return resp.json();
        })
        .then(function (json) {
          if (json && json.success) {
            // Update inline success and routines list
            renderInlineSuccess(json);
            prependRoutineToList({
              name: json.name, 
              detail_url: json.detail_url, 
              routine_type: ''
            });
            
            // Reset form inputs
            form.reset();
            
            // Remove extra step inputs except the first
            const inputs = container.querySelectorAll('input[type="text"]');
            for (let i = inputs.length - 1; i >= 1; i--) { 
              inputs[i].remove(); 
            }
          }
        })
        .catch(function (err) {
          // Handle JSON error object with 'errors' and 'non_field_errors'
          if (err && err.errors) {
            // Render field errors
            Object.keys(err.errors).forEach(function (field) {
              const val = err.errors[field];
              const input = form.querySelector('[name="' + field + '"]');
              if (input) {
                const div = document.createElement('div'); 
                div.className = 'error'; 
                div.textContent = val.join(', ');
                input.parentNode.insertBefore(div, input.nextSibling);
              }
            });
            
            if (err.non_field_errors && err.non_field_errors.length) {
              const nf = document.createElement('div'); 
              nf.className = 'form-errors non-field-errors';
              err.non_field_errors.forEach(function (m) { 
                const d = document.createElement('div'); 
                d.className = 'error'; 
                d.textContent = m; 
                nf.appendChild(d); 
              });
              form.insertBefore(nf, form.firstChild);
            }
          }
        })
        .finally(function () { 
          submitBtn.disabled = false; 
        });
    });
    
    // Handle page-level 'Add a Routine' CTA click
    const pageAdd = document.querySelector('a[href="#"][onclick]') || document.querySelector('a.add-routine-cta');
    if (pageAdd) {
      // Remove inline onclick if present and wire focus handler
      pageAdd.removeAttribute('onclick');
      pageAdd.classList.add('btn-sm');
      pageAdd.addEventListener('click', function (e) {
        e.preventDefault();
        const first = form.querySelector('input[name="routine_name"]');
        if (first) first.focus();
        
        // Scroll into view
        form.scrollIntoView({behavior: 'smooth', block: 'center'});
      });
    }
  });
})();

/**
 * Routine Step Dropdowns for Profile Page
 * Dynamically updates step options based on routine type (morning/evening)
 * Used in templates/users/profile.html
 */
function setupRoutineStepDropdowns() {
  const morningOptions = [
    "Gentle Cleanse",
    "Toner",
    "Essence",
    "Serum",
    "Light Moisturizer",
    "SPF / Sunscreen"
  ];
  const eveningOptions = [
    "Double Cleanse",
    "Toner",
    "Essence",
    "Serum",
    "Eye Cream",
    "Moisturizer",
    "Oil",
    "Retinol / Acid Treatment",
    "Mask",
    "Spot Treatment",
    "Lip Treatment"
  ];
  function setStepOptions(routineType) {
    const options = routineType === 'evening' ? eveningOptions : morningOptions;
    for (let i = 1; i <= 5; i++) {
      const select = document.getElementById(`step${i}`);
      if (select) {
        select.innerHTML = '<option value="">Select step</option>' + options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
      }
    }
  }
  document.addEventListener('DOMContentLoaded', function() {
    const routineType = document.getElementById('routine_type');
    if (routineType && document.getElementById('step1')) {
      setStepOptions(routineType.value);
      routineType.addEventListener('change', function() {
        setStepOptions(this.value);
      });
    }
  });
}