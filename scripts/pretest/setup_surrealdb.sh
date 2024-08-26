#!/usr/bin/env bash

set -eux

surrealdb_version="$1"
surrealdb_install_options=""

case "$surrealdb_version" in
latest)
    surrealdb_install_options=""
    ;;
nightly)
    surrealdb_install_options="--nightly"
    ;;
alpha)
    surrealdb_install_options="--alpha"
    ;;
beta)
    surrealdb_install_options="--beta"
    ;;
local)
    surrealdb_install_options="LOCAL"
    ;;
*)
    surrealdb_install_options="--version $surrealdb_version"
    ;;
esac

if [ "$surrealdb_install_options" != "LOCAL" ]; then
    curl -LsSf https://install.surrealdb.com |
        sh -s -- $surrealdb_install_options
elif [ -f ./surreal ]; then
    chmod +x surreal
    mv surreal /usr/local/bin/
else
    :
fi

which surreal
