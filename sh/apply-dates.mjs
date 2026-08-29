/* ==========================================================================
   apply-dates.mjs   (run it via sh/apply-dates.sh, or let the pre-commit
                      hook run it for you)

   Keeps the published and last-updated date on every page true, without you
   ever typing one. sh/page-dates.json is the source of truth; this writes it
   into the HTML.

   ---------------------------------------------------------------------------
   WHY THE MODIFIED DATE MOVES PER PAGE AND NOT PER PUSH

   The obvious build is "stamp today's date on everything at deploy time". It
   is also the wrong one. Pushing this repo publishes it, and a push that fixes
   one typo would then tell Google that all ten pages were updated that day.
   Do that for a few months and the dates stop carrying information, which is
   exactly when a search or answer engine starts ignoring them, and an ignored
   date is worse than no date because you paid for it with credibility.

   So: a page's modified date moves when THAT PAGE's own content changed in
   THAT commit, and not otherwise. Which pages changed is read from git, not
   guessed. The published date is written once and then never touched again.
   ---------------------------------------------------------------------------

   WHERE IT WRITES

     Visible text   <span data-page-date="published|modified">20 August 2026</span>
     JSON-LD        "datePublished": "2026-08-20"
                    "dateModified":  "2026-08-20"

   Two renderings of one stored value, so they cannot drift apart. Nothing
   else in the repo is allowed to write either of them.

   MODES

     (default)     Bump the changed pages, then write every page.
     --check       Write nothing; compare the HTML against page-dates.json and
                   exit 1 on any mismatch. sh/check-stats.sh and the pre-push
                   hook use this, so a hand-edited date blocks the push the
                   same way a wrong headline figure does.
     --porcelain   Machine output for the hook: a ---FILES--- list of what
                   changed, in the same shape sh/apply-stats.mjs emits.

   No npm, no dependencies. Node's standard library only.
   ========================================================================== */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SRC = `${ROOT}/sh/page-dates.json`;

const CHECK = process.argv.includes('--check');
const PORCELAIN = process.argv.includes('--porcelain');

const RED = '\x1b[31m', GRN = '\x1b[32m', YEL = '\x1b[33m', DIM = '\x1b[2m', OFF = '\x1b[0m';

const doc = JSON.parse(readFileSync(SRC, 'utf8'));
const pages = doc.pages;

/* ---------------------------------------------------------------- */
/* Dates                                                            */
/* ---------------------------------------------------------------- */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

/* Local date, not UTC. A commit made at 01:00 in Johannesburg is the 29th
   here and the 28th in UTC, and the visible byline should agree with the
   person who made the commit. */
function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* "2026-08-20" -> "20 August 2026". British order, month spelled out, because
   08/09/2026 means two different days depending on who is reading it. */
function human(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

const isISO = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

/* ---------------------------------------------------------------- */
/* Which pages changed in this commit                               */
/* ---------------------------------------------------------------- */

/* Two sources, and both are needed.
     --cached   what you staged yourself.
     (unstaged) what sh/apply-stats.mjs rewrote a moment ago, which the hook
                has not staged yet at the point this runs.
   A page rewritten because a headline figure moved has genuinely changed for
   a reader, so it counts as modified. */
function changedPages() {
  const run = (args) => {
    try {
      return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' })
        .split('\n').map((s) => s.trim()).filter(Boolean);
    } catch {
      return []; /* not a git repo, or no HEAD yet. Bump nothing. */
    }
  };
  const names = new Set([
    ...run(['diff', '--cached', '--name-only']),
    ...run(['diff', '--name-only']),
  ]);
  return [...names].filter((f) => f.endsWith('.html') && f in pages);
}

/* ---------------------------------------------------------------- */
/* Writing into one page                                            */
/* ---------------------------------------------------------------- */

/* Both slots are explicitly labelled, so unlike the headline figures there is
   no guessing and no state file. If the attribute is not there, nothing is
   written, which is how index.html and the service pages opt out of a visible
   byline while still carrying the dates in their JSON-LD. */
function render(html, iso) {
  let out = html;

  for (const key of ['published', 'modified']) {
    const re = new RegExp(
      `(<([a-z]+)[^>]*\\bdata-page-date="${key}"[^>]*>)([\\s\\S]*?)(</\\2>)`,
      'gi',
    );
    out = out.replace(re, (_m, open, _tag, _inner, close) => open + human(iso[key]) + close);
  }

  out = out.replace(/("datePublished"\s*:\s*")[^"]*(")/g, `$1${iso.published}$2`);
  out = out.replace(/("dateModified"\s*:\s*")[^"]*(")/g, `$1${iso.modified}$2`);

  return out;
}

/* ---------------------------------------------------------------- */
/* Main                                                             */
/* ---------------------------------------------------------------- */

const problems = [];
const written = [];
const bumped = [];

/* Validate the source before it can put a bad date on the live site. */
for (const [file, d] of Object.entries(pages)) {
  if (d.published && !isISO(d.published)) problems.push(`${file}: published "${d.published}" is not YYYY-MM-DD`);
  if (d.modified && !isISO(d.modified)) problems.push(`${file}: modified "${d.modified}" is not YYYY-MM-DD`);
  if (d.published && d.modified && d.modified < d.published) {
    problems.push(`${file}: modified ${d.modified} is before published ${d.published}`);
  }
  if (!existsSync(`${ROOT}/${file}`)) problems.push(`${file}: listed in page-dates.json but not on disk`);
}
if (problems.length) {
  for (const p of problems) console.error(`${RED}  ${p}${OFF}`);
  console.error(`\n${RED}page-dates.json is not usable. Fix the lines above.${OFF}`);
  process.exit(1);
}

if (!CHECK) {
  const today = todayISO();
  let sourceChanged = false;

  for (const file of changedPages()) {
    const d = pages[file];
    if (!d.published) { d.published = today; sourceChanged = true; }
    if (d.modified !== today) { d.modified = today; sourceChanged = true; bumped.push(file); }
  }

  if (sourceChanged) {
    /* Rewrite only the date values, in place, so the comments and the hand
       formatting in page-dates.json survive. Reserialising the parsed object
       would throw all of that away on the first commit. */
    let raw = readFileSync(SRC, 'utf8');
    for (const [file, d] of Object.entries(pages)) {
      const esc = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      raw = raw.replace(
        new RegExp(`("${esc}"\\s*:\\s*\\{[^}]*?"published"\\s*:\\s*")[^"]*("[^}]*?"modified"\\s*:\\s*")[^"]*(")`),
        `$1${d.published}$2${d.modified}$3`,
      );
    }
    writeFileSync(SRC, raw);
    written.push('sh/page-dates.json');
  }
}

for (const [file, d] of Object.entries(pages)) {
  const path = `${ROOT}/${file}`;
  const before = readFileSync(path, 'utf8');
  const after = render(before, d);
  if (before === after) continue;

  if (CHECK) {
    problems.push(`${file}: a date on the page does not match sh/page-dates.json (${d.published} published, ${d.modified} updated)`);
  } else {
    writeFileSync(path, after);
    written.push(file);
  }
}

if (CHECK) {
  if (problems.length) {
    for (const p of problems) console.error(`${RED}  ✗ ${p}${OFF}`);
    console.error(`\n${RED}Dates on the pages disagree with sh/page-dates.json.${OFF}`);
    console.error(`${DIM}Run  sh/apply-dates.sh  to rewrite them, then commit.${OFF}`);
    process.exit(1);
  }
  console.log(`${GRN}  ✓ every page date matches sh/page-dates.json${OFF}`);
  process.exit(0);
}

if (bumped.length) {
  console.log(`${YEL}  last updated -> ${human(todayISO())}:${OFF}`);
  for (const f of bumped) console.log(`    ${f}`);
} else {
  console.log(`${DIM}  dates: no page content changed, nothing bumped${OFF}`);
}

if (PORCELAIN) {
  console.log('---FILES---');
  for (const f of written) console.log(f);
}
