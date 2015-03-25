
/**
 * @fileoverview MetaData localization utils.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Constructor of MetaData.
 * @class Constructor of MetaData.
 * @extends {util.PropertyReader} util.PropertyReader
 * @constructor
 * @example
 * <b>var</b> meta = <b>new</b> util.MetaData();
 * console.log(meta.getValues());
 * console.log(meta.getValues(document));
 * console.log(meta.getValues(document.getElementById('container')));
 * console.log(meta.getValues(ajax.responseXML));
 */
util.MetaData = function() {
  util.PropertyReader.apply(this, arguments);

  /**
   * @param {Document|Node=} opt_context The optional DOM context.
   * @return {Object.<string, string>} Returns meta data.
   */
  this.getValues = function(opt_context) {
    self_.read(opt_context || dom.document, 'meta', 'name', 'content');
    return self_.getData();
  };

  /**
   * @type {!util.MetaData}
   * @private
   */
  var self_ = this;
};
