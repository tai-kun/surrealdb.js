#!/usr/bin/env bash

set -e

npm i
npx playwright install-deps
npx playwright install
