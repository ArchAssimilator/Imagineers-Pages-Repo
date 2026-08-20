#!/usr/bin/env bash
#
# build-llms-full.sh
#
# Regenerates llms-full.txt from the published HTML pages.
#
# You do not normally run this. The pre-commit hook runs it for you, straight
# after sh/apply-stats.sh, so the figures it captures are already correct.
# Run it by hand if you edited page copy and want to see the result before
# committing, or if the pre-push check told you the file is stale.
#
#   sh/build-llms-full.sh            write llms-full.txt
#   sh/build-llms-full.sh --check    exit 1 if the file on disk is stale
#
set -euo pipefail
cd "$(dirname "$0")/.."
exec node sh/build-llms-full.mjs "$@"
