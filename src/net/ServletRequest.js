
/**
 * @fileoverview Simple implementation of javax.servlet.ServletRequest.
 * @see http://docs.oracle.com/javaee/5/api/javax/servlet/ServletRequest.html
 * @see http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @see https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Simple implementation of javax.servlet.ServletRequest.
 * @requires util.StringUtils.URI
 * @constructor
 * @see http://docs.oracle.com/javaee/5/api/javax/servlet/ServletRequest.html
 */
net.ServletRequest = function() {

  /**
   * Returns the value of a request parameter as a string, or empty string if
   * the parameter does not exist.
   * @param {string} name A <code>string</code> specifying the name of the
   *     parameter.
   * @param {Element|Location|string=} opt_location Optional location.
   * @return {string} Returns a <code>string</code> representing the single
   *     value of the parameter.
   * @this {net.ServletRequest}
   */
  this.getParameter = function(name, opt_location) {
    /** @type {!Object.<string, string>} */
    var map = this.getParameterMap(opt_location);
    return map[/** @type {string} */ (name)] || '';
  };

  /**
   * Returns a map of the parameters of this request including parameters from
   * parsed from query string and hash.
   * @param {Element|Location|string=} opt_location Optional location.
   * @return {!Object.<string, string>} Map containing parameter names as keys
   *     and parameter values as map values.
   */
  this.getParameterMap = function(opt_location) {
    /** @type {!Object.<string, string>} */ var map = {};
    /** @type {!Array.<string>} */ var pairs = parseLocation_(opt_location);
    /** @type {number} */ var index = pairs.length >>> 0;
    while (index--) {
      /** @type {!Array.<string>} */ var pair = pairs[index].split('=');
      /** @type {string} */ var key = pair[0];
      if (key) map[key] = util.StringUtils.URI.decode(pair[1]);
    }
    return map;
  };

  /**
   * Gets list of parameters pairs parsed form <code>opt_location</code>.
   * @param {Element|Location|string=} opt_location Optional location.
   * @return {!Array.<string>} Returns list of parameters pairs.
   * @private
   */
  function parseLocation_(opt_location) {
    opt_location = opt_location || location;

    /** @type {string} */ var hash = 'string' == typeof opt_location ?
        (opt_location.split('#')[1] || '') :
        opt_location.hash.substr(1);

    /** @type {string} */ var query = 'string' == typeof opt_location ?
        (opt_location.split('?')[1] || '').split('#')[0] :
        opt_location.search.substr(1);

    return query.split('&').concat(hash.split('&'));
  }
};
