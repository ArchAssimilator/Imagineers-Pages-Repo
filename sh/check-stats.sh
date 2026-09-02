#!/usr/bin/env bash
#
# check-stats.sh
#
# Proves every published file still agrees with the files that own its content.
# Run it after changing a number, a description, or any page copy. The pre-push
# hook runs it for you and refuses the push if it fails, which is the real
# guard: pushing this repo IS the deploy, so nothing downstream can catch a
# stale figure.
#
# Seven parts, in the same order sh/apply.sh writes them.
#
#   PART 1  Bound numbers.  Every data-stat slot, against stats.json.
#   PART 2  Figures nothing can find.  Numbers equal to a headline figure that
#           are neither bound nor written next to the word for it, so nothing
#           can ever move them.
#   PART 3  Who the company is.  The company block, the two founder blocks and
#           every data-brand slot, against brand-entity.json.
#   PART 4  Titles and descriptions.  Every <title>, the three description tags
#           and the matching strings in the structured data, against
#           sh/page-meta.json. The figures inside those strings come from
#           stats.json, which is how they stay exact without a data-stat
#           attribute, which an attribute value cannot carry.
#   PART 5  Page dates.  The visible published and last-updated dates, and
#           datePublished / dateModified in the structured data, against
#           sh/page-dates.json. Bumped automatically per page at commit time,
#           so a mismatch means someone typed one.
#   PART 6  llms.txt.  The index for AI crawlers, rendered from
#           sh/llms.txt.tmpl because plain text cannot carry an attribute.
#           Rebuilt in memory and compared. Edit the template, not the output.
#   PART 7  llms-full.txt.  The whole site as plain text, generated from the
#           pages. Rebuilt in memory and compared byte for byte, so a stale
#           copy, a hand-edit or a page changed after the last commit all show
#           up the same way.
#
# Parts 3 to 7 all work the same way: rebuild from the source of truth, compare,
# and complain about the difference. Nothing guesses.
#
# Exits 1 if any part finds something.
#
# Usage:  sh/check-stats.sh
#
set -uo pipefail
cd "$(dirname "$0")/.."

STATUS=0

node sh/check-stats.mjs "$@" || STATUS=1

printf '\n\033[2m── Part 3: company and founder details against brand-entity.json ──\033[0m\n'
node sh/apply-brand.mjs --check || STATUS=1

printf '\n\033[2m── Part 4: titles and descriptions against page-meta.json ─\033[0m\n'
node sh/apply-meta.mjs --check || STATUS=1

printf '\n\033[2m── Part 5: page dates against sh/page-dates.json ─────────\033[0m\n'
node sh/apply-dates.mjs --check || STATUS=1

printf '\n\033[2m── Part 6: llms.txt against its template ─────────────────\033[0m\n'
node sh/apply-stats.mjs --check || STATUS=1

printf '\n\033[2m── Part 7: llms-full.txt against the pages ───────────────\033[0m\n'
node sh/build-llms-full.mjs --check || STATUS=1

exit "$STATUS"
