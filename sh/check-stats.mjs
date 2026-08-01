/* ==========================================================================
   check-stats.mjs   (run it via sh/check-stats.sh)

   Reports every place on this site that states a headline number, and fails
   if any of them no longer agrees with stats.json.

   See the header of sh/check-stats.sh for what the two parts mean, and
   HOW-TO-UPDATE-THE-NUMBERS.md for the whole procedure.
   ========================================================================== */

import { readFileSync, readdirSync } from 'node:fs';

const ROOT = process.cwd();
const RED = '\x1b[31m', YEL = '\x1b[33m', GRN = '\x1b[32m', DIM = '\x1b[2m', OFF = '\x1b[0m';

const stats = JSON.parse(readFileSync(`${ROOT}/stats.json`, 'utf8'));

/* Everything GitHub Pages actually publishes and that can state a number.
   llms.txt is in here because it is read by crawlers exactly like a page is,
   and it went stale unnoticed for as long as this script only looked at HTML. */
const FILES = [
  ...readdirSync(ROOT).filter((f) => f.endsWith('.html')).sort(),
  'llms.txt',
];

const group = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const expected = (name) =>
  typeof stats[name] === 'string' ? stats[name] : group(stats[name].value) + (stats[name].suffix || '');

/* Which words mean "this text is talking about that stat". Ordered most
   specific first: "executive days" must be claimed by execDays before the
   executives pattern gets a chance at the word "executive".

   Plurals only, deliberately. A headline figure is always counting more than
   one of the thing, so "725 executives" and "45 courses" match, while the
   singular adjectival uses that carry unrelated numbers nearby, "Executive
   Masterclass", "AI executive training", "the course we open with", do not. */
const KEYWORDS = [
  ['execDays',   /\bexecutive[- ]days\b/gi],
  ['courses',    /\bcourses\b/gi],
  ['executives', /\bexecutives\b|\bleaders\b/gi],
  ['hours',      /\bhours\b/gi],
];

/* How far either side of the keyword we look for its number. Prose here wraps
   at about 115 characters, so this reliably spans the line break that used to
   hide a figure from a line-by-line scan. */
const WINDOW = 110;

/* ---------------------------------------------------------------- */
/* Reading a file: mask the things that are not stats               */
/* ---------------------------------------------------------------- */

/* Replace every match with spaces of the same length, so a masked region stops
   producing numbers but every character offset after it stays correct. */
const mask = (text, re) => text.replace(re, (m) => ' '.repeat(m.length));

function load(file) {
  const raw = readFileSync(`${ROOT}/${file}`, 'utf8');

  /* Waivers are read off the raw text, before comments get masked. */
  const waivers = [...raw.matchAll(/stats-ok\b/g)].map((m) => m.index);

  let text = raw;
  text = mask(text, /<!--[\s\S]*?-->/g);            // comments, including the waivers
  text = mask(text, /&#?\w+;/g);                    // &#10003; is not seven hundred and three
  text = mask(text, /https?:\/\/[^\s"'<>]+/g);      // font URLs, canonicals
  text = mask(text, /\b\d{1,2}:\d{2}\b/g);          // agenda times
  text = mask(text, /#[0-9a-fA-F]{3,8}\b/g);        // hex colours
  text = mask(text, /\d[\d,]*\s*%/g);               // the 80% wall is not a headcount
  text = mask(text, /\bR\s?\d[\d,]*\b/g);           // nor is R21,500

  /* Line number for any character offset. */
  const starts = [0];
  for (let i = 0; i < raw.length; i++) if (raw[i] === '\n') starts.push(i + 1);
  const lineAt = (off) => {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= off) lo = mid; else hi = mid - 1;
    }
    return lo + 1;
  };

  return { raw, text, waivers, lineAt };
}

/* ---------------------------------------------------------------- */
/* Part 1: bound fallbacks that have drifted                        */
/* ---------------------------------------------------------------- */

console.log(`\n${DIM}stats.json:${OFF} ` +
  KEYWORDS.map(([k]) => `${k}=${expected(k)}`).join('  ') +
  `  verified=${stats.verified}\n`);

let errors = 0;
const BOUND = /<([a-z]+)[^>]*\bdata-stat(?:-text)?="([^"]+)"[^>]*>([^<]*)</gi;

console.log(`${DIM}── Part 1: bound numbers (data-stat) ─────────────────────${OFF}`);

for (const file of FILES) {
  const { raw, lineAt } = load(file);
  for (const m of raw.matchAll(BOUND)) {
    const [, , name, text] = m;
    const line = lineAt(m.index);
    if (!(name in stats)) {
      console.log(`${RED}  MISSING ${OFF}${file}:${line}  data-stat="${name}" is not in stats.json`);
      errors++;
      continue;
    }
    const want = expected(name);
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
  const { text, waivers, lineAt } = load(file);

  /* Claim the keyword itself, never its window. "1,400 executive days" is
     claimed by execDays, so the executives pattern cannot report the same
     words a second time. A sentence that names two different stats, though,
     still gets both of them checked, which is the common case in prose:
     "725 executives across 45 courses" is two figures, not one. */
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
      const numbers = [...window.matchAll(/\b(\d{1,3}(?:,\d{3})+|\d{2,5})\b/g)]
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
  const { raw, text, waivers, lineAt } = load(file);

  /* Character ranges of the inner text of every data-stat element. Pass A of
     apply-stats rewrites these, so they are already accounted for. */
  const bound = [];
  for (const m of raw.matchAll(BOUND)) {
    const inner = m.index + m[0].lastIndexOf(m[3]);
    bound.push([inner, inner + m[3].length]);
  }

  for (const [name, keyword] of KEYWORDS) {
    if (typeof stats[name] === 'string') continue;
    const value = stats[name].value;

    const zones = [...text.matchAll(keyword)]
      .map((m) => [m.index - WINDOW, m.index + m[0].length + WINDOW]);

    const forms = [...new Set([group(value), String(value)])];
    const re = new RegExp(`\\b(?:${forms.map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'g');

    for (const m of text.matchAll(re)) {
      const i = m.index;
      if (bound.some(([a, b]) => i >= a && i < b)) continue;   // pass A owns it
      if (zones.some(([a, b]) => i >= a && i <= b)) continue;  // pass B owns it

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
