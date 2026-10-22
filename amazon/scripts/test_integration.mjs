import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const root = new URL('../../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const site = JSON.parse(read('amazon/data/site.json'));
for (const id of ['home', 'domains', 'behavioral', 'presentation', 'mock', 'review', 'cheatsheet', 'architecture', 'aws', 'compare', 'design', 'fundamentals', 'questions']) {
  const page = site.pages.find(page => page.id === id);
  assert.ok(page, `Missing navigation: ${id}`);
  assert.ok(existsSync(new URL(`amazon/${page.href}`, root)), `Missing page: ${page.href}`);
  const html = read(`amazon/${page.href}`);
  assert.match(html, new RegExp(`data-page="${id}"`));
  for (const [, src] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (/^(https?:|data:)/.test(src)) continue;
    assert.ok(existsSync(new URL(src, new URL(`amazon/${page.href}`, root))), `${page.href}: missing asset ${src}`);
  }
}
const landing = read('index.html');
assert.match(landing, /Amazon Solutions Architect/);
assert.match(landing, />Amazon SA Prep →</);
assert.match(landing, />Salesforce Prep →</);
assert.match(landing, /amazon\/review.html/);
assert.match(landing, /amazon\/cheatsheet.html/);
assert.ok(existsSync(new URL('general-prep.html', root)));
const checker = read('amazon/scripts/check.mjs');
assert.match(checker, /msrcosmos: \['2026-06', '2026-08'\]/);
assert.match(checker, /Oracle tenure is "nearly 3 years" or "about 3 years"/);
for (const page of ['presentation-handout.html', 'final-review.html', 'FINAL-REVIEW.md']) assert.ok(existsSync(new URL(`amazon/${page}`, root)), `Missing ${page}`);
console.log('Integration checks passed: 13 navigation routes, print pages, local assets, Amazon entry, resume-aligned policy.');
