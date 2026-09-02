/* ==========================================================================
   apply-brand.mjs   (run it via sh/apply.sh, or let the pre-commit
                      hook run it for you)

   brand-entity.json is the single source of truth for WHO this company is,
   the way stats.json is the single source of truth for the numbers. This
   writes it into the pages.

   ---------------------------------------------------------------------------
   WHAT IT CONTROLS

     1. The company block in the structured data on every page. Any JSON-LD
        node carrying  "@id": ".../#organisation"  is rewritten from
        brand-entity.json.

     2. The two founder blocks, matched the same way on their own @id.

     3. Any visible element carrying  data-brand="description"  (or any other
        top-level string field in brand-entity.json).

   Nothing else. It deliberately does not touch page copy, because a canonical
   description is a fact about the company, not a substitute for writing.

   ---------------------------------------------------------------------------
   WHY IT SPLICES RATHER THAN REFORMATS

   The lazy build parses the whole JSON-LD block, mutates it and reserialises.
   That works and produces a thousand-line diff on the first run, because the
   hand formatting of every other node is thrown away. Worse, it makes every
   page look changed, and sh/apply-dates.mjs reads "changed" as "the content
   was updated" and stamps a new date on all of them.

   So this finds the exact character span of the node it is replacing, by
   brace-matching, and splices the replacement in at the original indent.
   Everything else in the block is byte-identical afterwards. A page that is
   already correct is not rewritten at all.

   ---------------------------------------------------------------------------
   MERGE RULE

   Canonical fields win; page-specific fields survive. That is what lets
   about.html carry a longer bio on each founder while every page still gets
   the same name, url, jobTitle, worksFor and sameAs. If you want a field gone
   everywhere, remove it from the page, not from here.

   MODES
     (default)     Write.
     --check       Compare only, exit 1 on drift. Wired into
                   sh/check-stats.sh, so the pre-push hook blocks a hand-edit.
     --porcelain   ---FILES--- list for the hook.

   No npm, no dependencies. Node's standard library only.
   ========================================================================== */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const ROOT = process.cwd();
const CHECK = process.argv.includes('--check');
const PORCELAIN = process.argv.includes('--porcelain');

const RED = '\x1b[31m', GRN = '\x1b[32m', YEL = '\x1b[33m', DIM = '\x1b[2m', OFF = '\x1b[0m';

const brand = JSON.parse(readFileSync(`${ROOT}/brand-entity.json`, 'utf8'));
const SITE = 'https://www.imagineers.ai';
const ORG_ID = `${SITE}/#organisation`;

/* ---------------------------------------------------------------- */
/* The canonical nodes, built from brand-entity.json                */
/* ---------------------------------------------------------------- */

function orgNode() {
  const addr = (a) => ({ '@type': 'PostalAddress', addressLocality: a.addressLocality, addressRegion: a.addressRegion, addressCountry: a.addressCountry });
  return {
    '@type': ['Organization', 'EducationalOrganization'],
    '@id': ORG_ID,
    name: brand.name,
    alternateName: brand.alternateName,
    legalName: brand.legalName,
    url: brand.url,
    logo: `${SITE}/imagineers%20logo.webp`,
    email: brand.email,
    foundingDate: brand.foundingDate,
    description: brand.description,
    address: [addr(brand.address), addr(brand.addressSecondary)],
    contactPoint: [
      { '@type': 'ContactPoint', contactType: 'sales', name: 'Masterclass and private cohorts', email: 'masterclass@imagineers.ai', areaServed: 'ZA', availableLanguage: ['en'] },
      { '@type': 'ContactPoint', contactType: 'customer support', name: 'CAiO, engineering and everything else', email: brand.email, areaServed: 'ZA', availableLanguage: ['en'] },
    ],
    areaServed: [
      { '@type': 'Country', name: brand.areaServed.country },
      ...brand.areaServed.cities.map((c) => ({ '@type': 'City', name: c })),
    ],
    sameAs: brand.sameAs,
    founder: brand.people.map((p) => ({ '@id': `${SITE}/#${p.id}` })),
  };
}

function personNode(p) {
  return {
    '@type': 'Person',
    '@id': `${SITE}/#${p.id}`,
    name: p.name,
    jobTitle: `${p.jobTitle}, ${brand.name}`,
    url: `${SITE}/about.html#${p.id}`,
    worksFor: { '@id': ORG_ID },
    sameAs: p.sameAs,
  };
}

const CANON = new Map([[ORG_ID, orgNode()]]);
for (const p of brand.people) CANON.set(`${SITE}/#${p.id}`, personNode(p));

/* ---------------------------------------------------------------- */
/* Finding a node's exact character span in the raw JSON-LD          */
/* ---------------------------------------------------------------- */

/* Brace-match forward from an opening "{", skipping over anything inside a
   string so a "}" in a description cannot end the object early. */
function spanFrom(text, open) {
  let depth = 0, inStr = false, esc = false;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return i + 1; }
  }
  return -1;
}

/* The outermost object that carries this @id AND is a real node rather than a
   bare  { "@id": "..." }  cross-reference. References are how the graph links
   nodes together and must be left exactly as they are. */
function findNode(text, id) {
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '{') continue;
    const end = spanFrom(text, i);
    if (end < 0) continue;
    const raw = text.slice(i, end);
    let obj;
    try { obj = JSON.parse(raw); } catch { continue; }
    if (obj['@id'] === id && Object.keys(obj).length > 1) return { start: i, end, obj, raw };
    /* No skipping ahead. The whole JSON-LD block is itself one object, so the
       first "{" always parses and never matches, and jumping past it would
       skip every real node inside it. Scanning left to right still returns the
       outermost match, which is what we want. */
  }
  return null;
}

/* Indent a serialised object to sit where the original sat. */
function serialise(obj, baseIndent) {
  return JSON.stringify(obj, null, 2).split('\n').map((l, n) => (n === 0 ? l : baseIndent + l)).join('\n');
}

function indentOf(text, start) {
  const lineStart = text.lastIndexOf('\n', start) + 1;
  const before = text.slice(lineStart, start);
  return /^\s*$/.test(before) ? before : ' '.repeat(before.length);
}

/* ---------------------------------------------------------------- */
/* Rewriting one file                                               */
/* ---------------------------------------------------------------- */

function rewrite(html) {
  let out = html;

  /* --- structured data --- */
  out = out.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (_m, open, block, close) => {
    let b = block;
    for (const [id, canon] of CANON) {
      const found = findNode(b, id);
      if (!found) continue;
      const merged = { ...found.obj, ...canon };
      /* Key order: canonical fields first, then whatever the page added. */
      const ordered = {};
      for (const k of Object.keys(canon)) ordered[k] = merged[k];
      for (const k of Object.keys(found.obj)) if (!(k in ordered)) ordered[k] = merged[k];
      const text = serialise(ordered, indentOf(b, found.start));
      if (text === found.raw) continue;
      b = b.slice(0, found.start) + text + b.slice(found.end);
    }
    return open + b + close;
  });

  /* --- visible bindings --- */
  out = out.replace(
    /(<([a-z]+)[^>]*\bdata-brand="([a-zA-Z]+)"[^>]*>)([\s\S]*?)(<\/\2>)/gi,
    (m, openTag, _tag, field, _inner, closeTag) => {
      const value = brand[field];
      if (typeof value !== 'string') {
        console.error(`${RED}  data-brand="${field}" has no matching string in brand-entity.json${OFF}`);
        return m;
      }
      return openTag + value + closeTag;
    },
  );

  return out;
}

/* ---------------------------------------------------------------- */
/* Main                                                             */
/* ---------------------------------------------------------------- */

const FILES = readdirSync(ROOT).filter((f) => f.endsWith('.html')).sort();
const changed = [];

for (const f of FILES) {
  const path = `${ROOT}/${f}`;
  const before = readFileSync(path, 'utf8');
  const after = rewrite(before);
  if (before === after) continue;
  changed.push(f);
  if (!CHECK) writeFileSync(path, after);
}

if (CHECK) {
  if (changed.length) {
    for (const f of changed) console.error(`${RED}  ✗ ${f}: the company or founder details do not match brand-entity.json${OFF}`);
    console.error(`\n${DIM}Run  sh/apply.sh  to rewrite them, then commit.${OFF}`);
    process.exit(1);
  }
  console.log(`${GRN}  ✓ company and founder details match brand-entity.json${OFF}`);
  process.exit(0);
}

if (changed.length) {
  console.log(`${YEL}  brand-entity.json written into:${OFF}`);
  for (const f of changed) console.log(`    ${f}`);
} else {
  console.log(`${DIM}  brand: every page already matches brand-entity.json${OFF}`);
}

if (PORCELAIN) {
  console.log('---FILES---');
  for (const f of changed) console.log(f);
}
