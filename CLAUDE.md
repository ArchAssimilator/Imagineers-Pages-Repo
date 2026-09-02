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
  Part 2 of the checker reports it as an `ORPHAN` and the push is blocked.
- **The two course fees are stats too**, `price` and `priceInHouse`. Do not type
  a Rand figure into `index.html` or `llms.txt`; edit `stats.json`. A stat with a
  `prefix` is money, which is what tells the tooling to write the "R" into the
  HTML but not into the JSON-LD `Offer`, and to keep fees and headcounts from
  ever being mistaken for each other.
- Adding a new stat means: add it to `stats.json`, then add a keyword for it to
  `KEYWORDS` in `sh/stats-lib.mjs`. One place, since 2 September 2026. The
  writer and the checker both import that file, so they can no longer hold
  different ideas of what counts as a figure. The keyword must still be one no
  other stat can also match.
- **Two dates live in `stats.json` too.** `verified` is when the headline
  figures were last checked and shows in the proof strip. `reviewed` is when
  the copy was last gone over and shows in the footer of every page. Both are
  plain strings, both are bound with `data-stat`, and neither needs a
  `KEYWORDS` entry, because `apply-stats` never does arithmetic on a string.
- **Nothing is located by its own value any more.** `sh/.stats-applied.json` and
  the pass that used it were deleted on 2 September 2026. That pass found a
  hand-typed figure by remembering the previous value and looking for it near a
  keyword, which needed a committed state file and was the fragile half of the
  system. Every figure now has an explicit home: a `data-stat` slot in the
  markup, a `{{token}}` in `sh/llms.txt.tmpl`, or a `{{token}}` in
  `sh/page-meta.json` reached by a structural anchor. **Do not reintroduce a
  value-matching pass.** If a new figure cannot be bound in the markup, give it
  an anchor in `sh/page-meta.json` instead.
- **Every figure in prose must be bound.** There is no fallback that will catch
  it otherwise; Part 2 of the checker will simply block the push. Three
  attributes, and the third matters: `data-stat` and `data-stat-text` write the
  full value ("815+", "R21,500"), while **`data-stat-num` writes the grouped
  number only, no prefix and no suffix**. Prose says both "815+ senior
  executives trained" and "815 executives have shown us", and forcing the suffix
  into the second would edit published copy to suit the tooling. Wrap it by
  hand, then run `sh/check-stats.sh` to confirm the orphan is gone.
  (`sh/bind-figures.mjs` did this automatically. It was a one-off, it has been
  run, and it was deleted on 2 September 2026.)

Full procedure, written for a human coming back to this cold:
**[`HOW-TO-UPDATE-THE-NUMBERS.md`](./HOW-TO-UPDATE-THE-NUMBERS.md)**. Read it
before changing a number, and keep it accurate if you change how any of this
works.

## 🚨 `brand-entity.json` is the single source of truth for who this company is

`stats.json` owns the numbers. `brand-entity.json` owns the identity: the
canonical one-paragraph description, the category noun, the two ICPs, the three
differentiators, the lane, the founding date, the addresses, the founder details
and the `sameAs` list.

- **To change how the company is described, edit `brand-entity.json` and
  commit.** `sh/apply-brand.mjs` writes it into the `Organization` node and the
  two `Person` nodes in the structured data on **every** page, and into any
  visible element carrying `data-brand="description"`. `sh/check-stats.sh`
  Part 4 blocks the push if anything disagrees.
- **Never hand-edit the company block or a founder block in a page's JSON-LD.**
  It is overwritten on the next commit. Same rule as the figures.
- **It contains no headline figures, deliberately.** Those belong to
  `stats.json`. A number in both files is two sources of truth for one fact, and
  they will drift.
- The merge rule is: canonical fields win, page-specific fields survive. That is
  why `about.html` can carry a longer bio on each founder while every page still
  gets the same name, `url`, `jobTitle`, `worksFor` and `sameAs`.
- `apply-brand` splices the replacement node into the exact character span of
  the old one rather than reserialising the whole JSON-LD block. Keep it that
  way. Reformatting every block would make every page look changed, and
  `apply-dates` reads "changed" as "content updated" and would stamp a new date
  on all of them.

## 🚨 `page-meta.json` owns every title and description

`stats.json` owns the numbers, `brand-entity.json` owns the identity, and
`sh/page-meta.json` owns each page's title and its three descriptions.

- **To change a page title or description, edit `sh/page-meta.json`.**
  `sh/apply-meta.mjs` writes the title into `<title>`, `og:title` and
  `twitter:title`, the description into `<meta name="description">` and the
  `WebPage` node, and the two social descriptions into their own tags. One
  sentence, stored once, instead of the four hand-kept copies it replaced.
- **It carries `{{tokens}}`, not digits.** `{{courses}}`, `{{executives}}`,
  `{{execDays}}`, `{{hours}}`, `{{price}}` and `{{priceInHouse}}` are filled
  from `stats.json`. This is how the 23 figures that live inside `<meta>`
  attributes and JSON-LD strings are kept exact, because neither can carry a
  `data-stat` attribute.
- **Every string is found by an anchor with no number in it**: a tag, an
  attribute selector, a JSON-LD `@id`, or a question. That is the whole point.
  An anchor that contained the figure would need to know the previous value,
  which is the state file we just deleted.
- **A JSON-LD string that carries a figure and is not a title or description
  goes in the page's `schema` block**, keyed `node:<@id>` or `faq:<question>`.
  Three exist today: the CAiO service node, and the fee answer on `terms.html`,
  and the "who runs this" answer on the two masterclass pages.
- **The `Offer` price is not stored there.** It is always `stats.price` as bare
  digits, no R and no comma, because schema.org rejects both. `apply-meta`
  writes it straight from `stats.json`.
- Never type a title or description into a page. `sh/check-stats.sh` Part 4
  blocks the push.

## 🚨 Page dates are stamped automatically, per page, on change

`sh/page-dates.json` holds a published and a last-updated date for every page.
`sh/apply-dates.mjs` writes both into the visible byline (`data-page-date`) and
into `datePublished` / `dateModified` in the structured data.

- **Never type a date into a page.** `sh/check-stats.sh` Part 5 blocks the push.
- **`modified` is bumped automatically at commit time, and only for pages whose
  own content changed in that commit.** Which pages changed is read from git.
- **Do not "improve" this into stamping every page on every push.** It is the
  obvious change and it is wrong. Pushing this repo publishes it, so a push that
  fixes one typo would tell Google that all ten pages were updated that day. Do
  that for a few months and the dates stop carrying information, at which point
  the engines ignore them, and an ignored date cost credibility to earn.
- **`published` is written once and never touched again.** `apply-dates` fills
  it with the commit date only if it is missing.
- Store ISO dates only. The human form in the byline and the ISO form in the
  JSON-LD are two renderings of one stored value, so they cannot disagree.
- Adding a page means adding it to `sh/page-dates.json`, or `apply-dates`
  ignores it. Adding a page that is on disk but not in that file is silent;
  listing a page that is not on disk is a hard error.

## The AEO audit files are working documents, not published pages

`aeo-audit-report.md`, `aeo-gaps.md`, `content-backlog.md`,
`citation-landscape.md` and `prompts.json` are the answer-engine optimisation
working set, written 29 August 2026. They are `Disallow`ed in `robots.txt` but
they are still publicly fetchable, like everything else in this repo, so nothing
client-confidential goes in them.

- `aeo-gaps.md` is the live to-do list. Read it before starting AEO work.
- `prompts.json` is a measuring instrument, not content. Nothing in it is ever
  posted anywhere. Posting prompt-shaped content into communities to influence
  an answer is what gets accounts banned and domains distrusted.
- `citation-landscape.md` is empty until someone runs the prompts. Do not fill
  it with guesses, and do not let an agent invent citation data.
- Never invent a competitor's offer, price or format. `content-backlog.md` C3
  depends on six competitors' published material being checked by a human first.

## Both `llms` files are generated, never written

Neither of these is edited directly. `llms.txt` is the short index for AI
crawlers; `llms-full.txt` is every published page as one plain-text file, so an
assistant reads the whole site in a single fetch.

- **`llms.txt` is rendered from `sh/llms.txt.tmpl` by `sh/apply-stats.mjs`.**
  Changed 2 September 2026. It used to be hand-written, which meant its figures
  were kept current by searching its prose for the previous value. Plain text
  cannot carry a `data-stat` attribute, so the template holds `{{courses}}`,
  `{{executives}}` and the rest where the numbers go, and there is nothing left
  to guess. **Edit the template. `llms.txt` is output.**
- **`llms-full.txt` is built by `sh/build-llms-full.mjs` from the HTML**, and
  the page list comes from `sitemap.xml`, so adding a page to the sitemap adds
  it here too.
- **The `pre-commit` hook rebuilds them in order.** The order is load-bearing:
  `apply-stats` (figures, and `llms.txt`) → `apply-brand` (identity) →
  `apply-dates` (dates) → `build-llms-full` (plain text of the corrected HTML).
  Move anything above `build-llms-full` and it captures the previous values.
- **`sh/check-stats.sh` rebuilds both in memory and compares byte for byte**,
  `llms.txt` in Part 6 and `llms-full.txt` in Part 7. A hand-edit, a stale copy
  or a page changed after the last commit all fail the same way, and `pre-push`
  refuses the push.
- **Do not hand-edit either file.** The next commit overwrites both.
- Neither carries dates of its own. The reviewed date they print is read out of
  the footer, which is bound to `stats.json`.

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
- `cpi.html`, `contact.html` and `genaisl.html` were meta-refresh stubs for
  pre-rebuild URLs. Deleted as unused, August 2026. Those paths 404 by design.
  Do not recreate them.
- `about.html` and `glossary.html` were added on 29 August 2026 as the entity
  page and the definitions hub. Both are **deliberately kept out of the nav** and
  reachable only from the shared footer, the sitemap and `llms.txt`. That was
  Chris's explicit constraint: the top nav stays at four items. Do not add them
  to it.
- `masterclass.html` was also one of those stubs, deleted at the same time. It
  was **rebuilt as a real page on 19 August 2026**, holding the full masterclass
  content while `index.html` is cut back. It is indexable, self-canonical, and
  deliberately absent from the nav menu; `sitemap.xml` and `llms.txt` are its
  only discovery routes. Its `Course` and `FAQPage` JSON-LD nodes carry
  `masterclass.html#` `@id` values so they never collide with the homepage's.
- If a redirect stub is ever needed again: give it a `rel=canonical` pointing at
  the **final** destination URL and no `noindex`. The two together are a
  conflicting signal, and an honoured canonical can carry the `noindex` to its
  target. A canonical aimed at a URL that is itself canonicalised is a chain.
- **Link to the homepage as `href="/"`, never `href="index.html"`.** GitHub Pages
  serves `/index.html` as a real 200 duplicate of `/`, so linking to it invites
  Google to crawl it and file it under "Alternative page with proper canonical
  tag" in Search Console. Fixed August 2026, do not reintroduce.

## Local development

```bash
sh/start.sh          # serves on :80, falls back to :8080, opens a browser
```

Serve over HTTP, do not open `index.html` off disk. `file://` blocks the
`stats.json` fetch, and you will get the HTML fallback numbers plus a console
warning.
