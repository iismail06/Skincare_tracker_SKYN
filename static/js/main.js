

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

  // Initialize progress bar width from data-progress (if present)
  const progressBar = document.querySelector('.progress-fill');
  if (progressBar) {
    const progress = parseInt(progressBar.getAttribute('data-progress') || '0', 10);
    if (!Number.isNaN(progress)) {
      progressBar.style.width = progress + '%';
    }
  }

  // Populate product selects on profile routine builder if present
  initProductSelectsForProfile();
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
  const body = document.body;

  if (!themeToggle) {
    // Not every page has a theme toggle
    return;
  }

  // Check for saved theme preference or default to 'light'
  const currentTheme = localStorage.getItem('theme') || 'light';

  if (currentTheme === 'dark') {
    body.classList.add('dark-theme');
    themeToggle.textContent = '\u2600\uFE0F';
  } else {
    themeToggle.textContent = '\uD83C\uDF19';
  }

  // Avoid duplicate handlers if initTheme is called more than once
  themeToggle.removeEventListener('click', themeToggle._handler || (()=>{}));
  themeToggle._handler = function() {
    body.classList.toggle('dark-theme');
    if (body.classList.contains('dark-theme')) {
      themeToggle.textContent = '\u2600\uFE0F';
      localStorage.setItem('theme', 'dark');
    } else {
      themeToggle.textContent = '\uD83C\uDF19';
      localStorage.setItem('theme', 'light');
    }
  };
  themeToggle.addEventListener('click', themeToggle._handler);
}

/* ==========================================================================
   NAVIGATION
   Handles mobile navigation menu functionality
   ========================================================================== */

/**
 * Mobile Hamburger Menu Functionality
 * Handles responsive navigation menu toggle
 */
function initNavigation() {
  const hamburgerMenu = document.getElementById('hamburger-menu');
  const navLinks = document.getElementById('nav-links');

  if (!(hamburgerMenu && navLinks)) return;

  // Click handler for toggling menu
  const onHamburgerClick = function() {
    const willOpen = !navLinks.classList.contains('active');
    hamburgerMenu.classList.toggle('active', willOpen);
    navLinks.classList.toggle('active', willOpen);
    // ARIA state
    hamburgerMenu.setAttribute('aria-expanded', String(willOpen));
    navLinks.setAttribute('aria-hidden', String(!willOpen));
    // Body scroll lock
    document.body.style.overflow = willOpen ? 'hidden' : '';
  };

  // Remove previous bindings (if any) to avoid duplicates
  hamburgerMenu.removeEventListener('click', hamburgerMenu._handler || (()=>{}));
  hamburgerMenu._handler = onHamburgerClick;
  hamburgerMenu.addEventListener('click', onHamburgerClick);

  // Close on nav link click
  const navLinkItems = navLinks.querySelectorAll('a');
  navLinkItems.forEach(link => {
    link.removeEventListener('click', link._closeHandler || (()=>{}));
    link._closeHandler = function() {
      hamburgerMenu.classList.remove('active');
      navLinks.classList.remove('active');
      hamburgerMenu.setAttribute('aria-expanded', 'false');
      navLinks.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    link.addEventListener('click', link._closeHandler);
  });

  // Close when clicking outside
  const onDocClick = function(event) {
    const isClickInsideNav = navLinks.contains(event.target) || hamburgerMenu.contains(event.target);
    if (!isClickInsideNav && navLinks.classList.contains('active')) {
      hamburgerMenu.classList.remove('active');
      navLinks.classList.remove('active');
      hamburgerMenu.setAttribute('aria-expanded', 'false');
      navLinks.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };
  document.removeEventListener('click', document._navOutsideHandler || (()=>{}));
  document._navOutsideHandler = onDocClick;
  document.addEventListener('click', onDocClick);

  // Close on resize
  const onResize = function() {
    if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
      hamburgerMenu.classList.remove('active');
      navLinks.classList.remove('active');
      hamburgerMenu.setAttribute('aria-expanded', 'false');
      navLinks.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };
  window.removeEventListener('resize', window._navResizeHandler || (()=>{}));
  window._navResizeHandler = onResize;
  window.addEventListener('resize', onResize);
}

/* ==========================================================================
   CALENDAR FUNCTIONALITY
   ========================================================================== */

(function() {
  const root = document.querySelector('#calendar');
  if (!root) return;

  // Parse JSON script tags for events
  let events = [];
  let expiryEvents = [];
  let weeklyDueDates = [];
  let monthlyDueDates = [];
  try {
    const routineTag = document.getElementById('routine-events');
    if (routineTag && routineTag.textContent) {
      const parsed = JSON.parse(routineTag.textContent);
      if (Array.isArray(parsed)) events = parsed;
    }
    const expiryTag = document.getElementById('expiry-events');
    if (expiryTag && expiryTag.textContent) {
      const parsedExpiry = JSON.parse(expiryTag.textContent);
      if (Array.isArray(parsedExpiry)) expiryEvents = parsedExpiry;
    }
    const weeklyTag = document.getElementById('weekly-due-dates');
    if (weeklyTag && weeklyTag.textContent) {
      const parsedWeekly = JSON.parse(weeklyTag.textContent);
      if (Array.isArray(parsedWeekly)) weeklyDueDates = parsedWeekly;
    }
    const monthlyTag = document.getElementById('monthly-due-dates');
    if (monthlyTag && monthlyTag.textContent) {
      const parsedMonthly = JSON.parse(monthlyTag.textContent);
      if (Array.isArray(parsedMonthly)) monthlyDueDates = parsedMonthly;
    }
  } catch (e) {
    // fallback below
  }
  if (!events.length && window.ROUTINE_EVENTS && Array.isArray(window.ROUTINE_EVENTS)) {
    events = window.ROUTINE_EVENTS;
  }
  if (!expiryEvents.length && window.EXPIRY_EVENTS && Array.isArray(window.EXPIRY_EVENTS)) {
    expiryEvents = window.EXPIRY_EVENTS;
  }
  const eventsByDate = {};
  const expiryByDate = {};
  
  events.forEach(function(ev) {
    if (!ev || !ev.date) return;
    eventsByDate[ev.date] = ev;
  });

  expiryEvents.forEach(function(ex) {
    if (!ex || !ex.date) return;
    if (!expiryByDate[ex.date]) expiryByDate[ex.date] = [];
    expiryByDate[ex.date].push(ex);
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
    // Cache today's date at midnight for comparisons
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
      
      // Check if the date is in the future and/or is today
      const cellDate = new Date(state.year, state.month, day);
      const isFutureDay = cellDate > today;
      const isToday = cellDate.getTime() === today.getTime();
      if (isToday) {
        cell.classList.add('sc-today');
      }
      
      // Set status indicators based on event data 
      let statusText = 'No events';
      if (ev) {
        if (ev.status === 'completed') {
          icon.textContent = '✨';
          statusText = 'Completed';
        } else if (ev.status === 'not_done') {
          if (isFutureDay) {
            // Future days - leave empty icon
            icon.textContent = '';
            statusText = 'Upcoming';
          } else {
            // Past missed days - red cross
            icon.textContent = '×';
            const errorColor = getCssVar('--error-color');
            if (errorColor) icon.style.color = errorColor;
            icon.style.fontSize = '2rem';
            statusText = 'Missed';
          }
        } else if (ev.status === 'morning') {
          icon.textContent = '☀️';
          statusText = 'Morning routine';
        } else if (ev.status === 'evening') {
          icon.textContent = '🌙';
          statusText = 'Evening routine';
        }
      } else if (isFutureDay) {
        // Future days with no events
        statusText = 'Upcoming';
      }
      
      cell.appendChild(icon);

    // Build tooltip text including expiry info if present (hover-only)
      const parts = dateKey.split('-');
      const readableDate = parts[2] + '-' + parts[1] + '-' + parts[0];
    let tooltip = readableDate + ' — ' + statusText + (isToday ? ' • Today' : '');

      const expiries = expiryByDate[dateKey] || [];
      if (expiries.length) {
        // Add a small badge to the cell for at-a-glance awareness
        const badge = document.createElement('div');
        badge.className = 'sc-expiry-badge';
        badge.textContent = '⚠️';
        cell.appendChild(badge);

        // Tooltip details for expiry items (concise: name — brand)
        const maxList = 2;
        const items = expiries.slice(0, maxList).map(function(ex) {
          const nameBrand = (ex.product_name || ex.title || 'Product') + (ex.brand ? (' — ' + ex.brand) : '');
          return nameBrand;
        });
        const moreCount = expiries.length - items.length;
        const expiryLine = 'Expiring: ' + items.join(' || ') + (moreCount > 0 ? (' and ' + moreCount + ' more') : '');
        tooltip += ' • ' + expiryLine;
      }

      // Accessibility: add title and aria-label for screen readers/tooltips
      cell.title = tooltip;
      cell.setAttribute('aria-label', tooltip);

      grid.appendChild(cell);
    }


    // Highlight weekly step reminders
    const weeklyList = Array.isArray(weeklyDueDates) && weeklyDueDates.length ? weeklyDueDates : (Array.isArray(window.weeklyDueDates) ? window.weeklyDueDates : []);
    weeklyList.forEach(function(item) {
      const dayElem = document.getElementById('calendar-day-' + item.date);
      if (dayElem) {
        const weeklyRgb = getCssVar('--accent-color-bg-lighter-rgb');
        const weeklyBorder = weeklyRgb ? ('rgb(' + weeklyRgb + ')') : getCssVar('--accent-step-weekly');
        if (weeklyBorder) dayElem.style.border = '2px solid ' + weeklyBorder;
        const weeklyText = 'Weekly step: ' + item.step_name + ' (' + item.routine_type + ')';
        dayElem.title = dayElem.title ? (dayElem.title + ' • ' + weeklyText) : weeklyText;
        dayElem.setAttribute('aria-label', dayElem.title);
      }
    });

    // Highlight monthly step reminders
    const monthlyList = Array.isArray(monthlyDueDates) && monthlyDueDates.length ? monthlyDueDates : (Array.isArray(window.monthlyDueDates) ? window.monthlyDueDates : []);
    monthlyList.forEach(function(item) {
      const dayElem = document.getElementById('calendar-day-' + item.date);
      if (dayElem) {
        const monthlyBorder = getCssVar('--accent-step-monthly');
        if (monthlyBorder) dayElem.style.border = '2px solid ' + monthlyBorder;
        const monthlyText = 'Monthly step: ' + item.step_name + ' (' + item.routine_type + ')';
        dayElem.title = dayElem.title ? (dayElem.title + ' • ' + monthlyText) : monthlyText;
        dayElem.setAttribute('aria-label', dayElem.title);
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

  // Removed clickable details panel to keep calendar hover-only

    // Today highlight uses default styling (no user-configurable options)
  }

  /**
   * Shows event details for a specific date
   * @param {string} dateKey - Date in YYYY-MM-DD format
   */
  // Removed showDetails() and related UI to avoid pop-ups; hover tooltips only

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

  // No calendar UI controls or persisted preferences for today highlight
})();

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
  
  // Listen for checkbox changes (delegated)
  document.addEventListener('change', function(event) {
    const target = event.target;
    if (target && target.classList && target.classList.contains('step-checkbox')) {
      // Use unified toggle flow to match previous behavior
      const stepId = target.getAttribute('data-step-id');
      if (stepId) {
        toggleStepCompletion(stepId, target);
      } else {
        handleRoutineStepUpdate(target);
      }
    }
  });

  // Delegated handler for routine completion buttons
  document.addEventListener('click', function(event) {
    const btn = event.target.closest && event.target.closest('.complete-btn');
    if (!btn) return;
    event.preventDefault();
    const routineId = btn.getAttribute('data-routine-id');
    const routineType = btn.getAttribute('data-routine-type');
    if (routineId && routineType) {
      markRoutineComplete(routineId, routineType);
    }
  });
}

/**
 * Handles routine step updates (completion status)
 * @param {HTMLInputElement} checkbox - The routine step checkbox element
 */
function handleRoutineStepUpdate(checkbox) {
  const stepId = checkbox && checkbox.dataset ? checkbox.dataset.stepId : null;
  const isChecked = !!(checkbox && checkbox.checked);
  const stepItem = checkbox.closest('.routine-step');
  
  if (!stepId) {
    console.warn('Step ID missing on checkbox');
    return;
  }
  
  // Make AJAX request to toggle step completion (matches backend URL)
  fetch('/routines/toggle-step/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken(),
    },
    body: JSON.stringify({ step_id: stepId })
  })
  .then(response => response.json())
  .then(data => {
    if (data && data.success) {
      if (stepItem) stepItem.classList.toggle('completed', isChecked);
      showSuccessMessage(data.message || 'Routine step updated');
      updateProgressDisplay();
      // Dispatch event for calendar/dashboard updates
      document.dispatchEvent(new CustomEvent('routineStepUpdated', { detail: { stepId, completed: isChecked } }));
    } else {
      showErrorMessage((data && (data.error || data.message)) || 'Could not update routine step');
      // Revert UI checkbox state on failure
      checkbox.checked = !isChecked;
    }
  })
  .catch(error => {
    console.error('Error updating routine step:', error);
    showErrorMessage('Failed to update routine step');
    // Revert UI checkbox state on error
    checkbox.checked = !isChecked;
  });
}

/**
 * Legacy-compatible toggle function with fallback endpoint
 * @param {string|number} stepId 
 * @param {HTMLInputElement=} checkbox Optional checkbox to update/revert
 */
function toggleStepCompletion(stepId, checkbox) {
  const csrf = getCsrfToken();
  if (!csrf) {
    console.error('CSRF token not found');
    if (checkbox) checkbox.checked = !checkbox.checked;
    return;
  }

  fetch('/routines/toggle-step/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrf
    },
    body: JSON.stringify({ step_id: stepId })
  })
  .then(function(response) {
    if (!response.ok) {
      // fallback to legacy form-encoded endpoint if present
      return fallbackToggleStep(stepId, csrf);
    }
    return response.json();
  })
  .then(function(data) {
    if (data && data.success) {
      updateProgressDisplay();
    } else if (data && data.success === false) {
      console.error('Failed to update step', data.error || data.message);
      if (checkbox) checkbox.checked = !checkbox.checked;
    }
  })
  .catch(function(error) {
    console.error('Network error while toggling step:', error);
    if (checkbox) checkbox.checked = !checkbox.checked;
  });
}

function fallbackToggleStep(stepId, csrfToken) {
  const checkbox = document.querySelector(`[data-step-id="${stepId}"]`);
  const isCompleted = checkbox ? checkbox.checked : false;
  return fetch('/routines/toggle-step-completion/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CSRFToken': csrfToken,
    },
    body: `step_id=${encodeURIComponent(stepId)}&completed=${isCompleted ? '1' : '0'}`
  }).then(r => r.json()).then(d => {
    if (d && d.success) {
      updateProgressDisplay();
    } else if (checkbox) {
      checkbox.checked = !isCompleted;
    }
    return d || { success: false };
  });
}

/**
 * Marks an entire routine as complete (parity with previous file)
 * @param {string|number} routineId
 * @param {string} routineType
 */
function markRoutineComplete(routineId, routineType) {
  const csrf = getCsrfToken();
  if (!csrf) { console.error('CSRF token not found'); return; }
  fetch('/routines/mark-complete/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrf
    },
    body: JSON.stringify({ routine_id: routineId, routine_type: routineType })
  })
  .then(resp => {
    if (!resp.ok) throw new Error('Network error');
    return resp.json();
  })
  .then(data => {
    if (data && data.success) {
      window.location.reload();
    } else {
      showErrorMessage(data && (data.error || data.message) || 'Failed to mark routine complete');
    }
  })
  .catch(err => {
    console.error('Error marking routine complete:', err);
    showErrorMessage('Could not connect to server');
  });
}

/**
 * Updates the progress display without full page reload
 */
function updateProgressDisplay() {
  const totalCheckboxes = document.querySelectorAll('.step-checkbox').length;
  const completedCheckboxes = document.querySelectorAll('.step-checkbox:checked').length;
  const progressPercent = totalCheckboxes > 0 ? Math.round((completedCheckboxes / totalCheckboxes) * 100) : 0;

  // Dashboard uses .progress-fill bar and .progress-text span
  const progressBar = document.querySelector('.progress-fill');
  if (progressBar) progressBar.style.width = progressPercent + '%';

  const progressText = document.querySelector('.progress-text');
  if (progressText) progressText.textContent = `${completedCheckboxes} of ${totalCheckboxes} steps completed`;
}

/**
 * Handles routine form submission
 * @param {Event} event - The form submission event
 */
function handleRoutineFormSubmit(event) {
  const form = event.target;
  // Allow classic browser submit (server redirect) when form opts out of AJAX
  // Usage: add data-no-ajax="true" attribute on the form element
  if (form && (form.dataset.noAjax === 'true' || form.getAttribute('data-no-ajax') === 'true')) {
    return; // do not prevent default; let the form submit normally
  }
  event.preventDefault();
  
  
  
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
  initProductSuggestions();
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

// Removed unused AJAX delete code to align with confirmation-page delete flow

/**
 * Initializes product suggestions on the product form page
 */
function initProductSuggestions() {
  const categorySelect = document.getElementById('category-browse');
  const loadingDiv = document.getElementById('suggestions-loading');
  const suggestionsDiv = document.getElementById('product-suggestions');
  const suggestionsGrid = document.getElementById('suggestions-grid');
  const productForm = document.getElementById('product-form');

  // Only run where the product form and browse select exist
  if (!categorySelect || !productForm || !suggestionsGrid || !suggestionsDiv || !loadingDiv) return;

  categorySelect.addEventListener('change', function() {
    const category = this.value;
    if (!category) {
      suggestionsDiv.style.display = 'none';
      suggestionsDiv.setAttribute('aria-hidden', 'true');
      return;
    }

    // Show loading state
    loadingDiv.style.display = 'block';
    loadingDiv.setAttribute('aria-hidden', 'false');
    suggestionsDiv.style.display = 'none';
    suggestionsDiv.setAttribute('aria-hidden', 'true');
    suggestionsGrid.innerHTML = '';

    fetch('/api/products/browse/' + encodeURIComponent(category) + '/')
      .then(function(response) {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(function(products) {
        loadingDiv.style.display = 'none';
        loadingDiv.setAttribute('aria-hidden', 'true');

        if (!products || products.length === 0) {
          suggestionsGrid.innerHTML = '<p class="muted-message">No products found for this category. Try importing some first!</p>';
        } else {
          products.forEach(function(product) {
            const card = createSuggestionCard(product, productForm);
            suggestionsGrid.appendChild(card);
          });
        }

        suggestionsDiv.style.display = 'block';
        suggestionsDiv.setAttribute('aria-hidden', 'false');
      })
      .catch(function(error) {
        console.error('Error fetching products:', error);
        loadingDiv.style.display = 'none';
        loadingDiv.setAttribute('aria-hidden', 'true');
        suggestionsGrid.innerHTML = '<p class="error-message">Error loading suggestions. Please try again.</p>';
        suggestionsDiv.style.display = 'block';
        suggestionsDiv.setAttribute('aria-hidden', 'false');
      });
  });

  function createSuggestionCard(product, formEl) {
    const card = document.createElement('div');
    card.className = 'suggestion-card';
    card.style.cursor = 'pointer';

    const productTypeDisplay = product.product_type_display || product.product_type || '';

    card.innerHTML =
      '<h5>' + escapeHtml(product.name || '') + '</h5>' +
      '<p><strong>Brand:</strong> ' + escapeHtml(product.brand || '') + '</p>' +
      (product.ingredients ?
        '<p><strong>Key ingredients:</strong> ' + escapeHtml(product.ingredients.substring(0, 100)) +
        (product.ingredients.length > 100 ? '...' : '') + '</p>' : '') +
      '<div class="product-type">' + escapeHtml(productTypeDisplay) + '</div>';

    card.addEventListener('click', function() {
      fillProductForm(formEl, product);
      // Scroll and highlight
      formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const highlightColor = getCssVar('--accent-color-bg-lighter');
      if (highlightColor) {
        const original = formEl.style.backgroundColor;
        formEl.style.backgroundColor = highlightColor;
        setTimeout(function() { formEl.style.backgroundColor = original; }, 2000);
      }
    });

    return card;
  }

  function fillProductForm(formEl, product) {
    setFormField(formEl, 'name', product.name || '');
    setFormField(formEl, 'brand', product.brand || '');
    setFormField(formEl, 'product_type', product.product_type || '');
    if (product.ingredients) setFormField(formEl, 'ingredients', product.ingredients);
    if (product.description) setFormField(formEl, 'description', product.description);

    // Reset dropdown and hide suggestions area
    categorySelect.value = '';
    const suggestionsDiv = document.getElementById('product-suggestions');
    if (suggestionsDiv) {
      suggestionsDiv.style.display = 'none';
      suggestionsDiv.setAttribute('aria-hidden', 'true');
    }
  }

  function setFormField(formEl, fieldName, value) {
    const field = formEl.querySelector('[name="' + fieldName + '"]');
    if (field) {
      field.value = value;
      const event = new Event('change', { bubbles: true });
      field.dispatchEvent(event);
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }
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
    // Calendar self-initializes via IIFE; guard in case a global init is not present
    try { if (typeof initCalendar === 'function') { initCalendar(); } } catch (e) { /* no-op */ }
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

  // Auto-detect product form pages even without marker class
  if (document.getElementById('product-form') || document.getElementById('category-browse')) {
    initProducts();
  }

  // Initialize add routine page enhancements (datalist name suggestions)
  if (document.querySelector('.add-routine-page')) {
    initRoutineNameSuggestions();
  }
}

/**
 * Setup common UI elements used across the application
 */
function setupCommonElements() {
  // Setup any tooltips
  try {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    if (window.bootstrap && typeof window.bootstrap.Tooltip === 'function') {
      tooltipTriggerList.forEach(el => new window.bootstrap.Tooltip(el));
    }
  } catch (e) {
    console.debug('Tooltips unavailable:', e);
  }

  // Setup popovers if any
  try {
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    if (window.bootstrap && typeof window.bootstrap.Popover === 'function') {
      popoverTriggerList.forEach(el => new window.bootstrap.Popover(el));
    }
  } catch (e) {
    console.debug('Popovers unavailable:', e);
  }
  
  // Setup routine step dropdowns for profile page
  setupRoutineStepDropdowns();
}

/**
 * Initialize routine name suggestions on add routine page
 * Supports datalist dropdown and clickable chips, adapts to routine type
 */
function initRoutineNameSuggestions() {
  const nameInput = document.getElementById('routine_name');
  const typeSelect = document.getElementById('routine_type');
  const datalist = document.getElementById('routine-name-suggestions');
  if (!(nameInput && typeSelect && datalist)) return;

  // Original custom phrases you mentioned
  const custom = {
    morning: [
      'Busy Morning',
      'Coming Morning',
      'Routine Morning for Work',
      'Going Morning to Work',
      'Morning for Work',
      'Morning Before Work',
      'Early AM Reset',
      'Sunrise Routine'
    ],
    evening: [
      'Night Shift',
      'Post Night Shift Morning',
      'Late Night Reset',
      'Evening Wind Down',
      'Post-Shift Night Care'
    ],
    weekly: ['Weekly Treatment', 'Sunday Reset', 'Weekly Exfoliation'],
    monthly: ['Monthly Refresh', 'Monthly Mask', 'Monthly Reset'],
    hair: ['Hair Care', 'Scalp Soothe', 'Glossy Hair Routine'],
    body: ['Body Care', 'Body Glow', 'Self-care Body Routine'],
    special: ['Special Care', 'Event Prep', 'SOS Routine'],
    seasonal: ['Seasonal Routine', 'Winter Care', 'Summer Skin']
  };

  function getSuggestions() {
    const type = (typeSelect.value || '').toLowerCase();
    const list = custom[type];
    // Fallback baseline list
    return Array.isArray(list) && list.length
      ? list
      : ['Morning Routine', 'Evening Reset', 'Weekly Treatment', 'Monthly Refresh'];
  }

  function renderDatalist() {
    if (!datalist) return;
    const items = getSuggestions();
    datalist.innerHTML = '';
    items.forEach(text => {
      const opt = document.createElement('option');
      opt.value = text;
      datalist.appendChild(opt);
    });
  }

  // Initial render and on-change wiring
  renderDatalist();
  typeSelect.addEventListener('change', function() {
    renderDatalist();
  });
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

/**
 * Populate .product-select dropdowns from #user-products-data JSON
 * and keep them in sync for dynamic add/remove of steps
 */
function initProductSelectsForProfile() {
  const stepsContainer = document.getElementById('steps-container');
  if (!stepsContainer) return;
  const jsonTag = document.getElementById('user-products-data');
  let products = [];
  // Cache suggestions by category to avoid repeated requests
  const suggestionCache = {};
  try {
    if (jsonTag && jsonTag.textContent) {
      const parsed = JSON.parse(jsonTag.textContent);
      if (Array.isArray(parsed)) products = parsed; // [[id, brand, name], ...]
    }
  } catch (_) {}

  // Fallback: if no JSON-provided products, try to infer from existing select options
  if (!products.length) {
    const firstSel = stepsContainer.querySelector('select.product-select, select[id^="product"]');
    if (firstSel && firstSel.options && firstSel.options.length > 1) {
      const arr = [];
      for (const opt of firstSel.options) {
        if (!opt.value) continue; // skip placeholder
        const label = (opt.textContent || '').trim();
        // Expect format "Brand - Name" from Product.__str__
        let brand = '';
        let name = label;
        const idx = label.indexOf(' - ');
        if (idx > -1) {
          brand = label.slice(0, idx).trim();
          name = label.slice(idx + 3).trim();
        }
        arr.push([opt.value, brand, name]);
      }
      if (arr.length) products = arr;
    }
  }

  function buildOptionsHtml(selectedVal) {
    const hasSelection = !!selectedVal;
    let html = `<option value="" disabled${hasSelection ? '' : ' selected'}>Add product</option>`;
    if (products.length) {
      html += '<optgroup label="My products">';
      for (const item of products) {
        const [id, brand, name] = item;
        const label = `${brand || ''}${brand && name ? ' — ' : ''}${name || ''}`.trim() || 'Untitled Product';
        const sel = String(selectedVal || '') === String(id) ? ' selected' : '';
        html += `<option value="${id}"${sel}>${label}</option>`;
      }
      html += '</optgroup>';
    } else {
      html += '<option value="" disabled>No products yet</option>';
    }
    return html;
  }

  function buildOptionsWithSuggestions(selectedVal, suggestions) {
    const hasSelection = !!selectedVal;
    let html = `<option value="" disabled${hasSelection ? '' : ' selected'}>Add product</option>`;
    // My products
    if (products.length) {
      html += '<optgroup label="My products">';
      for (const item of products) {
        const [id, brand, name] = item;
        const label = `${brand || ''}${brand && name ? ' — ' : ''}${name || ''}`.trim() || 'Untitled Product';
        const sel = String(selectedVal || '') === String(id) ? ' selected' : '';
        html += `<option value="${id}"${sel}>${label}</option>`;
      }
      html += '</optgroup>';
    }
    // Suggestions
    if (Array.isArray(suggestions) && suggestions.length) {
      html += '<optgroup label="Suggestions">';
      suggestions.forEach((sug, idx) => {
        const label = `${(sug.brand || '').trim()}${sug.brand && sug.name ? ' — ' : ''}${(sug.name || '').trim()}` || 'Suggested Product';
        const val = `suggestion::${idx}`;
        html += `<option value="${val}" data-sug-name="${(sug.name||'').replace(/"/g,'&quot;')}" data-sug-brand="${(sug.brand||'').replace(/"/g,'&quot;')}" data-sug-type="${(sug.product_type||'').replace(/"/g,'&quot;')}">${label}</option>`;
      });
      html += '</optgroup>';
    }
    return html;
  }

  function populateAll() {
    const selects = stepsContainer.querySelectorAll('select.product-select');
    selects.forEach(sel => {
      // If the select already has multiple options (server-rendered), don't wipe them
      const existingOptions = sel.options ? sel.options.length : 0;
      if (!products.length || existingOptions > 1) return;
      const pre = sel.getAttribute('data-selected') || sel.value || '';
      sel.innerHTML = buildOptionsHtml(pre);
      if (pre) sel.value = pre; // re-apply selected if any
    });
  }

  // Initial population (only if we have explicit product list and empty selects)
  populateAll();

  // No toggle logic needed; select is always visible and compact

  // When steps are added dynamically, ensure new product select is populated
  const addBtn = document.getElementById('add-step-btn');
  const removeBtn = document.getElementById('remove-step-btn');
  if (addBtn) {
    addBtn.addEventListener('click', function() {
      // Defer to allow the step DOM to be appended by existing code
      setTimeout(() => {
        // Find last step item and see if it has a product-select without options
        const items = stepsContainer.querySelectorAll('.step-item');
        const last = items[items.length - 1];
        if (!last) return;
        let psel = last.querySelector('select.product-select');
        if (!psel) {
          // Create and append if not present
          const stepNum = last.getAttribute('data-step') || items.length;
          psel = document.createElement('select');
          psel.id = 'product' + stepNum;
          psel.name = 'product' + stepNum;
          psel.className = 'product-select';
          last.appendChild(psel);
        }
        // Populate
        const pre = psel.getAttribute('data-selected') || psel.value || '';
        psel.innerHTML = buildOptionsHtml(pre);
        if (pre) psel.value = pre;
        // Wire suggestion behavior for this new row
        wireSuggestionsForItem(last);
      }, 0);
    });
  }
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
     // Defer to allow the step DOM to be removed by existing code
    });
  }

  // Map a step label to a product category understood by the API
  function mapStepToCategory(label) {
    const v = (label || '').toLowerCase().trim();
    if (!v) return null;

    // Deterministic mapping for known options
    const exactMap = {
      // Face routines
      'gentle cleanse': 'cleanser',
      'double cleanse': 'cleanser',
      'deep cleanse': 'cleanser',
      'toner': 'toner',
      'essence': 'essence',
      'vitamin c serum': 'vitamin_c',
      'treatment serum': 'serum',
      'intensive serum': 'serum',
      'light moisturizer': 'moisturizer',
      'moisturizer': 'moisturizer',
      'spf / sunscreen': 'sunscreen',
      'retinol / acid treatment': 'retinol',
      'spot treatment': 'spot_treatment',
      'eye cream': 'eye_cream',
      'face oil': 'oil',
      'lip treatment': 'lip_treatment',

      // Weekly treatments
      'exfoliation': 'exfoliant',
      'clay mask': 'mask',
      'hydrating mask': 'mask',
      'intensive treatment': 'treatment',

      // Monthly/specialized
      'professional treatment': 'professional_treatment',
      'deep repair mask': 'mask',
      'barrier repair': 'barrier_repair',
      'reset treatment': 'reset_treatment',

      // Body
      'body wash': 'body_wash',
      'body scrub': 'body_scrub',
      'body lotion': 'body_lotion',
      'body oil': 'body_oil',
      'deodorant': 'deodorant',
      'hand cream': 'hand_cream',
      'foot treatment': 'foot_treatment',

      // Hair
      'clarifying shampoo': 'clarifying_shampoo',
      'shampoo': 'shampoo',
      'conditioner': 'conditioner',
      'hair mask': 'hair_mask',
      'deep hair mask': 'deep_hair_mask',
      'leave-in treatment': 'leave_in_treatment',
      'hair oil': 'hair_oil',
      'scalp treatment': 'scalp_treatment',
      'heat protectant': 'heat_protectant',

      // Special
      'prep treatment': 'primer',
      'priming serum': 'primer',
      'glow treatment': 'glow_treatment',
      'hydration boost': 'hydration_boost',
      'setting treatment': 'setting_treatment',

      // Seasonal
      'season prep': 'season_prep',
      'climate adjustment': 'climate_adjustment',
      'humidity control': 'humidity_control',
      'weather protection': 'weather_protection',
      'transition treatment': 'transition_treatment',
    };
    if (exactMap[v]) return exactMap[v];

    // Fallback heuristics for custom steps
    if (v.includes('cleanse')) return 'cleanser';
    if (v.includes('toner')) return 'toner';
    if (v.includes('essence')) return 'essence';
    if (v.includes('vitamin c')) return 'vitamin_c';
    if (v.includes('serum')) return 'serum';
    if (v.includes('moistur')) return 'moisturizer';
    if (v.includes('spf') || v.includes('sunscreen')) return 'sunscreen';
    if (v.includes('retinol') || v.includes('retinoid')) return 'retinol';
    if (v.includes('acid') || v.includes('exfol')) return 'exfoliant';
    if (v.includes('mask')) return 'mask';
    if (v.includes('eye')) return 'eye_cream';
    if (v.includes('lip')) return 'lip_treatment';
    if (v.includes('oil')) return 'oil';
    if (v.includes('spot')) return 'spot_treatment';
    if (v.includes('body') && v.includes('wash')) return 'body_wash';
    if (v.includes('body') && v.includes('scrub')) return 'body_scrub';
    if (v.includes('body') && (v.includes('lotion') || v.includes('cream'))) return 'body_lotion';
    if (v.includes('shampoo')) return 'shampoo';
    if (v.includes('conditioner')) return 'conditioner';
    if (v.includes('scalp')) return 'scalp_treatment';
    if (v.includes('heat') && v.includes('protect')) return 'heat_protectant';
    if (v.includes('deodor')) return 'deodorant';
    if (v.includes('hand')) return 'hand_cream';
    if (v.includes('foot')) return 'foot_treatment';
    return null;
  }

  async function fetchSuggestions(category) {
    if (!category) return [];
    if (suggestionCache[category]) return suggestionCache[category];
    try {
      const resp = await fetch(`/api/products/browse/${encodeURIComponent(category)}/`, {
        credentials: 'same-origin',
        headers: { 'Accept': 'application/json' }
      });
      if (!resp.ok) {
        console.debug('Suggestion fetch failed:', category, resp.status);
        return [];
      }
      // Ensure JSON; if server returned HTML (e.g., redirect), guard it
      const ct = resp.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        console.debug('Suggestion response not JSON for category:', category, ct);
        return [];
      }
      const data = await resp.json();
      suggestionCache[category] = Array.isArray(data) ? data : [];
      return suggestionCache[category];
    } catch (_) {
      console.debug('Suggestion fetch error for category:', category);
      return [];
    }
  }

  function getStepAndProductSelectsFromItem(item) {
    // Support both select-based step pickers and plain text inputs
    let stepField = item.querySelector('select[id^="step"]');
    if (!stepField) {
      // Django default IDs are like id_step1
      stepField = item.querySelector('input[id^="id_step"], input[name^="step"]');
    }
    let productSel = item.querySelector('select.product-select, select[id^="product"]');
    return { stepField, productSel };
  }

  function setProductSelectOptions(productSel, selectedVal, suggestions) {
    productSel.innerHTML = buildOptionsWithSuggestions(selectedVal, suggestions);
    if (selectedVal) productSel.value = String(selectedVal);
  }

  function handleSuggestionSelection(productSel) {
    productSel.addEventListener('change', async function() {
      const val = productSel.value;
      if (!val || !val.startsWith('suggestion::')) return;
      // Extract suggestion payload
      const opt = productSel.options[productSel.selectedIndex];
      const name = (opt.getAttribute('data-sug-name') || '').trim();
      const brand = (opt.getAttribute('data-sug-brand') || '').trim();
      const product_type = (opt.getAttribute('data-sug-type') || '').trim() || 'other';
      if (!name || !brand) return;
      // Persist via quick-add, then select the new product id
      try {
        const form = new FormData();
        form.append('name', name);
        form.append('brand', brand);
        form.append('product_type', product_type);
        const resp = await fetch('/api/products/quick-add/', {
          method: 'POST',
          headers: { 'X-CSRFToken': getCsrfToken() },
          body: form,
          credentials: 'same-origin'
        });
        if (!resp.ok) throw new Error('quick-add failed');
        const data = await resp.json();
        if (data && data.success && data.product && data.product.id) {
          // Add to in-memory list and rebuild with selection
          products.push([data.product.id, data.product.brand || '', data.product.name || '']);
          setProductSelectOptions(productSel, data.product.id, []);
        }
      } catch (e) {
        showErrorMessage('Could not add suggested product.');
        setProductSelectOptions(productSel, '', []);
      }
    });
  }

  function wireSuggestionsForItem(item) {
    const { stepField, productSel } = getStepAndProductSelectsFromItem(item);
    if (!productSel) return;
    // Determine current category from step text/value
    const stepValue = stepField ? (stepField.value || '') : '';
    const currentCat = mapStepToCategory(stepValue);
    const currentVal = productSel.getAttribute('data-selected') || productSel.value || '';
    if (currentCat) {
      fetchSuggestions(currentCat).then(sugs => setProductSelectOptions(productSel, currentVal, sugs));
    } else {
      setProductSelectOptions(productSel, currentVal, []);
    }
    // Wire selection handler (quick-add on suggestion)
    handleSuggestionSelection(productSel);
    // On step change or input, refresh suggestions
    if (stepField) {
      const handler = async function() {
        const cat = mapStepToCategory(stepField.value);
        const selVal = productSel.value || '';
        const sugs = await fetchSuggestions(cat);
        setProductSelectOptions(productSel, selVal, sugs);
      };
      const evt = stepField.tagName === 'SELECT' ? 'change' : 'input';
      stepField.addEventListener(evt, handler);
    }

    // Fallback: on first focus of product select, fetch suggestions for current step
    let fetchedOnFocus = false;
    productSel.addEventListener('focus', async function() {
      if (fetchedOnFocus) return;
      const text = stepField ? (stepField.value || '') : '';
      const cat = mapStepToCategory(text);
      if (!cat) return; // no category derived
      const sugs = await fetchSuggestions(cat);
      if (sugs && sugs.length) {
        const selVal = productSel.value || '';
        setProductSelectOptions(productSel, selVal, sugs);
        fetchedOnFocus = true;
      }
    }, { once: false });
  }

  // Wire all existing step rows to enrich selects with suggestions without removing existing options
  stepsContainer.querySelectorAll('.step-item').forEach(wireSuggestionsForItem);
}

/* ==========================================================================
   PROFILE PAGE: ROUTINE STEP BUILDER
   Populates step selects, supports custom option, and add/remove steps
   ========================================================================== */

function initProfileRoutineBuilder() {
  const stepsContainer = document.getElementById('steps-container');
  const routineTypeEl = document.getElementById('routine_type');
  const addBtn = document.getElementById('add-step-btn');
  const removeBtn = document.getElementById('remove-step-btn');
  const stepCountEl = document.querySelector('.step-count');

  if (!stepsContainer || !routineTypeEl) return; // Not on profile add/edit form

  const stepOptionsByType = {
    morning: [
      'Gentle Cleanse', 'Toner', 'Essence', 'Vitamin C Serum', 'Light Moisturizer', 'Eye Cream', 'SPF / Sunscreen'
    ],
    evening: [
      'Double Cleanse', 'Toner', 'Essence', 'Treatment Serum', 'Retinol / Acid Treatment', 'Eye Cream', 'Moisturizer', 'Face Oil', 'Spot Treatment', 'Lip Treatment'
    ],
    weekly: [
      'Deep Cleanse', 'Exfoliation', 'Clay Mask', 'Hydrating Mask', 'Hair Mask', 'Body Scrub', 'Intensive Treatment'
    ],
    monthly: [
      'Professional Treatment', 'Deep Repair Mask', 'Intensive Serum', 'Barrier Repair', 'Reset Treatment'
    ],
    hair: [
      'Clarifying Shampoo', 'Shampoo', 'Conditioner', 'Deep Hair Mask', 'Leave-in Treatment', 'Hair Oil', 'Scalp Treatment', 'Heat Protectant'
    ],
    body: [
      'Body Wash', 'Body Scrub', 'Body Lotion', 'Body Oil', 'Deodorant', 'Hand Cream', 'Foot Treatment'
    ],
    special: [
      'Prep Treatment', 'Priming Serum', 'Glow Treatment', 'Hydration Boost', 'Setting Treatment', 'Special Occasion Mask'
    ],
    seasonal: [
      'Season Prep', 'Climate Adjustment', 'Barrier Repair', 'Humidity Control', 'Weather Protection', 'Transition Treatment'
    ]
  };

  const minSteps = 1;
  const maxSteps = 10;

  function updateStepCount() {
    const count = stepsContainer.querySelectorAll('.step-item').length;
    if (stepCountEl) stepCountEl.textContent = `${count} step${count !== 1 ? 's' : ''}`;
    if (addBtn) addBtn.disabled = count >= maxSteps;
    if (removeBtn) removeBtn.disabled = count <= minSteps;
  }

  function buildOptions(routineType) {
    const options = stepOptionsByType[routineType] || stepOptionsByType.morning;
    let html = '<option value="">Select step</option>';
    html += options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
    html += '<option value="custom">✏️ Custom Step...</option>';
    return html;
  }

  function attachSelectBehavior(selectEl) {
    // Remove previous handler if present
    selectEl.removeEventListener('change', selectEl._handler || (()=>{}));
    selectEl._handler = function() {
      const stepNumber = this.id.replace('step', '');
      let customInput = document.getElementById(`custom-step${stepNumber}`);
      if (this.value === 'custom') {
        if (!customInput) {
          customInput = document.createElement('input');
          customInput.type = 'text';
          customInput.id = `custom-step${stepNumber}`;
          customInput.name = `step${stepNumber}`;
          customInput.className = 'form-control custom-step-input';
          customInput.placeholder = 'Enter custom step name...';
          customInput.style.marginTop = '5px';
          this.parentNode.insertBefore(customInput, this.nextSibling);
        }
        this.style.display = 'none';
        customInput.style.display = 'block';
        customInput.focus();
        customInput.addEventListener('blur', function onBlur() {
          if (!this.value.trim()) {
            selectEl.style.display = 'block';
            this.style.display = 'none';
            selectEl.value = '';
          }
          customInput.removeEventListener('blur', onBlur);
        });
      } else if (customInput) {
        customInput.style.display = 'none';
        customInput.value = '';
        this.style.display = 'block';
      }
    };
    selectEl.addEventListener('change', selectEl._handler);
  }

  function populateAllSelects() {
    const selects = stepsContainer.querySelectorAll('.step-item select[id^="step"]');
    const rt = routineTypeEl.value || 'morning';
    const optionsHtml = buildOptions(rt);
    selects.forEach(sel => {
      sel.innerHTML = optionsHtml;
      attachSelectBehavior(sel);
    });
  }

  function createStepItem(stepNumber) {
    const wrapper = document.createElement('div');
    wrapper.className = 'step-item';
    wrapper.setAttribute('data-step', String(stepNumber));
    wrapper.innerHTML = `<select id="step${stepNumber}" name="step${stepNumber}" class="step-select"></select>`;
    return wrapper;
  }

  function addStep() {
    const count = stepsContainer.querySelectorAll('.step-item').length;
    if (count >= maxSteps) return;
    const next = count + 1;
    const item = createStepItem(next);
    stepsContainer.appendChild(item);
    // Populate and attach behavior for the new select
    const rt = routineTypeEl.value || 'morning';
    const sel = item.querySelector('select');
    sel.innerHTML = buildOptions(rt);
    attachSelectBehavior(sel);
    updateStepCount();
  }

  function removeStep() {
    const items = stepsContainer.querySelectorAll('.step-item');
    if (items.length <= minSteps) return;
    const last = items[items.length - 1];
    last.remove();
    updateStepCount();
  }

  // Initial population and wiring
  populateAllSelects();
  updateStepCount();
  routineTypeEl.addEventListener('change', populateAllSelects);
  if (addBtn) addBtn.addEventListener('click', addStep);
  if (removeBtn) removeBtn.addEventListener('click', removeStep);
}

// Auto-init profile builder when present
document.addEventListener('DOMContentLoaded', function() {
  const hasProfileRoutineBuilder = document.getElementById('steps-container') && document.getElementById('routine_type');
  if (hasProfileRoutineBuilder) {
    initProfileRoutineBuilder();
  }
});