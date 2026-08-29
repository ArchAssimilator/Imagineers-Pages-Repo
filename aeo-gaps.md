# AEO gaps: what is left, in the order to do it

Written 29 August 2026, from `aeo-audit-report.md`.
Ordered by impact first, then effort. Everything a static repo could fix has
already been fixed and is not repeated here.

Each item says who has to do it, because most of what is left cannot be done by
an agent with repo access.

---

## G1. Make the off-site descriptions match the on-site one

**Impact: highest. Effort: 30 minutes. Owner: Chris or Rutger-Jan.**

Answer engines build their own version of a brand entity from every surface they
can find. When those surfaces disagree, confidence drops and the brand gets left
out of recommendations. The site is now internally consistent. The off-site
copy has not been checked.

Check each of these against the canonical description and fix any that disagree:

- LinkedIn company page "About" section
- Google Business Profile (claim it if it does not exist, and set the category
  to "Training centre" or "Business management consultant", not "Software company")
- Any Daily Maverick partner or presenter bio
- Any conference or association speaker bio for either founder
- Both founders' LinkedIn headlines and "About" sections

**Paste this, exactly, wherever a company description is asked for:**

> Imagineers.ai is a South African AI executive training provider, founded in
> August 2023 by Rutger-Jan van Spaandonk and Chris Barker. It teaches senior
> leadership teams to get business-grade work out of frontier AI, and takes
> fractional Chief AI Officer mandates and forward-deployed engineering work for
> the same clients.

**Where a shorter one is needed:**

> A South African AI executive training provider that also runs fractional Chief
> AI Officer mandates and forward-deployed engineering.

Word for word, both of them. A faithful paraphrase is still a second version.
The canonical strings live in `brand-entity.json`, so if the wording ever
changes, change it there first and re-copy.

Note on the Google Business Profile category: the site is currently readable as
a consultancy, which removes it from every "AI training" prompt. Getting the
category right is most of the value of this item.

---

## G2. Take the baseline measurement

**Impact: high. Effort: half a day, or an hour a month if scripted. Owner: Chris.**

`prompts.json` holds 44 prompts and nothing has been run against them.
Everything in section 5 of the audit fails for one reason: no reading has been
taken. Without a baseline there is no way to tell whether any of today's work
helped.

Do this first, before anything else in this file, because it also answers G1:

1. Run the four entity prompts (`en-01` to `en-04`) against ChatGPT, Claude,
   Perplexity and Gemini. Paste the verbatim answers into
   `citation-landscape.md`.
2. If any engine gets the category wrong, calls the company a consultancy, or
   cannot name the founders, that is fix priority one and it makes G1 urgent
   rather than housekeeping.
3. Then run the full set, three times per prompt per engine, and fill in the
   tables in `citation-landscape.md`.

Three runs, not one. The outputs are stochastic, and a single run is noise.

**Decision needed: tool or script.** A tracker (Profound, Peec, Scrunch and
similar) costs money and does the runs for you. A script in this repo hitting
the four APIs costs an afternoon to write and roughly nothing to run, and keeps
the results in git next to the prompts. Given this repo's existing habit of
generating everything from a single source of truth, the script fits better.
Say the word and it gets built as `sh/run-prompts.mjs`.

---

## G3. Get listed where the engines are already looking

**Impact: high. Effort: ongoing. Owner: Chris.**

The majority of what an answer engine cites is content the brand does not own.
Imagineers.ai currently has no presence on any independent surface that an
engine would treat as a source.

Cannot be prioritised properly until G2 tells us which domains actually get
cited for the South African AI training prompts. Do G2 first, then work the
target list it produces. In the meantime, the safe bets:

- Claim and complete the Google Business Profile (also G1).
- Get listed in any South African business school or corporate training
  directory that already ranks for "AI training South Africa".
- Ask Daily Maverick for a permanent, indexable page about the masterclass that
  names Imagineers.ai as the provider rather than only the ticket page.

**Do not post promotionally in Reddit or forum threads.** It is the single
fastest way to get an account banned and a domain distrusted, and the engines
weight community content precisely because it is not marketing. If community
contribution is worth doing, it is worth doing as genuine answers under a real
name, with no link, for months before any mention.

---

## G4. Get the founders quoted on sites that already get cited

**Impact: medium-high. Effort: ongoing. Owner: Chris and Rutger-Jan.**

Both founders have credentials that most AI commentators in South Africa do not.
None of that appears anywhere an engine can find, outside this site.

Same dependency: G2 first, to find out which domains get cited. Then pitch the
top three or four. The ask is a quote or a byline, not a link.

---

## G5. Add `audience` to the offer schema

**Impact: low-medium. Effort: 20 minutes. Owner: agent.**

`Course` on `index.html` and `masterclass.html`, and `Service` on `caio.html`
and `fde.html`, all carry `provider` and `offers` but no `audience`. Adding an
`Audience` node naming the ICP helps an engine decide the offer is right for the
person asking, which is exactly the judgement it makes when recommending.

Small, safe, and worth folding into `sh/apply-brand.mjs` so it comes from
`brand-entity.json` `audience` and cannot drift.

---

## G6. Measure Core Web Vitals

**Impact: low-medium. Effort: an hour. Owner: agent.**

Never measured. The site is static HTML on GitHub Pages, so it is probably
fine, but `bg4.png` is 774 KB and `og-imagineers.jpg` is 172 KB, and "probably
fine" is not a reading.

Record LCP, CLS and INP for all ten pages. If `bg4.png` is the LCP element on
mobile, convert it to AVIF or WebP, which will likely halve it.

---

## G7. Check the image alt text

**Impact: low. Effort: 20 minutes. Owner: agent.**

Logos and founder portraits have alt text. The whiteboard and lightbox images
in the `Whiteboards` folder and on `masterclass.html` have not been checked. Any
image carrying a fact that is not also in the text is a fact an engine cannot
read.

---

## What was already fixed, 29 August 2026

Listed so nobody re-does it:

- `brand-entity.json`, the single source of truth for the company description,
  category, ICPs, differentiators and lane. Written into every page by
  `sh/apply-brand.mjs`, enforced at push time by `sh/check-stats.sh` Part 4.
- `about.html`, the canonical entity page, with category, ICPs, differentiators,
  founding date, locations, both founder bios and a facts table. Footer-linked
  only, deliberately absent from the nav.
- `glossary.html`, seventeen terms with `DefinedTermSet` schema. Footer-linked
  only.
- Company schema completed everywhere: `alternateName`, `legalName`,
  `foundingDate`, two postal addresses, two contact points, `knowsAbout`.
- Both founders now carry `url`, `worksFor` and `sameAs` on every page, with the
  `url` pointing at their section of the about page. Every byline links to it.
- `Article` schema with `author`, `datePublished` and `dateModified` on the four
  explainers. `WebPage` with both dates on the other four. A `WebSite` node on
  all ten so `isPartOf` resolves.
- Visible published and updated dates on the six content pages, written from
  `sh/page-dates.json` and bumped automatically, per page, only when that page's
  own content changes in a commit.
- `robots.txt` extended from five AI crawlers to sixteen, with the reasoning
  written down.
- `sitemap.xml` and `llms.txt` extended to the two new pages, with a new entity
  section in `llms.txt` covering category, location, ICPs and differentiators.
- `prompts.json`, 44 tracked prompts across three ICPs and three journey stages,
  including six competitor benchmarks.
