import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const get = () => JSON.parse(readFileSync(new URL('../data/cheatsheet.json', import.meta.url)));
test('two-week AWS scope includes decision-ready priorities and all critical domains', () => {
  const data = get();
  assert.equal(data.verified_on, '2026-10-16');
  for (const priority of ['P0', 'P1', 'P2']) assert.ok(data.topics.some(t => t.priority === priority));
  for (const domain of ['networking', 'security', 'compute', 'storage', 'database', 'messaging', 'reliability', 'cost', 'migration', 'genai']) assert.ok(data.topics.some(t => t.domain === domain), domain);
  for (const topic of data.topics) {
    for (const field of ['decision', 'tradeoff', 'failure', 'say', 'probe']) assert.ok(topic[field]?.length > 20, `${topic.id}.${field}`);
    assert.ok(topic.sources.length);
  }
});
test('comparison traps, customer drills and evidence boundaries are actionable', () => {
  const data = get();
  assert.ok(data.comparisons.length >= 10);
  assert.ok(data.walkthroughs.length >= 3);
  for (const item of data.walkthroughs) {
    assert.ok(item.discovery.length >= 3);
    assert.ok(item.flow.length >= 3);
    assert.ok(item.challenge.length > 20);
    assert.ok(item.sources.length);
  }
  assert.match(data.experience_boundary, /hypothetical/i);
  assert.match(data.experience_boundary, /OCI/);
  assert.match(data.experience_boundary, /Databricks/);
});
test('optional labs include offline alternatives, cleanup and cost gates; citations resolve', () => {
  const data = get();
  const ids = new Set(data.sources.map(s => s.id));
  assert.equal(ids.size, data.sources.length);
  for (const source of data.sources) assert.match(source.url, /^https:\/\/(docs\.)?aws\.amazon\.com\//);
  for (const item of [...data.topics, ...data.comparisons, ...data.walkthroughs, ...data.labs]) {
    for (const source of item.sources) assert.ok(ids.has(source), `${item.id}: ${source}`);
  }
  for (const lab of data.labs) {
    assert.ok(lab.offline.length > 20);
    assert.ok(lab.cleanup.length >= 2);
    assert.match(lab.cost_gate, /charge|cost|billing/i);
    assert.ok(lab.steps.length >= 3);
  }
  assert.match(data.lab_policy, /not.*cap|not.*limit/i);
});
test('filters prioritize limited study time and search decision content without mutating data', async () => {
  const { createRequire } = await import('node:module');
  const { filterTopics } = createRequire(import.meta.url)('../js/render-cheatsheet.js');
  const topics = get().topics;
  const before = JSON.stringify(topics);
  assert.ok(filterTopics(topics, { priority: 'P0' }).every(t => t.priority === 'P0'));
  assert.ok(filterTopics(topics, { domain: 'security' }).every(t => t.domain === 'security'));
  assert.ok(filterTopics(topics, { q: '  IDEMPOTENCY  ' }).some(t => t.id === 'queue'));
  assert.equal(filterTopics(topics, { q: 'nothing-matches-this' }).length, 0);
  assert.equal(JSON.stringify(topics), before);
});
test('portable cheatsheet stays synchronized with the browser content', async () => {
  const { render } = await import('./cheatsheet_md.mjs');
  assert.equal(readFileSync(new URL('../AWS-CHEATSHEET.md', import.meta.url), 'utf8'), render(get()));
});
test('readout reports saved readiness and responds to progress updates', async () => {
  const { runInNewContext } = await import('node:vm');
  const data = get();
  let checks = { 'decision-vpc': true, 'some-other-check': true };
  let listener;
  let cleanup;
  let unsubscribed = false;
  const readouts = [];
  const node = (...children) => ({ children, append(...next) { this.children.push(...next); }, replaceChildren(...next) { this.children = next; } });
  const ui = {
    list: items => node(...items), checkbox: () => node(), section: (...args) => node(...args),
    filterBar: ({ onChange }) => ({ querySelector: () => ({ value: 'P0', dispatchEvent: () => onChange({ priority: 'P0' }) }) }),
  };
  const window = { addEventListener: (event, callback) => { if (event === 'pagehide') cleanup = callback; }, Prep: {
    pages: {}, el: (...args) => node(...args), ui, load: async () => data,
    setReadout: (...args) => readouts.push(args),
    store: { get: (bucket, id, fallback) => checks[id] ?? fallback, subscribe: callback => { listener = callback; return () => { unsubscribed = true; }; } },
  } };
  runInNewContext(readFileSync(new URL('../js/render-cheatsheet.js', import.meta.url), 'utf8'), { window, Event });
  await window.Prep.pages.cheatsheet({ main: node() });
  assert.deepEqual(readouts.at(-1), ['Decisions I can defend', 1, data.topics.length]);
  checks = { ...checks, 'decision-iam': true };
  listener();
  assert.deepEqual(readouts.at(-1), ['Decisions I can defend', 2, data.topics.length]);
  checks = {};
  listener();
  assert.deepEqual(readouts.at(-1), ['Decisions I can defend', 0, data.topics.length]);
  cleanup({ persisted: false });
  assert.equal(unsubscribed, true);
});
