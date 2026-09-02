# What is in this folder

Nothing here is part of the website. It is the tooling that keeps the published
pages honest, so a fact lives in one file and is written into all eleven pages
for you.

**You only ever edit the four source files.** Everything else runs itself.

| Edit this | To change |
|---|---|
| `../stats.json` | the headline figures and the two course fees |
| `../brand-entity.json` | how the company and the two founders are described |
| `page-meta.json` | any page title or meta description |
| `page-dates.json` | a page's published date (the last-updated date is automatic) |

Then commit. That is the whole job.

## What runs, and when

**On commit,** git runs `hooks/pre-commit`, which runs the five writers below in
that exact order and stages whatever they changed. The order matters: the plain
text file is built from the pages, so it has to go last.

1. `apply-stats.mjs` writes the figures into every `data-stat` slot, and renders
   `../llms.txt` from `llms.txt.tmpl`.
2. `apply-brand.mjs` writes the company and founder details into the structured
   data on every page.
3. `apply-meta.mjs` writes the titles and descriptions into their four slots.
4. `apply-dates.mjs` bumps the last-updated date, but only on pages this commit
   actually changed.
5. `build-llms-full.mjs` rebuilds `../llms-full.txt`, the whole site as one
   plain-text file for AI crawlers.

**On push,** git runs `hooks/pre-push`, which stops you if you are on a branch
that does not deploy, then runs `check-stats.sh`. That rebuilds everything in
memory, compares it to what is on disk, and refuses the push if anything
disagrees. Pushing is the deploy, so this is the last place a wrong number can
be caught.

## The other files

- `apply.sh` runs all five writers by hand, if you want to see the changes
  before committing. The hook does this for you.
- `check-stats.sh` runs all seven checks. Safe to run any time.
- `check-stats.mjs` is the first two of those checks. `stats-lib.mjs` is the
  shared code the writer and the checker both use, so they cannot disagree.
- `install-hooks.sh` turns the hooks on. Run once per clone.
- `start.sh` serves the site locally.
- `llms.txt.tmpl` is the source for `../llms.txt`. Plain text cannot carry an
  HTML attribute, so the figures go in as `{{courses}}` tokens instead.

The long version, written for a human coming back to this cold, is
[`../HOW-TO-UPDATE-THE-NUMBERS.md`](../HOW-TO-UPDATE-THE-NUMBERS.md).
