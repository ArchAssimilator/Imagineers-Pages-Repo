/* ==========================================================================
   check-stats.mjs   (run it via sh/check-stats.sh)

   Proves every headline number on this site still agrees with stats.json.

   Two parts, and between them they cover every way a figure can be wrong.

     PART 1  Every slot carrying a data-stat attribute reads what stats.json
             says it should. This is the direct check: apply-stats writes
             these, so a mismatch means someone hand-edited a page.

     PART 2  No number equal to a headline figure is sitting somewhere the
             tooling cannot reach. "rebuilt the material 46 times" is the real
             example: it tracks the course count, but nothing marks it as such,
             so it would silently keep the old number forever.

   What used to be here, and why it is gone
   ----------------------------------------
   There was a middle part that scanned for figures typed by hand near a
   keyword, inside a 110-character window, and reported any that disagreed.
   It was necessary when figures sat loose in the copy.

   Removed 2 September 2026. Every figure is now bound: in a data-stat slot,
   in sh/llms.txt.tmpl, or in sh/page-meta.json. Part 1 checks the first
   exactly, and sh/check-stats.sh checks the other two by rebuilding the file
   and comparing it byte for byte. Proximity guessing added no cover that
   those three do not already give, and it was the hardest code here to read.

   Part 2 stays, because it is the one thing none of them can do: notice a
   figure that nothing owns.

   The keyword list, the masking rules and the number formatting live in
   sh/stats-lib.mjs, which sh/apply-stats.mjs imports too.

   See the header of sh/check-stats.sh for the other parts, and
   HOW-TO-UPDATE-THE-NUMBERS.md for the whole procedure.
   ========================================================================== */

import {
  stats, FILES, RED, GRN, DIM, OFF,
  group, expected, isFee, KEYWORDS, WINDOW, escapeRe,
  BOUND, load, boundRanges, wantedFor,
} from './stats-lib.mjs';

console.log(`\n${DIM}stats.json:${OFF} ` +
  KEYWORDS.map(([k]) => `${k}=${expected(k)}`).join('  ') +
  `  verified=${stats.verified}\n`);

/* ---------------------------------------------------------------- */
/* Part 1: bound slots that have drifted                            */
/* ---------------------------------------------------------------- */

console.log(`${DIM}── Part 1: bound numbers (data-stat) ─────────────────────${OFF}`);

let errors = 0;

for (const file of FILES) {
  const { raw, lineAt } = load(file);
  for (const m of raw.matchAll(BOUND)) {
    const [, , variant, name, text] = m;
    const line = lineAt(m.index);
    if (!(name in stats)) {
      console.log(`${RED}  MISSING ${OFF}${file}:${line}  data-stat="${name}" is not in stats.json`);
      errors++;
      continue;
    }
    const want = wantedFor(variant, name);
    if (text.trim() !== want) {
      console.log(`${RED}  DRIFT   ${OFF}${file}:${line}  ${name}: markup says "${text.trim()}", stats.json says "${want}"`);
      errors++;
    }
  }
}

if (errors === 0) console.log(`${GRN}  All bound slots match stats.json.${OFF}`);

/* ---------------------------------------------------------------- */
/* Part 2: figures nothing can find                                 */
/* ---------------------------------------------------------------- */

/* A number that happens to equal a headline figure but carries no data-stat
   attribute, and sits nowhere near the word for it, is invisible to both this
   script and apply-stats. It keeps the old value forever while everything
   around it moves.

   Anything reported here needs binding with data-stat-text, or waiving if the
   match is a coincidence. */

console.log(`\n${DIM}── Part 2: figures nothing can find ──────────────────────${OFF}`);
console.log(`${DIM}  Numbers equal to a headline figure that are neither bound nor${OFF}`);
console.log(`${DIM}  written near the word for it. apply-stats cannot move these.${OFF}\n`);

let orphans = 0, waived = 0;

for (const file of FILES) {
  const { raw, text, waivers, lineAt, isMoney } = load(file);

  /* apply-stats rewrites these, so they are already accounted for. */
  const bound = boundRanges(raw);

  for (const [name, keyword] of KEYWORDS) {
    if (typeof stats[name] === 'string') continue;
    const value = stats[name].value;

    /* Near its own keyword is close enough to count as anchored: the figure is
       in a sentence that names it, so a human changing the number will see it,
       and page-meta.json or the llms.txt template owns the ones that matter. */
    const zones = [...text.matchAll(keyword)]
      .map((m) => [m.index - WINDOW, m.index + m[0].length + WINDOW]);

    const forms = [...new Set([group(value), String(value)])];
    const re = new RegExp(`\\b(?:${forms.map(escapeRe).join('|')})\\b`, 'g');

    for (const m of text.matchAll(re)) {
      const i = m.index;
      if (bound.some(([a, b]) => i >= a && i < b)) continue;   // apply-stats owns it
      if (zones.some(([a, b]) => i >= a && i <= b)) continue;  // anchored to its word
      if (!isFee(name) && isMoney(i)) continue;                // "R46,000" is not the course count

      const from = Math.max(0, i - 80), to = Math.min(text.length, i + 60);
      if (waivers.some((w) => w >= from && w <= to)) { waived++; continue; }

      orphans++;
      console.log(`${RED}  ORPHAN  ${OFF}${file}:${lineAt(i)}  ${DIM}[looks like ${name} = ${value}]${OFF} ` +
        raw.slice(from, to).replace(/\s+/g, ' ').trim().slice(0, 110));
    }
  }
}

if (!orphans) {
  console.log(`${GRN}  Every headline figure is either bound or anchored to its keyword.${OFF}` +
    (waived ? ` ${DIM}(${waived} waived.)${OFF}` : ''));
}

/* ---------------------------------------------------------------- */

console.log('');
if (errors) console.log(`${RED}${errors} bound slot(s) are stale. Fix the HTML so it matches stats.json.${OFF}`);
else console.log(`${GRN}No bound drift.${OFF}`);

if (orphans) {
  console.log(`${RED}${orphans} figure(s) nothing can find.${OFF}`);
  console.log(`${DIM}Wrap each in <span data-stat-text="NAME">VALUE</span> so it moves with${OFF}`);
  console.log(`${DIM}stats.json, or waive it with <!-- stats-ok: why --> if it is a coincidence.${OFF}`);
}

console.log(`\n${DIM}stats.json is the only file you edit. sh/apply.sh writes it into${OFF}`);
console.log(`${DIM}everything else, and the pre-commit hook does that for you.${OFF}\n`);

process.exit(errors || orphans ? 1 : 0);
