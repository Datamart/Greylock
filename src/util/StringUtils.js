
/**
 * @fileoverview Miscellaneous String utility methods.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */


/**
 * @namespace Miscellaneous String utility methods.
 * @link http://static.springsource.org/spring/docs/2.5.x/api/org/
 *     springframework/util/StringUtils.html
 */
util.StringUtils = {
  /**
   * Trims leading and trailing whitespace from the given String.
   * @param {string} str The String to check.
   * @return {string} Returns the trimmed String.
   * @static
   */
  trim: function(str) {
    return str.trim ? str.trim() : util.StringUtils.trimRight(
        util.StringUtils.trimLeft(str));
  },

  /**
   * Trims leading whitespace from the given String.
   * @param {string} str The String to check.
   * @return {string} Returns the trimmed String.
   * @static
   */
  trimLeft: function(str) {
    return str.trimLeft ? str.trimLeft() : str.replace(/^[\s\xa0]+/, '');
  },

  /**
   * Trims trailing whitespace from the given String.
   * @param {string} str The String to check.
   * @return {string} Returns the trimmed String.
   * @static
   */
  trimRight: function(str) {
    return str.trimRight ? str.trimRight() : str.replace(/[\s\xa0]+$/, '');
  },

  /**
   * Converts HTML to plain text.
   * @param {string} str The input string.
   * @return {string} Converted string.
   * @static
   */
  toPlainText: function(str) {
    return str.replace(/<|>/gm, function(m) {
      return '&' + ('<' == m ? 'l' : 'g') + 't;';
    });
  },

  /**
   * Converts <code>obj</code> to query string.
   * @param {Object} obj The key-value pairs object.
   * @param {string=} opt_prefix Optional query prefix.
   * @return {string} Returns query string or empty string if no parameters
   *     given.
   * @static
   */
  toQueryString: function(obj, opt_prefix) {
    /** @type {string} */ var result = opt_prefix || '?';
    for (/** @type {string} */ var key in obj) {
      result += util.StringUtils.URI.encode(key) + '=' +
          util.StringUtils.URI.encode(obj[key]) + '&';
    }
    return result.slice(0, -1);
  },

  /**
   * Generates a random UUID (v4).
   * @return {string} Returns generated random UUID.
   * @link http://en.wikipedia.org/wiki/Universally_unique_identifier
   * @link http://en.wikipedia.org/wiki/Globally_unique_identifier
   * @link http://www.ietf.org/rfc/rfc4122.txt
   * @static
   */
  uuid: function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      /** @type {number} */ var r = Math.random() * 16 | 0;
      return ('x' == c ? r : (r & 0x3 | 0x8)).toString(16);
    });
  },

  /**
   * Converts <code>str</code> to hashed string.
   * @param {string} str The input string.
   * @return {string} Returns hashed string.
   * @static
   */
  hash: function(str) {
    /** @type {number} */ var result = 0;
    /** @type {number} */ var length = str.length;
    /** @type {number} */ var j = 0;
    for (/** @type {number} */ var i = 0; i < length; i++) {
      result ^= str.charCodeAt(i) << j;
      j += 8;
      j %= 24;
    }
    return result.toString(36).toUpperCase();
  },

  /**
   * Methods to manipulate with UTF-8 strings.
   * @type {!Object.<string, function(string): string>}
   * @static
   */
  UTF8: {
    /**
     * @param {string} str String to encode.
     * @return {string} Returns encoded string.
     * @static
     */
    encode: function(str) {
      return unescape(util.StringUtils.URI.encode(str));
    },

    /**
     * @param {string} str String to decode.
     * @return {string} Returns decoded string.
     * @static
     */
    decode: function(str) {
      return util.StringUtils.URI.decode(escape(str));
    }
  },

  /**
   * Methods to manipulate with URI strings.
   * @type {!Object.<string, function(string): string>}
   * @static
   */
  URI: {
    /**
     * @param {string} str String to encode.
     * @return {string} Returns encoded string.
     * @static
     */
    encode: encodeURIComponent || escape,

    /**
     * @param {string} str String to decode.
     * @return {string} Returns decoded string.
     * @static
     */
    decode: decodeURIComponent || unescape
  }
};


/**
 * Trims leading and trailing whitespace from the given String.
 * @param {string} str The String to check.
 * @return {string} Returns the trimmed String.
 * @deprecated Use "util.StringUtils.trim" instead.
 * @static
 */
util.StringUtils.trimWhitespace = util.StringUtils.trim;


/**
 * Trims leading whitespace from the given String.
 * @param {string} str The String to check.
 * @return {string} Returns the trimmed String.
 * @deprecated Use "util.StringUtils.trimLeft" instead.
 * @static
 */
util.StringUtils.trimLeadingWhitespace = util.StringUtils.trimLeft;


/**
 * Trims trailing whitespace from the given String.
 * @param {string} str The String to check.
 * @return {string} Returns the trimmed String.
 * @deprecated Use "util.StringUtils.trimRight" instead.
 * @static
 */
util.StringUtils.trimTrailingWhitespace = util.StringUtils.trimRight;


/**
 * @type {string}
 * @const
 */
util.StringUtils.BASE64_CHARACTER_TABLE =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';


/**
 * Base64 utils.
 * @type {!Object.<string, function(string):string>}
 * @namespace
 */
util.StringUtils.Base64 = {

  /**
   * Encodes string to base64.
   * @param {string} str String to encode.
   * @return {string} Returns encoded string.
   * @static
   */
  encode: function(str) {
    /** @type {string} */ var result = window.btoa ? window.btoa(str) : '';
    if (!result) {
      /** @type {!Array.<string>} */
      var table = util.StringUtils.BASE64_CHARACTER_TABLE.split('');
      /** @type {!Array.<string>} */ var buffer = str.split('');
      /** @type {number} */ var block = 0;
      /** @type {number} */ var index = 0;

      for (; buffer[index | 0] || (table = ['='], index % 1);
           result += table[63 & block >> 8 - index % 1 * 8]) {
        block = block << 8 | str.charCodeAt(index -= -3 / 4);
      }
    }
    return result;
  },

  /**
   * Decodes base64-encoded string.
   * @param {string} str Encoded string.
   * @return {string} Returns decoded string.
   * @static
   */
  decode: function(str) {
    /** @type {string} */ var result = window.atob ? window.atob(str) : '';
    if (!result) {
      /** @type {!Array.<string>} */ var buffer = str.split('');
      /** @type {number} */ var bit = 0;
      /** @type {number} */ var counter = 0;
      /** @type {number} */ var index = 0;
      /** @type {string} */ var character = '';

      for (/** @type {number} */ var i = 0; character = buffer[i++];) {
        index = util.StringUtils.BASE64_CHARACTER_TABLE.indexOf(character);
        if (~index) {
          bit = counter % 4 ? bit * 64 + index : index;
          if (counter++ % 4) {
            result += String.fromCharCode(255 & bit >> (-2 * counter & 6));
          }
        }
      }
    }
    return result;
  }
};


/**
 * Simple implementation of JSON methods.
 * @namespace
 */
util.StringUtils.JSON = {
  /**
   * This method parses a JSON text to produce an object or array.
   * @param {string} value String to parse.
   * @return {Object} Returns parsed object from string.
   * @static
   */
  parse: function(value) {
    return /** @type {Object} */ ((window.JSON ?
        JSON.parse(value) : eval('(' + value + ')')) || dom.NULL);
  },

  /**
   * This method produces a JSON text from a JavaScript value.
   * @param {*} obj Any JavaScript value, usually an object or array.
   * @return {string} Returns serialized object as string.
   * @static
   */
  stringify: window.JSON ? JSON.stringify : function(obj) {
    /** @type {string} */ var result;
    /** @type {string} */ var type = typeof obj;
    if ('object' != type || obj === dom.NULL) {
      result = 'string' == type ? '"' + obj + '"' : '' + obj;
    } else {
      /** @type {Array.<string>} */ var buffer = [];
      /** @type {boolean} */
      var isArray = /** @type {boolean} */ (obj && obj instanceof Array);
      for (/** @type {string} */ var key in obj) {
        /** @type {string|Object} */ var value = obj[key];
        type = typeof value;
        if ('string' == type) {
          value = '"' + value + '"';
        } else if ('object' == type && dom.NULL !== value) {
          value = util.StringUtils.JSON.stringify(/** @type {Object}*/ (value));
        }
        buffer.push((isArray ? '' : '"' + key + '":') + value);
      }

      result = (isArray ? '[' : '{') + buffer + (isArray ? ']' : '}');
    }
    return result;
  }
};


/**
 * Converts string to a byte array.
 * @param {string} str The input string.
 * @return {!Array.<number>} Returns byte array.
 * @static
 */
util.StringUtils.toByteArray = function(str) {
  /** @type {!Array.<number>} */ var result = [];
  for (/** @type {number} */ var i = 0; i < str.length; i++) {
    /** @type {number} */ var code = str.charCodeAt(i);
    if (128 > code) {
      result.push(code);
    } else if (2048 > code) {
      result.push((code >> 6) | 192);
      result.push((code & 63) | 128);
    } else if (65535 >= code) {
      result.push((code >> 12) | 224); // 192 + 32
      result.push(((code >> 6) & 63) | 128);
      result.push((code & 63) | 128);
    } else {
      result.push((code >> 18) | 240); // 224 + 16
      result.push(((code >> 12) & 63) | 128);
      result.push(((code >> 6) & 63) | 128);
      result.push((code & 63) | 128);
    }
  }
  return result;
};


/**
 * LZW compression utility.
 * @link http://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Welch
 * @namespace
 */
util.StringUtils.LZW = {};


/**
 * Encodes string using LZW algorithm.
 * @param {string} str The input string.
 * @return {string} Returns compressed string using LZW algorithm.
 * @static
 */
util.StringUtils.LZW.encode = function(str) {
  /** @type {!Object.<string, number>} */ var dict = {};
  /** @type {!Array.<string>} */ var data = str.split('');
  /** @type {!Array} */ var out = [];
  /** @type {number} */ var code = 256;
  /** @type {string} */ var phrase = data.shift();
  while (data.length) {
    /** @type {string} */ var next = data.shift();
    if (dom.NULL != dict[phrase + next]) {
      phrase += next;
    } else {
      out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
      dict[phrase + next] = code++;
      phrase = next;
    }
  }
  out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
  for (/** @type {number} */ var i = 0; i < out.length; i++) {
    out[i] = String.fromCharCode(/** @type {number} */ (out[i]));
  }
  return out.join('');
};


/**
 * Decodes string encoded with LZW algorithm.
 * @param {string} str The input string encoded with LZW algorithm.
 * @return {string} Returns decoded string.
 * @static
 */
util.StringUtils.LZW.decode = function(str) {
  /** @type {!Object} */ var dict = {};
  /** @type {!Array.<string>} */ var data = str.split('');
  /** @type {!Array.<string>} */ var out = [data.shift()];
  /** @type {number} */ var code = 256;
  /** @type {string} */ var chr = out[0];
  /** @type {string} */ var tmp = chr;
  for (/** @type {number} */ var i = 0; i < data.length; i++) {
    /** @type {number} */ var next = data[i].charCodeAt(0);
    /** @type {string} */ var phrase =
        next < 256 ? data[i] : (dict[next] ? dict[next] : (tmp + chr));
    out.push(phrase);
    chr = phrase.charAt(0);
    dict[code++] = tmp + chr;
    tmp = phrase;
  }
  return out.join('');
};
