# Imagineers.ai Website

Static site for Imagineers.ai. No frameworks, no build step. Published to
`www.imagineers.ai` via GitHub Pages (see `CNAME`).

## Pages

The GenAI Executive Masterclass is the front door and sits at the site root.

| URL | File | Purpose |
| --- | --- | --- |
| `/` | `index.html` | GenAI Executive Masterclass: the full argument, agendas, whiteboards, testimonials, pricing and booking |
| `/caio.html` | `caio.html` | CAiO as a Service: executive-level AI direction |
| `/fde.html` | `fde.html` | Forward-Deployed Engineering: we come in and build it |

Navigation order is deliberate: **train → direct → build**.

### Retired URLs

`cpi.html`, `masterclass.html`, `contact.html` and `genaisl.html` used to be
meta-refresh stubs covering URLs published before the July 2026 rebuild. They
were deleted in August 2026 as unused, and those four paths now 404. Do not
recreate them.

## Assets

```
.
├── index.html               # Masterclass (home)
├── caio.html                # CAiO as a Service
├── fde.html                 # Forward-Deployed Engineering
├── masterclass-theme.css    # Base theme: nav, hero, footer, typography, all pages
├── masterclass-v2.css       # Additive layer: hero-pitch, endorse-card, claim-band, acts, boards, usecase grid
├── masterclass-theme.js     # Nav toggle, scroll state, reveal-on-scroll, all pages
├── stats.json               # SINGLE SOURCE OF TRUTH for the headline numbers
├── proof-stats.js           # Reads stats.json, fills the proof strips, all pages
├── sh/check-stats.sh        # Finds every figure that no longer matches stats.json
├── masterclass-v2.js        # Whiteboard lightbox and sticky CTA. Home page only
├── Whiteboards/             # Course whiteboards used on the home page
├── og-masterclass.jpg       # 1200x630 social card for the home page
├── og-imagineers.jpg        # 1200x630 social card for caio and fde
├── sitemap.xml, robots.txt  # Referenced from robots.txt at the domain root
└── sh/start.sh              # Local static server, opens the site in a browser
```

`masterclass-v2.css` loads *after* `masterclass-theme.css` and only introduces
new class names, so the base theme is never overridden by accident.

## Local development

```bash
sh/start.sh          # serves on :80, falls back to :8080, opens a browser
```

Or `python3 -m http.server 8080` and open <http://localhost:8080>.

## Updating the headline numbers

The courses / executives / executive days / hours figures appear across the
pages here, in `llms.txt`, **and on the Executive Navigants landing page in a
separate repo.**

**Edit them in one place: `stats.json`. Then run `sh/check-stats.sh`.**

Nothing else quotes a value. This file deliberately does not repeat the current
numbers, because a README is the one place nobody thinks to update.

Full procedure, including the step that updates the other repo:
**[HOW-TO-UPDATE-THE-NUMBERS.md](./HOW-TO-UPDATE-THE-NUMBERS.md)**. Read it
before touching a figure.

In short: `stats.json` is the single source of truth. `proof-stats.js` fetches
it and fills in every `data-stat` slot. GitHub Pages publishes it at
`https://www.imagineers.ai/stats.json` with `access-control-allow-origin: *`,
which is how the other site reads it with no server involved.

Each proof item is wired one of four ways:

- `data-stat="executives"` is a shared fact in a proof strip. The value comes
  from `stats.json` and counts up on scroll. The number in the HTML is the
  crawler and no-JS fallback; the script overwrites it and logs a console
  warning if the two have drifted, so update both.
- `data-stat-text="executives"` is the same shared fact in running prose. Same
  value, no count-up animation.
- `data-count-to="2"` is a page-local number. It animates but is not a shared
  fact, so it stays out of `stats.json`.
- No attribute means the slot is left alone. That is how a page swaps a number
  for a phrase, such as "Day 5" on the engineering page.

Two hooks make this automatic. `pre-commit` runs `sh/apply-stats.sh`, which
writes `stats.json` into every published file and stages the result, so editing
the JSON and committing is the whole job. `pre-push` runs `sh/check-stats.sh`
and refuses the push if anything still disagrees, which matters because pushing
is the deploy here.

Install both once per clone with `sh/install-hooks.sh`.

Pages therefore show the shared facts that support their own argument and are
free to substitute their own final item. Nothing assumes four items.

## Conventions

- **No em-dashes anywhere in copy.** Use a comma, colon, semicolon, period or
  parentheses. En-dashes are fine for numeric ranges.
- Absolute `https://www.imagineers.ai/...` URLs in `canonical`, `og:*` and
  `sitemap.xml`. Relative everywhere else.
- Every page carries the same `<footer>` block. If you change it, change it in
  all three.
- Course transcripts and other source material stay out of the repo. Anything
  committed here is publicly fetchable (see `.gitignore`).

## License

© 2026 Imagineers.ai. All rights reserved.
