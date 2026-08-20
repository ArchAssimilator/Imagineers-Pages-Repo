# Agent Instructions

**Canonical instructions live in [`CLAUDE.md`](./CLAUDE.md).** Read that. This
file restates the non-negotiables so any tool that only reads `AGENTS.md` still
gets them.

1. **`stats.json` is the single source of truth for the headline proof numbers**
   (courses, executives, executive days, hours, verified date). Never type one
   of those figures into `proof-stats.js`. They lived there until July 2026 and
   it is why this site said 700 while Executive Navigants said 600.
2. **To change a figure, edit `stats.json` and commit. Nothing else.** The
   `pre-commit` hook runs `sh/apply-stats.sh`, which rewrites every published
   file, including meta descriptions, JSON-LD, prose and `llms.txt`, and stages
   them. The `pre-push` hook runs `sh/check-stats.sh` and blocks the push if
   anything disagrees. Turn the hooks on per clone with `sh/install-hooks.sh`.
3. **Never hand-edit a figure in the HTML.** It gets overwritten on the next
   commit. Write figures as digits, never words.
4. **A number that tracks a stat but is not next to the word for it must be
   bound**, as `<span data-stat-text="courses">45</span>`, or the checker
   reports it as an `ORPHAN` and blocks the push.
5. **`llms-full.txt` is generated, never hand-written.** `pre-commit` rebuilds
   it from the published pages, immediately after `apply-stats`, and `pre-push`
   blocks the push if it is stale. Regenerate by hand with
   `sh/build-llms-full.sh`. Editing it directly is pointless: the next commit
   overwrites it.
6. **A second repo consumes these numbers.** `../Executive-Navigants` fetches
   `https://www.imagineers.ai/stats.json` over HTTPS and refreshes itself. There
   is nothing to run there, and nothing here to do for it.
7. **No em-dashes anywhere in copy.** Comma, colon, semicolon, period or
   parentheses. En-dashes are fine for numeric ranges.
8. **Everything committed here is published.** No transcripts, no client
   material, no secrets.

Static site, no build step. Serve locally with `sh/start.sh` over HTTP, never
`file://`. Full procedure for the numbers:
[`HOW-TO-UPDATE-THE-NUMBERS.md`](./HOW-TO-UPDATE-THE-NUMBERS.md).
