#!/usr/bin/env bash

set -eux

surrealdb_version="$1"
surrealdb_install_options=""

case "$surrealdb_version" in
latest)
    surrealdb_install_options=""
    ;;
alpha)
    surrealdb_install_options="--alpha"
    ;;
beta)
    surrealdb_install_options="--beta"
    ;;
*)
    surrealdb_install_options="--version $surrealdb_version"
    ;;
esac

curl -LsSf https://install.surrealdb.com | sh -s -- $surrealdb_install_options
