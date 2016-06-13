#!/bin/bash
#
# Guide: https://google.github.io/styleguide/shell.xml
# https://jsdoc-toolkit.googlecode.com/files/jsdoc_toolkit-2.4.0.zip
# https://code.google.com/p/jsdoc-toolkit/wiki/CommandlineOptions


readonly CWD=$(cd $(dirname $0); pwd)
readonly LIB="${CWD}/lib"
readonly TMP="${CWD}/tmp"

readonly JSDOC_JAR="${LIB}/jsdoc-toolkit/jsrun.jar"
readonly SRC_PATH="${CWD}/../src/charts"
readonly DOC_PATH="${CWD}/../docs"
readonly DOWNLOAD_URL=https://jsdoc-toolkit.googlecode.com/files/jsdoc_toolkit-2.4.0.zip

readonly WGET="$(which wget)"
readonly CURL="$(which curl)"
readonly UNZIP="$(which unzip)"

readonly JAVA="$(which java)"
# Hot fix for clean installation of OS X El Capitan.
readonly JAVA_OSX="/Library/Internet Plug-Ins/JavaAppletPlugin.plugin/Contents/Home/bin/java"


#
# Downloads jsdoc toolkit.
#
function download() {
  if [[ ! -f "${JSDOC_JAR}" ]]; then
    echo "Downloading jsdoc toolkit:"
    mkdir -p "${LIB}"
    rm -rf "${TMP}" && mkdir "${TMP}" && cd "${TMP}"
    if [[ -n "$WGET" ]]; then
      $WGET "${DOWNLOAD_URL}"
    else
      $CURL "${DOWNLOAD_URL}" > ./jsdoc_toolkit-2.4.0.zip
    fi
    echo "Done"

    echo -n "Extracting jsdoc toolkit: "
    $UNZIP -q "${TMP}/jsdoc_toolkit-2.4.0.zip" -d "${LIB}"
    echo "Done"

    cd "${LIB}" && mv jsdoc_toolkit*/jsdoc-toolkit ./
    rm -rf jsdoc_toolkit*
    cd "${CWD}" && rm -rf "${TMP}"
  fi
}

#
# Runs jsdoc toolkit.
#
function run() {
  echo "Running jsdoc toolkit:"
  local JAVA_BIN="${JAVA}"
  if [[ -f "${JAVA_OSX}" ]]; then
    JAVA_BIN="${JAVA_OSX}"
  fi

  "${JAVA_BIN}" -jar "${JSDOC_JAR}" "${LIB}/jsdoc-toolkit/app/run.js" \
    -r=5 "${SRC_PATH}" \
    -t="${LIB}/jsdoc-toolkit/templates/jsdoc" \
    -d="${DOC_PATH}" \
    -e=utf-8 \
    --quiet

  echo "Done"
}

#
# The main function.
#
function main() {
  download
  run
}

main "$@"
