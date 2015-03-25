
/**
 * @fileoverview Template utils test suite.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 * @link https://code.google.com/p/js-test-driver/
 */


dom.TemplateTestCase = TestCase('TemplateTestCase');

dom.TemplateTestCase.prototype.testParse = function() {
  var template = new dom.Template;
  var expect = '<b>Test</b>';
  var values = {'var_name': 'Test'};
  var result = template.parse('<b>{{ var_name }}</b>', values);

  expect = '<b>John admin</b>';
  values = {
    'user': {'name': 'John'},
    'role': function() {return 'admin';}
  };
  result = template.parse('<b>{{ user.name }} {{ role }}</b>', values);

  assertEquals(expect, result);
};
