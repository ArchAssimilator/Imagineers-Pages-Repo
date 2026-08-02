/* ==========================================================================
   apply-stats.mjs   (run it via sh/apply-stats.sh, or let the pre-commit
                      hook run it for you)

   Writes the numbers in stats.json into every published file. This is the
   thing that makes "edit stats.json and nothing else" literally true.

   It does two passes.

     PASS A  Bound fallbacks. Every data-stat / data-stat-text element gets
             its visible text rewritten from stats.json. Purely mechanical,
             no state needed, because the attribute says which stat it is.

     PASS B  Hand-typed figures. A <meta> description, a JSON-LD block and a
             sentence in the middle of a paragraph cannot carry an attribute,
             so there is nothing in the file that says "this 725 is the
             executives figure". We work it out by remembering what we last
             wrote: sh/.stats-applied.json holds the values currently sitting
             in the files. When stats.json moves from 725 to 800, we find every
             725 that sits near the word "executives" and rewrite it.

   That is why .stats-applied.json is committed. It is not a cache, it is the
   record of what the HTML currently says, and pass B is meaningless without
   it. Do not delete it, and do not hand-edit it.

   After both passes, sh/check-stats.sh should always exit 0. The pre-push
   hook proves that independently, so a bug in here cannot silently ship.
   ========================================================================== */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { readdirSync } from 'node:fs';

const ROOT = process.cwd();
const GRN = '\x1b[32m', YEL = '\x1b[33m', DIM = '\x1b[2m', OFF = '\x1b[0m';

const STATE = `${ROOT}/sh/.stats-applied.json`;
const stats = JSON.parse(readFileSync(`${ROOT}/stats.json`, 'utf8'));

const FILES = [
  ...readdirSync(ROOT).filter((f) => f.endsWith('.html')).sort(),
  'llms.txt',
];

/* Same keywords and window as the checker, deliberately. If these two ever
   disagree, apply-stats would write something check-stats then rejects. */
const KEYWORDS = {
  execDays:     /\bexecutive[- ]days\b/gi,
  courses:      /\bcourses\b/gi,
  executives:   /\bexecutives\b|\bleaders\b/gi,
  hours:        /\bhours\b/gi,
  price:        /\bincl\.? VAT\b|"price":/gi,
  priceInHouse: /\bex\.? VAT\b/gi,
};
const WINDOW = 110;

const group = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const expected = (name) =>
  typeof stats[name] === 'string'
    ? stats[name]
    : (stats[name].prefix || '') + group(stats[name].value) + (stats[name].suffix || '');

/* A stat carrying a prefix is money rather than a count. */
const isFee = (name) => Boolean(stats[name] && stats[name].prefix);

const mask = (text, re) => text.replace(re, (m) => ' '.repeat(m.length));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* Regions that are not prose. Kept in step with check-stats.mjs, including
   how Rand amounts are handled: the digits survive and only the "R" is
   stripped, because "R21,500" has no word boundary between the R and the 2.
   `money` carries the character range of each amount, so a count stat can skip
   them by position and never rewrite half of a fee. */
function masked(text) {
  let t = text;
  t = mask(t, /<!--[\s\S]*?-->/g);
  t = mask(t, /&#?\w+;/g);
  t = mask(t, /https?:\/\/[^\s"'<>]+/g);
  t = mask(t, /\b\d{1,2}:\d{2}\b/g);
  t = mask(t, /#[0-9a-fA-F]{3,8}\b/g);
  t = mask(t, /\d[\d,]*\s*%/g);

  const money = [];
  t = t.replace(/\bR\s?(\d[\d,]*)\b/g, (whole, digits, offset) => {
    const start = offset + whole.length - digits.length;
    money.push([start, start + digits.length]);
    return ' '.repeat(whole.length - digits.length) + digits;
  });

  return { text: t, isMoney: (i) => money.some(([a, b]) => i >= a && i < b) };
}

/* ---------------------------------------------------------------- */
/* Previous values                                                  */
/* ---------------------------------------------------------------- */

let applied = null;
if (existsSync(STATE)) {
  applied = JSON.parse(readFileSync(STATE, 'utf8'));
} else {
  /* First run. The files are whatever they are; we have no record of what we
     last wrote, so pass B has nothing to go on and must not guess. Pass A
     still runs, and check-stats will report anything pass B could not know
     about. From the next change onwards, both passes work. */
  console.log(`${YEL}No sh/.stats-applied.json yet. Recording the current values as the`);
  console.log(`baseline and running the bound-fallback pass only. Run sh/check-stats.sh${OFF}`);
  console.log(`${YEL}afterwards and fix any hand-typed figure by hand, once.${OFF}\n`);
}

/* ---------------------------------------------------------------- */
/* Rewrite                                                          */
/* ---------------------------------------------------------------- */

const changed = [];

for (const file of FILES) {
  const before = readFileSync(`${ROOT}/${file}`, 'utf8');
  let text = before;

  /* --- PASS A: bound fallbacks ---------------------------------- */

  text = text.replace(
    /(<([a-z]+)[^>]*\bdata-stat(?:-text)?="([^"]+)"[^>]*>)([^<]*)(<)/gi,
    (whole, open, tag, name, inner, close) => {
      if (!(name in stats)) return whole;
      return open + expected(name) + close;
    }
  );

  /* --- PASS B: hand-typed figures ------------------------------- */

  if (applied) {
    for (const [name, keyword] of Object.entries(KEYWORDS)) {
      const oldStat = applied[name];
      const newStat = stats[name];
      if (!oldStat || !newStat || typeof newStat === 'string') continue;
      if (oldStat.value === newStat.value) continue;

      const { text: search, isMoney } = masked(text);

      /* Where the topic words are. */
      const zones = [...search.matchAll(keyword)]
        .map((m) => [m.index - WINDOW, m.index + m[0].length + WINDOW]);
      if (!zones.length) continue;
      const near = (i) => zones.some(([a, b]) => i >= a && i <= b);

      /* Both "1400" and "1,400" spellings of the outgoing value. */
      const forms = [group(oldStat.value), String(oldStat.value)]
        .filter((v, i, a) => a.indexOf(v) === i);
      const re = new RegExp(`\\b(?:${forms.map(esc).join('|')})\\b`, 'g');

      /* Each figure is rewritten in the spelling it already had. Prose writes
         "21,500" and a JSON-LD offer writes "21500", and an offer with a comma
         in it is not valid schema.org, so we cannot pick one house style. */
      const edits = [];
      for (const m of search.matchAll(re)) {
        if (!near(m.index)) continue;
        if (!isFee(name) && isMoney(m.index)) continue;   // a count never rewrites a Rand amount
        edits.push([m.index, m.index + m[0].length, m[0].includes(',')]);
      }

      /* Right to left, so earlier offsets stay valid. */
      for (const [from, to, grouped] of edits.reverse()) {
        const write = grouped ? group(newStat.value) : String(newStat.value);
        text = text.slice(0, from) + write + text.slice(to);
      }
    }
  }

  if (text !== before) {
    writeFileSync(`${ROOT}/${file}`, text);
    changed.push(file);
  }
}

/* ---------------------------------------------------------------- */
/* Record what the files now say                                    */
/* ---------------------------------------------------------------- */

const record = {
  _README: 'Written by sh/apply-stats.mjs. This is the record of which values are currently ' +
           'baked into the HTML and llms.txt, and it is what lets apply-stats find hand-typed ' +
           'figures on the next change. Committed on purpose. Do not hand-edit.',
  ...Object.fromEntries(Object.keys(KEYWORDS).map((k) => [k, { value: stats[k].value }])),
  verified: stats.verified,
};
const recordText = JSON.stringify(record, null, 2) + '\n';
const stateChanged = !existsSync(STATE) || readFileSync(STATE, 'utf8') !== recordText;
if (stateChanged) writeFileSync(STATE, recordText);

/* ---------------------------------------------------------------- */

if (changed.length) {
  console.log(`${GRN}Applied stats.json to ${changed.length} file(s):${OFF}`);
  for (const f of changed) console.log(`  ${f}`);
} else {
  console.log(`${DIM}Every published file already matches stats.json. Nothing to write.${OFF}`);
}

/* The hook needs the list, so print it machine-readably on the last line. */
const touched = [...changed, ...(stateChanged ? ['sh/.stats-applied.json'] : [])];
if (process.argv.includes('--porcelain')) {
  console.log('---FILES---');
  for (const f of touched) console.log(f);
}
