#!/usr/bin/env bash

set -ex

cp -r ../../tests ../shared/* ../shared/.swcrc .
echo '@jsr:registry=https://npm.jsr.io' >.npmrc
npm i
node directive.mjs
SWCRC=true \
    node --enable-source-maps \
    --import @swc-node/register/esm-register \
    --test 'tests/**/*.test.ts'
