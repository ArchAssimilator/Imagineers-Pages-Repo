#!/usr/bin/env bash
#
# apply-dates.sh
#
# Writes sh/page-dates.json into the pages, and bumps the last-updated date of
# any page whose own content has changed. The pre-commit hook runs this for
# you; run it by hand only if you want to see what it would do.
#
set -uo pipefail
cd "$(dirname "$0")/.."
exec node sh/apply-dates.mjs "$@"
