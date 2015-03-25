
/**
 * @fileoverview Defines 'forms' namespace.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */


/**
 * Defines 'forms' namespace.
 * @namespace Defines 'forms' namespace.
 */
var forms = forms || {};


/**
 * List of form elements.
 * @type {!Array.<string>}
 * @static
 */
forms.TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];


/**
 * Enum of HTML5 form features.
 * @enum {string}
 * @example <code>{
 *  PLACEHOLDER, VALIDATION
 * }</code>
 */
forms.FEATURES = {
  PLACEHOLDER: 'placeholder',
  VALIDATION: 'required'
};


/**
 * @param {string} feature The html5 form feature.
 * @return {boolean} Returns true if feature is supported.
 * @see forms.FEATURES
 */
forms.isSupported = function(feature) {
  forms.features_ = forms.features_ || {};
  if (!(feature in forms.features_)) {
    forms.features_[feature] = feature in dom.createElement('INPUT');
  }
  return forms.features_[feature];
};


/**
 * Initializes HTML5 form features: placeholder, validation, etc.
 * @param {Node} container The HTML container which contains form elements.
 * @static
 * @example
 * forms.init(document.forms[0]);
 */
forms.init = function(container) {
  (new forms.PlaceHolder).init(container);
  (new forms.Validation).init(container);
};


/**
 * Adds onchange/oninput event handler on all form elements.
 * @param {HTMLFormElement} form Form element.
 * @param {!Function} handler Event handler.
 */
forms.onchange = function(form, handler) {

  function checker_(element, handler) {
    /** @type {string} */ var value = element.value;
    setInterval(function() {
      if (value != element.value) {
        handler(/** @type {Event} */({'target': element}));
        value = element.value;
      }
    }, 99);
  }

  if (form) {
    /** @type {HTMLCollection} */ var elements = form.elements;
    /** @type {number} */ var length = elements.length;
    while (length) checker_(elements[--length], handler);
  }
};

