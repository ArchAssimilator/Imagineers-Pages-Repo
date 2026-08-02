# imagineers.ai: agent instructions

Static site. No frameworks, no build step, no package manager. Every file in
this folder is published as-is to `www.imagineers.ai` by GitHub Pages (see
`CNAME`). Structure, page inventory and conventions: [`README.md`](./README.md).

## 🚨 The headline numbers are a cross-repo single source of truth

`stats.json` in this folder is the **only** place the proof figures live:
courses run, executives trained, executive days, hours of hands-on use, both
course fees, and the "figures verified" date.

Two different websites read it:

1. **This site.** `sh/apply-stats.mjs` writes the values into every published
   file at commit time, via the `pre-commit` hook. `proof-stats.js` only
   animates what is already in the markup and must not fetch `stats.json`; the
   comment at the top of that file says why.
2. **Executive Navigants** (`../Executive-Navigants`, a completely separate repo
   and a separate deploy) fetches `https://www.imagineers.ai/stats.json` over
   HTTPS and refreshes itself. Nothing in this repo has to do anything for it,
   and nothing in that repo is run by hand.

**Rules:**

- **To change a figure, edit `stats.json` and commit. Nothing else.** The
  `pre-commit` hook rewrites the proof strips, `<meta>` descriptions, JSON-LD,
  prose and `llms.txt`, and stages them. The `pre-push` hook blocks the push if
  anything still disagrees. Hooks come from `sh/hooks` and are turned on per
  clone by `sh/install-hooks.sh`.
- **Never type a headline figure into `proof-stats.js`.** The numbers used to
  live in a `STATS` object there. That is exactly how the two sites drifted to
  600 versus 700 executives. Removed July 2026, do not reintroduce.
- **Never hand-edit a figure in the HTML.** It will be overwritten on the next
  commit, and if it is a number the tooling cannot anchor it will silently rot.
  Change `stats.json` instead.
- **Write figures as digits, never words.** "Seven hundred executives" cannot be
  found or rewritten by anything.
- **A number that tracks a stat but does not sit next to the word for it must be
  bound explicitly**, as `<span data-stat-text="courses">45</span>`. Otherwise
  Part 3 of the checker reports it as an `ORPHAN` and the push is blocked.
- **The two course fees are stats too**, `price` and `priceInHouse`. Do not type
  a Rand figure into `index.html` or `llms.txt`; edit `stats.json`. A stat with a
  `prefix` is money, which is what tells the tooling to write the "R" into the
  HTML but not into the JSON-LD `Offer`, and to keep fees and headcounts from
  ever being mistaken for each other.
- Adding a new stat means: add it to `stats.json`, then add a keyword for it to
  `KEYWORDS` in **both** `sh/check-stats.mjs` and `sh/apply-stats.mjs`. They must
  stay identical, and the keyword must be one no other stat can also match.
- **`sh/.stats-applied.json` is committed on purpose and must not be hand-edited.**
  It records which values are currently in the HTML, and it is the only way
  `apply-stats` can find an unlabelled figure in prose on the next change.

Full procedure, written for a human coming back to this cold:
**[`HOW-TO-UPDATE-THE-NUMBERS.md`](./HOW-TO-UPDATE-THE-NUMBERS.md)**. Read it
before changing a number, and keep it accurate if you change how any of this
works.

## Other rules

- **No em-dashes anywhere in copy.** Comma, colon, semicolon, period or
  parentheses instead. En-dashes are fine for numeric ranges.
- Absolute `https://www.imagineers.ai/...` URLs in `canonical`, `og:*` and
  `sitemap.xml`. Relative everywhere else.
- Every page carries the same `<footer>`. Change it in all of them or none.
- `masterclass-v2.css` loads after `masterclass-theme.css` and only adds new
  class names, so the base theme is never overridden by accident.
- Course transcripts and other source material stay out of this repo. Anything
  committed here is publicly fetchable.
- `cpi.html`, `masterclass.html`, `contact.html`, `genaisl.html` are `noindex`
  meta-refresh stubs that exist only so old URLs do not 404. Add no content.

## Local development

```bash
sh/start.sh          # serves on :80, falls back to :8080, opens a browser
```

Serve over HTTP, do not open `index.html` off disk. `file://` blocks the
`stats.json` fetch, and you will get the HTML fallback numbers plus a console
warning.
