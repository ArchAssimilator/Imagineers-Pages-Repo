#!/usr/bin/env bash
#
# apply-stats.sh
#
# Writes stats.json into every published file: proof strips, meta
# descriptions, JSON-LD, prose and llms.txt.
#
# You do not normally run this. The pre-commit hook runs it for you, so
# editing stats.json and committing is the whole job. Run it by hand if you
# want to see the changes before you commit.
#
# Usage:  sh/apply-stats.sh
#
set -euo pipefail
cd "$(dirname "$0")/.."
exec node sh/apply-stats.mjs "$@"
