
/**
 * @fileoverview A base class of all visualization charts.
 * @version 1.0.1
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * A base class of all visualization charts.
 * @param {string|Element} container The HTML container.
 * @constructor
 * @class A base class of all visualization charts.
 * @requires charts.Tooltip
 * @requires util.Object
 */
charts.BaseChart = function(container) {

  /**
   * Defaults chart options.
   * @dict
   * @see charts.BaseChart#getOptions
   * @example <code>{
   *   'font': {'family': 'Arial', 'size': 13},
   *   'opacity': 0.8,
   *   'colors': [list of colors]
   * }</code>
   */
  this.defaults = {
    'font': {'family': 'Arial', 'size': 13},
    'opacity': 0.7,
    'colors': charts.BaseChart.DEFAULT_COLORS
  };

  /**
   * The reference to HTML chart container.
   * @type {Element}
   */
  this.container = typeof container == 'string' ?
      dom.getElementById(container) : container;

  /**
   * Instance of <code>charts.Tooltip</code>.
   * @type {!charts.Tooltip}
   * @see charts.Tooltip
   * @protected
   */
  this.tooltip = new charts.Tooltip;

  /**
   * Draws the chart based on <code>data</code> and <code>opt_options</code>.
   * Abstract method, should be overwritten in nested classes.
   * All overwritten methods should be exported for closure compiler.
   * @param {!Array.<Array>} data A chart data.
   * @param {Object=} opt_options A optional chart's configuration options.
   */
  this.draw = function(data, opt_options) {};

  /**
   * Gets chart's options merged with defaults chart's options.
   * @param {Object.<string, *>=} opt_options Options map.
   * @return {!Object.<string, *>} A map of name/value pairs.
   * @see charts.BaseChart#defaults
   */
  this.getOptions = function(opt_options) {
    return util.Object.extend(self_.defaults, opt_options || {});
  };

  /**
   * Extracts columns from <code>data</code>.
   * @param {Array.<Array>} data The chart data.
   * @return {!Array.<string>} Returns data columns.
   */
  this.getDataColumns = function(data) {
    // Return copy of first data row.
    return /** @type {!Array.<string>} */ (data[0].slice());
  };

  /**
   * Extracts rows from <code>data</code>.
   * @param {Array.<Array>} data The chart data.
   * @return {!Array.<Array>} Returns cloned <code>data</code> rows.
   */
  this.getDataRows = function(data) {
    // Return copy of data rows except first row.
    return data.slice(1);
  };

  /**
   * Gets data range with min and max values.
   * @param {Array.<Array>} data The chart data.
   * @param {number=} opt_column Optional columns index starting from.
   * @return {!Array.<number>} Returns range as <code>[min, max]</code> array.
   */
  this.getDataRange = function(data, opt_column) {
    if (!data.range_) {
      opt_column = opt_column || 0;
      /** @type {!Array.<Array>} */ var rows = self_.getDataRows(data);
      /** @type {number} */ var maxValue = 0;
      /** @type {?number} */ var minValue = null;
      for (/** @type {number} */ var i = 0; i < rows.length;) {
        /** @type {Array.<number>} */ var row = rows[i++];
        for (/** @type {number} */ var j = opt_column; j < row.length; j++) {
          maxValue = Math.max(maxValue, row[j]);
          if (minValue == null) minValue = maxValue;
          minValue = Math.min(minValue, row[j]);
        }
      }
      data.range_ = [minValue, maxValue];
    }
    return data.range_;
  };

  /**
   * Gets max value.
   * @param {Array.<Array>} data The chart data.
   * @return {number} Returns max value.
   */
  this.getMaxValue = function(data) {
    return self_.getDataRange(data)[1];
  };

  /**
   * Gets min value.
   * @param {Array.<Array>} data The chart data.
   * @return {number} Returns min value.
   */
  this.getMinValue = function(data) {
    return self_.getDataRange(data)[0];
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

    self_.container.innerHTML += (charts.IS_SVG_SUPPORTED ?
        wrapSvgContent_ : wrapVmlContent_)(content, opt_width, opt_height);
  };

  /**
   * Wraps SVG markup content into <code>&lt;svg&gt;</code> container.
   * @param {string} content SVG markup content.
   * @param {number} width The chart width.
   * @param {number} height The chart height.
   * @return {string} Returns wrapped SVG markup.
   * @private
   */
  function wrapSvgContent_(content, width, height) {
    // style="shape-rendering:geometricPrecision;
    //        text-rendering:geometricPrecision;
    //        image-rendering:optimizeQuality;
    //        fill-rule:evenodd;
    //        clip-rule:evenodd"
    return '<svg width="' + width + '" height="' + height + '" version="1.0" ' +
           'xmlns="http://www.w3.org/2000/svg" ' +
           'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
           'style="position:absolute">' +
           content + '</svg>';
  }

  /**
   * Wraps VML markup content into <code>&lt;vml:group&gt;</code> container.
   * @param {string} content VML markup content.
   * @param {number} width The chart width.
   * @param {number} height The chart height.
   * @return {string} Returns wrapped VML markup.
   * @private
   */
  function wrapVmlContent_(content, width, height) {
    return '<v:group coordorigin="0 0" ' +
           'coordsize="' + width + ' ' + height + '" ' +
           'style="position:absolute;left:0;top:0;' +
           'width:' + width + 'px;height:' + height + 'px">' +
           content + '</v:group>';
  }

  /**
   * Initializes default behaviors.
   * @private
   */
  function init_() {

    if (!charts.IS_SVG_SUPPORTED) {
      try {
        dom.document['namespaces']['add'](
            'v', 'urn:schemas-microsoft-com:vml', '#default#VML');
      } catch (e) {
        //window.console && console.log(['vml:namespaces.add', e.message || e]);
      }

      try {
        /** @type {Object} */ var sheet = dom.document['createStyleSheet']();
        sheet['addRule']('v\\:group',
                         'behavior:url(#default#VML);antialias:true;' +
                         'display:inline-block');
      } catch (e) {
        //window.console && console.log(['vml:sheet.addRule', e.message || e]);
      }
    }
  }

  /**
   * The reference to current class instance. Used in private methods.
   * @type {!charts.BaseChart}
   * @private
   */
  var self_ = this;

  init_();
};


/**
 * List of default colors.
 * @type {!Array.<string>}
 * @static
 */
charts.BaseChart.DEFAULT_COLORS = [
  '#3366BB', '#DD3311', '#FF9911', '#119911', '#991199',
  '#0099CC', '#DD4488', '#66AA33', '#BB2222', '#336699',
  '#9955AA', '#11AA99', '#AABB11', '#6633DD', '#EE7700',
  '#880000', '#661166', '#339966', '#5577AA', '#3333AA',
  '#BB7722', '#11DD22', '#BB1188', '#FF3399', '#995533',
  '#AACC11', '#227788', '#668811', '#BBAA11', '#005522',
  '#773311', '#4EDB05', '#377D18', '#AD9E88', '#4C49E3',
  '#86D0DD', '#5613EA', '#29F847', '#828295', '#B7F439',
  '#224256', '#490A7F', '#622A17', '#E188A1', '#F65A2D',
  '#87F586', '#DF56E4', '#F3E815', '#C528D6', '#32BDC0',
  '#91F51C', '#A75590', '#556F7C', '#520036', '#64B6AA',
  '#825B4A', '#63B75A', '#DC8BF7', '#811D02', '#FB1D45',
  '#76856A', '#F240BB', '#D53C9B', '#67AEC8', '#01786A',
  '#A08A65', '#715E3F', '#92B88A', '#3A5D6D', '#B8D9D9',
  '#622C1B', '#1F566F', '#F221EE', '#04808D', '#7A787A',
  '#F48A8A', '#A60FFA', '#5FDF71', '#F4D11E', '#EDA971',
  '#3F0AF2', '#E84203', '#2344FA', '#98CFB5', '#E0F068',
  '#83D7E3', '#1500EA', '#99C760', '#21E636', '#241BB8',
  '#C44FF5', '#3499BF', '#CFC58F', '#91A739', '#7222B0'];
