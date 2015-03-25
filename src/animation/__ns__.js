
/**
 * @fileoverview The '<code>animation</code>' namespace definition.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */


/**
 * The '<code>animation</code>' namespace definition.
 * @namespace The '<code>animation</code>' namespace definition.
 */
var animation = animation || {};


/**
 * Runs animations.
 * @param {!Node} element The element to animate.
 * @param {!Object.<string, number>} options Animation options.
 * @static
 * @see charts.BarChart
 * @see charts.ColumnChart
 * @example
 * animation.animate(element, {'width': 500});
 * animation.animate(element, {'width': 0});
 */
animation.animate = function(element, options) {
  // Testing.
  // if (element.tagName == 'DIV') return animation.run_(element, options);

  if ('transition' in element.style) {
    /** @type {!RegExp} */ var isDigit = /^\d+([\.]{1,}\d+)?$/;
    for (/** @type {string} */ var key in options) {
      // 99ms fix Firefox delay issue.
      /** @type {number} */ var delay = window['XULElement'] ? 99 : 0;
      (function(prop) {
        /** @type {number} */ var timer = setTimeout(function() {
          element.style.transition = 'all ' +
              Math.random().toFixed(2) + 's ease-in-out';
          if ('transform' == prop) {
            element.style.transform = options[prop];
            element.style.WebkitTransform = options[prop];
            element.style.MozTransform = options[prop];
            element.style.OTransform = options[prop];
          } else {
            element.style[prop] = options[prop] +
                (isDigit.test(options[prop]) ? 'px' : '');
          }
          clearTimeout(timer);
        }, delay);
      })(key);
    }
  } else {
    animation.run_(element, options);
  }
};


/**
 * Runs animation by property.
 * @param {Node} element Animated element.
 * @param {Object.<string, number>} options Animation options.
 * @private
 */
animation.run_ = function(element, options) {
  /**
   * @param {function(number)} frame The frame function.
   * @param {function(number): number=} opt_delta The optional delta function.
   * @param {number=} opt_duration The optional duration.
   * @param {number=} opt_delay The optional delay.
   */
  function animate(frame, opt_delta, opt_duration, opt_delay) {
    opt_duration = (opt_duration || 300) * Math.random() + 100;
    opt_delay = opt_delay || 10;
    opt_delta = opt_delta || function(progress) {
      //return Math.pow(progress, 2);
      return progress;
    };

    /** @type {!Date} */ var start = new Date;
    /** @type {number} */ var interval = setInterval(function() {
      /** @type {number} */ var progress = (new Date - start) / opt_duration;
      if (progress > 1) progress = 1;
      frame(opt_delta(progress));
      if (progress == 1) clearInterval(interval);
    }, opt_delay);
  }

  animate(function(delta) {
    for (/** @type {string} */ var prop in options) {
      element.style[prop] = options[prop] * delta + 'px';
    }
  });
};

