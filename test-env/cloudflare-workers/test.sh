#!/usr/bin/env bash

set -ex

cp -r ../../tests ../shared/* .
echo '@jsr:registry=https://npm.jsr.io' >.npmrc
npm i
node directive.mjs
npx vitest
