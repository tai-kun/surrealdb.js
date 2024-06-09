#!/usr/bin/env bash

set -eu

target="$1"

npm ci
npm run build
node scripts/build/tests.js "$target" small
cp -r test-env/shared/. "$target"
(cd "$target" && bash scripts/prepare.sh)
