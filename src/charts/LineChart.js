
/**
 * @fileoverview Simple line chart implementation.
 * @version 1.0.1
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * LineChart constructor.
 * @param {string|Element} container The HTML container.
 * @constructor
 * @extends {charts.BaseChart} charts.BaseChart
 * @requires charts.Grid
 * @requires formatters.NumberFormatter
 * @example
 * <b>var</b> chart = <b>new</b> charts.LineChart('container_id');
 * chart.draw([['Year', 'Sales', 'Expenses', 'Profit'],
 *             [2008, 10, 65, 90], [2009, 165, 30, 60], [2010, 85, 150, 20],
 *             [2011, 80, 60, 45], [2012, 65, 130, 90], [2013, 45, 100, 60]]);
 *
 * <div id="chart-container"
 *      style="width: 560px; height: 200px; margin: 0 0 20px 20px;"></div>
 * <script src="../bin/jscb.js"></script>
 * <script>
 *   var chart = new charts.LineChart('chart-container');
 *   chart.draw([['Year', 'Sales', 'Expenses', 'Profit'],
 *               [2008, 10, 65, 90], [2009, 165, 30, 60], [2010, 85, 150, 20],
 *               [2011, 80, 60, 45], [2012, 65, 130, 90], [2013, 45, 100, 60]]);
 * </script>
 */
charts.LineChart = function(container) {
  charts.BaseChart.apply(this, arguments);

  /**
   * Draws the chart based on <code>data</code> and <code>opt_options</code>.
   * @param {!Array.<Array>} data A chart data.
   * @param {Object=} opt_options A optional chart's configuration options.
   * @override
   * @example
   * options: {
   *   'stroke': 2,
   *   'radius': 4,
   *   'opacity': 0.4,
   *   'font': {'size': 11}
   * }
   */
  this.draw = function(data, opt_options) {
    data_ = prepareData_(data);
    /** @type {!charts.Grid} */ var grid = new charts.Grid(self_.container);
    options_ = grid.getOptions(getOptions_(opt_options));
    formatter_ = new formatters.NumberFormatter(
        /** @type {Object.<string,*>} */(options_['formatter']));
    self_.tooltip.setOptions(options_);

    /** @type {number} */ var width = self_.container.offsetWidth || 200;
    /** @type {number} */ var height = self_.container.offsetHeight || width;
    /** @type {number} */
    var radius = /** @type {number} */(options_['radius']);
    /** @type {string} */ var content = '';
    /** @type {!Array.<Array>} */ var rows = self_.getDataRows(data_);
    /** @type {!Array.<string>} */ var columns = self_.getDataColumns(data_);
    /** @type {!Object.<number>} */ var scaledElements =
        chartElementsScaling_(radius, columns.length, width);
    radius = scaledElements['radius'];
    options_['stroke'] = scaledElements['line'];
    /** @type {Array.<number>} */ var range = self_.getDataRange(data_, 1);
    /** @type {number} */ var maxValue = range[1];
    /** @type {number} */ var minValue = range[0];
    if (maxValue == minValue) {
      minValue = minValue - (options_['grid']['lines'] - 1) / 2;
      maxValue = maxValue + (options_['grid']['lines'] - 1) / 2;
    }
    /** @type {Array.<Array>} */ var points = [];
    for (/** @type {number} */ var i = 0; i < rows.length; i++) {
      /** @type {Array.<number>} */ var row = rows[i];
      /** @type {string} */ var color = options_['colors'][i];

      // TODO (alex): Use padding for minValue and maxValue.
      /** @type {number} */ var xAxis = (width - radius * 2) / row.length;
      /** @type {number} */ var yAxis = (height - radius * 2) / maxValue;

      points = getPoints_(row, width, height, minValue, maxValue);
      /** @type {Array.<string>} */
      var tooltips = getPointsTooltips_(points, rows, columns);

      options_['smooth'] = points.length > 1;
      content += charts.IS_SVG_SUPPORTED ?
          getSvgContent_(points, color, radius, tooltips, width, height) :
          getVmlContent_(points, color, radius, tooltips);
    }

    options_['data'] = {'min': minValue, 'max': maxValue, 'columns': columns};
    //options_['padding'] = radius * 2;
    options_['direction'] = charts.Grid.DIRECTION.BOTTOM_TO_TOP;
    grid.draw(options_);

    self_.drawContent(content, width, height);
    initEvents_();
  };

  // Export for closure compiler.
  this['draw'] = this.draw;

  /**
   * Calculates dot radius and line width.
   * @param {number} radius Default dot radius.
   * @param {number} length Columns length.
   * @param {number} width Container width.
   * @return {!Object.<number>} Scaled radius and line width.
   * @private
   */
  function chartElementsScaling_(radius, length, width) {
    length = length - 1; // skip first column.
    /** @type {number} */
    var stroke = /** @type {number} */(options_['stroke']);
    /** @type {number} */ var radiusScale = width / (length * radius * 2);
    /** @type {number} */ var lineScale = width / (length * stroke * 4);
    lineScale = lineScale > 1 ? 1 : lineScale < 0.35 ? 0.35 : lineScale;
    radiusScale = radiusScale > 1 ? 1 : radiusScale < 0.35 ? 0.35 : radiusScale;
    return {
      'radius': radius * radiusScale,
      'line': stroke * lineScale
    };
  }

  /**
   * @param {Array.<Array>} points The line points.
   * @param {Array.<Array>} rows The data rows.
   * @param {Array.<string>} columns The data columns.
   * @return {Array.<string>} Returns tooltip for each point.
   * @private
   */
  function getPointsTooltips_(points, rows, columns) {
    /** @type {Array.<string>} */ var tooltips = [];
    /** @type {number} */ var fontSize = options_['font']['size'];
    for (/** @type {number} */ var i = 0; i < points.length; i++) {
      var tip = '<b>' + columns[i + 1] + '</b>';
      for (/** @type {number} */ var j = 0; j < rows.length; j++) {
        tip += '<br><span style=\'' +
               'background-color: ' + options_['colors'][j] + ';' +
               'display: inline-block;' +
               'width: ' + (options_['radius'] * 2) + 'px;' +
               'height: ' + (options_['radius'] * 2) + 'px;' +
               'border-radius:' + options_['radius'] + 'px;\'>' +
               '</span> ' + rows[j][0] +
               ': ' + formatter_.format(rows[j][i + 1]);
      }
      tooltips.push(tip);
    }
    return tooltips;
  }

  /**
   * Prepares data for drawing.
   * @param {Array.<Array>} data Raw chart data.
   * @return {Array.<Array>} Chart data.
   * @private
   */
  function prepareData_(data) {
    /** @type {Array.<Array>} */ var result = [];
    for (/** @type {number} */ var i = 0; i < data.length; i++) {
      /** @type {Array} */ var row = data[i];
      for (/** @type {number} */ var j = 0; j < row.length; j++) {
        if (!result[j]) result[j] = [];
        result[j][i] = row[j];
      }
    }
    return result;
  }

  /**
   * Gets chart's options merged with defaults chart's options.
   * @param {Object=} opt_options A optional chart's configuration options.
   * @return {!Object.<string, *>} A map of name/value pairs.
   * @see charts.BaseChart#getOptions
   * @private
   * @example
   * options: {
   *   'stroke': 2,
   *   'radius': 4,
   *   'opacity': 0.4,
   *   'font': {'size': 11}
   * }
   */
  function getOptions_(opt_options) {
    opt_options = opt_options || {};
    opt_options['stroke'] = opt_options['stroke'] || 2;
    opt_options['radius'] = opt_options['radius'] || 4;
    opt_options['opacity'] = opt_options['opacity'] || 0.4;
    opt_options['font'] = opt_options['font'] || {};
    opt_options['font']['size'] = opt_options['font']['size'] || 11;
    opt_options['smooth'] = opt_options['smooth'] || false;
    opt_options['formatter'] = opt_options['formatter'] || {};
    opt_options['anim'] = (opt_options['anim'] || opt_options['smooth']) &&
        !window.VBArray;
    opt_options['duration'] = opt_options['duration'] || 0.7;
    return self_.getOptions(opt_options);
  }

  /**
   * Initializes events handlers.
   * @private
   */
  function initEvents_() {
    /** @type {string} */
    var tagName = charts.IS_SVG_SUPPORTED ? 'circle' : 'oval';
    /** @type {NodeList} */
    var nodes = dom.getElementsByTagName(self_.container, tagName);
    /** @type {number} */ var length = nodes.length;
    /** @type {Object} */ var columns = options_['data']['columns'];
    /** @type {number} */ var cols = columns.length - 1;
    for (/** @type {number} */ var i = 0; i < length; i++) {
      setEvents_(nodes, nodes[i], length, cols);
    }

    if (charts.IS_SVG_SUPPORTED) {
      var root = dom.getElementsByTagName(self_.container, 'svg')[0];
      root.style.paddingBottom = (options_['radius'] / 2) + 'px';
    }
  }

  /**
   * Sets events handlers.
   * @param {NodeList} nodes Points.
   * @param {!Element} node The element.
   * @param {number} length The number of points.
   * @param {number} columns The number of columns.
   * @private
   */
  function setEvents_(nodes, node, length, columns) {
    /** @type {string} */
    var attr = charts.IS_SVG_SUPPORTED ? 'stroke-opacity' : 'opacity';
    dom.events.addEventListener(node, dom.events.TYPE.MOUSEOVER, function(e) {
      /** @type {number} */
      var point = +node.getAttribute('column') - 1;
      for (; point < length; point += columns) {
        if (charts.IS_SVG_SUPPORTED) {
          nodes[point].setAttribute(attr, options_['opacity']);
        } else {
          // Note: node.firstChild is <vml:stroke> element.
          nodes[point].firstChild[attr] = options_['opacity'];
        }
      }
      self_.tooltip.show(e);
    });

    dom.events.addEventListener(node, dom.events.TYPE.MOUSEOUT, function(e) {
      /** @type {number} */
      var point = +node.getAttribute('column') - 1;
      for (; point < length; point += columns) {
        if (charts.IS_SVG_SUPPORTED) {
          nodes[point].setAttribute(attr, 0);
        } else {
          // Note: node.firstChild is <vml:stroke> element.
          nodes[point].firstChild[attr] = 0;
        }
      }
      self_.tooltip.hide(e);
    });

    dom.events.dispatchEvent(node, dom.events.TYPE.MOUSEOUT);
  }

  /**
   * @param {Array.<Array>} points The line points.
   * @param {string} stroke The stroke color.
   * @param {number} radius The dot radius.
   * @param {Array.<string>} tooltips The points tooltips.
   * @param {number} width Container width.
   * @param {number} height Container height.
   * @return {string} Returns SVG markup string.
   * @private
   */
  function getSvgContent_(points, stroke, radius, tooltips, width, height) {
    /** @type {Array.<string>} */ var dots = [];
    /** @type {number} */ var size = options_['smooth'] &&
        radius > options_['opacity'] + 3 ? options_['opacity'] + 3 : radius;
    /** @type {number} */ var duration = options_['duration'];
    /** @type {number} */ var length = points.length;
    for (/** @type {number} */ var i = 0; i < length; i++) {
      /** @type {Array.<number>} */ var point = points[i];

      dots.push('<circle cx="' + point[0] + '" cy="' + (options_['anim'] ?
          height : point[1]) + '" r="' + size + '" fill="' + stroke + '" ' +
                'column="' + (i + 1) + '" tooltip="' + tooltips[i] + '" ' +
                'stroke="' + stroke + '" stroke-opacity="' +
                options_['opacity'] + '" stroke-width="' + radius + '">' +
                (options_['anim'] &&

                '<animate attributeName="cy" from="' + height + '" to="' +
                point[1] + '" dur="' + duration + 's" ' +
                'fill="freeze"></animate>') + '</circle>');
    }

    return (options_['anim'] ? calcPath_(points, stroke, width, height) :
        '<polyline style="fill:none;stroke:' + stroke + ';stroke-width:' +
        options_['stroke'] + '" ' + 'points="' + points.join(' ') + '"/>') +
        dots.join('');
  }

  /**
   * @param {Array.<Array>} points The line points.
   * @param {string} stroke The stroke color.
   * @param {number} width Container width.
   * @param {number} height Container height.
   * @return {string} Path.
   * @private
   */
  function calcPath_(points, stroke, width, height) {
    /** @type {string} */ var path = '<path fill="none" stroke="' + stroke +
        '" stroke-width="' + options_['stroke'] + '" ';
    /** @type {number} */ var duration = options_['duration'];
    /** @type {number} */ var radius = width / points.length / 2;
    /** @type {string} */ var endcords;
    /** @type {string} */ var startCords;
    /** @type {string} */ var result = path;
    /** @type {number} */ var length = points.length;
    for (/** @type {number} */ var i = 0; i < length; i++) {
      if (i + 1 < length) {
        /** @type {number} */ var currX = points[i][0];
        /** @type {number} */ var currY = points[i][1];
        /** @type {number} */ var nextX = points[i + 1][0];
        /** @type {number} */ var nextY = points[i + 1][1];
        endcords = ('M' + currX + ',' + currY +
            ' C' + (currX + radius) + ',' + currY +
            ' ' + (nextX - radius) + ',' + nextY +
            ' ' + nextX + ',' + nextY);
        startCords = ('M' + currX + ',' + height +
            ' C' + (currX + radius) + ',' + height +
            ' ' + (nextX - radius) + ',' + height +
            ' ' + nextX + ',' + height);

        result += 'd="' + startCords + '">' + (options_['anim'] &&
            '<animate attributeName="d" from="' + startCords +
            '" to="' + endcords + '" dur="' + duration + 's" ' +
            'fill="freeze"></animate>') + '</path>' +
            (i < length - 2 ? path : '');
      }
    }
    return 1 == length ? '' : result;
  }

  /**
   * @param {Array.<Array>} points The line points.
   * @param {string} stroke The stroke color.
   * @param {number} radius The dot radius.
   * @param {Array.<string>} tooltips The points tooltips.
   * @return {string} Returns VML markup string.
   * @private
   */
  function getVmlContent_(points, stroke, radius, tooltips) {
    /** @type {Array.<string>} */ var dots = [];
    for (/** @type {number} */ var i = 0; i < points.length; i++) {
      /** @type {Array.<number>} */ var point = points[i];
      dots.push('<v:oval fillcolor="' + stroke + '" ' +
                'column="' + (i + 1) + '" ' +
                'tooltip="' + tooltips[i] + '" ' +
                'style="' +
                'top:' + (point[1] - radius) + 'px;' +
                'left:' + (point[0] - radius) + 'px;' +
                'width:' + (radius * 2) + 'px;' +
                'height:' + (radius * 2) + 'px;' +
                '">' +
                '<v:stroke color="' + stroke + '" weight="' + radius +
                '" opacity="' + options_['opacity'] + '"/>' +
                //'<v:extrusion on="true"/>' +
                '</v:oval>');
    }

    return '<v:polyline strokeweight="' + options_['stroke'] + 'px" ' +
           'strokecolor="' + stroke + '" filled="false" ' +
           'points="' + points.join(' ') + '"/>' + dots.join('');
  }

  /**
   * Calculates line points.
   * @param {Array.<number>} row The data row.
   * @param {number} width The width.
   * @param {number} height The height.
   * @param {number} minValue The grid min value.
   * @param {number} maxValue The grid max value.
   * @return {Array.<Array>} Returns list of calculated points.
   * @private
   */
  function getPoints_(row, width, height, minValue, maxValue) {
    /** @type {Array.<Array>} */ var points = [];
    // TODO (alex): apply logarithmic scale by default
    /** @type {number} * / var base = height / Math.log(maxValue);*/

    /** @type {number} */ var xPadding = options_['radius'] * 4;
    /** @type {number} */
    var yPadding = options_['radius'] / 4 + (options_['grid']['lines'] - 1) / 2;
    /** @type {boolean} */ var scale = options_['scale'];
    /** @type {!Object} */ var params = {};
    if (scale) {
      params = getScaledParams_(height, minValue, maxValue, yPadding);
    }
    for (/** @type {number} */ var i = 1; i < row.length; i++) {
      /** @type {number} */
      var x = Math.round((i - 1) * (width - xPadding * 2) / (row.length - 2)) +
          xPadding;
      x = x ? x : width / 2;
      /** @type {number} */ var y;
      if (scale) {
        y = scaledY_(row[i], height, yPadding, params);
      } else {
        y = Math.round((maxValue - parseFloat(row[i])) *
            (height - yPadding * 2) / maxValue) + yPadding;
      }
      points.push([x, y]);
    }
    return points;
  }

  /**
   * Calculates parameters for scaled coordinates.
   * @param {number} height The height.
   * @param {number} minValue The grid min value.
   * @param {number} maxValue The grid max value.
   * @param {number} padding The vAxis padding.
   * @return {!Object} Parameters for scaled coordinates.
   * @private
   */
  function getScaledParams_(height, minValue, maxValue, padding) {
    /** @type {number} */ var delta = maxValue - minValue;
    minValue = minValue <= 0 ? 1 : minValue;
    maxValue = maxValue <= 0 ? 1 : maxValue;
    delta = delta <= 0 ? 1 : delta;
    /** @type {number} */ var logDelta = Math.log(delta);
    /** @type {number} */
    var minY = Math.ceil((logDelta -
        (Math.log(maxValue) - Math.log(minValue))) *
        (height - padding * 2) / logDelta + padding);
    /** @type {number} */
    var maxY = Math.ceil((logDelta) * (height - padding * 2) /
        logDelta + padding);
    /** @type {number} */ var deltaY = maxY - minY;
    return {
      'logDelta': logDelta, 'deltaY': deltaY,
      'minY': minY, 'maxY': maxY,
      'minValue': minValue, 'maxValue': maxValue
    };
  }

  /**
   * Gets scaled coordinates for point.
   * @param {number} value The point value.
   * @param {number} height The height.
   * @param {number} padding The padding.
   * @param {!Object} params Parameters for scaled coordinates.
   * @return {number} vAxis coordinate.
   * @private
   */
  function scaledY_(value, height, padding, params) {
    /** @type {number} */ var logRow =
        Math.log(value) > 0 ? Math.log(value) : 0;
    /** @type {number} */
    var y = (params['logDelta'] - (logRow - Math.log(params['minValue']))) *
        (height - padding * 2) / params['logDelta'] + padding;
    y = (params['deltaY'] - (y - params['minY'])) * (height - padding * 2) /
        params['deltaY'] + padding;
    return height - y;
  }

  /**
   * The reference to current class instance. Used in private methods.
   * @type {!charts.LineChart}
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
   * @type {formatters.NumberFormatter}
   * @private
   */
  var formatter_ = null;
};

// Export for closure compiler.
charts['LineChart'] = charts.LineChart;
