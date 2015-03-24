
/**
 * @fileoverview Simple hoop chart implementation.
 * @version 1.0.1
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * HoopChart constructor.
 * @param {string|Element} container The HTML container.
 * @constructor
 * @extends {charts.DonutChart} charts.DonutChart
 * @example
 * <b>var</b> chart = <b>new</b> charts.HoopChart('container_id');
 * chart.draw([['Work', 'Eat', 'Commute', 'Watch TV', 'Sleep'],
 *             [100, 50, 30, 10, 40], [140, 2, 110, 150, 1300]]);
 *
 * <div style="border: solid 1px #ccc; margin: 5px; padding: 5px; width: 560px">
 *   <div id="chart-container"
 *        style="width: 560px; height: 300px;"></div>
 * </div>
 * <script src="../../bin/jscb.js"></script>
 * <script>
 *   var chart = new charts.HoopChart('chart-container');
 *   chart.draw([['Work', 'Eat', 'Commute', 'Watch TV', 'Sleep'],
 *               [100, 50, 30, 10, 40], [140, 2, 110, 150, 1300]]);
 * </script>
 */
charts.HoopChart = function(container) {
  charts.DonutChart.apply(this, arguments);

  /**
   * Saved reference to charts.DonutChart.draw method.
   * @type {!function(!Array.<Array>, Object=)}
   * @private
   */
  var draw_ = this.draw;

  /**
   * Draws the chart based on <code>data</code> and <code>opt_options</code>.
   * @param {!Array.<Array>} data A chart data.
   * @param {Object=} opt_options A optional chart's configuration options.
   * @see charts.DonutChart#draw
   * @see charts.PieChart#draw
   * @see charts.BaseChart#getOptions
   * @override
   * @example
   * options: {
   *   'hoop': {'radius': 0.85}
   *   'animation': {'radius': 1}
   * }
   */
  this.draw = function(data, opt_options) {
    options_ = getOptions_(opt_options);
    draw_(data, options_);

    // The timeout is waitings for charts.PieChart event initialization.
    setTimeout(function() {
      /** @type {string} */
      var tagName = charts.IS_SVG_SUPPORTED ? 'text' : 'textbox';
      /** @type {NodeList} */
      var nodes = dom.getElementsByTagName(self_.container, tagName);
      for (/** @type {number} */ var i = nodes.length - 1; i >= 0; --i) {
        nodes[i].parentNode.removeChild(nodes[i]);
      }
    }, 100);
  };

  // Export for closure compiler.
  this['draw'] = this.draw;

  /**
   * Gets circle area content.
   * @return {string} Returns circle area content.
   * @protected
   * @override
   * @expose
   */
  this.getAreaContent = function() {
    // The @expose annotation fixes closure compiler multi-inheritance bug.
    /** @type {string} */
    var content = '<div style="color:#aaa;font-size:15px">Example of</div>' +
                  '<div style="color:#666;font-size:18px"><b>' +
                  'HoopChart' + '</b></div>';
    return content;
  };

  /**
   * Gets chart's options merged with defaults chart's options.
   * @param {Object=} opt_options A optional chart's configuration options.
   * @return {!Object.<string, *>} A map of name/value pairs.
   * @see charts.BaseChart#getOptions
   * @private
   * @example
   * options: {
   *   'hoop': {'radius': 0.85}
   *   'animation': {'radius': 1}
   * }
   */
  function getOptions_(opt_options) {
    opt_options = opt_options || {};
    opt_options['hoop'] = opt_options['hoop'] || {};
    opt_options['donut'] = opt_options['donut'] || {};
    opt_options['donut']['radius'] = opt_options['hoop']['radius'] || 0.85;
    opt_options['animation'] = opt_options['animation'] || {};
    opt_options['animation']['radius'] =
        opt_options['animation']['radius'] || 1;
    return self_.getOptions(opt_options);
  }

  /**
   * The reference to current class instance. Used in private methods.
   * @type {!charts.HoopChart}
   * @private
   */
  var self_ = this;

  /**
   * @dict
   * @private
   */
  var options_ = null;
};

// Export for closure compiler.
charts['HoopChart'] = charts.HoopChart;
