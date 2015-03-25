
/**
 * @fileoverview Cookies utils test suite.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 * @link https://code.google.com/p/js-test-driver/
 */


dom.CookiesTestCase = TestCase('CookiesTestCase');

dom.CookiesTestCase.prototype.testCookies = function() {
  var key = 'test-key';
  var value = 'test-value';
  dom.Cookies.set(key, value, 1);
  assertEquals(value, dom.Cookies.get(key));
  assertTrue(dom.Cookies.keys().indexOf(key) != -1);
  assertTrue(dom.Cookies.remove(key));
  assertFalse(dom.Cookies.remove('not-existing-key'));
  assertEquals('test-default', dom.Cookies.get(key, 'test-default'));
};
