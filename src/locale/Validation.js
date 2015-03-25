
/**
 * @fileoverview Validation localization utils.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Constructor of Validation.
 * @constructor
 */
locale.Validation = function() {
  /**
   * Gets localized message by key.
   * @param {string} key The message key.
   * @return {string} Returns localized message.
   */
  this.getMessage = function(key) {
    return (data_[locale_.getLanguage()] ||
            data_[util.Locale.ENGLISH.getLanguage()])[key];
  };

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
      'required': 'Please fill out this field.',
      'pattern': 'The pattern is mismatched.',
      'email': 'Please enter a valid email address.',
      'url': 'Please enter a valid URL address.',
      'phone': 'Please enter a valid phone number.',
      'number': 'Please enter a valid number.'
    },
    'ru': {
      'required': 'Пожалуйста, заполните это поле.',
      'pattern': 'The pattern is mismatched.',
      'email': 'Пожалуйста, введите действующий адрес электронной почты.',
      'url': 'Пожалуйста, введите действительный адрес URL.',
      'phone': 'Пожалуйста, введите действительный номер телефона.',
      'number': 'Please enter a valid number.'
    }
  };
};
