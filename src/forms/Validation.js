/**
 * @fileoverview Simple implementation of HTML5 Validation.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Simple implementation of HTML5 validation for non-supported browsers.
 * @constructor
 * @requires dom.events
 * @requires locale.Validation
 * @example
 * (<b>new</b> forms.Validation).init(document.forms[0]);
 */
forms.Validation = function() {

  /**
   * @type {!Object.<string, RegExp>}
   * @link https://tools.ietf.org/html/rfc2822#section-3.4.1
   */
  var VALIDATORS = {
    'email': /^[a-z0-9]([\w\.\-\+]*[a-z0-9])*@[a-z0-9]([\w\.\-]*[a-z0-9])*$/i,
    'url': /^((https?|ftp):\/\/).+/,
    'number': /^-?\d+(.\d+)?(e-?\d+)?$/i
  };

  /**
   * Initializes HTML5 form validation feature.
   * @param {Node} container The HTML container which contains form elements.
   */
  this.init = function(container) {
    if (!isSupported_()) {
      for (/** @type {number} */ var i = 0; i < forms.TAGS.length;) {
        setValidation_(dom.getElementsByTagName(container, forms.TAGS[i++]));
      }
    }
  };

  /**
   * @param {NodeList} elements List of HTML Form elements.
   * @private
   */
  function setValidation_(elements) {
    for (/** @type {number} */ var i = 0; i < elements.length; i++) {
      /** @type {Node|Element} */ var element = elements[i];
      initFieldValidation_(element);
      initFormValidation_(element.form);
    }
  }

  /**
   * @param {Node|Element} element HTML input or textarea element.
   * @private
   */
  function initFieldValidation_(element) {
    if (!element.checkValidity) {
      /**
       * @return {boolean} Returns whether a form will validate when it is
       * submitted, without having to submit it.
       * @link http://msdn.microsoft.com/en-us/library/ie/hh772948
       */
      element.checkValidity = function() {
        return checkFieldValidity_(element);
      };
    }

    if (!element.setCustomValidity) {
      /**
       * Sets custom validity message.
       * @param {string} message String containing a custom message.
       * @link http://msdn.microsoft.com/en-us/library/ie/hh772949
       * @link http://msdn.microsoft.com/en-us/library/ie/hh772950
       */
      element.setCustomValidity = function(message) {
        element['validationMessage'] = message;
      };
    }

    element.setCustomValidity('');
    if (element.hasAttribute('required')) {
      dom.css.addClass(element, 'required');
    }
  }

  /**
   * Initializes form validation.
   * @param {Node|Element} form The form element to initialize validation.
   * @private
   */
  function initFormValidation_(form) {
    if (form) {
      if (!form.checkValidity || isSafari_()) {
        /**
         * @return {boolean} Returns whether a form will validate when it is
         * submitted, without having to submit it.
         * @link http://msdn.microsoft.com/en-us/library/ie/hh772948
         */
        form.checkValidity = function() {
          return checkFormValidity_(form);
        };
      }

      if (!form.isAttached_) {
        dom.events.addEventListener(form, dom.events.TYPE.SUBMIT, function(e) {
          if (!form.checkValidity()) {
            dom.events.preventDefault(e);
            return false;
          }
          return true;
        });

        form.isAttached_ = true;
      }
    }
  }

  /**
   * @param {Node|Element} element HTML input or textarea element.
   * @return {boolean} Returns true if the form passes validation,
   *     false otherwise.
   * TODO: Add attribute validation (min, max, step, etc.)
   * @link http://msdn.microsoft.com/en-us/library/ie/hh772948
   * @private
   */
  function checkFieldValidity_(element) {
    /** @type {string} */
    var placeholder = element.getAttribute('placeholder') || '';
    if (element.value == placeholder) {
      element.value = '';
    }

    if (element.hasAttribute('required') && !element.value) {
      element.setCustomValidity(messages.getMessage('required'));
      if (!forms.isSupported(forms.FEATURES.PLACEHOLDER)) {
        element.value = placeholder;
      }
      return false;
    }

    if (!checkTypeValidity_(element)) {
      return false;
    }

    /** @type {string} */ var pattern = element.getAttribute('pattern');
    if (pattern && element.value) {
      if (!(new RegExp(pattern, 'g')).test(element.value)) {
        element.setCustomValidity(messages.getMessage('pattern'));
        return false;
      }
    }

    element.setCustomValidity('');
    if (!element.value && !forms.isSupported(forms.FEATURES.PLACEHOLDER)) {
      element.value = placeholder;
    }
    return true;
  }

  /**
   * Returns whether a form will validate when it is submitted, without having
   * to submit it.
   * @param {Node|Element} form The form element.
   * @return {boolean} Returns true if the form passes validation.
   * @link http://msdn.microsoft.com/en-us/library/ie/hh772948
   * @private
   */
  function checkFormValidity_(form) {
    /** @type {Element} */ var invalid = dom.NULL;

    for (/** @type {number} */ var i = 0; i < form.elements.length; i++) {
      /** @type {Element} */ var element = form.elements[i];

      if (element.checkValidity && !element.checkValidity()) {
        if (!invalid)
          invalid = element;
      }

      if (!element.tooltip) {
        element.tooltip = dom.createElement('SPAN');
        dom.css.setClass(element.tooltip, 'validation-bubble');
        element.parentNode.insertBefore(element.tooltip, element);
        element.parentNode.insertBefore(element, element.tooltip);
      }
      element.tooltip.style.display = 'none';
    }

    if (invalid) {
      showValidationMessage_(invalid);
      return false;
    }
    return true;
  }

  /**
   * @param {Node|Element} element HTML input or textarea element.
   * @return {boolean} Returns true if element value is valid, false otherwise.
   * @private
   */
  function checkTypeValidity_(element) {
    /** @type {string} */ var value = element.value;
    /** @type {string} */ var type = element.getAttribute('type');
    /** @type {RegExp} */ var regexp = VALIDATORS[type];

    if (value && regexp && !regexp.test(value)) {
      element.setCustomValidity(messages.getMessage(type));
      return false;
    }
    return true;
  }

  /**
   * @param {Node|Element} element HTML element.
   * @private
   */
  function showValidationMessage_(element) {
    if (!showValidationMessage_.isAttached_) {
      dom.events.addEventListener(
          dom.document, dom.events.TYPE.MOUSEDOWN, function() {
            if (invalidElement_ && invalidElement_.tooltip) {
              invalidElement_.tooltip.style.display = 'none';
            }
          });

      showValidationMessage_.isAttached_ = true;
    }
    element.tooltip.innerHTML = element['validationMessage'];
    element.tooltip.style.display = 'block';
    element.focus();
    invalidElement_ = element;
  }

  /**
   * @return {boolean} Returns true if browser supports HTML5 validation.
   * @private
   */
  function isSupported_() {
    return isSafari_() ? false : forms.isSupported(forms.FEATURES.VALIDATION);
  }

  /**
   * @return {boolean} Returns true if current browser is Safari.
   * @private
   */
  function isSafari_() {
    /** @type {boolean} */ var result = false;
    // To the user Safari will behave no differently than a browser that doesn't
    // support constraint validation at all.
    if (window['webkitURL'] && window['HTMLElement']) {
      if (window['HTMLElement'].toString().indexOf('Constructor') > 0) {
        // window.HTMLElement.toString()
        // chrome:
        // "function HTMLElement() { [native code] }"
        // safari (v. 3-8):
        // "[object HTMLElementConstructor]"
        result = true;
      }
    }
    return result;
  }

  /**
   * @type {Node|Element}
   * @private
   */
  var invalidElement_ = dom.NULL;

  /**
   * @type {!locale.Validation}
   * @private
   */
  var messages = new locale.Validation;
};
