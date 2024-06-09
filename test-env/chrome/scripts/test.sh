#!/usr/bin/env bash

find tests -name '*.test.js' -print0 | while IFS= read -r -d '' file; do
    echo
    echo '================================================================================'
    echo "= $file"
    echo '================================================================================'
    echo

    node --enable-source-maps --test "$file"
done
