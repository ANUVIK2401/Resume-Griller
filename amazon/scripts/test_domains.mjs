// Domain banks and concept figures: every figure spec is drawable, and figures.js renders each type.
// Run: node --test amazon/scripts/test_domains.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const domains = JSON.parse(readFileSync(new URL('../data/domains.json', import.meta.url), 'utf8')).domains;
const figures = domains.flatMap(d => d.figures.map(f => ({ ...f, domain: d.id })));

test('every figure spec has the parts its type needs', () => {
  for (const f of figures) {
    const where = `${f.domain}: ${f.title}`;
    if (['stack', 'pyramid', 'flow'].includes(f.type)) assert.ok(f.items?.length >= 2, where);
    if (f.type === 'sequence') {
      assert.ok(f.actors?.length >= 2 && f.steps?.length >= 1, where);
      for (const s of f.steps) assert.ok(s.from < f.actors.length && s.to < f.actors.length, `${where}: step points at a missing actor`);
    }
    if (f.type === 'tree') assert.ok(f.levels?.length >= 2 && f.levels.every(l => l.length), where);
  }
});

test('the figures named in the plan are present', () => {
  const titles = figures.map(f => `${f.domain} ${f.type} ${f.title}`.toLowerCase()).join('\n');
  for (const want of [/networking stack .*osi/, /networking sequence .*tls/, /databases tree .*b-tree/, /hardware pyramid .*memory/, /ai-ml flow .*transformer/, /ai-ml flow .*rag/]) assert.match(titles, want);
});

test('figures.js renders every spec as SVG with text nodes only', () => {
  const made = [];
  const fake = (tag) => {
    const n = { tag, attrs: {}, kids: [], setAttribute(k, v) { this.attrs[k] = String(v); }, append(...c) { this.kids.push(...c); } };
    made.push(n);
    return n;
  };
  const document = { createElementNS: (_, tag) => fake(tag), createTextNode: (t) => ({ text: t }) };
  const window = { Prep: { el: (tag, attrs, ...kids) => ({ tag, attrs, kids }) } };
  vm.runInNewContext(readFileSync(new URL('../js/figures.js', import.meta.url), 'utf8'), { window, document });
  for (const f of figures) {
    made.length = 0;
    const out = window.Prep.figure(f);
    assert.equal(out.tag, 'figure', f.title);
    const svg = out.kids[0];
    assert.equal(svg.tag, 'svg');
    const [, , w, h] = svg.attrs.viewBox.split(' ').map(Number);
    assert.ok(w === 600 && h > 0 && h < 1200, `${f.title}: viewBox ${svg.attrs.viewBox}`);
    assert.ok(made.some(n => n.tag === 'text'), `${f.title} has labels`);
    for (const n of made.filter(n => n.tag === 'rect')) assert.ok(Number(n.attrs.x) >= 0 && Number(n.attrs.x) + Number(n.attrs.width) <= 600, `${f.title}: box outside frame`);
  }
  assert.equal(window.Prep.figure({ type: 'nope', title: 'x' }), null);
});

test('every question puts a real plain answer first', () => {
  for (const d of domains) for (const q of d.questions) {
    const sentences = q.plain.split(/[.!?](\s|$)/).filter(s => s && s.trim()).length;
    assert.ok(sentences >= 1 && q.plain.length >= 60, `${q.id}: plain answer too thin`);
    assert.ok(q.technical.split(/\s+/).length >= 40, `${q.id}: technical answer too thin`);
  }
});
