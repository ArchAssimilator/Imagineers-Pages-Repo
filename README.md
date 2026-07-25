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

### Redirect stubs

`cpi.html`, `masterclass.html`, `contact.html` and `genaisl.html` are
`noindex` meta-refresh stubs kept only so previously published URLs and old
email signatures do not 404. They carry no content. Do not add any.

## Assets

```
.
├── index.html               # Masterclass (home)
├── caio.html                # CAiO as a Service
├── fde.html                 # Forward-Deployed Engineering
├── masterclass-theme.css    # Base theme: nav, hero, footer, typography, all pages
├── masterclass-v2.css       # Additive layer: hero-pitch, endorse-card, claim-band, acts, boards, usecase grid
├── masterclass-theme.js     # Nav toggle, scroll state, reveal-on-scroll, all pages
├── proof-stats.js           # The proof-strip numbers and count-up, all pages
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

The 60 courses / 700+ executives / 1,400 executive days / 6,500 hours figures
appear on all three pages. **Edit them in one place: the `STATS` object at the
top of `proof-stats.js`.**

Each proof item is wired one of three ways:

- `data-stat="executives"` is a shared fact. The value comes from `STATS` and
  counts up on scroll. The number in the HTML is the crawler and no-JS
  fallback; the script overwrites it and logs a console warning if the two have
  drifted, so update both.
- `data-count-to="2"` is a page-local number. It animates but is not a shared
  fact, so it stays out of `STATS`.
- No attribute means the slot is left alone. That is how a page swaps a number
  for a phrase, such as "Day 5" on the engineering page.

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
