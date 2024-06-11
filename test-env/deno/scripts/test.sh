#!/usr/bin/env bash

c=0

while IFS= read -r -d '' file; do
    echo
    echo '================================================================================'
    echo "= $file"
    echo '================================================================================'
    echo

    if [[ "$file" == 'tests/small/internal/timeoutSignal.test.js' || "$file" == tests/medium/* ]]; then
        echo '| 警告:'
        echo '| Deno は AbortSignal.timeout をリソースリークとして扱うため、必ずテストに失敗します。'
        echo '| 以下の問題が解決されるまでこのテストをスキップします。'
        echo '| Issue: https://github.com/denoland/deno/issues/20663'

        continue
    fi

    deno test --allow-net --trace-leaks "$file" || c=1
done < <(find tests -name '*.test.js' -print0)

exit $c
