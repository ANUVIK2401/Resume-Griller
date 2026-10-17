import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const root = new URL('../../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const site = JSON.parse(read('amazon/data/site.json'));
for (const id of ['home', 'review', 'behavioral', 'cheatsheet', 'architecture', 'aws', 'design', 'questions', 'mock']) {
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
assert.match(landing, /amazon\/review.html/);
assert.match(landing, /amazon\/cheatsheet.html/);
assert.ok(existsSync(new URL('general-prep.html', root)));
const checker = read('amazon/scripts/check.mjs');
assert.doesNotMatch(checker, /Sports Analytics is volunteer research/);
assert.doesNotMatch(checker, /Oracle tenure is "close to 3 years"/);
console.log('Integration checks passed: 9 navigation routes, local assets, Amazon entry, resume-aligned policy.');
