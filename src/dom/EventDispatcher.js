
/**
 * @fileoverview Event-driven implementation is based on W3C DOM Level 3
 * Events Specification.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * The EventDispatcher class implements W3C EventTarget and EventListener
 * interfaces.
 * @constructor
 * @example
 * <b>function</b> UserMenu() {
 *    dom.EventDispatcher.call(<b>this</b>);
 *
 *   <b>this</b>.onClick = <b>function</b>() {
 *     <b>this</b>.dispatchEvent('menu.clicked');
 *   };
 * }
 *
 * <b>function</b> ContentArea() {
 *    dom.EventDispatcher.call(<b>this</b>);
 *
 *    <b>function</b> update_(menu) {
 *      console.log(menu);
 *    }
 *
 *    <b>this</b>.addEventListener('menu.clicked', update_);
 * }
 */
dom.EventDispatcher = function() {

  /**
   * Registrates event listener on the event target.
   * @param {string} type The event type for which the user is registering.
   * @param {function(dom.EventDispatcher)} listener The listener parameter
   *     takes an interface implemented by the user which contains the
   *     methods to be called when the event occurs.
   */
  this.addEventListener = function(type, listener) {
    events_[type] = (events_[type] || []).concat([listener]);
  };

  /**
   * Removes event listeners from the event target.
   * @param {string} type The event type of the listener being removed.
   * @param {function(dom.EventDispatcher)} listener Reference to the event
   *     listener to be removed.
   * @return {boolean} Returns true if listener was removed.
   */
  this.removeEventListener = function(type, listener) {
    /** @type {Array} */ var listeners = events_[type];
    if (listeners) {
      /** @type {number} */ var index = listeners.length >>> 0;
      while (index--) {
        if (listeners[index] === listener) {
          listeners.splice(index, 1);
          return true;
        }
      }
    }
    return false;
  };

  /**
   * Dispatches events into the implementations event model.
   * @param {string} type The event type to be used in processing the event.
   */
  this.dispatchEvent = function(type) {
    /** @type {Array} */ var listeners = events_[type];
    if (listeners) {
      /** @type {number} */ var index = 0;
      while (index < listeners.length) {
        listeners[index++](self_);
      }
    }
  };

  /**
   * Event storage.
   * @type {!Object.<string, Array>}
   * @private
   */
  var events_ = {};

  /**
   * The reference to current class instance.
   * Used in private methods and for preventing jslint errors.
   * @type {!dom.EventDispatcher}
   * @private
   */
  var self_ = this;
};
