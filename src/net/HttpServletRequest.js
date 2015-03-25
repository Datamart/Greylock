
/**
 * @fileoverview Simple implementation of javax.servlet.http.HttpServletRequest.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Simple implementation of javax.servlet.http.HttpServletRequest.
 * @constructor
 * @extends {net.ServletRequest} net.ServletRequest
 * @requires dom.scripts
 */
net.HttpServletRequest = function() {
  net.ServletRequest.apply(this, arguments);

  /**
   * Returns the query string that is contained in the request URL after the
   *     path.
   * @return {string} Returns the query string that is contained in the request
   *     URL after the path.
   */
  this.getQueryString = function() {
    return location.search && location.search.substr(1);
  };

  /**
   * Returns the portion of the request URI that indicates the context of the
   * request.
   * @return {string} Returns current context path.
   */
  this.getContextPath = function() {
    if (!net.HttpServletRequest.contextPath_) {
      /** @type {Element} */ var script = dom.scripts.getCurrent();
      if (script) {
        /** @type {string} */ var path = script.getAttribute('src');
        /** @type {Element} */ var a = dom.createElement('A');
        a['href'] = path;

        // Replace all relatives.
        path = path.replace(/(\.+\/)+/, '');
        net.HttpServletRequest.contextPath_ = a['pathname'].replace(path, '');
      }
    }
    return net.HttpServletRequest.contextPath_ || '';
  };
};
