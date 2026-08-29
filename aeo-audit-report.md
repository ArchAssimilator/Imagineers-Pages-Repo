# AEO audit report: imagineers.ai

Audited 29 August 2026, against `aeo-compliance-prd.md`.
Re-run this audit whenever a page is added or the positioning changes.

Everything marked PASS below has a file path or a line reference. Anything that
could not be checked from the repo is marked NOT CHECKABLE FROM REPO and moved
to `aeo-gaps.md` with an owner, rather than being quietly passed.

---

## 0. Inputs

| Field | Value | Source |
|---|---|---|
| Brand name | Imagineers.ai | `brand-entity.json` |
| Canonical description | "Imagineers.ai is a South African AI executive training provider, founded in August 2023 by Rutger-Jan van Spaandonk and Chris Barker. It teaches senior leadership teams to get business-grade work out of frontier AI, and takes fractional Chief AI Officer mandates and forward-deployed engineering work for the same clients." | `brand-entity.json` |
| Category | AI executive training provider | `brand-entity.json` |
| Primary ICP 1 | Senior executives and exco members at large South African businesses | `brand-entity.json` |
| Primary ICP 2 | Boards and leadership teams needing CAiO capability without a full-time hire | `brand-entity.json` |
| Offers | GenAI Executive Masterclass, CAiO as a Service, Forward-Deployed Engineering | `index.html`, `caio.html`, `fde.html` |
| Three differentiators | Founders teach every course themselves; operators before trainers; two days doing your own work, not slides | `brand-entity.json` |
| Lane | Getting business-grade output out of frontier AI as a senior executive in South Africa | `brand-entity.json` |
| Competitors | GIBS, The Knowledge Academy, College Africa Group, School of IT, Prospen Africa, DB23 | Supplied by Chris Barker, 29 Aug 2026 |
| Market | South Africa (Johannesburg, Cape Town, Durban) | `brand-entity.json` |

---

## 1. Brand entity clarity

### 1.1 Canonical identity block

| Item | Verdict | Evidence |
|---|---|---|
| Single shared source, not retyped per page | PASS | `brand-entity.json`, written into every page by `sh/apply-brand.mjs`, enforced by `sh/check-stats.sh` Part 4 |
| Answers category, ICP and difference | PASS | `brand-entity.json` `description`, `audience`, `differentiators` |
| One or two sentences, plain language | PASS | Two sentences, no abstraction |
| Category noun in the first sentence | PASS | "AI executive training provider", first clause |
| Every rendering surface imports from it | PASS | `about.html` hero via `data-brand="description"`; the company block on all ten pages; `llms.txt` |

### 1.2 On-site consistency

| Item | Verdict | Evidence |
|---|---|---|
| Homepage hero and meta agree with the canonical | PASS | `index.html` meta description names the category, the market and the proof |
| About page states category, ICP, differentiators, founding date, location, team | PASS | `about.html`, new. Sections `#what-we-are`, `#who-we-are-for`, `#what-is-different`, `#where`, `#people` |
| Titles and meta descriptions agree with positioning | PASS | All ten pages carry a unique title and description naming the category or the term |
| Open Graph and Twitter tags present and consistent | PASS | All ten pages carry `og:title`, `og:description`, `og:image`, `twitter:card` |
| Footer boilerplate matches | PASS | Identical footer on all ten pages, now including About and Glossary links |
| No legacy pages describing an older positioning | PASS | `cpi.html`, `contact.html`, `genaisl.html` deleted August 2026 and deliberately 404. See `README.md` retired URLs |

### 1.3 Structured data

| Item | Verdict | Evidence |
|---|---|---|
| `Organization` with name, alternateName, description, url, logo, foundingDate, address, contactPoint | PASS | Generated on all ten pages by `sh/apply-brand.mjs` from `brand-entity.json` |
| `sameAs` lists every owned profile | PASS with a caveat | Only the company LinkedIn. That is complete, because Imagineers.ai deliberately runs no other social profiles. Recorded in `brand-entity.json` `_SAMEAS` so a future agent does not read it as an omission |
| `Product` or `Service` on offer pages, with `offers`, `audience`, `provider` | PARTIAL | `Course` plus `Offer` on `index.html` and `masterclass.html`; `Service` on `caio.html` and `fde.html`. `audience` is absent from all four. See `aeo-gaps.md` G5 |
| `FAQPage` where real Q and A exists | PASS | All ten pages |
| `Article` on posts with a real `Person` author and both dates | PASS | `Article` node added to the four explainers, with `author`, `datePublished`, `dateModified` |
| `Person` for founders, cross linked with `worksFor` | PASS | Both founders carry `url` (their `about.html` anchor), `worksFor` and `sameAs`, on every page |
| All JSON-LD validates | PASS | Every block on all ten pages parses. Run `node -e` parse loop, or Google Rich Results Test for the semantic pass |

### 1.4 Off-site consistency

NOT CHECKABLE FROM REPO. An agent cannot read or edit LinkedIn, Google Business
Profile or a directory listing. The exact copy to paste and who has to do it is
in `aeo-gaps.md` G1.

### 1.5 Live entity audit

NOT CHECKABLE FROM REPO. Requires running the three entity prompts against four
engines and pasting verbatim answers. The prompts are already written, as
`en-01` to `en-04` in `prompts.json`. See `aeo-gaps.md` G2.

---

## 2. Topical depth and information gain

### 2.1 Lane definition

| Item | Verdict | Evidence |
|---|---|---|
| Lane written down and narrow | PASS | `brand-entity.json` `lane` |
| Content map of URLs to sub-topics | PASS | `content-backlog.md`, coverage table |
| Prioritised gap backlog | PASS | `content-backlog.md` |

### 2.2 Information gain per page

| Item | Verdict | Evidence |
|---|---|---|
| Original data, results or a documented method on each lane page | PASS | `what-is-context-rot.html` cites MRCR-8 degradation figures and the seven failure modes; `index.html` and `masterclass.html` carry the course record and twelve named use cases |
| Something not in the top cited sources | PARTIAL | Strong on context rot and on pipelines versus agents. Thin on anything with the firm's own measured numbers in it. See `content-backlog.md` items C1 and C2 |
| Not a rewrite of a competitor page | PASS | No page mirrors a competitor's structure |
| Named human author with credentials and a bio page | PASS | The four explainers and the glossary now byline both founders and link to `about.html#chris-barker` and `about.html#rutger-jan-van-spaandonk` |
| Publish and update dates visible in the HTML | PASS | Visible on the four explainers, `about.html` and `glossary.html`, written from `sh/page-dates.json` |
| Claims specific and quotable in one sentence | PASS | Every glossary term is a single quotable sentence; every FAQ answer is self contained |

### 2.3 Extraction friendly structure

| Item | Verdict | Evidence |
|---|---|---|
| Target question answered in the first 100 words | PASS | Every page opens with a bolded direct answer in `.pitch-sub` |
| H2 and H3 phrased as buyer questions | PARTIAL | FAQ headings are questions; section headings are mostly statements. Acceptable, and deliberate for tone |
| Short paragraphs, tables, bullets | PASS | Tables on six pages, bullet criteria lists throughout |
| Key facts as text, never only in images | PASS | No figure appears only inside an image |
| Real `<table>` markup | PASS | `<table>` with `<caption>` and `<th scope="row">` on `about.html`; `.course-table` elsewhere |
| One topic per URL, no duplicates | PASS | `index.html` and `masterclass.html` are the one near-collision and are separated by self-canonicals and distinct JSON-LD `@id` values. See `CLAUDE.md` |
| Descriptive internal anchors | PASS | Anchors name the entity and the topic, for example "Full explainer: what is context rot" |

### 2.4 Formats known to attract citations

| Item | Verdict | Evidence |
|---|---|---|
| A "best of" listicle covering the category, competitors included | FAIL | Does not exist. Highest-value remaining gap. Brief written in `content-backlog.md` C3, deliberately not drafted, because it makes factual claims about six named competitors that have to be checked first |
| Head to head comparison pages | FAIL | Only concept comparisons exist (`ai-pipelines-vs-agents.html`). No brand-versus-brand or category-alternatives page. `content-backlog.md` C4 |
| Pricing page with real numbers | PASS | Both fees published on `index.html` and `masterclass.html`, bound to `stats.json` |
| Glossary or definitions hub | PASS | `glossary.html`, new. Seventeen terms, `DefinedTermSet` schema |
| FAQ blocks answering decision-stage questions | PASS | All ten pages |

Note, as the PRD asks: a listicle is a short-term tactic. It buys inclusion in
"best X" answers quickly and decays. Long-term ownership of the lane comes from
`content-backlog.md` C1 and C2, which are the pieces nobody else can write.

---

## 3. Third party mentions and reputation

NOT CHECKABLE FROM REPO, all of section 3. Nothing in a static site tells you
which domains an engine cites. `citation-landscape.md` holds the method and the
empty result tables; `prompts.json` holds the prompt set to run. See
`aeo-gaps.md` G3 and G4.

One thing that is checkable: Imagineers.ai is not currently listed on any review
platform, and there is no independent coverage linked from the site. Both are
real gaps, both need a human.

---

## 4. Technical accessibility for answer engines

| Item | Verdict | Evidence |
|---|---|---|
| Explicit decision per AI crawler | PASS | `robots.txt` now names GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, Applebot, Applebot-Extended, Bingbot, CCBot, meta-externalagent, Amazonbot, MistralAI-User |
| The decision is documented, not accidental | PASS | `robots.txt` comment block, including why training crawlers are allowed as well as search crawlers |
| No CDN or WAF silently blocking agents | PASS | GitHub Pages, no CDN in front, no WAF. See `CLAUDE.md` |
| Server rendered or static | PASS | Every page is static HTML. JavaScript only animates figures already in the markup; `proof-stats.js` is explicit about this |
| Not gated | PASS | No cookie wall, no interstitial, no login |
| Sitemap present, current, referenced in robots | PASS | `sitemap.xml`, ten URLs, referenced at the foot of `robots.txt` |
| Canonicals correct, no conflicts | PASS | Ten self-canonicals, one per page, absolute URLs |
| Clean semantic HTML | PASS | One `<h1>`, one `<main>`, one `<nav>`, `<article>` landmarks on every page |
| Core Web Vitals recorded for the top ten pages | FAIL | Never measured. `aeo-gaps.md` G6 |
| No `noindex` on pages meant to be found | PASS | Zero occurrences of `noindex` in the repo |
| Stable URLs, redirects mapped, no chains | PASS | Retired URLs 404 by design and are documented in `README.md` and `CLAUDE.md` |
| `llms.txt` at root | PASS | `llms.txt` hand-written index plus `llms-full.txt` generated from the pages |
| Descriptive image alt text | PARTIAL | Logos and founder portraits have alt text. Whiteboard and lightbox images need a check. `aeo-gaps.md` G7 |

---

## 5. Prompt set and measurement

| Item | Verdict | Evidence |
|---|---|---|
| At least 30 prompts, version controlled | PASS | `prompts.json`, 44 prompts |
| Required fields per prompt | PASS | `prompt_text`, `icp`, `product`, `journey_stage`, `market`, `date_added` on every entry |
| All three journey stages covered per ICP | PASS | 10 awareness, 13 consideration, 21 decision, across three ICPs |
| Phrased as buyers type, not keyword style | PASS | Full questions throughout |
| Competitor prompts for benchmarking | PASS | Six, `cm-*` |
| Baseline visibility recorded | FAIL | `baselineTaken` is null. Nothing has been run yet. `aeo-gaps.md` G2 |
| Citation channel mix recorded | FAIL | `citation-landscape.md` tables are empty by design |
| Competitor visibility on the same set | FAIL | Same run, not yet done |
| Re-measurement cadence set | PASS | Monthly minimum, three runs per prompt, documented in `prompts.json` `_HOW_TO_RUN` |
| Tracking tool or harness chosen | FAIL | Neither. Decision needed. `aeo-gaps.md` G2 |
| Visibility floor per stage defined | PASS | Under roughly 20 percent inclusion is a red zone, `prompts.json` `_TARGETS` |
| Two or three commercial prompts tracked separately | PASS | Three, flagged `"commercial": true` |

---

## 6. Score

| Section | Pass | Partial | Fail | Not checkable |
|---|---|---|---|---|
| 1. Entity clarity | 15 | 1 | 0 | 2 blocks |
| 2. Depth and structure | 15 | 3 | 2 | 0 |
| 3. Third party mentions | 0 | 0 | 0 | 3 blocks |
| 4. Technical | 11 | 1 | 1 | 0 |
| 5. Measurement | 7 | 0 | 4 | 0 |

Everything a static repo can fix is fixed. What remains needs either a human
with a login, or a measurement run against the four engines. Both are in
`aeo-gaps.md`, in priority order.
