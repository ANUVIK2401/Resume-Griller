// Interview bar countdown. Run: node --test shared/test_switcher.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { countdown } = createRequire(import.meta.url)('./switcher.js');

test('counts Pacific calendar days, not UTC days', () => {
  // 11pm Pacific on Oct 21 is already Oct 22 in UTC; the interview is still tomorrow.
  const lateEvening = new Date('2026-10-22T06:00:00Z');
  assert.equal(countdown('2026-10-22T11:45', lateEvening).days, 1);
  assert.match(countdown('2026-10-22T11:45', lateEvening).long, /Thu, Oct 22 11:45 · tomorrow/);
});

test('labels today, future, and past interviews', () => {
  const morning = new Date('2026-10-22T15:00:00Z'); // 8am Pacific
  assert.deepEqual([countdown('2026-10-22T11:45', morning).short, countdown('2026-10-22T11:45', morning).long], ['today', 'Today 11:45']);
  assert.equal(countdown('2026-10-28', morning).short, '6d');
  assert.match(countdown('2026-10-28', morning).long, /Wed, Oct 28 · in 6 days/);
  assert.equal(countdown('2026-10-20', morning).short, 'done');
});

test('missing or malformed dates produce no countdown', () => {
  assert.equal(countdown(null), null);
  assert.equal(countdown(''), null);
  assert.equal(countdown('soon'), null);
});
