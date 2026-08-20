#!/usr/bin/env bash
#
# check-stats.sh
#
# Run this every time you change a number in stats.json, or any page copy.
#
# stats.json is the single source of truth, but a static site cannot data-bind
# a <meta> description or a JSON-LD block, so some figures are still typed out
# by hand. This script finds all of them and tells you which ones no longer
# agree with stats.json. It then checks the generated plain-text copy of the
# site is still in step with the pages it was built from.
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
#   PART 3  Figures nothing can find.  Numbers equal to a headline figure that
#           are neither bound nor written next to the word for it.
#
#   PART 4  llms-full.txt.  The whole site as plain text for AI crawlers,
#           generated from the pages by sh/build-llms-full.mjs. Rebuilt in
#           memory and compared byte for byte, so a stale copy, a hand-edit or
#           a page that changed after the last commit all show up the same way.
#
# Exits 1 if any part finds something. sh/hooks/pre-push runs this and refuses
# the push, which is the actual guard, since pushing is the deploy.
#
# Usage:  sh/check-stats.sh
#
set -uo pipefail
cd "$(dirname "$0")/.."

STATUS=0

node sh/check-stats.mjs "$@" || STATUS=1

printf '\n\033[2m── Part 4: llms-full.txt against the pages ───────────────\033[0m\n'
node sh/build-llms-full.mjs --check || STATUS=1

exit "$STATUS"
