
/**
 * @fileoverview Calendar control.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Constructor of Calendar.
 * @param {string|Node} container The HTML container or its ID.
 * @param {Object=} opt_options Optional options.
 * @extends {dom.EventDispatcher} dom.EventDispatcher
 * @constructor
 * @requires formatters.DateFormatter
 * @requires locale.Calendar
 * @example
 * &lt;style>
 * table.calendar {border: solid 1px gray; border-collapse: collapse;}
 * table.calendar thead {background: silver;}
 * table.calendar td,
 * table.calendar th {border: solid 1px gray;}
 * table.calendar td.today {font-weight: bold; background: silver;}
 * table.calendar td.active {font-weight: bold; background: blue; color: white;}
 * table.calendar td.disabled {color: gray;}
 * table.calendar th.prev,
 * table.calendar th.next {cursor: pointer;}
 * &lt;/style>
 * &lt;div id="calendar-container">&lt;/div>
 * &lt;script>controls.Calendar.draw('calendar-container');&lt;/script>
 * &lt;script>
 * var cal = new controls.Calendar('calendar-container', {
 *   'format': 'YYYY-MM-dd', // Default date format.
 *   'selectable': false,    // Specifies if date is selectable.
 *   'multiple': false,      // Allows multiple selection.
 *   'empty-row': false      // Display an empty row for short month.
 * });
 * cal.draw();
 * &lt;/script>
 * <style>
 * table.calendar {border: solid 1px gray; border-collapse: collapse;
 *                 background: white; font-family: Arial; font-size: 13px;}
 * table.calendar thead {background: silver;}
 * table.calendar td,
 * table.calendar th {border: solid 1px gray;}
 * table.calendar td.today {font-weight: bold; background: silver;}
 * table.calendar td.active {font-weight: bold; background: blue; color: white;}
 * table.calendar td.disabled {color: gray;}
 * table.calendar th.prev,
 * table.calendar th.next {cursor: pointer;}
 * </style>
 * <script src="../bin/jscb.js"></script>
 * <div id="calendar-container"></div>
 * <script>controls.Calendar.draw('calendar-container')</script>
 */
controls.Calendar = function(container, opt_options) {
  dom.EventDispatcher.apply(this, arguments);

  opt_options = opt_options || {};
  opt_options['format'] = opt_options['format'] || 'YYYY-MM-dd';
  //opt_options['selectable'] = opt_options['selectable'] || true;
  //opt_options['multiple'] = opt_options['multiple'] || true;
  //opt_options['empty-row'] = opt_options['empty-row'] || true;

  /**
   * Enumeration of calendar events.
   * @enum {string}
   * @example <code>{
   *  PREV_MONTH, NEXT_MONTH, DRAW
   * }</code>
   */
  this.events = {
    NEXT_MONTH: 'next.month',
    PREV_MONTH: 'prev.month',
    DRAW: 'draw'
  };

  /**
   * Draws calendar into specified <code>container</code>.
   * Dispatches <code>controls.Calendar.events.DRAW</code> event and
   * dispatches <code>dom.events.TYPE.CLICK</code> event when clicking on cell.
   * Exported for closure compiler with the same name.
   * @param {Array.<Date>|Date=} opt_selected Optional list of selected dates.
   */
  this.draw = function(opt_selected) {
    initSelection_(opt_selected);

    container_.innerHTML = '<table class="calendar skiptranslate">' +
                           thead_(navDate_) +
                           tbody_(navDate_) + '</table>';
    /** @type {!HTMLTableElement} */ var table = getTable_();

    if (!opt_options['empty-row']) {
      removeEmptyRow_(table);
    }

    initEvents_(table);
    self_.dispatchEvent(self_.events.DRAW);
  };

  // Export for closure compiler.
  this['draw'] = this.draw;

  /**
   * Gets selected calendar date.
   * @return {!Date} Returns calendar date.
   */
  this.getDate = function() {
    return selected_[0] || new Date;
  };

  /**
   * Gets current displayed calendar date.
   * @return {!Date} Returns current displayed calendar date.
   */
  this.getNavDate = function() {
    return navDate_ || new Date;
  };

  /**
   * Sets current displayed calendar date.
   * @param {!Date} date Date to be set.
   */
  this.setNavDate = function(date) {
    if (date) {
      navDate_ = date;
    }
  };

  /**
   * Gets selected calendar dates.
   * @return {!Array.<!Date>} Returns calendar dates.
   */
  this.getDates = function() {
    return selected_;
  };

  /**
   * Iterates over table cells.
   * @param {!function(Element)} callback Iterator callback function.
   */
  this.each = function(callback) {
    /** @type {Array|NodeList} */
    var cells = dom.getElementsByTagName(getTable_(), 'TD') || [];
    for (/** @type {number} */ var i = 0; i < cells.length;) {
      callback(cells[i++]);
    }
  };

  /**
   * Clears today, selected and active days.
   */
  this.clear = function() {
    selected_ = [];
    var cellDate;
    var now = formatter_.format(new Date(), 'YYYY-MM-dd');
    self_.each(function(cell) {
      cellDate = cell.getAttribute('value');
      dom.css.setClass(cell, cellDate > now ? 'disabled' : cellDate == now ?
          'today' : '');
    });
  };

  /**
   * @return {!HTMLTableElement} Returns reference to table element.
   * @private
   */
  function getTable_() {
    return dom.getElementsByTagName(container_, 'TABLE')[0];
  }

  /**
   * @param {!HTMLTableElement} table The table element.
   * @private
   */
  function removeEmptyRow_(table) {
    /** @type {HTMLCollection} */ var rows = table.rows;
    /** @type {HTMLTableRowElement} */ var row = rows[rows.length - 1];
    /** @type {number} */ var content = 0;
    for (/** @type {number} */ var i = 0; i < row.cells.length;) {
      content += +row.cells[i++].innerHTML || 0;
    }

    if (!content) {
      table.deleteRow(table.rows.length - 1);
    }
  }

  /**
   * @param {Array.<Date>|Date=} opt_selected Optional list of selected dates.
   * @private
   */
  function initSelection_(opt_selected) {
    opt_selected = opt_selected || new Date;
    if (!(opt_selected instanceof Array)) {
      opt_selected = [opt_selected];
    }

    navDate_ = navDate_ || new Date(opt_selected[0].getTime());
    selected_[0] = selected_[0] || opt_selected[0];
    if (opt_options['multiple']) {
      for (/** @type {number} */ var i = 1; i < opt_selected.length; i++) {
        selected_[i] = opt_selected[i];
      }
    }
  }

  /**
   * @param {!HTMLTableElement} table The table element.
   * @private
   */
  function initEvents_(table) {
    /** @type {!HTMLCollection} */ var headers = table.rows[0].cells;
    /** @type {Array.<Node>} */ var cells = [
      headers[0],
      headers[headers.length - 1]
    ];
    for (/** @type {number} */ var i = 0; i < cells.length; i++) {
      dom.events.addEventListener(cells[i], dom.events.TYPE.CLICK, function(e) {
        e = e || window.event;
        self_.dispatchEvent((e.target || e.srcElement).cellIndex ?
            self_.events.NEXT_MONTH : self_.events.PREV_MONTH);
      });
    }

    if (opt_options['selectable']) {
      self_.each(function(cell) {
        dom.events.addEventListener(cell, dom.events.TYPE.CLICK, clickHandler_);
      });
    }
  }

  /**
   * @param {Event} e The event.
   * @private
   */
  function clickHandler_(e) {
    e = e || window.event;
    /** @type {Element} */ var target = e.target || e.srcElement;
    if (!isNaN(+target.innerHTML)) {
      /** @type {Date} */ var selected = formatter_.parse(
          target.getAttribute('value'), opt_options['format']);

      if (opt_options['multiple'] && !first_) {
        selected_.push(selected);
        /** @type {number} */ var index = selected_.length - 1;
        if (selected_[0] > selected_[index]) {
          selected_.reverse();
        }

        /** @type {Date} */ var start = selected_[0];
        /** @type {Date} */ var end = new Date(selected_[index]);
        while (end > start) {
          end.setDate(end.getDate() - 1);
          selected_.splice(1, 0, new Date(end.getTime()));
        }

        self_.draw(selected_);
      } else {
        self_.clear();
        dom.css.setClass(target, 'active');
        selected_[0] = selected;
      }
      first_ = !first_;
      self_.dispatchEvent(dom.events.TYPE.CLICK);
    }
  }

  /**
   * @param {number} index Navigation direction index.
   * @private
   */
  function navigate_(index) {
    navDate_.setDate(1);
    navDate_.setMonth(navDate_.getMonth() + (index ? 1 : -1));
    self_.draw();
  }

  /**
   * @param {!Date} date The date object.
   * @return {string} Returns <TBODY> html markup.
   * @private
   */
  function tbody_(date) {
    /** @type {!Date} */ var now = new Date;
    /** @type {number} */ var year = date.getFullYear();
    /** @type {number} */ var month = date.getMonth();

    // Fix date bug when current day is 31st.
    /** @type {number} */ var fix = new Date(year, month, 1).getDay() + 1;

    /** @type {Array} */
    var dim = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    dim[1] = (((year % 100 != 0) && (year % 4 == 0)) ||
        (year % 400 == 0)) ? 29 : 28;

    /** @type {string} */ var tbody = '<tbody><tr>';
    for (/** @type {number} */ var i = 1; i <= 42; i++) {
      /** @type {number} */
      var day = ((i - fix >= 0) && (i - fix < dim[month])) ? i - fix + 1 : 0;
      /** @type {string} */
      var value = !day ? '' : formatter_.format(
          new Date(year, month, day), opt_options['format']);

      /** @type {string} */ var className = getCellCssClass_(date, now, day);
      tbody += '<td align="right" class="' + className + '"' +
               ' value="' + value + '">' + (day || '&nbsp;') + '</td>';
      if (((i) % 7 == 0) && (i < 36)) tbody += '</tr><tr>';
    }
    tbody += '</tr></tbody>';
    return tbody;
  }

  /**
   * @param {!Date} date The date object.
   * @return {string} Returns <THEAD> HTML markup.
   * @private
   */
  function thead_(date) {
    return '<thead><tr><th class=prev>&lt;</th><th colspan=5>' +
           locale_.getMonthName(date) + ' ' + date.getFullYear() +
           '</th><th class=next>&gt;</th></tr><tr><th>' +
           (locale_.getWeekNames().join('</th><th>')) + '</th></tr></thead>';
  }

  /**
   * @param {!Date} date The calendar date.
   * @param {!Date} now The current date.
   * @param {number} day The calendar day.
   * @return {string} Returns cell CSS class for calendar <code>day</code>.
   * @private
   */
  function getCellCssClass_(date, now, day) {
    /** @type {number} */ var year = date.getFullYear();
    /** @type {number} */ var month = date.getMonth();
    /** @type {number} */ var active = 0;
    /** @type {boolean} */ var disabled = new Date(year, month, day) > now;
    /** @type {number} */
    var today = (year == now.getFullYear() &&
                 month == now.getMonth()) ? now.getDate() : 0;

    for (/** @type {number} */ var i = 0; i < selected_.length; i++) {
      /** @type {Date} */ var selected = selected_[i];
      if (year == selected.getFullYear() &&
          month == selected.getMonth() &&
          day == selected.getDate()) {
        active = day;
        break;
      }
    }

    return day ? (day == today ? 'today' :
        (active ? 'active' :
        (disabled ? 'disabled' : ''))) : '';
  }

  /**
   * @private
   */
  function init_() {
    self_.addEventListener(self_.events.PREV_MONTH, function() {navigate_(0);});
    self_.addEventListener(self_.events.NEXT_MONTH, function() {navigate_(1);});
  }

  /**
   * The reference to current class instance. Used in private methods.
   * @type {!controls.Calendar}
   * @private
   */
  var self_ = this;

  /**
   * @type {!locale.Calendar}
   * @private
   */
  var locale_ = new locale.Calendar;

  /**
   * @type {!formatters.DateFormatter}
   * @private
   */
  var formatter_ = new formatters.DateFormatter;

  /**
   * List of selected dates.
   * @type {!Array.<Date>}
   * @private
   */
  var selected_ = [];

  /**
   * @type {!Date}
   * @private
   */
  var navDate_;

  /**
   * Indicates first click, selecting start date.
   * @type {boolean}
   * @private
   */
  var first_ = true;

  /**
   * The reference to HTML chart container.
   * @type {Node}
   * @private
   */
  var container_ = typeof container == 'string' ?
      dom.getElementById(container) : container;

  init_();
};


/**
 * Draws calendar into specified <code>container</code>.
 * @param {Node|string} container The HTML container or its ID.
 * @param {Array.<Date>|Date=} opt_selected Optional list of selected dates.
 * @param {Object=} opt_options Optional options.
 * @return {controls.Calendar} Returns reference to controls.Calendar instance.
 * @static
 */
controls.Calendar.draw = function(container, opt_selected, opt_options) {
  var calendar = new controls.Calendar(container, opt_options);
  calendar.draw(opt_selected);
  return calendar;
};

// Export for closure compiler.
controls.Calendar['draw'] = controls.Calendar.draw;

// Export for closure compiler.
controls['Calendar'] = controls.Calendar;


