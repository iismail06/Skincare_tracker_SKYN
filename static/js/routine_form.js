// Small helper to add/remove step fields and submit the Add Routine form via AJAX
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('steps-container');
    var form = document.getElementById('add-routine-form');
    if (!container || !form) return;

    // --- Add/remove step controls ---
    var max = 5;
    var addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.textContent = 'Add step';
    addBtn.className = 'btn btn-secondary';
    addBtn.style.marginTop = '0.5rem';

    var removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove last step';
    removeBtn.className = 'btn btn-secondary';
    removeBtn.style.marginLeft = '0.5rem';

    container.parentNode.insertBefore(addBtn, container.nextSibling);
    container.parentNode.insertBefore(removeBtn, addBtn.nextSibling);

    function countInputs() {
      return container.querySelectorAll('input[type="text"]').length;
    }

    addBtn.addEventListener('click', function () {
      var count = countInputs();
      if (count >= max) return;
      var next = count + 1;
      var input = document.createElement('input');
      input.type = 'text';
      input.name = 'step' + next;
      input.placeholder = 'Step ' + next;
      input.style.display = 'block';
      input.style.marginTop = '0.25rem';
      container.appendChild(input);
    });

    removeBtn.addEventListener('click', function () {
      var inputs = container.querySelectorAll('input[type="text"]');
      if (inputs.length <= 1) return;
      var last = inputs[inputs.length - 1];
      container.removeChild(last);
    });

    // --- AJAX submit ---
    var submitBtn = document.getElementById('add-routine-submit');
    var ajaxUrl = form.getAttribute('data-ajax-url');

    // wire dismiss for server-rendered block if present
    if (document.getElementById('inline-success')) {
      wireDismiss();
    }

    function clearFormErrors() {
      var errs = form.querySelectorAll('.error');
      errs.forEach(function (el) { el.remove(); });
      var nonField = form.querySelector('.non-field-errors');
      if (nonField) nonField.remove();
    }

    function renderInlineSuccess(data) {
      var inline = document.getElementById('inline-success');
      if (!inline) {
        // create a new inline block above the form
        inline = document.createElement('div');
        inline.id = 'inline-success';
        inline.className = 'inline-success';
        inline.style = 'margin-top:.5rem;padding:.75rem;border-left:4px solid #28a745;background:#f8fff9;border-radius:4px;display:flex;align-items:center;justify-content:space-between;';
        form.parentNode.parentNode.insertBefore(inline, form.parentNode);
      }
  inline.innerHTML = '<div><small style="color:#0b6b3a;">Added</small><div><strong id="inline-success-name">' + (data.name || '') + '</strong></div></div><div style="display:flex;gap:.5rem;align-items:center;">' +
        '<a id="inline-success-view" class="btn btn-secondary" href="' + (data.detail_url || '#') + '">View</a>' +
        '<button type="button" class="inline-dismiss" id="inline-success-dismiss" aria-label="Dismiss">✕</button>' +
        '</div>';
      wireDismiss();
    }

    function wireDismiss() {
      var dismiss = document.getElementById('inline-success-dismiss');
      if (dismiss) {
        dismiss.addEventListener('click', function () {
          var el = document.getElementById('inline-success');
          if (el) el.remove();
        });
      }
    }

    function prependRoutineToList(data) {
      var list = document.querySelector('.routines-list');
      if (!list) {
        // create list and insert
        list = document.createElement('ul');
        list.className = 'routines-list';
        form.parentNode.parentNode.appendChild(list);
      }
      var li = document.createElement('li');
  li.innerHTML = '<strong>' + (data.name || '') + '</strong> - ' + (data.routine_type || '') + ' <a href="' + (data.detail_url || '#') + '" class="btn btn-secondary" style="margin-left:1rem;">View</a>';
      // add to top
      if (list.firstChild) list.insertBefore(li, list.firstChild); else list.appendChild(li);
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      clearFormErrors();
      if (!ajaxUrl) return form.submit();

      var formData = new FormData(form);
      // Indicate AJAX
      var headers = {'X-Requested-With': 'XMLHttpRequest'};

      submitBtn.disabled = true;

      fetch(ajaxUrl, {method: 'POST', body: formData, headers: headers, credentials: 'same-origin'})
        .then(function (resp) {
          if (!resp.ok) return resp.json().then(function (j) { throw j; });
          return resp.json();
        })
        .then(function (json) {
          if (json && json.success) {
            // update inline success and routines list
            renderInlineSuccess(json);
            prependRoutineToList({name: json.name, detail_url: json.detail_url, routine_type: ''});
            // reset form inputs
            form.reset();
            // remove extra step inputs except the first
            var inputs = container.querySelectorAll('input[type="text"]');
            for (var i = inputs.length - 1; i >= 1; i--) { inputs[i].remove(); }
          }
        })
        .catch(function (err) {
          // err may be a JSON error object with 'errors' and 'non_field_errors'
          if (err && err.errors) {
            // render field errors
            Object.keys(err.errors).forEach(function (field) {
              var val = err.errors[field];
              var input = form.querySelector('[name="' + field + '"]');
              if (input) {
                var div = document.createElement('div'); div.className = 'error'; div.textContent = val.join(', ');
                input.parentNode.insertBefore(div, input.nextSibling);
              }
            });
            if (err.non_field_errors && err.non_field_errors.length) {
              var nf = document.createElement('div'); nf.className = 'form-errors non-field-errors';
              err.non_field_errors.forEach(function (m) { var d = document.createElement('div'); d.className = 'error'; d.textContent = m; nf.appendChild(d); });
              form.insertBefore(nf, form.firstChild);
            }
          }
        })
        .finally(function () { submitBtn.disabled = false; });
    });
  });
})();
