// Top questions filter: P0 sorts first, filters combine, status uses the saved value.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const { filterQuestions } = createRequire(import.meta.url)('../js/render-top.js');
const data = JSON.parse(readFileSync(new URL('../data/top.json', import.meta.url), 'utf8'));
const all = filterQuestions(data.questions);
assert.equal(all.length, data.questions.length);
const firstP1 = all.findIndex((q) => q.priority === 'P1');
assert.ok(firstP1 > 0 && all.slice(firstP1).every((q) => q.priority === 'P1'), 'P0 questions come first');
assert.ok(filterQuestions(data.questions, { priority: 'P0', group: 'compare' }).every((q) => q.priority === 'P0' && q.group === 'compare'));
assert.deepEqual(filterQuestions(data.questions, { q: 'hot partition' }).map((q) => q.id), ['sql-nosql']);
assert.deepEqual(filterQuestions(data.questions, { status: 'known' }, (q) => (q.id === 'dr' ? 'known' : 'new')).map((q) => q.id), ['dr']);
console.log(`top questions: ${data.questions.length} questions, ${data.questions.filter((q) => q.priority === 'P0').length} P0, filters ok`);
