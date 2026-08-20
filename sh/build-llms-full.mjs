/* ==========================================================================
   build-llms-full.mjs   (run it via sh/build-llms-full.sh, or let the
                          pre-commit hook run it for you)

   Writes llms-full.txt: every published page as one plain-text file, so an
   assistant can read the whole site in a single fetch instead of crawling
   eight HTML pages and throwing away the markup itself.

   llms.txt is the index. llms-full.txt is the content. Both are conventions
   rather than standards, which is exactly why this file is generated and not
   written by hand: a hand-maintained copy of the site is a second source of
   truth, and this repo already learned that lesson with the headline numbers.

   ---------------------------------------------------------------------------
   WHERE THE NUMBERS COME FROM

   Nowhere, directly. This script never opens stats.json. It reads the HTML
   *after* sh/apply-stats.mjs has already corrected it, so the figures are
   right by construction. The order in sh/hooks/pre-commit is load-bearing:

       apply-stats.mjs   stats.json  ->  HTML + llms.txt
       build-llms-full.mjs         HTML  ->  llms-full.txt

   Run it the other way round and llms-full.txt captures the previous values.
   ---------------------------------------------------------------------------

   Two modes:

     (default)   Write llms-full.txt.
     --check     Build it in memory, compare against the file on disk, and
                 exit 1 if they differ. sh/check-stats.sh and the pre-push
                 hook use this. It is an exact comparison rather than a
                 figure-by-figure scan, so it catches every kind of staleness,
                 including a hand-edit, not just a moved number.

   No npm, no dependencies, no build step. Node's standard library only.
   ========================================================================== */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const ROOT = process.cwd();
const OUT = `${ROOT}/llms-full.txt`;
const CHECK = process.argv.includes('--check');

const RED = '\x1b[31m', GRN = '\x1b[32m', DIM = '\x1b[2m', OFF = '\x1b[0m';

const SITE = 'https://www.imagineers.ai';

/* ---------------------------------------------------------------- */
/* Which pages, and in what order                                   */
/* ---------------------------------------------------------------- */

/* sitemap.xml is already the list of what is published and is already kept
   current, so it is the page list. Reusing it means a new page appears here
   the moment it is added to the sitemap, and a page removed from the sitemap
   stops being advertised to assistants too. One list, not two. */
function pagesFromSitemap() {
  const xml = readFileSync(`${ROOT}/sitemap.xml`, 'utf8');
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => {
    const url = m[1];
    const path = url.slice(SITE.length);
    /* "/" is index.html on GitHub Pages. Everything else is a real filename. */
    const file = path === '/' || path === '' ? 'index.html' : path.replace(/^\//, '');
    return { url, file };
  });
}

/* ---------------------------------------------------------------- */
/* HTML to text                                                     */
/* ---------------------------------------------------------------- */

const NAMED = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  copy: '(c)', middot: '·', hellip: '...', ndash: '–', rsquo: '’',
  lsquo: '‘', ldquo: '“', rdquo: '”', deg: '°',
};

/* Every numeric entity on this site is decorative: tick and cross marks, the
   hamburger, the lightbox close. The yes/no meaning that the ticks carry lives
   in the <li class="yes|no"> around them, which is read below, so the glyphs
   themselves are dropped rather than transliterated. A bare "10003" in the
   text would be worse than useless. */
const NUMERIC = {
  10003: '', 10004: '', 10007: '', 10005: '',
  9776: '', 9737: '', 8635: '', 9998: '',
};

function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => (n in NUMERIC ? NUMERIC[n] : String.fromCodePoint(+n)))
    .replace(/&([a-zA-Z]+);/g, (whole, name) => (name in NAMED ? NAMED[name] : whole));
}

function strip(html, tag) {
  return html.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`, 'gi'), ' ');
}

/* Block boundaries are marked with a character that cannot occur in the source,
   so the whitespace inside a block can be flattened without losing the split
   between blocks. Doing it any other way means a <br> or a wrapped source line
   turns one sentence into two, which is exactly the kind of damage that makes
   an extracted quote read wrong. */
const SPLIT = '\u0000';

function pageText(html) {
  /* The nav and the footer are byte-identical on all eight pages. Repeating
     them eight times would be most of the file and none of the meaning. */
  let s = html.slice(html.indexOf('<main>') + 6, html.lastIndexOf('</main>'));

  s = s.replace(/<!--[\s\S]*?-->/g, ' ');
  for (const t of ['script', 'style', 'svg', 'noscript', 'button']) s = strip(s, t);

  /* Headings keep their level, so the document outline survives the trip. */
  s = s.replace(/<h1\b[^>]*>/gi, `${SPLIT}# `).replace(/<h2\b[^>]*>/gi, `${SPLIT}## `);
  s = s.replace(/<h3\b[^>]*>/gi, `${SPLIT}### `).replace(/<h4\b[^>]*>/gi, `${SPLIT}#### `);
  s = s.replace(/<\/h[1-4]>/gi, SPLIT);

  /* The yes/no lists set the meaning on the <li> and leave the glyph purely
     visual, so the class is what gets read. Specific before generic. */
  s = s.replace(/<li\b[^>]*class="[^"]*\byes\b[^"]*"[^>]*>/gi, `${SPLIT}- Yes: `);
  s = s.replace(/<li\b[^>]*class="[^"]*\bno\b[^"]*"[^>]*>/gi, `${SPLIT}- No: `);
  s = s.replace(/<li\b[^>]*>/gi, `${SPLIT}- `);
  s = s.replace(/<br\s*\/?>/gi, ' ');
  s = s.replace(/<\/(td|th)>\s*<(td|th)\b[^>]*>/gi, ' | ');
  s = s.replace(/<\/tr>/gi, SPLIT);
  s = s.replace(/<\/(p|div|section|article|aside|blockquote|ul|ol|figure|table)>/gi, SPLIT);

  s = s.replace(/<[^>]+>/g, '');
  s = decode(s);

  /* One block to a line, all internal wrapping removed. */
  const blocks = s.split(SPLIT)
    .map((b) => b.replace(/\s+/g, ' ').trim())
    .map((b) => b.replace(/^\|\s*/, ''))          // an empty leading table cell
    .filter((b) => b && b !== '-' && !/^-\s*(Yes|No):$/.test(b) && !/^#{1,4}$/.test(b));

  /* A blank line before each heading, so the outline is visible at a glance. */
  return blocks.map((b) => (/^#{1,4} /.test(b) ? '\n' + b : b)).join('\n').trim();
}

const meta = (html, re) => {
  const m = html.match(re);
  return m ? decode(m[1]).trim() : '';
};

/* ---------------------------------------------------------------- */
/* Build                                                            */
/* ---------------------------------------------------------------- */

function build() {
  const pages = pagesFromSitemap();
  const first = readFileSync(`${ROOT}/${pages[0].file}`, 'utf8');
  /* The reviewed date is bound in the shared footer, so it is already correct
     in the HTML by the time we run. Read it there rather than from stats.json,
     for the same reason every other figure here is read from the HTML. */
  const reviewed = meta(first, /data-stat="reviewed"[^>]*>([^<]*)</) || 'unknown';

  const out = [];
  out.push('# Imagineers.ai: full site content');
  out.push('');
  out.push('> Imagineers.ai is a South African firm that runs AI executive training, provides');
  out.push('> fractional CAiO (Chief AI Officer) services, and delivers forward-deployed AI');
  out.push('> engineering (FDE). Founded by Rutger-Jan van Spaandonk and Chris Barker.');
  out.push('');
  out.push(`Every published page, in full, as plain text. Site last reviewed ${reviewed}.`);
  out.push('The short index version is at https://www.imagineers.ai/llms.txt');
  out.push('');
  out.push('Generated from the published HTML by sh/build-llms-full.mjs. Do not hand-edit:');
  out.push('the next commit overwrites it. Headline figures come from stats.json.');

  for (const { url, file } of pages) {
    const html = readFileSync(`${ROOT}/${file}`, 'utf8');
    out.push('');
    out.push('='.repeat(78));
    out.push('');
    out.push(`URL: ${url}`);
    out.push(`Title: ${meta(html, /<title>([^<]*)<\/title>/i)}`);
    out.push(`Description: ${meta(html, /<meta name="description" content="([^"]*)"/i)}`);
    out.push('');
    out.push(pageText(html));
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

/* ---------------------------------------------------------------- */

const text = build();

if (CHECK) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : null;
  if (current === text) {
    console.log(`${GRN}  llms-full.txt is in step with the pages.${OFF}`);
    process.exit(0);
  }
  console.log(`${RED}  llms-full.txt is stale.${OFF} It no longer matches the published pages.`);
  console.log(`${DIM}  Regenerate it with:  sh/build-llms-full.sh${OFF}`);
  process.exit(1);
}

const before = existsSync(OUT) ? readFileSync(OUT, 'utf8') : null;
if (before === text) {
  console.log(`${DIM}llms-full.txt already in step with the pages. Nothing to write.${OFF}`);
} else {
  writeFileSync(OUT, text);
  const kb = (Buffer.byteLength(text) / 1024).toFixed(1);
  console.log(`${GRN}Wrote llms-full.txt${OFF} ${DIM}(${kb} KB from ${pagesFromSitemap().length} pages)${OFF}`);
}

if (process.argv.includes('--porcelain')) {
  console.log('---FILES---');
  if (before !== text) console.log('llms-full.txt');
}
