#!/usr/bin/env bash

c=0

while IFS= read -r -d '' file; do
    echo
    echo '================================================================================'
    echo "= $file"
    echo '================================================================================'
    echo

    node --enable-source-maps --test "$file" || c=$?
done < <(find tests -name '*.test.js' -print0)

exit $c
