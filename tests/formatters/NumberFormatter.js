
/**
 * @fileoverview Number format library test suite.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 * @link https://code.google.com/p/js-test-driver/
 */


formatters.NumberFormatterTestCase = TestCase('NumberFormatterTestCase');


formatters.NumberFormatterTestCase.prototype.testFormat = function() {
  var formatter = new formatters.NumberFormatter();
  assertEquals(formatter.format(100), '100');
  assertEquals(formatter.format(1000), '1,000');
  assertEquals(formatter.format(1500), '1,500');
  assertEquals(formatter.format(10000), '10,000');
  assertEquals(formatter.format(1e6), '1,000,000');

  var formatter = new formatters.NumberFormatter({'prefix': '$'});
  assertEquals(formatter.format(100), '$100');
  assertEquals(formatter.format(1e6), '$1,000,000');
};


formatters.NumberFormatterTestCase.prototype.testRound = function() {
  var formatter = new formatters.NumberFormatter();
  assertEquals(formatter.round(100), '100');
  assertEquals(formatter.round(1000), '1k');
  assertEquals(formatter.round(1500), '1.50k');
  assertEquals(formatter.round(10000), '10k');
  assertEquals(formatter.round(1e6), '1m');

  var formatter = new formatters.NumberFormatter({'prefix': '$'});
  assertEquals(formatter.round(100), '$100');
  assertEquals(formatter.round(1e6), '$1m');
};
