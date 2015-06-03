
/**
 * @fileoverview Simple geo chart implementation.
 * @version 1.0.1
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * GeoChart constructor.
 * @param {string|Element} container The HTML container.
 * @constructor
 * @extends {charts.BaseChart} charts.BaseChart
 * @requires charts.GeoLocations
 * @requires formatters.NumberFormatter
 * @example
 * <b>var</b> chart = <b>new</b> charts.GeoChart('container_id');
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
 *        style="width: 560px; height: 365px;"></div>
 * </div>
 * <script src="http://datamart.github.io/Greylock/greylock.js"></script>
 * <script>
 *   var chart = new charts.GeoChart('chart-container');
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
charts.GeoChart = function(container) {
  charts.BaseChart.apply(this, arguments);

  /**
   * Country name mapping. (e.g. usa: United States).
   * @enum {string}
   */
  var COUNTRY_MAPPING = {
    'usa': 'United States',
    'russia': 'Russian Federation',
    'drc': 'Democratic Republic of the Congo'
  };

  /**
   * Original svg viewport width: 950px height: 620px.
   * Used for scaling map to different sizes.
   * @enum {number}
   */
  var VIEWPORT = {
    width: 950,
    height: 620
  };

  /**
   * Draws the chart based on <code>data</code> and <code>opt_options</code>.
   * @param {!Array.<Array>} data A chart data.
   * @param {Object=} opt_options A optional chart's configuration options.
   * @override
   */
  this.draw = function(data, opt_options) {
    options_ = getOptions_(opt_options);
    self_.tooltip.setOptions(options_);
    /** @type {number} */ var width = self_.container.offsetWidth || 200;
    /** @type {number} */ var height = self_.container.offsetHeight || width;

    /** @type {string} */ var content = '';
    /** @type {number} */
    var scale = Math.min(width / VIEWPORT.width, height / VIEWPORT.height);

    /** @type {!Object.<string, Object>} */ var map = getColorMap_(data);
    /** @type {!Array.<Array>} */ var locations = charts.GeoLocations.DATA;
    for (/** @type {number} */ var i = 0; i < locations.length; i++) {
      /** @type {string} */ var country = getCountryKey_(locations[i][0]);
      /** @type {string} */ var path = locations[i][1];
      /** @type {number} */ var value = country in map ? map[country].value : 0;
      /** @type {string} */ var color = country in map ? map[country].color :
          /** @type {string} */ (options_['fillcolor']);
      /** @type {string} */
      var column = country in map ? map[country].column : '';
      /** @type {string} */
      var tooltip = '<b>' + getCountryName_(country) + '</b>';
      if (value) {
        tooltip += '<br>' + column + ': ';
        tooltip += 'number' == typeof value ? formatter_.format(value) : value;
      }
      content += (charts.IS_SVG_SUPPORTED ? getSvgContent_ : getVmlContent_)(
          path, tooltip, color, scale, country);
    }

    self_.drawContent(content, width, height);
    initEvents_();
  };

  // Export for closure compiler.
  this['draw'] = this.draw;

  /**
   * @param {Array} data The data.
   * @return {!Object.<string, Object>} Returns data colors.
   * @private
   */
  function getColorMap_(data) {
    /** @type {!Object.<string, Object>} */ var colors = {};
    /** @type {Array.<number>} */ var range = self_.getDataRange(data, 1);
    /** @type {!Array.<Array>} */ var rows = self_.getDataRows(data);
    /** @type {number} */ var min = range[0];
    /** @type {number} */ var max = range[1];
    /** @type {string} */ var column = data[0][1];
    for (/** @type {number} */ var i = 0; i < rows.length; i++) {
      /** @type {string} */
      var country = getCountryKey_(rows[i][0]).toLowerCase();
      /** @type {number} */ var value = rows[i][1];
      /** @type {number} */
      var weight = (+value - min) / (max - min) * 0.8 + 0.2;
      weight = weight ? weight : 1 * 0.8;
      /** @type {string} */ var color = 'rgb(' +
          getColor_(options_['rgb']['red'], weight) + ',' +
          getColor_(options_['rgb']['green'], weight) + ',' +
          getColor_(options_['rgb']['blue'], weight) + ')';
      colors[country] = {color: color, value: value, column: column};
    }
    return colors;
  }

  /**
   * @param {number} component Color component: red, green or blue.
   * @param {number} weight Color weight.
   * @return {number} Returns color component.
   * @private
   */
  function getColor_(component, weight) {
    return parseInt(255 - (255 - component) * weight, 10);
  }

  /**
   * @param {string} country The country name.
   * @return {string} Returns country key.
   * @private
   */
  function getCountryKey_(country) {
    for (var key in COUNTRY_MAPPING)
      if (COUNTRY_MAPPING[key].toLowerCase() == country.toLowerCase())
        return key;
      return country;
  }

  /**
   * @param {string} country The country key.
   * @return {string} Returns country name.
   * @private
   */
  function getCountryName_(country) {
    // Exceptional cases:
    if (country in COUNTRY_MAPPING)
      return COUNTRY_MAPPING[country];

    /** @type {Array.<string>} */
    var words = country.replace(/\s+/g, '_').split('_');
    for (var i = 0; i < words.length; i++) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].substr(1);
    }
    return words.join(' ');
  }

  /**
   * @param {string} path The path.
   * @param {string} tooltip The tooltip.
   * @param {string} color The color.
   * @param {number} scale The scale.
   * @param {string} country The country key.
   * @return {string} Returns SVG markup string.
   * @private
   */
  function getSvgContent_(path, tooltip, color, scale, country) {
    return '<path transform="scale(' + scale + ')" ' +
           'tooltip="' + tooltip + '" d="' + path + '"' +
           'fill="' + color + '" ' +
           'id="' + country + '" ' +
           'stroke="' + options_['stroke']['color'] + '"/>';
  }

  /**
   * @param {string} path The path.
   * @param {string} tooltip The tooltip.
   * @param {string} color The color.
   * @param {number} scale The scale.
   * @param {string} country The country key.
   * @return {string} Returns VML markup string.
   * @private
   */
  function getVmlContent_(path, tooltip, color, scale, country) {
    //path = getVmlPath_(path);
    path = graphics.VmlHelper.getVmlPath(path);

    /** @type {number} */ var width = self_.container.offsetWidth || 200;
    /** @type {number} */ var height = self_.container.offsetHeight || width;

    /** @type {Array.<number>} */
    var coordsize = [width / scale, height / scale];

    /** @type {string} */
    var vml = '<v:shape fillcolor="' + color + '" ' +
        'strokecolor="' + options_['stroke']['color'] + '" ' +
        'coordorigin="0 0" ' +
        'coordsize="' + coordsize + '" ' +
        'style="width:100%;height:100%" ' +
        'id="' + country + '" ' +
        'tooltip="' + tooltip + '">' +
        '<v:path v="' + path + '"/>' +
        '</v:shape>';
    return vml;
  }

  /**
   * Converts SVG path to VML path.
   * @param {string} svgPath The SVG path.
   * @return {string} Returns VML path.
   * @deprecated Use graphics.VmlHelper.getVmlPath instead.
   * @private
   */
  function getVmlPath_(svgPath) {
    // TODO (alex): Calculate VML path.
    // M387.56,224.4l-0.54,1.37l0.81,0.82l2.17-1.37L387.56,224.4L387.56,224.4z
    svgPath = svgPath.replace(/(\d*)((\.*\d*)(e ?-?\d*))/g, '$1');
    /** @type {Array.<string>} */
    var commands = svgPath.match(/([MLHVCSQTAZ].*?)(?=[MLHVCSQTAZ]|$)/gi);
    /** @type {string} */ var vmlPath = '';
    /** @type {number} */ var cursorX = 0;
    /** @type {number} */ var cursorY = 0;
    for (/** @type {number} */ var i = 0; i < commands.length; i++) {
      /** @type {string} */ var command = commands[i].substring(0, 1);
      /** @type {!Array} */
      var params = commands[i].substring(1, commands[i].length).split(/[, ]/);
      for (/** @type {number} */ var j = 0; j < params.length; j++) {
        //params[j] = Math.round(parseFloat(params[j]));
      }
      /** @type {string} */ var args = params.join();
      /** @type {!Array} */ var coords = args.split(/[, ]+/);
      switch (command) {
        case 'M': // moveTo absolute
          command = 'm';
          cursorX = parseInt(coords[0], 10);
          cursorY = parseInt(coords[1], 10);
          break;
        case 'm': // moveTo relative
          command = 't';
          coords[0] = parseInt(coords[0], 10) + parseInt(cursorX, 10);
          coords[1] = parseInt(coords[1], 10) + parseInt(cursorY, 10);
          cursorX = parseInt(coords[0], 10);
          cursorY = parseInt(coords[1], 10);
          //args = coords[0] + ',' + coords[1] + ' ';
          break;
        case 'A': // arc absolute:
          // SVG: rx ry x-axis-rotation large-arc-flag sweep-flag x y
          // VML: center (x,y) size(w,h) start-angle, end-angle
          command = 'ae';
          coords[0] = parseInt(coords[0], 10);
          coords[1] = parseInt(coords[1], 10);

          coords[2] = parseInt(coords[2], 10);
          coords[3] = parseInt(coords[3], 10);

          coords[4] = parseInt(coords[4], 10);
          coords[5] = parseInt(coords[5], 10);
          args = coords[4] + ' ' + coords[5] + ' ' + (coords[2] * 2) + ' ' +
                 (coords[3] * 2) + ' 0 360';
          break;
        case 'L': // lineto absolute
        case 'H': // horizontal lineto absolute
          command = 'l';
          cursorX = parseInt(coords[0], 10);
          cursorY = parseInt(coords[1], 10);
          break;
        case 'l': // lineto relative
          command = 'r';
          //window.console && console.log(coords);
          coords[0] = parseInt(coords[0], 10) + parseInt(cursorX, 10);
          coords[1] = parseInt(coords[1], 10) + parseInt(cursorY, 10);
          cursorX = parseInt(coords[0], 10);
          cursorY = parseInt(coords[1], 10);
          // args = coords[0] + ',' + coords[1] + ' ';
          break;
        case 'h': // horizontal lineto relative
          command = 'r';
          //window.console && console.log(coords);
          coords[0] = parseInt(coords[0], 10) + parseInt(cursorX, 10);
          coords[1] = cursorY;
          cursorX = parseInt(coords[0], 10);
          cursorY = parseInt(coords[1], 10);
          args = coords[0] + ',' + coords[1] + ' ';
          break;
        case 'c':
          command = 'v';
          break;
        case 'z':
          command = 'xe';
          args = '';
        default:
          command = command.toLowerCase();
      }
      vmlPath += command + args;
    }
    return vmlPath;
  }

  /**
   * Initializes events handlers.
   * @private
   */
  function initEvents_() {
    /** @type {Array.<Element>} */ var paths = null;
    /** @type {!Object.<string, number>} */ var tags = {'path': 0, 'shape': 0};

    dom.events.addEventListener(
        self_.container, dom.events.TYPE.MOUSEOUT, function(e) {
          if (paths) {
            for (/** @type {number} */ var i = 0; i < paths.length; i++) {
              if (charts.IS_SVG_SUPPORTED) {
                //paths[i].setAttribute('stroke-width',
                //                  options_['stroke']['width'] + 'px');
                paths[i].setAttribute('stroke',
                                  options_['stroke']['color']);
              } else {
                //paths[i]['strokeweight'] = options_['stroke']['width'] + 'px';
                paths[i]['strokecolor'] = options_['stroke']['color'];
              }
            }
            self_.tooltip.hide(e);
            paths = null;
          }
        });

    dom.events.addEventListener(
        self_.container, dom.events.TYPE.MOUSEMOVE, function(e) {
          dom.events.dispatchEvent(self_.container, dom.events.TYPE.MOUSEOUT);
          e = e || window.event;
          /** @type {Element} */
          var target = e.target || e.srcElement || e.toElement;
          if (target && target.tagName in tags) {
            /** @type {NodeList} */
            var nodes = dom.getElementsByTagName(target.parentNode,
                                                 target.tagName);
            paths = [];
            for (/** @type {number} */ var i = 0; i < nodes.length; i++) {
              /** @type {Element} */ var node = nodes[i];
              if (node.id == target.id) {
                paths.push(node);
              }
            }
            for (i = 0; i < paths.length; i++) {
              if (charts.IS_SVG_SUPPORTED) {
                //paths[i].setAttribute('stroke-width', '3px');
                paths[i].setAttribute('stroke', '#666');
              } else {
                //paths[i]['strokeweight'] = '3px';
                paths[i]['strokecolor'] = '#666';
              }
            }
            self_.tooltip.show(e);
          }
        });
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
    opt_options['stroke'] = opt_options['stroke'] || {};
    opt_options['stroke']['color'] = opt_options['stroke']['color'] || '#ddd';
    opt_options['stroke']['width'] = opt_options['stroke']['width'] || 1;
    opt_options['fillcolor'] = opt_options['fillcolor'] || '#f5f5f5';
    opt_options['rgb'] = opt_options['rgb'] || {};
    opt_options['rgb']['red'] = 'red' in opt_options['rgb'] ?
        opt_options['rgb']['red'] : 10;
    opt_options['rgb']['green'] = 'green' in opt_options['rgb'] ?
        opt_options['rgb']['green'] : 170;
    opt_options['rgb']['blue'] = 'blue' in opt_options['rgb'] ?
        opt_options['rgb']['blue'] : 10;
    return self_.getOptions(opt_options);
  }

  /**
   * The reference to current class instance. Used in private methods.
   * @type {!charts.GeoChart}
   * @private
   */
  var self_ = this;

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
charts['GeoChart'] = charts.GeoChart;
