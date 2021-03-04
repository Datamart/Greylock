
/**
 * @fileoverview The '<code>charts</code>' namespace definition.
 * @version 1.0.1
 * @see https://google.github.io/styleguide/jsguide.html
 * @see https://github.com/google/closure-compiler/wiki
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
