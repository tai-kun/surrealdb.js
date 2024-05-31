#!/usr/bin/env bash

set -ex

cp -r ../../tests ../shared/* .
echo '[install.scopes]' >>bunfig.toml
echo '"@jsr" = "https://npm.jsr.io"' >>bunfig.toml
bun i
node directive.mjs
bun test tests/unit/
