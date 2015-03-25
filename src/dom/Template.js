
/**
 * @fileoverview Simple logic-less template engine.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Simple logic-less template engine.
 * @requires net.HttpRequest
 * @constructor
 */
dom.Template = function() {

  /**
   * Loads template by URL.
   * @param {string} url The template path.
   * @param {!function(string)} callback The callback function.
   * @param {!Object} values The template values as dict.
   * @example
   * <b>var</b> values = {
   *   'date': '2013-07-18',
   *   'user': {'name': 'John'},
   *   'func': <b>function</b>() {<b>return</b> 'Hello World.';}
   * };
   * <b>var</b> callback = <b>function</b>(content) {
   *   document.getElementById('div').innerHTML = content;
   * };
   * <b>var</b> template = <b>new</b> dom.Template();
   * template.load('template.html', callback, values);
   */
  this.load = function(url, callback, values) {
    if (cache_[url]) {
      callback(self_.parse(cache_[url], values));
    } else {
      request_.doGet(url, function(req) {
        cache_[url] = req['responseText'];
        callback(self_.parse(cache_[url], values));
      });
    }
  };

  /**
   * Parses template text content.
   * @param {string} content The template text content.
   * @param {!Object} values The template values as dict.
   * @param {string=} opt_prefix The optional var name prefix.
   * @return {string} Returns parsed template text content.
   * @example
   * <b>var</b> values = {
   *   'date': '2013-07-18',
   *   'user': {'name': 'John'},
   *   'func': <b>function</b>() {<b>return</b> 'Hello World.';}
   * };
   * <b>var</b> content = '{{ date }} {{ user.name }} {{ func }}';
   * <b>var</b> template = <b>new</b> dom.Template();
   * document.getElementById('div').innerHTML = template.parse(content, values);
   */
  this.parse = function(content, values, opt_prefix) {
    for (/** @type {string} */ var key in values) {
      /** @type {string} */
      var name = (opt_prefix ? opt_prefix + '.' : '') + key;
      /** @type {*} */ var value = values[key];
      /** @type {!RegExp} */
      var re = new RegExp('{{ ' + name.replace('.', '\\.') + ' }}', 'img');
      if ('function' == typeof value) {
        content = content.replace(re, '' + value());
      } else if ('object' == typeof value) {
        content = self_.parse(content, /** @type {!Object} */ (value), key);
      } else {
        content = content.replace(re, '' + value);
      }
    }

    // Clear all not parsed variables.
    if (!opt_prefix) content = content.replace(/\{\{ [\w\.]+ \}\}/img, '');
    return content;
  };

  /**
   * @dict
   * @private
   */
  var cache_ = {};

  /**
   * @type {!net.HttpRequest}
   * @private
   */
  var request_ = new net.HttpRequest;

  /**
   * The reference to current class instance. Used in private methods.
   * @type {!dom.Template}
   * @private
   */
  var self_ = this;
};
