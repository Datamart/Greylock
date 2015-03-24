
/**
 * @fileoverview Simple column chart implementation.
 * @version 1.0.1
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * ColumnChart constructor.
 * @param {string|Element} container The HTML container.
 * @constructor
 * @extends {charts.BarChart} charts.BarChart
 * @example
 * <b>var</b> chart = <b>new</b> charts.ColumnChart('container_id');
 * chart.draw([['Year', 'Sales', 'Expenses', 'Profit'],
 *             [2011, 80, 30, 45], [2012, 65, 130, 90], [2013, 45, 100, 60]]);
 *
 * <div id="chart-container"
 *      style="width: 560px; height: 200px; margin: 0 0 20px 20px;"></div>
 * <script src="../../bin/jscb.js"></script>
 * <script>
 *   var chart = new charts.ColumnChart('chart-container');
 *   chart.draw([['Year', 'Sales', 'Expenses', 'Profit'],
 *               [2011, 80, 30, 45], [2012, 65, 130, 90], [2013, 45, 100, 60]]);
 * </script>
 */
charts.ColumnChart = function(container) {
  charts.BarChart.apply(this, arguments);

  /**
   * @private
   */
  function init_() {
    self_.defaults['direction'] = charts.Grid.DIRECTION.BOTTOM_TO_TOP;
  }

  /**
   * The reference to current class instance. Used in private methods.
   * @type {!charts.ColumnChart}
   * @private
   */
  var self_ = this;

  init_();
};

// Export for closure compiler.
charts['ColumnChart'] = charts.ColumnChart;
