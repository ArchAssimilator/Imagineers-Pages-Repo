#!/usr/bin/env bash
#
# check-stats.sh
#
# Run this every time you change a number in stats.json.
#
# stats.json is the single source of truth, but a static site cannot data-bind
# a <meta> description or a JSON-LD block, so some figures are still typed out
# by hand. This script finds all of them and tells you which ones no longer
# agree with stats.json.
#
#   PART 1  Bound fallbacks.  data-stat / data-stat-text elements whose visible
#           text has drifted from stats.json. Crawlers and no-JS visitors see
#           the stale text, so these are hard errors.
#
#   PART 2  Hand-typed figures.  Every number written near the words courses,
#           executives, executive days or hours, in the pages and in llms.txt.
#           Also a hard error. A genuine false alarm is waived in place with an
#           inline  <!-- stats-ok: why -->  comment.
#
# Exits 1 if either part finds something. sh/hooks/pre-push runs this and
# refuses the push, which is the actual guard, since pushing is the deploy.
#
# Usage:  sh/check-stats.sh
#
set -euo pipefail
cd "$(dirname "$0")/.."
exec node sh/check-stats.mjs "$@"
