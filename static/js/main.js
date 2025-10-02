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
    var evs = eventsByDate[dateKey] || [];
    details.innerHTML = '';

    var parts = dateKey.split('-');
    var display = parts[2] + '-' + parts[1] + '-' + parts[0].slice(2);
    var heading = document.createElement('h4');
    heading.textContent = display;
    details.appendChild(heading);

    if (!evs.length) {
      var p = document.createElement('p');
      p.textContent = 'No events';
      details.appendChild(p);
    } else {
      evs.forEach(function(ev) {
        var div = document.createElement('div');
        div.className = 'sc-event';
        var name = document.createElement('div');
        name.textContent = ev.eventName || '(Unnamed)';
        var status = document.createElement('div');
        status.textContent = ev.completed ? 'Completed' : 'Missed';
        status.className = ev.completed ? 'sc-ok' : 'sc-miss';
        div.appendChild(name);
        div.appendChild(status);
        details.appendChild(div);
      });
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
})();

