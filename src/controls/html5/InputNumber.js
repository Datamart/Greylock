
/**
 * @fileoverview Implementation of HTML5 input type="number" control.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Constructor of InputNumber.
 * An implementation of HTML5 input type="number" for non HTML5 browsers.
 * @param {string|Element} input The input element or its ID attribute.
 * @constructor
 * @link http://www.w3.org/TR/html-markup/input.number.html
 */
controls.html5.InputNumber = function(input) {

  /**
   * @private
   */
  function init_() {
    // @bug: https://bugzilla.mozilla.org/show_bug.cgi?id=344616
    if ('number' != input_.type) {
      dom.events.addEventListener(input_, dom.events.TYPE.KEYDOWN, keydown_);
      dom.events.addEventListener(
          input_, dom.events.TYPE.MOUSEDOWN, mousedown_);
      dom.events.addEventListener(
          input_, dom.events.TYPE.MOUSEMOVE, mousemove_);
      if (!input_.getAttribute('pattern')) {
        input_.setAttribute('pattern', '^\-?[0-9]+$');
      }
      if (!input_.getAttribute('maxlength')) {
        input_.setAttribute('maxlength', ('' + max_).length);
      }
      input_.style.backgroundImage = 'url(data:image/png;base64,' + img_ + ')';
      input_.style.backgroundPosition = 'right center';
      input_.style.backgroundRepeat = 'no-repeat';
      input_.style.paddingRight = padding_ + 'px';
    }
  }

  /**
   * @private
   */
  function increment_() {
    /**@type {number} */ var value = parseInt(input_.value, 10) || 0;
    input_.value = Math.min(value + step_, max_);
    dispatchEvents_();
  }

  /**
   * @private
   */
  function decrement_() {
    /**@type {number} */ var value = parseInt(input_.value, 10) || 0;
    input_.value = Math.max(value - step_, min_);
    dispatchEvents_();
  }

  /**
   * @param {Event} e The keydown event.
   * @private
   */
  function keydown_(e) {
    e = e || window.event;
    if (isNaN(input_.value)) {
      input_.focus();
    } else {
      if (e.keyCode == 38) increment_();
      else if (e.keyCode == 40) decrement_();
    }
  }

  /**
   * @param {Event} e The mousedown event.
   * @private
   */
  function mousedown_(e) {
    e = e || window.event;
    /** @type {Object} */ var rect = dom.getBoundingClientRect(input_);
    /** @type {number} */ var x = e.clientX;
    /** @type {number} */ var y = e.clientY;
    if (x && x > rect['right'] - padding_) {
      // @bug MSIE does not calculates rect.height for inline elements.
      /** @type {number} */ var height = rect['height'] || input_.offsetHeight;
      if (y < rect['top'] + height / 2) {
        increment_();
      } else {
        decrement_();
      }
    }
  }

  /**
   * @param {Event} e The mousemove event.
   * @private
   */
  function mousemove_(e) {
    e = e || window.event;
    /** @type {Object} */ var rect = dom.getBoundingClientRect(input_);
    /** @type {number} */ var x = e.clientX;
    if (x && x > rect['right'] - padding_) {
      input_.style.cursor = 'default';
    } else {
      input_.style.cursor = 'text';
    }
  }

  /**
   * Dispatches input events.
   * @return {boolean} Returns <code>true</code> if all events are
   * dispatched successfully.
   * @private
   */
  function dispatchEvents_() {
    /** @type {boolean} */
    var result = dom.events.dispatchEvent(input_, 'input');
    result = dom.events.dispatchEvent(input_, dom.events.TYPE.CHANGE) && result;
    return result;
  }

  /**
   * The reference to input element.
   * @type {Element}
   * @private
   */
  var input_ = typeof input == 'string' ? dom.getElementById(input) : input;

  /**
   * The expected lower bound for the input value.
   * @type {number}
   * @private
   */
  var min_ = +(input_.getAttribute('min') || -1e6);

  /**
   * The expected upper bound for the input value.
   * @type {number}
   * @private
   */
  var max_ = +(input_.getAttribute('max') || 1e6);

  /**
   * Specifies the value granularity of the input value.
   * @type {number}
   * @private
   */
  var step_ = +(input_.getAttribute('step') || 1);

  /**
   * Base64 encoded PNG top-bottom arrows image.
   * @type {string}
   * @private
   */
  var img_ = 'iVBORw0KGgoAAAANSUhEUgAAAA8AAAAQBAMAAAA7eDg3AAAAA3NCSVQICAjb4U' +
             '/gAAAACXBIWXMAAAsSAAALEgHS3X78AAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBG' +
             'aXJld29ya3MgQ1M26LyyjAAAABR0RVh0Q3JlYXRpb24gVGltZQA2LzYvMTOlfn' +
             '1pAAAAElBMVEUAAABmZmb///9kZGRmZmZmZmaw6hPAAAAABXRSTlMAAAAB/Rh8' +
             'uVEAAAArSURBVAjXY1CCAAUGvAwFViYoIzQIwlANDYWKMDChMRBSroEw7UYErY' +
             'AwAOxWEY6fpOynAAAAAElFTkSuQmCC';

  /**
   * Input's right padding. (Actual background image width.)
   * @type {number}
   * @private
   */
  var padding_ = 16;

  init_();
};
