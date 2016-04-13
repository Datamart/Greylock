
/**
 * @fileoverview A simple charts grid implementation.
 * @version 1.0.0
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Grid Constructor.
 * @param {string|Element} container The HTML container.
 * @requires formatters.NumberFormatter
 * @constructor
 */
charts.Grid = function(container) {

  /**
   * Draws chart grid.
   * @param {Object=} opt_options A optional grid configuration options.
   */
  this.draw = function(opt_options) {
    options_ = self_.getOptions(opt_options);
    if (options_ && 'null' != options_['grid']) {
      /** @type {number} */ var width = container_.offsetWidth || 200;
      /** @type {number} */ var height = container_.offsetHeight || width;

      height -= options_['grid']['border'] * 2;
      drawLines_(drawCanvas_(width, height), width, height);
    }
  };

  /**
   * Gets grid options merged with defaults grid options.
   * @param {Object=} opt_options A optional grid configuration options.
   * @return {!Object.<string, *>} A map of name/value pairs.
   * @example
   * options: {
   *   'grid': {border': 1, 'color': '#ccc', 'lines': 5},
   *   'font': {'size': 11, 'family': 'Arial'},
   *   'hAxis': true,
   *   'vAxis': true
   * }
   */
  this.getOptions = function(opt_options) {
    opt_options = opt_options || {};
    opt_options['grid'] = opt_options['grid'] || {};
    opt_options['grid']['border'] = opt_options['grid']['border'] || 1;
    opt_options['grid']['color'] = opt_options['grid']['color'] || '#ccc';
    opt_options['grid']['lines'] = opt_options['grid']['lines'] || 5;
    opt_options['font'] = opt_options['font'] || {};
    opt_options['font']['size'] = opt_options['font']['size'] || 11;
    opt_options['font']['family'] = opt_options['font']['family'] || 'Arial';
    opt_options['hAxis'] = 'hAxis' in opt_options ? opt_options['hAxis'] : true;
    opt_options['vAxis'] = 'vAxis' in opt_options ? opt_options['vAxis'] : true;
    opt_options['grid']['direction'] =
        opt_options['grid']['direction'] || charts.Grid.DIRECTION.BOTTOM_TO_TOP;
    opt_options['scale'] =
        'scale' in opt_options ? opt_options['scale'] : false;
    return opt_options;
  };

  /**
   * @param {Node} canvas The canvas element.
   * @param {number} width The canvas width.
   * @param {number} height The canvas height.
   * @private
   */
  function drawLines_(canvas, width, height) {
    setTimeout(function() {container_.style.overflow = 'visible';}, 1);
    if (options_['scale']) scaledLines_(canvas, width, height);
    else simpleLines_(canvas, width, height);

    if (options_['hAxis'] && options_['data']['columns']) {
      drawColumnsLabels_(canvas, width, height);
    }
  }

  /**
   * @param {Node} canvas The canvas element.
   * @param {number} width The canvas width.
   * @param {number} height The canvas height.
   * @private
   */
  function scaledLines_(canvas, width, height) {
    /** @type {number} */ var lines = options_['grid']['lines'];
    /** @type {string} */ var color = options_['grid']['color'];
    /** @type {number} */ var padding = options_['padding'] || 0;
    /** @type {number} */ var border = options_['grid']['border'];
    /** @type {number} */ var minValue = options_['data']['min'];
    /** @type {number} */ var maxValue = options_['data']['max'];
    /** @type {number} */ var delta = maxValue - minValue;

    maxValue = maxValue <= 0 ? 1 : maxValue;
    delta = delta <= 0 ? 1 : delta;

    /** @type {number} */
    var logMinValue = Math.log(minValue) > 0 ? Math.log(minValue) : 0;
    /** @type {number} */
    var logMaxValue = Math.log(maxValue) > 0 ? Math.log(maxValue) : 0;
    /** @type {number} */ var logDelta = Math.log(delta);
    /** @type {number} */
    var yPadding = options_['radius'] * 2 + (options_['grid']['lines'] - 1) / 2;
    /** @type {number} */
    var lineHeight = (height - padding * 2 - border) / (lines - 1) - border;
    /** @type {number} */
    var minY = Math.ceil((logDelta - (logMaxValue - logMinValue)) *
        (height - yPadding * 2) / logDelta + yPadding);
    /** @type {number} */
    var maxY = Math.ceil(logDelta * (height - yPadding * 2) /
        logDelta + yPadding);
    /** @type {number} */ var deltaY = maxY - minY;
    /** @type {number} */ var y = height - yPadding;

    for (/** @type {number} */ var i = 0; i < lines + 1; i++) {
      /** @type {Node} */ var line = createElement_(canvas);
      line.style.overflow = 'hidden';
      if (i && !(!padding && (i == lines || i == 1))) {
        line.style.borderTop = 'solid ' + border + 'px ' + color;
      }
      if (i > 0 && i <= lines) {
        line.style.height = lineHeight + 'px';
        line.style.paddingLeft = '1px';
        if (options_['vAxis']) {
          /** @type {number} */
          var dy = deltaY + minY - ((y - yPadding) * deltaY) /
              (height - yPadding * 2);
          /** @type {number} */
          var row = logDelta + logMinValue - ((dy - yPadding) *
              logDelta) / (height - yPadding * 2);
          /** @type {number} */ var value = Math.exp(row);
          if (row < 1 && minValue <= 0) value = 0;
          setRowLabel_(line, value);
          y -= lineHeight;
        }
      } else {
        line.style.height = padding + 'px';
      }
    }
  }

  /**
   * @param {Node} canvas The canvas element.
   * @param {number} width The canvas width.
   * @param {number} height The canvas height.
   * @private
   */
  function simpleLines_(canvas, width, height) {
    /** @type {number} */ var size = getRowSize_(width, height);
    /** @type {number} */ var length = options_['grid']['lines'] - 1;
    /** @type {number} */
    var delta = options_['data']['max'] / length;
    /** @type {string} */
    var direction =
        charts.Grid.DIRECTION.TOP_TO_BOTTOM == options_['direction'] ||
        charts.Grid.DIRECTION.BOTTOM_TO_TOP == options_['direction'] ?
        'Top' : 'Left';
    for (/** @type {number} */ var index = 0; index <= length; index++) {
      /** @type {Node} */ var line = createLine_(canvas, width, height);
      line.style[direction.toLowerCase()] = (size * index) + 'px';
      if (index && index < length) {
        // Don't set border for first and last line.
        line.style['border' + direction] = 'solid ' +
            options_['grid']['border'] + 'px ' + options_['grid']['color'];
      }

      if (options_['vAxis']) {
        //setRowLabel_(line, delta / length * (length - index));
        setRowLabel_(line, delta * (length - index));
      }
    }
  }

  /**
   * @param {Node} canvas The canvas element.
   * @param {number} width The canvas width.
   * @param {number} height The canvas height.
   * @return {Node} Returns create grid line element.
   * @private
   */
  function createLine_(canvas, width, height) {
    /** @type {number} */ var direction = options_['direction'];
    /** @type {number} */ var border = options_['grid']['border'];
    /** @type {number} */ var size = getRowSize_(width, height);
    /** @type {Node} */ var line;

    if (charts.Grid.DIRECTION.TOP_TO_BOTTOM == direction ||
        charts.Grid.DIRECTION.BOTTOM_TO_TOP == direction) {
      line = createElement_(canvas, width - border, size);
    } else if (charts.Grid.DIRECTION.LEFT_TO_RIGHT == direction ||
               charts.Grid.DIRECTION.RIGHT_TO_LEFT == direction) {
      line = createElement_(canvas, size - border, height);
    }

    return line;
  }

  /**
   * @param {number} width The canvas width.
   * @param {number} height The canvas height.
   * @return {number} Returns line size.
   * @private
   */
  function getRowSize_(width, height) {
    /** @type {number} */ var direction = options_['direction'];
    /** @type {number} */ var border = options_['grid']['border'];
    /** @type {number} */ var size = (
        charts.Grid.DIRECTION.TOP_TO_BOTTOM == direction ||
        charts.Grid.DIRECTION.BOTTOM_TO_TOP == direction) ? height : width;

    return (size - border) / (options_['grid']['lines'] - 1);
  }

  /**
   * @param {Node} canvas The canvas element.
   * @param {number} width The canvas width.
   * @param {number} height The canvas height.
   * @private
   */
  function drawColumnsLabels_(canvas, width, height) {
    /** @type {Array.<string>} */ var columns = options_['data']['columns'];
    /** @type {number} */ var length = columns.length;
    /** @type {number} */ var padding = (options_['padding'] || 1) * 2;
    /** @type {number} */ var x = (width - padding * 2) / (length - 2);
    /** @type {number} */ var fontSize = options_['font']['size'] || 13;
    /** @type {string} */
    var label = getColumnLabel_(columns[columns.length - 1]);
    /** @type {number} */
    var symbolWidth = label ? label.length * (fontSize - fontSize / 3) : 1;
    /** @type {number} */
    var maxAmount = Math.round((width - padding * 2) / symbolWidth);

    for (/** @type {number} */ var i = 1; i < length;) {
      /** @type {Node} */ var div;
      if (length > 2) {
        div = createElement_(canvas, null, null, height + 5,
            (padding + x * (i - 1) - symbolWidth / 2));
      } else {
        div = createElement_(canvas, null, null, height + 5,
            (width / 2 - padding * 2));
      }

      setColumnLabel_(div, columns[i]);
      i += Math.round(Math.max(length / Math.round(maxAmount), 1));
    }
  }

  /**
   * @param {*} column The column data.
   * @return {string} Returns formatted column label.
   * @private
   */
  function getColumnLabel_(column) {
    if (column instanceof Date) {
      column = formatters.DateFormatter.formatDate(
          /** @type {Date} */(column), 'YYYY-MM-dd');
    }
    return '' + column;
  }

  /**
   * @param {Node} column The column element.
   * @param {*} label The column label text.
   * @see setRowLabel_(row, label)
   * @private
   */
  function setColumnLabel_(column, label) {
    column.style.position = 'absolute';
    column.style.whiteSpace = 'nowrap';
    column.innerHTML = getColumnLabel_(label);
  }

  /**
   * @param {Node} row The row element.
   * @param {number} label The row label text.
   * @private
   */
  function setRowLabel_(row, label) {
    /** @type {number} */ var width = row.offsetWidth;
    /** @type {number} */ var direction = options_['direction'];
    /** @type {number} */ var font = options_['font']['size'];
    /** @type {string} */ var css = 'overflow:hidden;position:absolute;';

    if (charts.Grid.DIRECTION.TOP_TO_BOTTOM == direction ||
        charts.Grid.DIRECTION.LEFT_TO_RIGHT == direction) {
      label = options_['data']['max'] - label;
    } else if (charts.Grid.DIRECTION.BOTTOM_TO_TOP == direction ||
        charts.Grid.DIRECTION.RIGHT_TO_LEFT == direction) {
      label = label;
    }

    if (charts.Grid.DIRECTION.LEFT_TO_RIGHT == direction ||
        charts.Grid.DIRECTION.RIGHT_TO_LEFT == direction) {
      css += 'margin-left:-' + (width / 2) + 'px;bottom:0;' +
          'width:' + width + 'px;' +
          'text-align:center;margin-bottom:-' + (font + font / 2) + 'px;';
    } else {
      width = 50;
      css += 'left:-' + (width + 5) + 'px;width:' + width + 'px;' +
          'text-align:right;margin-top:-' + (font / 2) + 'px;';
    }
    row.innerHTML = '<div style="' + css + '">' +
                    formatter_.roundNumber(label) + '</div>';
  }

  /**
   * @param {number} width The canvas width.
   * @param {number} height The canvas height.
   * @return {Node} Returns canvas element.
   * @private
   */
  function drawCanvas_(width, height) {
    /** @type {number} */ var border = options_['grid']['border'];
    /** @type {string} */ var color = options_['grid']['color'];
    /** @type {Node} */
    var canvas = createElement_(container_, width - border * 2, height);
    canvas.style.border = 'solid ' + border + 'px ' + color;
    canvas.style.fontFamily = options_['font']['family'];
    canvas.style.fontSize = options_['font']['size'] + 'px';
    canvas.style.color = color;
    return canvas;
  }

  /**
   * @param {Node} parent The parent element.
   * @param {?number=} opt_width The optional width of new element.
   * @param {?number=} opt_height The optional height of new element.
   * @param {?number=} opt_top The optional Y of new element.
   * @param {?number=} opt_left The optional X of new element.
   * @return {Node} Returns created element.
   * @private
   */
  function createElement_(parent, opt_width, opt_height, opt_top, opt_left) {
    /** @type {Node} */ var node = parent.appendChild(dom.createElement('DIV'));
    node.style.position = 'absolute';
    if (opt_width) node.style.width = opt_width + 'px';
    if (opt_height) node.style.height = opt_height + 'px';
    if (opt_top) node.style.top = opt_top + 'px';
    if (opt_left) node.style.left = opt_left + 'px';
    return node;
  }

  /**
   * The reference to current class instance. Used in private methods.
   * @type {!charts.Grid}
   * @private
   */
  var self_ = this;

  /**
   * The reference to HTML chart container.
   * @type {Element}
   * @private
   */
  var container_ = typeof container == 'string' ?
      dom.getElementById(container) : container;

  /**
   * @dict
   * @private
   */
  var options_ = null;

  /**
   * @type {!formatters.NumberFormatter}
   * @private
   */
  var formatter_ = new formatters.NumberFormatter;
};


/**
 * Enum of grid direction.
 * @enum {number}
 * @static
 * @example
 * <code>{ LEFT_TO_RIGHT, RIGHT_TO_LEFT, BOTTOM_TO_TOP, TOP_TO_BOTTOM }</code>
 */
charts.Grid.DIRECTION = {
  LEFT_TO_RIGHT: 1, // Standard bar chart.
  RIGHT_TO_LEFT: 2, // Flipped bar chart.
  BOTTOM_TO_TOP: 3, // Column chart.
  TOP_TO_BOTTOM: 4  // Flipped column chart.
};
