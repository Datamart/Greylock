#!/usr/bin/env bash

#svn propset svn:executable on propset.sh

#svn cleanup
#svn add ../docs/* &
#svn add ../docs/*/* &
#svn add ../docs/*/*/* &

find "../src" -name "*.js" -print |
 sed 's/.*/ &/' |
  xargs svn ps 'svn:mime-type' 'text/javascript'

find "../tests" -name "*.js" -print |
 sed 's/.*/ &/' |
   xargs svn ps 'svn:mime-type' 'text/javascript'

find "../src" -name "*.html" -print |
 sed 's/.*/ &/' |
   xargs svn ps 'svn:mime-type' 'text/html'

find "../docs" -name "*.html" -print |
 sed 's/.*/ &/' |
  xargs svn ps 'svn:mime-type' 'text/html'
