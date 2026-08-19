# PRD: Maximum-Achievable SEO and AI SEO for imagineers.ai

**Status:** Ready to execute
**Written:** 2026-07-26
**Intended runtime:** A fresh Claude Code chat on Opus, in this repo
**Author of record:** Chris Barker

---

## 0. How to run this document

You are executing a four-phase SEO programme on a small static site. Each phase has
two halves: **run a skill to produce recommendations**, then **implement every
recommendation from that phase** before moving on. Do not read ahead and batch the
work. The output of each phase changes the input to the next.

Work through Phase 1 completely, then Phase 2, then Phase 3, then Phase 4.

**Checkpoints.** At the end of each phase, stop and report what changed before
starting the next phase. Within a phase, do not stop between the audit half and the
implementation half. Just do the work.

**Track it.** Create a task list at the start covering all four phases and their
implementation halves, and keep it current. This is a long run and the user needs to
see progress.

**The one hard gate:** Phase 4 creates new pages with new marketing copy. Present the
proposed page list and the draft copy for approval before publishing those pages.
Everything in Phases 1 to 3 is mechanical and can proceed without asking.

---

## 1. Current state (verified 2026-07-26, re-verify before trusting)

Static hand-written HTML. No build step, no framework, no package.json, no bundler.
Edits are made directly to `.html`, `.css` and `.js` files in the repo root.

**Deployment:** GitHub Pages, from `github.com/ArchAssimilator/Imagineers-Pages-Repo`,
served at `https://www.imagineers.ai` via the `CNAME` file. Anything committed to the
repo root becomes publicly fetchable.

**Live pages (3):**

| File | Title | Meta desc | Canonical | OG | JSON-LD |
|---|---|---|---|---|---|
| `index.html` | GenAI Executive Masterclass \| Imagineers.ai | yes | yes | 8 tags | 1 block: `Organization` + `Course` |
| `masterclass.html` | GenAI Executive Masterclass: The Full Two-Day Programme \| Imagineers.ai | yes | yes | 8 tags | 1 block: `Organization` + `Course` + `FAQPage` |
| `caio.html` | CAiO as a Service \| Imagineers.ai | yes | yes | 8 tags | **none** |
| `fde.html` | Forward-Deployed Engineering \| Imagineers.ai | yes | yes | 8 tags | **none** |

**Redirect stubs: none.** `masterclass.html`, `contact.html`, `cpi.html` and
`genaisl.html` were meta-refresh stubs until August 2026, when they were deleted
as unused. `contact.html`, `cpi.html` and `genaisl.html` still return 404, which
is the intended state.

`masterclass.html` was rebuilt as a real page on 19 August 2026 and is in
`sitemap.xml` at priority 0.9. It holds the full masterclass content;
`index.html` is a cut-back version of the same page. Both are indexable and
self-canonical, with distinct titles and meta descriptions. It is kept out of
the nav on purpose, so it has no inbound internal links and Google will crawl it
less often than a linked page. Its `Course` and `FAQPage` nodes use
`https://www.imagineers.ai/masterclass.html#course` and `#faq` so no `@id`
collides with the homepage.

**Known risk, accepted.** The two pages share most of their copy. Google may
consolidate them and suppress one. Watch Search Console for `index.html` or
`masterclass.html` reported as "Duplicate, Google chose different canonical". If
that happens, the fix is to cut more from `index.html` or canonicalise one to
the other.

Two canonical problems went with them. All four carried `noindex` alongside a
`rel=canonical`, a conflicting pair that can carry the `noindex` to the canonical
target, and the three homepage stubs canonicalised to `index.html` rather than
`/`, a one-hop chain. Fixed at the same time: internal links now use `href="/"`,
so `/index.html` is no longer advertised to crawlers.

**Assets:** `robots.txt` (allows all, points at sitemap), `sitemap.xml` (3 URLs, no
`lastmod`), `og-imagineers.jpg`, `og-masterclass.jpg`, `imagineers logo.webp`,
`DMlogo.png`, several `.avif` headshots, `Whiteboards/` (about 12 `.webp` course
slides), `sh/start.sh`, two `.csv` attendee files, `proof-stats.js`,
`masterclass-theme.{css,js}`, `masterclass-v2.{css,js}`.

**Known gaps going in:**

1. No JSON-LD at all on `caio.html` or `fde.html`
2. No `llms.txt`
3. No `FAQPage` schema anywhere, despite the core terms being question-shaped
4. No `hreflang` or `en-ZA` locale signal, despite South Africa being the core market
5. "fractional CAiO" does not appear in the CAiO page title
6. "forward deployed engineers" (unhyphenated) does not appear in the FDE page title
7. `sitemap.xml` has no `lastmod` values
8. Two `.csv` files with "named" in the filename sit in a publicly served repo root.
   Check whether these contain attendee personal data. If they do, that is a privacy
   problem, not an SEO one, and should be raised immediately rather than fixed quietly.

---

## 2. Objective

Extract the maximum realistic search and AI-search visibility from a three-page site,
without inventing content the business cannot stand behind.

**Target terms**, in priority order:

| Term | Primary page | Notes |
|---|---|---|
| AI executive training | `index.html` | Highest commercial intent. Usually qualified by location. |
| South Africa | modifier on all | Combines with every other term. The strongest differentiator. |
| fractional CAiO | `caio.html` | Emerging term, low volume, very low competition. Winnable. |
| forward deployed engineers | `fde.html` | Rising term. Mostly asked of LLMs rather than typed into Google. |
| FDE | `fde.html` | Ambiguous acronym. Never target bare. Always pair with the expansion. |

**Priority split.** Roughly 60% of effort to AI search visibility (getting cited by
ChatGPT, Claude, Perplexity, Google AI Overviews), 40% to classic ranking. Rationale:
"fractional CAiO" and "forward deployed engineer" are definitional terms that people
ask assistants to explain. Being the cited source is worth more than a blue link, and
is more achievable for a three-page site than out-ranking established competitors.

---

## 3. Constraints

**Copy:**

- **Never use em-dashes.** Not in page copy, headings, meta descriptions, schema
  strings, commit messages, or chat prose. Absolute rule. Rewrite with a comma,
  colon, semicolon, period, or parentheses. Strip any you encounter in existing copy
  you touch. En-dashes are fine for numeric ranges. Hyphens are fine.
- Match the existing voice: direct, operator-led, slightly combative toward
  conventional AI training. Read the live copy before writing any.
- **Never invent a factual claim.** The headline proof numbers (courses,
  executives, executive days, hours) live in `stats.json` and nowhere else. Read
  the current values from there, or run `sh/check-stats.sh` to print them, and
  reuse them exactly. Do not quote them in this document or any other, because a
  copy is a figure that goes stale. Do not round, inflate, extrapolate, or create
  new statistics. If a recommendation requires a fact the site does not already
  assert, flag it as a question for Chris rather than filling the gap.
- **Write figures as digits**, so `sh/check-stats.sh` can police them. "Seven
  hundred executives" is invisible to the checker and is how prose goes stale.

**Technical:**

- Do not introduce a build step, framework, bundler, or npm dependency.
- Do not restructure the CSS or redesign anything. This is an SEO programme, not a
  redesign. Visual output should be unchanged except where a phase explicitly adds
  visible content.
- Preserve existing URLs. Do not rename `caio.html` or `fde.html`. Inbound links and
  the existing canonical graph depend on them.
- Validate every JSON-LD block before committing. Malformed schema is worse than none.
- Test that pages still render after each phase.

**Process:**

- Commit at the end of each phase with a clear message. Do not push unless asked.
- The repo is on `main`. Branch before the first commit.

---

## 4. Phase 1: Technical and on-page audit

### 4a. Run the audit

Invoke the **`seo-audit`** skill.

Scope it to the three live pages plus `robots.txt` and `sitemap.xml`. Give it the five
target terms from section 2 as the target set, and tell it the site is static HTML on
GitHub Pages with no build step.

Ask it to cover: title and meta description quality against target terms, heading
hierarchy, canonical correctness, internal linking between the three pages, image alt
text, `sitemap.xml` and `robots.txt` correctness, redirect stub handling, crawlability,
and page performance signals.

Produce a written findings list, each item tagged **must-fix**, **should-fix**, or
**considered and rejected** with a reason.

### 4b. Implement

Fix every must-fix and should-fix. Expect the following, but let the audit lead:

- Work the target terms into titles and meta descriptions where it can be done without
  making the copy worse. Specifically evaluate "CAiO as a Service" becoming something
  carrying "fractional CAiO", and the FDE title carrying the unhyphenated
  "forward deployed engineers" alongside the current hyphenated form.
- Add `lastmod` to all three `sitemap.xml` entries.
- Add `Disallow: /SEO-PRD.md` to `robots.txt`, plus any other repo file that is served
  but should not be indexed. Check the `.csv` files and `Whiteboards/` here.
- Set `en-ZA` locale signalling. Consider `og:locale`, and `hreflang` only if it is
  genuinely correct for a single-locale site. Do not add hreflang cargo-cult style.
- Audit alt text on all images including the `Whiteboards/` slides and `.avif`
  headshots.
- Strengthen internal linking between the three pages using descriptive anchor text
  containing target terms.
- Fix the redirect stubs if the audit finds they leak crawl budget or send bad signals.

**Done when:** every must-fix is closed, every should-fix is closed or explicitly
rejected in writing, all three pages render correctly, and the sitemap and robots
files validate.

---

## 5. Phase 2: Structured data

### 5a. Run the schema skill

Invoke the **`schema`** skill.

Tell it: `index.html` already has a valid `@graph` containing `Organization`
(with `@id` `https://www.imagineers.ai/#organisation`, `areaServed: "ZA"`, and both
founders) and a `Course` with an `Offer`. Read that block first and extend the same
pattern. Do not duplicate or contradict the existing `Organization` node. Reference it
by `@id` from the other pages.

`caio.html` and `fde.html` have no structured data at all.

### 5b. Implement

Expect roughly this, but let the skill lead:

- `Service` schema on `caio.html` for the fractional CAiO offering, with `areaServed`
  South Africa and `provider` referencing the existing Organization `@id`.
- `Service` schema on `fde.html` for forward deployed engineering, same pattern.
- `FAQPage` schema on the relevant pages. This is the highest-value item in the phase,
  because the target terms are question-shaped. Candidate questions: "What is a
  fractional CAiO?", "What does a forward deployed engineer do?", "What is FDE in AI
  delivery?", "Who runs AI executive training in South Africa?". Every answer must be
  backed by copy that is actually visible on the page. Do not create FAQ schema for
  answers a visitor cannot read.
- `BreadcrumbList` if the audit found it warranted.
- Extend `Organization` with `sameAs` links to real LinkedIn and other verified
  profiles. Ask Chris for the URLs rather than guessing them.

Validate every block. Use Google's Rich Results Test and the Schema.org validator, or
at minimum parse each block as JSON and check required properties per type.

**Done when:** all three live pages carry valid JSON-LD, every block parses, no
duplicate or conflicting `@id` values exist across the site, and every FAQ answer in
schema is visible in the rendered page.

---

## 6. Phase 3: AI search optimisation

This is the highest-leverage phase for this business. Give it the most care.

### 6a. Run the AI SEO skill

Invoke the **`ai-seo`** skill.

Tell it the goal is citation by ChatGPT, Claude, Perplexity and Google AI Overviews for
definitional queries about fractional CAiO roles, forward deployed engineers, and AI
executive training in South Africa. The site is three pages of static HTML. There is no
`llms.txt`.

### 6b. Implement

- Create `llms.txt` at the repo root. This is the single clearest gap. Follow the
  current spec the skill describes rather than a remembered format.
- Evaluate Open Knowledge Format / knowledge bundle output if the skill recommends it
  and it can be served from a static root.
- Restructure page content for extractability: clear question-shaped headings, a direct
  answer in the first sentence beneath each, definitions that stand alone when quoted
  out of context. An LLM citing you will lift one or two sentences, so those sentences
  must be self-contained and must name the entity. "Imagineers.ai is a South African
  firm that..." beats "We are a firm that...".
- Ensure every distinctive claim is attributable and specific. Vague marketing copy does
  not get cited. Concrete, checkable statements do.
- Confirm `robots.txt` does not block AI crawlers you want citation from. Decide
  deliberately about `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended` and
  state the decision. Note that allowing training crawlers is a business choice, so
  surface it to Chris rather than deciding unilaterally.

**Done when:** `llms.txt` is live and correct, each of the three pages leads with a
self-contained entity-naming definition, and the AI crawler policy is explicitly decided
and documented.

---

## 7. Phase 4: Content strategy

### 7a. Run the content strategy skill

Invoke the **`content-strategy`** skill.

Frame the real constraint honestly: three pages cannot rank for five distinct term
clusters. The question is the minimum set of new pages that unlocks the remaining terms,
given a small team with no dedicated content resource. Bias hard toward few, excellent,
genuinely useful pages over volume.

### 7b. Gate

**Stop here.** Present to Chris:

1. The proposed page list with the target term for each
2. Why each page is needed and what query it answers
3. Draft copy or a detailed outline for each
4. An honest estimate of effort and ongoing maintenance

Get approval before creating any page. Do not publish new marketing copy unreviewed.

### 7c. Implement (after approval only)

Likely candidates, subject to what the skill and Chris decide:

- A definitional "what is a fractional CAiO" page
- A forward deployed engineer explainer that disambiguates the FDE acronym
- A South Africa AI executive training page consolidating the location signal

For each approved page: match existing design and CSS, add it to `sitemap.xml`, add
JSON-LD consistent with the Phase 2 graph, add it to `llms.txt`, and wire internal
links both ways with descriptive anchor text.

If new pages are added, briefly reconsider site architecture: navigation, hierarchy and
internal link graph. Invoke the **`site-architecture`** skill only if three or more new
pages are approved. Below that threshold it is overkill.

**Done when:** approved pages are live, in the sitemap, in `llms.txt`, carry valid
schema, and are linked from the existing pages.

---

## 8. Final verification

After all four phases:

1. Every page renders correctly and looks unchanged except for deliberate additions
2. Every JSON-LD block parses and validates
3. `sitemap.xml` lists every live page with `lastmod`, and no redirect stubs
4. `robots.txt` is correct and the AI crawler policy is deliberate
5. `llms.txt` is present and covers every live page
6. **Zero em-dashes across every file touched.** Grep for them and confirm.
7. Every factual claim traces to something the site already asserted
8. Changes are committed on a branch with clear messages

Then write a short closing report: what changed, what was deliberately not done and why,
and what remains blocked on content or information only Chris can supply.

---

## 9. Out of scope

- **`programmatic-seo`.** Built for generating hundreds of templated pages from a
  dataset. There is no dataset and there are five terms. Wrong tool.
- Redesign, restyling, or CSS restructuring.
- Backlink acquisition, outreach, and digital PR. Real levers, but off-site work, not
  this document.
- Paid search.
- Analytics and Search Console setup. Worth doing, but a separate task. Flag it in the
  closing report if it is not already in place, since none of this is measurable
  without it.

---

## 10. The honest ceiling

Say this plainly to Chris at the end rather than overselling the result.

Schema, `llms.txt`, metadata and internal linking are mechanical wins, and this document
will capture essentially all of them. That work is genuinely worth doing and it is the
part that can be finished.

But a three-page site has a low ceiling for competitive head terms. "AI executive
training" will not be won by markup. What this programme can realistically achieve is:
strong AI-search citation for the narrow definitional terms where competition is thin
and the site has genuine authority ("fractional CAiO", "forward deployed engineers"),
clean technical foundations with nothing broken or missing, and full extraction of the
South Africa geographic differentiator.

Beyond that, the constraint is content depth and off-site authority, neither of which is
solvable inside this repo. Phase 4 is where that ceiling becomes visible. Do not paper
over it.
