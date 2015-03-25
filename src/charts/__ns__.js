
/**
 * @fileoverview The '<code>charts</code>' namespace definition.
 * @version 1.0.1
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */


/**
 * The '<code>charts</code>' namespace definition.
 * @namespace The '<code>charts</code>' namespace definition.
 */
var charts = window['charts'] = window['charts'] || {};


/**
 * Indicates if SVG is supported by current browser.
 * @type {boolean}
 * @static
 * @const
 */
charts.IS_SVG_SUPPORTED = !!window['SVGSVGElement'];


/**
 * Indicates if CSS3 is supported by current browser.
 * @type {boolean}
 * @static
 * @const
 */
charts.IS_CSS3_SUPPORTED = false; /*'transition' in document.body.style;*/
