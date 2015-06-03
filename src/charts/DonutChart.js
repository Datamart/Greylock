
/**
 * @fileoverview Simple donut chart implementation.
 * @version 1.0.1
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * DonutChart constructor.
 * @param {string|Element} container The HTML container.
 * @constructor
 * @extends {charts.PieChart} charts.PieChart
 * @requires formatters.NumberFormatter
 * @example
 * <b>var</b> chart = <b>new</b> charts.DonutChart('container_id');
 * chart.draw([['Work', 'Eat', 'Commute', 'Watch TV', 'Sleep'],
 *             [100, 50, 30, 10, 40], [140, 2, 110, 150, 1300]]);
 *
 * <div style="border: solid 1px #ccc; margin: 5px; padding: 5px; width: 560px">
 *   <div id="chart-container"
 *        style="width: 560px; height: 300px;"></div>
 * </div>
 * <script src="../../min/greylock.js"></script>
 * <script>
 *   var chart = new charts.DonutChart('chart-container');
 *   chart.draw([['Work', 'Eat', 'Commute', 'Watch TV', 'Sleep'],
 *               [100, 50, 30, 10, 40], [140, 2, 110, 150, 1300]]);
 * </script>
 */
charts.DonutChart = function(container) {
  charts.PieChart.apply(this, arguments);

  /**
   * Saved reference to charts.PieChart.draw method.
   * @type {!function(!Array.<Array>, Object=)}
   * @private
   */
  var draw_ = this.draw;

  /**
   * Draws the chart based on <code>data</code> and <code>opt_options</code>.
   * @param {!Array.<Array>} data A chart data.
   * @param {Object=} opt_options A optional chart's configuration options.
   * @override
   * @see charts.PieChart#draw
   * @see charts.BaseChart#getOptions
   * @example
   * options: {
   *   'donut': {'color': '#fff', 'radius': 0.5}
   * }
   */
  this.draw = function(data, opt_options) {
    /** @type {number} */ var width = self_.container.offsetWidth || 200;
    /** @type {number} */ var height = self_.container.offsetHeight || width;
    draw_(data, opt_options);
    self_.container.style.visibility = 'hidden';
    data_ = data;
    options_ = getOptions_(opt_options);
    formatter_ = new formatters.NumberFormatter(
        /** @type {Object.<string,*>} */(options_['formatter']));

    if (options_['donut'] && options_['donut']['radius']) {
      /** @type {number} */ var x = width / 2;
      /** @type {number} */ var y = height / 2;
      /** @type {number} */
      var radius = Math.min(width, height) / 2 * options_['donut']['radius'];
      /** @type {string} */ var content = charts.IS_SVG_SUPPORTED ?
          getSvgContent_(x, y, radius) : getVmlContent_(x, y, radius);
      self_.drawContent(content, width, height);

      /** @type {number} */ var timer = setTimeout(function() {
        /** @type {Node} */ var pie = self_.container.childNodes[0];
        /** @type {Node} */ var donut = self_.container.childNodes[1];
        if (charts.IS_SVG_SUPPORTED && donut) {
          while (donut.firstChild) pie.appendChild(donut.firstChild);
          self_.container.removeChild(donut);
        }
        clearTimeout(timer);
        self_.container.style.visibility = 'visible';
      }, 0);

      setAreaContent_(x, y, radius);
    }
  };

  // Export for closure compiler.
  this['draw'] = this.draw;

  /**
   * Gets circle area content.
   * @return {string} Returns circle area content.
   * @protected
   * @expose
   */
  this.getAreaContent = function() {
    /** @type {string} */
    var content = '<div style="color:#666;font-size:22px;margin-bottom:3px;">' +
                  formatter_.round(getTotal_()) + '</div>' +
                  '<div style="color:#B3B0B0;font-size:11px">TOTAL</div>';
    return content;
  };

  /**
   * @param {number} x The X coord.
   * @param {number} y The Y coord.
   * @param {number} radius The donut radius.
   * @private
   */
  function setAreaContent_(x, y, radius) {
    if (!area_) {
      var size = Math.sqrt(radius * radius / 2) * 2 - 1;

      area_ = self_.container.appendChild(dom.createElement('DIV'));
      area_.style.position = 'absolute';
      area_.style.width = size + 'px';
      area_.style.height = size + 'px';
      area_.style.left = x - size / 2 + 'px';
      area_.style.top = y - size / 2 + 'px';
      area_.style.fontFamily = options_['font']['family'];
      area_.innerHTML = '<table style="width:100%;height:100%;' +
                        //'text-shadow:1px 1px 2px red;letter-spacing:-1px;' +
                        'text-align:center;vertical-align:middle"><tr><td>' +
                        '</td></tr></table>';
    }

    dom.getElementsByTagName(
        area_, 'TD')[0].innerHTML = self_.getAreaContent();
  }

  /**
   * @return {number} Returns sum of data values.
   * @private
   */
  function getTotal_() {
    /** @type {number} */ var total = 0;
    /** @type {!Array.<Array>} */ var rows = self_.getDataRows(data_);
    for (/** @type {number} */ var i = 0; i < rows.length; i++) {
      /** @type {Array} */ var row = rows[i];
      for (/** @type {number} */ var j = 0; j < row.length; j++) {
        total += row[j];
      }
    }
    return total;
  }


  /**
   * @param {number} x The X coord.
   * @param {number} y The Y coord.
   * @param {number} radius The donut radius.
   * @return {string} Returns donut SVG markup.
   * @private
   */
  function getSvgContent_(x, y, radius) {
    /** @type {string} */ var result = formatter_.round(getTotal_());
    return '<g>' +
        '<circle cx="' + x + '" cy="' + y + '" r="' +
        radius + '" fill="' + options_['donut']['color'] + '"/>' +

        // '<circle cx="' + x + '" cy="' + y + '" r="' +
        // radius + '" fill="' + options_['donut']['color'] + '">' +
        // '<animate attributeName="r" from="' +
        // radius + '" to="' +
        // (radius * 1.2) + '" begin="0.4s" dur="0.1s"/>' +
        // '<animate attributeName="r" from="' +
        // (radius * 1.2) + '" to="' + radius + '" begin="0.5s" dur="0.1s"/>' +
        // '</circle>' +

        '</g>';
  }

  /**
   * @param {number} x The X coord.
   * @param {number} y The Y coord.
   * @param {number} radius The donut radius.
   * @return {string} Returns donut VML markup.
   * @private
   */
  function getVmlContent_(x, y, radius) {
    var total = getTotal_();
    return '<v:oval fillcolor="' + options_['donut']['color'] + '" ' +
        'style="' +
        'top:' + (y - radius) + 'px;' +
        'left:' + (x - radius) + 'px;' +
        'width:' + (radius * 2) + 'px;' +
        'height:' + (radius * 2) + 'px;' +
        '" stroked="false">' +
        '</v:oval>';
  }

  /**
   * Gets chart's options merged with defaults chart's options.
   * <code><pre> defaults: {
   *   'donut': {'color': '#fff', 'radius': 0.5}
   * }</pre></code>
   * @param {Object=} opt_options A optional chart's configuration options.
   * @return {!Object.<string, *>} A map of name/value pairs.
   * @see charts.BaseChart#getOptions
   * @private
   */
  function getOptions_(opt_options) {
    opt_options = opt_options || {};
    opt_options['donut'] = opt_options['donut'] || {};
    opt_options['donut']['color'] = opt_options['donut']['color'] || '#fff';
    opt_options['donut']['radius'] = opt_options['donut']['radius'] || 0.5;
    opt_options['formatter'] = opt_options['formatter'] || {};
    return self_.getOptions(opt_options);
  }

  /**
   * The reference to current class instance. Used in private methods.
   * @type {!charts.DonutChart}
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
   * @type {Node}
   * @private
   */
  var area_ = null;
};

// Export for closure compiler.
charts['DonutChart'] = charts.DonutChart;
