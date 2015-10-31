#!/bin/bash
#
# http://google-styleguide.googlecode.com/svn/trunk/shell.xml

readonly CWD=$(cd $(dirname $0); pwd)


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
  println "[SYNC] Syncing submodule:"
  chmod +x "${CWD}/jssync.sh" && "${CWD}/jssync.sh"
  println "[SYNC] Done"

  println "[BUILD] Running linter:"
  chmod +x "${CWD}/jslint.sh" && "${CWD}/jslint.sh"
  println "[BUILD] Running compiler:"
  chmod +x "${CWD}/jsmin.sh" && "${CWD}/jsmin.sh"
  println "[BUILD] Done"

  println "[DOC] Running jsdoc:"
  chmod +x "${CWD}/jsdoc.sh" && "${CWD}/jsdoc.sh"
  println "[DOC] Done"
}

main "$@"
