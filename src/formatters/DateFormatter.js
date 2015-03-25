
/**
 * @fileoverview Date format library.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Constructor of DateFormatter.
 * @requires locale.Calendar
 * @constructor
 */
formatters.DateFormatter = function() {

  /**
   * Formats given <code>date</code> according to given <code>format</code>.
   * @param {Date} date The Date to be formatted.
   * @param {string} format The date format.
   * @return {string} The formatted date as string.
   * @example
   * <b>var</b> formatter = <b>new</b> formatters.DateFormatter();
   * formatter.format(<b>new</b> Date(), 'YYYY-MM-dd');
   * formatter.format(<b>new</b> Date(), 'YYYY-MM-dd hh:mm');
   * formatter.format(<b>new</b> Date(), 'dd MMM, YYYY');
   */
  this.format = function(date, format) {
    /** @type {string} */ var month = calendar_.getMonthName(date);
    /** @type {!Array.<string, number>} */ var tokens = [
      'YYYY', date.getFullYear(),
      'YY', (date.getFullYear() + '').substr(2),
      'MMMM', month,
      'MMM', month.substr(0, 3),
      'MM', ('0' + (date.getMonth() + 1)).slice(-2),
      'dd', ('0' + date.getDate()).slice(-2),
      'hh', ('0' + date.getHours()).slice(-2),
      'mm', ('0' + date.getMinutes()).slice(-2),
      'ss', ('0' + date.getSeconds()).slice(-2)
    ];
    /** @type {number} */ var length = tokens.length;
    for (/** @type {number} */ var i = 0; i < length;) {
      format = format.replace(tokens[i++], tokens[i++]);
    }
    return format;
  };

  /**
   * Parses given date <code>str</code>  according to given <code>format</code>.
   * @param {string} str The date string to be parsed.
   * @param {string} format The date format.
   * @return {Date} The parsed date.
   * @example
   * <b>var</b> formatter = <b>new</b> formatters.DateFormatter();
   * formatter.parse('2013-01-31', 'YYYY-MM-dd');
   * formatter.parse('2013-01-31 20:30', 'YYYY-MM-dd hh:mm');
   * formatter.parse('03 Jan, 2013', 'dd MMM, YYYY');
   */
  this.parse = function(str, format) {
    /** @type {!RegExp} */ var re = /[\/\s,\.\:\-]/;
    /** @type {!Array.<string>} */ var dateParts = str.split(re);
    /** @type {!Array.<string>} */ var formatParts = format.split(re);
    /** @type {!Object.<string, string>} */ var map = {};
    /** @type {number} */ var i;
    for (i = 0; i < Math.min(dateParts.length, formatParts.length); i++) {
      /** @type {string} */ var key = formatParts[i];
      if (key) map[key] = dateParts[i];
    }

    /** @type {number} */ var year = +(map['YYYY'] || '20' + map['YY']);
    /** @type {number} */ var month = +(map['MM'] || 0) - 1;
    if (map['MMMM'] || map['MMM']) {
      month = calendar_.getMonthByName(map['MMMM'] || map['MMM']);
    }
    return month >= 0 && +map['dd'] < 32 ?
        new Date(year, month, +map['dd'], +map['hh'] || 0,
               +map['mm'] || 0, +map['ss'] || 0) : dom.NULL;
  };

  /**
   * @type {!locale.Calendar}
   * @private
   */
  var calendar_ = new locale.Calendar;
};


/**
 * Formats given <code>date</code> according to given <code>format</code>.
 * @param {Date} date The Date to be formatted.
 * @param {string} format The date format.
 * @return {string} The formatted date as string.
 * @static
 * @example
 * formatters.DateFormatter.format(<b>new</b> Date(), 'YYYY-MM-dd');
 * formatters.DateFormatter.format(<b>new</b> Date(), 'YYYY-MM-dd hh:mm');
 * formatters.DateFormatter.format(<b>new</b> Date(), 'dd MMM, YYYY');
 */
formatters.DateFormatter.format = function(date, format) {
  if (!formatters.DateFormatter.formatter_) {
    formatters.DateFormatter.formatter_ = new formatters.DateFormatter;
  }
  return formatters.DateFormatter.formatter_.format(date, format);
};


/**
 * Parses given date <code>str</code>  according to given <code>format</code>.
 * @param {string} str The date string to be parsed.
 * @param {string} format The date format.
 * @return {Date} The parsed date.
 * @static
 * @example
 * <b>var</b> formatter = <b>new</b> formatters.DateFormatter();
 * formatter.parse('2013-01-31', 'YYYY-MM-dd');
 * formatter.parse('2013-01-31 20:30', 'YYYY-MM-dd hh:mm');
 * formatter.parse('03 Jan, 2013', 'dd MMM, YYYY');
 */
formatters.DateFormatter.parse = function(str, format) {
  if (!formatters.DateFormatter.formatter_) {
    formatters.DateFormatter.formatter_ = new formatters.DateFormatter;
  }
  return formatters.DateFormatter.formatter_.parse(str, format);
};
