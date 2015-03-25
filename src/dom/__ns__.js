
/**
 * @fileoverview Defines 'dom' namespace.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */


/**
 * Defines 'dom' namespace.
 * @namespace Defines 'dom' namespace.
 */
var dom = dom || {};


/**
 * Defines 'dom.events' namespace.
 * @namespace Defines 'dom.events' namespace.
 */
dom.events = dom.events || {};


/**
 * Defines 'dom.scripts' namespace.
 * @namespace Defines 'dom.scripts' namespace.
 */
dom.scripts = dom.scripts || {};


/**
 * Defines 'dom.css' namespace.
 * @namespace Defines 'dom.css' namespace.
 */
dom.css = dom.css || {};


/**
 * Alias of W3C <code>document</code>.
 * Used to reduce size after compilation.
 * @type {!Document}
 */
dom.document = document;


/**
 * Defines default document charset.
 * @type {string}
 * @const
 */
dom.CHARSET = (dom.document.charset ||
               dom.document.characterSet ||
               'utf-8').toLowerCase();


/**
 * The "null" shortcut.
 */
dom.NULL = null;


/**
 * Alias of W3C <code>document.createElement</code>.
 * Used to reduce size after compilation.
 * @param {string} tagName Tag name.
 * @return {Element} Returns created element.
 * @static
 */
dom.createElement = function(tagName) {
  return tagName ? dom.document.createElement(tagName) : dom.NULL;
};


/**
 * Alias of W3C <code>document.getElementById</code>.
 * Used to reduce size after compilation.
 * @param {string} id A case-sensitive string representing the unique ID of the
 *     element being sought.
 * @return {Element} Returns reference to an Element object, or null if an
 *     element with the specified ID is not in the document.
 * @static
 */
dom.getElementById = function(id) {
  return id ? dom.document.getElementById(id) : dom.NULL;
};


/**
 * Alias of W3C <code>element.getElementsByTagName</code>.
 * Used to reduce size after compilation.
 * @param {!Element|Node} element Element to search tags.
 * @param {string} tagName Tag name.
 * @return {NodeList} Returns list of found elements in the
 *     order they appear in the tree.
 * @static
 */
dom.getElementsByTagName = function(element, tagName) {
  return element && element.getElementsByTagName(tagName);
};


/**
 * Alias of W3C <code>element.getElementsByClassName</code>.
 * Used to reduce size after compilation.
 * @param {!Element|Node} element Element to start searching.
 * @param {string} className Class name to match.
 * @return {!Array.<Node>|NodeList} Array of found elements.
 * @static
 */
dom.getElementsByClassName = function(element, className) {
  if (element.getElementsByClassName) {
    return element.getElementsByClassName(className);
  }

  if (element.querySelectorAll) {
    return element.querySelectorAll('.' + className);
  }

  /** @type {!RegExp} */
  var re = new RegExp('(?:^|\\s)' + className + '(?!\\S)');
  /** @type {!Array.<Node>} */ var result = [];
  /** @type {NodeList} */ var nodes = dom.getElementsByTagName(element, '*');
  for (/** @type {number} */ var i = 0; i < nodes.length; i++) {
    if (re.test(nodes[i].className)) {
      result.push(nodes[i]);
    }
  }
  return result;
};


/**
 * Alias of W3C <code>element.getBoundingClientRect</code>.
 * Used to reduce size after compilation.
 * @param {!Element|Node} element Element for calculating bounding rect.
 * @return {Object} Returns dict {top, left, width, height, right, bottom}.
 */
dom.getBoundingClientRect = function(element) {
  /** @type {Object} */
  var rect = element.getBoundingClientRect && element.getBoundingClientRect();
  if (!rect) {
    rect = {'top': 0, 'left': 0, 'width': element.offsetWidth,
      'height': element.offsetHeight};
    while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
      rect['left'] += element.offsetLeft - element.scrollLeft;
      rect['top'] += element.offsetTop - element.scrollTop;
      element = element.offsetParent;
    }
    rect['right'] = rect['left'] + rect['width'];
    rect['bottom'] = rect['top'] + rect['height'];
  }
  return rect;
};


/**
 * Alias of W3C <code>document.defaultView.getComputedStyle</code>.
 * Used to reduce size after compilation.
 * @param {!Element|Node} element Element for getting style.
 * @param {string} prop Style property name.
 * @return {string|number} Returns element style value.
 */
dom.getComputedStyle = function(element, prop) {
  /** @type {string} */ var value = element.style[prop];
  if (element.currentStyle)
    value = element.currentStyle[prop];
  else if (window.getComputedStyle)
    value = dom.document.defaultView.getComputedStyle(
        element, dom.NULL).getPropertyValue(prop);
  return value;
};


/**
 * Clears element content.
 * @param {!Element|Node} element Element to clear.
 */
dom.clearElement = function(element) {
  switch (element.tagName.toUpperCase()) {
    case 'TABLE':
    case 'THEAD':
    case 'TBODY':
    case 'TFOOT':
    case 'TR':
    case 'SELECT':
      while (element.lastChild) {
        element.removeChild(element.lastChild);
      }
      break;
    default:
      element.innerHTML = '';
  }
};


/**
 * Returns true if an element has a class.
 * @param {Node} element The element to test.
 * @param {string} className The class name to test for.
 * @return {boolean} Whether element has the class.
 */
dom.css.hasClass = function(element, className) {
  // Note: `element.classList.contains` throws 'TypeError: Illegal invocation'
  // if element is not appended into the DOM.
  if (element) {
    /** @type {Array.<string>} */ var classes = element.className.split(' ');
    for (/** @type {number} */ var i = 0; i < classes.length;) {
      if (className == classes[i++]) {
        return true;
      }
    }
  }
  return false;
};


/**
 * Sets the entire class name of an element.
 * @param {Node} element The element to set class of.
 * @param {...string} var_args The class name(s) to apply to element.
 */
dom.css.setClass = function(element, var_args) {
  if (element) {
    /** @type {!Array.<string>} */ var args = dom.css.slice_.call(arguments, 1);
    element.className = args.join(' ');
  }
};


/**
 * Adds a class or classes to an element. Does not add multiples of class names.
 * @param {Node} element The element to add class to.
 * @param {...string} var_args The class name(s) to add.
 */
dom.css.addClass = function(element, var_args) {
  // Note: `element.classList.add` throws 'TypeError: Illegal invocation'
  // if element is not appended into the DOM.
  if (element) {
    dom.css.removeClass.apply(dom.NULL, arguments);

    /** @type {!Array.<string>} */ var args = dom.css.slice_.call(arguments, 1);
    element.className += ' ' + args.join(' ');
  }
};


/**
 * Removes a class or classes from an element.
 * @param {Node} element The element to remove class from.
 * @param {...string} var_args The class name(s) to remove.
 */
dom.css.removeClass = function(element, var_args) {
  // Note: `element.classList.remove` throws 'TypeError: Illegal invocation'
  // if element is not appended into the DOM.
  if (element) {
    /** @type {!Array.<string>} */ var args = dom.css.slice_.call(arguments, 1);
    dom.css.setClass(element, element.className.replace(
        new RegExp('\\s?\\b(' + args.join('|') + ')\\b', 'g'), ''));
  }
};


/**
 * Toggles element class name.
 * @param {Node} element The element to add or remove the class on.
 * @param {string} className The class name to toggle.
 */
dom.css.toggleClass = function(element, className) {
  (dom.css.hasClass(element, className) ?
      dom.css.removeClass : dom.css.addClass)(element, className);
};


/**
 * Alias of <code>Array.prototype.slice</code>.
 * Used to reduce size after compilation.
 * @type {!function(number): !Array}
 * @private
 */
dom.css.slice_ = Array.prototype.slice;


/**
 * Enum of event types.
 * @enum {string}
 * @example <code>{
 *  CLICK, DBLCLICK, MOUSEDOWN, MOUSEUP, MOUSEOVER, MOUSEOUT, MOUSEMOVE, KEYDOWN
 * }</code>
 */
dom.events.TYPE = {
  // Mouse events.
  CLICK: 'click',
  DBLCLICK: 'dblclick',
  MOUSEDOWN: 'mousedown',
  MOUSEUP: 'mouseup',
  MOUSEOVER: 'mouseover',
  MOUSEOUT: 'mouseout',
  MOUSEMOVE: 'mousemove',

  // Keyboard events.
  KEYDOWN: 'keydown',
  KEYPRESS: 'keypress',
  KEYUP: 'keyup',

  // Touch events.
  TOUCHSTART: 'touchstart',
  TOUCHEND: 'touchend',
  TOUCHMOVE: 'touchmove',

  // Other.
  BLUR: 'blur',
  FOCUS: 'focus',
  SUBMIT: 'submit',
  CHANGE: 'change',
  INPUT: 'input'
};


/**
 * Alias of W3C <code>element.addEventListener</code>.
 * Used to reduce size after compilation.
 * @param {Element|Node|Window} element Element to which attach event.
 * @param {string} type Type of event.
 * @param {function(Event,...)} listener Event listener.
 * @static
 */
dom.events.addEventListener = function(element, type, listener) {
  if (element.attachEvent) {
    element.attachEvent('on' + type, listener);
  } else {
    element.addEventListener(type, listener, false);
  }
};


/**
 * Alias of W3C <code>element.removeEventListener</code>.
 * Used to reduce size after compilation.
 * @param {Element|Node|Window} element Element to which attach event.
 * @param {string} type Type of event.
 * @param {function(Event,...)} listener Event listener.
 * @static
 */
dom.events.removeEventListener = function(element, type, listener) {
  if (element.attachEvent) {
    element.detachEvent('on' + type, listener);
  } else {
    element.removeEventListener(type, listener, false);
  }
};


/**
 * Alias of W3C <code>element.dispatchEvent</code>.
 * Used to reduce size after compilation.
 * @param {Element|Node|Window} element Element to dispatch event.
 * @param {string} type Type of event.
 * @return {boolean} Returns <code>true</code> if event dispatched successfully.
 * @static
 */
dom.events.dispatchEvent = function(element, type) {
  /** @type {Event} */ var evt = dom.NULL;
  /** @type {boolean} */ var result = false;

  if (dom.document.createEvent) {
    evt = dom.document.createEvent('HTMLEvents');
    // initEvent(type, bubbling, cancelable)
    evt.initEvent(type, true, true);
    result = !element.dispatchEvent(evt);
  } else if (dom.document.createEventObject) {
    evt = dom.document.createEventObject();
    try {
      // MSIE throws error on invalid event type.
      result = element.fireEvent('on' + type, evt);
    } catch (e) {}
  }
  return result;
};


/**
 * Alias of W3C <code>event.preventDefault</code>.
 * Used to reduce size after compilation.
 * @param {Event} e The event to stop.
 * @static
 */
dom.events.preventDefault = function(e) {
  e = e || window.event;
  e.stopPropagation && e.stopPropagation();
  e.preventDefault && e.preventDefault();
  e.returnValue = false;
  e.cancelBubble = true;
};


/**
 * Gets reference to script element is currently being processed.
 * @return {Element} Reference to script element is currently being processed.
 * @link https://developer.mozilla.org/en/DOM/document.currentScript
 * @static
 */
dom.scripts.getCurrent = function() {
  return dom.document['currentScript'] || dom.scripts.last_;
};


/**
 * Gets reference to last script element.
 * @return {Element} Reference to last script element.
 * @static
 */
dom.scripts.getLast = function() {
  /** @type {NodeList} */
  var scripts = dom.getElementsByTagName(dom.document, 'SCRIPT');
  return scripts[scripts.length - 1];
};


/**
 * The reference to last script element.
 * @type {Node}
 * @private
 * @static
 */
dom.scripts.last_ = dom.scripts.getLast();

