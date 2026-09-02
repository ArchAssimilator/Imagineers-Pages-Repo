/* ==========================================================================
   check-stats.mjs   (run it via sh/check-stats.sh)

   Reports every place on this site that states a headline number, and fails
   if any of them no longer agrees with stats.json.

   The keyword list, the masking rules, the money detection and the number
   formatting all live in sh/stats-lib.mjs, which sh/apply-stats.mjs imports
   too. That is deliberate: the writer and the checker have to share one idea
   of what counts as a figure, or the writer produces something the checker
   then rejects.

   See the header of sh/check-stats.sh for what the parts mean, and
   HOW-TO-UPDATE-THE-NUMBERS.md for the whole procedure.
   ========================================================================== */

import {
  stats, FILES, RED, GRN, DIM, OFF,
  group, expected, isFee, KEYWORDS, WINDOW, escapeRe,
  BOUND, load, boundRanges, wantedFor,
} from './stats-lib.mjs';

/* ---------------------------------------------------------------- */
/* Part 1: bound fallbacks that have drifted                        */
/* ---------------------------------------------------------------- */

console.log(`\n${DIM}stats.json:${OFF} ` +
  KEYWORDS.map(([k]) => `${k}=${expected(k)}`).join('  ') +
  `  verified=${stats.verified}\n`);

let errors = 0;

console.log(`${DIM}── Part 1: bound numbers (data-stat) ─────────────────────${OFF}`);

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

if (errors === 0) console.log(`${GRN}  All bound fallbacks match stats.json.${OFF}`);

/* ---------------------------------------------------------------- */
/* Part 2: hand-typed figures                                       */
/* ---------------------------------------------------------------- */

console.log(`\n${DIM}── Part 2: hand-typed figures (meta, JSON-LD, prose) ─────${OFF}`);
console.log(`${DIM}  Every number written next to "courses", "executives", "executive${OFF}`);
console.log(`${DIM}  days" or "hours". A line that is a genuine false alarm is waived${OFF}`);
console.log(`${DIM}  with an inline  <!-- stats-ok: why -->  comment.${OFF}\n`);

let stale = 0, waived = 0, ok = 0;

for (const file of FILES) {
  const { text, waivers, lineAt, isMoney } = load(file);

  /* Claim the keyword itself, never its window. "1,400 executive days" is
     claimed by execDays, so the executives pattern cannot report the same
     words a second time. A sentence naming two different stats still gets both
     checked, which is the common case in prose: "800 executives across 45
     courses" is two figures, not one. */
  const claimed = [];
  const overlaps = (a, b) => claimed.some(([x, y]) => a < y && b > x);

  const hits = [];

  for (const [name, keyword] of KEYWORDS) {
    if (typeof stats[name] === 'string') continue;

    for (const m of text.matchAll(keyword)) {
      const word = [m.index, m.index + m[0].length];
      if (overlaps(...word)) continue;

      const from = Math.max(0, m.index - WINDOW);
      const to = Math.min(text.length, m.index + m[0].length + WINDOW);
      const window = text.slice(from, to);
      /* Up to seven digits, so an ungrouped 215000 in a JSON-LD offer is read
         as readily as a grouped 215,000 in prose. */
      const numbers = [...window.matchAll(/\b(\d{1,3}(?:,\d{3})+|\d{2,7})\b/g)]
        /* A Rand amount is not a headcount. llms.txt says "senior leaders in
           South Africa. R21,500 incl VAT" in one breath, and without this the
           executives pattern finds a number beside its keyword and calls the
           line stale. A fee stat, of course, is allowed to match one. */
        .filter((n) => isFee(name) || !isMoney(from + n.index))
        .map((n) => parseInt(n[1].replace(/,/g, ''), 10));
      if (!numbers.length) continue;

      claimed.push(word);
      hits.push({
        name,
        line: lineAt(m.index),
        agrees: numbers.includes(stats[name].value),
        waived: waivers.some((w) => w >= from && w <= to),
        snippet: window.trim().replace(/\s+/g, ' '),
      });
    }
  }

  for (const h of hits.sort((a, b) => a.line - b.line)) {
    let flag;
    if (h.agrees)      { flag = `${GRN}  ok      ${OFF}`; ok++; }
    else if (h.waived) { flag = `${DIM}  waived  ${OFF}`; waived++; }
    else               { flag = `${RED}  STALE   ${OFF}`; stale++; }

    if (h.agrees) continue;   // the passing lines are noise; show what needs a decision
    console.log(`${flag}${file}:${h.line}  ${DIM}[${h.name} = ${expected(h.name)}]${OFF} ${h.snippet.slice(0, 120)}`);
  }
}

console.log(`${DIM}  (${ok} figure(s) already agree with stats.json and are not listed.)${OFF}`);

/* ---------------------------------------------------------------- */
/* Part 3: figures nothing can find                                 */
/* ---------------------------------------------------------------- */

/* A number that happens to equal a headline figure but sits nowhere near the
   word for it, and carries no data-stat attribute, is invisible to both this
   script and apply-stats. "rebuilt the material 45 times" is the real example:
   it tracks the course count, but nothing in the text says so, so it silently
   keeps the old number forever while everything around it moves.

   Anything reported here needs binding with data-stat-text, or waiving if the
   match is a coincidence. */

console.log(`\n${DIM}── Part 3: figures nothing can find ──────────────────────${OFF}`);
console.log(`${DIM}  Numbers equal to a headline figure that are neither bound nor${OFF}`);
console.log(`${DIM}  written near the word for it. apply-stats cannot move these.${OFF}\n`);

let orphans = 0;

for (const file of FILES) {
  const { raw, text, waivers, lineAt, isMoney } = load(file);

  /* Pass A of apply-stats rewrites these, so they are already accounted for. */
  const bound = boundRanges(raw);

  for (const [name, keyword] of KEYWORDS) {
    if (typeof stats[name] === 'string') continue;
    const value = stats[name].value;

    const zones = [...text.matchAll(keyword)]
      .map((m) => [m.index - WINDOW, m.index + m[0].length + WINDOW]);

    const forms = [...new Set([group(value), String(value)])];
    const re = new RegExp(`\\b(?:${forms.map(escapeRe).join('|')})\\b`, 'g');

    for (const m of text.matchAll(re)) {
      const i = m.index;
      if (bound.some(([a, b]) => i >= a && i < b)) continue;   // pass A owns it
      if (zones.some(([a, b]) => i >= a && i <= b)) continue;  // pass B owns it
      if (!isFee(name) && isMoney(i)) continue;                // "R45,000" is not the course count

      const from = Math.max(0, i - 80), to = Math.min(text.length, i + 60);
      if (waivers.some((w) => w >= from && w <= to)) { waived++; continue; }

      orphans++;
      console.log(`${RED}  ORPHAN  ${OFF}${file}:${lineAt(i)}  ${DIM}[looks like ${name} = ${value}]${OFF} ` +
        raw.slice(from, to).replace(/\s+/g, ' ').trim().slice(0, 110));
    }
  }
}

if (!orphans) console.log(`${GRN}  Every headline figure is either bound or anchored to its keyword.${OFF}`);

/* ---------------------------------------------------------------- */

console.log('');
if (errors) console.log(`${RED}${errors} bound fallback(s) are stale. Fix the HTML so it matches stats.json.${OFF}`);
else console.log(`${GRN}No bound drift.${OFF}`);

if (stale) {
  console.log(`${RED}${stale} hand-typed figure(s) disagree with stats.json.${OFF}`);
  console.log(`${DIM}Fix each one, or if it is a false alarm (a price, a cadence, a percentage)${OFF}`);
  console.log(`${DIM}add  <!-- stats-ok: why -->  on that line and it will read "waived" instead.${OFF}`);
} else {
  console.log(`${GRN}No stale hand-typed figures.${OFF}${waived ? ` ${DIM}(${waived} waived.)${OFF}` : ''}`);
}

if (orphans) {
  console.log(`${RED}${orphans} figure(s) nothing can find.${OFF}`);
  console.log(`${DIM}Wrap each in <span data-stat-text="NAME">VALUE</span> so it moves with${OFF}`);
  console.log(`${DIM}stats.json, or waive it with <!-- stats-ok: why --> if it is a coincidence.${OFF}`);
}

console.log(`\n${DIM}stats.json is the only file you edit. sh/apply-stats.sh writes it into${OFF}`);
console.log(`${DIM}everything else, and the pre-commit hook does that for you.${OFF}\n`);

process.exit(errors || stale || orphans ? 1 : 0);
