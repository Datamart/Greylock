
/**
 * @fileoverview Simple pie chart implementation.
 * @version 1.0.1
 * @see https://google.github.io/styleguide/jsguide.html
 * @see https://github.com/google/closure-compiler/wiki
 */



/**
 * TagChart constructor.
 * @param {string|Element} container The HTML container.
 * @constructor
 * @extends {charts.BaseChart} charts.BaseChart
 * @requires formatters.NumberFormatter
 * @example
 * <b>var</b> chart = <b>new</b> charts.TagChart('container_id');
 * chart.draw([['Country', 'Population'],
 *             ['Germany', 200],
 *             ['USA',     300],
 *             ['Brazil',  400],
 *             ['Canada',  500],
 *             ['France',  600],
 *             ['Russia',  700]
 * ]);
 *
 * <div style="border: solid 1px #ccc; margin: 5px; padding: 5px; width: 560px">
 *   <div id="chart-container"
 *        style="width: 560px; height: 300px;"></div>
 * </div>
 * <script src="https://greylock.js.org/greylock.js"></script>
 * <script>
 *   var chart = new charts.TagChart('chart-container');
 *   chart.draw([['Country', 'Population'],
 *               ['Germany', 200],
 *               ['USA',     300],
 *               ['Brazil',  400],
 *               ['Canada',  500],
 *               ['France',  600],
 *               ['Russia',  700]
 *   ]);
 * </script>
 */
charts.TagChart = function(container) {
  charts.BaseChart.apply(this, arguments);

  /**
   * Draws the chart based on <code>data</code> and <code>opt_options</code>.
   * @param {!Array.<Array>} data A chart data.
   * @param {Object=} opt_options A optional chart's configuration options.
   * @see charts.BaseChart#getOptions
   * @override
   * @example
   * options: {
   *   'font': {'family': 'Arial'}
   * }
   */
  this.draw = function(data, opt_options) {
    data_ = data;
    options_ = getOptions_(opt_options);
    self_.tooltip.setOptions(options_);
    shuffle_(data_);

    draw_();
  };

  /**
   * Draws content into <code>this.container</code> as <code>innerHTML</code>.
   * @param {string} content SVG or VML markup content.
   * @param {number=} opt_width Optional chart width.
   * @param {number=} opt_height Optional chart height.
   */
  this.drawContent = function(content, opt_width, opt_height) {
    opt_width = opt_width || self_.container.offsetWidth || 200;
    opt_height = opt_height || self_.container.offsetHeight || opt_width;

    self_.container.style.position = 'relative';
    self_.container.style.overflow = 'hidden';

    self_.container.innerHTML = content;
  };

  // Export for closure compiler.
  this['draw'] = this.draw;

  // Export for closure compiler.
  this['drawContent'] = this.drawContent;

  /**
   * Gets chart's options merged with defaults chart's options.
   * @param {Object=} opt_options A optional chart's configuration options.
   * @return {!Object.<string, *>} A map of name/value pairs.
   * @see charts.BaseChart#getOptions
   * @private
   * @example
   * options: {
   *   'font': {'family': 'Arial'}
   * }
   */
  function getOptions_(opt_options) {
    opt_options = opt_options || {};
    opt_options['font'] = opt_options['font'] || {};
    opt_options['font']['family'] = opt_options['font']['family'] || '';
    return self_.getOptions(opt_options);
  }

  /**
   * @private
   */
  function draw_() {
    /** @type {!Array.<number>} */ var range = self_.getDataRange(data_, 1);
    /** @type {number} */ var width = self_.container.offsetWidth || 200;
    /** @type {number} */ var height = self_.container.offsetHeight || width;
    /** @type {string} */ var content = '<div style="text-align: center;' +
                                        ' line-height: 1.6em; padding: 10px;">';
    /** @type {number} */ var minValue = range[0];
    /** @type {number} */ var maxValue = range[1];

    for (/** @type {number} */ var i = 1; i < data_.length; i++) {
      /** @type {string} */ var title = data_[i][0];
      /** @type {number} */ var value = data_[i][1];
      /** @type {string} */ var color = options_['colors'][i - 1];
      /** @type {string} */ var tooltip = '<b>' + title + '</b><br>' +
                                          data_[0][1] + ': ' + value;
      /** @type {number} */ var fontSize = Math.round(
          (value - minValue) * 150 / maxValue) + 100;

      content += '<span ' +
                 'tooltip="' + tooltip + '"' +
                 'style="' +
                 'font-size:' + fontSize + '%;' +
                 'padding: 0 3px;' +
                 'font-family:' + options_['font']['family'] + ';' +
                 'color: ' + color +
                 '">' + title + ' </span>';
    }

    content += '</div>';

    self_.drawContent(content, width, height);
    setTimeout(initEvents_, 100);
  }


  function shuffle_(array) {
    /** @type {!Array} */ var head = array.shift();
    /** @type {number} */ var i = array.length;
    while (i) {
      /** @type {number} */ var randIndex = Math.floor(Math.random() * i--);
      /** @type {number} */ var tmp = array[i];
      array[i] = array[randIndex];
      array[randIndex] = tmp;
    }
    array.unshift(head);
    return array;
  }

  /**
   * Initializes events handlers.
   * @private
   */
  function initEvents_() {
    /** @type {NodeList} */
    var nodes = dom.getElementsByTagName(self_.container, 'SPAN');
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
      self_.tooltip.show(e);
    };

    events[dom.events.TYPE.MOUSEOVER] = function(e) {
      node.style[attr] = 1;
      self_.tooltip.show(e);
    };

    events[dom.events.TYPE.MOUSEOUT] = function(e) {
      node.style[attr] = options_['opacity'];
      self_.tooltip.hide(e);
    };

    for (/** @type {string} */ var key in events) {
      dom.events.addEventListener(node, key, events[key]);
    }

    events[dom.events.TYPE.MOUSEOUT](null);
  }

  /**
   * The reference to current class instance. Used in private methods.
   * @type {!charts.TagChart}
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

};

// Export for closure compiler.
charts['PieChart'] = charts.PieChart;
