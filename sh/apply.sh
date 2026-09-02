#!/usr/bin/env bash
#
# apply.sh
#
# Writes every source of truth into every published file, in one go:
#
#   stats.json         the headline figures and the two course fees
#   brand-entity.json  who the company is, and the two founder blocks
#   sh/page-meta.json  every page title and description
#   sh/page-dates.json the published and last-updated date on each page
#   then llms-full.txt, the whole site as plain text for AI crawlers
#
# You do not normally run this. The pre-commit hook runs the same five steps
# for you, so editing a source file and committing is the whole job. Run it by
# hand when you want to see the changes before you commit.
#
# THE ORDER IS LOAD-BEARING. llms-full.txt is built from the HTML, so it has to
# run last or it captures the previous values of whatever just moved. And the
# three that edit pages have to run before apply-dates, because apply-dates
# asks git which pages changed in order to bump only those.
#
# Usage:  sh/apply.sh
#
set -euo pipefail
cd "$(dirname "$0")/.."

for step in apply-stats apply-brand apply-meta apply-dates build-llms-full; do
  node "sh/$step.mjs" "$@"
done
