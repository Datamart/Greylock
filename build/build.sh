#!/usr/bin/env bash

echo -n "Syncing with repo. "
cd ../ && svn up && cd build
./jslint.sh && ./jsmin.sh && ./jstest.sh && ./jsdoc.sh && ./propset.sh
