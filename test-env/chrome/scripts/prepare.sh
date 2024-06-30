#!/usr/bin/env bash

set -e

# jq '.overrides.playwright = "~1.45.0"' package.json >package.json.tmp
# mv package.json.tmp package.json
npm i
# npx playwright install-deps
# npx playwright install
