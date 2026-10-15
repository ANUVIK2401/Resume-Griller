# Amazon AWSI ETP Solutions Architect: STAR Story Bank

Every story is built from the resume. Rule for delivery: **60 to 90 seconds**, answer first, one decision you owned, one number, then stop.
Use "I", not "we". Oracle tenure is spoken as "nearly 3 years".

Format per story: **S** situation, **T** task, **A** action (what *you* did), **R** result, then **SA twist** (how it maps to a customer-facing Solutions Architect) and **Probes** (follow-ups to rehearse).

---

## Leadership Principle map (2 stories per LP)

| Leadership Principle | Primary story | Backup story |
|---|---|---|
| Customer Obsession | S1 ERP migration HITL | S9 PacSun CEO briefs |
| Ownership | S1 ERP migration (sole engineer) | S2 P1 MTTR |
| Invent and Simplify | S4 CLI validation toolchain | S10 Trust Lab annotation routing |
| Are Right, A Lot | S3 SLO alerting | S11 ModelScope INT8 call |
| Learn and Be Curious | S7 Ramp-up on LangGraph + MCP | S11 ModelScope |
| Hire and Develop the Best | S4 CLI toolchain onboarding of 4 teams | **GAP: mentoring story** |
| Insist on the Highest Standards | S1 field-level reconciliation | S6 Pre-deploy validation |
| Think Big | S9 PacSun multi-agent app | S2 MTTR (rules today, agents tomorrow) |
| Bias for Action | S2 P1 MTTR | S8 DQN data-loader stall |
| Frugality | S11 ModelScope INT4 on a T4 | S5 NetSuite indexes (no new hardware) |
| Earn Trust | S1 confidence threshold with humans in loop | S4 adoption across 4 teams |
| Dive Deep | S5 NetSuite SQL latency | S8 DQN training stall |
| Have Backbone; Disagree and Commit | **GAP: build from S3 or S4** | **GAP** |
| Deliver Results | S2 MTTR 94 to 26 min | S12 Databricks feed 22 min |
| Strive to be Earth's Best Employer | S4 cutting on-call noise for engineers | S3 false pages down 41% |
| Success and Scale Bring Broad Responsibility | S10 HITL routing for caseworker notes | S1 audit-safe financial data |

**Must build before Oct 28:** one failure story, one disagreement story, one mentoring story. Templates at the bottom.

---

## S1. Multi-agent ERP migration with human-in-the-loop (MSRcosmos)
**LPs:** Customer Obsession, Ownership, Earn Trust, Highest Standards

- **S:** A client was moving 10,000+ GL, AP, and AR records from Sage X3 to Sage Intacct across 12 entities, each on its own cloud. Reconciliation was manual and took about 3 days per cycle.
- **T:** As the sole engineer, automate it without risking a single silent financial error.
- **A:** I built a multi-agent system on the Claude API and LangGraph, containerized with Docker to run on AWS, Azure, and GCP. I chose LangGraph for explicit state and checkpoints so every decision was auditable. I added field-level reconciliation checks and a confidence score per record: above threshold auto-approves, below goes to a human reviewer.
- **R:** Manual reconciliation dropped 68%, 83% of records auto-approved, and turnaround went from 3 days to 5.5 hours.
- **SA twist:** This is the SA job in miniature: understand a customer's business constraint (audit compliance), design around it, and earn trust by keeping a human in the loop.
- **Probes:** How did you set the threshold? What happened when the model was confidently wrong? Cost per record? How would you build it on AWS only (Bedrock, Step Functions, S3, Lambda)?

## S2. P1 MTTR from 94 to 26 minutes (Oracle)
**LPs:** Deliver Results, Bias for Action, Ownership

- **S:** NSX served 37,000+ enterprise tenants. During P1 incidents, on-call engineers dug through event streams across 1M+ endpoints by hand. P1s averaged 94 minutes to resolve.
- **T:** Cut time to diagnosis.
- **A:** I instrumented real-time API diagnostics on the event streams and auto-tagged root causes on 400 and 500 errors, attaching runbook context so engineers started with a likely cause.
- **R:** P1 MTTR fell from 94 to 26 minutes, a 72% cut.
- **SA twist:** Faster recovery is a customer outcome. Every minute of P1 is a customer down.
- **Probes:** What signals drove tags? Rules or a model? How was MTTR measured and over what window? What did you get wrong first?

## S3. SLO alerting, 41% fewer false pages (Oracle)
**LPs:** Are Right A Lot, Earth's Best Employer

- **S:** Alerts fired on static CPU, memory, and latency thresholds across 37,000+ tenants. On-call was paged for noise.
- **T:** Make every page mean something.
- **A:** I rebuilt the Prometheus/Grafana stack around SLOs for CPU, memory, and p99 latency, shipping 47 dashboards and alert rules.
- **R:** False-positive pages down 41%.
- **SA twist:** Same advice you give a customer on CloudWatch: alert on user impact, not raw thresholds.
- **Probes:** How did you pick targets? Cardinality across 37K tenants? Burn-rate alerting?

## S4. CLI validation toolchain adopted by 4 teams (Oracle)
**LPs:** Invent and Simplify, Earn Trust, influence without authority

- **S:** Each NSX team validated builds differently, so config errors reached production.
- **T:** As an SWE II with no authority over other teams, standardize pre-deployment validation.
- **A:** I built a CLI toolchain on Jenkins CI/CD with scripted checks, then drove adoption one team at a time by fixing their specific pain first.
- **R:** Adopted by 4 teams, release cycles 34% shorter, failed deploys from 11% to 4%.
- **SA twist:** An SA drives adoption with no authority over the customer. Same skill.
- **Probes:** Who pushed back and why? How did you handle team-specific needs?

## S5. NetSuite search latency down 30% (Oracle)
**LPs:** Dive Deep, Frugality

- **S:** NetSuite search was slow at enterprise data volumes.
- **T:** Find and fix the root cause without new hardware.
- **A:** I profiled query plans, found full scans on hot predicates, restructured indexes, and rewrote the SQL.
- **R:** P50 page load from 840 ms to 588 ms, a 30% improvement.
- **SA twist:** Map it to AWS advice: RDS Performance Insights, read replicas, right indexes before bigger instances.
- **Probes:** How did you find hot predicates? Did new indexes slow writes? How did you test safely?

## S6. Kubernetes autoscaling on custom metrics (Oracle)
**LPs:** Highest Standards, Are Right A Lot

- **S:** NSX had to survive release surges on OCI without breaking latency SLOs.
- **T:** Containerize and scale efficiently.
- **A:** Docker and Kubernetes with horizontal autoscaling driven by custom Prometheus metrics instead of CPU alone.
- **R:** p99 SLOs held at 2x peak load.
- **SA twist:** On AWS this is EKS with HPA on custom CloudWatch or Prometheus metrics, or ECS target tracking.
- **Probes:** Which metric and why? Scale-up lag? How did you prevent flapping?

## S7. Ramping up on LangGraph and MCP fast (MSRcosmos)
**LPs:** Learn and Be Curious

- **S:** I joined as a forward-deployed intern on a stack I had not used in production: LangGraph and MCP tool calling.
- **T:** Ship a working system for a real client in one summer.
- **A:** I built small prototypes first, read the source for checkpointing, then translated ERP rules into agent task specs and wired Sage REST APIs through MCP tools.
- **R:** Shipped the system that cut reconciliation 68% (S1).
- **SA twist:** SAs learn a new customer's domain and a new AWS service every quarter.

## S8. DQN training stall, 40% faster runs (USC volunteer research)
**LPs:** Dive Deep, Bias for Action
Say "volunteer research" if asked about the role.

- **S:** NFL fourth-down DQN over 420K plays took 52 minutes per run, slowing iteration.
- **A:** I profiled the loop, vectorized replay-buffer sampling, and removed a data-loader stall.
- **R:** 52 to 31 minutes per run (40%), and agreement with EPA-optimal calls rose from 68% to 74% on held-out 2024 drives.

## S9. PacSun executive intelligence app (USC Annenberg, ongoing)
**LPs:** Customer Obsession, Think Big
Ongoing work: say "building", not "built".

- **S:** PacSun executives lacked one ranked view of operational issues.
- **A:** I am building a multi-agent app on Claude Enterprise with MCP connectors into internal systems, ranking issues by urgency and owner and drafting CEO briefs and meeting agendas.
- **R:** Ongoing. Frame the result as what you learned about writing for executives.
- **SA twist:** Directly mirrors "communicate complex ideas to executives" in Naomi's email.

## S10. HITL annotation pipeline (AI Trust Lab, ongoing)
**LPs:** Invent and Simplify, Broad Responsibility

- **A:** Built a rubric-based pipeline on Llama 3.3 70B that labels caseworker notes, scores confidence, and routes low-confidence cases to domain experts. Benchmarked 6 frontier LLMs on Veracity across 8 trust pillars.
- **SA twist:** Responsible AI is a common customer question on Bedrock.

## S11. ModelScope quantization study (project)
**LPs:** Are Right A Lot, Frugality, Learn and Be Curious

- **S:** Wanted evidence, not folklore, on quantization tradeoffs.
- **A:** Benchmarked Llama-3.2-3B and Gemma-2-2B across 8 configs on a T4 GPU.
- **R:** INT4 at 2299 MB, 62% below FP16, at 13.7 tok/s with MMLU within a point. INT8 was strictly dominated: 53% more memory and 2.1x lower throughput.
- **SA twist:** Customer cost advice: right-size the model and instance (Inferentia, G instances) before scaling out.

## S12. Nightly Databricks feed (MSRcosmos)
**LPs:** Deliver Results, Frugality

- **A:** PySpark jobs staging 17 tables and 4.2M rows into Delta Lake across AWS, Azure, and GCP, with partition pruning and incremental merges.
- **R:** Full refresh held at 22 minutes.
- **SA twist:** AWS equivalent: Glue or EMR into S3 with Iceberg, queried by Athena.

---

## Gap templates (fill with real events, do not invent)

- **Failure:** What did I own that went wrong? What was the impact? What did I change afterward so it could not repeat? End with the lesson, not the excuse.
- **Disagreement (Have Backbone):** Who did I disagree with, about what technical decision? What data did I bring? What was decided? Did I commit fully even if I lost?
- **Mentoring (Hire and Develop):** Who did I help ramp up (a new teammate, a lab member, a team adopting the CLI)? What changed for them?
