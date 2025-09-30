// 🌙 Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
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


// --- theme.js content from app.js ---
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggle.textContent = '\u2600\ufe0f';
    }
    
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-theme');
        
        
        if (body.classList.contains('dark-theme')) {
            themeToggle.textContent = '\u2600\ufe0f';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.textContent = '\ud83c\udf19';
            localStorage.setItem('theme', 'light');
        }
    });
});

// --- simple_calendar.js content from app.js ---
(function() {
  var root = document.querySelector('#calendar');
  if (!root) return;

  var events = (window.ROUTINE_EVENTS && Array.isArray(window.ROUTINE_EVENTS)) ? window.ROUTINE_EVENTS : [];

  // Index events by 'YYYY-MM-DD' for quick lookup
  var eventsByDate = {};
  events.forEach(function(ev) {
    if (!ev || !ev.date) return;
    var key = ev.date; // expect 'YYYY-MM-DD'
    eventsByDate[key] = eventsByDate[key] || [];
    eventsByDate[key].push(ev);
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

      var markers = document.createElement('div');
      markers.className = 'sc-markers';
      var evs = eventsByDate[dateKey] || [];
      evs.forEach(function(ev) {
        var dot = document.createElement('span');
        dot.className = 'sc-dot ' + (ev.color || 'dot-default');
        markers.appendChild(dot);
      });
      cell.appendChild(markers);

      if (evs.some(function(e){ return e && e.completed; })) {
        cell.classList.add('completed');
      }

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


// Calendar 
// Requires moment.js CDN in base.html

(function() {
  var today = moment();

  function Calendar(selector, events) {
    this.el = document.querySelector(selector);
    this.events = events;
    this.current = moment().date(1);
    this.draw();
    var current = document.querySelector('.today');
    if(current) {
      var self = this;
      window.setTimeout(function() {
        self.openDay(current);
      }, 500);
    }
  }

  Calendar.prototype.draw = function() {
    this.drawHeader();
    this.drawMonth();
    this.drawLegend();
  }

  Calendar.prototype.drawHeader = function() {
    var self = this;
    if(!this.header) {
      this.header = createElement('div', 'header');
      this.header.className = 'header';
      this.title = createElement('h1');
      var right = createElement('div', 'right');
      right.addEventListener('click', function() { self.nextMonth(); });
      var left = createElement('div', 'left');
      left.addEventListener('click', function() { self.prevMonth(); });
      this.header.appendChild(this.title); 
      this.header.appendChild(right);
      this.header.appendChild(left);
      this.el.appendChild(this.header);
    }
    this.title.innerHTML = this.current.format('MMMM YYYY');
  }

  Calendar.prototype.drawMonth = function() {
    var self = this;
    this.events.forEach(function(ev) {
     // assign a day in current month (1..28) for sample events
     var dayNum = Math.floor(Math.random() * 28) + 1;
     ev.date = self.current.clone().date(dayNum);
    });
    if(this.month) {
      this.oldMonth = this.month;
      this.oldMonth.className = 'month out ' + (self.next ? 'next' : 'prev');
      this.oldMonth.addEventListener('webkitAnimationEnd', function() {
        self.oldMonth.parentNode.removeChild(self.oldMonth);
        self.month = createElement('div', 'month');
        self.backFill();
        self.currentMonth();
        self.fowardFill();
        self.el.appendChild(self.month);
        window.setTimeout(function() {
          self.month.className = 'month in ' + (self.next ? 'next' : 'prev');
        }, 16);
      });
    } else {
        this.month = createElement('div', 'month');
        this.el.appendChild(this.month);
        this.backFill();
        this.currentMonth();
        this.fowardFill();
        this.month.className = 'month new';
    }
  }

  Calendar.prototype.backFill = function() {
    var clone = this.current.clone();
    var dayOfWeek = clone.day();
    if(!dayOfWeek) { return; }
    // move clone back to the previous Sunday
    clone.subtract(dayOfWeek, 'days');
    // draw the leading days up to the first of the month
    for(var i = 0; i < dayOfWeek; i++) {
      this.drawDay(clone.clone().add(i, 'days'));
    }
  }

  Calendar.prototype.fowardFill = function() {
    // get the last day of the current month
    var clone = this.current.clone().endOf('month');
    var dayOfWeek = clone.day();
    // draw the trailing days after the last day of month to fill the week
    for(var i = 1; dayOfWeek + i <= 6; i++) {
      this.drawDay(clone.clone().add(i, 'days'));
    }
  }

  Calendar.prototype.currentMonth = function() {
    var clone = this.current.clone();
    while(clone.month() === this.current.month()) {
      this.drawDay(clone);
      clone.add(1, 'days');
    }
  }

  Calendar.prototype.getWeek = function(day) {
    if(!this.week || day.day() === 0) {
      this.week = createElement('div', 'week');
      this.month.appendChild(this.week);
    }
  }

  Calendar.prototype.drawDay = function(day) {
    var self = this;
    this.getWeek(day);
    var outer = createElement('div', this.getDayClass(day));
    outer.addEventListener('click', function() {
      self.openDay(this);
    });
    var name = createElement('div', 'day-name', day.format('ddd'));
    var number = createElement('div', 'day-number', day.format('DD'));
    var events = createElement('div', 'day-events');
    this.drawEvents(day, events);
    outer.appendChild(name);
    outer.appendChild(number);
    outer.appendChild(events);
    this.week.appendChild(outer);
  }

  Calendar.prototype.drawEvents = function(day, element) {
    if(day.month() === this.current.month()) {
      var todaysEvents = this.events.reduce(function(memo, ev) {
        if(ev.date.isSame(day, 'day')) {
          memo.push(ev);
        }
        return memo;
      }, []);
      todaysEvents.forEach(function(ev) {
        var evSpan = createElement('span', ev.color);
        element.appendChild(evSpan);
      });
    }
  }

  Calendar.prototype.getDayClass = function(day) {
    var classes = ['day'];
    if(day.month() !== this.current.month()) {
      classes.push('other');
    } else if (today.isSame(day, 'day')) {
      classes.push('today');
    }
    return classes.join(' ');
  }

  Calendar.prototype.openDay = function(el) {
    var details, arrow;
    var dayNumber = +el.querySelectorAll('.day-number')[0].innerText || +el.querySelectorAll('.day-number')[0].textContent;
    var day = this.current.clone().date(dayNumber);
    var currentOpened = document.querySelector('.details');
    if(currentOpened && currentOpened.parentNode === el.parentNode) {
      details = currentOpened;
      arrow = document.querySelector('.arrow');
    } else {
      if(currentOpened) {
        currentOpened.addEventListener('webkitAnimationEnd', function() {
          currentOpened.parentNode.removeChild(currentOpened);
        });
        currentOpened.addEventListener('oanimationend', function() {
          currentOpened.parentNode.removeChild(currentOpened);
        });
        currentOpened.addEventListener('msAnimationEnd', function() {
          currentOpened.parentNode.removeChild(currentOpened);
        });
        currentOpened.addEventListener('animationend', function() {
          currentOpened.parentNode.removeChild(currentOpened);
        });
        currentOpened.className = 'details out';
      }
      details = createElement('div', 'details in');
      var arrow = createElement('div', 'arrow');
      details.appendChild(arrow);
      el.parentNode.appendChild(details);
    }
    var todaysEvents = this.events.reduce(function(memo, ev) {
      if(ev.date.isSame(day, 'day')) {
        memo.push(ev);
      }
      return memo;
    }, []);
    this.renderEvents(todaysEvents, details);
    arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 27 + 'px';
  }

  Calendar.prototype.renderEvents = function(events, ele) {
    var currentWrapper = ele.querySelector('.events');
    var wrapper = createElement('div', 'events in' + (currentWrapper ? ' new' : ''));
    events.forEach(function(ev) {
      var div = createElement('div', 'event');
      var square = createElement('div', 'event-category ' + ev.color);
      var span = createElement('span', '', ev.eventName);
      div.appendChild(square);
      div.appendChild(span);
      wrapper.appendChild(div);
    });
    if(!events.length) {
      var div = createElement('div', 'event empty');
      var span = createElement('span', '', 'No Events');
      div.appendChild(span);
      wrapper.appendChild(div);
    }
    if(currentWrapper) {
      currentWrapper.className = 'events out';
      currentWrapper.addEventListener('webkitAnimationEnd', function() {
        currentWrapper.parentNode.removeChild(currentWrapper);
        ele.appendChild(wrapper);
      });
      currentWrapper.addEventListener('oanimationend', function() {
        currentWrapper.parentNode.removeChild(currentWrapper);
        ele.appendChild(wrapper);
      });
      currentWrapper.addEventListener('msAnimationEnd', function() {
        currentWrapper.parentNode.removeChild(currentWrapper);
        ele.appendChild(wrapper);
      });
      currentWrapper.addEventListener('animationend', function() {
        currentWrapper.parentNode.removeChild(currentWrapper);
        ele.appendChild(wrapper);
      });
    } else {
      ele.appendChild(wrapper);
    }
  }

  Calendar.prototype.drawLegend = function() {
    var legend = createElement('div', 'legend');
    var calendars = this.events.map(function(e) {
      return e.calendar + '|' + e.color;
    }).reduce(function(memo, e) {
      if(memo.indexOf(e) === -1) {
        memo.push(e);
      }
      return memo;
    }, []).forEach(function(e) {
      var parts = e.split('|');
      var entry = createElement('span', 'entry ' +  parts[1], parts[0]);
      legend.appendChild(entry);
    });
    this.el.appendChild(legend);
  }

  Calendar.prototype.nextMonth = function() {
    this.current.add(1, 'months');
    this.next = true;
    this.draw();
  }

  Calendar.prototype.prevMonth = function() {
    this.current.subtract(1, 'months');
    this.next = false;
    this.draw();
  }

  window.Calendar = Calendar;

  function createElement(tagName, className, innerText) {
    var ele = document.createElement(tagName);
    if(className) {
      ele.className = className;
    }
    if(innerText) {
      ele.innerText = ele.textContent = innerText;
    }
    return ele;
  }
})();

// I
(function() {
  if(!document.querySelector('#calendar')) { return; }
  var data = (window.SKYNEVENTS && Array.isArray(window.SKYNEVENTS)) ? window.SKYNEVENTS : [];
  // Normalize any dates in string form to moment objects if present
  data.forEach(function(ev) {
    if(ev && ev.date && typeof ev.date === 'string') {
      ev.date = moment(ev.date);
    }
  });
  var calendar = new Calendar('#calendar', data);
})();