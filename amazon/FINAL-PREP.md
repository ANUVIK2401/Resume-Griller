# Amazon AWSI-ETP: final preparation card

Tentative interview target: Wednesday, October 28, 2026, on campus at USC. Confirm the exact time, building, room, check-in instructions, and allowed materials. No interview round structure is assumed.

## Use this first

Each day: complete the 90-minute minimum, then use the extension blocks if you have three hours. Speak aloud and draw on paper before reading the answer. Repeating a weak answer is more valuable than opening another glossary page.

## Your main story anchors

- S1, customer architecture: 10,000+ records; 12 entities; 68% less manual reconciliation; 83% auto-approved; Cycle time went from 3 days to 5.5 hours.
- S2, ownership and diagnosis: 37,000+ tenants; 1M+ endpoints; P1 MTTR went from 94 to 26 min (72%).
- S4, simplification and delivery: CLI toolchain adopted by 4 teams; Release cycles 34% shorter; Failed deploys went from 11% to 4%. The deployment change is 7 percentage points.
- S5, technical depth: NetSuite P50 went from 840 to 588 ms (30%).
- S3 and S6 are operational reserves. S8 and S11 add research/benchmarking breadth. S7 is the same ERP episode as S1; use another example when an interviewer asks for a different situation.

For every answer: what was difficult, what did I personally choose, why that choice, what changed, and what would I improve? Keep the initial answer around 90 seconds, then follow the interviewer into details.

## Technical decisions to explain without notes

- Trace a request: DNS -> TLS -> ingress/load balancer -> application -> data store, with identity, routes, security groups, observability, and the return path.
- Choose EC2, Lambda, or ECS/Fargate from runtime and operational needs; explain when EKS earns its complexity.
- Choose S3/EBS/EFS by access semantics, then RDS/Aurora versus DynamoDB by transactions and access patterns.
- Separate availability, backups, read scaling, and disaster recovery. Define RPO/RTO and test a restore or failover.
- Explain SQS/SNS/EventBridge, retries, visibility timeout, DLQs, backpressure, and idempotency.
- Explain IAM roles and applicable policy denies, encryption, secret management, CloudTrail, and shared responsibility.
- For RAG, enforce document authorization in the application/retrieval path; evaluate quality and failures. Guardrails are not an access-control boundary.
- Name the largest cost drivers and compare one simpler alternative before adding another service.

## Three paper designs

Draw a secure scalable web application, an event-driven document/order workflow, and a migration or recovery design. For each: clarify requirements, trace data, compare an alternative, fail one component, explain recovery/security/cost, and propose a validation step.

## Customer conversation

Ask for the business outcome, users, workload, data constraints, availability/latency needs, timeline, budget, and success measure. Recommend a small next step. Explain the mechanism to the engineer and the impact, risk, and decision to the executive. Work with sales without promising untested outcomes.

## Behavioral breadth still matters

Have real failure, disagreement, and mentoring examples. A success story about tool adoption is not automatically a mentoring episode. A concrete qualitative outcome is acceptable; use what actually happened and explain your own action and learning.

## Sprint

| Date | Focus | Gate to pass aloud |
|---|---|---|
| 2026-10-16 | Start here: pitch, S1/S2, request path | Pitch fits 60 seconds; S1/S2 have clear I-actions and defensible results; explain who can access each resource and why. |
| 2026-10-17 | Core S4/S5 and paper design 1 | Four core stories (S1/S2/S4/S5) each have one personal decision, an honest result, and one tradeoff. |
| 2026-10-18 | Full mock 1 and targeted repair | Correct both largest misses immediately; if a claim cannot be verified, qualify or remove it from your spoken answer. |
| 2026-10-19 | Storage, databases, and S3/S6 reserves | Answer at least four of five database choices with requirement-based reasons and one alternative. |
| 2026-10-20 | Paper design 2: decoupled workflow | Explain duplicate delivery, recovery from a poisoned message, and the observable customer status. |
| 2026-10-21 | Customer translation and commercial judgment | Ask before proposing; explain business value without jargon and close with a measurable next step. |
| 2026-10-22 | Full mock 2 and readiness checkpoint, after the 12:30 Salesforce call | Target eight of ten justified service choices and four complete core STAR answers. Use extension time for misses, not new breadth. |
| 2026-10-23 | Paper design 3: resilience and migration | Justify recovery from business needs and distinguish an available replica from a tested recoverable backup. |
| 2026-10-24 | Resume deep dive and bounded AI review | Separate actual work from proposed AWS designs; qualify unknown metrics and demonstrate a clear request path. |
| 2026-10-25 | Full mock 3 and final repairs | Four core stories plus two reserves are defensible; an unseen design includes requirements, security, failure/recovery, scaling, cost, and tradeoffs. |
| 2026-10-26 | Final rehearsal and USC logistics | Target eight of ten justified choices, six honest story hooks, and a complete 30-minute design. Pending scheduling facts stay explicitly pending. |
| 2026-10-27 | Taper: short recall, logistics, and rest | Know your opening and strongest examples; identify remaining unknowns calmly. The 90-minute minimum is enough today; optional blocks are a buffer, not a cram target. |

## October 27 and interview day

October 27: light recall, repair only your weakest points, prepare logistics, and rest. On interview day, use a brief warm-up, listen to the actual question, state assumptions, ask clarifying questions, and explain your decisions. No new-service cram session.

## Open the practice tools

- [Daily sprint](index.html#sprint)
- [STAR answers](behavioral.html#story-erp-hitl)
- [AWS decisions](cheatsheet.html)
- [Architecture diagrams](architecture.html)
- [Paper designs](design.html)
- [Customer questions](questions.html)
- [Timed mock](mock.html)
