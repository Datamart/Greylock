
/**
 * @fileoverview URL utils test suite.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 * @link https://code.google.com/p/js-test-driver/
 */


net.URLTestCase = TestCase('URLTestCase');

net.URLTestCase.prototype.testGetParameter = function() {
  var str = 'http://www.example.com:80/dir/file.html?a=b&c=d#e=f';
  var url = new net.URL(str);
  assertEquals('http:', url.protocol);
  assertEquals('www.example.com:80', url.host);
  assertEquals('www.example.com', url.hostname);
  assertEquals('80', url.port);
  assertEquals('/dir/file.html', url.pathname);
  assertEquals('?a=b&c=d', url.search);
  assertEquals('#e=f', url.hash);
  assertEquals(str, url.toString());
};
