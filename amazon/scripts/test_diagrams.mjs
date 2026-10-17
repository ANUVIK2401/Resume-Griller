// Architecture diagrams: every spec lays out cleanly and every flow step maps to something on the diagram.
// Run: node --test amazon/scripts/test_diagrams.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { layout, validate, NODE_W, NODE_H } = require('../js/diagram.js');
const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url)));
const arch = read('architecture');
const designs = read('designs');

const specs = [
  ...arch.scenarios.map((s) => ({ name: `pattern ${s.id}`, diagram: s.diagram, steps: s.steps.map((x) => x.nodes || []) })),
  ...designs.designs.map((d) => ({ name: `design ${d.id}`, diagram: d.diagram, steps: d.flow.map((_, i) => d.diagram.focus?.[i] || []) })),
];

test('every diagram passes layout validation: fit, no crossings, known categories', () => {
  for (const { name, diagram } of specs) assert.deepEqual(validate(diagram), [], name);
});

test('every flow step lights up at least one edge or named node, and no edge points past the last step', () => {
  for (const { name, diagram, steps } of specs) {
    const ids = new Set(diagram.nodes.map((n) => n.id));
    steps.forEach((nodes, i) => {
      const hasEdge = diagram.edges.some((e) => e.step === i + 1);
      assert.ok(hasEdge || nodes.length, `${name}: step ${i + 1} highlights nothing`);
      for (const id of nodes) assert.ok(ids.has(id), `${name}: step ${i + 1} names unknown node ${id}`);
    });
    for (const e of diagram.edges) if (e.step) assert.ok(e.step <= steps.length, `${name}: edge ${e.from} to ${e.to} uses step ${e.step} of ${steps.length}`);
  }
});

test('validation catches crossings, oversized labels, shared cells, and unknown nodes', () => {
  const base = { cols: 3, rows: 1, nodes: [{ id: 'a', label: 'A', cat: 'client', at: [0, 0] }, { id: 'b', label: 'B', cat: 'edge', at: [1, 0] }, { id: 'c', label: 'C', cat: 'compute', at: [2, 0] }] };
  assert.match(validate({ ...base, edges: [{ from: 'a', to: 'c' }] }).join(), /crosses b/);
  assert.match(validate({ ...base, edges: [{ from: 'a', to: 'b', label: 'far too long for the gap', step: 1 }] }).join(), /needs/);
  assert.match(validate({ ...base, nodes: [...base.nodes, { id: 'd', label: 'D', cat: 'client', at: [0, 0] }], edges: [] }).join(), /shares cell/);
  assert.match(validate({ ...base, edges: [{ from: 'a', to: 'z' }] }).join(), /unknown node/);
  assert.match(validate({ ...base, nodes: [{ ...base.nodes[0], label: 'A label far too long to fit in two tile lines' }, ...base.nodes.slice(1)], edges: [] }).join(), /two lines/);
});

test('layout routes elbows between tile borders and sizes the canvas to the grid', () => {
  const L = layout({ cols: 2, rows: 2, nodes: [{ id: 'a', label: 'A', cat: 'client', at: [0, 0] }, { id: 'b', label: 'B', cat: 'edge', at: [1, 1] }], edges: [{ from: 'a', to: 'b' }] });
  const [start, , , end] = L.edges[0].points;
  const [a, b] = L.nodes;
  assert.equal(start[0], a.x + NODE_W / 2);
  assert.equal(end[0], b.x - NODE_W / 2);
  assert.equal(end[1], b.y);
  assert.ok(L.width > b.x + NODE_W / 2 && L.height > b.y + NODE_H / 2);
});

test('svg renders tiles, numbered badges, and tracing lights one step', () => {
  const made = [];
  const node = (tag) => {
    const n = { tag, attrs: {}, kids: [], classes: new Set(), dataset: {}, style: { setProperty() {} }, textContent: '' };
    n.setAttribute = (k, v) => { n.attrs[k] = v; if (k === 'class') v.split(' ').forEach((c) => n.classes.add(c)); if (k.startsWith('data-')) n.dataset[k.slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = v; };
    n.append = (...k) => n.kids.push(...k);
    n.classList = { toggle: (c, on) => (on ? n.classes.add(c) : n.classes.delete(c)) };
    const all = (sel) => { const cls = sel.slice(1); const out = []; const walk = (x) => { if (x.classes?.has(cls)) out.push(x); x.kids?.forEach(walk); }; walk(n); return out; };
    n.querySelectorAll = (sel) => all(sel);
    made.push(n);
    return n;
  };
  globalThis.window = { Prep: {} };
  globalThis.document = { createElementNS: (_, tag) => node(tag) };
  delete require.cache[require.resolve('../js/diagram.js')];
  require('../js/diagram.js');
  const { svg, trace } = globalThis.window.Prep.arch;
  const spec = arch.scenarios[0].diagram;
  const { root } = svg(spec, 'test');
  const tiles = root.querySelectorAll('.arch-node');
  assert.equal(tiles.length, spec.nodes.length);
  assert.equal(root.querySelectorAll('.arch-badge').length, spec.edges.filter((e) => e.step).length);
  trace(root, 2);
  const lit = root.querySelectorAll('.arch-edge').filter((p) => p.classes.has('is-on'));
  assert.equal(lit.length, spec.edges.filter((e) => e.step === 2).length);
  assert.ok(root.classes.has('is-tracing'));
  trace(root, null);
  assert.ok(!root.classes.has('is-tracing'));
  delete globalThis.window; delete globalThis.document;
});
