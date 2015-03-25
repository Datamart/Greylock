
/**
 * @fileoverview String utils test suite.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 * @link https://code.google.com/p/js-test-driver/
 */


util.StringUtilsTestCase = TestCase('StringUtilsTestCase');


util.StringUtilsTestCase.prototype.testTrimWhitespace = function() {
  assertEquals('test string', util.StringUtils.trimWhitespace('  test string  '));
  assertEquals('test string', util.StringUtils.trimLeadingWhitespace('  test string'));
  assertEquals('test string', util.StringUtils.trimTrailingWhitespace('test string  '));
};

util.StringUtilsTestCase.prototype.testToPlainText = function() {
  assertEquals('&lt;b&gt;test&lt;b&gt;', util.StringUtils.toPlainText('<b>test<b>'));
};

util.StringUtilsTestCase.prototype.testToQueryString = function() {
  var data = {a: 1, b: 'b', c: false};
  assertEquals('?a=1&b=b&c=false', util.StringUtils.toQueryString(data));
};

util.StringUtilsTestCase.prototype.testUTF8 = function() {
  var input = 'тест';
  var encoded = util.StringUtils.UTF8.encode(input);
  var decoded = util.StringUtils.UTF8.decode(encoded);
  assertNotNull(encoded);
  assertEquals(input, decoded);
};

util.StringUtilsTestCase.prototype.testBase64 = function() {
  var input = 'test';
  var expected = 'dGVzdA==';
  var encoded = util.StringUtils.Base64.encode(input);
  var decoded = util.StringUtils.Base64.decode(encoded);
  assertNotNull(encoded);
  assertNotNull(decoded);
  assertEquals(expected, encoded);
  assertEquals(input, decoded);
};

util.StringUtilsTestCase.prototype.testJson = function() {
  var input = '{"a":1,"b":"b","c":false}';
  var json = util.StringUtils.JSON.parse(input);
  var result = util.StringUtils.JSON.stringify(json);
  assertNotNull(json);
  assertNotNull(result);
  assertEquals(input, result);
};

util.StringUtilsTestCase.prototype.testLzw = function() {
  var input = 'TOBEORNOTTOBEORTOBEORNOT#';
  var encoded = util.StringUtils.LZW.encode(input);
  assertTrue(input.length > encoded.length);
  var decoded = util.StringUtils.LZW.decode(encoded);
  assertTrue(input.length == decoded.length);
  assertEquals(input, decoded);
};

util.StringUtilsTestCase.prototype.testURI = function() {
  var input = 'тест';
  var encoded = util.StringUtils.URI.encode(input);
  var decoded = util.StringUtils.URI.decode(encoded);
  assertNotNull(encoded);
  assertEquals(input, decoded);
};

util.StringUtilsTestCase.prototype.testUuid = function() {
  var uuid = util.StringUtils.uuid();
  assertNotNull(uuid);
  assertEquals(36, uuid.length);
  assertEquals('4', uuid.substr(14, 1));
  var c = uuid.substr(19, 1).toLowerCase();
  assertTrue(c == '8' || c == '9' || c == 'a' || c == 'b');
};

