
/**
 * @fileoverview Creates a URL object composed from the given parameters.
 * @see http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @see https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Creates and return a URL object composed from the given parameters.
 * @param {string} url Is a String representing an absolute or relative URL.
 * @constructor
 */
net.URL = window['URL'] || function(url) {
  /** @type {!RegExp} */
  var pattern = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
  /** @type {Array} */
  var result = (url || '').match(pattern) || [];

  this['protocol'] = result[2] ? result[2] + ':' : '';
  this['host'] = result[4] || '';
  this['hostname'] = this['host'].split(':')[0];
  this['port'] = +(this['host'].split(':')[1]) || '';
  this['pathname'] = result[5] || '';
  this['search'] = result[7] ? ('?' + result[7]) : '';
  this['hash'] = result[9] ? ('#' + result[9]) : '';

  this['toString'] = function() {
    return this['protocol'] + '//' + this['host'] +
           this['pathname'] + this['search'] + this['hash'];
  };
  return this;
};
