/* ==========================================================================
   apply-stats.mjs   (run it via sh/apply.sh, or let the pre-commit
                      hook run it for you)

   Writes the numbers in stats.json into every published file. This is the
   thing that makes "edit stats.json and nothing else" literally true.

   Two jobs, and neither of them guesses.

     BOUND   Every data-stat / data-stat-text / data-stat-num element gets its
             visible text rewritten from stats.json. The attribute says which
             stat it is, so there is nothing to work out and no state to keep.

     LLMS    llms.txt is rendered from sh/llms.txt.tmpl, which holds {{tokens}}
             where the figures go. Plain text cannot carry an attribute, so a
             template is the only way it can be exact. Edit the template.

   What used to be here, and why it is gone
   ----------------------------------------
   There was a third pass that found hand-typed figures by remembering the
   previous value and looking for it near a keyword, using a committed state
   file, sh/.stats-applied.json. It existed for one reason: a <meta> content
   attribute and a JSON-LD string cannot carry a data-stat attribute, so 23
   figures had nothing to bind them.

   Removed 2 September 2026. Those 23 now come from sh/page-meta.json via
   sh/apply-meta.mjs, which finds each string by a structural anchor that has
   no number in it: a tag, an attribute selector, a JSON-LD @id, a question.
   The remaining loose figures in prose were bound outright. Nothing is located
   by its own value any more, so nothing has to remember what it used to be.

   Do not reintroduce a value-matching pass. If a new figure cannot be bound,
   give it an anchor in sh/page-meta.json instead.

   After both jobs, sh/check-stats.sh should always exit 0. The pre-push hook
   proves that independently, so a bug in here cannot silently ship.
   ========================================================================== */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import {
  ROOT, stats, HTML_FILES, RED, GRN, DIM, OFF,
  expected, wantedFor,
} from './stats-lib.mjs';

const TMPL  = `${ROOT}/sh/llms.txt.tmpl`;

/* ---------------------------------------------------------------- */
/* llms.txt is rendered, not written                                */
/* ---------------------------------------------------------------- */

function renderLlms() {
  const tmpl = readFileSync(TMPL, 'utf8');
  return tmpl.replace(/\{\{(\w+)\}\}/g, (whole, name) => {
    if (!(name in stats)) {
      throw new Error(`sh/llms.txt.tmpl uses {{${name}}}, which is not in stats.json`);
    }
    return expected(name);
  });
}

/* --check rebuilds it in memory and compares, writing nothing. Same shape as
   apply-brand --check and build-llms-full --check, so sh/check-stats.sh can
   treat all three the same way. A hand-edit of llms.txt, a stale copy and a
   template edited without running the hook all fail here identically. */
if (process.argv.includes('--check')) {
  const want = renderLlms();
  const have = existsSync(`${ROOT}/llms.txt`)
    ? readFileSync(`${ROOT}/llms.txt`, 'utf8')
    : null;

  if (have === want) {
    console.log(`${GRN}  llms.txt is in step with sh/llms.txt.tmpl.${OFF}`);
    process.exit(0);
  }

  console.log(`${RED}  llms.txt does not match sh/llms.txt.tmpl.${OFF}`);
  if (have === null) {
    console.log(`${DIM}  llms.txt is missing entirely.${OFF}`);
  } else {
    /* Name the first differing line, because "they differ" is not actionable. */
    const a = have.split('\n'), b = want.split('\n');
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i] !== b[i]) {
        console.log(`${DIM}  first difference at llms.txt:${i + 1}${OFF}`);
        console.log(`${DIM}    file:     ${OFF}${(a[i] ?? '(end of file)').trim().slice(0, 100)}`);
        console.log(`${DIM}    template: ${OFF}${(b[i] ?? '(end of file)').trim().slice(0, 100)}`);
        break;
      }
    }
  }
  console.log(`${DIM}  llms.txt is generated. Edit sh/llms.txt.tmpl, then run sh/apply.sh.${OFF}`);
  process.exit(1);
}

/* ---------------------------------------------------------------- */
/* Rewrite the HTML                                                 */
/* ---------------------------------------------------------------- */

const changed = [];

for (const file of HTML_FILES) {
  const before = readFileSync(`${ROOT}/${file}`, 'utf8');
  let text = before;

  /* --- Bound slots ---------------------------------------------- */

  text = text.replace(
    /(<([a-z]+)[^>]*\bdata-stat(-text|-num)?="([^"]+)"[^>]*>)([^<]*)(<)/gi,
    (whole, open, tag, variant, name, inner, close) => {
      if (!(name in stats)) return whole;
      return open + wantedFor(variant, name) + close;
    }
  );

  if (text !== before) {
    writeFileSync(`${ROOT}/${file}`, text);
    changed.push(file);
  }
}

/* ---------------------------------------------------------------- */
/* Render llms.txt from its template                                */
/* ---------------------------------------------------------------- */

{
  const want = renderLlms();
  const path = `${ROOT}/llms.txt`;
  const have = existsSync(path) ? readFileSync(path, 'utf8') : null;
  if (have !== want) {
    writeFileSync(path, want);
    changed.push('llms.txt');
  }
}


/* ---------------------------------------------------------------- */

if (changed.length) {
  console.log(`${GRN}Applied stats.json to ${changed.length} file(s):${OFF}`);
  for (const f of changed) console.log(`  ${f}`);
} else {
  console.log(`${DIM}Every published file already matches stats.json. Nothing to write.${OFF}`);
}

/* The hook needs the list, so print it machine-readably on the last line. */
const touched = changed;
if (process.argv.includes('--porcelain')) {
  console.log('---FILES---');
  for (const f of touched) console.log(f);
}
