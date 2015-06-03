#!/bin/bash
#
# http://google-styleguide.googlecode.com/svn/trunk/shell.xml

readonly CWD=$(cd $(dirname $0); pwd)
readonly GLIZE_PATH="${CWD}/../glize"
readonly GLIZE_REPO="git@github.com:Datamart/Glize.git"

#
# Prints message.
# Arguments:
#   message - The message text to print.
#
function println() {
  printf "%s %0$(expr 80 - ${#1})s\n" "$1" | tr "0" "-"
}

#
# The main function.
#
function main() {
  println "[SYNC] ${GLIZE_PATH}:"
  if [ -d "$DIRECTORY" ]; then
    println "-- [REMOVE] ${GLIZE_PATH}"
    git rm -r --force --cached ${GLIZE_PATH}
  fi
  println "-- [ADD] ${GLIZE_PATH}"
  git submodule add --force ${GLIZE_REPO} ${GLIZE_PATH}
  println "-- [UPDATE] ${GLIZE_PATH}"
  git submodule update #--init --recursive
  #git submodule foreach git pull

  mkdir -p "${CWD}/../src/glize"
  cp -r ${GLIZE_PATH}/src "${CWD}/../src/glize"

  println "[WEB] Running linter:"
  chmod +x jslint.sh && ./jslint.sh

  println "[WEB] Running compiler:"
  chmod +x jsmin.sh && ./jsmin.sh

  println "[WEB] Done"
}

main "$@"
