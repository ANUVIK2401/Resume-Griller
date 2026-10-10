// Regression tests for browser progress, timers, filters, and interview practice.
// Dependency-free DOM/event stubs keep the runtime logic executable in Node.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const read = (name) => readFileSync(new URL(`../js/${name}`, import.meta.url), 'utf8');
const snapshot = (value) => JSON.parse(JSON.stringify(value));
class Events {
  listeners = new Map();
  addEventListener(type, fn) { this.listeners.set(type, [...(this.listeners.get(type) || []), fn]); }
  removeEventListener(type, fn) { this.listeners.set(type, (this.listeners.get(type) || []).filter(listener => listener !== fn)); }
  emit(type, extra = {}) { for (const fn of this.listeners.get(type) || []) fn({ type, target: this, ...extra }); }
}
class Element extends Events {
  constructor(tag, attrs = {}, children = []) {
    super(); this.tag = tag; this.attrs = attrs; this.children = []; this.dataset = {}; this.value = attrs.value || ''; this.parent = null; this._text = '';
    this.classList = { toggle() {} }; this.style = { setProperty() {} }; this.hidden = false;
    for (const [key, value] of Object.entries(attrs)) if (key.startsWith('on')) this.addEventListener(key.slice(2), value);
    this.append(...children);
  }
  append(...children) { for (const child of children.flat(Infinity).filter(value => value !== null && value !== undefined && value !== false)) { this.children.push(child); if (child instanceof Element) child.parent = this; } }
  replaceChildren(...children) { this.children = []; this._text = ''; this.append(...children); }
  get textContent() { return this._text + this.children.map(child => child instanceof Element ? child.textContent : String(child)).join(''); }
  set textContent(value) { this.children = []; this._text = String(value); }
  get firstChild() { return this.children[0]; }
  get childElementCount() { return this.children.filter(child => child instanceof Element).length; }
  closest(tag) { return this.tag === tag ? this : this.parent?.closest(tag); }
  querySelector() { return null; }
  setAttribute(key, value) { this.attrs[key] = value; }
  focus() {}
}
const find = (root, predicate) => root instanceof Element ? [ ...(predicate(root) ? [root] : []), ...root.children.flatMap(child => find(child, predicate)) ] : [];
const el = (tag, attrs, ...children) => new Element(tag, attrs, children);
const tests = [];
const test = (name, run) => tests.push({ name, run });
function storageContext(shared = new Map(), initial) {
  if (initial !== undefined) shared.set('sfprep:v1', initial);
  const window = new Events(); window.Prep = {};
  const localStorage = { getItem: key => shared.get(key) || null, setItem: (key, value) => shared.set(key, value) };
  const context = { window, localStorage, console: { warn() {} }, Date, Set, Blob, URL, setTimeout, document: { createElement: () => ({ click() {} }) } };
  vm.runInNewContext(read('storage.js'), context, { filename: new URL('../js/storage.js', import.meta.url).pathname });
  return { ...context, store: window.Prep.store, shared };
}
function uiContext() {
  let now = 0; let serial = 0;
  const intervals = new Map(); const timeouts = new Map(); const writes = [];
  const window = new Events();
  window.Prep = { pages: {}, el, icon: () => el('svg', {}), store: { get: (_bucket, _id, fallback) => fallback, set: (...args) => writes.push(args) } };
  const document = new Events();
  const context = { window, document, Date: { now: () => now }, Set, navigator: {},
    setInterval: fn => { const id = ++serial; intervals.set(id, fn); return id; }, clearInterval: id => intervals.delete(id),
    setTimeout: fn => { const id = ++serial; timeouts.set(id, fn); return id; }, clearTimeout: id => timeouts.delete(id) };
  vm.runInNewContext(read('ui.js'), context, { filename: new URL('../js/ui.js', import.meta.url).pathname });
  return { ...context, ui: window.Prep.ui, writes, intervals, timeouts, advance: ms => { now += ms; }, tick: () => [...intervals.values()].forEach(fn => fn()) };
}

test('invalid imports reject without replacing existing progress', async () => {
  const { store } = storageContext(); store.set('notes', 'story-a', 'My draft');
  const bad = [{ version: 2 }, { version: 1, quiz: {} }, { version: 1, status: [] }, { version: 1, notes: { a: 42 } },
    { version: 1, confidence: { a: 6 } }, { version: 1, checks: { a: 'yes' } }, { version: 1, loop: { a: { date: 'tomorrow' } } },
    { version: 1, quiz: [{ at: new Date().toISOString(), score: 3, total: 2, missed: [] }] },
    JSON.parse('{"version":1,"notes":{"__proto__":"unsafe"}}')];
  for (const progress of bad) { await assert.rejects(store.importFile({ text: async () => JSON.stringify(progress) })); assert.equal(store.get('notes', 'story-a'), 'My draft'); }
});
test('valid exports round trip every bucket and reject oversized files', async () => {
  const { store } = storageContext(); const at = '2026-10-10T12:00:00.000Z';
  const progress = { version: 1, updated: at, status: { 'dsa-a': 'solved' }, notes: { 'story-a': '<b>literal note</b>' }, confidence: { 'story-a': 5 }, checks: { 'loop-a': true }, loop: { hm: { status: 'not_started', date: '2026-10-15T11:30' } }, quiz: [{ at, score: 1, total: 2, missed: ['a'] }] };
  await store.importFile({ text: async () => JSON.stringify(progress) });
  for (const bucket of ['status', 'notes', 'confidence', 'checks', 'loop', 'quiz']) assert.deepEqual(snapshot(store.all()[bucket]), progress[bucket]);
  await assert.rejects(store.importFile({ size: 6 * 1024 * 1024, text: async () => JSON.stringify(progress) }));
});
test('corrupt browser progress resets to a usable store', () => {
  for (const raw of ['{oops', JSON.stringify({ version: 1, quiz: null }), JSON.stringify({ version: 99 }), 'null']) {
    const { store } = storageContext(new Map(), raw); assert.deepEqual(snapshot(store.all().quiz), []); store.pushQuiz({ at: new Date().toISOString(), score: 1, total: 1, missed: [] }); assert.equal(store.all().quiz.length, 1);
  }
});
test('multi-tab edits merge persisted entries and deleted values', () => {
  const shared = new Map(); const one = storageContext(shared); const two = storageContext(shared);
  one.store.set('notes', 'story-a', 'First'); two.store.set('status', 'dsa-a', 'solved');
  assert.equal(JSON.parse(shared.get('sfprep:v1')).notes['story-a'], 'First');
  one.store.set('notes', 'story-a', null); assert.equal(JSON.parse(shared.get('sfprep:v1')).status['dsa-a'], 'solved');
  two.window.emit('storage', { key: 'sfprep:v1', newValue: shared.get('sfprep:v1') }); assert.equal(two.store.get('notes', 'story-a'), undefined);
  one.store.pushQuiz({ at: new Date().toISOString(), score: 1, total: 1, missed: [] }); two.store.pushQuiz({ at: new Date().toISOString(), score: 0, total: 1, missed: ['a'] }); assert.equal(two.store.all().quiz.length, 2);
});
test('blocked storage preserves edits in memory and all() exposes a snapshot', () => {
  const { store, localStorage } = storageContext(); localStorage.setItem = () => { throw new Error('blocked'); };
  store.set('notes', 'a', 'draft'); store.set('checks', 'a', true); assert.equal(store.get('notes', 'a'), 'draft'); assert.equal(store.persistent, false);
  const exposed = store.all(); exposed.notes.a = 'changed outside'; assert.equal(store.get('notes', 'a'), 'draft');
});
test('invalid local writes fail without corrupting progress', () => {
  const { store } = storageContext(); assert.throws(() => store.set('unknown', 'a', true)); assert.throws(() => store.set('notes', '__proto__', 'x')); assert.throws(() => store.set('confidence', 'a', 0));
});
test('timer catches up elapsed time after throttled ticks and finishes once', () => {
  const c = uiContext(); let ended = 0; const timer = c.ui.timer(1.5, () => { ended += 1; }); const face = find(timer.node, e => e.attrs.role === 'timer')[0];
  timer.start(); timer.start(); assert.equal(c.intervals.size, 1); c.advance(30_000); c.tick(); assert.equal(face.textContent, '01:00');
  c.advance(65_000); c.tick(); assert.equal(face.textContent, '00:00'); assert.equal(ended, 1); timer.start(); c.tick(); assert.equal(ended, 1); assert.equal(c.intervals.size, 0);
  timer.reset(); assert.equal(face.textContent, '01:30'); timer.start(); c.advance(90_000); c.tick(); assert.equal(ended, 2);
});
test('timer pause freezes actual remaining time and visibility return catches up', () => {
  const c = uiContext(); const timer = c.ui.timer(1); const face = find(timer.node, e => e.attrs.role === 'timer')[0];
  timer.start(); c.advance(12_000); timer.stop(); assert.equal(face.textContent, '00:48'); c.advance(100_000); timer.start(); c.advance(8000); c.document.emit('visibilitychange'); assert.equal(face.textContent, '00:40'); timer.stop();
});
test('notes flush immediately on blur and before navigation', () => {
  const c = uiContext(); const area = c.ui.notesBox('story-a'); area.value = 'Last sentence'; area.emit('input'); assert.equal(c.writes.length, 0);
  area.emit('blur'); assert.deepEqual(c.writes[0], ['notes', 'story-a', 'Last sentence']); assert.equal(c.timeouts.size, 0);
  area.value = 'Revised sentence'; area.emit('input'); c.window.emit('pagehide'); assert.deepEqual(c.writes.at(-1), ['notes', 'story-a', 'Revised sentence']);
  area.value = ' '; area.emit('input'); c.window.emit('pagehide'); assert.deepEqual(c.writes.at(-1), ['notes', 'story-a', null]);
});

test('filter reset clears all controls and reapplies an empty filter', () => {
  const c = uiContext(); const states = [];
  const bar = c.ui.filterBar({ selects: [{ key: 'status', label: 'Status', options: [{ id: 'done', label: 'Done' }] }], toggles: [{ key: 'recent', label: 'Recent' }], onChange: value => states.push(snapshot(value)) });
  const search = find(bar, e => e.attrs.type === 'search')[0]; const select = find(bar, e => e.tag === 'select')[0]; const toggle = find(bar, e => e.attrs.type === 'checkbox')[0];
  search.value = 'cache'; search.emit('input'); select.value = 'done'; select.emit('change'); toggle.checked = true; toggle.emit('change');
  bar.resetFilters(); assert.deepEqual(states.at(-1), { q: '', status: '', recent: false }); assert.equal(search.value, ''); assert.equal(select.value, ''); assert.equal(toggle.checked, false);
});

async function renderContext(page, data) {
  const c = uiContext(); const statuses = {}; const readouts = [];
  c.window.Prep.store.get = (bucket, id, fallback) => bucket === 'status' ? (statuses[id] || fallback) : fallback;
  c.window.Prep.store.set = (bucket, id, value) => { if (bucket === 'status') statuses[id] = value; };
  Object.assign(c.window.Prep, { load: async () => data, loadText: async () => 'def solve(): pass', setReadout: (...args) => readouts.push(args) });
  vm.runInNewContext(read(`render-${page}.js`), { ...c, window: c.window }, { filename: new URL(`../js/render-${page}.js`, import.meta.url).pathname });
  const main = el('main', {}); await c.window.Prep.pages[page]({ main }); return { ...c, main, statuses, readouts };
}
const statuses = [{ id: 'todo', label: 'To do' }, { id: 'solved', label: 'Solved' }];
const dsaFixture = () => ({ status_options: statuses, source: { note: 'Source note', url: 'https://example.com' },
  patterns: [{ id: 'heap', name: 'Heaps', signals: ['priority'], pitfalls: ['bounds'], template: 'heapq' }, { id: 'empty', name: 'Empty', signals: [], pitfalls: [], template: '' }],
  problems: [ { id: 'a', title: 'Curated A', pattern: 'heap', difficulty: 'easy', solution_file: 'data/a.py', insight: 'use heap', approach: ['heap'], time: 'O(n)', space: 'O(n)', edge_cases: [] },
    { id: 'b', title: 'Curated B', pattern: 'heap', difficulty: 'easy', solution_file: 'data/b.py', insight: 'use heap', approach: ['heap'], time: 'O(n)', space: 'O(n)', edge_cases: [] },
    { id: 'c', title: 'Uncurated C', pattern: 'heap', difficulty: 'easy', leetcode: 'https://example.com' } ], timed: { count: 2, minutes: 45 }, script: [], dsa_patterns_site: 'https://example.com' });
test('DSA active status filter reapplies after a row status changes', async () => {
  const c = await renderContext('dsa', dsaFixture()); const filter = find(c.main, e => e.attrs['aria-label'] === 'Any status')[0]; filter.value = 'todo'; filter.emit('change');
  const row = find(c.main, e => e.attrs.id === 'dsa-a')[0]; const status = find(row, e => e.attrs['aria-label'] === 'Status')[0]; status.value = 'solved'; status.emit('change');
  assert.equal(find(c.main, e => e.attrs.id === 'dsa-a').length, 0); assert.equal(c.readouts.at(-1)[1], 1);
});
test('OA chooses only tested solution problems and explains insufficient selection', async () => {
  const c = await renderContext('dsa', dsaFixture()); const section = find(c.main, e => e.attrs.id === 'timed')[0];
  const start = find(section, e => e.tag === 'button' && e.textContent.startsWith('Start 45'))[0];
  // Force the shuffle to choose the uncurated entry if it remains in the pool.
  c.ui.shuffle = list => [...list].reverse(); start.emit('click');
  assert.equal(section.textContent.includes('Uncurated C'), false); assert.equal(section.textContent.includes('Curated A'), true); assert.equal(section.textContent.includes('Curated B'), true);
  const finish = find(section, e => e.tag === 'button' && e.textContent === 'Finish and reveal')[0]; finish.emit('click'); assert.equal(finish.disabled, true); assert.equal(c.intervals.size, 0);
  const revealedStatus = find(section, e => e.attrs['aria-label'] === 'Status')[0]; revealedStatus.value = 'solved'; revealedStatus.emit('change'); assert.equal(c.readouts.at(-1)[1], 1);
  find(section, e => e.tag === 'button' && e.textContent === 'Quit')[0].emit('click');
  for (const checkbox of find(section, e => e.attrs.type === 'checkbox')) { checkbox.checked = false; checkbox.emit('change'); }
  find(section, e => e.tag === 'button' && e.textContent.startsWith('Start 45'))[0].emit('click');
  assert.match(section.textContent, /at least 2.*tested solution/i);
});
test('AI active status filter reapplies when a card becomes known', async () => {
  const data = { status_options: statuses, topics: [{ id: 'topic', name: 'Topic' }], cards: [{ id: 'a', question: 'Question', topic: 'topic', short: 'Short', terms: [], long: [], followups: [], tie: 'Tie' }], decision_table: { columns: [], rows: [] }, gaps: [] };
  const c = await renderContext('ai', data); const filter = find(c.main, e => e.attrs['aria-label'] === 'Any status')[0]; filter.value = 'todo'; filter.emit('change');
  const card = find(c.main, e => e.attrs.id === 'ai-a')[0]; const status = find(card, e => e.attrs['aria-label'] === 'Status')[0]; status.value = 'solved'; status.emit('change');
  assert.equal(find(c.main, e => e.attrs.id === 'ai-a').length, 0); assert.equal(find(c.main, e => e.attrs.id === 't-topic')[0].hidden, true);
});

test('progress subscribers observe snapshots, unsubscribe, and ignore invalid tab updates', () => {
  const c = storageContext(); let calls = 0;
  const unsubscribe = c.store.subscribe(state => { calls += 1; state.notes.a = 'external'; });
  c.store.set('notes', 'a', 'real'); assert.equal(c.store.get('notes', 'a'), 'real'); assert.equal(calls, 1); unsubscribe();
  c.window.emit('storage', { key: 'another-key', newValue: 'bad' });
  c.window.emit('storage', { key: 'sfprep:v1', newValue: '{bad' }); assert.equal(c.store.get('notes', 'a'), 'real');
  c.window.emit('storage', { key: null, newValue: null }); assert.equal(c.store.get('notes', 'a', 'missing'), 'missing'); assert.equal(calls, 1);
});
test('progress stores limit quiz history and never expose mutable loop values', () => {
  const c = storageContext(); const result = { at: new Date().toISOString(), score: 1, total: 1, missed: [] };
  for (let i = 0; i < 55; i += 1) c.store.pushQuiz(result); assert.equal(c.store.all().quiz.length, 50);
  c.store.set('loop', 'hm', { status: 'scheduled', date: null }); const stage = c.store.get('loop', 'hm'); stage.status = 'done'; assert.equal(c.store.get('loop', 'hm').status, 'scheduled');
  c.store.set('checks', 'a', true); c.store.set('checks', 'a', undefined); assert.equal(c.store.get('checks', 'a', false), false); assert.throws(() => c.store.pushQuiz({ score: -1 }));
});
test('export includes current saved data and blocked reads keep memory usable', () => {
  const c = storageContext(); let downloaded; c.document.createElement = () => ({ click() { downloaded = this; } });
  c.store.set('notes', 'a', 'backup'); c.store.exportFile(); assert.match(downloaded.download, /^sfprep-progress-.*\.json$/); assert.match(downloaded.href, /^blob:/);
  const failing = new Map(); failing.get = () => { throw new Error('blocked'); }; const blocked = storageContext(failing); assert.equal(blocked.store.persistent, false); blocked.store.set('notes', 'a', 'memory'); assert.equal(blocked.store.get('notes', 'a'), 'memory');
});
test('note delay and hidden-tab flush save only dirty entries once', () => {
  const c = uiContext(); const area = c.ui.notesBox('a'); area.value = 'draft'; area.emit('input'); [...c.timeouts.values()][0](); area.emit('blur'); assert.equal(c.writes.length, 1);
  area.value = 'hidden draft'; area.emit('input'); c.document.visibilityState = 'hidden'; c.document.emit('visibilitychange'); assert.equal(c.writes.at(-1)[2], 'hidden draft'); c.window.emit('pagehide'); assert.equal(c.writes.length, 2);
});
test('timer rejects invalid duration and ignores queued ticks after pausing', () => {
  const c = uiContext(); assert.throws(() => c.ui.timer(0)); assert.throws(() => c.ui.timer(NaN));
  const timer = c.ui.timer(1); const toggle = find(timer.node, e => e.tag === 'button' && e.textContent === 'Start')[0]; toggle.emit('click'); const queuedTick = [...c.intervals.values()][0]; toggle.emit('click'); c.advance(90000); queuedTick(); assert.equal(find(timer.node, e => e.attrs.role === 'timer')[0].textContent, '01:00');
});

let failed = 0;
for (const { name, run } of tests) { try { await run(); console.log(`PASS ${name}`); } catch (error) { failed += 1; console.error(`FAIL ${name}: ${error.message}`); } }
if (failed) process.exitCode = 1;
else console.log(`Runtime regression tests passed: ${tests.length}`);
