// Portable sprint and recall card; generated from the dashboard's current data.
import { readFileSync, writeFileSync } from 'node:fs';
export function render(loop, profile) {
  const day = new Date(`${loop.event.target_date}T12:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const facts = ids => ids.map(id => profile.numbers.find(number => number.id === id)?.fact).filter(Boolean).join('; ');
  const rows = loop.sprint.days.map(item => `| ${item.date} | ${item.focus} | ${item.readiness_gate} |`);
  return [
    '# Amazon AWSI-ETP: final preparation card', '',
    `Tentative interview target: ${day}, on campus at USC. Confirm the exact time, building, room, check-in instructions, and allowed materials. No interview round structure is assumed.`, '',
    '## Use this first', '',
    'Each day: complete the 90-minute minimum, then use the extension blocks if you have three hours. Speak aloud and draw on paper before reading the answer. Repeating a weak answer is more valuable than opening another glossary page.', '',
    '## Your main story anchors', '',
    `- S1, customer architecture: ${facts(['msr-records', 'msr-entities', 'msr-reconciliation', 'msr-auto-approved', 'msr-cycle-before'])}.`,
    `- S2, ownership and diagnosis: ${facts(['oracle-tenants', 'oracle-endpoints', 'oracle-mttr-before'])}.`,
    `- S4, simplification and delivery: ${facts(['oracle-cli-teams', 'oracle-release', 'oracle-deploy-before'])}. The deployment change is 7 percentage points.`,
    `- S5, technical depth: ${facts(['oracle-p50-before'])}.`,
    '- S3 and S6 are operational reserves. S8 and S11 add research/benchmarking breadth. S7 is the same ERP episode as S1; use another example when an interviewer asks for a different situation.', '',
    'For every answer: what was difficult, what did I personally choose, why that choice, what changed, and what would I improve? Keep the initial answer around 90 seconds, then follow the interviewer into details.', '',
    '## Technical decisions to explain without notes', '',
    '- Trace a request: DNS -> TLS -> ingress/load balancer -> application -> data store, with identity, routes, security groups, observability, and the return path.',
    '- Choose EC2, Lambda, or ECS/Fargate from runtime and operational needs; explain when EKS earns its complexity.',
    '- Choose S3/EBS/EFS by access semantics, then RDS/Aurora versus DynamoDB by transactions and access patterns.',
    '- Separate availability, backups, read scaling, and disaster recovery. Define RPO/RTO and test a restore or failover.',
    '- Explain SQS/SNS/EventBridge, retries, visibility timeout, DLQs, backpressure, and idempotency.',
    '- Explain IAM roles and applicable policy denies, encryption, secret management, CloudTrail, and shared responsibility.',
    '- For RAG, enforce document authorization in the application/retrieval path; evaluate quality and failures. Guardrails are not an access-control boundary.',
    '- Name the largest cost drivers and compare one simpler alternative before adding another service.', '',
    '## Three paper designs', '',
    'Draw a secure scalable web application, an event-driven document/order workflow, and a migration or recovery design. For each: clarify requirements, trace data, compare an alternative, fail one component, explain recovery/security/cost, and propose a validation step.', '',
    '## Customer conversation', '',
    'Ask for the business outcome, users, workload, data constraints, availability/latency needs, timeline, budget, and success measure. Recommend a small next step. Explain the mechanism to the engineer and the impact, risk, and decision to the executive. Work with sales without promising untested outcomes.', '',
    '## Behavioral breadth still matters', '',
    'Have real failure, disagreement, and mentoring examples. A success story about tool adoption is not automatically a mentoring episode. A concrete qualitative outcome is acceptable; use what actually happened and explain your own action and learning.', '',
    '## Sprint', '',
    '| Date | Focus | Gate to pass aloud |', '|---|---|---|', ...rows, '',
    '## October 27 and interview day', '',
    'October 27: light recall, repair only your weakest points, prepare logistics, and rest. On interview day, use a brief warm-up, listen to the actual question, state assumptions, ask clarifying questions, and explain your decisions. No new-service cram session.', '',
    '## Open the practice tools', '',
    '- [Daily sprint](index.html#sprint)', '- [STAR answers](behavioral.html#story-erp-hitl)', '- [AWS decisions](cheatsheet.html)', '- [Architecture diagrams](architecture.html)', '- [Paper designs](design.html)', '- [Customer questions](questions.html)', '- [Timed mock](mock.html)', '',
  ].join('\n');
}
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const read = name => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), 'utf8'));
  writeFileSync(new URL('../FINAL-PREP.md', import.meta.url), render(read('loop'), read('profile')));
  console.log('wrote amazon/FINAL-PREP.md');
}
