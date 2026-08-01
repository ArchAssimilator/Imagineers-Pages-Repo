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
"executive days" or "hours", in the HTML pages **and in `llms.txt`**, and
reports the ones that do not match `stats.json` as `STALE`. This part exits
non-zero too, so a stale sentence stops a push exactly like a stale proof strip
does.

It looks at a window of text around each keyword rather than a single line, so
a figure that wraps onto the next line is still caught. Prices, percentages,
agenda times and HTML entities are ignored.

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

**This site.** `proof-stats.js` fetches `stats.json` on load and writes the
values into every element carrying a `data-stat` or `data-stat-text` attribute.
Three wiring options:

- `data-stat="executives"` is a shared fact in a proof strip. Counts up on
  scroll. The text in the HTML is the crawler and no-JS fallback and must be
  kept in step, which is what Part 1 of the checker enforces.
- `data-stat-text="executives"` is the same shared fact in running prose. Same
  value, no animation mid-sentence.
- `data-count-to="2"` is a page-local number. It animates but is not a shared
  fact, so it stays out of `stats.json`.
- No attribute means the slot is left alone. That is how a page swaps a number
  for a phrase, such as "Day 5" on the engineering page.

If `stats.json` cannot be fetched, the script falls back to the numbers already
printed in the HTML, so the page never shows a blank or a zero.

**Executive Navigants.** Reads `https://www.imagineers.ai/stats.json` over
HTTPS. GitHub Pages serves it with `access-control-allow-origin: *`, which is
why that works cross-origin with no API and no cross-repo build hook. Details
in that repo: `docs/subsystems/proof-stats.md`.

## Things that will trip you up

- **Adding a new stat** means adding it to `stats.json` and adding a keyword for
  it to `KEYWORDS` in **both** `sh/check-stats.mjs` and `sh/apply-stats.mjs`.
  They must agree, or apply-stats writes something check-stats then rejects.
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
