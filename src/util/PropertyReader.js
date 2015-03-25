
/**
 * @fileoverview PropertyReader utils.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Constructor of PropertyReader.
 * @constructor
 */
util.PropertyReader = function() {

  /**
   * Gets attribute' values of "tagName" founded in "context".
   * @param {Document|Node} context The DOM context.
   * @param {string} tagName The element tag name.
   * @param {string} attribute The name of attribute.
   * @param {string} value The name of value attribute.
   */
  this.read = function(context, tagName, attribute, value) {
    if (context) {
      /** @type {NodeList} */
      var nodes = dom.getElementsByTagName(context, tagName);
      for (/** @type {number} */ var i = 0; i < nodes.length;) {
        /** @type {!Node} */ var node = nodes[i++];
        /** @type {string} */ var name = node.getAttribute(attribute);
        if (name) {
          /** @type {string} */ var result = node.getAttribute(value);
          cache_[name] = result;
          values_.push(result);
          names_.push(name);
        }
      }
    }
  };

  /**
   * TODO: rename to 'getValues'
   * @return {!Array.<string>} Returns object.
   */
  this.getListOfValues = function() {
    return values_;
  };

  /**
   * @return {!Array.<string>} Returns object.
   */
  this.getNames = function() {
    return names_;
  };

  /**
   * @return {Object.<string, string>} Returns object.
   */
  this.getData = function() {
    return cache_;
  };

  /**
   * @param {string} key The property key.
   * @return {?string} Returns property value.
   */
  this.getValue = function(key) {
    return cache_[key];
  };

  /**
   * @dict
   * @private
   */
  var cache_ = {};

  /**
   * @type {!Array.<string>}
   * @private
   */
  var values_ = [];

  /**
   * @type {!Array.<string>}
   * @private
   */
  var names_ = [];
};
