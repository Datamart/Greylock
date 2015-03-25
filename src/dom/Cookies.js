
/**
 * @fileoverview Miscellaneous Cookies utility methods.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */


/**
 * Miscellaneous Cookies utility methods.
 * @type {!Object.<string, Function>}
 */
dom.Cookies = {
  /**
   * Sets a cookie.
   * @param {string} key The name of the cookie.
   * @param {string} value The value of the cookie.
   * @param {number} expires The days after the cookie expires.
   * @param {string=} opt_domain Optional, domain that the cookie is
   *     available to.
   */
  set: function(key, value, expires, opt_domain) {
    dom.document.cookie = escape(key) + '=' + escape(value || '') +
        '; expires=' + (new Date(+new Date + (expires * 864e5)).toGMTString()) +
        '; path=/; domain=' + (opt_domain || dom.document.domain);
  },

  /**
   * Gets the value for the first cookie with the given name.
   * @param {string} key The name of the cookie to get.
   * @param {string=} opt_default The optional default value.
   * @return {string} The value of the cookie. If no cookie is set this
   *     returns opt_default or undefined if opt_default is not provided.
   */
  get: function(key, opt_default)  {
    return unescape(
        (dom.document.cookie.match(key + '=([^;].+?)(;|$)') || [])[1] ||
        opt_default || '');
  },

  /**
   * Removes and expires a cookie.
   * @param {string} key The cookie name.
   * @return {boolean} Whether the cookie existed before it was removed.
   */
  remove: function(key) {
    /** @type {string} */ var value = dom.Cookies.get(key);
    dom.Cookies.set(key, '', 0);
    return !!value;
  },

  /**
   * Removes and expires all cookie.
   */
  clear: function() {
    /** @type {!Array.<string>} */ var keys = dom.Cookies.keys();
    while (keys.length) {
      dom.Cookies.remove(keys.pop());
    }
  },

  /**
   * Gets list of stored keys.
   * @return {!Array.<string>} Returns list of stored keys.
   */
  keys: function() {
    /** @type {!Array.<string>} */ var keys = [];
    /** @type {!RegExp} */ var re = /;\s*/;
    /** @type {!Array.<string>} */ var parts = dom.document.cookie.split(re);
    while (parts.length) {
      keys.push(parts.pop().split('=')[0]);
    }
    return keys;
  }
};
