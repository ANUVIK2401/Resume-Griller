import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = name => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), 'utf8'));
const file = name => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
test('numbers rehearsal includes defensible counts without ambiguous INT8 comparisons', () => {
  const profile = read('profile');
  assert.ok(!profile.numbers.some(item => ['ms-int8-mem', 'ms-int8-tps'].includes(item.id)));
  const dashboards = profile.numbers.find(item => item.id === 'oracle-dashboards');
  assert.match(dashboards.fact, /dashboards and alert rules/);
  assert.match(dashboards.q, /combined|total/);
  assert.equal(dashboards.a, '47');
});
test('print pages are generated from current data', async () => {
  const { renderAll } = await import('./print_pages.mjs');
  for (const [name, text] of Object.entries(renderAll())) assert.equal(file(name), text, `${name} is stale`);
});
test('final review has the day, the 8 LP openers, the cue card, and one page per domain', () => {
  const html = file('final-review.html');
  const domains = read('domains').domains;
  assert.equal((html.match(/class="page break"/g) || []).length, 1 + domains.length);
  for (const lp of read('behavioral').lps.filter(l => l.named)) assert.ok(html.includes(lp.name.replace(/&/g, '&amp;')), lp.name);
  assert.match(html, /Printed resume, 5 copies/);
  assert.match(html, /benchmark a smaller number format/);
  assert.doesNotMatch(html, /<script/);
  const md = file('FINAL-REVIEW.md');
  for (const d of domains) assert.ok(md.includes(`## ${d.name}`), d.name);
});
test('handout uses only profile numbers and draws bars in the measured order', () => {
  const html = file('presentation-handout.html');
  for (const n of ['2299 MB', '62%', '13.7', '53%', '2.1x']) assert.ok(html.includes(n), n);
  const widths = [...html.matchAll(/style="width: ([\d.]+)%"/g)].map(m => Number(m[1]));
  assert.deepEqual(widths, [100, 58.1, 38]);
  assert.match(html, /@page \{ size: letter/);
});
