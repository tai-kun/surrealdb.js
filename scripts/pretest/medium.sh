#!/usr/bin/env bash

set -eu

target="$1"
surrealdb_version="$2"

npm ci
npm run build
node scripts/build/tests.js "$target" medium
cp -r test-env/shared/. "$target"
(cd "$target" && bash scripts/prepare.sh)

surrealdb_install_options=""

case "$surrealdb_version" in
latest)
    surrealdb_install_options=""
    ;;
beta)
    surrealdb_install_options="--beta"
    ;;
nightly)
    surrealdb_install_options="--nightly"
    ;;
*)
    surrealdb_install_options="--version $surrealdb_version"
    ;;
esac

curl -LsSf https://install.surrealdb.com | sh -s -- $surrealdb_install_options

seq 49152 65535 >/tmp/ports
touch /tmp/lock
