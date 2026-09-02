/* One-off helper: wrap keyword-anchored figures in body prose with an explicit
   data-stat-text slot, so apply-stats pass A owns them and pass B never has to
   guess. Run with --write to apply; default is a dry run.

   Deliberately conservative. It only touches a number that
     - sits in a text node, never inside a tag or an attribute value,
     - is outside <head>, <script> and <style>,
     - is not already inside a data-stat element,
     - reads exactly one of the two forms stats.json allows, the full "800+"
       which binds with data-stat-text, or the bare "800" which binds with
       data-stat-num so the suffix is not forced into a sentence,
     - and has exactly one candidate stat within the keyword window.
   Anything else is reported and left alone for a human. */

import { readFileSync, writeFileSync } from 'node:fs';
import { ROOT, stats, HTML_FILES, KEYWORDS, WINDOW, expected, group, maskNonStats,
         boundRanges, RED, GRN, YEL, DIM, OFF } from './stats-lib.mjs';

const WRITE = process.argv.includes('--write');
let wrapped = 0, skipped = 0;

for (const file of HTML_FILES) {
  const raw = readFileSync(`${ROOT}/${file}`, 'utf8');

  /* Regions we must not touch. */
  const forbidden = [];
  for (const re of [/<head[\s\S]*?<\/head>/gi, /<script[\s\S]*?<\/script>/gi, /<style[\s\S]*?<\/style>/gi]) {
    for (const m of raw.matchAll(re)) forbidden.push([m.index, m.index + m[0].length]);
  }
  for (const m of raw.matchAll(/<[^>]*>/g)) forbidden.push([m.index, m.index + m[0].length]);
  for (const r of boundRanges(raw)) forbidden.push(r);
  const blocked = (a, b) => forbidden.some(([x, y]) => a < y && b > x);

  const { text: masked } = maskNonStats(raw);

  const edits = [];
  for (const [name, keyword] of KEYWORDS) {
    if (typeof stats[name] === 'string') continue;

    /* Two spellings a page may use, and they need different attributes.
       The full form "800+" binds with data-stat-text. The bare form "800",
       which prose uses in "800 executives have shown us", binds with
       data-stat-num so the suffix is not forced into the sentence. */
    const full = expected(name);
    const bare = group(stats[name].value);
    const forms = full === bare
      ? [{ text: full, attr: 'data-stat-text' }]
      : [{ text: full, attr: 'data-stat-text' }, { text: bare, attr: 'data-stat-num' }];

    for (const km of masked.matchAll(keyword)) {
      const from = Math.max(0, km.index - WINDOW);
      const to = Math.min(raw.length, km.index + km[0].length + WINDOW);

      for (const form of forms) {
        let idx = raw.indexOf(form.text, from);
        while (idx !== -1 && idx < to) {
          const end = idx + form.text.length;
          /* "800" sitting inside "800+" belongs to the full form, not this one. */
          const isPrefixOfFuller = form.attr === 'data-stat-num'
            && raw.startsWith(full, idx);
          if (!isPrefixOfFuller && !blocked(idx, end) && !edits.some(e => e.at === idx)) {
            edits.push({ at: idx, len: form.text.length, name, want: form.text, attr: form.attr });
          }
          idx = raw.indexOf(form.text, idx + 1);
        }
      }
    }
  }

  /* Two stats claiming the same characters means we cannot be sure. Drop both. */
  const byPos = new Map();
  for (const e of edits) {
    if (!byPos.has(e.at)) byPos.set(e.at, []);
    byPos.get(e.at).push(e);
  }
  const safe = [];
  for (const [, claims] of byPos) {          // not `group`: that is the imported formatter
    if (claims.length === 1) safe.push(claims[0]);
    else { skipped += claims.length; console.log(`${YEL}  ambiguous ${OFF}${file} @${claims[0].at}: ${claims.map(c=>c.name).join(' vs ')}`); }
  }

  safe.sort((a, b) => b.at - a.at);
  let out = raw;
  for (const e of safe) {
    const line = raw.slice(0, e.at).split('\n').length;
    const ctx = raw.slice(Math.max(0, e.at - 45), e.at + 55).replace(/\s+/g, ' ').trim();
    console.log(`${GRN}  bind  ${OFF}${file}:${line}  ${DIM}[${e.name} via ${e.attr}]${OFF} ...${ctx}...`);
    out = out.slice(0, e.at) + `<span ${e.attr}="${e.name}">${e.want}</span>` + out.slice(e.at + e.len);
    wrapped++;
  }
  if (WRITE && out !== raw) writeFileSync(`${ROOT}/${file}`, out);
}

console.log(`\n${wrapped} figure(s) ${WRITE ? 'bound' : 'would be bound'}, ${skipped} left for a human.`);
