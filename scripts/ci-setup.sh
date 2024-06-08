#!/usr/bin/env bash

set -eu

################################################################################
#
# Install SurrealDB
#
################################################################################

SURREALDB_INSTALL_OPTIONS=""

case "$SURREALDB_VERSION" in
latest)
    SURREALDB_INSTALL_OPTIONS=""
    ;;
beta)
    SURREALDB_INSTALL_OPTIONS="--beta"
    ;;
nightly)
    SURREALDB_INSTALL_OPTIONS="--nightly"
    ;;
*)
    SURREALDB_INSTALL_OPTIONS="--version $SURREALDB_VERSION"
    ;;
esac

set -x

curl -LsSf https://install.surrealdb.com | sh -s -- $SURREALDB_INSTALL_OPTIONS

################################################################################
#
# Install dependencies and build the project
#
################################################################################

npm ci
npm run build

################################################################################
#
# Prepare for running tests
#
################################################################################

seq 49152 65535 >/tmp/ports
touch /tmp/lock
