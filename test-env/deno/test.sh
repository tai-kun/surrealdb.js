#!/usr/bin/env bash

set -ex

cp -r ../../tests ../shared/* .
node directive.mjs
deno test tests/ --no-check -A
