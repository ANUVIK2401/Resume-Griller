# Question Bank: AWSI ETP Solutions Architect On-Campus Loop

**Likely structure (inferred from SA new-grad reports, confirm with Naomi):** about 3 interviews, each mixing 2 Leadership Principle questions with a technical or customer segment. One round may be a whiteboard architecture or customer role-play.

| Round | Likely focus | Lead stories |
|---|---|---|
| 1 | Behavioral LPs + resume deep dive | S1, S2, S5 |
| 2 | Technical: AWS fundamentals + architecture whiteboard | aws-terms.md, designs below |
| 3 | Customer role-play / communication + LPs | S1, S4, S9 |

---

## A. Openers (have crisp answers)
1. **Tell me about yourself (60 sec).** Infra engineer at Oracle for close to 3 years, 37,000+ tenants, MTTR 94 to 26 min. Then forward-deployed at MSRcosmos: customer-facing, 12 entities on 3 clouds, 3 days to 5.5 hours. Close: "I want to be the person who sits between the customer's problem and the right architecture."
2. **Why AWS? Why Solutions Architect and not SDE?** You liked the customer-facing part of MSRcosmos most: translating a business constraint into a design. Success measured by customer impact, not quota (quote Naomi's note).
3. **Why AWSI / strategic accounts?** Large, regulated enterprises, the scale you worked at Oracle.
4. **Which LP resonates most?** Customer Obsession or Dive Deep, with a story attached.

## B. Leadership Principle questions (2 to 3 per round)
Use stories.md. One story should not be reused more than twice across the loop.

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

## C. Technical fundamentals (rapid fire, 1 to 2 sentence answers)
1. Region vs AZ vs edge location?
2. How do you make a web app highly available on AWS? (Multi-AZ ASG behind ALB, Multi-AZ RDS, Route 53 health checks.)
3. Security group vs NACL?
4. Public vs private subnet? What does a NAT Gateway do?
5. ALB vs NLB? When API Gateway?
6. S3 storage classes and lifecycle policies. How to make S3 data cheaper?
7. EBS vs EFS vs S3?
8. RDS Multi-AZ vs read replica?
9. DynamoDB vs RDS: when each? What is a hot partition?
10. Lambda limits and cold starts; when not to use Lambda?
11. ECS vs EKS vs Fargate?
12. SQS vs SNS vs EventBridge vs Kinesis?
13. IAM role vs user; what is least privilege?
14. Shared responsibility model.
15. Encryption at rest vs in transit; KMS.
16. RPO vs RTO and the four DR strategies.
17. The 6 Well-Architected pillars.
18. The 7 Rs of migration.
19. CloudWatch vs CloudTrail vs Config.
20. How would you reduce a customer's AWS bill? (Right-size, Savings Plans, Spot, S3 tiering, delete idle, Graviton.)
21. What happens when you type a URL in a browser? (DNS, TCP, TLS, HTTP, CDN, LB.)
22. TCP vs UDP; common HTTP status codes.
23. What is Bedrock? How would you build RAG on AWS?
24. How would you choose between a large model and a small model for a customer?

## D. Whiteboard architectures (practice 4, framework below)
**Framework (say it out loud):** clarify requirements and constraints (users, traffic, data, compliance, budget) -> draw the simple version -> scale it -> make it reliable -> secure it -> cost it -> state one tradeoff.

1. **3-tier web app for a retailer with Black Friday spikes.** Route 53 -> CloudFront -> ALB -> ASG across 2 AZs -> Aurora Multi-AZ + ElastiCache; S3 for images; scheduled + target-tracking scaling.
2. **Migrate an on-prem ERP / financial system to AWS** (your S1 story). Discovery, 7 Rs per workload, DMS for data, landing zone with Control Tower, cutover plan, rollback.
3. **Serverless document processing pipeline.** S3 upload -> EventBridge -> Step Functions -> Textract -> Bedrock summarization -> DynamoDB -> human review for low confidence (S1 pattern).
4. **GenAI chatbot over company docs (RAG).** S3 docs -> Bedrock Knowledge Base (embeddings + vector store such as OpenSearch Serverless) -> Bedrock model with Guardrails -> API Gateway + Lambda -> Cognito auth; evaluate answer quality before launch.
5. **Real-time analytics / clickstream.** Kinesis -> Firehose -> S3 -> Glue -> Athena / QuickSight.
6. **Multi-region DR for a payments app.** Pick a DR tier from RPO/RTO, Aurora Global Database, Route 53 failover.

## E. Customer role-play (expect at least one)
Scenario styles: "I'm the CTO of a retailer. Our site goes down on peak days. What should we do?" or "Explain containers to my CFO."

How to win it:
- **Ask before proposing:** business goal, current setup, constraints, timeline, budget, compliance.
- **Restate** the problem in their words.
- **Propose 1 or 2 options**, with a tradeoff and a cost direction for each.
- **Match the audience:** CFO hears cost and risk; engineers hear services and design.
- **Never overpromise.** If unsure: "I'll confirm with the service team and follow up by Friday."
- **Close with next steps:** a proof of concept, a Well-Architected review, a follow-up meeting.

## F. Questions to ask interviewers
1. What does a strong ETP graduate look like after the first 6 months?
2. How are customer accounts assigned after the program?
3. What share of customer conversations right now involve generative AI on Bedrock?
4. How do SAs in AWSI split time between customer work and building reusable assets?
5. What is one thing new SAs underestimate?

## G. Logistics for the day
- Arrive 15 minutes early; confirm start time in PT with Naomi.
- Bring a notebook and pen for whiteboard practice; dress business casual.
- Have the 60-second intro, 6 lead stories, and the 6 pillars memorized.
- Send a short thank-you note to Naomi the same evening.
