# Agent Instructions

**Canonical instructions live in [`CLAUDE.md`](./CLAUDE.md).** Read that. This
file restates the non-negotiables so any tool that only reads `AGENTS.md` still
gets them.

1. **`stats.json` is the single source of truth for the headline proof numbers**
   (courses, executives, executive days, hours, verified date). Never type one
   of those figures into `proof-stats.js`. They lived there until July 2026 and
   it is why this site said 700 while Executive Navigants said 600.
2. **To change a figure, edit `stats.json` and commit. Nothing else.** The
   `pre-commit` hook runs `sh/apply.sh`, which rewrites every published
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
   `sh/apply.sh`. Editing it directly is pointless: the next commit
   overwrites it.
6. **`brand-entity.json` is the single source of truth for who this company
   is**: the canonical description, the category noun, the ICPs, the three
   differentiators, the founding date and the founder details. `pre-commit`
   runs `sh/apply.sh`, which writes it into the `Organization` and
   `Person` blocks on every page and into any `data-brand` slot. `pre-push`
   blocks on drift. Never hand-edit a company or founder block in a page's
   JSON-LD, and never put a headline figure in `brand-entity.json`.
7. **Page dates are stamped automatically and must not be typed.**
   `sh/page-dates.json` is the source; `sh/apply.sh` writes the visible
   byline and the `datePublished` / `dateModified` in the schema. The
   last-updated date is bumped **per page, only when that page's own content
   changed in that commit**, read from git. Do not change this to stamp every
   page on every push: a site where all ten pages claim to be updated because
   one typo was fixed is telling Google its dates are noise. A new page must be
   added to `sh/page-dates.json` or it is silently skipped.
8. **`about.html` and `glossary.html` stay out of the top nav.** Footer, sitemap
   and `llms.txt` only. That is a deliberate constraint, not an oversight.
9. **Never invent competitor facts, prompts, ICPs or citation data.**
   `citation-landscape.md` is empty until a human runs the prompts, and
   `content-backlog.md` C3 needs six competitors' published material checked
   first. `prompts.json` is a measuring instrument and is never posted anywhere.
10. **A second repo consumes these numbers.** `../Executive-Navigants` fetches
   `https://www.imagineers.ai/stats.json` over HTTPS and refreshes itself. There
   is nothing to run there, and nothing here to do for it.
11. **No em-dashes anywhere in copy.** Comma, colon, semicolon, period or
   parentheses. En-dashes are fine for numeric ranges.
12. **Everything committed here is published.** No transcripts, no client
   material, no secrets.

Static site, no build step. Serve locally with `sh/start.sh` over HTTP, never
`file://`. Full procedure for the numbers:
[`HOW-TO-UPDATE-THE-NUMBERS.md`](./HOW-TO-UPDATE-THE-NUMBERS.md).
