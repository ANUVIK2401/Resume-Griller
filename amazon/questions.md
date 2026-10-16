# Question Bank: AWSI - ETP Solutions Architect Interview

**Practice structure, not a confirmed interview schedule:** rehearse behavioral evidence, a resume deep dive, AWS architecture, and customer communication. Confirm interview count, level, team, coding expectations, and format with your recruiter. Use the three sessions below to rehearse; they are not a prediction of your loop.

| Practice session | Focus | Lead stories |
|---|---|---|
| 1 | Behavioral LPs + resume deep dive | S1, S2, S5 |
| 2 | Technical: AWS fundamentals + architecture whiteboard | aws-terms.md, designs below |
| 3 | Customer role-play / communication + LPs | S1, S4, S9 |

---

## A. Openers (have crisp answers)
1. **Tell me about yourself (60 sec).** Oracle, July 2022 to January 2025 (about 2.5 years), 37,000+ tenants, MTTR 94 to 26 min. Then forward-deployed at MSRcosmos: customer-facing, 12 entities on 3 clouds, 3 days to 5.5 hours. Candidate confirmation: close with your genuine motivation for connecting customer problems to architecture decisions.
2. **Why AWS? Why Solutions Architect and not SDE?** State your genuine reason for choosing SA. If customer-facing work motivates you, support it with your verified MSRcosmos migration and human-review routing experience. Explain the actual customer need and your contribution without assuming auditor requirements or a personal preference.
3. **Why AWSI - ETP Solutions Architect?** The role is confirmed in the supplied recruiter email. Connect a supported migration or reliability example to customer outcomes, collaboration with sales, and communication to engineers and executives. Supply your own genuine motivation; account segment and specialty remain unspecified.
4. **Which LP resonates most?** Choose the principle you actually connect with and explain why, using verified actions. For S1 human-review routing, confirm the customer need that drove the safeguard.

## B. Leadership Principle question practice
Use stories.md. Prepare varied examples so different questions reveal different evidence; adapt story choice to the question.

- **Customer Obsession:** Tell me about a time you went above and beyond for a customer. A time you had to say no to a customer.
- **Ownership:** A time you took on something outside your role. A time you saw a problem nobody owned.
- **Invent and Simplify:** A time you simplified a complex process.
- **Are Right, A Lot:** A decision with incomplete data. A time your judgment was wrong.
- **Learn and Be Curious:** How did you learn a new technology fast? What have you learned recently outside work?
- **Highest Standards:** A time you refused to ship something not good enough.
- **Think Big:** A time you proposed a bold direction.
- **Bias for Action:** A decision made quickly with a calculated risk.
- **Frugality:** Achieving more with less.
- **Earn Trust:** A time you received tough feedback. A time you built trust with a skeptical stakeholder.
- **Dive Deep:** A problem you only solved by going into the details. How do you know when to dive deep?
- **Have Backbone:** A time you disagreed with your manager or a customer. *(Gap story needed.)*
- **Deliver Results:** Your biggest impact. A time you missed a deadline. *(Failure story needed.)*
- **Hire and Develop:** A time you helped someone grow. *(Mentoring story needed.)*

## C. Technical fundamentals (lead with 2 sentences, then defend the choice)
1. Region vs AZ vs edge location?
2. How do you make a web app highly available on AWS? Distinguish surviving a zonal failure, client reconnects, enough surviving capacity, tested backups, and regional DR.
3. Security group vs NACL?
4. Public vs private subnet? What does a NAT Gateway do?
5. ALB vs NLB? When API Gateway?
6. S3 storage classes and lifecycle policies. How to make S3 data cheaper?
7. EBS vs EFS vs S3?
8. RDS Multi-AZ DB instance vs Multi-AZ DB cluster vs read replica vs backup?
9. DynamoDB vs RDS: which access patterns, transactions and consistency? What is a hot key? Can a GSI serve a strong read?
10. Lambda limits and cold starts; when not to use Lambda?
11. ECS vs EKS vs Fargate?
12. SQS vs SNS vs EventBridge vs Kinesis? What does FIFO deduplicate, and what happens after a side effect succeeds but acknowledgment fails?
13. IAM role vs user; trust vs permissions; explicit deny; cross-account access. Why does a role with an allow still receive AccessDenied?
14. Shared responsibility model.
15. Encryption at rest vs in transit; KMS.
16. RPO vs RTO and the four DR strategies.
17. The 6 Well-Architected pillars.
18. The 7 Rs of migration.
19. CloudWatch vs CloudTrail vs Config.
20. How would you reduce a customer's AWS bill? (Right-size, Savings Plans, Spot, S3 tiering, delete idle, Graviton.)
21. What happens when you type a URL? Explain caches, DNS, transport, TLS validation, HTTP, edge/origin, application and dependencies; mention connection reuse and HTTP/3 when relevant.
22. TCP vs UDP; common HTTP status codes.
23. What is Bedrock? How would you build RAG on AWS?
24. How would you choose between a large model and a small model for a customer?

## D. Whiteboard architectures (practice 4, framework below)
**Framework (say it out loud):** clarify requirements and constraints (users, traffic, data, compliance, budget) -> draw the simple version -> scale it -> make it reliable -> secure it -> cost it -> state one tradeoff.

1. **3-tier web app for a retailer with Black Friday spikes.** Route 53 -> CloudFront -> ALB -> ASG across 2 AZs -> Aurora Multi-AZ + ElastiCache; S3 for images; scheduled + target-tracking scaling. Commit checkout and an outbox event together; publish to SQS with idempotent fulfillment.
2. **Migrate an on-prem ERP / financial system to AWS** (hypothetical AWS mapping of S1). Discovery, 7 Rs per workload, DMS where supported, landing zone, reconciliation and cutover. Explain how rollback preserves writes already accepted on the target.
3. **Serverless document processing pipeline.** S3 upload -> EventBridge -> Step Functions -> Textract -> Bedrock summarization -> DynamoDB -> human review for low confidence (S1 pattern).
4. **GenAI chatbot over company docs (RAG).** S3 docs -> Bedrock Knowledge Base (embeddings + vector store such as OpenSearch Serverless) -> Bedrock model with Guardrails -> API Gateway + Lambda -> Cognito auth; derive server-side retrieval filters from trusted identity; isolate caches by authorization. Guardrails do not replace document permissions. Evaluate answer quality before launch.
5. **Real-time analytics / clickstream.** Kinesis -> Firehose -> S3 -> Glue -> Athena / QuickSight.
6. **Multi-region DR for a payments app.** Pick a DR tier from measured RPO/RTO, a single Aurora Global Database writer, writer fencing, Route 53 failover, stable payment-provider keys, and reconciliation. DNS alone does not prevent duplicate charges.

## E. Customer role-play practice
Scenario styles: "I'm the CTO of a retailer. Our site goes down on peak days. What should we do?" or "Explain containers to my CFO."

How to win it:
- **Ask before proposing:** business goal, current setup, constraints, timeline, budget, compliance.
- **Restate** the problem in their words.
- **Propose 1 or 2 options**, with a tradeoff and a cost direction for each.
- **Match the audience:** CFO hears cost and risk; engineers hear services and design.
- **Never overpromise.** If unsure: "I will verify the documented behavior and agree a realistic follow-up time with you."
- **Close with next steps:** a proof of concept, a Well-Architected review, a follow-up meeting.

## F. Questions to ask interviewers
1. What outcomes distinguish a strong Solutions Architect in the first 6 months?
2. How are customer accounts assigned, and how does a new SA build customer context?
3. What share of customer conversations right now involve generative AI on Bedrock?
4. How do SAs on this team split time between customer work and building reusable assets?
5. What is one thing new SAs underestimate?

## G. Logistics for the day
- Confirm the current interview schedule, timezone, format, and recruiter instructions; join or arrive early.
- Bring a notebook and pen for whiteboard practice; dress business casual.
- Have the 60-second intro, 6 lead stories, and the 6 pillars memorized.
- Write down follow-up items after the interview and verify any promised technical answers before sending them.

Technical answer details and AWS sources: [AWS terminology](aws-terms.md). Treat design exercises as hypothetical; separate verified project experience from AWS equivalents. Confirm role level and interview format with the recruiter before assuming a program-specific loop.


## Recruiter role context and sales-partner drill

The supplied email confirms AWSI - ETP Solutions Architect, customer-solution design, sales collaboration, and communication from technical experts to executives. It describes success through positive customer impact rather than sales quotas. These are role expectations, not evidence that any particular candidate story demonstrated them.

Practise with a sales colleague seeking a financial-migration commitment before data and cutover assumptions are tested. Ask about the customer outcome, reconciliation, downtime tolerance, approval owners, rollback and evidence. Propose a bounded pilot with jointly agreed success criteria. Explain validation and failure handling to an engineer, then explain business impact, risk and the next decision to an executive. State what remains untested before making a commitment.

## Technical follow-up drill: isolate, decide, validate

Use the expanded browser answers and [AWS-CHEATSHEET.md](AWS-CHEATSHEET.md) for evidence and sources. Keep 24 core answers; add depth through these follow-ups rather than memorizing more service names.

| Prompt | Evidence or decision to explain |
|---|---|
| DNS resolves but HTTPS fails | Separate TCP connection, TLS hostname/trust/expiry, HTTP status and dependency time. Use sanitized curl timings; do not disable certificate verification as a fix. |
| ALB returns 504 and the process is running | Compare target reachability, listener/port, SG/NACL return path, worker saturation and downstream latency. A running process is not proof of a healthy request path. |
| Linux service is slow | Use ss for listeners, top/free for CPU/memory, df -h/df -i for space/inodes, journalctl for the service time window; choose the next command from a hypothesis. |
| Role allows s3:GetObject but access is denied | Identify principal, object ARN and conditions; check applicable explicit denies, endpoint/resource policies and KMS permissions where relevant. |
| A payment worker retries | Preserve a stable business idempotency key, durable state and provider reconciliation; queue deduplication alone does not atomically charge a card. |
| Customer asks for a cheaper design | Establish the business metric, baseline usage and constraints. Compare total/unit cost and failure risk; prove improvement with a bounded pilot. |

Close each answer with a measurable next step: the observation that would reject your hypothesis, a representative benchmark, a restore/failover rehearsal, or a customer-approved pilot criterion.
