
/**
 * @fileoverview Simple bubble chart implementation.
 * @version 1.0.1
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * FunnelChart constructor.
 * @param {string|Element} container The HTML container.
 * @constructor
 * @extends {charts.BubbleChart} charts.BubbleChart
 * @example
 * <b>var</b> chart = <b>new</b> charts.FunnelChart('container_id');
 * chart.draw([['ID',   'Temperature'],
 *             ['USA',            120],
 *             ['CAN',             50],
 *             ['RUS',             80],
 *             ['GBR',             40]
 * ]);
 *
 * <div id="chart-container"
 *      style="width: 560px; height: 300px; margin-left: 20px;"></div>
 * <script src="../../bin/jscb.js"></script>
 * <script>
 *   var chart = new charts.FunnelChart('chart-container');
 *   chart.draw([['ID',   'Temperature'],
 *               ['USA',            120],
 *               ['CAN',             50],
 *               ['RUS',             80],
 *               ['GBR',             40]
 *   ]);
 * </script>
 */
charts.FunnelChart = function(container) {
  charts.BubbleChart.apply(this, arguments);

  /**
   * Saved reference to charts.BubbleChart.draw method.
   * @type {!function(!Array.<Array>, Object=)}
   * @private
   */
  var draw_ = this.draw;

  /**
   * Draws the chart based on <code>data</code> and <code>opt_options</code>.
   * @param {!Array.<Array>} data A chart data.
   * @param {Object=} opt_options A optional chart's configuration options.
   * @override
   */
  this.draw = function(data, opt_options) {
    opt_options = getOptions_(opt_options);

    /** @type {number} */ var index = (data[0] && data[0].length - 1) || 0;
    /** @type {!Array.<number>} */
    var range = self_.getDataRange(data, index);

    /** @type {number} */ var width = self_.container.offsetWidth || 200;
    /** @type {number} */ var height = self_.container.offsetHeight || width;
    /** @type {number} */ var limit = Math.min(width, height) / 2;

    /** @type {!Array.<Array>} */
    var result = getBubbleChartData_(data, range[1], limit, index, width / 2);
    draw_(result, opt_options);
  };

  // Export for closure compiler.
  this['draw'] = this.draw;

  /**
   * @param {!Array.<Array>} data A chart data.
   * @param {number} maxValue The max value.
   * @param {number} limit The radius limit.
   * @param {number} index The value column index.
   * @param {number} center The center X coordinate.
   * @return {!Array.<Array>} Returns data converted to BubbleChart data format.
   * @private
   */
  function getBubbleChartData_(data, maxValue, limit, index, center) {
    /** @type {!Array.<Array>} */
    var result = [[data[0][0], '', '', data[0][index]]];
    for (/** @type {number} */ var i = 1; i < data.length; i++) {
      /** @type {Array} */ var row = data[i];
      /** @type {number} */ var value = row[index];
      /** @type {number} */ var y = Math.sqrt(value / Math.PI) /
          Math.sqrt(maxValue / Math.PI) * limit;
          value && result.push([row[0], center, y, value]);
    }
    return result;
  }

  /**
   * Gets chart's options merged with defaults chart's options.
   * @param {Object=} opt_options A optional chart's configuration options.
   * @return {!Object.<string, *>} A map of name/value pairs.
   * @private
   */
  function getOptions_(opt_options) {
    opt_options = opt_options || {};
    opt_options['hAxis'] = false;
    opt_options['vAxis'] = false;
    opt_options['limit'] = 100; // Radius limit in percents.
    opt_options['funnel'] = true;
    return opt_options;
    // return self_.getOptions(opt_options);
  }

  /**
   * The reference to current class instance. Used in private methods.
   * @type {!charts.FunnelChart}
   * @private
   */
  var self_ = this;
};

// Export for closure compiler.
charts['FunnelChart'] = charts.FunnelChart;
