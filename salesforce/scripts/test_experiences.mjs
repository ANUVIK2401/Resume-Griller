import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { validate, select, dateLabel } = require('../js/experience-model.js');
const base = { id: 'one', title: 'A loop', level: 'MTS', region: 'USA', evidence: 'firsthand', interviewDate: '2026-01', sourceUrl: 'https://example.com/report', reportedRounds: ['Coding'], takeaway: 'Speak aloud', rehearsalPrompt: 'Explain a project', caveat: 'Self-reported', role: 'Engineer', location: 'SF', datePrecision: 'Month reported', sourceType: 'Community' };
assert.equal(validate({ reviewedAsOf: '2026-10-10', records: [base] }).length, 0);
assert.equal(validate({}).length > 0, true);
assert.equal(validate({ reviewedAsOf: 'bad', records: [base, base] }).length > 0, true);
for (const patch of [{ sourceUrl: 'javascript:alert(1)' }, { interviewDate: '2026-99' }, { reportedRounds: [] }, { id: '' }, { evidence: 'guaranteed' }, { title: 3 }, { level: null }]) {
  assert.equal(validate({ reviewedAsOf: '2026-10-10', records: [{ ...base, ...patch }] }).length > 0, true);
}
const second = { ...base, id: 'two', level: 'LMTS', region: 'India', evidence: 'official', interviewDate: null, title: 'Official advice', reportedRounds: ['Concurrency'] };
assert.deepEqual(select([base, second], { q: 'concurrency' }).map(x => x.id), ['two']);
assert.deepEqual(select([base, second], { level: 'MTS', region: 'USA', evidence: 'firsthand' }).map(x => x.id), ['one']);
assert.deepEqual(select([base, second], { q: 'unmatched' }), []);
assert.equal(dateLabel(null), 'Official guidance');
assert.equal(dateLabel('2026-01'), 'January 2026');
assert.equal(dateLabel('2026-06-06'), 'June 6, 2026');
console.log('Experience model regressions passed');
