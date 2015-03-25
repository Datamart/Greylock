#!/usr/bin/env bash

# https://code.google.com/p/js-test-driver/

echo "Running jstest. "

ROOTDIR="$( cd "$( dirname "$0")" && pwd )"
JSTD_VERSION=1.3.5

echo "Root: ${ROOTDIR}"

mkdir -p "$ROOTDIR/lib"

if [ ! -f "$ROOTDIR/lib/JsTestDriver-$JSTD_VERSION.jar" ]; then
    echo "Downloading JsTestDriver jar ..."
    curl http://js-test-driver.googlecode.com/files/JsTestDriver-$JSTD_VERSION.jar > $ROOTDIR/lib/JsTestDriver-$JSTD_VERSION.jar
fi

if [ ! -f "$ROOTDIR/lib/coverage-$JSTD_VERSION.jar" ]; then
    echo "Downloading coverage jar ..."
    curl http://js-test-driver.googlecode.com/files/coverage-$JSTD_VERSION.jar > $ROOTDIR/lib/coverage-$JSTD_VERSION.jar
fi

if [ ! -d "$ROOTDIR/lib/phantomjs" ]; then
    mkdir -p "$ROOTDIR/lib/phantomjs"
    echo "Downloading phantomjs ..."
    if [ `uname` == "Darwin" ]; then
      curl https://phantomjs.googlecode.com/files/phantomjs-1.9.1-macosx.zip > $ROOTDIR/lib/phantomjs/phantomjs.zip
      unzip $ROOTDIR/lib/phantomjs/phantomjs.zip -d $ROOTDIR/lib/phantomjs/
    else
      if [ `uname -m` == "x86_64" ]; then
        curl https://phantomjs.googlecode.com/files/phantomjs-1.9.1-linux-x86_64.tar.bz2 > $ROOTDIR/lib/phantomjs/phantomjs.tar.bz2
      else
        curl https://phantomjs.googlecode.com/files/phantomjs-1.9.1-linux-i686.tar.bz2 > $ROOTDIR/lib/phantomjs/phantomjs.tar.bz2
      fi
      tar -xvjpf $ROOTDIR/lib/phantomjs/phantomjs.tar.bz2 -C $ROOTDIR/lib/phantomjs/
    fi
    mv $ROOTDIR/lib/phantomjs/phantomjs-*/* $ROOTDIR/lib/phantomjs/
    rm -rf $ROOTDIR/lib/phantomjs/phantomjs*
fi


#if [ ! -f "$ROOTDIR/lib/phantomjs/phantomjs-jstd.js" ]; then
    echo "var page = require('webpage').create();
          var url = 'http://localhost:9876/capture';
          var captureAttempts = 0;
          var captured = false;
          var locked = false;

          var log = function(str) {
              var dt = new Date();
              console.log(dt.toString() + ': ' + str);
              console.log(navigator.userAgent);
          };

          var pageLoaded = function(status) {
              log('Finished loading ' + url + ' with status: ' + status);

              var runnerFrame = page.evaluate(function() {
                  return document.getElementById('runner');
              });

              if (!runnerFrame) { locked = false; setTimeout(capture, 1000); }
              else { captured = true; }
          };

          var capture = function() {
              if (captureAttempts === 5) {
                  log('Failed to capture JSTD after ' + captureAttempts + ' attempts.');
                  phantom.exit();
              }

              if (captured || locked) { return; }

              captureAttempts += 1;
              locked = true;

              log('Attempting (' + captureAttempts + ') to load: ' + url);
              page.open(url, pageLoaded);
          };

          capture();" > "$ROOTDIR/lib/phantomjs/phantomjs-jstd.js"
#fi


#if [ ! -f "$ROOTDIR/lib/JsTestDriver-$JSTD_VERSION.conf" ]; then
    echo "server: http://localhost:9876

load:
  - src/*.js

test:
  - tests/*.js

timeout: 90

#plugin:
# - name: 'coverage'
#   jar: '$ROOTDIR/lib/coverage-$JSTD_VERSION.jar'
#   module: 'com.google.jstestdriver.coverage.CoverageModule'

" > "$ROOTDIR/lib/JsTestDriver-$JSTD_VERSION.conf"
#fi

echo "Starting JSTD Server"
nohup java -jar $ROOTDIR/lib/JsTestDriver-$JSTD_VERSION.jar --port 9876 > $ROOTDIR/jstd.out 2> $ROOTDIR/jstd.err < /dev/null &
echo $! > $ROOTDIR/jstd.pid

echo "Starting PhantomJS"
nohup $ROOTDIR/lib/phantomjs/bin/phantomjs $ROOTDIR/lib/phantomjs/phantomjs-jstd.js > $ROOTDIR/phantomjs.out 2> $ROOTDIR/phantomjs.err < /dev/null &
echo $! > $ROOTDIR/phantomjs.pid


sleep 2
echo "Starting Tests"
java -jar $ROOTDIR/lib/JsTestDriver-1.3.5.jar \
     --config $ROOTDIR/lib/JsTestDriver-$JSTD_VERSION.conf \
     --captureConsole \
     --tests all \
     --basePath "$ROOTDIR/../" \
     --server http://localhost:9876 $*

sleep 2

echo "Killing JSTD Server"
PID=`cat $ROOTDIR/jstd.pid`
kill $PID
rm -f $ROOTDIR/jstd.out $ROOTDIR/jstd.err $ROOTDIR/jstd.pid

echo "Killing PhantomJS"
PID=`cat $ROOTDIR/phantomjs.pid`
kill $PID
rm -f $ROOTDIR/phantomjs.out $ROOTDIR/phantomjs.err $ROOTDIR/phantomjs.pid

# TODO (alex): Parse test results and exit with 1 or 0.
exit 0
