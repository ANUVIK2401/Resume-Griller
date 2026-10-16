# Amazon Solutions Architect: STAR Story Bank

Generated from `data/behavioral.json` by `scripts/stories_md.mjs`. Edit the JSON, then rerun the script.

Read the evidence, confirmation prompts, and delivery review in [RESUME-STAR-REVIEW.md](RESUME-STAR-REVIEW.md) or [the interactive review](review.html). Resume claims have not been independently verified. AWS mappings are proposed designs.

## How to answer

- Answer the question directly, then give a specific Situation, Task, Action, and Result. Amazon recommends STAR; these rehearsal timings are practice choices, not interview rules.
- Practise a 90-second core answer, then expand for follow-up questions. Spend most of the answer on your own decisions and actions.
- Use I for your contribution and credit collaborators accurately. Never replace an unknown team boundary with sole ownership.
- Explain one choice, the alternative, and why you chose it. Mark unverified personal details [confirm: ...] until you can substantiate them.
- Use resume metrics with their baseline, measurement window, and limitations. Oracle dates are Jul 2022 to Jan 2025, approximately two and a half years.
- Build breadth across distinct episodes. S7 is another angle on S1; team adoption alone does not establish mentoring, disagreement, or failure.
- The user-supplied recruiter screenshot identifies the full-time AWSI-ETP Solutions Architect role: design AWS solutions for customer challenges, collaborate with sales, and adapt communication from technical experts to executives. Frame success as positive customer impact; confirm personal experience before implying you have done each responsibility.

## 60-second pitch

**Who.** I'm Anuvik, an MS computer science student at USC, graduating in December 2026. At Oracle from July 2022 to January 2025, I worked on observability, incident diagnostics, and Kubernetes for enterprise services.

**Proof.** One project instrumented real-time API diagnostics and helped reduce P1 MTTR from 94 to 26 minutes by giving on-call engineers root-cause tags and runbook context.

**Customer.** At MSRcosmos, I worked on multi-agent ERP migration with human review across 12 client entities. The reported turnaround went from 3 days to 5.5 hours.

**Why SA.** Proposed motivation: I want to apply my operational and AI engineering experience to customer challenges in the AWSI-ETP Solutions Architect role: compare AWS designs, collaborate with sales on customer context, and make the recommendation clear to engineers and executives. [confirm: your authentic motivation and why AWS]

> Proposed close: I want to be measured by the positive impact the architecture has for the customer. [confirm: phrase this in your own words and support it with a real example]

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
| Bias for Action | S2 P1 MTTR from 94 to 26 minutes | S8 DQN training stall, 40% shorter runs |
| Frugality | S11 ModelScope quantization study | S5 NetSuite search latency down 30% |
| Earn Trust | S1 Multi-agent ERP migration with human-in-the-loop | S4 CLI validation toolchain adopted by 4 teams |
| Dive Deep | S5 NetSuite search latency down 30% | S8 DQN training stall, 40% shorter runs |
| Have Backbone; Disagree and Commit | **GAP** | **GAP** |
| Deliver Results | S2 P1 MTTR from 94 to 26 minutes | S12 Nightly Databricks feed |
| Strive to be Earth's Best Employer | S4 CLI validation toolchain adopted by 4 teams | S3 SLO alerting, 41% fewer false pages |
| Success and Scale Bring Broad Responsibility | S10 Human-in-the-loop annotation pipeline | S1 Multi-agent ERP migration with human-in-the-loop |

## S1. Multi-agent ERP migration with human-in-the-loop (MSRcosmos)

**LPs:** Customer Obsession, Ownership, Earn Trust, Insist on the Highest Standards, Success and Scale Bring Broad Responsibility

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**Open with:** I built human-review routing for an ERP migration across 12 entities; reported turnaround fell from 3 days to 5.5 hours.

- **S:** At MSRcosmos, the migration moved 10,000+ GL/AP/AR records from Sage X3 to Sage Intacct across 12 client entities. [confirm: who was affected by reconciliation delays and the actual business deadline]
- **T:** My work included the multi-agent migration and human-review layer. [confirm: my exact ownership, collaborators, and customer acceptance criteria]
- **A:**
  - I used the Claude API and LangGraph for the multi-agent workflow. [confirm: the alternatives considered and why this design fit the requirement]
  - I designed confidence-based routing over Sage REST APIs and MCP tool calling, with records above a threshold auto-approved and other cases routed for review. [confirm: independent checks, threshold validation, and reviewer permissions]
  - I containerized the application with Docker for cloud-agnostic deployment on AWS, Azure, and GCP. [confirm: services I personally deployed and how isolation worked]
- **R:** Manual reconciliation dropped 68%, 83% of records auto-approved, and turnaround went from 3 days to 5.5 hours.

**Close with:** A useful design lesson to discuss: choose the automation boundary deliberately. [confirm: the lesson I actually learned and what I changed afterward]

**SA twist:** For engineers, explain confidence routing, independent validation, and safe replay. For executives, explain the reported turnaround from 3 days to 5.5 hours and the reviewer decision boundary. Confirm the measurement and stakeholder acceptance; do not claim audit compliance or zero errors.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: Bedrock running Claude for the agents, Step Functions Standard for state, retries, and the human-review wait (task token), S3 for staging, Lambda functions as tools, DynamoDB for the audit trail.

**Probes:**

- *How did you set the confidence threshold?* [confirm: how you chose it, for example precision on a hand-labeled sample]. The principle: start conservative and lower it only when reviewers stop correcting auto-approved records.
- *What happened when the model was confidently wrong?* [confirm: actual independent checks and a real confidently wrong output, if one occurred]. For a proposed design, validate invariant fields independently and route exceptions to review; confidence alone is insufficient.
- *What did it cost per record?* [confirm: tokens or dollars per record if you measured it]. If you did not measure it, say so, then explain how: tokens per call times calls per record, against reviewer minutes saved.
- *How would you build it on AWS only?* Proposed design: a supported Claude model on Bedrock, Step Functions Standard with a task-token callback for review, S3 staging, Lambda tools, DynamoDB decisions, and CloudWatch monitoring. Validate authorization, idempotency, timeout behavior, and model accuracy.

## S2. P1 MTTR from 94 to 26 minutes (Oracle)

**LPs:** Deliver Results, Bias for Action, Ownership, Think Big

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**Open with:** I cut P1 incident resolution at Oracle from 94 to 26 minutes by giving on-call engineers a likely root cause the moment they were paged.

- **S:** At Oracle, NSX observability covered 37,000+ enterprise tenants, and my real-time API diagnostics work covered 1M+ endpoints. P1 MTTR was 94 minutes. [confirm: one representative incident and the affected user workflow]
- **T:** I instrumented diagnostics to help on-call engineers identify likely root causes. [confirm: my scope and what other engineers owned]
- **A:**
  - I instrumented real-time API diagnostics on high-throughput event streams.
  - I added root-cause tagging for 400/500-series failures and runbook context for on-call engineers. [confirm: the actual signal logic and how tags were validated]
  - [confirm: a specific diagnostic alternative, the tradeoff, and how the change was rolled out]
- **R:** P1 MTTR fell from 94 to 26 minutes, a 72% cut, for a platform serving 37,000+ tenants.

**Close with:** The fix was not a faster engineer; it was better context in the first minute of the page. I now ask what the on-call person sees first.

**SA twist:** For engineers, explain the actual event signals, tag logic, false diagnoses, and rollout. For executives, explain recovery from 94 to 26 minutes and the affected customer workflow. Confirm the measurement and impact; a P1 does not establish every customer was down.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: CloudWatch Logs Insights and metric filters, X-Ray traces, EventBridge rules to tag and route, Systems Manager Automation runbooks attached to alarms.

**Probes:**

- *Which signals drove the tags?* [confirm: the fields you keyed on, for example status code, endpoint, tenant, recent deploy]
- *Rules or a model?* [confirm: rules, a model, or both]. Rules first is a defensible answer: explainable to on-call, cheap, and easy to correct.
- *How was MTTR measured, and over what window?* [confirm: source and window, for example the incident tracker over N months before and after]
- *What did you get wrong first?* [confirm: a real first mistake and what you changed]

## S3. SLO alerting, 41% fewer false pages (Oracle)

**LPs:** Are Right, A Lot, Strive to be Earth's Best Employer

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**Open with:** I cut false-positive pages 41% at Oracle by moving alerting from static thresholds to SLOs.

- **S:** NSX alerting fired on static CPU, memory, and latency thresholds across 37,000+ tenants. On-call was paged for noise, and real problems risked getting lost in it.
- **T:** I architected the Prometheus/Grafana observability stack and moved static-threshold alerting toward SLO-based alerting. [confirm: the user-facing indicator and agreed target]
- **A:**
  - I used CPU, memory, and p99 latency signals in the observability stack. A resource threshold alone is not a user-facing service-level objective. [confirm: the SLI, SLO, and error-budget policy actually used]
  - I delivered 47 dashboards and alert rules, with a reported 41% reduction in false-positive pages. [confirm: how false positives were classified and checked against missed incidents]
- **R:** False-positive pages dropped 41%.

**Close with:** A useful lesson to explore: reduce noise while preserving incident detection. [confirm: what I learned about that balance]

**SA twist:** For engineers, explain the actual SLI, target, alert sensitivity, and missed-incident checks. For executives, connect 41% fewer false-positive pages to attention available for real incidents, without claiming measured productivity or customer benefit that was not recorded.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: Amazon Managed Service for Prometheus and Amazon Managed Grafana, CloudWatch Application Signals SLOs, composite alarms to cut noise.

**Probes:**

- *How did you pick the targets?* [confirm: how the SLO targets were chosen and who agreed to them]
- *How did you handle cardinality across 37,000+ tenants?* [confirm: how you avoided a per-tenant label explosion, for example aggregating by tier or region]
- *Did you use burn-rate alerting?* [confirm: yes or no]. The idea: page on a fast burn of the error budget, open a ticket on a slow burn.

## S4. CLI validation toolchain adopted by 4 teams (Oracle)

**LPs:** Invent and Simplify, Earn Trust, Hire and Develop the Best, Strive to be Earth's Best Employer

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**Open with:** I shipped a Jenkins CLI validation toolchain adopted by 4 teams; failed deploys fell from 11% to 4%.

- **S:** At Oracle, configuration errors could reach production. [confirm: one real example and how it affected engineers or customers]
- **T:** I shipped scripted pre-deployment validation in Jenkins CI/CD. [confirm: my design responsibility and how adoption decisions were made]
- **A:**
  - I built a CLI toolchain that ran pre-deployment validation in Jenkins, catching configuration errors in CI.
  - The toolchain was adopted by 4 engineering teams. [confirm: what I personally did to earn adoption and one actual objection, if there was one]
  - [confirm: one check, its false-rejection risk, and the mechanism for exceptions or rollback]
- **R:** 4 teams adopted it, release cycles got 34% shorter, and failed deploys went from 11% to 4%.

**Close with:** A useful SA lesson to test against this experience: adoption depends on solving the other team's problem. [confirm: an actual example of that lesson]

**SA twist:** For engineers, demonstrate one pre-deployment check and its exception policy. For executives, explain failed deploys falling from 11% to 4% and release cycles 34% shorter. Confirm attribution and adoption actions before presenting this as a customer-influence example.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: CodePipeline with a CodeBuild validation stage, cfn-lint and CloudFormation Guard for templates, AWS Config rules for drift.

**Probes:**

- *Who pushed back, and why?* [confirm: the team and their real objection, for example slower builds]
- *How did you handle team-specific needs?* [confirm: per-team config or plugins]
- *How did you get the other teams onboarded?* [confirm: pairing, docs, a demo]. This is also your best seed for a mentoring story.

## S5. NetSuite search latency down 30% (Oracle)

**LPs:** Dive Deep, Frugality

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**Open with:** I reduced NetSuite search P50 page-load latency from 840 ms to 588 ms by changing query plans, indexes, and SQL.

- **S:** NetSuite search operated at enterprise data volumes, with P50 page-load latency of 840 ms. [confirm: which user workflow was slow and how latency was measured]
- **T:** I worked on query performance. [confirm: my assigned target, ownership, and constraints]
- **A:**
  - I profiled query plans and identified SQL driving full scans.
  - I restructured indexes on hot predicates and rewrote the SQL. [confirm: one representative query, why the index fit it, and an alternative considered]
  - [confirm: write-latency impact, correctness checks, and rollout or rollback steps]
- **R:** P50 page-load latency went from 840 ms to 588 ms, a 30% reduction. The resume does not establish hardware spend or whether capacity changed.

**Close with:** Measure before you scale. On RDS I would tell a customer the same: fix the query, then the instance.

**SA twist:** For engineers, explain one query plan, index choice, write cost, and rollout. For executives, explain median search page load falling from 840 ms to 588 ms and ask which user workflow matters. Do not invent hardware savings or increased revenue.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: RDS or Aurora with CloudWatch Database Insights and EXPLAIN plans; indexes first, then read replicas or ElastiCache, a bigger instance last. See https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Database-Insights.html; verify engine and Region support.

**Probes:**

- *How did you find the hot predicates?* [confirm: the tool or query log you used]
- *Did the new indexes slow writes?* Every index costs write time and storage. [confirm: how you checked insert and update latency afterward]
- *How did you test safely?* [confirm: staging copy, canary, or rollback plan]

## S6. Kubernetes autoscaling on custom metrics (Oracle)

**LPs:** Insist on the Highest Standards, Are Right, A Lot

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**Open with:** I used custom Prometheus metrics for Kubernetes autoscaling on OCI and held p99 SLOs at 2x peak load.

- **S:** NSX services on OCI had to survive release surges, and scaling on CPU alone did not track what users felt.
- **T:** My work included containerizing NSX services and custom-metric horizontal autoscaling. [confirm: the boundaries of my responsibility]
- **A:**
  - I containerized NSX services on OCI with Docker and Kubernetes.
  - I drove horizontal autoscaling with custom Prometheus metrics rather than CPU alone. [confirm: metric, target, and evidence it tracked the bottleneck]
  - [confirm: stabilization, node capacity, readiness, and safe scale-down mechanisms actually implemented]
- **R:** p99 SLOs held at 2x peak load through release surges.

**Close with:** A useful lesson to explain: scaling needs a measured signal and capacity to act on it. [confirm: what changed in my own design approach]

**SA twist:** For engineers, trace the actual metric through replica demand, node capacity, readiness, and stabilization. For executives, describe holding p99 objectives at 2x peak load, with the test conditions confirmed. Distinguish OCI experience from a proposed EKS or ECS design.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: EKS with HPA on custom metrics (Prometheus adapter or KEDA), Karpenter for nodes; or ECS service auto scaling with target tracking.

**Probes:**

- *Which metric, and why not CPU?* [confirm: the metric, for example queue depth or in-flight requests]. CPU lags the real bottleneck for I/O-bound services.
- *How did you handle scale-up lag?* [confirm: warm pool, lower threshold, or faster images]
- *How did you prevent flapping?* [confirm: actual stabilization and cooldown settings]. For a proposed design, tune stabilization and scale-down behavior against the workload and failure budget.

## S7. Ramping up on LangGraph and MCP fast (MSRcosmos)

**LPs:** Learn and Be Curious Same underlying ERP episode as S1. The resume names the tools but does not establish learning speed, reading source, a prototype sequence, or sole ownership.

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**Open with:** The MSRcosmos ERP system used LangGraph and MCP; the learning story still needs my actual learning sequence.

- **S:** At MSRcosmos, I worked with the Claude API, LangGraph, and MCP tool calling on the ERP migration in S1. [confirm: what was new to me at the time]
- **T:** [confirm: the actual learning gap, delivery deadline, and what I needed to demonstrate]
- **A:**
  - The shipped work used LangGraph and Sage REST APIs with MCP tool calling.
  - [confirm: the first prototype I built, the documentation or source I consulted, and a failed assumption]
  - [confirm: how I tested understanding before making the approach part of the migration]
- **R:** The same ERP system in S1 reported 68% less manual reconciliation. This is not a separate customer success or independently measured learning outcome.

**Close with:** [confirm: the learning method I actually used and how I reused it afterward]

**SA twist:** For engineers, describe a real learning experiment and how it changed the implementation. For executives, explain why learning reduced delivery uncertainty only if you can substantiate that connection. This is another angle on S1, not a separate customer result.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: Same pattern for a new AWS service: read the quotas and pricing pages, build a small hands-on prototype, then learn its failure modes.

**Probes:**

- *How do you learn a new AWS service quickly?* Quotas and pricing first, then a small hands-on build, then the failure modes and the Well-Architected guidance for it.
- *What have you learned recently outside work?* [confirm: something real and recent]

## S8. DQN training stall, 40% shorter runs (USC Sports Analytics)

**LPs:** Dive Deep, Bias for Action The PDF lists AI/ML Research Intern, Sports Analytics. Earlier site data said volunteer research; confirm the official role classification before using it on forms.

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**Open with:** I shortened DQN training runs from 52 to 31 minutes by vectorizing replay-buffer sampling and removing a data-loader stall.

- **S:** In USC sports analytics research, I prototyped a DQN for NFL fourth-down calls over 420K plays. Per-run training took 52 minutes. [confirm: the experimental constraint and profiling evidence]
- **T:** Make each experiment cheaper so I could iterate faster.
- **A:**
  - I vectorized replay-buffer sampling and removed a data-loader stall. [confirm: the profiler or timing evidence that isolated these bottlenecks]
  - [confirm: how I checked the optimized run preserved the intended training behavior]
- **R:** Per-run training time fell from 52 to 31 minutes, about a 40% reduction in runtime. Agreement with EPA-optimal calls rose separately from 68% to 74% on held-out 2024 drives; do not claim the runtime change caused that gain.

**Close with:** Profile before you buy compute. It is right-sizing before scaling out.

**SA twist:** For engineers, explain sampling vectorization, the loader stall, and equivalent-workload checks. For executives, explain runs shortening from 52 to 31 minutes without claiming measured cost savings. Keep the separate quality change and research context explicit.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: SageMaker AI training jobs with Profiler and Debugger; Spot training for cheaper runs.

**Probes:**

- *How did you find the stall?* [confirm: the profiler and what it showed]
- *Did the speedup change results?* [confirm: how you confirmed the faster loop trained the same model]

## S9. PacSun executive intelligence app (USC Annenberg)

**LPs:** Customer Obsession, Think Big. Ongoing work: say "building", not "built".

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**Open with:** I am building a multi-agent app that gives PacSun executives one ranked, owner-tagged view of what needs their attention.

- **S:** At USC Annenberg, I am building a retail intelligence app on Claude Enterprise for PacSun executives, using MCP connectors to internal systems. [confirm: the stakeholder problem and actual discovery conversation]
- **T:** My work brings live context into an owner-tagged view, briefs, and meeting proposals. [confirm: what I own and what stage the work has reached]
- **A:**
  - I am wiring MCP connectors so agents can pull live context and rank operational issues into an owner-tagged view.
  - I engineered a scheduling workflow that proposes CEO meeting slots and agendas. [confirm: the evaluation and human approval mechanism]
  - [confirm: what is live, connector authorization, source citation, and review before an executive receives a brief]
- **R:** Ongoing; the resume does not give a measured adoption or business outcome. [confirm: current milestone, stakeholder feedback, and a dated evaluation result if available]

**Close with:** [fill: what you learned about writing for executives]

**SA twist:** For engineers, explain connector permissions, source attribution, ranking evaluation, and approval. For executives, explain which decision the owner-tagged view supports. State what is live and what remains a prototype; measured adoption or business impact is not yet supplied.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: Bedrock Agents with action groups (Lambda) in place of MCP connectors, Knowledge Bases for documents, Guardrails, and IAM-scoped access to each system.

**Probes:**

- *What is live and who has used it?* [confirm: deployed or prototype components, actual users, and dated feedback; do not infer executive adoption]
- *What prevents unsafe or incorrect actions?* [confirm: actual connector permissions, source attribution, review gates, and scheduling approval]
- *Why several agents?* [confirm: the evaluated alternative and evidence that the added orchestration helped]

## S10. Human-in-the-loop annotation pipeline (USC AI Trust Lab)

**LPs:** Invent and Simplify, Success and Scale Bring Broad Responsibility. Ongoing work: say "building", not "built".

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**Open with:** I built an annotation pipeline where an LLM labels sensitive caseworker notes and routes the uncertain ones to human experts.

- **S:** At USC AI Trust Lab, I built a rubric-based pipeline for caseworker-note annotation on Llama 3.3 70B. [confirm: the data handling requirements and annotation problem]
- **T:** The pipeline labels notes, scores confidence, and routes low-confidence cases to experts. [confirm: the role of the rubric and my specific responsibility]
- **A:**
  - I built the rubric-based annotation pipeline using Llama 3.3 70B.
  - I routed low-confidence cases to domain experts for human review. [confirm: how confidence was calibrated and how expert feedback was incorporated]
  - [confirm: access control, redaction, and evaluation procedures actually implemented]
- **R:** The resume establishes pipeline functionality, but no expert-agreement rate, throughput, or business outcome. [confirm: a dated pilot result or accepted milestone; if unmeasured, say so]

**Close with:** A useful lesson to explore: model confidence needs external validation and a clear human escalation path. [confirm: what this project actually taught me]

**SA twist:** For engineers, explain rubric evaluation, confidence calibration, expert review, and actual data controls. For executives, describe the boundary of model decision-making and what evidence is still needed. Do not claim measured accuracy or reviewer savings without a result.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: choose a supported model on Bedrock or deploy a compatible model with SageMaker AI, evaluate on expert-labeled cases, and implement an authenticated human-review workflow with Step Functions Standard callbacks. Add explicit permissions and retention controls; guardrails do not validate factual accuracy. Callback pattern: https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html.

**Probes:**

- *How did you design the rubric?* [confirm: who wrote it and how it was tested]
- *How do you know the labels are good?* [confirm: expert agreement on a sample, if measured]

## S11. ModelScope quantization study (ModelScope)

**LPs:** Are Right, A Lot, Frugality, Learn and Be Curious

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**Open with:** In my T4 benchmark, INT4 used 2299 MB and sustained 13.7 tok/s with MMLU within a point of baseline.

- **S:** I wanted evidence, not folklore, on quantization tradeoffs for small models.
- **T:** Measure quality, latency, throughput, and peak memory for the tested configurations. [confirm: workload, model-specific results, and quality constraint]
- **A:**
  - I benchmarked Llama-3.2-3B and Gemma-2-2B across 8 quantization configs (FP16, INT8, INT4, NF4) on a T4 GPU.
  - I profiled latency, throughput, and peak memory, then ran a Pareto sweep, because a single metric hides the tradeoff.
- **R:** The resume reports INT4 at 2299 MB, 62% below FP16, with 13.7 tok/s and MMLU within a point of baseline. It also reports INT8 dominated with 53% more memory and 2.1x lower throughput. [confirm: which configuration was the comparator, model, batch size, and throughput definition]; this result is limited to the measured setup.

**Close with:** When a customer asks which model or instance, they get a benchmark, not a guess.

**SA twist:** For engineers, explain the exact model, workload, measurement method, comparator, and quality constraint. For executives, describe the tested resource-versus-quality choice and the need for customer-specific evaluation. No production cost saving or universal precision recommendation is established.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: Inferentia or G instances for inference, smaller models on Bedrock, SageMaker AI endpoints sized from a benchmark, not a guess.

**Probes:**

- *Why was INT8 slower?* [confirm: your explanation from the profiling]
- *Would you ship INT4 to a customer?* Only after running their own evaluation set; one benchmark is evidence, not a guarantee.

## S12. Nightly Databricks feed (MSRcosmos)

**LPs:** Deliver Results, Frugality

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**Open with:** I automated the nightly data feed behind the ERP agents across three clouds and held a full refresh at 22 minutes.

- **S:** The ERP agents needed fresh financial data from workspaces on AWS, Azure, and GCP every night.
- **T:** I automated the nightly feed for the agents. [confirm: the freshness target and what failures or delays meant for downstream users]
- **A:**
  - I automated the nightly Databricks feed across AWS, Azure, and GCP workspaces, staging 17 tables and 4.2M rows into Delta Lake with PySpark.
  - I used partition pruning and incremental merges. [confirm: the merge key, update and delete semantics, and how partition selection worked]
  - [confirm: scheduling, retries, watermarks, late data, and reconciliation checks actually implemented]
- **R:** The resume reports a 22-minute full refresh. [confirm: whether that figure describes a full scan or an incremental run, dataset snapshot, compute size, and measurement window]

**Close with:** A useful design lesson to explain: choose incremental processing only after defining correctness and recovery semantics. [confirm: what I learned on this pipeline]

**SA twist:** For engineers, explain merge keys, deletes, late arrivals, correctness, and the meaning of full refresh. For executives, explain the 22-minute reported refresh in relation to the customer freshness requirement once confirmed. Native AWS equivalents remain proposed designs.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: Glue or EMR jobs into S3 with Apache Iceberg tables, Athena for queries, Step Functions or MWAA for scheduling.

**Probes:**

- *Why incremental merges?* Only changed rows are rewritten, so the job scales with change volume, not table size.
- *What if a source workspace is late?* [confirm: how the job handled a late or failed source]

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
