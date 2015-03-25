
/**
 * @fileoverview Implementation of HTML5 input type="range" control.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Constructor of InputRange.
 * @param {string|Element} input The input element or its ID attribute.
 * @param {Object=} opt_options A optional control's configuration options.
 * @constructor
 * @link http://www.w3.org/TR/html-markup/input.range.html
 */
controls.html5.InputRange = function(input, opt_options) {

  /**
   * Defaults control options.
   * @dict
   * @see controls.html5.InputRange#getOptions_
   * @private
   */
  var defaults_ = {
    'input': {
      'border': 'inset 1px #ddd',
      'height': 1,
      'color': '#fff'
    },
    'point': {
      'border': 'solid 1px #333',
      'size' : 10,
      'color': '#eee'
    }
  };

  /**
   * @private
   */
  function init_() {
    if ('range' != input_.type) {
      options_ = getOptions_(opt_options);

      input_.style.border = options_['input']['border'];
      input_.style.height = options_['input']['height'] + 'px';
      input_.style.backgroundColor =
          input_.style.color = options_['input']['color'];
      getWrapper_().appendChild(getPoint_());

      dom.events.addEventListener(
          input_, dom.events.TYPE.MOUSEDOWN, mousedown_);
      dom.events.addEventListener(
          point_, dom.events.TYPE.MOUSEDOWN, mousedown_);
    }
  }

  /**
   * @return {Element} Returns reference to draggable element.
   * @private
   */
  function getPoint_() {
    if (!point_) {
      point_ = dom.createElement('DIV');
      point_.style.border = options_['point']['border'];
      point_.style.height = options_['point']['size'] + 'px';
      point_.style.width = options_['point']['size'] + 'px';
      point_.style.backgroundColor = options_['point']['color'];
      point_.style.position = 'absolute';
      point_.style.borderRadius = '50%';
      point_.style.top = '2px';
      point_.style.left = (input_.offsetWidth / 2) + 2 + 'px';
    }
    return point_;
  }

  /**
   * @return {Element} Returns reference to wrapper element.
   * @private
   */
  function getWrapper_() {
    if (!wrapper_) {
      wrapper_ = dom.createElement('SPAN');
      wrapper_.style.position = 'relative';
      dom.css.setClass(wrapper_, 'input-range-wrapper');
      input_.parentNode.insertBefore(wrapper_, input_);
      wrapper_.appendChild(input_);
    }
    return wrapper_;
  }

  /**
   * @param {Event} e The mousedown event.
   * @private
   */
  function mousedown_(e) {
    e = e || window.event;
    if ((e.target || e.srcElement) == point_) {
      dom.events.addEventListener(
          dom.document, dom.events.TYPE.MOUSEMOVE, mousemove_);
      dom.events.addEventListener(
          dom.document, dom.events.TYPE.MOUSEUP, mouseup_);
    }
    mousemove_(e);
  }

  /**
   * @param {Event} e The mouseup event.
   * @private
   */
  function mouseup_(e) {
    dom.events.removeEventListener(
        dom.document, dom.events.TYPE.MOUSEMOVE, mousemove_);
    dom.events.removeEventListener(
        dom.document, dom.events.TYPE.MOUSEUP, mouseup_);
  }

  /**
   * @param {Event} e The mousemove event.
   * @private
   */
  function mousemove_(e) {
    e = e || window.event;
    /** @type {Object} */ var rect = dom.getBoundingClientRect(input_);
    /** @type {number} */ var x = e.clientX;
    if (x && x >= rect['left'] && x <= rect['right']) {
      point_.style.left = x - rect['left'] + 'px';
      /** @type {number} */ var value = +(input_.value || 0);
      if (value >= min_ && value <= max_) {
        // TODO: Increment / decrement value.
        // TODO: Use step attribute.
        input_.value = value;
        dispatchEvents_();
      }
    }
    // Prevent text selection.
    dom.events.preventDefault(e);
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
   * Gets control's options merged with defaults control's options.
   * @param {Object=} opt_options A optional control's configuration options.
   * @return {!Object.<string, *>} A map of name/value pairs.
   * @private
   */
  function getOptions_(opt_options) {
    return mergeOptions_(defaults_, opt_options || {});
  }

  /**
   * Merges control options with defaults options.
   * @param {!Object.<string, *>} defaults Options map.
   * @param {!Object.<string, *>} options Options map.
   * @return {!Object.<string, *>} A map of key/value pairs of options.
   * @private
   */
  function mergeOptions_(defaults, options) {
    for (/** @type {string} */ var key in options) {
      if (options[key] instanceof Array) {
        defaults[key] = [].concat(options[key]);
      } else if (typeof options[key] == 'object') {
        defaults[key] = mergeOptions_(
            /** @type {!Object.<string, *>} */ (defaults[key] || {}),
            /** @type {!Object.<string, *>} */ (options[key]));
      } else {
        defaults[key] = options[key];
      }
    }
    return /** @type {!Object.<string, *>} */ (defaults);
  };

  /**
   * The reference to wrapper element.
   * @type {Element}
   * @private
   */
  var wrapper_ = null;

  /**
   * The reference to draggable element.
   * @type {Element}
   * @private
   */
  var point_ = null;

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
   * Storage for configuration options.
   * @dict
   * @private
   */
  var options_ = null;

  init_();
};

