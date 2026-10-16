# Amazon Solutions Architect: STAR Story Bank

Generated from `data/behavioral.json` by `scripts/stories_md.mjs`. Edit the JSON, then rerun the script.

Read the evidence, confirmation prompts, and delivery review in [RESUME-STAR-REVIEW.md](RESUME-STAR-REVIEW.md) or [the interactive review](review.html). Resume claims have not been independently verified. AWS mappings are proposed designs.

## How to answer

- Answer the question directly, then use Situation, Task, Action, and Result. The scripts below are complete starting points for speaking practice.
- Practise a 90-second core answer, then expand for follow-up questions. Spend most of the answer on your decisions and actions.
- Use I for your contribution and credit collaborators accurately. Keep your role separate from the work of the wider team.
- Explain how the technical choice addressed the problem. Use one main result with its baseline and unit.
- Use the main speaking script first. Preparation notes and proposed AWS designs are separate from your account of what you implemented.
- Build breadth across distinct episodes. S7 is another angle on S1. Use a real separate example for failure, disagreement, or mentoring.
- For the AWSI-ETP Solutions Architect role, connect the design to customer impact and adapt the depth for engineers or executives.

## 60-second pitch

**Who.** I'm Anuvik, an MS computer science student at USC graduating in December 2026. From July 2022 to January 2025, I worked at Oracle on observability, incident diagnostics, and Kubernetes for enterprise services.

**Proof.** One project reduced P1 MTTR from 94 to 26 minutes by giving on-call engineers diagnostic tags and runbook context.

**Customer.** At MSRcosmos, I built agentic ERP migration workflows with human review across 12 client entities, cutting turnaround from 3 days to 5.5 hours.

**Why SA.** That combination is what I want to bring to the AWSI-ETP Solutions Architect role: understand a customer challenge, compare AWS designs, and explain the recommendation clearly to engineers and executives.

> My focus is the customer outcome: a solution that solves the problem and can be operated reliably.

## Leadership Principle map

| Leadership Principle | Primary story | Backup story |
|---|---|---|
| Customer Obsession | S1 Multi-agent ERP migration with human-in-the-loop | S9 PacSun executive intelligence app |
| Ownership | S1 Multi-agent ERP migration with human-in-the-loop | S2 P1 MTTR from 94 to 26 minutes |
| Invent and Simplify | S4 CLI validation toolchain adopted by 4 teams | S10 Human-in-the-loop annotation pipeline |
| Are Right, A Lot | S3 SLO alerting, 41% fewer false pages | S11 ModelScope quantization study |
| Learn and Be Curious | S7 Applying LangGraph and MCP to the ERP workflow | S11 ModelScope quantization study |
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

**Open with:** I built an ERP migration workflow that cut turnaround from 3 days to 5.5 hours across 12 client entities.

- **S:** At MSRcosmos, I worked on moving 10,000+ financial records from Sage X3 to Sage Intacct across 12 client entities. The records covered the general ledger, accounts payable, and accounts receivable. Reconciliation created a substantial manual workload.
- **T:** My task was to automate that workflow while keeping a clear path for human review when a record needed attention.
- **A:**
  - I built the multi-agent workflow with the Claude API and LangGraph, and connected it to Sage REST APIs through MCP tool calling.
  - I designed confidence-based routing: records above the threshold could auto-approve, while lower-confidence records went to a reviewer. This focused human effort on exceptions rather than treating every record the same way.
  - I containerized the system with Docker for cloud-agnostic deployment across AWS, Azure, and GCP.
- **R:** Manual reconciliation fell 68%, and 83% of records auto-approved. Turnaround decreased from 3 days to 5.5 hours.

**Close with:** The central design lesson is that useful automation needs an explicit boundary between what the system can process and what a person should review.

### Preparation notes, separate from the speaking script

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**SA audience bridge:** For engineers, explain confidence routing, independent validation, and safe replay. For executives, explain the reported turnaround from 3 days to 5.5 hours and the reviewer decision boundary. Confirm the measurement and stakeholder acceptance; do not claim audit compliance or zero errors.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: Bedrock running Claude for the agents, Step Functions Standard for state, retries, and the human-review wait (task token), S3 for staging, Lambda functions as tools, DynamoDB for the audit trail.

**Probes:**

- *How did you set the confidence threshold?* The system used confidence-based routing: above the threshold a record auto-approved, and lower-confidence cases went to a reviewer. I would not quote a threshold or a precision figure without its calibration evidence. For evaluation, I would use expert-reviewed records and measure false approvals, review workload, and performance on different record types.
- *What happened when the model was confidently wrong?* Confidence is not proof of correctness. The implemented workflow had a human-review path for lower-confidence records. To address confidently wrong outputs in an AWS design, I would add deterministic financial checks, sample auto-approved records for review, and use errors to refine the routing policy. I would distinguish those proposed controls from what I can substantiate about this implementation.
- *What did it cost per record?* I can speak to the operational results: 68% less manual reconciliation and turnaround from 3 days to 5.5 hours. I would not turn those into a dollar saving without cost data. For a cost model, I would include model calls, tokens, runtime, storage, and reviewer time per record.
- *How would you build it on AWS only?* I would use a supported Claude model on Bedrock, S3 for staging, and Step Functions Standard to coordinate processing and wait for human review through a callback. Lambda could expose the tools, DynamoDB could store workflow decisions, and CloudWatch would monitor the system. I would design permissions, idempotency, timeouts, and financial validation before choosing an auto-approval policy.

## S2. P1 MTTR from 94 to 26 minutes (Oracle)

**LPs:** Deliver Results, Bias for Action, Ownership, Think Big

**Open with:** I reduced P1 incident recovery time at Oracle from 94 to 26 minutes by putting diagnostic context in front of on-call engineers.

- **S:** At Oracle, I worked on NSX observability for a platform serving 37,000+ enterprise tenants. During an incident, detecting an API failure is only the starting point; the engineer still needs to understand the likely cause and the next action.
- **T:** My work was to improve that diagnosis path through real-time API diagnostics across 1M+ endpoints.
- **A:**
  - I instrumented the high-throughput event streams so API failure evidence was available in real time.
  - I added automatic root-cause tags for 400- and 500-series failures, connecting the failure signal with useful diagnostic context.
  - I included runbook context so the on-call engineer could move from seeing an error to investigating and mitigating it. The important change was making the information actionable, rather than simply producing more telemetry.
- **R:** P1 MTTR dropped from 94 to 26 minutes, a 72% reduction.

**Close with:** The lesson is that operational tooling should shorten the path from signal to action. A dashboard has value when it helps someone recover the service.

### Preparation notes, separate from the speaking script

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**SA audience bridge:** For engineers, explain the actual event signals, tag logic, false diagnoses, and rollout. For executives, explain recovery from 94 to 26 minutes and the affected customer workflow. Confirm the measurement and impact; a P1 does not establish every customer was down.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: CloudWatch Logs Insights and metric filters, X-Ray traces, EventBridge rules to tag and route, Systems Manager Automation runbooks attached to alarms.

**Probes:**

- *Which signals drove the tags?* The implementation used real-time API diagnostics on event streams and tagged root causes on 400- and 500-series failures, with runbook context for on-call engineers. Those are the implementation details I can substantiate here. In a proposed extension, I would evaluate request identifiers, service context, and recent changes as diagnostic inputs rather than assuming a status code alone proves the cause.
- *Rules or a model?* The contribution I can describe is API instrumentation, automatic root-cause tagging, and runbook context. I would not label the tagging engine as machine learning without supporting implementation detail. For a new system, I would start with explainable rules for known failure patterns and add a model only if evaluation showed a useful improvement.
- *How was MTTR measured, and over what window?* The result was P1 MTTR falling from 94 to 26 minutes. I would not invent an incident count or comparison window. To substantiate causality, I would examine the incident tracker, use a consistent start and recovery definition, compare incident severity and workload, and separate the effect of diagnostics from other operational changes.
- *What did you get wrong first?* I would not invent a failed incident to embellish this result. A real design limitation is that a root-cause tag is a hypothesis, so the engineer still needs the supporting evidence and a way to investigate further. In a new design, I would track incorrect tags as carefully as successful diagnoses.

## S3. SLO alerting, 41% fewer false pages (Oracle)

**LPs:** Are Right, A Lot, Strive to be Earth's Best Employer

**Open with:** I reduced false-positive on-call pages by 41% by improving the observability and alerting approach at Oracle.

- **S:** The NSX environment served 37,000+ enterprise tenants. Static thresholds can produce pages when a resource crosses a limit without clearly explaining whether the service is meeting its objectives. That makes alert quality as important as alert coverage.
- **T:** I architected the Prometheus and Grafana observability stack and moved alerting toward service-level objectives, using CPU, memory, and p99 latency signals.
- **A:**
  - I organized the monitoring around the service objectives and the signals engineers needed to investigate degradation.
  - I built 47 dashboards and alert rules across the observability stack. Dashboards provided the investigation view, while alert rules determined when an engineer needed to take action.
  - I treated the resource signals and latency together: CPU or memory alone does not describe the entire experience of a service.
- **R:** False-positive on-call pages decreased 41%.

**Close with:** The design lesson is to make alerts actionable and tied to service behavior. Reducing noise only helps if the system still brings meaningful problems to the on-call engineer.

### Preparation notes, separate from the speaking script

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**SA audience bridge:** For engineers, explain the actual SLI, target, alert sensitivity, and missed-incident checks. For executives, connect 41% fewer false-positive pages to attention available for real incidents, without claiming measured productivity or customer benefit that was not recorded.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: Amazon Managed Service for Prometheus and Amazon Managed Grafana, CloudWatch Application Signals SLOs, composite alarms to cut noise.

**Probes:**

- *How did you pick the targets?* The stack moved toward SLO-based alerting with CPU, memory, and p99 latency signals. I would distinguish resource metrics from the actual service objective rather than treat them as interchangeable. When defining a new SLO, I would start with the customer-facing operation, its acceptable latency or availability, and the reliability tradeoff the stakeholders can accept.
- *How did you handle cardinality across 37,000+ tenants?* The observability scope covered 37,000+ tenants, but I would not imply every metric used a tenant label. In an AWS design, I would choose labels deliberately, aggregate the main operational view by useful service dimensions, and reserve detailed tenant investigation for controlled queries. Unbounded labels can make the monitoring system expensive and difficult to operate.
- *Did you use burn-rate alerting?* I can substantiate the move toward SLO-based alerting and the 41% reduction in false-positive pages; I would not add an unverified burn-rate implementation. For a new design, I would consider multi-window burn-rate alerts to distinguish rapid error-budget consumption from slower degradation, then test whether the alerts produce an actionable response.

## S4. CLI validation toolchain adopted by 4 teams (Oracle)

**LPs:** Invent and Simplify, Earn Trust, Hire and Develop the Best, Strive to be Earth's Best Employer

**Open with:** I shipped a validation toolchain adopted by 4 teams that reduced failed deployments from 11% to 4%.

- **S:** At Oracle, configuration errors could be discovered during deployment or after a change reached production. Finding the same issue earlier in the delivery process gives engineers a chance to correct it before it becomes an operational problem.
- **T:** My task was to build scripted pre-deployment validation into the Jenkins CI/CD workflow.
- **A:**
  - I shipped a CLI toolchain that ran the validation checks as part of CI, so configuration problems could fail before the deployment stage.
  - I made the checks part of the delivery workflow rather than leaving validation as an informal step an engineer had to remember.
  - The toolchain was adopted by 4 engineering teams across NSX. That gave multiple teams a common way to catch configuration errors earlier while continuing to use Jenkins for delivery.
- **R:** Release cycles became 34% shorter, and the failed-deployment rate fell from 11% to 4%.

**Close with:** The lesson is that reliability can improve developer speed. A useful validation mechanism prevents downstream rework and makes the safer path part of the normal workflow.

### Preparation notes, separate from the speaking script

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**SA audience bridge:** For engineers, demonstrate one pre-deployment check and its exception policy. For executives, explain failed deploys falling from 11% to 4% and release cycles 34% shorter. Confirm attribution and adoption actions before presenting this as a customer-influence example.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: CodePipeline with a CodeBuild validation stage, cfn-lint and CloudFormation Guard for templates, AWS Config rules for drift.

**Probes:**

- *Who pushed back, and why?* Four teams adopted the toolchain, but adoption alone does not establish that someone opposed it. I would not invent a disagreement. In a customer discussion, I would expect to explore concerns such as build time, false rejections, and exceptions, and show how a validation check prevents a specific downstream problem.
- *How did you handle team-specific needs?* The implementation was a Jenkins CLI toolchain with scripted pre-deployment validation, adopted by 4 NSX teams. I would not add an unverified plugin or configuration mechanism. For a new design, I would separate common checks from team-specific policy and make exceptions explicit, so flexibility does not silently disable the important safeguards.
- *How did you get the other teams onboarded?* The concrete outcome is that 4 engineering teams adopted the toolchain. I can explain the product value: checks ran in CI, configuration errors were caught earlier, and failed deployments fell from 11% to 4%. I would not turn that into a mentoring or persuasion anecdote without a real interaction to describe.

## S5. NetSuite search latency down 30% (Oracle)

**LPs:** Dive Deep, Frugality

**Open with:** I reduced NetSuite search P50 page-load latency from 840 milliseconds to 588 milliseconds, a 30% reduction.

- **S:** At Oracle, I worked on search performance at enterprise data volumes. A slow page can have several causes, so the important starting point was to understand how the database was executing the queries behind the search.
- **T:** My task was to improve the database access path driving that page-load latency.
- **A:**
  - I profiled the query plans to identify the SQL responsible for full scans.
  - I restructured indexes on the hot predicates and rewrote the SQL driving those scans. The goal was to make the access path better match the filters the search actually used.
  - I focused on the query plan and index design because reducing unnecessary reads addresses the work the database is doing, rather than assuming that a larger instance is the answer.
- **R:** P50 page-load latency improved from 840 to 588 milliseconds, a 30% reduction in median page load through a better database access path.

**Close with:** The lesson is to diagnose the access pattern before selecting a scaling solution. The right architecture recommendation starts with evidence about the bottleneck.

### Preparation notes, separate from the speaking script

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**SA audience bridge:** For engineers, explain one query plan, index choice, write cost, and rollout. For executives, explain median search page load falling from 840 ms to 588 ms and ask which user workflow matters. Do not invent hardware savings or increased revenue.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: RDS or Aurora with CloudWatch Database Insights and EXPLAIN plans; indexes first, then read replicas or ElastiCache, a bigger instance last. See https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Database-Insights.html; verify engine and Region support.

**Probes:**

- *How did you find the hot predicates?* I profiled the query plans and restructured indexes on hot predicates in the SQL driving full scans. The useful technical question is whether the access path matches the filters and data distribution. I would examine plan shape, estimated versus actual rows, selectivity, and the frequency of the relevant query before recommending an index.
- *Did the new indexes slow writes?* The measured result I can give is the P50 page-load reduction from 840 to 588 milliseconds. I would not claim a write-latency result that I cannot substantiate. An index adds write and storage work, so I would evaluate insert and update latency, index size, and workload balance alongside the read improvement.
- *How did you test safely?* I can describe the query-plan, index, and SQL changes, but I would not invent a canary or rollback procedure. For a production rollout, I would verify result correctness on representative data, compare read and write behavior, check locking implications for the database engine, and plan how to revert the query or index change.

## S6. Kubernetes autoscaling on custom metrics (Oracle)

**LPs:** Insist on the Highest Standards, Are Right, A Lot

**Open with:** I used custom-metric autoscaling on OCI to keep NSX services within their p99 latency objectives at 2x peak load.

- **S:** At Oracle, release surges created changing demand for NSX services. Keeping the services responsive required both containerized deployment and a scaling policy that reflected the workload, rather than looking only at CPU utilization.
- **T:** My work combined Docker and Kubernetes containerization with horizontal autoscaling driven by custom Prometheus metrics.
- **A:**
  - I containerized the NSX services on OCI using Docker and Kubernetes.
  - I used custom Prometheus metrics as inputs to horizontal autoscaling instead of relying on CPU alone. Resource utilization is useful, but it is not a complete explanation of whether a service is keeping up with its demand.
  - I connected the scaling behavior to the service latency objective, keeping the discussion focused on the performance the system needed to preserve through a surge.
- **R:** The services held their p99 SLOs at 2x peak load through release surges.

**Close with:** The lesson is to scale from a signal that represents the workload and to evaluate the result against a service objective. My implementation experience here was on OCI.

### Preparation notes, separate from the speaking script

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**SA audience bridge:** For engineers, trace the actual metric through replica demand, node capacity, readiness, and stabilization. For executives, describe holding p99 objectives at 2x peak load, with the test conditions confirmed. Distinguish OCI experience from a proposed EKS or ECS design.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: EKS with HPA on custom metrics (Prometheus adapter or KEDA), Karpenter for nodes; or ECS service auto scaling with target tracking.

**Probes:**

- *Which metric, and why not CPU?* The implementation used custom Prometheus metrics rather than CPU alone. I would not substitute a guessed metric for the actual configuration. The principle is that CPU can miss a workload bottleneck; in a new design, I would test whether queue depth, in-flight requests, or another service signal predicts saturation and latency for that application.
- *How did you handle scale-up lag?* The result was maintaining p99 SLOs at 2x peak load on OCI. I would not invent a warm-pool or node-provisioning mechanism. For an AWS design, I would account separately for detecting demand, adding replicas, obtaining node capacity, and becoming ready to serve traffic, then test whether the total delay fits the service objective.
- *How did you prevent flapping?* I would not quote stabilization settings without the actual autoscaler configuration. In a new design, I would use a stable workload signal, tune the observation and stabilization periods, and scale down conservatively. I would test oscillating demand and dependency limits, because rapid replica changes can create instability rather than solve it.

## S7. Applying LangGraph and MCP to the ERP workflow (MSRcosmos)

**LPs:** Learn and Be Curious

**Open with:** I applied LangGraph orchestration and MCP tool calling to make an ERP migration workflow work across model, API, and human-review steps.

- **S:** At MSRcosmos, the migration from Sage X3 to Sage Intacct involved financial records and multiple kinds of processing. A model response alone could not complete the workflow: the application also needed to interact with business systems and route records for review.
- **T:** My task was to connect those capabilities into the multi-agent migration system.
- **A:**
  - I used the Claude API with LangGraph for the agent workflow, giving the orchestration a defined place in the application rather than treating the entire task as a single model response.
  - I connected Sage REST APIs through MCP tool calling so the workflow could interact with the ERP systems.
  - I combined that integration with confidence-based human review and Docker packaging for cloud-agnostic deployment. These pieces addressed different parts of delivering a usable application.
- **R:** The migration system reduced manual reconciliation by 68%.

**Close with:** The lesson is that learning a framework matters when it helps solve an application problem. Orchestration, tools, and review each have a distinct responsibility in a working system.

### Preparation notes, separate from the speaking script

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**Context:** Same ERP episode as S1, told from the orchestration angle. Do not count it as a separate customer engagement or a documented rapid-learning timeline.

**SA audience bridge:** For engineers, describe a real learning experiment and how it changed the implementation. For executives, explain why learning reduced delivery uncertainty only if you can substantiate that connection. This is another angle on S1, not a separate customer result.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: Same pattern for a new AWS service: read the quotas and pricing pages, build a small hands-on prototype, then learn its failure modes.

**Probes:**

- *What did LangGraph and MCP each contribute?* LangGraph was part of the agent orchestration, while MCP tool calling connected the workflow with Sage REST APIs. The distinction matters: orchestration coordinates the application work, and tools provide a controlled way to interact with external systems. The human-review layer handled cases outside the auto-approval path.
- *How would you learn an unfamiliar AWS service?* I would start with the customer requirement, then read the service documentation for its operating model, quotas, security boundaries, pricing, and failure modes. I would build a small representative workflow, observe its behavior, and compare it with a simpler alternative. The goal would be to understand when the service fits, not just make a demonstration run.

## S8. DQN training stall, 40% shorter runs (USC Sports Analytics)

**LPs:** Dive Deep, Bias for Action

**Open with:** I shortened DQN training runs from 52 to 31 minutes by fixing replay-buffer sampling and a data-loader stall.

- **S:** In sports analytics research at USC, I prototyped a reinforcement-learning agent for NFL fourth-down decisions using 420K plays. The agent used expected points added in its reward design, and each training run took 52 minutes.
- **T:** My work included improving the training pipeline so each experiment spent less time on data handling.
- **A:**
  - I vectorized replay-buffer sampling, moving that work away from inefficient per-item processing.
  - I removed a data-loader stall. Both changes targeted the path feeding training rather than changing the problem into a request for more compute.
  - I kept the performance result separate from the model-quality result: making the pipeline quicker and improving decision agreement are different accomplishments with different measurements.
- **R:** Training time fell to 31 minutes per run, about a 40% reduction in runtime. Separately, agreement with EPA-optimal calls improved from 68% to 74% on held-out 2024 drives.

**Close with:** The lesson is to understand the work surrounding model computation. Data movement and sampling can limit experiment speed even when the model itself gets most of the attention.

### Preparation notes, separate from the speaking script

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**Context:** The PDF lists AI/ML Research Intern, Sports Analytics. Earlier site data said volunteer research; confirm the official role classification before using it on forms.

**SA audience bridge:** For engineers, explain sampling vectorization, the loader stall, and equivalent-workload checks. For executives, explain runs shortening from 52 to 31 minutes without claiming measured cost savings. Keep the separate quality change and research context explicit.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: SageMaker AI training jobs with Profiler and Debugger; Spot training for cheaper runs.

**Probes:**

- *How did you find the stall?* The changes I can describe are vectorized replay-buffer sampling and removal of a data-loader stall. I would not name a profiler or invent a trace. To investigate the same class of problem, I would time sampling, transfer, and model computation separately and compare utilization with the wall-clock time spent in each stage.
- *Did the speedup change results?* The runtime result was 52 to 31 minutes per run. The separate quality result was agreement with EPA-optimal calls improving from 68% to 74% on held-out 2024 drives. I would not claim that the runtime optimization caused the quality gain. To verify equivalence, I would compare sampling behavior, training curves, and held-out results under controlled conditions.

## S9. PacSun executive intelligence app (USC Annenberg)

**LPs:** Customer Obsession, Think Big

**Open with:** I am building a retail intelligence application that turns operational context into an owner-tagged view and briefs for PacSun executives.

- **S:** At USC Annenberg, my work is a multi-agent application on Claude Enterprise for an executive audience. The application needs to bring together context from internal systems and present it in a form that supports decisions.
- **T:** My task is to connect that context with ranked operational issues, clear owners, and useful executive outputs.
- **A:**
  - I am wiring MCP connectors into internal systems so the agents can pull live context.
  - I am building the workflow that ranks operational issues into an owner-tagged view and drafts CEO briefs. The presentation puts the issue and its owner together instead of making the executive reconstruct the connection.
  - I also engineered a scheduling workflow that ranks open issues by urgency and owner, then proposes meeting slots with agendas.
- **R:** The work is ongoing. The application brings context gathering, issue ranking, brief drafting, and meeting proposals into a workflow for executive decision-making.

**Close with:** The lesson is that executive communication is part of the solution design. Information becomes useful when the audience can see what needs attention and who owns the next step.

### Preparation notes, separate from the speaking script

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**Status:** Ongoing work; describe implemented capabilities without inventing a business outcome.

**SA audience bridge:** For engineers, explain connector permissions, source attribution, ranking evaluation, and approval. For executives, explain which decision the owner-tagged view supports. State what is live and what remains a prototype; measured adoption or business impact is not yet supplied.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: Bedrock Agents with action groups (Lambda) in place of MCP connectors, Knowledge Bases for documents, Guardrails, and IAM-scoped access to each system.

**Probes:**

- *How do agents get live data safely?* The application uses MCP connectors into internal systems. For the security design, I would scope each connector to the tools and data needed, preserve the requesting user context where required, and distinguish read access from actions that change a system. I would not assume that using MCP by itself provides authorization.
- *How do you stop a wrong brief from reaching the CEO?* The app drafts briefs; drafting should be separated from approval and delivery. For that control path, I would require source attribution, check important claims against retrieved records, and route the draft through an accountable reviewer. I would evaluate factual errors on representative briefs rather than assume fluent text is reliable.
- *Why several agents instead of one?* The application brings together context gathering, issue ranking, brief drafting, and meeting proposals. Those responsibilities provide a useful way to reason about the workflow. I would still compare the orchestration with a simpler implementation, because more agents also add latency, cost, and coordination failures. The design needs evidence that the extra complexity helps.

## S10. Human-in-the-loop annotation pipeline (USC AI Trust Lab)

**LPs:** Invent and Simplify, Success and Scale Bring Broad Responsibility

**Open with:** I built an annotation pipeline that combines rubric-based LLM labels with expert review for lower-confidence caseworker notes.

- **S:** At USC AI Trust Lab, my work includes using Llama 3.3 70B to label caseworker notes. Annotation needs a consistent definition of the labels, while the model also needs a path to escalate cases it cannot handle confidently.
- **T:** My task was to turn that into a pipeline with a rubric, confidence scores, and human-in-the-loop review.
- **A:**
  - I built the rubric-based labeling workflow on Llama 3.3 70B, giving the annotation process explicit criteria rather than asking for an unconstrained answer.
  - I included confidence scoring and routed low-confidence cases to domain experts. The model handles labeling, while the review path gives the workflow a way to involve human judgment.
  - I kept the implementation centered on those responsibilities: produce a label, expose uncertainty, and route the cases that need attention.
- **R:** The pipeline labels notes, scores confidence, and routes lower-confidence cases to experts. That gives the annotation workflow a concrete path from an initial model label to domain-expert review.

**Close with:** The design lesson is that confidence should guide review, not stand in for proof that a model is correct. The escalation path belongs in the architecture.

### Preparation notes, separate from the speaking script

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**Status:** Ongoing work; describe implemented capabilities without inventing a business outcome.

**SA audience bridge:** For engineers, explain rubric evaluation, confidence calibration, expert review, and actual data controls. For executives, describe the boundary of model decision-making and what evidence is still needed. Do not claim measured accuracy or reviewer savings without a result.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: choose a supported model on Bedrock or deploy a compatible model with SageMaker AI, evaluate on expert-labeled cases, and implement an authenticated human-review workflow with Step Functions Standard callbacks. Add explicit permissions and retention controls; guardrails do not validate factual accuracy. Callback pattern: https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html.

**Probes:**

- *How did you design the rubric?* The pipeline uses rubric-based annotation on Llama 3.3 70B. I would not claim to have authored the domain criteria without that evidence. A strong rubric needs clear label definitions and examples, and I would work with domain experts to test ambiguous cases and refine the criteria when reviewers disagree.
- *How do you know the labels are good?* The implemented workflow scores confidence and routes lower-confidence cases to domain experts. That provides a review path; it is not by itself an accuracy result. I would evaluate expert agreement on a labeled sample, inspect disagreements by category, and also sample high-confidence outputs so confident mistakes are not invisible.

## S11. ModelScope quantization study (ModelScope)

**LPs:** Are Right, A Lot, Frugality, Learn and Be Curious

**Open with:** In ModelScope, my INT4 benchmark used 2299 MB and sustained 13.7 tokens per second with MMLU within a point of baseline.

- **S:** I benchmarked Llama-3.2-3B and Gemma-2-2B on a T4 GPU to understand quantization tradeoffs. A smaller memory footprint is only useful if the model also meets the quality and performance requirements of its workload.
- **T:** My task was to compare configurations across latency, throughput, peak memory, and evaluation quality instead of selecting precision from a single metric.
- **A:**
  - I tested 8 configurations spanning FP16, INT8, INT4, and NF4, using PyTorch and CUDA to profile inference.
  - I measured the resource and performance dimensions, then used a Pareto sweep to compare tradeoffs. That makes it possible to identify configurations that improve one requirement without ignoring the others.
  - I included MMLU as a quality check alongside the performance measurements, keeping the conclusion tied to the benchmark setup.
- **R:** INT4 used 2299 MB, 62% below FP16, while sustaining 13.7 tokens per second and keeping MMLU within a point of baseline.

**Close with:** The lesson is to benchmark the workload before recommending a model configuration, then choose a configuration that meets its quality, performance, and operational requirements.

### Preparation notes, separate from the speaking script

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**SA audience bridge:** For engineers, explain the exact model, workload, measurement method, comparator, and quality constraint. For executives, describe the tested resource-versus-quality choice and the need for customer-specific evaluation. No production cost saving or universal precision recommendation is established.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: Inferentia or G instances for inference, smaller models on Bedrock, SageMaker AI endpoints sized from a benchmark, not a guess.

**Probes:**

- *Why was INT8 slower?* My core result is the measured INT4 configuration on the T4, with its memory, throughput, and MMLU tradeoff. I would not generalize an INT8 comparison without the exact comparator and workload. Kernel support, model shape, batch size, and quantization overhead can change the result, so I would inspect the profiling evidence before attributing the cause.
- *Would you ship INT4 to a customer?* I would treat this benchmark as a candidate configuration, then evaluate the customer workload. I would measure task quality, memory, throughput, latency, and operational constraints on the intended hardware. Staying within a point on MMLU is useful evidence, but it does not establish that the customer application will meet its quality requirements.

## S12. Nightly Databricks feed (MSRcosmos)

**LPs:** Deliver Results, Frugality

**Open with:** I automated a nightly Databricks feed for 17 financial tables and 4.2M rows, with a 22-minute full refresh.

- **S:** At MSRcosmos, the ERP agents depended on financial data from Databricks workspaces across AWS, Azure, and GCP. The data pipeline was part of making the agent workflow useful: the agents needed the underlying records available for processing.
- **T:** My task was to automate the nightly feed and stage the financial tables into Delta Lake.
- **A:**
  - I built the feed with PySpark, bringing the 17 tables and 4.2M rows into Delta Lake.
  - I used partition pruning to reduce unnecessary reads, and incremental merges to incorporate changes without treating every update as a complete rewrite.
  - I automated the feed across the cloud workspaces, connecting the data-engineering layer with the multi-agent ERP system. The processing choices addressed how much data the job needed to read and update.
- **R:** The full refresh held at 22 minutes.

**Close with:** The lesson is that an AI application still depends on its data foundation. Efficient ingestion and clear refresh behavior matter just as much as the agent logic that uses the data.

### Preparation notes, separate from the speaking script

**Evidence boundary:** Resume-supported actions and metrics are candidate claims, not independently verified. Any additional personal detail or lesson marked [confirm: ...] must be checked before rehearsal. See the resume and STAR review.

**SA audience bridge:** For engineers, explain merge keys, deletes, late arrivals, correctness, and the meaning of full refresh. For executives, explain the 22-minute reported refresh in relation to the customer freshness requirement once confirmed. Native AWS equivalents remain proposed designs.

**Proposed AWS design:** Proposed AWS design, not a claim of AWS implementation: Glue or EMR jobs into S3 with Apache Iceberg tables, Athena for queries, Step Functions or MWAA for scheduling.

**Probes:**

- *Why incremental merges?* Incremental merges let the pipeline incorporate changes rather than rewrite everything for each update, while partition pruning reduces unnecessary reads. The correctness details still matter: a new design needs a reliable merge key, a policy for deletes and late arrivals, and a way to reconcile the output with the source.
- *What if a source workspace is late?* The feed covered Databricks workspaces across AWS, Azure, and GCP. I would not invent a failure policy for the implementation. In a new design, I would make freshness visible, distinguish complete from partial inputs, retry safely, and decide with the customer whether to delay publication or expose explicitly stale data.

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
