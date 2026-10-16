import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
const source = readFileSync(new URL('../js/storage.js', import.meta.url), 'utf8');
function setup(shared = new Map(), blocked = false) {
  const events = {};
  const window = { addEventListener: (key, fn) => { events[key] = fn; } };
  const localStorage = { getItem: key => shared.get(key) || null, setItem: (key, value) => { if (blocked) throw Error('blocked'); shared.set(key, value); } };
  vm.runInNewContext(source, { window, localStorage, Date, Set, Blob, URL, setTimeout, console: { warn() {} }, document: { createElement: () => ({ click() {} }) } }, { filename: new URL('../js/storage.js', import.meta.url).pathname });
  return { store: window.Prep.store, shared, events };
}
const snapshot = value => JSON.parse(JSON.stringify(value));
test('interview import requires a real Pacific wall-clock datetime', async () => {
  const { store } = setup();
  store.set('notes', 'my-note', 'Keep me');
  for (const date of ['2026-02-30T09:00', '2026-11-15T09:30Z', '2026-11-15T09:30-08:00', '2026-11-15T24:00', '2026-13-15T09:30', '2026-11-15T09:60']) {
    await assert.rejects(store.importFile({ text: async () => JSON.stringify({ version: 1, loop: { 'interview-event': { date } } }) }), date);
    assert.equal(store.get('notes', 'my-note'), 'Keep me');
  }
  store.set('loop', 'interview-event', { date: '2028-02-29T09:30' });
  assert.equal(store.get('loop', 'interview-event').date, '2028-02-29T09:30');
  store.pushQuiz({ at: '2026-10-15T20:00:00.000Z', kind: 'mock', total: 1, score: 1, missed: [] });
});
test('progress isolates snapshots, merges tabs, validates fields and preserves drafts on bad import', async () => {
  const shared = new Map(); const a = setup(shared); const b = setup(shared);
  a.store.set('notes', 'a', '<script>literal draft</script>'); b.store.set('checks', 'b', true);
  assert.equal(JSON.parse(shared.get('awsprep:v1')).notes.a, '<script>literal draft</script>');
  const copy = a.store.all(); copy.notes.a = 'changed'; assert.notEqual(a.store.get('notes', 'a'), 'changed');
  for (const value of [{ version: 2 }, { version: 1, notes: { a: 2 } }, { version: 1, confidence: { a: 6 } }, JSON.parse('{"version":1,"notes":{"__proto__":"x"}}')]) {
    await assert.rejects(a.store.importFile({ text: async () => JSON.stringify(value) }));
  }
  await assert.rejects(a.store.importFile({ size: 6 * 1024 * 1024, text: async () => '{}' }));
  a.store.set('notes', 'a', null);
  assert.equal(JSON.parse(shared.get('awsprep:v1')).checks.b, true);
  b.events.storage({ key: 'awsprep:v1', newValue: shared.get('awsprep:v1') });
  assert.equal(b.store.get('notes', 'a'), undefined);
});
test('blocked or corrupted storage remains usable and valid exports import without data loss', async () => {
  const { store } = setup(new Map([['awsprep:v1', '{broken']]), true);
  let updates = 0; const off = store.subscribe(() => { updates++; });
  store.set('notes', 'draft', 'private'); off(); store.set('status', 'story-a', 'ready');
  assert.equal(updates, 1); assert.equal(store.persistent, false);
  const next = setup().store; await next.importFile({ text: async () => JSON.stringify(store.all()) });
  assert.equal(next.get('notes', 'draft'), 'private');
  assert.deepEqual(snapshot(next.all().status), { 'story-a': 'ready' });
});
