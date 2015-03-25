
/**
 * @fileoverview Miscellaneous files utility methods.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */


/**
 * Miscellaneous files utility methods.
 * @namespace
 */
util.FileUtils = {};


/**
 * @param {string} data Data content.
 * @param {string=} opt_fileName Optional file name.
 * @param {string=} opt_contentType Optional content type.
 * @static
 */
util.FileUtils.saveAs = function(data, opt_fileName, opt_contentType) {
  /** @type {Element} */ var link = dom.createElement('A');
  opt_fileName = opt_fileName || 'file';
  opt_contentType = opt_contentType || 'text/plain';
  if (window.Blob && 'download' in link) {
    link['href'] = (window.URL || window.webkitURL).createObjectURL(
        new Blob([data],
        {'type': opt_contentType + ';charset=' + dom.CHARSET}));
    link.setAttribute('download', opt_fileName);
    dom.document.body.appendChild(link);
    link.click();
  } else {
    // @link http://msdn.microsoft.com/en-us/library/cc848897(VS.85).aspx
    window.open('data:' + opt_contentType +
                ';base64,' + util.StringUtils.Base64.encode(data));
  }
};
