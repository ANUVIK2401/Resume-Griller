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

test('fundamentals explain the request path and a safe Linux diagnosis without growing the rapid-fire set', () => {
  assert.equal(questions.rapid_fire.length, 24);
  const url = questions.rapid_fire.find(item => item.id === 'rf-url').a;
  assert.match(url, /cache/i);
  assert.match(url, /certificate|hostname/i);
  assert.match(url, /HTTP\/3|QUIC/i);
  const cheatsheet = JSON.parse(read('data/cheatsheet.json'));
  const drill = JSON.stringify(cheatsheet.walkthroughs.find(item => item.id === 'request-troubleshoot'));
  for (const command of ['dig', 'curl', 'ss', 'df', 'journalctl']) assert.match(drill, new RegExp(command));
  assert.match(drill, /502.*504/);
  assert.match(drill, /TCP.*TLS.*HTTP/);
});
test('IAM reasoning covers an explicit-deny example and organization scope exceptions', () => {
  const answer = questions.rapid_fire.find(item => item.id === 'rf-iam').a;
  assert.match(answer, /explicit deny/i);
  assert.match(answer, /s3:GetObject/);
  assert.match(service('organizations'), /management account/);
  assert.match(service('organizations'), /service.linked roles/i);
  assert.doesNotMatch(service('kms'), /every key use/i);
});
test('storage and database answers preserve scoped consistency and deployment exceptions', () => {
  assert.match(service('ebs'), /Multi.Attach/);
  assert.match(service('efs'), /One Zone/);
  const answer = questions.rapid_fire.find(item => item.id === 'rf-dynamo-rds').a;
  assert.match(answer, /DynamoDB.*transactions/i);
  assert.match(answer, /GSI.*eventually consistent/i);
  assert.match(questions.rapid_fire.find(item => item.id === 'rf-ha-web').a, /backup|restore/i);
});
test('service scope caveats avoid outdated API, buffering, and runtime claims', () => {
  assert.match(service('api-gateway'), /REST.*usage plans/i);
  assert.match(service('api-gateway'), /not.*authentication/i);
  assert.doesNotMatch(design('clickstream'), /within minutes, not seconds/);
  assert.match(design('clickstream'), /zero.buffer/i);
  assert.match(service('timestream'), /new customers/i);
  assert.match(JSON.stringify(aws.shared_responsibility), /dependencies/);
  assert.match(service('direct-connect'), /not encrypted by default/i);
  assert.match(design('erp-migration'), /Discovery Service.*closed to new customers/i);
});
test('study priorities stay bounded and cutover accounts for writes after the switch', () => {
  const cheatsheet = JSON.parse(read('data/cheatsheet.json'));
  assert.equal(cheatsheet.topics.filter(item => item.priority === 'P0').length, 13);
  assert.match(design('erp-migration'), /reverse.replication|target writes|writes on the target/i);
  assert.match(JSON.stringify(cheatsheet.topics.find(item => item.id === 'queue')), /FIFO.*5.minute/i);
  assert.match(JSON.stringify(cheatsheet.topics.find(item => item.id === 'ai-data')), /cross.Region/i);
});
