
/**
 * @fileoverview Simple pie chart implementation.
 * @version 1.0.1
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * PieChart constructor.
 * @param {string|Element} container The HTML container.
 * @constructor
 * @extends {charts.BaseChart} charts.BaseChart
 * @requires formatters.NumberFormatter
 * @example
 * <b>var</b> chart = <b>new</b> charts.PieChart('container_id');
 * chart.draw([['Work', 'Eat', 'Commute', 'Watch TV', 'Sleep'],
 *             [100, 50, 30, 10, 40], [140, 2, 110, 150, 1300]]);
 *
 * <div style="border: solid 1px #ccc; margin: 5px; padding: 5px; width: 560px">
 *   <div id="chart-container"
 *        style="width: 560px; height: 300px;"></div>
 * </div>
 * <script src="http://datamart.github.io/Greylock/greylock.js"></script>
 * <script>
 *   var chart = new charts.PieChart('chart-container');
 *   chart.draw([['Work', 'Eat', 'Commute', 'Watch TV', 'Sleep'],
 *               [100, 50, 30, 10, 40], [140, 2, 110, 150, 1300]]);
 * </script>
 */
charts.PieChart = function(container) {
  charts.BaseChart.apply(this, arguments);

  /**
   * Draws the chart based on <code>data</code> and <code>opt_options</code>.
   * @param {!Array.<Array>} data A chart data.
   * @param {Object=} opt_options A optional chart's configuration options.
   * @see charts.BaseChart#getOptions
   * @override
   * @example
   * options: {
   *   'animation': {'radius': 0.7}
   *   'font': {'color': '#fff'}
   *   'stroke': {'stroke': 1}
   * }
   */
  this.draw = function(data, opt_options) {
    data_ = data;
    options_ = getOptions_(opt_options);
    formatter_ = new formatters.NumberFormatter(
        /** @type {Object.<string,*>} */(options_['formatter']));
    tooltip_.setOptions(options_);

    /** @type {!Array.<number>} */ var rows = [];
    for (/** @type {number} */ var i = 1; i < data.length; i++) {
      for (/** @type {number} */ var j = 0; j < data[i].length; j++) {
        rows[j] = (rows[j] || 0) + data[i][j];
      }
    }

    /** @type {!Array.<number>} */ var angles = [];
    /** @type {!Array.<string>} */ var tooltips = [];
    /** @type {number} */ var len = rows.length;
    /** @type {number} */ var total = 0.0001;
    for (i = 0; i < len;) total += rows[i++];

    for (i = 0; i < len; i++) {
      /** @type {number} */ var value = rows[i];
      if (void 0 != value) {
        /** @type {number} */ var ratio = value / total > 0.999 ?
                                          0.999 : value / total;
        /** @type {number} */ var angle = 360 * ratio;
        /** @type {number} */ var percent = len > 1 ? angle / 360 * 100 : 100;
        angles.push(angle);
        tooltips.push(formatter_.format(value) +
            ' (' + percent.toFixed(1) + '%)');
      }
    }

    draw_(angles, tooltips, total);
    setTimeout(initEvents_, 100);
  };

  // Export for closure compiler.
  this['draw'] = this.draw;

  /**
   * Gets chart's options merged with defaults chart's options.
   * @param {Object=} opt_options A optional chart's configuration options.
   * @return {!Object.<string, *>} A map of name/value pairs.
   * @see charts.BaseChart#getOptions
   * @private
   * @example
   * options: {
   *   'animation': {'radius': 0.7}
   *   'font': {'color': '#fff'}
   *   'stroke': {'stroke': 1}
   * }
   */
  function getOptions_(opt_options) {
    opt_options = opt_options || {};
    opt_options['font'] = opt_options['font'] || {};
    opt_options['font']['color'] = opt_options['font']['color'] || '#fff';
    opt_options['stroke'] = opt_options['stroke'] || {};
    opt_options['stroke']['size'] = opt_options['stroke']['size'] || 1;
    opt_options['animation'] = opt_options['animation'] || {};
    opt_options['formatter'] = opt_options['formatter'] || {};
    opt_options['animation']['radius'] =
        opt_options['animation']['radius'] || 0.7;
    return self_.getOptions(opt_options);
  }

  /**
   * Initializes events handlers.
   * @private
   */
  function initEvents_() {
    /** @type {string} */
    var tagName = charts.IS_SVG_SUPPORTED ? 'path' : 'shape';
    /** @type {NodeList} */
    var nodes = dom.getElementsByTagName(self_.container, tagName);
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
    /** @type {string} */ var attr = 'opacity';
    /** @type {!Object.<string, function(Event,...)>} */ var events = {};

    events[dom.events.TYPE.MOUSEMOVE] = function(e) {
      tooltip_.show(e);
    };

    events[dom.events.TYPE.MOUSEOVER] = function(e) {
      // Note: node.firstChild is <vml:fill> element.
      (charts.IS_SVG_SUPPORTED ? node.style : node.firstChild)[attr] = 1;
      tooltip_.show(e);
    };

    events[dom.events.TYPE.MOUSEOUT] = function(e) {
      // Note: node.firstChild is <vml:fill> element.
      (charts.IS_SVG_SUPPORTED ? node.style : node.firstChild)[attr] =
          options_['opacity'];
      tooltip_.hide(e);
    };

    for (/** @type {string} */ var key in events) {
      dom.events.addEventListener(node, key, events[key]);

      // Add the same listener to SVG text element.
      if (charts.IS_SVG_SUPPORTED)
        dom.events.addEventListener(node.nextSibling, key, events[key]);
    }

    events[dom.events.TYPE.MOUSEOUT](null);
    // dom.events.dispatchEvent(node, dom.events.TYPE.MOUSEOUT);
  }

  /**
   * Calculates pie piece coordinates.
   * @param {number} width The chart width.
   * @param {number} height The chart height.
   * @param {number} radius The piece radius.
   * @param {number} startAngle The piece start angle.
   * @param {number} endAngle The piece end angle.
   * @return {Object.<string, number>} Returns pie piece coordinates.
   * @private
   */
  function getCoords_(width, height, radius, startAngle, endAngle) {
    /** @type {number} */ var fix = charts.IS_SVG_SUPPORTED ? 0 : 360;
    /** @type {number} */
    var offset = Math.PI * (startAngle + (endAngle + fix - startAngle) / 2);
    /** @type {number} */ var halfWidth = width / 2;
    /** @type {number} */ var halfHeight = height / 2;
    return {
      x1: halfWidth + radius * Math.cos(Math.PI * startAngle / 180),
      y1: halfHeight + radius * Math.sin(Math.PI * startAngle / 180),
      x2: halfWidth + radius * Math.cos(Math.PI * endAngle / 180),
      y2: halfHeight + radius * Math.sin(Math.PI * endAngle / 180),
      tx: halfWidth + (radius * 0.75) * Math.cos(offset / 180),
      ty: halfHeight + (radius * 0.75) * Math.sin(offset / 180)
    };
  }

  /**
   * @param {!Array.<number>} angles The list of piece's angles.
   * @param {!Array.<string>} tooltips The list of piece's tooltips.
   * @param {number} total The total value.
   * @private
   */
  function draw_(angles, tooltips, total) {
    /** @type {number} */ var startAngle = 0;
    /** @type {number} */ var endAngle = charts.IS_SVG_SUPPORTED ? 270 : 90;
    /** @type {number} */ var width = self_.container.offsetWidth || 200;
    /** @type {number} */ var height = self_.container.offsetHeight || width;
    /** @type {number} */ var radius = Math.min(width, height) / 2;
    /** @type {number} */ var length = angles.length;
    /** @type {string} */ var content = '';

    /** @type {!Array.<string>} */ var colors = [].concat(options_['colors']);
    for (/** @type {number} */ var i = 0; i < length; i++) {
      /** @type {string} */ var color = colors.shift();
      colors.push(color);
      /** @type {number} */ var angle = angles[i];
      /** @type {number} */ var percent = length > 1 ? angle / 360 * 100 : 100;
      /** @type {string} */ var percents = percent.toFixed(1);
      /** @type {string} */ var column = self_.getDataColumns(data_)[i];
      try {
        column = decodeURI(column);
      } catch (ex) {}
      column = unescape(column).replace(/\"/g, ' ');

      /** @type {string} */
      var tooltip = column ? (column + '<br><b>' + tooltips[i] + '</b>') : '';

      startAngle = endAngle;
      endAngle = startAngle + angle;
      /** @type {Object.<string, number>} */
      var coords = getCoords_(width, height, radius, startAngle, endAngle);
      /** @type {number} */
      var textOffsetX = (12 + (('%' + percents).length - 3) * 4);
      /** @type {number} */
      var textOffsetY = parseInt(options_['font']['size'] / 2, 10);

      if (charts.IS_SVG_SUPPORTED) {
        content += getSvgContent_(
            width, height, coords.x1, coords.y1, coords.x2, coords.y2, radius,
            coords.tx - textOffsetX, coords.ty + textOffsetY,
            color, percents, tooltip, startAngle, endAngle);
      } else {
        content += getVmlContent_(
            width, height, radius,
            coords.tx - textOffsetX, coords.ty + textOffsetY,
            color, percents, tooltip, startAngle, endAngle);
      }
    }

    self_.drawContent(content, width, height);
  }

  /**
   * @param {number} width The width.
   * @param {number} height The height.
   * @param {number} x1 The X1.
   * @param {number} y1 The Y1.
   * @param {number} x2 The X2.
   * @param {number} y2 The Y2.
   * @param {number} radius The radius.
   * @param {number} tx The text X.
   * @param {number} ty The text Y.
   * @param {string} fill The fill color.
   * @param {string} percents The text.
   * @param {string} tooltip The tooltip.
   * @param {number} startAngle The startAngle.
   * @param {number} endAngle The endAngle.
   * @return {string} Returns SVG markup string.
   * @private
   */
  function getSvgContent_(
      width, height, x1, y1, x2, y2, radius, tx, ty, fill, percents, tooltip,
      startAngle, endAngle) {
    // http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
    /** @type {number} */ var flag = parseInt(percents, 10) > 50 ? 1 : 0;
    /** @type {string} */
    var path = 'M' + (width / 2) + ',' + (height / 2) +
               'L' + x1 + ',' + y1 +
               'A' + radius + ',' + radius + ' 0,' +
                flag + ',1,' + x2 + ',' + y2 +
               'L' + (width / 2) + ',' + (height / 2) +
               'A0,0,0,0,0,' + (width / 2) + ',' + (height / 2);

    return '<g>' +
        '<path d="' + path + '" fill="' + fill + '" ' + 'stroke="' +
        options_['font']['color'] + '" ' +
        'stroke-width="' + options_['stroke']['size'] + '" ' +
        'tooltip="' + tooltip + '"' +
        '>' +
        '<animate attributeName="d" dur="0.5s" values="' +
        getSvgAnimatedPath_(width, height, radius, startAngle, endAngle) +
        '" calcMode="discrete"/>' +
        '<animate attributeName="fill-opacity" from="0" to="' +
        options_['opacity'] + '" dur="0.5s"/>' +
        '</path>' +

        '<text text-anchor="start" ' +
        'font-family="' + options_['font']['family'] + '" ' +
        'font-size="' + options_['font']['size'] + '" ' +
        'x="' + tx + '" ' +
        'y="' + ty + '" ' + ' style="cursor:default;' +
        'text-shadow:0.1px 0.1px 1px #000" ' +
        'stroke="none" stroke-width="0" fill="' +
        options_['font']['color'] + '">' +
        (percents < 5 ? '' : percents + '%') + '</text>' +
        '</g>';
  }
  /**
   * @param {number} width The width.
   * @param {number} height The height.
   * @param {number} radius The radius.
   * @param {number} startAngle The startAngle.
   * @param {number} endAngle The endAngle.
   * @return {string} Returns SVG animation path string.
   * @private
   */
  function getSvgAnimatedPath_(width, height, radius, startAngle, endAngle) {
    /** @type {!Array.<string>} */ var paths = [];
    /** @type {number} */ var steps = 20;
    /** @type {number} */ var randomStart = Math.random() * 360 + 270;
    /** @type {number} */ var randomEnd = Math.random() * 360 + 270;
    /** @type {number} */ var r = radius * options_['animation']['radius'];
    /** @type {number} */ var switcher = 0;
    if (randomStart > randomEnd) {
      switcher = randomStart;
      randomStart = randomEnd;
      randomEnd = switcher;
    }
    for (/** @type {number} */ var i = steps; i > 0; i--) {
      /** @type {number} */
      var angle1 = startAngle + (randomStart - startAngle) / steps * i;
      /** @type {number} */
      var angle2 = endAngle + (randomEnd - endAngle) / steps * i;
      var radius1 = radius + (r - radius) / steps * i;
      /** @type {Object.<string, number>} */
      var coords = getCoords_(width, height, radius1, angle1, angle2);
      // http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
      /** @type {number} */ var flag = (angle2 - angle1) > 180 ? 1 : 0;
      paths.push('M' + (width / 2) + ',' + (height / 2) +
          'L' + parseInt(coords.x1, 10) + ',' + parseInt(coords.y1, 10) +
          'A' + radius1 + ',' + radius1 + ' 0,' +
          flag + ',1,' + parseInt(coords.x2, 10) + ',' +
          parseInt(coords.y2, 10) +
          'L' + (width / 2) + ',' + (height / 2) +
          'A0,0,0,0,0,' + (width / 2) + ',' + (height / 2));
    }
    return paths.join('; ');
  }

  /**
   * @param {number} width The width.
   * @param {number} height The height.
   * @param {number} radius The radius.
   * @param {number} tx The text X.
   * @param {number} ty The text Y.
   * @param {string} fill The fill color.
   * @param {string} percents The percents text.
   * @param {number} startAngle The startAngle.
   * @param {number} endAngle The endAngle.
   * @param {string} tooltip The tooltip name.
   * @return {string} Returns VML markup string.
   * @private
   * @see http://www.w3.org/TR/NOTE-VML#_Toc416858391
   */
  function getVmlContent_(
      width, height, radius, tx, ty, fill, percents, tooltip,
      startAngle, endAngle) {
    /** @type {number} */ var fixedWidth = parseInt(width / 2, 10);
    /** @type {number} */ var fixedHeight = parseInt(height / 2, 10);
    /** @type {string} */
    var path = 'M ' + fixedWidth + ' ' + fixedHeight + ' ' +
               'AE ' + fixedWidth + ' ' + fixedHeight + ' ' +
               parseInt(radius, 10) + ' ' + parseInt(radius, 10) + ' ' +
               Math.round(startAngle * 65535) + ' ' +
               (-Math.round(-(endAngle - startAngle) * 65536)) +
               ' X E';
    return '<v:shape path="' + path + '" ' +
        'strokeweight="' + options_['stroke']['size'] + 'px" ' +
        'strokecolor="' + options_['font']['color'] + '" ' +
        'fillcolor="' + fill + '" ' +
        'tooltip="' + tooltip + '"' +
        'style="width:' + width + 'px;height:' + height + 'px;flip:x">' +
        '<v:fill opacity="1" color="' + fill + '"/>' +

        '<v:textbox style="color:' + options_['font']['color'] + ';" ' +
        'tooltip="' + tooltip + '"' +
        '>' +
        '<div style="position:relative;cursor:default;width:50px;' +
        'font-family:' + options_['font']['family'] + '; ' +
        'font-size:' + options_['font']['size'] + 'px; ' +
        'top:' + (ty - 18) + 'px;' +
        'left:' + (tx - 10) + 'px;">' +
        (percents < 5 ? '' : percents + '%') + '</div></v:textbox>' +
        // '<v:extrusion on="true"/>' +
        '</v:shape>';
  }

  /**
   * The reference to current class instance. Used in private methods.
   * @type {!charts.PieChart}
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

  /**
   * Instance of <code>charts.Tooltip</code>.
   * @type {!charts.Tooltip}
   * @see charts.Tooltip
   * @private
   */
  var tooltip_ = self_.tooltip;
};

// Export for closure compiler.
charts['PieChart'] = charts.PieChart;
