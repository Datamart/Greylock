#!/usr/bin/env bash

# https://jsdoc-toolkit.googlecode.com/files/jsdoc_toolkit-2.4.0.zip
# https://code.google.com/p/jsdoc-toolkit/wiki/CommandlineOptions

JSDOC_JAR="./lib/jsdoc-toolkit/jsrun.jar"
SRC_PATH="../src/charts"
DOC_PATH="../docs"
DOWNLOAD_URL=https://jsdoc-toolkit.googlecode.com/files/jsdoc_toolkit-2.4.0.zip
WGET="`which wget`"
CURL="`which curl`"


if [ ! -f "${JSDOC_JAR}" ]
then
    mkdir -p lib
    rm -rf tmp && mkdir tmp && cd tmp
    if [ -n "$WGET" ]; then
        $WGET "${DOWNLOAD_URL}"
    else
        $CURL "${DOWNLOAD_URL}" > ./jsdoc_toolkit-2.4.0.zip
    fi
    unzip jsdoc_toolkit-2.4.0.zip -d ../lib
    cd ../lib && mv jsdoc_toolkit*/jsdoc-toolkit ./
    rm -rf jsdoc_toolkit*
    cd ../ && rm -rf tmp
fi

java -jar "${JSDOC_JAR}" ./lib/jsdoc-toolkit/app/run.js \
     -r=5 "${SRC_PATH}" \
     -t=./lib/jsdoc-toolkit/templates/jsdoc \
     -d="${DOC_PATH}" \
     -e=utf-8 \
     --quiet
