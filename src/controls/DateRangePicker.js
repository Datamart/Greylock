
/**
 * @fileoverview DateRangePicker control.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Constructor of DateRangePicker.
 * @param {Object=} opt_options Optional options.
 * @extends {controls.DatePicker} controls.DatePicker
 * @constructor
 */
controls.DateRangePicker = function(opt_options) {
  opt_options = opt_options || {};
  opt_options['multiple'] = true;
  opt_options['separator'] = opt_options['separator'] || ' - ';
  opt_options['timeout'] = opt_options['timeout'] || 300;

  controls.DatePicker.apply(this, [opt_options]);

  /** @inheritDoc */
  this.clickHandler = function() {
    /** @type {controls.Calendar} */ var calendar = self_.getCalendar();
    /** @type {Array.<Date>} */ var dates = calendar.getDates();
    /** @type {number} */ var length = dates.length;
    if (length > 1) {
      /** @type {string} */ var format = self_.getFormat();
      /** @type {Date} */ var start = dates[0];
      /** @type {Date} */ var end = dates[length - 1];
      self_.setValue(
          formatters.DateFormatter.format(start, format) +
          opt_options['separator'] +
          formatters.DateFormatter.format(end, format));

      setTimeout(self_.hide, opt_options['timeout']);
    }
  };

  /** @inheritDoc */
  this.getDates = function() {
    /** @type {!Array.<Date>} */ var range = [];
    /** @type {Date} */ var start = new Date;
    /** @type {Date} */ var end = new Date;

    /** @type {Array.<string>} */
    var value = self_.getValue().split(opt_options['separator']);
    /** @type {number} */ var length = value.length;
    if (length == 2) {
      /** @type {string} */ var format = self_.getFormat();
      start = formatters.DateFormatter.parse(value[0], format);
      end = formatters.DateFormatter.parse(value[length - 1], format);
    }

    while (start <= end) {
      range.push(new Date(start));
      start.setDate(start.getDate() + 1);
      //start = new Date(+start + 864e5);
    }
    return range;
  };

  /**
   * The reference to current class instance. Used in private methods.
   * @type {!controls.DateRangePicker}
   * @private
   */
  var self_ = this;

  /**
   * Indicates first click, selecting start date.
   * @type {boolean}
   * @private
   */
  var first_ = true;
};


/**
 * @param {Node|Element} element The related element.
 * @static
 */
controls.DateRangePicker.show = function(element) {
  if (!element.picker_) {
    element.picker_ = new controls.DateRangePicker;
  }
  element.picker_.show(element);
};

// Export for closure compiler.
controls.DateRangePicker['show'] = controls.DateRangePicker.show;

// Export for closure compiler.
controls['DateRangePicker'] = controls.DateRangePicker;
