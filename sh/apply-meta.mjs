/* ==========================================================================
   apply-meta.mjs   (run by the pre-commit hook, or by hand)

   Writes sh/page-meta.json into every page: the title into its three slots,
   the three descriptions into theirs, and the same strings into the structured
   data. Also writes the JSON-LD Offer price straight from stats.json.

   Why this exists
   ---------------
   A page title was typed three times (<title>, og:title, twitter:title) and
   the meta description twice (<meta name="description"> and the WebPage node).
   Four copies of one sentence, kept in step by hand. On top of that, 23 of the
   site's headline figures lived inside those strings, where nothing can bind
   them: you cannot put a <span data-stat-text> inside an attribute value or
   inside a JSON string. Those 23 were the last thing keeping the guessing pass
   in sh/apply-stats.mjs alive.

   The fix is not cleverer searching. It is an anchor that does not contain the
   number. Every string this script writes is found by something structural and
   stable: a tag name, an attribute selector, a JSON-LD @id, or a question. None
   of those move when a figure changes, so nothing has to remember the previous
   value and there is no state file.

   Rules
   -----
   - Never type a title or a description into a page. It is overwritten on the
     next commit, and Part 8 of sh/check-stats.sh blocks the push meanwhile.
   - Strings are stored exactly as they appear in the file, entities and JSON
     escapes included, and written back verbatim. Do not "helpfully" escape
     here; the round-trip test is what proves that is right.
   - This runs BEFORE apply-dates, because a page it rewrites has changed and
     apply-dates reads git to decide what changed. It runs AFTER apply-stats
     only by convention; the two do not overlap.

     Usage
       node sh/apply-meta.mjs              write
       node sh/apply-meta.mjs --check      compare only, exit 1 on a mismatch
       node sh/apply-meta.mjs --porcelain  write, then list files for the hook
   ========================================================================== */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { ROOT, stats, RED, GRN, DIM, OFF, expected, escapeRe } from './stats-lib.mjs';

const CHECK = process.argv.includes('--check');
const SRC = `${ROOT}/sh/page-meta.json`;

const { pages } = JSON.parse(readFileSync(SRC, 'utf8'));

/* ---------------------------------------------------------------- */
/* Rendering                                                        */
/* ---------------------------------------------------------------- */

const render = (s) => s.replace(/\{\{(\w+)\}\}/g, (whole, name) => {
  if (!(name in stats)) {
    throw new Error(`sh/page-meta.json uses {{${name}}}, which is not in stats.json`);
  }
  return expected(name);
});

/* ---------------------------------------------------------------- */
/* The slots, each found by something that has no number in it      */
/* ---------------------------------------------------------------- */

/* A JSON-LD string value: everything between the quotes, escapes intact. */
const JSON_STR = '((?:[^"\\\\]|\\\\.)*)';

/* Each entry returns a regex whose group 2 is the text to replace. Group 1 is
   the anchor and group 3 is the closing delimiter, so a callback can rebuild
   the match without any offset arithmetic. */
function slotsFor(file, e) {
  const s = [];
  /* required: the slot must exist. Every page carries a title, a description
     and the two Open Graph tags, so a missing one means the markup moved and
     we want to hear about it. The rest are genuinely optional: three pages
     carry no twitter tags, five have no WebPage node, and only two sell
     anything, so no Offer. Absent is not the same as wrong. */
  const add = (label, re, value, required = false) => {
    if (value != null) s.push({ label, re, value, required });
  };

  add('title',        /(<title>)([^<]*)(<\/title>)/i,                            e.title,              true);
  add('og:title',     /(<meta property="og:title" content=")([^"]*)(")/i,        e.title,              true);
  add('description',  /(<meta name="description" content=")([^"]*)(")/i,         e.description,        true);
  add('og:desc',      /(<meta property="og:description" content=")([^"]*)(")/i,  e.ogDescription,      true);
  add('twitter:title',/(<meta name="twitter:title" content=")([^"]*)(")/i,       e.title);
  add('twitter:desc', /(<meta name="twitter:description" content=")([^"]*)(")/i, e.twitterDescription);

  /* The WebPage node. name defaults to the title, because they are the same
     sentence on every page but two. */
  add('schema name',
      new RegExp(`("@id":\\s*"[^"]*#webpage"[\\s\\S]{0,900}?"name":\\s*")${JSON_STR}(")`),
      e.schemaName ?? e.title);
  add('schema description',
      new RegExp(`("@id":\\s*"[^"]*#webpage"[\\s\\S]{0,900}?"description":\\s*")${JSON_STR}(")`),
      e.description);

  /* Extra structured-data strings that carry a figure. */
  for (const [anchor, fields] of Object.entries(e.schema || {})) {
    for (const [key, value] of Object.entries(fields)) {
      let head;
      if (anchor.startsWith('node:')) {
        head = `"@id":\\s*"${escapeRe(anchor.slice(5))}"`;
      } else if (anchor.startsWith('faq:')) {
        head = `"name":\\s*"${escapeRe(anchor.slice(4))}"`;
      } else {
        throw new Error(`${file}: schema anchor "${anchor}" must start with node: or faq:`);
      }
      /* Required: you named this anchor by hand, so if it is not there the
         entry is stale and the figure inside it is quietly going unmanaged. */
      add(`schema ${key} (${anchor})`,
          new RegExp(`(${head}[\\s\\S]{0,600}?"${key}":\\s*")${JSON_STR}(")`),
          value, true);
    }
  }

  /* The Offer price is not stored in page-meta.json. It is always stats.price
     as bare digits: no R, no thousands comma, because schema.org rejects both. */
  add('schema offer price',
      /("@type":\s*"Offer"[\s\S]{0,400}?"price":\s*")([^"]*)(")/,
      String(stats.price.value));

  return s;
}

/* ---------------------------------------------------------------- */

const changed = [];
let problems = 0;

for (const [file, entry] of Object.entries(pages)) {
  const path = `${ROOT}/${file}`;
  if (!existsSync(path)) {
    console.log(`${RED}  MISSING ${OFF}sh/page-meta.json lists ${file}, which is not on disk`);
    problems++;
    continue;
  }

  const before = readFileSync(path, 'utf8');
  let text = before;

  for (const slot of slotsFor(file, entry)) {
    const want = render(slot.value);
    const m = text.match(slot.re);

    if (!m) {
      if (slot.required) {
        console.log(`${RED}  NO SLOT ${OFF}${file}: cannot find the ${slot.label} slot`);
        problems++;
      }
      continue;   // an absent optional slot is normal, not a fault
    }

    if (m[2] !== want) {
      if (CHECK) {
        const line = text.slice(0, m.index).split('\n').length;
        console.log(`${RED}  DRIFT   ${OFF}${file}:${line}  ${slot.label}`);
        console.log(`${DIM}    page:   ${OFF}${m[2].slice(0, 96)}`);
        console.log(`${DIM}    source: ${OFF}${want.slice(0, 96)}`);
        problems++;
      } else {
        text = text.replace(slot.re, (w, a, b, c) => a + want + c);
      }
    }
  }

  if (!CHECK && text !== before) {
    writeFileSync(path, text);
    changed.push(file);
  }
}

/* A page on disk that nobody is managing is the silent failure mode, so say so. */
if (CHECK) {
  const { HTML_FILES } = await import('./stats-lib.mjs');
  for (const f of HTML_FILES) {
    if (!(f in pages)) {
      console.log(`${RED}  UNMANAGED ${OFF}${f} has no entry in sh/page-meta.json`);
      problems++;
    }
  }
}

/* ---------------------------------------------------------------- */

if (CHECK) {
  if (problems) {
    console.log(`${DIM}  Titles and descriptions live in sh/page-meta.json. Edit that, not the page.${OFF}`);
    process.exit(1);
  }
  console.log(`${GRN}  ✓ every title and description matches sh/page-meta.json${OFF}`);
  process.exit(0);
}

if (problems) process.exit(1);

if (changed.length) {
  console.log(`${GRN}  meta: wrote titles and descriptions into ${changed.length} page(s)${OFF}`);
  for (const f of changed) console.log(`    ${f}`);
} else {
  console.log(`${DIM}  meta: every page already matches sh/page-meta.json${OFF}`);
}

if (process.argv.includes('--porcelain')) {
  console.log('---FILES---');
  for (const f of changed) console.log(f);
}
