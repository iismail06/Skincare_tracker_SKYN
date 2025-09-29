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
  addBtn.className = 'btn btn-primary btn-sm step-control u-margin-top-sm';

    var removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove last step';
  removeBtn.className = 'btn btn-primary btn-sm step-control u-margin-left-sm';

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
  input.className = 'input-block';
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
    inline.className = 'inline-success u-margin-top-sm';
        form.parentNode.parentNode.insertBefore(inline, form.parentNode);
      }
      inline.innerHTML = '<div><small class="muted-success">Added</small><div><strong id="inline-success-name">' + (data.name || '') + '</strong></div></div><div class="inline-success-actions">' +
    '<a id="inline-success-view" class="btn btn-primary btn-sm" href="' + (data.detail_url || '#') + '">View</a>' +
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
  li.innerHTML = '<strong>' + (data.name || '') + '</strong> - ' + (data.routine_type || '') + ' <a href="' + (data.detail_url || '#') + '" class="btn btn-primary btn-sm u-margin-left-md">View</a>';
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
    
    // Prefer focusing the form when the 'Add a Routine' anchor is clicked (page-level CTA)
    var pageAdd = document.querySelector('a[href="#"][onclick]') || document.querySelector('a.add-routine-cta');
    if (pageAdd) {
      // remove inline onclick if present and wire focus handler
      pageAdd.removeAttribute('onclick');
      pageAdd.classList.add('btn-sm');
      pageAdd.addEventListener('click', function (e) {
        e.preventDefault();
        var first = form.querySelector('input[name="routine_name"]');
        if (first) first.focus();
        // scroll into view
        form.scrollIntoView({behavior: 'smooth', block: 'center'});
      });
    }
  });
})();
