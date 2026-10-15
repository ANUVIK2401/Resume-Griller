# Amazon AWSI ETP Solutions Architect: STAR Story Bank

Generated from `data/behavioral.json` by `scripts/stories_md.mjs`. Edit the JSON, then rerun the script.

## How to answer

- Open with the headline: the result in one sentence, then the story.
- 60 to 90 seconds per story. One decision you owned, one number, then stop and let them probe.
- Say "I", not "we". Credit the team in one clause, then say what you did.
- Every action gets a because: the decision and why you made it.
- End on the result and one lesson. Oracle tenure is spoken as "close to 3 years".
- Do not reuse one story more than twice across the whole loop.

## 60-second pitch

**Who.** I'm Anuvik, finishing my MS in computer science at USC in December. Before USC I spent close to 3 years at Oracle as a Software Engineer II on NSX, running observability and incident response for 37,000+ enterprise tenants.

**Proof.** The work I'm proudest of there: real-time API diagnostics that cut P1 MTTR from 94 to 26 minutes, because on-call engineers started with a likely root cause instead of a blank screen.

**Customer.** This summer at MSRcosmos I was forward deployed with a client moving financial records from Sage X3 to Sage Intacct across 12 entities, each on its own cloud. I built a multi-agent system with a human review step, and turnaround went from 3 days to 5.5 hours.

**Why SA.** That was my favorite work: sitting with the customer, understanding an audit constraint, and designing around it. That is the Solutions Architect job, and I want to do it at AWS scale.

> I want to be the person between a customer's problem and the right architecture.

## Leadership Principle map

| Leadership Principle | Primary story | Backup story |
|---|---|---|
| Customer Obsession | S1 Multi-agent ERP migration with human-in-the-loop | S9 PacSun executive intelligence app |
| Ownership | S1 Multi-agent ERP migration with human-in-the-loop | S2 P1 MTTR from 94 to 26 minutes |
| Invent and Simplify | S4 CLI validation toolchain adopted by 4 teams | S10 Human-in-the-loop annotation pipeline |
| Are Right, A Lot | S3 SLO alerting, 41% fewer false pages | S11 ModelScope quantization study |
| Learn and Be Curious | S7 Ramping up on LangGraph and MCP fast | S11 ModelScope quantization study |
| Hire and Develop the Best | S4 CLI validation toolchain adopted by 4 teams | **GAP** |
| Insist on the Highest Standards | S1 Multi-agent ERP migration with human-in-the-loop | S6 Kubernetes autoscaling on custom metrics |
| Think Big | S9 PacSun executive intelligence app | S2 P1 MTTR from 94 to 26 minutes |
| Bias for Action | S2 P1 MTTR from 94 to 26 minutes | S8 DQN training stall, 40% faster runs |
| Frugality | S11 ModelScope quantization study | S5 NetSuite search latency down 30% |
| Earn Trust | S1 Multi-agent ERP migration with human-in-the-loop | S4 CLI validation toolchain adopted by 4 teams |
| Dive Deep | S5 NetSuite search latency down 30% | S8 DQN training stall, 40% faster runs |
| Have Backbone; Disagree and Commit | **GAP** | **GAP** |
| Deliver Results | S2 P1 MTTR from 94 to 26 minutes | S12 Nightly Databricks feed |
| Strive to be Earth's Best Employer | S4 CLI validation toolchain adopted by 4 teams | S3 SLO alerting, 41% fewer false pages |
| Success and Scale Bring Broad Responsibility | S10 Human-in-the-loop annotation pipeline | S1 Multi-agent ERP migration with human-in-the-loop |

## S1. Multi-agent ERP migration with human-in-the-loop (MSRcosmos)

**LPs:** Customer Obsession, Ownership, Earn Trust, Insist on the Highest Standards, Success and Scale Bring Broad Responsibility

**Open with:** I automated a client's financial data migration across 12 entities and cut turnaround from 3 days to 5.5 hours, without letting a single record through unchecked.

- **S:** At MSRcosmos, a client was moving 10,000+ GL, AP, and AR records from Sage X3 to Sage Intacct across 12 entities, each on its own cloud. Reconciliation was manual, took about 3 days per cycle, and one wrong figure would surface in an audit.
- **T:** I was the sole engineer on it. My job was to automate reconciliation while keeping every decision auditable for the client's finance team.
- **A:**
  - I chose LangGraph on the Claude API over a single prompt chain because it gives explicit state and checkpoints, so every agent decision left an audit trail the finance team could inspect.
  - I added field-level reconciliation checks and a confidence score per record. Above the threshold a record auto-approves; below it, it goes to a human reviewer through Sage REST APIs and MCP tool calls. That kept people on the risky records instead of all of them.
  - I containerized it with Docker so the same image ran on AWS, Azure, and GCP, because each entity lived on a different cloud.
- **R:** Manual reconciliation dropped 68%, 83% of records auto-approved, and turnaround went from 3 days to 5.5 hours.

**Close with:** The client trusted the automation because it knew when not to decide. I now design the human escalation path first, then the automation.

**SA twist:** This is the SA job in miniature: understand a customer's business constraint (audit compliance), design around it, and earn trust by keeping a human in the loop.

**On AWS:** Bedrock running Claude for the agents, Step Functions for state, retries, and the human-review wait (task token), S3 for staging, Lambda functions as tools, DynamoDB for the audit trail.

**Probes:**

- *How did you set the confidence threshold?* [fill: how you chose it, for example precision on a hand-labeled sample]. The principle: start conservative and lower it only when reviewers stop correcting auto-approved records.
- *What happened when the model was confidently wrong?* The field-level checks run regardless of confidence, so a confident answer that fails a check still goes to a human. [fill: a real example if you have one]
- *What did it cost per record?* [fill: tokens or dollars per record if you measured it]. If you did not measure it, say so, then explain how: tokens per call times calls per record, against reviewer minutes saved.
- *How would you build it on AWS only?* Bedrock for the model, Step Functions for the workflow with a task-token wait for review, S3 for staging, Lambda tools, DynamoDB for decisions and audit, CloudWatch for monitoring.

## S2. P1 MTTR from 94 to 26 minutes (Oracle)

**LPs:** Deliver Results, Bias for Action, Ownership, Think Big

**Open with:** I cut P1 incident resolution at Oracle from 94 to 26 minutes by giving on-call engineers a likely root cause the moment they were paged.

- **S:** At Oracle, NSX served 37,000+ enterprise tenants. During P1 incidents, on-call engineers searched event streams across 1M+ endpoints by hand before they could start fixing anything, and P1s averaged 94 minutes to resolve.
- **T:** I took ownership of cutting the time from page to diagnosis.
- **A:**
  - I instrumented real-time API diagnostics on the high-throughput event streams, so the evidence was already collected when the page fired.
  - I auto-tagged likely root causes on 400 and 500 series failures, because those failures are where tenant impact shows up first.
  - I attached runbook context to every tag, so the engineer started with a likely cause and a next step instead of a blank screen.
- **R:** P1 MTTR fell from 94 to 26 minutes, a 72% cut, for a platform serving 37,000+ tenants.

**Close with:** The fix was not a faster engineer; it was better context in the first minute of the page. I now ask what the on-call person sees first.

**SA twist:** Faster recovery is a customer outcome. Every minute of a P1 is a customer down.

**On AWS:** CloudWatch Logs Insights and metric filters, X-Ray traces, EventBridge rules to tag and route, Systems Manager Automation runbooks attached to alarms.

**Probes:**

- *Which signals drove the tags?* [fill: the fields you keyed on, for example status code, endpoint, tenant, recent deploy]
- *Rules or a model?* [fill: rules, a model, or both]. Rules first is a defensible answer: explainable to on-call, cheap, and easy to correct.
- *How was MTTR measured, and over what window?* [fill: source and window, for example the incident tracker over N months before and after]
- *What did you get wrong first?* [fill: a real first mistake and what you changed]

## S3. SLO alerting, 41% fewer false pages (Oracle)

**LPs:** Are Right, A Lot, Strive to be Earth's Best Employer

**Open with:** I cut false-positive pages 41% at Oracle by moving alerting from static thresholds to SLOs.

- **S:** NSX alerting fired on static CPU, memory, and latency thresholds across 37,000+ tenants. On-call was paged for noise, and real problems risked getting lost in it.
- **T:** I set out to make every page mean real customer impact.
- **A:**
  - I rebuilt the Prometheus and Grafana stack around SLOs for CPU, memory, and p99 latency, because an SLO alerts on what users feel, not on a raw number crossing a line.
  - I shipped 47 dashboards and alert rules so each team could see its service against its own target.
- **R:** False-positive pages dropped 41%.

**Close with:** Fewer, better alerts beat more coverage. It is the same advice I would give a customer on CloudWatch.

**SA twist:** It is the same advice you give a customer on CloudWatch: alert on user impact, not raw thresholds.

**On AWS:** Amazon Managed Service for Prometheus and Amazon Managed Grafana, CloudWatch Application Signals SLOs, composite alarms to cut noise.

**Probes:**

- *How did you pick the targets?* [fill: how the SLO targets were chosen and who agreed to them]
- *How did you handle cardinality across 37,000+ tenants?* [fill: how you avoided a per-tenant label explosion, for example aggregating by tier or region]
- *Did you use burn-rate alerting?* [fill: yes or no]. The idea: page on a fast burn of the error budget, open a ticket on a slow burn.

## S4. CLI validation toolchain adopted by 4 teams (Oracle)

**LPs:** Invent and Simplify, Earn Trust, Hire and Develop the Best, Strive to be Earth's Best Employer

**Open with:** With no authority over other teams, I got 4 teams to adopt a validation toolchain that took failed deploys from 11% to 4%.

- **S:** At Oracle, each NSX team validated builds its own way, so config errors slipped into production.
- **T:** As a Software Engineer II with no authority over the other teams, I wanted one pre-deployment check that everyone would actually use.
- **A:**
  - I built a CLI toolchain on Jenkins CI/CD that ran scripted validation before every deploy, so config errors failed in CI instead of in production.
  - Instead of pushing a mandate, I drove adoption one team at a time, starting by fixing that team's specific pain, because a tool that solves your problem gets adopted on its own.
  - [fill: one concrete thing you did for a skeptical team, for example a custom check or pairing on their pipeline]
- **R:** 4 teams adopted it, release cycles got 34% shorter, and failed deploys went from 11% to 4%.

**Close with:** Influence without authority starts with the other person's problem, not mine. That is the SA job with customers.

**SA twist:** An SA drives adoption with no authority over the customer. Same skill.

**On AWS:** CodePipeline with a CodeBuild validation stage, cfn-lint and CloudFormation Guard for templates, AWS Config rules for drift.

**Probes:**

- *Who pushed back, and why?* [fill: the team and their real objection, for example slower builds]
- *How did you handle team-specific needs?* [fill: per-team config or plugins]
- *How did you get the other teams onboarded?* [fill: pairing, docs, a demo]. This is also your best seed for a mentoring story.

## S5. NetSuite search latency down 30% (Oracle)

**LPs:** Dive Deep, Frugality

**Open with:** I cut NetSuite search latency 30% by going into the query plans instead of asking for more hardware.

- **S:** NetSuite search at Oracle was slow at enterprise data volumes, and the easy answer was bigger machines.
- **T:** I wanted to find the real root cause and fix it without new hardware.
- **A:**
  - I profiled the query plans and found full table scans on hot predicates.
  - I restructured the indexes on those predicates and rewrote the SQL driving the scans, because the cost was in how the data was read, not in how much compute there was.
- **R:** P50 page load went from 840 ms to 588 ms, a 30% improvement, with no new hardware.

**Close with:** Measure before you scale. On RDS I would tell a customer the same: fix the query, then the instance.

**SA twist:** Map it to AWS advice: RDS Performance Insights and the right indexes before read replicas or bigger instances.

**On AWS:** RDS or Aurora with Performance Insights and EXPLAIN plans; indexes first, then read replicas or ElastiCache, a bigger instance last.

**Probes:**

- *How did you find the hot predicates?* [fill: the tool or query log you used]
- *Did the new indexes slow writes?* Every index costs write time and storage. [fill: how you checked insert and update latency afterward]
- *How did you test safely?* [fill: staging copy, canary, or rollback plan]

## S6. Kubernetes autoscaling on custom metrics (Oracle)

**LPs:** Insist on the Highest Standards, Are Right, A Lot

**Open with:** I held p99 latency SLOs at 2x peak load by autoscaling on the metric that tracks latency, not CPU alone.

- **S:** NSX services on OCI had to survive release surges, and scaling on CPU alone did not track what users felt.
- **T:** I containerized the services and owned how they scaled.
- **A:**
  - I containerized NSX services with Docker and Kubernetes.
  - I drove horizontal autoscaling off custom Prometheus metrics instead of CPU alone, because CPU was not the signal that predicted latency for these services. [fill: the metric you used]
- **R:** p99 SLOs held at 2x peak load through release surges.

**Close with:** Scale on the signal your users feel. On AWS that is EKS with HPA on custom metrics.

**SA twist:** On AWS this is EKS with the Horizontal Pod Autoscaler on custom metrics, or ECS target tracking.

**On AWS:** EKS with HPA on custom metrics (Prometheus adapter or KEDA), Karpenter for nodes; or ECS service auto scaling with target tracking.

**Probes:**

- *Which metric, and why not CPU?* [fill: the metric, for example queue depth or in-flight requests]. CPU lags the real bottleneck for I/O-bound services.
- *How did you handle scale-up lag?* [fill: warm pool, lower threshold, or faster images]
- *How did you prevent flapping?* A stabilization window and cooldown, and scaling down more slowly than up.

## S7. Ramping up on LangGraph and MCP fast (MSRcosmos)

**LPs:** Learn and Be Curious

**Open with:** I learned LangGraph and MCP on the job and shipped a production system for a real client in one summer.

- **S:** I joined MSRcosmos as a forward-deployed intern on a stack I had never used in production: LangGraph and MCP tool calling.
- **T:** Ship a working system for a real client in one summer, with no time for a slow ramp-up.
- **A:**
  - I built small prototypes first to learn by breaking things, and read the LangGraph source for checkpointing, because the client's audit needs depended on it.
  - I translated the client's ERP rules into agent task specs and wired Sage REST APIs through MCP tools.
- **R:** That system cut the client's manual reconciliation 68% (S1).

**Close with:** My method for any new tool: prototype, read the source where it matters, then build for the real constraint. It is how I would learn a new AWS service.

**SA twist:** SAs learn a new customer's domain and a new AWS service every quarter.

**On AWS:** Same pattern for a new AWS service: read the quotas and pricing pages, build a small hands-on prototype, then learn its failure modes.

**Probes:**

- *How do you learn a new AWS service quickly?* Quotas and pricing first, then a small hands-on build, then the failure modes and the Well-Architected guidance for it.
- *What have you learned recently outside work?* [fill: something real and recent]

## S8. DQN training stall, 40% faster runs (USC Sports Analytics)

**LPs:** Dive Deep, Bias for Action Say "volunteer research" if asked about the role.

**Open with:** I made each training run 40% faster by profiling instead of guessing, which let me test more ideas per day.

- **S:** In volunteer research at USC, my DQN for NFL fourth-down calls trained over 420K plays and took 52 minutes per run, which capped how many ideas I could test.
- **T:** Make each experiment cheaper so I could iterate faster.
- **A:**
  - I profiled the training loop to see where the time actually went.
  - I vectorized replay-buffer sampling and removed a data-loader stall, because those two spots were where the run was waiting, not computing.
- **R:** Runs went from 52 to 31 minutes, 40% faster, and agreement with EPA-optimal calls rose from 68% to 74% on held-out 2024 drives.

**Close with:** Profile before you buy compute. It is right-sizing before scaling out.

**SA twist:** Profile before you buy: the same advice as right-sizing before scaling out.

**On AWS:** SageMaker AI training jobs with Profiler and Debugger; Spot training for cheaper runs.

**Probes:**

- *How did you find the stall?* [fill: the profiler and what it showed]
- *Did the speedup change results?* [fill: how you confirmed the faster loop trained the same model]

## S9. PacSun executive intelligence app (USC Annenberg)

**LPs:** Customer Obsession, Think Big. Ongoing work: say "building", not "built".

**Open with:** I am building a multi-agent app that gives PacSun executives one ranked, owner-tagged view of what needs their attention.

- **S:** PacSun executives had no single ranked view of operational issues; the answers lived across internal systems.
- **T:** Build something an executive would actually open, not another dashboard.
- **A:**
  - I am building a multi-agent app on Claude Enterprise with MCP connectors into internal systems, so agents pull live context instead of stale exports.
  - Agents rank operational issues by urgency and owner into one view, then draft CEO briefs and meeting agendas, because executives need the decision and the owner first.
  - [fill: how a brief is checked before it reaches an executive]
- **R:** Ongoing. [fill: what is live today]

**Close with:** [fill: what you learned about writing for executives]

**SA twist:** This mirrors the SA skill of communicating complex ideas to executives.

**On AWS:** Bedrock Agents with action groups (Lambda) in place of MCP connectors, Knowledge Bases for documents, Guardrails, and IAM-scoped access to each system.

**Probes:**

- *How do agents get live data safely?* Through connectors that each expose a small set of tools into one system, with access scoped to what the agent needs.
- *How do you stop a wrong brief from reaching the CEO?* Every claim should cite its source. [fill: your review step]
- *Why several agents instead of one?* Separate jobs: gather, rank, write. Each is easier to test and fix alone.

## S10. Human-in-the-loop annotation pipeline (USC AI Trust Lab)

**LPs:** Invent and Simplify, Success and Scale Bring Broad Responsibility. Ongoing work: say "building", not "built".

**Open with:** I built an annotation pipeline where an LLM labels sensitive caseworker notes and routes the uncertain ones to human experts.

- **S:** The AI Trust Lab needed caseworker notes labeled consistently, and the notes are sensitive.
- **T:** Label at scale without letting the model make the hard calls alone.
- **A:**
  - I built a rubric-based annotation pipeline on Llama 3.3 70B that labels each note and scores its confidence, because a rubric makes labels consistent and checkable.
  - Low-confidence cases route to domain experts for human review.
  - Separately, I benchmarked 6 frontier LLMs on Veracity across 8 trust pillars.
- **R:** [fill: share of notes routed to experts, or agreement with expert labels, if measured]

**Close with:** Responsible AI is a design choice: decide up front where the model must not decide alone.

**SA twist:** Responsible AI is a common customer question on Bedrock: Guardrails, model evaluation, and human review.

**On AWS:** Bedrock or SageMaker AI for the model, Bedrock Guardrails, Bedrock model evaluation, Amazon A2I for human review.

**Probes:**

- *How did you design the rubric?* [fill: who wrote it and how it was tested]
- *How do you know the labels are good?* [fill: expert agreement on a sample, if measured]

## S11. ModelScope quantization study (ModelScope)

**LPs:** Are Right, A Lot, Frugality, Learn and Be Curious

**Open with:** I showed with data that INT4 cut model memory 62% with quality within a point, and that INT8 was never the right choice.

- **S:** I wanted evidence, not folklore, on quantization tradeoffs for small models.
- **T:** Find the cheapest configuration that keeps quality.
- **A:**
  - I benchmarked Llama-3.2-3B and Gemma-2-2B across 8 quantization configs (FP16, INT8, INT4, NF4) on a T4 GPU.
  - I profiled latency, throughput, and peak memory, then ran a Pareto sweep, because a single metric hides the tradeoff.
- **R:** INT4 landed at 2299 MB, 62% below FP16, at 13.7 tok/s with MMLU within a point. INT8 was strictly dominated: 53% more memory and 2.1x lower throughput.

**Close with:** When a customer asks which model or instance, they get a benchmark, not a guess.

**SA twist:** Customer cost advice: right-size the model and instance before scaling out.

**On AWS:** Inferentia or G instances for inference, smaller models on Bedrock, SageMaker AI endpoints sized from a benchmark, not a guess.

**Probes:**

- *Why was INT8 slower?* [fill: your explanation from the profiling]
- *Would you ship INT4 to a customer?* Only after running their own evaluation set; one benchmark is evidence, not a guarantee.

## S12. Nightly Databricks feed (MSRcosmos)

**LPs:** Deliver Results, Frugality

**Open with:** I automated the nightly data feed behind the ERP agents across three clouds and held a full refresh at 22 minutes.

- **S:** The ERP agents needed fresh financial data from workspaces on AWS, Azure, and GCP every night.
- **T:** Automate the feed and keep the refresh inside the nightly window.
- **A:**
  - I automated the nightly Databricks feed across the three workspaces.
  - PySpark jobs staged 17 financial tables and 4.2M rows into Delta Lake, with partition pruning and incremental merges, because rewriting only changed rows keeps cost tied to change, not table size.
- **R:** Full refresh held at 22 minutes.

**Close with:** Incremental beats full reload as data grows.

**SA twist:** Same pipeline on AWS: Glue or EMR into S3 with Iceberg tables, queried by Athena.

**On AWS:** Glue or EMR jobs into S3 with Apache Iceberg tables, Athena for queries, Step Functions or MWAA for scheduling.

**Probes:**

- *Why incremental merges?* Only changed rows are rewritten, so the job scales with change volume, not table size.
- *What if a source workspace is late?* [fill: how the job handled a late or failed source]

## Gap stories: write these from real events

### Failure or mistake

**LPs:** Deliver Results, Earn Trust, Are Right, A Lot. **Asked as:** Tell me about a time you failed. A time you missed a deadline. A time your judgment was wrong.

**Where to look:** Look at Oracle deploys before the CLI toolchain existed, or an early MSRcosmos agent run that produced a wrong result.

- **S:** What did I own that went wrong, and who felt it?
- **T:** What was I on the hook for when it broke?
- **A:** What did I do in the first hour, and what did I change so it could not repeat the same way?
- **R:** The fix, a number if there is one, and the one habit I kept. End on the lesson, not the excuse.

### Disagreement (Have Backbone)

**LPs:** Have Backbone; Disagree and Commit. **Asked as:** Tell me about a time you disagreed with your manager. A time you disagreed with a customer. A time you committed to a decision you disagreed with.

**Where to look:** Build from S3 (moving alerts from static thresholds to SLOs) or S4 (a team resisting the CLI validation gate). Use a real disagreement only.

- **S:** Who did I disagree with, about which technical decision?
- **T:** What was at stake, and who owned the decision?
- **A:** How did I understand their view first, what data did I bring, and how was it decided?
- **R:** What shipped. If I lost, how I committed fully anyway. What I learned about disagreeing well.

### Mentoring (Hire and Develop)

**LPs:** Hire and Develop the Best. **Asked as:** Tell me about a time you helped someone grow. How have you raised the bar on your team?

**Where to look:** A new teammate, a lab member, an on-call engineer using your runbooks, or an engineer on one of the 4 teams adopting the CLI toolchain.

- **S:** Who did I help ramp up, and where were they starting from?
- **T:** What did they need to be able to do, and by when?
- **A:** How did I teach it: pairing, docs, reviews? One specific thing I did.
- **R:** What they could do on their own afterward. A concrete outcome.
