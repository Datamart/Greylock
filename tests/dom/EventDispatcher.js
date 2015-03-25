
/**
 * @fileoverview EventDispatcher test suite.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 * @link https://code.google.com/p/js-test-driver/
 */


dom.EventDispatcherTestCase = TestCase('EventDispatcherTestCase');

dom.EventDispatcherTestCase.prototype.testEventDispatcher = function() {
  var dispatcher = new dom.EventDispatcher;
  var listener = function(e) {
    assertNotNull(e);
  };
  dispatcher.addEventListener('click', listener);
  dispatcher.dispatchEvent('click');
  assertTrue(dispatcher.removeEventListener('click', listener));
};
