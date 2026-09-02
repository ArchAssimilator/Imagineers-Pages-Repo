# Imagineers.ai Website

Static site for Imagineers.ai. No frameworks, no build step. Published to
`www.imagineers.ai` via GitHub Pages (see `CNAME`).

## Pages

Ten live pages: four commercial, four definition explainers, and two reference
pages that are reachable from the footer only. The GenAI Executive Masterclass
is the front door and sits at the site root.

**Commercial**

| URL | File | Purpose | Search term it targets |
| --- | --- | --- | --- |
| `/` | `index.html` | GenAI Executive Masterclass: the full argument, agendas, whiteboards, testimonials, pricing and booking | AI executive training South Africa |
| `/masterclass.html` | `masterclass.html` | The same course at full length: every module, all twelve applied use cases, and where each cohort runs | AI executive training Johannesburg / Cape Town / Durban |
| `/caio.html` | `caio.html` | Fractional CAiO as a Service: executive-level AI direction | fractional CAiO |
| `/fde.html` | `fde.html` | Forward-Deployed Engineering: we come in and build it | forward deployed engineers, FDE |

**Explainers.** Definition pages aimed at being cited by ChatGPT, Claude,
Perplexity and Google AI Overviews rather than at ranking for geography. Each
carries `DefinedTerm` and `FAQPage` schema and links to its commercial page.

| URL | File |
| --- | --- |
| `/what-is-a-fractional-caio.html` | `what-is-a-fractional-caio.html` |
| `/what-is-a-forward-deployed-engineer.html` | `what-is-a-forward-deployed-engineer.html` |
| `/what-is-context-rot.html` | `what-is-context-rot.html` |
| `/ai-pipelines-vs-agents.html` | `ai-pipelines-vs-agents.html` |

**Reference.** Added 29 August 2026 for answer-engine optimisation. Deliberately
kept out of the nav to protect its simplicity, and reachable from the shared
footer, `sitemap.xml` and `llms.txt` only.

| URL | File | Purpose |
| --- | --- | --- |
| `/about.html` | `about.html` | The canonical entity page: category, both ICPs, the three differentiators, founding date, locations and both founder bios. Every author byline on the site links to its `#chris-barker` and `#rutger-jan-van-spaandonk` anchors |
| `/glossary.html` | `glossary.html` | Seventeen AI terms, one quotable sentence each, with `DefinedTermSet` schema. Links out to the four explainers |

Navigation order is deliberate: **train → direct → build**. Only the four
commercial pages are in the nav. `masterclass.html`, `about.html` and
`glossary.html` are not, but all three *are* linked from the shared footer on
every page.

### Retired URLs

`cpi.html`, `masterclass.html`, `contact.html` and `genaisl.html` used to be
meta-refresh stubs covering URLs published before the July 2026 rebuild. They
were deleted in August 2026 as unused. `cpi.html`, `contact.html` and
`genaisl.html` now 404, which is intended. Do not recreate them.

`masterclass.html` came back on 19 August 2026 as a real, indexable page. It
carries the full masterclass content; `index.html` is the shorter version. It is
kept out of the nav by design, but it is linked from the shared footer on all
eight pages and contextually from `index.html`, `fde.html` and three explainers,
so it is not orphaned.

## Assets

```
.
├── index.html               # Masterclass (home)
├── masterclass.html         # Masterclass, full version (not in nav, linked from footer)
├── caio.html                # Fractional CAiO as a Service
├── fde.html                 # Forward-Deployed Engineering
├── what-is-a-fractional-caio.html            # Explainer
├── what-is-a-forward-deployed-engineer.html  # Explainer
├── what-is-context-rot.html                  # Explainer
├── ai-pipelines-vs-agents.html               # Explainer
├── about.html               # Entity page (not in nav, linked from footer)
├── glossary.html            # AI glossary (not in nav, linked from footer)
├── brand-entity.json        # SINGLE SOURCE OF TRUTH for the company description
├── sh/page-dates.json       # SINGLE SOURCE OF TRUTH for every page's dates
├── prompts.json             # Tracked prompt set for AI visibility measurement
├── aeo-audit-report.md      # AEO audit, 29 Aug 2026
├── aeo-gaps.md              # What is left to do, in priority order
├── content-backlog.md       # Lane coverage gaps
├── citation-landscape.md    # Which domains the engines cite (empty until measured)
├── llms.txt                 # Site summary for AI crawlers (GENERATED from sh/llms.txt.tmpl)
├── masterclass-theme.css    # Base theme: nav, hero, footer, typography, all pages
├── masterclass-v2.css       # Additive layer: hero-pitch, endorse-card, claim-band, acts, boards, usecase grid
├── masterclass-theme.js     # Nav toggle, scroll state, reveal-on-scroll, all pages
├── stats.json               # SINGLE SOURCE OF TRUTH for the headline numbers
├── proof-stats.js           # Animates the proof strips only. Does NOT read stats.json, see its header
├── sh/stats-lib.mjs         # Shared by the writer and the checker: keywords, masking, formatting
├── sh/apply-stats.mjs       # Writes stats.json into the pages and renders llms.txt
├── sh/check-stats.sh        # Finds every figure that no longer matches stats.json
├── sh/apply.sh              # Runs all five generators in the load-bearing order. The hook runs this for you
├── sh/llms.txt.tmpl         # SOURCE for llms.txt. Holds {{courses}} etc. Edit this, not llms.txt
├── sh/page-meta.json        # SOURCE for every page title and description. Edit this, not the page
├── sh/apply-meta.mjs        # Writes page-meta.json into the head tags and the structured data
├── llms-full.txt            # GENERATED. Whole site as plain text, for AI crawlers
├── sh/build-llms-full.mjs   # Builds llms-full.txt from the pages. Do not hand-edit the output
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

In short: `stats.json` is the single source of truth. `sh/apply-stats.mjs`
writes it into every published file **at commit time**, so the deployed markup
is already correct. `proof-stats.js` does **not** fetch `stats.json`; it only
animates the numbers already in the markup, and the comment at the top of that
file explains why fetching them broke the site on 1 Aug 2026. GitHub Pages still
publishes `stats.json` at `https://www.imagineers.ai/stats.json` with
`access-control-allow-origin: *`, because the Executive Navigants site in the
other repo fetches it. That is its only consumer.

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

Two hooks make this automatic. `pre-commit` runs `sh/apply.sh`, which
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
  all eight.
- `<html lang="en-ZA">` and `og:locale=en_ZA` on every page. Keep them agreeing.
- **`llms-full.txt` is generated, never hand-edited.** The `pre-commit` hook
  rebuilds it from the pages, straight after `apply-stats`, and `pre-push`
  refuses the push if it has drifted. If you edit page copy, commit, and it is
  rebuilt for you. Details: `sh/build-llms-full.mjs`.
- **Two dates live in `stats.json`.** `verified` is when the headline figures
  were last checked and shows in the proof strip. `reviewed` is when the copy
  was last gone over and shows in the footer of every page. Both are bound with
  `data-stat`, so you change them in `stats.json` and nowhere else.
- Titles stay under 60 characters, meta descriptions between 140 and 158.
- Course transcripts and other source material stay out of the repo. Anything
  committed here is publicly fetchable (see `.gitignore`).

## License

© 2026 Imagineers.ai. All rights reserved.
