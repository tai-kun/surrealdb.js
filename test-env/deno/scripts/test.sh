#!/usr/bin/env bash

c=0

while IFS= read -r -d '' file; do
    echo
    echo '================================================================================'
    echo "= $file"
    echo '================================================================================'
    echo

    if [[ "$file" == tests/medium/* ]]; then
        echo '| 警告:'
        echo '| Deno では全ミディアムテストがスキップされます。'

        continue
    fi

    deno test --allow-net --allow-env --allow-read --allow-run --trace-leaks "$file" || c=1
done < <(find tests -name '*.test.js' -print0)

exit $c
