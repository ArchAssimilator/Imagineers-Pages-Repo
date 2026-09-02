/* ==========================================================================
   stats-lib.mjs

   The one place the figure tooling agrees with itself.

   sh/apply-stats.mjs writes the numbers into the published files, and
   sh/check-stats.mjs proves it worked. Those two used to hold their own copies
   of the keyword list, the masking rules, the money detection and the number
   formatting, with a comment in each telling the next person to keep them
   identical by hand.

   Two copies of one rule is one rule and one bug waiting. So: they both
   import this. Change something once, here.
   ========================================================================== */

import { readFileSync, readdirSync } from 'node:fs';

export const ROOT = process.cwd();

export const RED = '\x1b[31m', YEL = '\x1b[33m', GRN = '\x1b[32m',
             DIM = '\x1b[2m', OFF = '\x1b[0m';

export const stats = JSON.parse(readFileSync(`${ROOT}/stats.json`, 'utf8'));

/* Everything GitHub Pages publishes that can state a number. llms.txt is in
   here because a crawler reads it exactly like a page, and it went stale
   unnoticed for as long as the checker only looked at HTML. */
export const HTML_FILES = readdirSync(ROOT)
  .filter((f) => f.endsWith('.html'))
  .sort();

export const FILES = [...HTML_FILES, 'llms.txt'];

/* --------------------------------------------------------------------------
   Formatting
   -------------------------------------------------------------------------- */

/* 1400 -> "1,400". The published prose groups thousands; a JSON-LD Offer must
   not, because a comma in a price is not valid schema.org. Callers pick. */
export const group = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/* What a bound slot should read, prefix and suffix included: "R21,500", "800+".
   A string stat (the two dates) is passed through untouched, because there is
   no arithmetic to do on "1 Aug 2026". */
export const expected = (name) =>
  typeof stats[name] === 'string'
    ? stats[name]
    : (stats[name].prefix || '') + group(stats[name].value) + (stats[name].suffix || '');

/* A stat carrying a prefix is money rather than a count. That is the only
   thing separating the two fees from the four headline figures, and it is what
   stops a fee and a headcount ever being mistaken for one another. */
export const isFee = (name) => Boolean(stats[name] && stats[name].prefix);

/* The stats that are numbers, in the order the checker reports them. */
export const NUMERIC = Object.keys(stats).filter(
  (k) => !k.startsWith('_') && typeof stats[k] === 'object'
);

/* --------------------------------------------------------------------------
   Which words mean "this text is talking about that stat"

   One caller now: Part 2 of sh/check-stats.mjs, which uses these to tell an
   anchored figure from an orphaned one. A number sitting beside the word for
   it is in a sentence a human will read when they change it. A number sitting
   on its own is not, and needs binding.
   -------------------------------------------------------------------------- */

/* Ordered most specific first: "executive days" must be claimed by execDays
   before the executives pattern gets a chance at the word "executive".

   Plurals only, deliberately. A headline figure always counts more than one of
   the thing, so "800 executives" and "45 courses" match, while the singular
   adjectival uses that carry unrelated numbers nearby ("Executive Masterclass",
   "AI executive training") do not.

   The two fees cannot use the obvious word. "price" appears on both cards and
   would claim the other card's figure, so they anchor to the VAT basis instead,
   which is the one thing the open-enrolment and private-team fees never share.
   `"price":` with the colon is the JSON-LD offer and nothing else; the HTML
   class attribute is `class="price"` and does not match. */
export const KEYWORDS = [
  ['execDays',     /\bexecutive[- ]days\b/gi],
  ['courses',      /\bcourses\b/gi],
  ['executives',   /\bexecutives\b|\bleaders\b/gi],
  ['hours',        /\bhours\b/gi],
  ['price',        /\bincl\.? VAT\b|"price":/gi],
  ['priceInHouse', /\bex\.? VAT\b/gi],
];

/* How far either side of the keyword to look for its number. Prose here wraps
   at about 115 characters, so this reliably spans the line break that used to
   hide a figure from a line-by-line scan. */
export const WINDOW = 110;

/* --------------------------------------------------------------------------
   Reading a file: blank out the things that are not stats
   -------------------------------------------------------------------------- */

/* Replace every match with spaces of the same length, so a masked region stops
   producing numbers while every character offset after it stays correct. That
   property is what lets the caller map an offset back to a line number. */
const mask = (text, re) => text.replace(re, (m) => ' '.repeat(m.length));

export const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* Matches a bound slot: <span data-stat-text="courses">45</span>. Group 2 is
   which attribute was used, group 3 the stat name, group 4 the inner text,
   which is the bit apply-stats owns and rewrites.

   Three spellings, and the difference matters:
     data-stat        the full rendered value, "R21,500" or "800+"
     data-stat-text   the same thing. Kept because the pages already use it.
     data-stat-num    the grouped number ONLY, no prefix and no suffix.

   data-stat-num exists because prose does not always want the suffix. The site
   says "815 executives have shown us which AI" in one place and "815+ senior
   executives trained" in another, and both are correct English. Binding the
   first with data-stat-text would rewrite it to "815+ executives have shown
   us", which silently edits published copy to suit the tooling. */
export const BOUND = /<([a-z]+)[^>]*\bdata-stat(-text|-num)?="([^"]+)"[^>]*>([^<]*)</gi;

/* What a given slot should read, which depends on how it was bound. */
export const wantedFor = (variant, name) =>
  variant === '-num' && typeof stats[name] !== 'string'
    ? group(stats[name].value)
    : expected(name);

/* Everything that produces digits but is not a headline figure.

   Rand amounts are the subtle one. Blanking them wholesale used to be right,
   back when no fee was a tracked stat. Now two of them are, so blanking would
   hide the very figures we are here to police. Blanking by value is worse than
   useless, because the value we most need to see is the outgoing one, which by
   definition is no longer in stats.json.

   So the digits always survive and only the "R" is stripped. That is not
   cosmetic: "R21,500" has no word boundary between the R and the 2, so a
   \b-anchored number pattern walks straight past the digits while the R is
   still there. What keeps a fee from being read as a headcount is `isMoney`
   instead, which records the character range of every amount so a count stat
   can skip them by position rather than by guessing at their value. */
function maskNonStats(raw) {
  let text = raw;
  text = mask(text, /<!--[\s\S]*?-->/g);        // comments, including the waivers
  text = mask(text, /&#?\w+;/g);                // &#10003; is not seven hundred and three
  text = mask(text, /https?:\/\/[^\s"'<>]+/g);  // font URLs, canonicals
  text = mask(text, /\b\d{1,2}:\d{2}\b/g);      // agenda times
  text = mask(text, /#[0-9a-fA-F]{3,8}\b/g);    // hex colours
  text = mask(text, /\d[\d,]*\s*%/g);           // the 80% wall is not a headcount
  text = mask(text, /\b(?:width|height)="\d+"/g); // image dimensions

  const money = [];
  text = text.replace(/\bR\s?(\d[\d,]*)\b/g, (whole, digits, offset) => {
    const start = offset + whole.length - digits.length;
    money.push([start, start + digits.length]);
    return ' '.repeat(whole.length - digits.length) + digits;
  });

  return { text, isMoney: (i) => money.some(([a, b]) => i >= a && i < b) };
}

/* Everything a caller needs about one published file, read once. */
export function load(file) {
  const raw = readFileSync(`${ROOT}/${file}`, 'utf8');

  /* Waivers are read off the raw text, before the comments holding them get
     masked away. */
  const waivers = [...raw.matchAll(/stats-ok\b/g)].map((m) => m.index);

  const { text, isMoney } = maskNonStats(raw);

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

  return { raw, text, waivers, lineAt, isMoney };
}

/* Character ranges of the inner text of every bound slot in a file. Those are
   owned by apply-stats, so the orphan check must not report them again. */
export function boundRanges(raw) {
  const out = [];
  for (const m of raw.matchAll(BOUND)) {
    const inner = m.index + m[0].lastIndexOf(m[4]);
    out.push([inner, inner + m[4].length]);
  }
  return out;
}
