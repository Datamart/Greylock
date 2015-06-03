
/**
 * @fileoverview Simple bar chart implementation.
 * @version 1.0.1
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * BarChart constructor.
 * @param {string|Element} container The HTML container.
 * @constructor
 * @class Simple horizontal bar chart implementation.
 * @extends {charts.BaseChart} charts.BaseChart
 * @requires animation
 * @requires charts.Grid
 * @requires formatters.NumberFormatter
 * @example
 * <b>var</b> chart = <b>new</b> charts.BarChart('container_id');
 * chart.draw([['Year', 'Sales', 'Expenses', 'Profit'],
 *             [2011, 80, 30, 45], [2012, 65, 130, 90], [2013, 45, 100, 60]]);
 *
 * <div style="border: solid 1px #ccc; margin: 5px; padding: 5px; width: 560px">
 *   <div id="chart-container"
 *        style="width: 560px; height: 200px;"></div>
 * </div>
 * <script src="../../min/greylock.js"></script>
 * <script>
 *   var chart = new charts.BarChart('chart-container');
 *   chart.draw([['Year', 'Sales', 'Expenses', 'Profit'],
 *               [2011, 80, 30, 45], [2012, 65, 130, 90], [2013, 45, 100, 60]]);
 * </script>
 */
charts.BarChart = function(container) {
  charts.BaseChart.apply(this, arguments);

  /**
   * Draws the chart based on <code>data</code> and <code>opt_options</code>.
   * @param {!Array.<Array>} data A chart data.
   * @param {Object=} opt_options A optional chart's configuration options.
   * @override
   * @see charts.BaseChart#getOptions
   * @example
   * options: {
   *   'stroke': 1,
   *   'font': {'size': 11},
   *   'flip': <b>false</b>
   * }
   */
  this.draw = function(data, opt_options) {
    data_ = data;
    options_ = getOptions_(opt_options);
    options_['direction'] = getDirection_();
    self_.tooltip.setOptions(options_);

    /** @type {string} */ var content = '';
    /** @type {!Array.<Array>} */ var rows = self_.getDataRows(data);
    /** @type {!Array.<string>} */ var columns = self_.getDataColumns(data);
    /** @type {!Array.<number>} */ var range = self_.getDataRange(data, 1);

    /** @type {number} */ var width = self_.container.offsetWidth || 200;
    /** @type {number} */ var height = self_.container.offsetHeight || width;
    /** @type {number} */
    var border = /** @type {number} */ (options_['stroke']);
    for (/** @type {number} */ var i = 0; i < rows.length; i++) {
      bars_ += rows[i].length;
    }

    barWidth_ = width / bars_ - border * 2;
    barHeight_ = height / bars_ - border * 2;

    bars_ = 0;
    for (i = 0; i < rows.length; i++) {
      /** @type {Array} */ var row = rows[i];
      for (/** @type {number} */ var j = 1; j < row.length; j++) {
        /** @type {string} */ var tooltip = self_.tooltip.parse(
            row[0], columns[j], formatter_.format(row[j]));

        content += getBarContent_(getBarRect_(rows, i, j, range),
                                  options_['colors'][j], tooltip);
        bars_++;
      }

      bars_++; // Add space between bar groups.
    }

    initGrid_(range);
    self_.drawContent(content);
    initEvents_();
  };

  // Export for closure compiler.
  this['draw'] = this.draw;

  /**
   * @param {!Array.<number>} range The data range with min and max values.
   * @private
   */
  function initGrid_(range) {
    /** @type {number} */ var minValue = range[0];
    /** @type {number} */ var maxValue = range[1];
    /** @type {!Array.<string>} */ var columns = [];
    //for (/** @type {number} */ var i = 0; i < data_.length; i++) {
    //columns.push('');
    //columns.push(data_[i][0]);
    //}
    /** @type {!charts.Grid} */ var grid = new charts.Grid(self_.container);
    options_['data'] = {'min': minValue, 'max': maxValue, 'columns': columns};
    options_['padding'] = 0;
    grid.draw(options_);
  }

  /**
   * Gets chart's direction.
   * @return {number} Returns chart direction.
   * @see charts.BarChart#DIRECTION
   * @private
   */
  function getDirection_() {
    /** @type {number} */ var direction = options_['direction'] ||
                                          charts.Grid.DIRECTION.LEFT_TO_RIGHT;
    if (options_['flip']) {
      if (direction == charts.Grid.DIRECTION.LEFT_TO_RIGHT)
        direction = charts.Grid.DIRECTION.RIGHT_TO_LEFT;
      else if (direction == charts.Grid.DIRECTION.BOTTOM_TO_TOP)
        direction = charts.Grid.DIRECTION.TOP_TO_BOTTOM;
    }
    return direction;
  }

  /**
   * @param {!Array.<Array>} rows Chart data rows.
   * @param {number} rowIndex Current row index.
   * @param {number} columnIndex Current column index.
   * @param {!Array.<number>} range The data range with min and max values.
   * @return {!Object.<string, number>} Returns rect as {x, y, width, height}.
   * @private
   */
  function getBarRect_(rows, rowIndex, columnIndex, range) {
    /** @type {!Object.<string, number>} */
    var rect = {x: 0, y: 0, width: 0, height: 0};

    /** @type {number} */ var width = self_.container.offsetWidth || 200;
    /** @type {number} */ var height = self_.container.offsetHeight || width;
    /** @type {number} */
    var border = /** @type {number} */ (options_['stroke']);

    /** @type {number} */ var minValue = range[0];
    /** @type {number} */ var maxValue = range[1];

    /** @type {Array} */ var row = rows[rowIndex];
    /** @type {number} */ var value = row[columnIndex];
    /** @type {number} */ var direction = getDirection_();

    if (direction < charts.Grid.DIRECTION.BOTTOM_TO_TOP) {
      // Horizontal charts.
      rect.width = value / maxValue * (width - border * 4);
      // rect.height = (height / row.length / rows.length) - border * 2;
      rect.height = barHeight_;
      rect.x = border;
      rect.y = (rect.height + border * 2) * bars_ + (rect.height + border * 2);
      //if (charts.Grid.DIRECTION.RIGHT_TO_LEFT == direction)
      //  rect.x = width - rect.width - border;
    } else if (direction >= charts.Grid.DIRECTION.BOTTOM_TO_TOP) {
      // Vertical charts.
      // rect.width = (width / row.length / rows.length) - border * 2;
      rect.width = barWidth_;
      rect.height = value / maxValue * (height - border * 4);
      rect.x = (rect.width + border * 2) * bars_ + (rect.width + border * 2);
      rect.y = border;
      //if (charts.Grid.DIRECTION.BOTTOM_TO_TOP == direction)
      //  rect.y = height - rect.height;
    }

    return rect;
  }

  /**
   * Gets chart's options merged with defaults chart's options.
   * @param {Object=} opt_options A optional chart's configuration options.
   * @return {!Object.<string, *>} A map of name/value pairs.
   * @see charts.BaseChart#getOptions
   * @private
   */
  function getOptions_(opt_options) {
    opt_options = opt_options || {};
    opt_options['stroke'] = opt_options['stroke'] || 1;
    opt_options['font'] = opt_options['font'] || {};
    opt_options['font']['size'] = opt_options['font']['size'] || 11;
    return self_.getOptions(opt_options);
  }

  /**
   * @param {!Object.<string, number>} rect Bar rect.
   * @param {string} color Bar color.
   * @param {string} tooltip Bar tooltip.
   * @return {string} Returns bar content as HTML markup string.
   * @private
   */
  function getBarContent_(rect, color, tooltip) {
    return '<div class="bar" style="' +
        'width:' + rect.width + 'px;' +
        'height:' + rect.height + 'px;' +
        'top:' + rect.y + 'px;' +
        'left:' + rect.x + 'px;' +
        'background:' + color + ';' +
        'border:solid ' + options_['stroke'] + 'px #fff;' +
        'color:#fff;' +
        'overflow:hidden;' +
        'position:absolute;' +
        'opacity:' + options_['opacity'] + ';' +
        'filter: alpha(opacity=' + (options_['opacity'] * 100) + ');' +
        'font-family:' + options_['font']['family'] + ';' +
        'font-size:' + options_['font']['size'] + 'px;' +
        '" tooltip="' + tooltip + '"></div>';
  }

  /**
   * Initializes events handlers.
   * @private
   */
  function initEvents_() {
    /** @type {!Array|NodeList} */
    var nodes = dom.getElementsByClassName(self_.container, 'bar');
    for (/** @type {number} */ var i = 0; i < nodes.length; i++) {
      setEvents_(nodes[i]);
    }
  }

  /**
   * Sets events handlers.
   * @param {!Element} node The element.
   * @private
   */
  function setEvents_(node) {
    dom.events.addEventListener(node, dom.events.TYPE.MOUSEOVER, function(e) {
      node.style.opacity = 1;
      node.style.filter = 'alpha(opacity=100)';

      self_.tooltip.show(e);
      /** @type {!Object.<string, number>} */
      var position = getTooltipPosition_(node);
      self_.tooltip.show(e, position.x, position.y);
    });

    dom.events.addEventListener(node, dom.events.TYPE.MOUSEOUT, function(e) {
      node.style.opacity = options_['opacity'];
      node.style.filter = 'alpha(opacity=' + (options_['opacity'] * 100) + ')';
      self_.tooltip.hide(e);
    });

    dom.events.dispatchEvent(node, dom.events.TYPE.MOUSEOUT);
    initAnimation_(node);
  }

  /**
   * Initializes bar animation.
   * @param {!Element|Node} node The element.
   * @private
   */
  function initAnimation_(node) {
    /** @type {number} */
    var width = parseFloat(node.style.width) || node.offsetWidth;
    /** @type {number} */
    var height = parseFloat(node.style.height) || node.offsetHeight;
    /** @type {number} */
    var x = parseFloat(node.style.left) || node.offsetLeft;
    /** @type {number} */
    var y = parseFloat(node.style.top) || node.offsetTop;
    /** @type {number} */ var direction = getDirection_();

    if (direction == charts.Grid.DIRECTION.LEFT_TO_RIGHT) {
      node.style.width = '1px';
      animation.animate(node, {'width': width});
    } else if (direction == charts.Grid.DIRECTION.RIGHT_TO_LEFT) {
      node.style.width = '1px';
      node.style.right = '1px';
      node.style.left = 'auto';
      animation.animate(node, {'width': width});
    } else if (direction == charts.Grid.DIRECTION.TOP_TO_BOTTOM) {
      node.style.height = '1px';
      animation.animate(node, {'height': height});
    } else if (direction == charts.Grid.DIRECTION.BOTTOM_TO_TOP) {
      node.style.height = '1px';
      node.style.bottom = '1px';
      node.style.top = 'auto';
      animation.animate(node, {'height': height});
    }
  }

  /**
   * @param {!Element|Node} node The element.
   * @return {!Object.<string, number>} Returns tooltip position as {x, y}.
   * @private
   */
  function getTooltipPosition_(node) {
    /** @type {number} */ var width = node.offsetWidth;
    /** @type {number} */ var height = node.offsetHeight;
    /** @type {!Object.<string, number>} */
    var result = {x: node.offsetLeft, y: node.offsetTop};

    while (node = node.offsetParent) {
      result.x += node.offsetLeft;
      result.y += node.offsetTop;
    }

    /** @type {Node} */ var tooltip = self_.tooltip.getTooltipElement();
    /** @type {number} */ var direction = getDirection_();
    if (direction == charts.Grid.DIRECTION.LEFT_TO_RIGHT) {
      result.x += width;
      result.y += options_['stroke'];
    } else if (direction == charts.Grid.DIRECTION.RIGHT_TO_LEFT) {
      result.x -= tooltip.offsetWidth;
      result.y += options_['stroke'];
    } else if (direction == charts.Grid.DIRECTION.BOTTOM_TO_TOP) {
      result.x += options_['stroke'];
      result.y -= tooltip.offsetHeight;
    } else if (direction == charts.Grid.DIRECTION.TOP_TO_BOTTOM) {
      result.x += options_['stroke'];
      result.y += height;
    }
    return result;
  }

  /**
   * The reference to current class instance. Used in private methods.
   * @type {!charts.BarChart}
   * @private
   */
  var self_ = this;

  /**
   * @type {Array.<Array>}
   * @private
   */
  var data_ = null;

  /**
   * @dict
   * @private
   */
  var options_ = null;

  /**
   * Total bars counter.
   * @type {number}
   * @private
   */
  var bars_ = 1;


  /**
   * Vertical charts bar width.
   * @type {number}
   * @private
   */
  var barWidth_ = 0;

  /**
   * Horizontal charts bar height.
   * @type {number}
   * @private
   */
  var barHeight_ = 0;

  /**
   * @type {!formatters.NumberFormatter}
   * @private
   */
  var formatter_ = new formatters.NumberFormatter;
};

// Export for closure compiler.
charts['BarChart'] = charts.BarChart;
