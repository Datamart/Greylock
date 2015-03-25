
/**
 * @fileoverview Object utils test suite.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 * @link https://code.google.com/p/js-test-driver/
 */


util.ObjectUtilsTestCase = TestCase('ObjectUtilsTestCase');


util.ObjectUtilsTestCase.prototype.testExtend = function() {
  var target = {'original': 1, 'override': 'me'};
  var source = {
    'boolean': true,
    'string': 'test string',
    'number': 2,
    'array': ['a', 'r', 'r', 'a', 'y'],
    'override': 'done',
    'options': {
      'key': 'value'
    }
  };
  util.Object.extend(target, source);

  assertEquals(true, target['boolean']);
  assertEquals(1, target['original']);
  assertEquals(source['string'], target['string']);
  assertEquals(2, target['number']);
  assertEquals(source['array'].length, target['array'].length);
  assertEquals(source['override'], target['override']);
  assertNotNull(target['options']);
  assertEquals(target['options']['key'], target['options']['key']);
};