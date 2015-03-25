
/**
 * @fileoverview Calendar localization utils.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Constructor of Calendar.
 * @constructor
 */
locale.Calendar = function() {

  /**
   * Gets locale week names.
   * @return {!Array.<string>} Returns week names.
   */
  this.getWeekNames = function() {
    return getData_('days');
  };

  /**
   * Gets locale month names.
   * @return {!Array.<string>} Returns month names.
   */
  this.getMonthNames = function() {
    return getData_('months');
  };

  /**
   * Gets locale month name.
   * @param {Date=} opt_date Optional date object, defaults is current date.
   * @return {string} Returns month name.
   * @see locale.Calendar#getMonthNames
   */
  this.getMonthName = function(opt_date) {
    opt_date = opt_date || new Date;
    return self_.getMonthNames()[opt_date.getMonth()];
  };

  /**
   * Gets month number by month name.
   * @param {string} name The month name.
   * @return {number} Returns month number.
   * @see locale.Calendar#getMonthNames
   */
  this.getMonthByName = function(name) {
    /** @type {!Array.<string>} */ var monthes = self_.getMonthNames();
    for (/** @type {number} */ var i = 0; i < monthes.length; i++) {
      if (name.substr(0, 3).toLowerCase() ==
          monthes[i].substr(0, 3).toLowerCase()) {
        return i;
      }
    }
    return -1;
  };

  /**
   * Gets locale data by key.
   * @param {string} key Data key.
   * @return {!Array.<string>} Returns locale data.
   * @private
   */
  function getData_(key) {
    return (data_[locale_.getLanguage()] ||
            data_[util.Locale.ENGLISH.getLanguage()])[key];
  }

  /**
   * The reference to current class instance. Used in private methods.
   * @type {!locale.Calendar}
   * @private
   */
  var self_ = this;

  /**
   * @type {!util.Locale}
   * @private
   */
  var locale_ = util.Locale.getDefault();

  /**
   * @type {!Object.<string, Object>}
   * @private
   */
  var data_ = {
    'en': {
      'days': ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      'months': ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November',
                 'December']
    },
    'de': {
      'days': ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
      'months': ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                 'Juli', 'August', 'September', 'Oktober', 'November',
                 'Dezember']
    },
    'ru': {
      'days': ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      'months': ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь',
                 'Декабрь']
    }
  };
};
