import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = name => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), 'utf8'));
test('numbers rehearsal includes defensible counts without ambiguous INT8 comparisons', () => {
  const profile = read('profile');
  assert.ok(!profile.numbers.some(item => ['ms-int8-mem', 'ms-int8-tps'].includes(item.id)));
  const dashboards = profile.numbers.find(item => item.id === 'oracle-dashboards');
  assert.match(dashboards.fact, /dashboards and alert rules/);
  assert.match(dashboards.q, /combined|total/);
  assert.equal(dashboards.a, '47');
});
test('final preparation card is generated from the tentative target and actual sprint', async () => {
  const { render } = await import('./finalprep_md.mjs');
  const loop = read('loop');
  const rendered = render(loop, read('profile'));
  assert.match(rendered, /Wednesday, October 28, 2026/);
  assert.match(rendered, /Tentative/);
  assert.match(rendered, /94.*26/);
  assert.match(rendered, /failure.*disagreement.*mentoring/i);
  assert.equal(readFileSync(new URL('../FINAL-PREP.md', import.meta.url), 'utf8'), rendered);
});
