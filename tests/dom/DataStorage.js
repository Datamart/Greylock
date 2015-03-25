
/**
 * @fileoverview DataStorage utils test suite.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 * @link https://code.google.com/p/js-test-driver/
 */


dom.DataStorageTestCase = TestCase('DataStorageTestCase');

dom.DataStorageTestCase.prototype.testDataStorage = function() {
  var key = 'test-key';
  var value = 'test-value';
  var storage = new dom.DataStorage;
  storage.set(key, value);
  assertEquals(value, storage.get(key));
  storage.remove(key);
  assertNull(storage.get(key));
};

dom.DataStorageTestCase.prototype.testCompression = function() {
  var key = 'test-key';
  var value = 'test-value';
  var storage = new dom.DataStorage({'compress': true});
  storage.set(key, value);
  assertEquals(value, storage.get(key));
  storage.remove(key);
  assertNull(storage.get(key));
};

dom.DataStorageTestCase.prototype.testUnicodeCompression = function() {
  var key = 'test-key';
  var value = 'русский текст';
  var storage = new dom.DataStorage({'compress': true});
  storage.set(key, value);
  assertEquals(value, storage.get(key));
  storage.remove(key);
  assertNull(storage.get(key));
};
