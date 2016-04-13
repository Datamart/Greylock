
/**
 * @fileoverview Simple bubble chart implementation.
 * @version 1.0.1
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * BubbleChart constructor.
 * @param {string|Element} container The HTML container.
 * @constructor
 * @extends {charts.BaseChart} charts.BaseChart
 * @requires animation
 * @requires charts.Grid
 * @requires formatters.NumberFormatter
 * @example
 * <b>var</b> chart = <b>new</b> charts.BubbleChart('container_id');
 * chart.draw([['ID',   'X', 'Y', 'Temperature'],
 *             ['USA',   60,  60,           120],
 *             ['CAN',   25,  25,            50],
 *             ['RUS',   70,  70,            80],
 *             ['GBR',   85,  99,            40]
 * ]);
 *
 * <div id="chart-container"
 *      style="width: 560px; height: 300px; margin-left: 20px;"></div>
 * <script src="http://datamart.github.io/Greylock/greylock.js"></script>
 * <script>
 *   var chart = new charts.BubbleChart('chart-container');
 *   chart.draw([['ID',   'X', 'Y', 'Temperature'],
 *               ['USA',   60,  60,           120],
 *               ['CAN',   25,  25,            50],
 *               ['RUS',   70,  70,            80],
 *               ['GBR',   85,  99,            40]
 *   ]);
 * </script>
 */
charts.BubbleChart = function(container) {
  charts.BaseChart.apply(this, arguments);

  /**
   * Draws the chart based on <code>data</code> and <code>opt_options</code>.
   * @param {!Array.<Array>} data A chart data.
   * @param {Object=} opt_options A optional chart's configuration options.
   * @override
   * @see charts.BaseChart#getOptions
   */
  this.draw = function(data, opt_options) {
    data_ = data;
    options_ = self_.getOptions(opt_options);
    formatter_ = new formatters.NumberFormatter(
        /** @type {Object.<string,*>} */(options_['formatter']));
    self_.tooltip.setOptions(options_);

    /** @type {string} */ var content = '';
    /** @type {!Array.<Array>} */ var rows = getDataRows_();
    /** @type {!Array.<string>} */ var columns = self_.getDataColumns(data);
    /** @type {number} */ var width = self_.container.offsetWidth || 200;
    /** @type {number} */ var height = self_.container.offsetHeight || width;

    /** @type {!Array.<string>} */ var xAxisColumns = [0];
    /** @type {?number} */ var minY = null;
    /** @type {number} */ var maxY = 0;
    for (/** @type {number} */ var i = 0; i < rows.length; i++) {
      /** @type {Array.<number>} */ var row = rows[i];
      /** @type {number} */ var x = row[1];
      /** @type {number} */ var y = height - row[2];
      /** @type {number} */ var radius = row[row.length - 1];

      content += (charts.IS_CSS3_SUPPORTED ? getHtmlContent_ :
          charts.IS_SVG_SUPPORTED ? getSvgContent_ : getVmlContent_)(
          x, y, radius, options_['colors'][i], getTooltipText_(columns, row));

      maxY = Math.max(maxY, row[5]);
      if (minY == null) minY = maxY;
      minY = Math.min(minY, row[5]);
      xAxisColumns.push(formatter_.formatNumber(row[4]));
    }

    xAxisColumns.sort(function(a, b) {return a - b});
    options_['data'] = {'min': minY, 'max': maxY, 'columns': xAxisColumns};
    options_['direction'] = charts.Grid.DIRECTION.BOTTOM_TO_TOP;
    (new charts.Grid(self_.container)).draw(options_);

    self_.drawContent(content);
    initEvents_();
  };

  // Export for closure compiler.
  this['draw'] = this.draw;

  /**
   * @param {!Array.<string>} columns The data columns.
   * @param {Array.<number>} row The data row.
   * @return {string} Returns tooltip content.
   * @private
   */
  function getTooltipText_(columns, row) {
    /** @type {!Array.<string>} */ var result = [];
    if (row[0]) result.push('<b>' + row[0] + '</b>');
    for (/** @type {number} */ var i = 1; i < columns.length; i++)
      if (columns[i])
        result.push(columns[i] + ': <b>' +
                    formatter_.formatNumber(row[i + 3]) + '</b>');
      return result.join('<br>');
  }

  /**
   * @return {!Array.<Array>} Returns prepared data rows.
   * @private
   */
  function getDataRows_() {
    /** @type {!Array.<Array>} */ var rows = self_.getDataRows(data_);
    /** @type {Array.<number>} */
    var range = self_.getDataRange(data_, 3);
    /** @type {number} */ var minValue = range[0];
    /** @type {number} */ var maxValue = range[1];
    /** @type {number} */ var width = self_.container.offsetWidth || 200;
    /** @type {number} */ var height = self_.container.offsetHeight || width;
    /** @type {number} */
    var limit = Math.min(width, height) * (+options_['limit'] || 16);

    /** @type {Object.<string, number>} */
    var coords = calcBoundCoords_(rows, limit, maxValue);
    /** @type {number} */ var maxX = coords.maxX;
    /** @type {number} */ var maxY = coords.maxY;
    /** @type {number} */ var minX = coords.minX;
    /** @type {number} */ var minY = coords.minY;

    // Sort data for putting smallest bubbles on the top.
    rows.sort(sortDataRows_);

    for (/** @type {number} */ var i = 0; i < rows.length; i++) {
      /** @type {Array.<number>} */ var row = rows[i];
      /** @type {number} */
      var radius = Math.sqrt((row[3] / maxValue * limit) / Math.PI);

      row[4] = row[1]; // Saves original X coordinate for tooltip and grid.
      row[5] = row[2]; // Saves original Y coordinate for tooltip and grid.
      row[6] = row[3]; // Saves original value for tooltip and grid.

      if (!options_['funnel']) {
        row[1] = (row[1] - minX) / (maxX - minX) * width;
        row[2] = (row[2] - minY) / (maxY - minY) * height;
      } else {
        radius = Math.sqrt((row[3]) / Math.PI) /
            Math.sqrt((maxValue) / Math.PI) * Math.min(width, height) / 2;
      }
      row.push(radius);
    }
    return rows;
  }

  /**
   * @param {!Array.<Array>} rows Data rows.
   * @param {number} limit The radius limit.
   * @param {number} maxValue The max value.
   * @return {Object.<string, number>} Returns coords as {minX,maxX,minY,maxY}.
   * @private
   */
  function calcBoundCoords_(rows, limit, maxValue) {
    // TODO: Merge "calcBoundCoords_" with "getBoundCoords_" to exclude
    // duplication of similar loops.
    /** @type {Object.<string, number>} */ var coords = getBoundCoords_(rows);
    /** @type {number} */ var maxX = coords.maxX;
    /** @type {number} */ var maxY = coords.maxY;
    /** @type {number} */ var minX = coords.minX;
    /** @type {number} */ var minY = coords.minY;
    for (/** @type {number} */ var i = 0; i < rows.length; i++) {
      /** @type {Array.<number>} */ var row = rows[i];
      /** @type {number} */
      var radius = Math.sqrt((row[3] / maxValue * limit) / Math.PI);
      minX = Math.min(minX, row[1] - radius);
      minY = Math.min(minY, row[2] - radius);
      maxX = Math.max(maxX, row[1] + radius);
      maxY = Math.max(maxY, row[2] + radius);
    }
    return {minX: minX, maxX: maxX, minY: minY, maxY: maxY};
  }

  /**
   * @param {!Array.<Array>} rows Data rows.
   * @return {Object.<string, number>} Returns coords as {minX,maxX,minY,maxY}.
   * @private
   */
  function getBoundCoords_(rows) {
    /** @type {Object.<string, number>} */
    var result = {minX: 0, maxX: 0, minY: 0, maxY: 0};
    for (/** @type {number} */ var i = 0; i < rows.length; i++) {
      result.maxX = Math.max(result.maxX, rows[i][1]);
      result.maxY = Math.max(result.maxY, rows[i][2]);
    }
    result.minX = result.maxX;
    result.minY = result.maxY;
    for (i = 0; i < rows.length; i++) {
      result.minX = Math.min(result.minX, rows[i][1]);
      result.minY = Math.min(result.minY, rows[i][2]);
    }
    return result;
  }

  /**
   * Data rows sort function.
   * Used for putting smallest bubbles on the top.
   * @param {Array.<number>} a Row.
   * @param {Array.<number>} b Row.
   * @return {number} Return rows diff.
   * @private
   */
  function sortDataRows_(a, b) {
    // [id, x, y, value]
    return b[3] - a[3];
  }

  /**
   * Initializes events handlers.
   * @private
   */
  function initEvents_() {
    /** @type {Array|NodeList} */ var nodes;
    if (charts.IS_CSS3_SUPPORTED) {
      nodes = dom.getElementsByClassName(self_.container, 'circle');
    } else {
      /** @type {string} */
      var tagName = charts.IS_SVG_SUPPORTED ? 'circle' : 'oval';
      nodes = dom.getElementsByTagName(self_.container, tagName);
    }

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
    /** @type {string} */ var opacity = (
        charts.IS_SVG_SUPPORTED && !charts.IS_CSS3_SUPPORTED ?
        'fill-' : '') + 'opacity';
    /** @type {string} */
    var border = charts.IS_CSS3_SUPPORTED ? 'border' : 'stroke';

    dom.events.addEventListener(node, dom.events.TYPE.MOUSEOVER, function(e) {
      if (charts.IS_CSS3_SUPPORTED) {
        node.style[opacity] = 1;
        node.style[border] = 'solid 1px #ccc';
      } else {
        if (window.XPathNamespace) {
          node.setAttribute(opacity, 1);
          node.setAttribute('stroke-width', '1');
          node.setAttribute('stroke', '#ccc');
        } else {
          // Note: node.firstChild is <vml:fill> element.
          (charts.IS_SVG_SUPPORTED ? node.style : node.firstChild)[opacity] = 1;
          (charts.IS_SVG_SUPPORTED ? node.style : node)[
              border + (charts.IS_SVG_SUPPORTED ? '-width' : 'weight')
          ] = '1px';
          (charts.IS_SVG_SUPPORTED ? node.style : node)[
              border + (charts.IS_SVG_SUPPORTED ? '' : 'color')
          ] = '#ccc';
          if (!charts.IS_SVG_SUPPORTED) node['stroked'] = true;
        }
      }
      self_.tooltip.show(e);
    });

    dom.events.addEventListener(node, dom.events.TYPE.MOUSEOUT, function(e) {
      if (charts.IS_CSS3_SUPPORTED) {
        node.style[opacity] = options_['opacity'];
        node.style.borderColor = node.style.backgroundColor;
      } else {
        if (window.XPathNamespace) {
          node.setAttribute(opacity, options_['opacity']);
          node.setAttribute('stroke-width', '0');
        } else {
          // Note: node.firstChild is <vml:fill> element.
          (charts.IS_SVG_SUPPORTED ? node.style :
              node.firstChild)[opacity] = options_['opacity'];
          (charts.IS_SVG_SUPPORTED ? node.style : node)[
              'stroke' + (charts.IS_SVG_SUPPORTED ? '-width' : 'weight')
          ] = '0px';
          if (!charts.IS_SVG_SUPPORTED) node['stroked'] = false;
        }
      }
      self_.tooltip.hide(e);
    });

    dom.events.addEventListener(
        node, dom.events.TYPE.MOUSEMOVE, self_.tooltip.show);

    dom.events.dispatchEvent(node, dom.events.TYPE.MOUSEOUT);
    initAnimation_(node);
  }

  /**
   * Initializes bubble animation.
   * @param {!Element|Node} node The element.
   * @private
   */
  function initAnimation_(node) {
    // Animation for SVG nodes is implemented by <svg:animate/> tag.
    // Perform animation for VML and HTML nodes.
    if (!charts.IS_SVG_SUPPORTED || charts.IS_CSS3_SUPPORTED) {
      var size = parseFloat(node.style.width) || node.offsetWidth;
      var x = parseFloat(node.style.left) || node.offsetLeft;
      var y = parseFloat(node.style.top) || node.offsetTop;
      node.style.width = '1px';
      node.style.height = '1px';
      node.style.left = (x + size / 2) + 'px';
      node.style.top = (y + size / 2) + 'px';
      animation.animate(node, {
        'width': size, 'height': size, 'left': x,
        'top': y, 'transform': 'scale(1.0)'
      });
    }
  }

  /**
   * @param {number} x The X coord.
   * @param {number} y The Y coord.
   * @param {number} radius The bubble radius.
   * @param {string} color The bubble color.
   * @param {string} tooltip The bubble tooltip.
   * @return {string} Returns HTML markup string.
   * @private
   */
  function getHtmlContent_(x, y, radius, color, tooltip) {
    return '<div class="circle" style="position:absolute;border-radius:50%;' +
           'opacity:' + options_['opacity'] + ';' +
           'width:' + (radius * 2) + 'px;' +
           'height:' + (radius * 2) + 'px;' +
           'top:' + (y - radius) + 'px;' +
           'left:' + (x - radius) + 'px;' +
           'background:' + color + ';' +
           'border: solid 1px ' + color + ';' +
           '-moz-transform:scale(0);' +
           '-webkit-transform:scale(0);' +
           '-o-transform:scale(0);' +
           '" title="' + tooltip + '"></div>';
  }

  /**
   * @param {number} x The X coord.
   * @param {number} y The Y coord.
   * @param {number} radius The bubble radius.
   * @param {string} color The bubble color.
   * @param {string} tooltip The bubble tooltip.
   * @return {string} Returns SVG markup string.
   * @private
   */
  function getSvgContent_(x, y, radius, color, tooltip) {
    /** @type {string} */
    var duration = (Math.random() * (0.6 - 0.2) + 0.2).toFixed(2);
    /** @type {string} */
    var delay = (Math.random() * (0.3 - 0.1) + 0.1).toFixed(2);

    return '<circle cx="' + x + '" cy="' + y + '" r="' +
        radius + '" fill="' + color + '" tooltip="' + tooltip + '" ' +
        // 'stroke="' + color + '" stroke-width="0" ' +
        'fill-opacity="' + options_['opacity'] + '">' +

        '<animate attributeName="r" dur="' + duration + 's" from="0" to="' +
        (radius * 1.2) + '"/>' +
        '<animate attributeName="r" dur="' + delay + 's" from="' +
        (radius * 1.2) + '" to="' + radius + '" begin="' + duration + 's"/>' +

        '<animate attributeName="fill-opacity" from="0" to="' +
        options_['opacity'] + '" dur="' +
        (parseFloat(duration) + parseFloat(delay)) + 's"/>' +
        '</circle>';
  }

  /**
   * @param {number} x The X coord.
   * @param {number} y The Y coord.
   * @param {number} radius The bubble radius.
   * @param {string} color The bubble color.
   * @param {string} tooltip The bubble tooltip.
   * @return {string} Returns VML markup string.
   * @private
   */
  function getVmlContent_(x, y, radius, color, tooltip) {
    return '<v:oval ' +
        'style="' +
        'top:' + (y - radius) + 'px;' +
        'left:' + (x - radius) + 'px;' +
        'width:' + (radius * 2) + 'px;' +
        'height:' + (radius * 2) + 'px;' +
        '" tooltip="' + tooltip + '"' +
        // ' strokecolor="' + color + '" strokeweight="0"' +
        // ' stroked="true"' +
        '>' +
        '<v:fill color="' + color + '"' +
        '" opacity="' + options_['opacity'] + '"/>' +
        '</v:oval>';
  }

  /**
   * The reference to current class instance. Used in private methods.
   * @type {!charts.BubbleChart}
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
   * @type {!formatters.NumberFormatter}
   * @private
   */
  var formatter_ = new formatters.NumberFormatter;
};

// Export for closure compiler.
charts['BubbleChart'] = charts.BubbleChart;
