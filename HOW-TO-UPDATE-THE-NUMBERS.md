# How to update the headline numbers

> **The whole procedure:**
>
> ```bash
> # 1. edit stats.json
> git commit -am "Update headline numbers"
> git push
> ```
>
> That is all of it. The commit rewrites every published file from
> `stats.json`, the push refuses to go out if anything disagrees, and the push
> is the deploy. You do not touch the HTML.

## What happens when you commit

`sh/hooks/pre-commit` runs `sh/apply-stats.sh`, which writes the new values
into the proof strips, the `<meta>` descriptions, the JSON-LD blocks, the prose
and `llms.txt`, then stages what it changed. `sh/hooks/pre-push` then runs
`sh/check-stats.sh` and blocks the push if a single figure is out of step.

Both hooks come from `sh/hooks`, which is version controlled. Turn them on once
per clone with `sh/install-hooks.sh`. Without that one command none of this is
automatic, so if you ever clone this repo fresh, run it.

The numbers in question are:

| Name in `stats.json` | Where it shows up |
| --- | --- |
| `courses` | "Two-day courses delivered" |
| `executives` | "Senior executives trained" |
| `execDays` | "Executive days of instruction" |
| `hours` | "Hours of hands-on GenAI, per facilitator" |
| `price` | The open-enrolment fee, "R21,500 incl VAT per person" |
| `priceInHouse` | The private-team fee, "R215,000 ex VAT" |
| `verified` | "Figures verified …" under the strip |

The current values are in `stats.json` and nowhere else, including here. Run
`sh/check-stats.sh` to print them.

## Where they live

```
imagineers_ai/stats.json          <-- THE ONE FILE YOU EDIT
        |
        |-- sh/apply-stats.sh writes it into every published file here,
        |   at commit time, via the pre-commit hook
        |
        |-- proof-stats.js also reads it in the browser, so a visitor on a
        |   cached page still sees the current number
        |
        |-- published at https://www.imagineers.ai/stats.json by GitHub Pages
                |
                |-- Executive-Navigants reads it over HTTPS
                    (see "The other repo" below)
```

There are **two consumers in two different repos**. This is the only reason the
numbers are in a JSON file at all rather than typed into the HTML.

## The procedure

### 1. Edit the number

Open `stats.json`. Change the `value`. If you change what a figure means, change
its `label` too. Bump `verified` to the date you checked the figures.

```json
"executives": { "value": 750, "suffix": "+", "label": "senior executives trained in person" },
```

`suffix` is the bit that is not a digit, usually `"+"` or `""`. Do not put commas
in `value`; the code inserts them.

### Changing a course fee

Exactly the same thing. `price` is the open-enrolment ticket, `priceInHouse` is
the private-team engagement.

```json
"price": { "value": 23750, "prefix": "R", "suffix": "", "label": "per person incl VAT, open enrolment" },
```

The `prefix` is what makes a stat money rather than a count, and it changes two
things. The "R" is written into the visible HTML but never into the JSON-LD
`Offer`, which takes bare digits, and the tooling knows that a Rand amount is
never a headcount, so `R30,000 to R60,000 of non-billable time` cannot be
mistaken for one and a fee cannot be dragged along when a headline count moves.

One fee is stated in five places, and all five move on commit: the JSON-LD
offer, both price cards, the sticky call to action, and the line in `llms.txt`.
The two fees are told apart by their VAT basis, "incl VAT" against "ex VAT",
because the word "price" sits on both cards and would claim the wrong figure.
If you ever reword a card so it no longer says which way VAT runs, the checker
stops finding that figure. Say it.

### 2. Commit

```bash
git commit -am "Update headline numbers"
```

The pre-commit hook rewrites and stages everything else. If you want to see the
changes before you commit, run `sh/apply-stats.sh` yourself first; it does the
same work and is safe to run any time.

### 3. Check, if you want to look

You do not have to run this, the hooks do. It prints three lists.

**Part 1, bound numbers.** The `data-stat` slots in the proof strips.
`apply-stats` rewrites these mechanically, so a `DRIFT` here means something
edited the HTML behind the hook's back.

**Part 2, hand-typed figures.** A static site cannot data-bind a `<meta>`
description, a JSON-LD block, or a sentence in the middle of a paragraph. The
script finds every number written near the words "courses", "executives",
"executive days", "hours", "incl VAT" or "ex VAT", in the HTML pages **and in
`llms.txt`**, and reports the ones that do not match `stats.json` as `STALE`.
This part exits non-zero too, so a stale sentence stops a push exactly like a
stale proof strip does.

It looks at a window of text around each keyword rather than a single line, so
a figure that wraps onto the next line is still caught. Percentages, agenda
times and HTML entities are ignored. Rand amounts are read, because two of them
are now tracked fees, but only ever as a fee: an untracked amount such as
`R30,000` can never be reported as a headcount, and a headcount can never be
rewritten into the middle of one.

If a `STALE` line is a genuine false alarm, waive it in place:

```html
<li>A new room of senior executives roughly every two weeks</li> <!-- stats-ok: cadence, not a count -->
```

The comment can sit anywhere near the reported text. It then reports as
`waived` instead of `STALE`, and the waiver travels with the line if the file
moves around.

Write figures as digits (`725 executives`), not words. "Seven hundred
executives" cannot be policed or rewritten by anything, and is how prose goes
stale.

**Part 3, figures nothing can find.** A number that equals a headline figure but
sits nowhere near the word for it, and carries no `data-stat` attribute. The
real example was "rebuilt the material 45 times", which tracks the course count
but never says so, so it would have kept the old number forever while every
figure around it moved. Reported as `ORPHAN`. Fix by binding it:

```html
rebuilt the material <span data-stat-text="courses">45</span> times
```

Or waive it with `<!-- stats-ok: -->` if the match really is a coincidence.

### 4. Push

```bash
git push
```

The pre-push hook re-runs the check and **refuses the push** if anything is out
of step. Pushing is the deploy, so this is the last point at which a wrong
number can be stopped. In the rare case you need to push regardless:
`git push --no-verify`.

## The other repo

Executive-Navigants reads `https://www.imagineers.ai/stats.json` over HTTPS, so
this push is what updates it. Nothing to run there. See its own
`docs/subsystems/proof-stats.md` for how it consumes the file.

GitHub Pages redeploys in a minute or two. **This alone updates both websites.**

## How each page actually gets the number

**This site.** The published HTML is already correct, because `apply-stats`
wrote the values into it at commit time. `proof-stats.js` only animates what is
there; it does not fetch `stats.json`, and the long comment at the top of that
file explains why putting the fetch back would reintroduce a real bug. The
attributes are how `apply-stats` knows what to write:

- `data-stat="executives"` is a shared fact in a proof strip. Counts up on
  scroll. The text in the HTML is the crawler and no-JS fallback and must be
  kept in step, which is what Part 1 of the checker enforces.
- `data-stat-text="executives"` is the same shared fact in running prose. Same
  value, no animation mid-sentence.
- `data-stat-text="price"` is a fee, so the visible text carries the "R" as
  well: `<span data-stat-text="price">R21,500</span>`.
- `data-count-to="2"` is a page-local number. It animates but is not a shared
  fact, so it stays out of `stats.json`.
- No attribute means the slot is left alone. That is how a page swaps a number
  for a phrase, such as "Day 5" on the engineering page.

**Executive Navigants.** Reads `https://www.imagineers.ai/stats.json` over
HTTPS. GitHub Pages serves it with `access-control-allow-origin: *`, which is
why that works cross-origin with no API and no cross-repo build hook. Details
in that repo: `docs/subsystems/proof-stats.md`.

## Things that will trip you up

- **Adding a new stat** means adding it to `stats.json` and adding a keyword for
  it to `KEYWORDS` in **both** `sh/check-stats.mjs` and `sh/apply-stats.mjs`.
  They must agree, or apply-stats writes something check-stats then rejects.
  Pick a keyword only that stat can own. Two stats that share one, the way both
  fees would have shared the word "price", will claim each other's figure and
  report the wrong one stale.
  Keywords are matched in the plural on purpose, so "45 courses" is policed but
  the "GenAI Executive Masterclass" product name is not mistaken for a headcount.
- **`sh/.stats-applied.json` is committed on purpose.** It records which values
  are currently written into the HTML, and it is the only way apply-stats can
  find an unlabelled figure in prose on the next change. Do not delete or
  hand-edit it.
- **Adding a new published file** that states a figure means adding it to
  `FILES` in `sh/check-stats.mjs`. `llms.txt` went stale unnoticed for exactly
  this reason.
- **`sh/start.sh` serves over HTTP**, so the fetch works locally. Opening
  `index.html` straight off disk with `file://` blocks it, and you will see the
  HTML fallback numbers plus a console warning. That is expected, not a bug.
- **The console tells you about drift.** Open dev tools on any page; if the HTML
  fallback and `stats.json` disagree you get a warning naming the element.
- **Do not put the numbers back into `proof-stats.js`.** They were there until
  July 2026 and it is why the two sites drifted apart (600 versus 700).

---

## Related: the two other things that work exactly like this

Since August 2026 there are three single-source-of-truth files, not one. They
all behave the same way: edit the source, commit, and the hook rewrites the
pages. The push is blocked if anything disagrees.

| What you want to change | Edit this | Written by | Checked by |
| --- | --- | --- | --- |
| A headline figure or a fee | `stats.json` | `sh/apply-stats.mjs` | `check-stats.sh` parts 1 to 3 |
| How the company is described, the category, the ICPs, the differentiators, the founder details | `brand-entity.json` | `sh/apply-brand.mjs` | `check-stats.sh` part 4 |
| A page's published date | `sh/page-dates.json` | `sh/apply-dates.mjs` | `check-stats.sh` part 5 |

**You never edit a page's last-updated date.** It is bumped for you at commit
time, and only for pages whose own content changed in that commit. If you change
one word on `caio.html`, only `caio.html` gets a new date. That is on purpose:
stamping every page on every push tells Google the dates mean nothing.

**Adding a new page?** Add it to `sitemap.xml` (which is also what puts it in
`llms-full.txt`) and to `sh/page-dates.json`. Miss the second one and the page
simply gets no dates, silently.
