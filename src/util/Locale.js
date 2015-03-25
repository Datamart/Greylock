
/**
 * @fileoverview Simple implementation of </code>java.util.Locale</code>.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 * @link http://docs.oracle.com/javase/1.5.0/docs/api/java/util/Locale.html
 */



/**
 * Construct a locale from language, country and variant.
 * @param {string} language The lowercase two-letter ISO-639 code.
 * @param {string=} opt_country The uppercase two-letter ISO-3166 code.
 * @param {string=} opt_variant The vendor and browser specific code.
 * @constructor
 * @link http://docs.oracle.com/javase/1.5.0/docs/api/java/util/Locale.html
 */
util.Locale = function(language, opt_country, opt_variant) {

  /**
   * Returns the language code for this locale, which will either be the empty
   * string or a lowercase ISO-639 code.
   * @return {string} Returns the language code.
   */
  this.getLanguage = function() {
    return language || '';
  };

  /**
   * Returns the country/region code for this locale, which will either be the
   * empty string or an uppercase ISO-3166 2-letter code.
   * @return {string} Returns the country code.
   */
  this.getCountry = function() {
    return opt_country || '';
  };

  /**
   * Returns the variant code for this locale.
   * @return {string} Returns the variant code for this locale.
   */
  this.getVariant = function() {
    return opt_variant || '';
  };
};


/**
 * Gets the current value of the default locale.
 * @return {!util.Locale} Returns the default locale.
 * @static
 * @see docs.oracle.com/javase/1.5.0/docs/api/java/util/Locale.html#getDefault()
 */
util.Locale.getDefault = function() {
  /** @type {string} */
  var language = navigator['userLanguage'] || navigator['language'];
  if (language) {
    return new util.Locale(language.substr(0, 2).toLowerCase());
  }
  return util.Locale.ENGLISH;
};


/**
 * Useful constant for language.
 * @type {!util.Locale}
 * @static
 * @see docs.oracle.com/javase/1.5.0/docs/api/java/util/Locale.html#ENGLISH
 */
util.Locale.ENGLISH = new util.Locale('en');
