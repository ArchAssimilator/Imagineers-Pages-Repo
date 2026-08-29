# How to rebuild `index.html` from `masterclass.html` after changes are made to the latter

Working document, written 29 August 2026. Not a published page. It is
`Disallow`ed nowhere yet, so add it to `robots.txt` alongside the other working
files if that matters.

## What this is for

`index.html` is a derived page. It is a copy of `masterclass.html` with four
blocks deleted, one block replaced by a button, and the head plus hero rewritten
to target the country-level term instead of the three city terms.

So the rule is: **change `masterclass.html` first, then re-derive `index.html`
by applying the deltas below.** Do not edit `index.html` independently and hope
the two stay in step. Verified against both files on 29 August 2026, when
`masterclass.html` was 1,476 lines and `index.html` was 1,103 lines.

## The two pages share a skeleton

Fifteen `<section>` elements, in the same order, with the same `id` values on
both pages:

`home`, `why-us`, `argument`, `day-two`, `security`, `shift`, `audience`,
`testimonials`, `facilitators`, `pricing`, `where`, `first-wednesday`, `ladder`,
the unnamed `section-dark` close, and `detail`.

Header, nav, lightbox, sticky bar and footer are byte-identical. If a section is
added to `masterclass.html`, it lands in `index.html` too, in the same place,
unless it is one of the deletions below.

## Delta 1: head and structured data

Nine values differ. Everything else in the head is identical.

| Field | `masterclass.html` | `index.html` |
| --- | --- | --- |
| `<title>` | GenAI Executive Masterclass: Johannesburg, Cape Town, Durban | AI Executive Training in South Africa \| Imagineers.ai |
| `description` | curriculum, module by module | country-level, "two days from school-grade to business-grade" |
| `canonical` | `.../masterclass.html` | `https://www.imagineers.ai/` |
| `og:title`, `og:description`, `og:url` | masterclass wording, masterclass URL | homepage wording, `https://www.imagineers.ai/` |
| `twitter:title`, `twitter:description` | masterclass wording | homepage wording |
| WebPage `@id`, `url`, `name`, `description` | `.../masterclass.html#webpage` | `https://www.imagineers.ai/#webpage` |
| WebPage `datePublished` | 2026-08-19 | 2025-11-17 |
| `Course` node | carries `"@id": ".../masterclass.html#course"` and `"url": ".../masterclass.html"` | **no `@id`**, and `"url": "https://www.imagineers.ai/"` |
| `FAQPage` `@id` | `.../masterclass.html#faq` | `https://www.imagineers.ai/#faq` |

The `Course` `@id` difference is deliberate and load-bearing. It is why the two
`Course` nodes do not collide. Keep it.

`Organization` and the two `Person` nodes are written by `sh/apply-brand.mjs` on
both pages, so never hand-copy them. `datePublished` and `dateModified` are
written by `sh/apply-dates.mjs` from `sh/page-dates.json`, so never hand-copy
those either.

## Delta 2: FAQ structured data has one fewer question

`masterclass.html` carries two `Question` nodes. `index.html` carries only the
first. The one dropped is **"Where does the GenAI Executive Masterclass run?"**,
because the homepage does not target the city terms.

## Delta 3: hero wording

Two lines differ inside the otherwise identical hero.

- The eyebrow label. Masterclass: "GenAI Executive Masterclass · Johannesburg,
  Cape Town, Durban". Index: "AI Executive Training in South Africa · Two Days ·
  Twelve Seats".
- The opening bold sentence of the lede. Masterclass: "This is the full two-day
  programme of the GenAI Executive Masterclass, the AI executive training
  Imagineers.ai runs in Johannesburg, Cape Town and Durban." Index:
  "Imagineers.ai runs AI executive training in South Africa: a two-day GenAI
  Executive Masterclass for senior leaders."

Everything else in the hero, including the proof strip and the Daily Maverick
card, is identical.

## Delta 4: the four argument panels are cut

Section `argument`. `masterclass.html` has five `<details class="act">` panels:

1. The whole of day one, on one board **(kept on the homepage)**
2. You are being treated like a school kid **(cut)**
3. You can get adult results with simple prompt structure **(cut)**
4. But business-grade results require expert methods **(cut)**
5. And you will still walk into context rot **(cut)**

The homepage keeps only the overview board. It also drops the final sentence of
the section lede, "Open any of them to see how we teach it.", because on the
homepage there is only one to open.

This is the single largest cut, about 200 lines. It is also why the homepage
does not carry the context-rot boards or the link to
`what-is-context-rot.html` from this section.

## Delta 5: the facilitator personality panel is cut

Section `facilitators`. The `<details class="act">` headed **"What we are like
for two days"**, with the caricature whiteboard inside it, exists only on
`masterclass.html`. The homepage ends the section after the combined credentials
list.

## Delta 6: "Where it runs" is short on the homepage

Section `where`. The masterclass version carries a three-city heading, a
three-card grid (Johannesburg, Cape Town, Durban) and a pricing note repeating
both fees. The homepage version replaces all of that with:

- Heading: "AI executive training across South Africa"
- One lede naming the three cities in a single sentence
- A single primary button: "See the Full Two-Day Programme" linking to
  `masterclass.html`
- No pricing note

The HTML comment above the section on each page explains the split. Keep both
comments accurate: the city terms are `masterclass.html`'s job, the country term
is the homepage's.

## Delta 7: three detail panels are cut

Section `detail`. `masterclass.html` has eleven `<details>` panels. `index.html`
has eight. The three cut are, in order:

1. The complete day one agenda (subject to change)
2. The complete day two agenda (subject to change)
3. How the agenda maps to business capability

The eight kept, in this order, are identical on both pages: Business work this
course helps reduce; How this becomes a team capability; What you take back to
work; Security, company data and the IT conversation; The working system; All
delegate feedback, unedited; Frequently asked questions. (That is seven titles
plus the three-column "Business work" table, which the homepage keeps.)

## The procedure

1. Make every change on `masterclass.html` first. Treat it as the source page.
2. Copy `masterclass.html` over `index.html`.
3. Re-apply Deltas 1, 2 and 3 (head, FAQ node, hero wording) from the tables
   above.
4. Delete the blocks named in Deltas 4, 5 and 7.
5. Replace the `where` section body per Delta 6.
6. Check the homepage still links to `masterclass.html` from the `where`
   section, because that button is the main route to the deep page.
7. Commit. The `pre-commit` hook then runs, in this order:
   `apply-stats` → `apply-brand` → `apply-dates` → `build-llms-full`.
8. Run `sh/check-stats.sh` before pushing. Part 4 rebuilds `llms-full.txt` in
   memory and compares byte for byte, so a stale copy fails the push.

## Things that will bite

- **Never hand-edit figures, the company description, the founder blocks or the
  dates on either page.** They come from `stats.json`, `brand-entity.json` and
  `sh/page-dates.json`. Copying the file wholesale is safe because the hooks
  rewrite both pages anyway.
- **Copying `masterclass.html` over `index.html` changes every line**, so
  `apply-dates` will stamp a new `modified` date on the homepage. That is
  correct when the content genuinely changed. It is wrong if you are only
  re-deriving to fix a typo on the deep page. In that case, hand-apply the one
  change to `index.html` instead of recopying.
- **The `Course` `@id`.** `masterclass.html` has one, `index.html` must not.
  Step 3 is easy to forget and the two nodes then collide.
- **Link to the homepage as `href="/"`, never `href="index.html"`.**
- Both pages carry the same footer. If you change it, change it on all pages.

## Open decision for the commitments work

The commitment mechanic (each day-two module ends in a written commitment,
captured in an app, printable for the sponsor) is being added to
`masterclass.html`. Decide before re-deriving:

- Does the homepage get the full commitment section, a shortened version, or
  only a line in the day-two lede?
- The homepage does not carry the day two agenda, so any commitment content that
  hangs off that agenda has to be self-contained to survive the copy.
- If a new FAQ answer about not selling consulting goes into the structured
  data, decide whether it belongs on both pages or only the deep page. The
  homepage currently carries one question, the deep page two.
