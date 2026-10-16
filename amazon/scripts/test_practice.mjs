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

test('the two-week schedule can be moved without mutating source data', () => {
  const before = JSON.stringify(loop.plan);
  const days = practice.schedulePlan(loop.plan, '2026-12-25');
  assert.equal(days.length, 14);
  assert.equal(days[0].date, '2026-12-25');
  assert.equal(days.at(-1).date, '2027-01-07');
  assert.equal(days[0].id, loop.plan[0].id);
  assert.equal(JSON.stringify(loop.plan), before);
  assert.throws(() => practice.schedulePlan(loop.plan, '2026-02-30'));
});

test('the plan defaults to fourteen days, with no invented interview details', () => {
  assert.equal(loop.plan_start, '2026-10-15');
  assert.equal(loop.plan.length, 14);
  assert.equal(loop.event.date, '');
  assert.equal(loop.event.confirmed, false);
  assert.ok(loop.stages.every((s) => s.default_status === 'not_started' && !s.default_date));
  assert.ok(!loop.plan.some((day) => /interview day/i.test(day.focus)));
  assert.ok(loop.stages.every((stage) => stage.format === 'Preparation scenario'));
  assert.deepEqual(loop.plan.map((d) => d.date), practice.schedulePlan(loop.plan, loop.plan_start).map((d) => d.date));
  for (const day of loop.plan) {
    assert.equal(day.tasks.reduce((sum, t) => sum + t.minutes, 0), 180, day.id);
    assert.equal(day.tasks.filter((t) => t.minimum).reduce((sum, t) => sum + t.minutes, 0), 90, day.id);
    assert.ok(day.deliverable && day.readiness_gate, day.id);
  }
});

test('recruiting context separates established assessment facts from tentative interview details', () => {
  const context = loop.recruiting_context;
  assert.equal(context.assessment.status, 'passed');
  assert.equal(context.assessment.completed_date, '2026-10-14');
  assert.match(context.assessment.source, /user.*recruiter/i);
  assert.equal(context.hold.status, 'tentative');
  assert.equal(context.hold.weekday, 'Wednesday');
  assert.match(context.interview_conditions, /in.person.*USC.*if selected/i);
  assert.match(context.timing_conflict, /October 27.*October 28/);
  assert.match(context.timing_conflict, /Tuesday.*Wednesday/);
  assert.match(context.timing_conflict, /CST.*local/);
  assert.ok(context.pending.some((item) => /time zone/i.test(item)));
  assert.match(context.role.locations, /Dallas.*Seattle/);
  assert.match(context.role.locations, /six months/i);
  assert.deepEqual(context.role.cohort_starts, ['2027-01-04', '2027-07-06']);
  assert.match(context.role.cohort_note, /choice.*unknown/i);
  assert.match(context.role.success, /customer.*impact/i);
  assert.match(context.role.success, /sales quotas/i);
  assert.equal(loop.event.date, '');
  assert.equal(loop.event.confirmed, false);
});

test('tentative date-only target drives a twelve-day sprint without inventing a time', () => {
  assert.equal(loop.event.target_date, '2026-10-28');
  assert.equal(loop.event.target_status, 'tentative');
  assert.equal(loop.event.date, '');
  assert.equal(loop.sprint.start, '2026-10-16');
  assert.equal(loop.sprint.days.length, 12);
  assert.equal(loop.sprint.days[0].date, '2026-10-16');
  assert.equal(loop.sprint.days.at(-1).date, '2026-10-27');
  assert.match(loop.sprint.days.at(-1).focus, /taper/i);
  assert.equal(loop.sprint.days.filter((day) => day.full_mock).length, 3);
  assert.equal(loop.sprint.days.filter((day) => day.paper_design).length, 3);
  for (const day of loop.sprint.days) {
    assert.equal(day.tasks.reduce((sum, task) => sum + task.minutes, 0), 180);
    assert.equal(day.tasks.filter((task) => task.minimum).reduce((sum, task) => sum + task.minutes, 0), 90);
    assert.ok(day.deliverable && day.readiness_gate);
  }
  const first = loop.sprint.days[0].tasks.map((task) => task.text).join(' ');
  assert.match(first, /60.second.*S1.*S2/i);
  assert.match(first, /IAM.*request path/i);
  assert.match(first, /10.minute.*discovery/i);
  assert.match(loop.sprint.story_strategy, /S1.*S2.*S4.*S5.*S3.*S6/);
  assert.match(loop.sprint.gap_policy, /optional.*private.*real/i);
  assert.ok(loop.sprint.interview_day.tasks.every((task) => !/9:00|45.minute|round [123]/i.test(task.text)));
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

test('home rerenders and persists a moved plan independently of interview date', async () => {
  const { store } = storeContext();
  const view = homeContext(store);
  await view.home({ main: view.main, loop });
  let nodes = flatten(view.main);
  assert.equal(nodes.filter((n) => n.class?.startsWith('plan-day')).length, 14);
  const start = nodes.find((n) => n['aria-label'] === '14-day study plan start date');
  assert.equal(start.value, '2026-10-15');
  start.value = '2027-03-07';
  start.handlers.change();
  assert.equal(store.get('notes', 'plan-start-date'), '2027-03-07');
  assert.ok(visibleText(view.main).includes('Mar 20, 2027'));
  const interview = nodes.find((n) => n.type === 'datetime-local');
  interview.value = '2027-03-30T09:30';
  interview.handlers.change();
  assert.equal(store.get('notes', 'plan-start-date'), '2027-03-07');
  assert.ok(visibleText(view.main).includes('2027-03-30 at 09:30 Pacific Time'));
  assert.ok(visibleText(view.main).includes('does not move the study plan'));
  const nextVisit = homeContext(store);
  await nextVisit.home({ main: nextVisit.main, loop });
  nodes = flatten(nextVisit.main);
  assert.equal(nodes.find((n) => n.type === 'date').value, '2027-03-07');
  assert.ok(visibleText(nextVisit.main).includes('Mar 20, 2027'));
  const invalid = nodes.find((n) => n.type === 'date');
  invalid.value = '2027-02-30';
  invalid.handlers.change();
  assert.equal(store.get('notes', 'plan-start-date'), '2027-03-07');
  assert.ok(invalid.validationMessage);
});

test('home retains sourced recruiting context as secondary reference', async () => {
  const view = homeContext(storeContext().store);
  await view.home({ main: view.main, loop });
  const text = visibleText(view.main);
  assert.ok(text.includes('Online assessment passed'));
  assert.ok(text.includes('Tentative Wednesday hold'));
  assert.ok(text.includes('Exact date, start time, and time zone'));
  assert.ok(flatten(view.main).some((node) => node.tag === 'details' && node.id === 'recruiting-context'));
  assert.ok(text.includes('Set recruiter-confirmed date and time'));
  assert.ok(text.includes('2027-01-04') && text.includes('2027-07-06'));
});

test('home leads with date-only target and current-day sprint while keeping old plan secondary', async () => {
  const view = homeContext(storeContext().store, '2026-10-16T19:00:00Z');
  await view.home({ main: view.main, loop });
  const nodes = flatten(view.main);
  const text = visibleText(view.main);
  assert.ok(text.includes('12 days to tentative target'));
  assert.ok(text.includes('Wed, Oct 28, 2026'));
  assert.ok(text.includes('Start time and room unconfirmed'));
  assert.equal(nodes.filter((node) => node.class?.startsWith('sprint-day')).length, 12);
  assert.ok(nodes.some((node) => node.id === 'sprint-sp01' && node.class.includes('plan-today')));
  assert.ok(nodes.some((node) => node.tag === 'details' && node.id === 'extended-plan'));
  assert.ok(nodes.some((node) => node.tag === 'details' && node.id === 'recruiting-context'));
});

test('home refreshes across Pacific midnight without rebuilding the plan each minute', async () => {
  const { store } = storeContext();
  store.set('loop', 'interview-event', { date: '2026-10-17T09:00' });
  const view = homeContext(store, '2026-10-16T06:59:00Z');
  await view.home({ main: view.main, loop });
  const day = (id) => flatten(view.main).find((n) => n.id === id);
  const initialDay = day('day-d01');
  assert.ok(initialDay.class.includes('plan-today'));
  assert.ok(visibleText(view.main).includes('2 days'));
  assert.equal(view.timers.length, 3);
  assert.ok(view.timers.every((timer) => timer.interval === 60000));
  view.timers.forEach((timer) => timer.run());
  assert.equal(day('day-d01'), initialDay, 'same-day timer preserves checkbox DOM and focus');
  view.advance('2026-10-16T07:01:00Z');
  view.timers.forEach((timer) => timer.run());
  assert.ok(day('day-d01').class.includes('plan-past'));
  assert.ok(day('day-d02').class.includes('plan-today'));
  assert.ok(visibleText(view.main).includes('Tomorrow'));
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
