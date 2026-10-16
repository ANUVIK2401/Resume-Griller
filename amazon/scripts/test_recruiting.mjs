import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const questions = JSON.parse(read('data/questions.json'));
test('role framing uses confirmed AWSI ETP context without inventing account scope', () => {
  const opener = questions.openers.find(item => item.id === 'why-awsi');
  assert.match(opener.q, /AWSI.*ETP/);
  assert.doesNotMatch(opener.q, /only if confirmed|strategic accounts/);
  assert.match(opener.outline.join(' '), /sales/);
  assert.match(opener.outline.join(' '), /executive/);
  assert.match(read('../index.html'), /AWSI.*ETP/);
});
test('sales collaboration practice keeps customer evidence ahead of promises', () => {
  const roleplay = questions.roleplays.find(item => item.id === 'rp-sales-partner');
  assert.ok(roleplay, 'Missing customer/sales collaboration rehearsal');
  assert.match(JSON.stringify(roleplay), /engineer/);
  assert.match(JSON.stringify(roleplay), /executive/);
  assert.match(JSON.stringify(roleplay), /pilot|proof of concept/);
  assert.match(JSON.stringify(roleplay), /customer.*(outcome|success)/i);
});
