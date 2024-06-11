#!/usr/bin/env bash

root="$(cd ../.. && pwd)"
sed "s|__ROOT__|file://$root|g" deno.json >deno.json.tmp
mv deno.json.tmp deno.json
