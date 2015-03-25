
/**
 * @fileoverview Implementation of HTML5 input type="date" control.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Constructor of InputDate.<br>
 * The following 8 pseudo-elements are made available by WebKit for customizing
 * a date input’s textbox:<code><pre>
 *   ::-webkit-datetime-edit { padding: 1em; }
 *   ::-webkit-datetime-edit-fields-wrapper { background: silver; }
 *   ::-webkit-datetime-edit-text { color: red; padding: 0 0.3em; }
 *   ::-webkit-datetime-edit-month-field { color: blue; }
 *   ::-webkit-datetime-edit-day-field { color: green; }
 *   ::-webkit-datetime-edit-year-field { color: purple; }
 *   ::-webkit-inner-spin-button { display: none; }
 *   ::-webkit-calendar-picker-indicator { background: orange; }
 * </pre></code>
 * @param {string|Element} input The input element or its ID attribute.
 * @constructor
 * @requires controls.DatePicker
 * @requires formatters.DateFormatter
 * @link http://www.w3.org/TR/html-markup/input.date.html
 */
controls.html5.InputDate = function(input) {
  // http://trac.webkit.org/wiki/Styling%20Form%20Controls
  // There are no ways to specify the date format in the text box. It always
  // reflects OS setting. Also, there are no ways to styling the native
  // calendar picker.

  /**
   * @private
   */
  function init_() {
    if ('date' != input_.type) {
      picker_ = new controls.DatePicker;
      dom.events.addEventListener(input_, dom.events.TYPE.CLICK, mousedown_);
      dom.events.addEventListener(input_, dom.events.TYPE.CHANGE, change_);
      input_.readOnly = true;

      // -moz-appearance: menulist;
      // -webkit-appearance: menulist;

      //input_.style.backgroundImage = 'url(data:image/png;base64,' +  + ')';
      //input_.style.backgroundPosition = 'right center';
      //input_.style.backgroundRepeat = 'no-repeat';
      //input_.style.paddingRight = PADDING + 'px';
    }
  }

  /**
   * @param {Event} e The mousedown event.
   * @private
   */
  function mousedown_(e) {
    picker_.show(input_);
  }

  /**
   * @param {Event} e The onchange event.
   * @private
   */
  function change_(e) {
    /** @type {string} */ var format = picker_.getFormat();
    /** @type {Date} */
    var value = formatters.DateFormatter.parse(input_.value, format);
    if (value) {
      if (max_) {
        /** @type {Date} */
        var max = formatters.DateFormatter.parse(max_, format);
        if (value > max) {
          value = max;
        }
      }

      if (min_) {
        /** @type {Date} */
        var min = formatters.DateFormatter.parse(min_, format);
        if (value < min) {
          value = min;
        }
      }

      input_.value = formatters.DateFormatter.format(value, format);
    }
  }

  /**
   * @type {controls.DatePicker}
   * @private
   */
  var picker_ = null;

  /**
   * The reference to input element.
   * @type {Element}
   * @private
   */
  var input_ = typeof input == 'string' ? dom.getElementById(input) : input;

  /**
   * The expected lower bound for the input value.
   * A valid full-date as defined in [RFC 3339].
   * @link http://tools.ietf.org/html/rfc3339
   * @type {string}
   * @private
   */
  var min_ = input_.getAttribute('min') || '';

  /**
   * The expected upper bound for the input value.
   * A valid full-date as defined in [RFC 3339].
   * @link http://tools.ietf.org/html/rfc3339
   * @type {string}
   * @private
   */
  var max_ = input_.getAttribute('max') || '';

  /**
   * Specifies the value granularity of the input value.
   * Currently not used.
   * @type {number}
   * @private
   */
  var step_ = +(input_.getAttribute('step') || 1);

  init_();
};
