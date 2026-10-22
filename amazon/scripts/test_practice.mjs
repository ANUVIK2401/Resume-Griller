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
const domains = json('domains');
const presentation = json('presentation');

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

test('prompt-specific suggestions refuse unrelated success stories for missing episodes', () => {
  const missing = { 'rl-wrong': 'failure', 'dr-missed': 'failure', 'hb-manager': 'disagreement',
    'hd-grow': 'mentoring', 'co-no': 'refusal', 'et-feedback': 'feedback', 'hs-refuse': 'refusal',
    'lc-fast': 'learning-specific', 'lc-recent': 'recent-learning' };
  for (const [id, gap] of Object.entries(missing)) {
    const question = questions.lp_questions.find((q) => q.id === id);
    const result = practice.suggestQuestionStories(question, behavioral);
    assert.equal(result.lp.id, question.lp);
    assert.deepEqual(result.stories, [], `${id} must not suggest a mismatched success story`);
    assert.equal(result.gap.id, gap);
    assert.ok(result.gap.name);
  }
  const details = practice.suggestQuestionStories(questions.lp_questions.find((q) => q.id === 'dd-details'), behavioral);
  assert.equal(details.stories[0].story.id, 'netsuite-latency');
  assert.equal(details.gap, null);
});

test('a mock day has four rounds that cover all 8 named LPs once and never repeat a question', () => {
  const named = behavioral.lps.filter((lp) => lp.named).map((lp) => lp.id);
  const domainOf = new Map(domains.domains.flatMap((d) => d.questions.map((q) => [q.id, d.id])));
  for (let seed = 1; seed < 120; seed += 1) {
    const day = practice.pickMockDay(behavioral, domains, loop.focus_areas, seeded(seed));
    assert.equal(day.length, 4);
    const ids = day.flat().filter((x) => !['talk', 'ask'].includes(x.kind)).map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length, `seed ${seed} repeats a question`);
    const lps = day.flatMap((r) => r.filter((x) => x.kind === 'lp').map((x) => behavioral.question_bank.find((q) => q.id === x.id).lp));
    assert.deepEqual([...lps].sort(), [...named].sort());
    assert.equal(day.filter((r) => r.some((x) => x.kind === 'talk')).length, 1);
    for (const round of day) {
      assert.deepEqual(round.filter((x) => x.kind !== 'talk').map((x) => x.kind), ['lp', 'lp', 'breadth', 'depth', 'explain', 'ask']);
      assert.equal(domainOf.get(round.find((x) => x.kind === 'depth').id), loop.focus_areas.depth);
      assert.ok([...loop.focus_areas.breadth, ...loop.focus_areas.backup].includes(domainOf.get(round.find((x) => x.kind === 'breadth').id)));
      assert.notEqual(domains.domains.flatMap((d) => d.questions).find((q) => q.id === round.find((x) => x.kind === 'explain').id).level, 'deep');
    }
  }
});

test('story and talk timers classify the window, the current section, and the latest warning', () => {
  assert.equal(practice.windowStatus(119), 'short');
  assert.equal(practice.windowStatus(120), 'ok');
  assert.equal(practice.windowStatus(240), 'ok');
  assert.equal(practice.windowStatus(241), 'long');
  const sections = presentation.sections;
  assert.equal(practice.sectionAt(0, sections).id, 'hook');
  assert.equal(practice.sectionAt(59, sections).id, 'hook');
  assert.equal(practice.sectionAt(60, sections).id, 'what');
  assert.equal(practice.sectionAt(400, sections).id, 'how');
  assert.equal(practice.sectionAt(9999, sections).id, 'cta');
  assert.equal(practice.warningAt(479, presentation.warnings), null);
  assert.match(practice.warningAt(480, presentation.warnings).text, /8:00/);
  assert.match(practice.warningAt(601, presentation.warnings).text, /10:00/);
});

test('scoreRound accepts a per-item rubric, as the presentation uses', () => {
  const round = [{ kind: 'lp' }, { kind: 'talk', rubric: presentation.rubric }, { kind: 'explain' }];
  const result = practice.scoreRound(round, [practice.RUBRIC.map((r) => r.id), ['clarity', 'cta'], ['analogy']]);
  assert.equal(result.total, 5 + 6 + 5);
  assert.equal(result.score, 5 + 2 + 1);
  assert.ok(result.missed.includes('time-2'));
  assert.ok(result.missed.includes('no-jargon-3'));
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

test('technical mock answers use architecture criteria instead of personal STAR', () => {
  const criteria = practice.rubricFor('design');
  assert.equal(criteria.length, 5);
  assert.ok(!criteria.some((c) => ['star', 'metric', 'i-not-we'].includes(c.id)));
  assert.deepEqual(practice.scoreRound([{ kind: 'design' }], [criteria.map((c) => c.id)]), { score: 5, total: 5, missed: [] });
  assert.equal(practice.rubricFor('lp'), practice.RUBRIC);
});

test('rapid-fire technical rubric rewards explanation without demanding a full architecture', () => {
  const quick = practice.rubricFor('tech');
  assert.equal(quick.length, 5);
  assert.ok(quick.some((item) => item.id === 'direct-answer'));
  assert.ok(!quick.some((item) => ['recovery', 'security', 'requirements'].includes(item.id)));
  assert.notDeepEqual(quick, practice.rubricFor('design'));
  assert.match(practice.RUBRIC.find((item) => item.id === 'metric').label, /outcome or progress/i);
  assert.match(practice.RUBRIC.find((item) => item.id === 'tradeoff').label, /personal decision.*learning/i);
});

test('date logic uses Pacific calendar days and rejects impossible dates', () => {
  const now = new Date('2026-10-16T06:30:00Z'); // October 15 in Pacific time.
  assert.equal(practice.daysUntil('2026-10-28T09:00', now), 13);
  assert.equal(practice.daysUntil('2026-10-16T00:10', now), 1);
  assert.equal(practice.daysUntil('', now), null);
  assert.equal(practice.daysUntil('2026-02-30T09:00', now), null);
  assert.equal(practice.dayState('2026-10-14', now), 'past');
  assert.equal(practice.dayState('2026-10-15', now), 'today');
  assert.equal(practice.dayState('2026-10-16', now), 'future');
  assert.equal(practice.validPlanDate('2028-02-29'), true);
  assert.equal(practice.validPlanDate('2026-02-29'), false);
  assert.equal(practice.validPlanDate('2026-13-01'), false);
  assert.equal(practice.validPlanDate('bad'), false);
});

test('the loop records the confirmed format without placeholders', () => {
  assert.equal(loop.event.date, '2026-10-28T09:30');
  assert.equal(loop.event.confirmed, true);
  assert.match(loop.event.location, /USC campus/);
  assert.equal(loop.rounds.length, 4);
  assert.equal(loop.schedule.filter((s) => s.kind === 'round').length, 4);
  assert.ok(loop.schedule.some((s) => /lunch/i.test(s.label) && s.time === '11:30 am'));
  assert.deepEqual(loop.plan.map((d) => d.date), ['2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28']);
  assert.equal(loop.focus_areas.depth, 'ai-ml');
  assert.deepEqual(loop.focus_areas.breadth, ['networking', 'databases', 'security']);
  assert.ok(!JSON.stringify(loop).match(/reported, not confirmed|tentative/i));
  assert.ok(loop.unknowns.some((u) => /interviewer/i.test(u)));
  const bring = loop.day_of.bring.map((b) => b.text).join(' ');
  for (const item of [/resume.*5/i, /handout.*5/i, /notebook/i, /water/i]) assert.match(bring, item);
  assert.ok(loop.day_of.notes.some((n) => /no laptop/i.test(n)));
});

// The progress store runs in a sandbox with an in-memory localStorage.
function storeContext() {
  const shared = new Map();
  const window = { Prep: {}, addEventListener() {} };
  const context = { window, localStorage: { getItem: (k) => shared.get(k) || null, setItem: (k, v) => shared.set(k, v) }, console: { warn() {} }, Date, Set, Blob, URL, setTimeout, document: { createElement: () => ({ click() {} }) } };
  vm.runInNewContext(readFileSync(new URL('../js/storage.js', import.meta.url), 'utf8'), context);
  return { store: window.Prep.store, shared };
}

// Minimal DOM harness: exercise saved settings and schedule rerender without a browser.
function homeContext(store, initialTime = '2026-10-15T19:00:00Z') {
  let currentTime = initialTime;
  const timers = [];
  class ClockDate extends Date { constructor(...args) { super(...(args.length ? args : [currentTime])); } }
  const timedPractice = { ...practice, dayState: (date) => practice.dayState(date, new ClockDate()), daysUntil: (date) => practice.daysUntil(date, new ClockDate()) };
  const el = (tag, props = {}, ...children) => {
    const node = { tag, ...props, children: children.flat(Infinity).filter((x) => x !== null && x !== undefined),
      dataset: {}, handlers: {}, validity: { valid: true }, style: { setProperty() {} },
      addEventListener(name, fn) { this.handlers[name] = fn; },
      replaceChildren(...next) { this.children = next.flat(Infinity).filter((x) => x !== null && x !== undefined); },
      setCustomValidity(message) { this.validationMessage = message; }, reportValidity() {},
      querySelector(selector) { return flatten(this).find((n) => n.tag === selector); },
    };
    Object.defineProperty(node, 'firstChild', { get: () => node.children[0] });
    return node;
  };
  const ui = {
    section: (id, toc, eyebrow, title, ...children) => el('section', { id }, title, children),
    checkbox: (id, text) => el('label', {}, el('input', { type: 'checkbox', checked: store.get('checks', id, false) }), text),
    list: (items) => el('ul', {}, items),
  };
  const window = { Prep: { el, ui, store, practice: timedPractice, pages: {}, load: async (name) => json(name), setReadout() {} } };
  vm.runInNewContext(readFileSync(new URL('../js/render-home.js', import.meta.url), 'utf8'), { window, Date: ClockDate, Intl, setInterval: (run, interval) => { timers.push({ run, interval }); return timers.length; } });
  return { main: el('main'), home: window.Prep.pages.home, timers, advance: (time) => { currentTime = time; } };
}
function flatten(node) {
  if (!node || typeof node !== 'object') return [];
  return [node, ...(node.children || []).flatMap(flatten)];
}
const visibleText = (node) => typeof node === 'object' && node !== null ? (node.children || []).map(visibleText).join(' ') : String(node);

test('home leads with the confirmed day, today in the 7-day plan, four rounds, and the day-of panel', async () => {
  const view = homeContext(storeContext().store, '2026-10-24T19:00:00Z');
  await view.home({ main: view.main, loop });
  const nodes = flatten(view.main);
  const text = visibleText(view.main);
  assert.ok(text.includes('4 days'));
  assert.ok(text.includes('Confirmed by the recruiter'));
  assert.equal(nodes.filter((n) => n.class?.startsWith('plan-day')).length, 7);
  assert.ok(nodes.find((n) => n.id === 'day-p1024').class.includes('plan-today'));
  assert.equal(nodes.filter((n) => n.class === 'stage').length, 4);
  assert.ok(nodes.some((n) => n.id === 'day-of'));
  assert.ok(text.includes('Printed resume, 5 copies'));
  assert.ok(text.includes('AI/ML depth') || text.includes('Depth'));
});

test('home rebuilds the plan only when the Pacific day changes', async () => {
  const view = homeContext(storeContext().store, '2026-10-24T06:59:00Z');
  await view.home({ main: view.main, loop });
  const day = (id) => flatten(view.main).find((n) => n.id === id);
  assert.ok(day('day-p1023').class.includes('plan-today'));
  const before = day('day-p1023');
  view.timers.forEach((t) => t.run());
  assert.equal(day('day-p1023'), before, 'same-day timer keeps checkbox DOM');
  view.advance('2026-10-24T07:01:00Z');
  view.timers.forEach((t) => t.run());
  assert.ok(day('day-p1024').class.includes('plan-today'));
});

test('presentation runs save with their length and survive export and import', async () => {
  const { store, shared } = storeContext();
  store.pushQuiz({ at: new Date().toISOString(), kind: 'talk', score: 5, total: 6, missed: ['time'], seconds: 545 });
  const fresh = storeContext().store;
  await fresh.importFile({ text: async () => shared.get('awsprep:v1') });
  assert.equal(fresh.all().quiz[0].seconds, 545);
  assert.throws(() => store.pushQuiz({ at: new Date().toISOString(), kind: 'talk', score: 1, total: 6, missed: [], seconds: -1 }));
});

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
