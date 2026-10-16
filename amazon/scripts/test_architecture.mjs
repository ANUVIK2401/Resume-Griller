import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
const aws = JSON.parse(read('data/aws.json'));
const designs = JSON.parse(read('data/designs.json'));
const questions = JSON.parse(read('data/questions.json'));
const service = (id) => JSON.stringify(aws.services.find((item) => item.id === id));
const design = (id) => JSON.stringify(designs.designs.find((item) => item.id === id));

test('queue guidance preserves consumer idempotency despite FIFO deduplication', () => {
  assert.match(service('sqs'), /idempotent/i);
  assert.match(service('sqs'), /5.minute/i);
  assert.doesNotMatch(service('sqs'), /FIFO \(ordered, exactly-once processing\)/);
  assert.match(read('aws-terms.md'), /idempotent consumers/i);
});
test('network and database glossary teaches deployment scope and exceptions', () => {
  assert.doesNotMatch(service('vpc'), /Always, for anything/);
  assert.match(service('vpc'), /S3.*DynamoDB/);
  assert.match(service('cloudfront'), /uncacheable/i);
  assert.match(service('rds'), /DB instance.*DB cluster/i);
});
test('RAG authorizes retrieval and caches using trusted server-side identity', () => {
  const rag = design('rag-chatbot');
  assert.match(rag, /server.side/i);
  assert.match(rag, /trusted.*identity/i);
  assert.match(rag, /cache.*(identity|authorization)/i);
  assert.match(rag, /Guardrails.*not.*(authorization|access control)/i);
});
test('Bedrock customer guidance accounts for inference routing and model-specific terms', () => {
  const bank = JSON.stringify(questions.roleplays.find((item) => item.id === 'rp-bank-genai'));
  assert.doesNotMatch(bank, /Data stays in their account and Region/);
  assert.match(bank, /cross.Region/i);
  assert.match(bank, /model.*(terms|retention)/i);
  assert.match(service('bedrock-guardrails'), /authorization|access control/i);
});
test('retail checkout has an atomic outbox and idempotent consumer', () => {
  const retail = design('retail-3tier');
  assert.match(retail, /outbox/i);
  assert.match(retail, /same.*transaction/i);
  assert.match(retail, /idempotent/i);
});
test('payment recovery fences writes and handles reconciliation without global dedupe claims', () => {
  const dr = design('multi-region-dr');
  assert.doesNotMatch(dr, /Multi-Region idempotency keys/);
  assert.match(dr, /fenc/i);
  assert.match(dr, /payment.provider.*idempotency/i);
  assert.match(dr, /reconcil/i);
  assert.match(JSON.stringify(aws.dr_tiers), /illustrative/i);
  assert.match(JSON.stringify(aws.dr_tiers), /single.writer/i);
});
test('technical coaching separates hypothetical work and promises from experience', () => {
  assert.doesNotMatch(design('doc-pipeline'), /as I did in S1/);
  assert.doesNotMatch(JSON.stringify(questions.roleplay_rules), /follow up by Friday/);
  assert.doesNotMatch(read('questions.md'), /follow up by Friday/);
  assert.match(read('aws-terms.md'), /docs\.aws\.amazon\.com/);
});
test('candidate openers request genuine motives and preserve reviewed resume chronology', () => {
  const openers = JSON.stringify(questions.openers);
  const coaching = `${openers} ${read('questions.md')}`;
  assert.doesNotMatch(coaching, /liked most|liked the customer-facing part|customer.s auditors needed|turning an audit constraint/i);
  assert.doesNotMatch(coaching, /Oracle for close to 3 years/i);
  assert.match(openers, /July 2022 to January 2025/);
  assert.match(openers, /confirm.*(motivation|reason)/i);
  assert.match(openers, /human.review routing/i);
});
