#!/usr/bin/env bash

(
    set -ex

    cp -r ../../tests ../shared/* ../shared/.swcrc .
    echo '@jsr:registry=https://npm.jsr.io' >.npmrc
    npm i
    node directive.mjs
)

find . -name '*.test.ts' -print0 | while IFS= read -r -d '' file; do
    echo '================================================================================'
    echo "= $file"
    echo '================================================================================'
    SWCRC=true \
        node --enable-source-maps \
        --import @swc-node/register/esm-register \
        --test "$file"
done
