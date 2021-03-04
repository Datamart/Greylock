
/**
 * @fileoverview A base chart tooltip.
 * @version 1.0.0
 * @see https://google.github.io/styleguide/jsguide.html
 * @see https://github.com/google/closure-compiler/wiki
 */



/**
 * A base chart tooltip.
 * @constructor
 */
charts.Tooltip = function() {

  /**
   * Sets configuration options.
   * @param {!Object} options The configuration options.
   * @see charts.BaseChart#getOptions
   * @example
   * options: {
   *   'tooltip': {
   *     'paddings': '5px',
   *     'bgcolor': '#fff',
   *     'opacity': 0.9
   *   }
   * }
   */
  this.setOptions = function(options) {
    options_ = options;
    options_['tooltip'] = options_['tooltip'] || {};
    options_['tooltip']['paddings'] = options_['tooltip']['paddings'] || '5px';
    options_['tooltip']['bgcolor'] = options_['tooltip']['bgcolor'] || '#fff';
    options_['tooltip']['opacity'] = options_['tooltip']['opacity'] || '0.9';
    options_['tooltip']['template'] = options_['tooltip']['template'] ||
        '<b>{{ arg.0 }}</b><br>{{ arg.1 }}: {{ arg.2 }}';
  };

  /**
   * Shows tooltip element.
   * @param {Event} e The mouse event.
   * @param {number=} opt_x The optional X coord.
   * @param {number=} opt_y The optional Y coord.
   */
  this.show = function(e, opt_x, opt_y) {
    /** @type {!Object.<string, number>}  */ var coords = getCoords_(e);
    /** @type {string} */ var text = getTooltipText_(e);
    /** @type {number} */ var scrollTop =
        dom.document.documentElement.scrollTop + dom.document.body.scrollTop;
    /** @type {number} */ var offsetWidth =
        window.innerWidth ||
            (dom.document.documentElement || dom.document.body).offsetWidth;

    if (text) {
      self_.getTooltipElement().innerHTML = text;
      tooltip_.style.display = 'block';
      if (coords.y - scrollTop < tooltip_.offsetHeight)
        coords.y += tooltip_.offsetHeight;
      opt_y = opt_y || coords.y - tooltip_.offsetHeight - 5;
      if (offsetWidth < coords.x + tooltip_.offsetWidth)
        coords.x -= tooltip_.offsetWidth;
      opt_x = opt_x || coords.x + 5;
      tooltip_.style.top = opt_y + 'px';
      tooltip_.style.left = opt_x + 'px';
    }
  };

  /**
   * Hides tooltip element.
   * @param {Event} e The mouse event.
   */
  this.hide = function(e) {
    e = e || window.event || {};
    /** @type {Element} */ var target = e.target || e.srcElement;
    /** @type {Element} */ var related = e.relatedTarget || e.fromElement;
    if (tooltip_ && tooltip_ != target && tooltip_ != related)
      tooltip_.style.display = 'none';
  };

  /**
   * Gets reference to tooltip HTML element.
   * @return {!Node} Returns reference to tooltip HTML element.
   */
  this.getTooltipElement = function() {
    if (!tooltip_) {
      tooltip_ = dom.document.body.appendChild(dom.createElement('DIV'));
      /** @type {CSSStyleDeclaration} */ var style = tooltip_.style;
      style.display = 'none';
      style.zIndex = 999;
      style.cursor = 'default';
      style.whiteSpace = 'nowrap';
      //style.maxWidth = '150px';
      style.position = 'absolute';
      style.border = 'solid 1px #ccc';
      style.fontFamily = options_['font']['family'];
      style.fontSize = options_['font']['size'] + 'px';
      style.padding = options_['tooltip']['paddings'];
      style.background = options_['tooltip']['bgcolor'];
      style.borderRadius = '3px';
      style.opacity = options_['tooltip']['opacity'];
      style.filter =
          'alpha(opacity=' + (options_['tooltip']['opacity'] * 100) + ')';
      tooltip_.onmouseout = function() {
        style.display = 'none';
      };
    }
    return tooltip_;
  };

  /**
   * Parses tooltip template content.
   * @param {...*} var_args
   * @return {string} Returns parsed tooltip template content.
   */
  this.parse = function(var_args) {
    /** @type {string} */ var content = options_['tooltip']['template'];
    /** @type {!Object.<string, *>} */ var params = {};
    for (/** @type {number} */ var i = 0; i < arguments.length; i++) {
      params['arg.' + i] = arguments[i];
    }
    return template_.parse(content, params);
  };

  /**
   * @param {Event} e The mouse event.
   * @return {!Object.<string, number>} Returns X and Y coordinates.
   * @private
   */
  function getCoords_(e) {
    e = e || window.event;
    /** @type {!Object.<string, number>} */ var result = {x: 0, y: 0};
    if (e.pageX || e.pageY) {
      result = {x: e.pageX, y: e.pageY};
    } else if (e.clientX || e.clientY) {
      /** @type {Element} */ var body = dom.document.body;
      /** @type {Element} */ var root = dom.document.documentElement;
      result = {
        x: e.clientX + (body.scrollLeft || 0) + (root.scrollLeft || 0),
        y: e.clientY + (body.scrollTop || 0) + (root.scrollTop || 0)
      };
    }
    return result;
  }

  /**
   * @param {Event} e The mouse event.
   * @return {string} Returns tooltip text.
   * @private
   */
  function getTooltipText_(e) {
    e = e || window.event || {};
    /** @type {string} */ var text = '';
    /** @type {Element} */ var target = e.target || e.srcElement;
    /** @type {Element} */ var related = e.relatedTarget || e.fromElement ||
        target.previousSibling || target.parentNode;

    try {
      if ('text' == target.tagName) text = related.getAttribute('tooltip');
      else text = target.getAttribute('tooltip');
    } catch (ex) {}

    if (!text) {
      try {
        text = target.getAttribute('title') || related.getAttribute('tooltip');
        target.setAttribute('tooltip', text);
        target.removeAttribute('title');
      } catch (ex) {}
    }
    return text;
  }

  /**
   * The reference to current class instance. Used in private methods.
   * @type {!charts.Tooltip}
   * @private
   */
  var self_ = this;

  /**
   * Reference to tooltip HTML element.
   * @type {Node}
   * @private
   */
  var tooltip_ = null;

  /**
   * Storage for configuration options.
   * @dict
   * @private
   */
  var options_ = null;

  /**
   * Instance of <code>dom.Template</code>.
   * @type {!dom.Template}
   * @see dom.Template
   * @private
   */
  var template_ = new dom.Template;
};
