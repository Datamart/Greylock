
/**
 * @fileoverview HttpRequest utils test suite.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 * @link https://code.google.com/p/js-test-driver/
 */


net.HttpRequestTestCase = AsyncTestCase('HttpRequestTestCase');

net.HttpRequestTestCase.prototype.testAsyncRequests = function(queue) {
  var request = new net.HttpRequest;
  var url = location.href;
  var data = {'param': 'value'};

  queue.call(function(callbacks) {
    request.doHead(url, callbacks.add(function(req) {
      assertEquals(4, req.readyState);
    }));

    request.doGet(url, callbacks.add(function(req) {
      assertEquals(4, req.readyState);
    }));

    request.doPost(url, callbacks.add(function(req) {
      assertEquals(4, req.readyState);
    }), data);

    assertTrue(request.getCount() > 0);
  });

  expectAsserts(4);
};
