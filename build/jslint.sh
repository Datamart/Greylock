#!/usr/bin/env bash

# http://code.google.com/p/closure-linter/downloads/list
# https://closure-linter.googlecode.com/files/closure_linter-latest.tar.gz

echo -n "Running jslint. "
DOWNLOAD_URL="http://closure-linter.googlecode.com/files/closure_linter-latest.tar.gz"
OUTPUT_PATH="./linter.tar.gz"
CUSTOM_TAGS="version,example,static,namespace,requires,event"
SRC_PATH="../src"
WGET="`which wget`"
CURL="`which curl`"

if [ "x`which gjslint`" == "x" ]
then
    rm -rf tmp && mkdir tmp && cd tmp

    if [ -n "$WGET" ]; then
        $WGET "${DOWNLOAD_URL}" -O "${OUTPUT_PATH}"
    else
        $CURL "${DOWNLOAD_URL}" > "${OUTPUT_PATH}"
    fi
    tar -xvzf "${OUTPUT_PATH}" -C ./
    cd closure_linter*
    python setup.py build && sudo python setup.py install
    cd ../

    rm -rf tmp
fi

fixjsstyle --strict --custom_jsdoc_tags "${CUSTOM_TAGS}" -x 'externs.js' -r "${SRC_PATH}"
gjslint --strict --custom_jsdoc_tags "${CUSTOM_TAGS}" -x 'externs.js' -r "${SRC_PATH}"
