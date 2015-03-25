
/**
 * @fileoverview Calendar localization test suite.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 * @link https://code.google.com/p/js-test-driver/
 */


locale.CalendarTestCase = TestCase('CalendarTestCase');

locale.CalendarTestCase.prototype.testGetWeekNames = function() {
  var calendar = new locale.Calendar();
  var expect = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  var result = calendar.getWeekNames();
  assertNotNull(result);
  assertTrue(expect.length == result.length);
  assertEquals(expect.toString(), result.toString());
};

locale.CalendarTestCase.prototype.testGetMonthNames = function() {
  var calendar = new locale.Calendar();
  var expect = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November',
                'December'];
  var result = calendar.getMonthNames();
  assertNotNull(result);
  assertTrue(expect.length == result.length);
  assertEquals(expect.toString(), result.toString());
};

locale.CalendarTestCase.prototype.testGetMonthName = function() {
  var calendar = new locale.Calendar();
  var expect = 'June';
  var result = calendar.getMonthName(new Date(2013, 5, 1));
  assertNotNull(result);
  assertTrue(expect.length == result.length);
  assertEquals(expect.toString(), result.toString());
};

locale.CalendarTestCase.prototype.testGetMonthByName = function() {
  var calendar = new locale.Calendar();
  var expect = 5;
  var result = calendar.getMonthByName('June');
  assertNotNull(result);
  assertEquals(expect, result);
};
