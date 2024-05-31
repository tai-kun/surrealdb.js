#!/usr/bin/env bash

set -ex

cp -r ../../tests ../shared/* .
echo '@jsr:registry=https://npm.jsr.io' >.npmrc
npm i
node directive.mjs --env browser
node browserify.js
node --enable-source-maps \
    --test 'tests/**/*.test.js'
