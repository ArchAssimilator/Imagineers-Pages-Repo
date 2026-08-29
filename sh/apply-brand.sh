#!/usr/bin/env bash
#
# apply-brand.sh
#
# Writes brand-entity.json into the company block, the founder blocks and any
# data-brand slot on every page. The pre-commit hook runs this for you.
#
set -uo pipefail
cd "$(dirname "$0")/.."
exec node sh/apply-brand.mjs "$@"
