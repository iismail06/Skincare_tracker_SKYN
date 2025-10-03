// 🌙 Theme Toggle Functionality
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

// --- simple_calendar.js ---
(function() {
  var root = document.querySelector('#calendar');
  if (!root) return;

  var events = (window.ROUTINE_EVENTS && Array.isArray(window.ROUTINE_EVENTS)) ? window.ROUTINE_EVENTS : [];
  var eventsByDate = {};
  events.forEach(function(ev) {
    if (!ev || !ev.date) return;
    eventsByDate[ev.date] = ev;
  });

  var state = {
    year: (new Date()).getFullYear(),
    month: (new Date()).getMonth() // 0-indexed
  };

  function render() {
  root.innerHTML = '';

    var header = document.createElement('div');
    header.className = 'sc-header';
    var prevBtn = document.createElement('button');
    prevBtn.textContent = '<';
    prevBtn.addEventListener('click', function() { changeMonth(-1); });
    var nextBtn = document.createElement('button');
    nextBtn.textContent = '>';
    nextBtn.addEventListener('click', function() { changeMonth(1); });
    var title = document.createElement('div');
    title.className = 'sc-title';
    title.textContent = new Date(state.year, state.month).toLocaleString(undefined, { month: 'long', year: 'numeric' });

    header.appendChild(prevBtn);
    header.appendChild(title);
    header.appendChild(nextBtn);
    root.appendChild(header);

    var dow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var dowRow = document.createElement('div');
    dowRow.className = 'sc-dow';
    dow.forEach(function(d) {
      var cell = document.createElement('div');
      cell.className = 'sc-dow-cell';
      cell.textContent = d;
      dowRow.appendChild(cell);
    });
    root.appendChild(dowRow);

    var grid = document.createElement('div');
    grid.className = 'sc-grid';

    var first = new Date(state.year, state.month, 1);
    var startWeekday = first.getDay();
    var daysInMonth = new Date(state.year, state.month + 1, 0).getDate();

    for (var i = 0; i < startWeekday; i++) {
      var blank = document.createElement('div');
      blank.className = 'sc-cell sc-other';
      grid.appendChild(blank);
    }

    for (var day = 1; day <= daysInMonth; day++) {
  var dateKey = toDateKey(state.year, state.month, day);
  var cell = document.createElement('div');
  cell.className = 'sc-cell sc-day';
  cell.dataset.date = dateKey;
  cell.id = 'calendar-day-' + dateKey;

      var num = document.createElement('div');
      num.className = 'sc-day-num';
      num.textContent = day;
      cell.appendChild(num);

      // Add icon for status
      var icon = document.createElement('div');
      icon.className = 'sc-day-icon';
      var ev = eventsByDate[dateKey];
      
      // Check if the date is in the future
      var today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      var cellDate = new Date(state.year, state.month, day);
      var isFutureDay = cellDate > today;
      
      if (ev) {
        if (ev.status === 'completed') {
          icon.textContent = '🟢';
          cell.classList.add('sc-day-completed');
        } else if (ev.status === 'not_done') {
          if (isFutureDay) {
            // Option 1: Future days - add class but leave empty (no marker)
            cell.classList.add('sc-day-future');
            // No marker for future days
            icon.textContent = '';
          } else {
            // Past missed days - red dot
            icon.textContent = '•';
            icon.style.color = '#dc3545';
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

    // === HEATMAP COLORING: Assign status classes after rendering ===
    if (window.ROUTINE_EVENTS && Array.isArray(window.ROUTINE_EVENTS)) {
      window.ROUTINE_EVENTS.forEach(function(event) {
        var dayElem = document.getElementById('calendar-day-' + event.date);
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

    // === WEEKLY STEP REMINDERS: Highlight days with weekly steps due ===
    var weeklyDueDates = [];
    try {
      weeklyDueDates = JSON.parse('{{ weekly_due_dates_json|default:"[]"|escapejs }}');
    } catch (e) {}
    weeklyDueDates.forEach(function(item) {
      var dayElem = document.getElementById('calendar-day-' + item.date);
      if (dayElem) {
        dayElem.style.border = '2px solid #ffc107'; // yellow border for weekly step
        dayElem.title = 'Weekly step: ' + item.step_name + ' (' + item.routine_type + ')';
      }
    });

    // === MONTHLY STEP REMINDERS: Highlight days with monthly steps due ===
    var monthlyDueDates = [];
    try {
      monthlyDueDates = JSON.parse('{{ monthly_due_dates_json|default:"[]"|escapejs }}');
    } catch (e) {}
    monthlyDueDates.forEach(function(item) {
      var dayElem = document.getElementById('calendar-day-' + item.date);
      if (dayElem) {
        dayElem.style.border = '2px solid #17a2b8'; // blue border for monthly step
        dayElem.title = 'Monthly step: ' + item.step_name + ' (' + item.routine_type + ')';
      }
    });

    var totalCells = startWeekday + daysInMonth;
    var trailing = (7 - (totalCells % 7)) % 7;
    for (var t = 0; t < trailing; t++) {
      var blank2 = document.createElement('div');
      blank2.className = 'sc-cell sc-other';
      grid.appendChild(blank2);
    }

    root.appendChild(grid);

    var details = document.createElement('div');
    details.className = 'sc-details';
    details.style.display = 'none';
    root.appendChild(details);
  }

  function showDetails(dateKey) {
    var details = root.querySelector('.sc-details');
    var ev = eventsByDate[dateKey];
    details.innerHTML = '';

    var parts = dateKey.split('-');
    var display = parts[2] + '-' + parts[1] + '-' + parts[0].slice(2);
    var heading = document.createElement('h4');
    heading.textContent = display;
    details.appendChild(heading);

    var found = false;
    // Show weekly routine info if present
    if (window.weeklyDueDates && Array.isArray(window.weeklyDueDates)) {
      window.weeklyDueDates.forEach(function(item) {
        if (item.date === dateKey) {
          var div = document.createElement('div');
          div.className = 'sc-event';
          div.innerHTML = '<b>Weekly Routine Step:</b> ' + item.step_name + ' <span style="color:#ffc107">(' + item.routine_type + ')</span>';
          details.appendChild(div);
          found = true;
        }
      });
    }
    // Show monthly routine info if present
    if (window.monthlyDueDates && Array.isArray(window.monthlyDueDates)) {
      window.monthlyDueDates.forEach(function(item) {
        if (item.date === dateKey) {
          var div = document.createElement('div');
          div.className = 'sc-event';
          div.innerHTML = '<b>Monthly Routine Step:</b> ' + item.step_name + ' <span style="color:#17a2b8">(' + item.routine_type + ')</span>';
          details.appendChild(div);
          found = true;
        }
      });
    }

    if (!ev && !found) {
      var p = document.createElement('p');
      p.textContent = 'No events';
      details.appendChild(p);
    } else if (ev) {
      var div = document.createElement('div');
      div.className = 'sc-event';
      var name = document.createElement('div');
      name.textContent = ev.eventName || '(Unnamed)';
      var status = document.createElement('div');
      status.textContent = (ev.status === 'completed') ? 'Completed' : 'Missed';
      status.className = (ev.status === 'completed') ? 'sc-ok' : 'sc-miss';
      div.appendChild(name);
      div.appendChild(status);
      details.appendChild(div);
    }
    details.style.display = 'block';
  }

  function toDateKey(y, m, d) {
    var mm = (m + 1).toString().padStart(2,'0');
    var dd = d.toString().padStart(2,'0');
    return y + '-' + mm + '-' + dd;
  }

  function changeMonth(delta) {
    state.month += delta;
    if (state.month < 0) { state.month = 11; state.year -= 1; }
    if (state.month > 11) { state.month = 0; state.year += 1; }
    render();
  }

  render();
// Properly close the IIFE
})();

