
/**
 * @fileoverview Number format library.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Constructor of NumberFormatter.
 * @param {Object.<string, *>=} opt_options Formatter options.
 * @constructor
 * @example
 * options: {
 *   'decimal': '.', 'grouping': ',', 'fraction': 0, 'prefix': '', 'suffix': ''
 * }
 */
formatters.NumberFormatter = function(opt_options) {

  /**
   * Formats given number according to given options.
   * @param {number} number The Number to be formatted.
   * @return {string} The formatted number string.
   * @example
   * <b>var</b> formatter = <b>new</b> formatters.NumberFormatter();
   * formatter.format(100);   // 100
   * formatter.format(1000);  // 1,000
   * formatter.format(1500);  // 1,500
   * formatter.format(10000); // 10,000
   * formatter.format(1e6);   // 1,000,000
   * <b>var</b> options = {'prefix': '$'};
   * <b>var</b> formatter = <b>new</b> formatters.NumberFormatter(options);
   * formatter.format(100);   // $100
   * formatter.format(1e6);   // $1,000,000
   */
  this.format = function(number) {
    /** @type {!Object.<string, *>} */ var options = getOptions_();

    /** @type {Array.<string>} */
    var result = (options['fraction'] ? number.toFixed(options['fraction']) :
                                        '' + number).split('.');

    return options['prefix'] +
        result[0].replace(/\B(?=(\d{3})+(?!\d))/g,
        /** @type {string} */ (options['grouping'])) +
        (result[1] ? options['decimal'] + result[1] : '') +
        options['suffix'];
  };

  /**
   * Rounds given number.
   * @param {number} number The Number to be rounded.
   * @return {string} The rounded number string.
   * @example
   * <b>var</b> formatter = <b>new</b> formatters.NumberFormatter();
   * formatter.round(100);   // 100
   * formatter.round(1000);  // 1k
   * formatter.round(1500);  // 1.5k
   * formatter.round(10000); // 10k
   * formatter.round(1e6);   // 10m
   * <b>var</b> options = {'prefix': '$'};
   * <b>var</b> formatter = <b>new</b> formatters.NumberFormatter(options);
   * formatter.round(100);   // $100
   * formatter.round(1e6);   // $10m
   */
  this.round = function(number) {
    // parseInt(number, 10) == ~~number
    /** @type {!Object.<string, *>} */ var options = getOptions_();
    /** @type {number} */
    var base = (~~number + '').length - (number < 0 ? 2 : 1);
    /** @type {number} */ var divider = 1;
    /** @type {number} */ var length = ~~(base / 3) * 3;
    for (/** @type {number} */ var i = 0; i < length; i++)
      divider *= 10;

    /** @type {number} */ var delta = number / divider;
    /** @type {number} */ var a = ~~delta;
    /** @type {string} */ var b = delta.toFixed(2 - base % 3);

    /** @type {string} */
    var result = (a == b ? a : b) + ['', 'k', 'm', 'g', 't'][~~(base / 3)];
    return options['prefix'] + result + options['suffix'];
  };

  /**
   * @return {!Object.<string, *>} Returns formatter options.
   * @private
   */
  function getOptions_() {
    opt_options = opt_options || {};
    for (/** @type {string} */ var key in defaults_) {
      if (!(key in opt_options)) {
        opt_options[key] = defaults_[key];
      }
    }
    return opt_options;
  }

  /**
   * Default formatting options.
   * @dict
   * @type {!Object.<string, *>}
   * @private
   */
  var defaults_ = {
    'decimal': '.',
    'grouping': ',',
    'fraction': 0,
    'prefix': '',
    'suffix': ''
  };
};
