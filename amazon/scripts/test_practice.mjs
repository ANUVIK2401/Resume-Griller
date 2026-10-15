// Tests for practice logic and the progress store extensions. Run: node amazon/scripts/test_practice.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const practice = require('../js/practice.js');
const json = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), 'utf8'));
const behavioral = json('behavioral');
const questions = json('questions');
const designs = json('designs');
const loop = json('loop');

const tests = [];
const test = (name, run) => tests.push({ name, run });
const seeded = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

test('every LP has at least one story, or a planned gap story', () => {
  for (const lp of behavioral.lps) {
    const tagged = behavioral.stories.filter((s) => s.lps.includes(lp.id));
    assert.ok(tagged.length > 0 || lp.gap, `${lp.name} has no story and no gap plan`);
  }
});

test('suggestStories returns primary then backup, and the gap for missing slots', () => {
  const co = practice.suggestStories('customer-obsession', behavioral);
  assert.deepEqual(co.stories.map((x) => [x.role, x.story.id]), [['primary', 'erp-hitl'], ['backup', 'pacsun-exec']]);
  assert.equal(co.gap, null);
  const hb = practice.suggestStories('have-backbone', behavioral);
  assert.equal(hb.stories.length, 0);
  assert.equal(hb.gap.id, 'disagreement');
  assert.equal(practice.suggestStories('not-an-lp', behavioral).lp, null);
});

test('mock round has two LP questions on different principles and one technical item', () => {
  for (let seed = 1; seed < 200; seed += 1) {
    const round = practice.pickMockRound(questions, designs, seeded(seed));
    assert.equal(round.length, 3);
    const [a, b, tech] = round;
    assert.equal(a.kind, 'lp');
    assert.equal(b.kind, 'lp');
    const lpOf = (id) => questions.lp_questions.find((q) => q.id === id).lp;
    assert.notEqual(lpOf(a.id), lpOf(b.id));
    assert.ok(['tech', 'design'].includes(tech.kind));
    if (tech.kind === 'tech') assert.ok(questions.rapid_fire.some((q) => q.id === tech.id));
    else assert.ok(designs.designs.some((d) => `design-${d.id}` === tech.id));
  }
});

test('scoreRound counts ticked checks and names each miss by check and question', () => {
  const round = [{}, {}, {}];
  const all = practice.RUBRIC.map((r) => r.id);
  assert.deepEqual(practice.scoreRound(round, [all, all, all]), { score: 15, total: 15, missed: [] });
  const result = practice.scoreRound(round, [all, ['star'], []]);
  assert.equal(result.score, 6);
  assert.equal(result.missed.length, 9);
  assert.ok(result.missed.includes('metric-2'));
  assert.ok(result.missed.includes('star-3'));
});

test('daysUntil and dayState use local calendar days', () => {
  const now = new Date(2026, 9, 15, 23, 30);
  assert.equal(practice.daysUntil('2026-10-28T09:00', now), 13);
  assert.equal(practice.daysUntil('2026-10-16T00:10', now), 1);
  assert.equal(practice.dayState('2026-10-14', now), 'past');
  assert.equal(practice.dayState('2026-10-15', now), 'today');
  assert.equal(practice.dayState('2026-10-16', now), 'future');
});

test('the daily plan is consecutive and ends on the interview day', () => {
  const dates = loop.plan.map((d) => d.date);
  for (let i = 1; i < dates.length; i += 1) {
    const gap = (new Date(`${dates[i]}T12:00`) - new Date(`${dates[i - 1]}T12:00`)) / 86400000;
    assert.equal(gap, 1, `${dates[i - 1]} to ${dates[i]}`);
  }
  assert.equal(dates.at(-1), loop.event.date.slice(0, 10));
});

// The progress store runs in a sandbox with an in-memory localStorage.
function storeContext() {
  const shared = new Map();
  const window = { Prep: {}, addEventListener() {} };
  const context = { window, localStorage: { getItem: (k) => shared.get(k) || null, setItem: (k, v) => shared.set(k, v) }, console: { warn() {} }, Date, Set, Blob, URL, setTimeout, document: { createElement: () => ({ click() {} }) } };
  vm.runInNewContext(readFileSync(new URL('../js/storage.js', import.meta.url), 'utf8'), context);
  return { store: window.Prep.store, shared };
}

test('mock and tech results round trip through export and import', async () => {
  const { store, shared } = storeContext();
  const at = new Date().toISOString();
  store.pushQuiz({ at, kind: 'mock', score: 12, total: 15, missed: ['metric-2', 'star-3', 'tradeoff-1'], items: ['co-above', 'dd-details', 'design-rag-chatbot'] });
  store.pushQuiz({ at, kind: 'tech', score: 10, total: 12, missed: ['rf-lambda', 'rf-7rs'] });
  assert.ok(shared.has('awsprep:v1'), 'Amazon progress uses its own storage key');
  const exported = JSON.parse(shared.get('awsprep:v1'));
  const fresh = storeContext().store;
  await fresh.importFile({ text: async () => JSON.stringify(exported) });
  assert.deepEqual(JSON.parse(JSON.stringify(fresh.all().quiz.map((q) => q.kind))), ['mock', 'tech']);
  assert.deepEqual(JSON.parse(JSON.stringify(fresh.all().quiz[0].items)), ['co-above', 'dd-details', 'design-rag-chatbot']);
});

test('the store rejects unknown quiz kinds and malformed items', async () => {
  const { store } = storeContext();
  const at = new Date().toISOString();
  assert.throws(() => store.pushQuiz({ at, kind: 'other', score: 1, total: 1, missed: [] }));
  assert.throws(() => store.pushQuiz({ at, kind: 'mock', score: 1, total: 1, missed: [], items: ['Bad Id'] }));
  await assert.rejects(store.importFile({ text: async () => JSON.stringify({ version: 1, quiz: [{ at, kind: 'x', score: 0, total: 1, missed: [] }] }) }));
});

let failed = 0;
for (const { name, run } of tests) {
  try { await run(); console.log(`PASS ${name}`); } catch (error) { failed += 1; console.error(`FAIL ${name}: ${error.message}`); }
}
if (failed) process.exitCode = 1;
else console.log(`Practice tests passed: ${tests.length}`);
