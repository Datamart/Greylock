#!/bin/bash
#
# Guide: https://google.github.io/styleguide/shell.xml
#

readonly CWD=$(cd $(dirname $0); pwd)
readonly LIB_NAME="glize"
readonly LIB_SRC="${CWD}/../${LIB_NAME}/src"
readonly LIB_DIR="${CWD}/../src/${LIB_NAME}"

#
# The main function.
#
function main() {
  echo -n "Updating submodule: "
  git submodule update --init --recursive
  echo "Done"

  echo -n "Copying submodule files: "
  rm -rf "${LIB_DIR}"
  mkdir -p "${LIB_DIR}"
  cp -rf "${LIB_SRC}" "${LIB_DIR}"
  echo "Done"
}

main "$@"
