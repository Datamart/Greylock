#!/usr/bin/env bash

# https://developers.google.com/closure/compiler/

echo -n "Running compiler. "
COMPILED_JS="../bin/jscb.js"
JS_COMPILER_JAR="./lib/compiler.jar"
JS_SRC_PATH="../src"
JS_DOWNLOAD_URL="http://dl.google.com/closure-compiler/compiler-latest.zip"
WGET="`which wget`"
CURL="`which curl`"

if [ ! -f "${JS_COMPILER_JAR}" ]; then
    mkdir -p lib
    rm -rf tmp && mkdir tmp && cd tmp
    if [ -n "$WGET" ]; then
        $WGET "${JS_DOWNLOAD_URL}"
    else
        $CURL "${JS_DOWNLOAD_URL}" > ./compiler-latest.zip
    fi
    unzip compiler-latest.zip -d ../lib
    cd ../ && rm -rf tmp
fi

rm -rf "${COMPILED_JS}" && touch "${COMPILED_JS}" && chmod 0666 "${COMPILED_JS}"

python -c "import sys;sys.argv.pop(0);print(' --js ' + ' --js '.join(sorted(sys.argv, cmp=lambda x,y: cmp(x.lower(), y.lower()))))" `find "${JS_SRC_PATH}" -name "*.js" -print` |
    xargs java -jar "${JS_COMPILER_JAR}" \
      --compilation_level ADVANCED_OPTIMIZATIONS \
      --warning_level VERBOSE \
      --charset UTF-8 \
      --use_types_for_optimization \
      --externs externs.js \
      --js_output_file "${COMPILED_JS}"

echo "(function(){" | cat - $COMPILED_JS > /tmp/out && mv /tmp/out $COMPILED_JS
echo '})();' >> $COMPILED_JS

echo "Done"