
/**
 * @fileoverview DatePicker control.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Constructor of DatePicker.
 * @param {Object=} opt_options Optional options.
 * @constructor
 * @requires formatters.DateFormatter
 * @requires controls.Calendar
 * @example
 * &lt;input onclick="controls.DatePicker.show(this)"
 *        data-format="YYYY/MM/dd"
 *        value="2013/06/20"
 *        readonly&gt;
 * &lt;input onclick="controls.DatePicker.show(this)"
 *        data-format="MMM dd YYYY"
 *        value="May 20 2013"
 *        readonly&gt;
 * <style>
 * table.calendar {border: solid 1px gray; border-collapse: collapse;
 *                 background: white; font-family: Arial; font-size: 13px;}
 * table.calendar thead {background: silver;}
 * table.calendar td,
 * table.calendar th {border: solid 1px gray;}
 * table.calendar td.today {font-weight: bold; background: silver;}
 * table.calendar td.active {font-weight: bold; background: blue; color: white;}
 * table.calendar th.prev,
 * table.calendar th.next {cursor: pointer;}
 * </style>
 * <script src="../bin/jscb.js"></script>
 * <input onclick="controls.DatePicker.show(this)"
 *        data-format="YYYY/MM/dd" value="2013/06/20" readonly>
 */
controls.DatePicker = function(opt_options) {

  opt_options = opt_options || {};
  opt_options['selectable'] = true;
  opt_options['format'] = opt_options['format'] || 'YYYY-MM-dd';

  /**
   * Gets date format.
   * <br>Gets date format from element <code>data-format</code> attribute,
   * otherwise returns <code>YYYY-MM-dd</code>.
   * @return {string} Returns date format.
   */
  this.getFormat = function() {
    return element_.getAttribute('data-format') || opt_options['format'];
  };

  /**
   * <code>protected</code> Gets related HTML element.
   * @return {Node} Returns related HTML element.
   * @protected
   */
  this.getElement = function() {
    return element_;
  };

  /**
   * <code>protected</code> Gets reference to
   * <code>{@link controls.Calendar}</code>.
   * @return {controls.Calendar} Returns reference to
   * <code>{@link controls.Calendar}</code>.
   * @protected
   */
  this.getCalendar = function() {
    return calendar_;
  };

  /**
   * Shows date picker control.
   * @param {Node|Element} element The related element.
   * @example
   * &lt;input onclick="controls.DatePicker.show(this)"
   *        data-format="YYYY/MM/dd"
   *        value="2013/06/20"
   *        readonly&gt;
   */
  this.show = function(element) {
    /** @type {Node} */ var picker = controls.DatePicker.control_;
    if (picker.style.display == 'block') {
      self_.hide();
    } else {
      element_ = element;
      draw_();
      /** @type {number} */ var y = dom.document.documentElement.scrollTop ||
                                    window.pageYOffset || 0;
      /** @type {number} */ var x = dom.document.documentElement.scrollLeft ||
                                    window.pageXOffset || 0;
      /** @type {Object} */ var rect = dom.getBoundingClientRect(element);
      // TODO: implement possibility to show picker above element.
      picker.style.top = (rect['bottom'] + y) + 'px';
      picker.style.left = (rect['left'] + x) + 'px';
      picker.style.display = 'block';
      dom.events.addEventListener(
          dom.document, dom.events.TYPE.KEYDOWN, keydown_);
      dom.events.addEventListener(
          dom.document, dom.events.TYPE.MOUSEDOWN, mousedown_);
    }
  };

  // Export for closure compiler.
  this['show'] = this.show;

  /**
   * Hides date picker control.
   */
  this.hide = function() {
    if (controls.DatePicker.control_)
      controls.DatePicker.control_.style.display = 'none';
    dom.events.removeEventListener(
        dom.document, dom.events.TYPE.KEYDOWN, keydown_);
    dom.events.removeEventListener(dom.document,
        dom.events.TYPE.MOUSEDOWN, mousedown_);
  };

  // Export for closure compiler.
  this['hide'] = this.hide;

  /**
   * Sets formatted date as element value.
   * <br><i>Note:</i> For HTML form elements sets <code>value</code> attribute,
   * for other HTML elements sets <code>innerHTML</code>.
   * Dispatches {@link dom.events.TYPE.CHANGE} event.
   * @param {string} value The formatted date value.
   */
  this.setValue = function(value) {
    if ('value' in element_) element_.value = value;
    else element_.innerHTML = value;
    dom.events.dispatchEvent(element_, dom.events.TYPE.CHANGE);
  };

  /**
   * Gets element value.
   * <br><i>Note:</i> From HTML form elements gets <code>value</code> attribute,
   * from other HTML elements gets <code>textContent || innerText</code>.
   * @return {string} Returns element value.
   */
  this.getValue = function() {
    return element_.getAttribute('data-value') || element_.value ||
           element_.textContent || element_.innerText;
  };

  /**
   * <code>protected</code> Gets list of date objects.
   * @return {!Array.<Date>} Returns list of date objects.
   * @protected
   */
  this.getDates = function() {
    /** @type {string} */ var value = self_.getValue();
    return [value ? formatter_.parse(value, self_.getFormat()) : new Date];
  };

  /**
   * Handles calendar click event.
   * @protected
   */
  this.clickHandler = function() {
    self_.setValue(formatter_.format(calendar_.getDate(), self_.getFormat()));
    self_.hide();
  };

  /**
   * @private
   */
  function draw_() {
    calendar_ ? calendar_.clear() : init_();
    calendar_.draw(self_.getDates());
    calendar_.addEventListener(dom.events.TYPE.CLICK, self_.clickHandler);
  }

  /**
   * @private
   */
  function init_() {
    if (!controls.DatePicker.control_) {
      controls.DatePicker.control_ = dom.document.body.appendChild(
          dom.createElement('DIV'));
      controls.DatePicker.control_.style.position = 'absolute';
      dom.css.setClass(controls.DatePicker.control_, 'date-picker');
    }
    calendar_ = new controls.Calendar(
        controls.DatePicker.control_, opt_options);
  }

  /**
   * @param {Event} e The keydown event.
   * @private
   */
  function keydown_(e) {
    e = e || window.event;
    /** @type {number} */ var code = e.keyCode || e.which;
    if (27 == code) {
      self_.hide();
    }
  }

  /**
   * @param {Event} e The mousedown event.
   * @private
   */
  function mousedown_(e) {
    e = e || window.event;
    /** @type {boolean} */ var hide = true;
    /** @type {Node|Element} */ var target = e.target || e.srcElement;
    if (target) {
      while (target && target.tagName != 'BODY') {
        if (target == controls.DatePicker.control_) {
          hide = false;
          break;
        }
        target = target.parentNode;
      }
      if (hide) self_.hide();
    }
  }

  /**
   * The reference to current class instance. Used in private methods.
   * @type {!controls.DatePicker}
   * @private
   */
  var self_ = this;

  /**
   * @type {Node}
   * @private
   */
  var element_ = null;

  /**
   * @type {controls.Calendar}
   * @private
   */
  var calendar_ = null;

  /**
   * @type {!formatters.DateFormatter}
   * @private
   */
  var formatter_ = new formatters.DateFormatter;

  init_();
};


/**
 * Shows date picker control.
 * @param {Node} element The related element.
 * @static
 */
controls.DatePicker.show = function(element) {
  if (!element.picker_) {
    element.picker_ = new controls.DatePicker;
  }
  element.picker_.show(element);
};

// Export for closure compiler.
controls.DatePicker['show'] = controls.DatePicker.show;

// Export for closure compiler.
controls['DatePicker'] = controls.DatePicker;
