// dashboard.js - Dashboard essentials: edit modal, step completion, routine completion, progress bar

// Opens the edit modal and populates it with routine data
window.openEditModal = function(routineId, routineName, routineType) {
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
    if (productField) {
      productField.value = '';
      // mark this select to be populated after we ensure we have the user's products
      productField.dataset.needsPopulate = '1';
    }
  }
  // Ensure we have USER_PRODUCTS (from template injection) or fetch them from API
  function ensureUserProducts() {
    return new Promise(function(resolve) {
      try {
        if (Array.isArray(window.USER_PRODUCTS) && window.USER_PRODUCTS.length) return resolve(window.USER_PRODUCTS);
      } catch (e) {}

  // Fallback: fetch current user's products from API endpoint
  // Note: the API endpoints for products are mounted under /products/api/ (see products/urls.py)
      fetch('/products/api/')
        .then(function(r){ if (!r.ok) throw new Error('Network'); return r.json(); })
        .then(function(data){
          var products = (data || []);
          if (!products.length) {
            // Try the public browse suggestions endpoint (no auth required)
            var category = (typeof routineType !== 'undefined' && routineType) ? routineType : 'moisturizer';
            return fetch('/products/api/browse/' + encodeURIComponent(category) + '/')
              .then(function(r2){ if (!r2.ok) return []; return r2.json().catch(function(){ return []; }); })
              .then(function(browseData){
                var list = (browseData || []).map(function(p){
                  return { id: String(p.id), label: (p.brand || '') + ' - ' + (p.name || p.id) };
                });
                window.USER_PRODUCTS = list;
                resolve(window.USER_PRODUCTS);
              })
              .catch(function(){ window.USER_PRODUCTS = []; resolve(window.USER_PRODUCTS); });
          }

          window.USER_PRODUCTS = products.map(function(p){
            return { id: String(p.id), label: (p.brand || '') + ' - ' + (p.name || p.id) };
          });
          resolve(window.USER_PRODUCTS);
        })
        .catch(function(){ window.USER_PRODUCTS = []; resolve(window.USER_PRODUCTS); });
    });
  }

  function populateAllProductSelects() {
    const selects = document.querySelectorAll('select[id^="edit-product"]');
    selects.forEach(function(productField) {
      if (productField.dataset.needsPopulate !== '1') return;
      // Clear existing options
      while (productField.firstChild) productField.removeChild(productField.firstChild);
      // Add default empty option
      const emptyOpt = document.createElement('option');
      emptyOpt.value = '';
      emptyOpt.textContent = '-- No product selected --';
      productField.appendChild(emptyOpt);
      if (Array.isArray(window.USER_PRODUCTS) && window.USER_PRODUCTS.length) {
        window.USER_PRODUCTS.forEach(function(p) {
          const opt = document.createElement('option');
          opt.value = p.id;
          opt.textContent = p.label;
          productField.appendChild(opt);
        });
      }
      delete productField.dataset.needsPopulate;
    });
  }

  ensureUserProducts().then(function(){
    populateAllProductSelects();
    // Now load existing steps via AJAX and set selected products
    fetch('/routines/get-routine-data/' + routineId + '/')
      .then(function(response){ return response.json(); })
      .then(function(data){
        data.steps.forEach(function(step, index){
          if (index < 5) {
            const stepField = document.getElementById('edit-step' + (index + 1));
            const productField = document.getElementById('edit-product' + (index + 1));
            if (stepField) stepField.value = step.step_name;

            // If there's a product_id, try to select it; otherwise leave the select empty (default)
            if (productField) {
              if (step.product_id) {
                const existing = productField.querySelector('option[value="' + step.product_id + '"]');
                if (existing) {
                  productField.value = step.product_id;
                } else if (window.USER_PRODUCTS && window.USER_PRODUCTS.length) {
                  const found = window.USER_PRODUCTS.find(function(p){ return p.id === String(step.product_id) || p.id === step.product_id; });
                  const opt = document.createElement('option');
                  opt.value = step.product_id;
                  opt.textContent = found ? found.label : ('Product ' + step.product_id);
                  productField.appendChild(opt);
                  productField.value = step.product_id;
                } else {
                  productField.value = step.product_id;
                }
              } else {
                // Explicitly select the empty/default option when there's no product assigned
                try { productField.value = ''; } catch (e) { /* ignore */ }
                // Also ensure selectedIndex points to the default first option if possible
                if (productField.options && productField.options.length) productField.selectedIndex = 0;
              }
            }
          }
        });
      })
      .catch(function(){ /* ignore */ });
  });
  // Show the modal using Bootstrap's JS API
  const modalElement = document.getElementById('editRoutineModal');
  if (modalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();
  }
};

// Delegated event listener for edit buttons
// Only triggers if not disabled and has all data attributes

document.addEventListener('DOMContentLoaded', function() {
  document.body.addEventListener('click', function(e) {
    const btn = e.target.closest('.edit-btn');
    if (btn && !btn.disabled) {
      const routineId = btn.getAttribute('data-routine-id');
      const routineName = btn.getAttribute('data-routine-name');
      const routineType = btn.getAttribute('data-routine-type');
      if (routineId && routineName && routineType) {
        window.openEditModal(routineId, routineName, routineType);
      }
    }
  });

  // Step completion toggling
  document.querySelectorAll('.step-checkbox').forEach(function(checkbox) {
    checkbox.addEventListener('change', function() {
      const stepId = this.getAttribute('data-step-id');
      if (!stepId) return;
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
      if (!csrfToken) return;
      fetch('/routines/toggle-step/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken.value
        },
        body: JSON.stringify({ step_id: stepId })
      })
      .then(r => r.json())
      .then(data => {
        if (!data.success) this.checked = !this.checked;
        updateProgressDisplay();
      })
      .catch(() => { this.checked = !this.checked; });
    });
  });

  // Routine completion
  document.querySelectorAll('.complete-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const routineId = this.getAttribute('data-routine-id');
      const routineType = this.getAttribute('data-routine-type');
      if (!routineId || !routineType) return;
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
      if (!csrfToken) return;
      fetch('/routines/mark-complete/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken.value
        },
        body: JSON.stringify({ routine_id: routineId, routine_type: routineType })
      })
      .then(r => r.json())
      .then(data => { if (data.success) window.location.reload(); });
    });
  });

  // Progress bar update
  const progressBar = document.querySelector('.progress-fill');
  if (progressBar) {
    const progress = progressBar.getAttribute('data-progress') || 0;
    progressBar.style.width = progress + '%';
  }
});
