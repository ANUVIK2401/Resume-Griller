# Amazon Solutions Architect: ready-to-rehearse answers

Start with S1 (ERP migration), S2 (incident response), S4 (deployment validation), and S5 (query performance). Say one answer aloud, then practise its follow-ups.

The numbers come from the supplied resume. Current work stays in progress; AWS translations describe proposed designs. Additional coaching is separate from the spoken scripts.

## AWSI-ETP Solutions Architect, full-time

- Design AWS solutions for customer challenges.
- Collaborate with sales on understanding and addressing customer needs.
- Communicate effectively with technical experts and executives.

## Speaking scripts

### S1. Multi-agent ERP migration with human-in-the-loop

At MSRcosmos, I worked on moving 10,000+ financial records from Sage X3 to Sage Intacct across 12 client entities. The records covered the general ledger, accounts payable, and accounts receivable. Reconciliation created a substantial manual workload. My task was to automate that workflow while keeping a clear path for human review when a record needed attention. I built the multi-agent workflow with the Claude API and LangGraph, and connected it to Sage REST APIs through MCP tool calling. I designed confidence-based routing: records above the threshold could auto-approve, while lower-confidence records went to a reviewer. This focused human effort on exceptions rather than treating every record the same way. I containerized the system with Docker for cloud-agnostic deployment across AWS, Azure, and GCP. Manual reconciliation fell 68%, and 83% of records auto-approved. Turnaround decreased from 3 days to 5.5 hours. The central design lesson is that useful automation needs an explicit boundary between what the system can process and what a person should review.

**Practise these follow-ups:**

- How did you set the confidence threshold?
- What happened when the model was confidently wrong?
- What did it cost per record?
- How would you build it on AWS only?

### S2. P1 MTTR from 94 to 26 minutes

At Oracle, I worked on NSX observability for a platform serving 37,000+ enterprise tenants. During an incident, detecting an API failure is only the starting point; the engineer still needs to understand the likely cause and the next action. My work was to improve that diagnosis path through real-time API diagnostics across 1M+ endpoints. I instrumented the high-throughput event streams so API failure evidence was available in real time. I added automatic root-cause tags for 400- and 500-series failures, connecting the failure signal with useful diagnostic context. I included runbook context so the on-call engineer could move from seeing an error to investigating and mitigating it. The important change was making the information actionable, rather than simply producing more telemetry. P1 MTTR dropped from 94 to 26 minutes, a 72% reduction. The lesson is that operational tooling should shorten the path from signal to action. A dashboard has value when it helps someone recover the service.

**Practise these follow-ups:**

- Which signals drove the tags?
- Rules or a model?
- How was MTTR measured, and over what window?
- What is a limitation of automatic root-cause tagging?

### S3. SLO alerting, 41% fewer false pages

The NSX environment served 37,000+ enterprise tenants. Static thresholds can produce pages when a resource crosses a limit without clearly explaining whether the service is meeting its objectives. That makes alert quality as important as alert coverage. I architected the Prometheus and Grafana observability stack and moved alerting toward service-level objectives, using CPU, memory, and p99 latency signals. I organized the monitoring around the service objectives and the signals engineers needed to investigate degradation. I built 47 dashboards and alert rules across the observability stack. Dashboards provided the investigation view, while alert rules determined when an engineer needed to take action. I treated the resource signals and latency together: CPU or memory alone does not describe the entire experience of a service. False-positive on-call pages decreased 41%. The design lesson is to make alerts actionable and tied to service behavior. Reducing noise only helps if the system still brings meaningful problems to the on-call engineer.

**Practise these follow-ups:**

- How did you pick the targets?
- How did you handle cardinality across 37,000+ tenants?
- Did you use burn-rate alerting?

### S4. CLI validation toolchain adopted by 4 teams

At Oracle, configuration errors could be discovered during deployment or after a change reached production. Finding the same issue earlier in the delivery process gives engineers a chance to correct it before it becomes an operational problem. My task was to build scripted pre-deployment validation into the Jenkins CI/CD workflow. I shipped a CLI toolchain that ran the validation checks as part of CI, so configuration problems could fail before the deployment stage. I made the checks part of the delivery workflow rather than leaving validation as an informal step an engineer had to remember. The toolchain was adopted by 4 engineering teams across NSX. That gave multiple teams a common way to catch configuration errors earlier while continuing to use Jenkins for delivery. Release cycles became 34% shorter, and the failed-deployment rate fell from 11% to 4%. The lesson is that reliability can improve developer speed. A useful validation mechanism prevents downstream rework and makes the safer path part of the normal workflow.

**Practise these follow-ups:**

- What made the validation useful across teams?
- How did you handle team-specific needs?
- How large was the deployment improvement?

### S5. NetSuite search latency down 30%

At Oracle, I worked on search performance at enterprise data volumes. A slow page can have several causes, so the important starting point was to understand how the database was executing the queries behind the search. My task was to improve the database access path driving that page-load latency. I profiled the query plans to identify the SQL responsible for full scans. I restructured indexes on the hot predicates and rewrote the SQL driving those scans. The goal was to make the access path better match the filters the search actually used. I focused on the query plan and index design because reducing unnecessary reads addresses the work the database is doing, rather than assuming that a larger instance is the answer. P50 page-load latency improved from 840 to 588 milliseconds, a 30% reduction in median page load through a better database access path. The lesson is to diagnose the access pattern before selecting a scaling solution. The right architecture recommendation starts with evidence about the bottleneck.

**Practise these follow-ups:**

- How did you find the hot predicates?
- Did the new indexes slow writes?
- How would you roll out the query changes safely?

### S6. Kubernetes autoscaling on custom metrics

At Oracle, release surges created changing demand for NSX services. Keeping the services responsive required both containerized deployment and a scaling policy that reflected the workload, rather than looking only at CPU utilization. My work combined Docker and Kubernetes containerization with horizontal autoscaling driven by custom Prometheus metrics. I containerized the NSX services on OCI using Docker and Kubernetes. I used custom Prometheus metrics as inputs to horizontal autoscaling instead of relying on CPU alone. Resource utilization is useful, but it is not a complete explanation of whether a service is keeping up with its demand. I connected the scaling behavior to the service latency objective, keeping the discussion focused on the performance the system needed to preserve through a surge. The services held their p99 SLOs at 2x peak load through release surges. The lesson is to scale from a signal that represents the workload and to evaluate the result against a service objective. My implementation experience here was on OCI.

**Practise these follow-ups:**

- Which metric, and why not CPU?
- How would you handle scale-up lag on AWS?
- How did you prevent flapping?

### S7. Applying LangGraph and MCP to the ERP workflow

At MSRcosmos, the migration from Sage X3 to Sage Intacct involved financial records and multiple kinds of processing. A model response alone could not complete the workflow: the application also needed to interact with business systems and route records for review. My task was to connect those capabilities into the multi-agent migration system. I used the Claude API with LangGraph for the agent workflow, giving the orchestration a defined place in the application rather than treating the entire task as a single model response. I connected Sage REST APIs through MCP tool calling so the workflow could interact with the ERP systems. I combined that integration with confidence-based human review and Docker packaging for cloud-agnostic deployment. These pieces addressed different parts of delivering a usable application. The migration system reduced manual reconciliation by 68%. The lesson is that learning a framework matters when it helps solve an application problem. Orchestration, tools, and review each have a distinct responsibility in a working system.

**Practise these follow-ups:**

- What did LangGraph and MCP each contribute?
- How would you learn an unfamiliar AWS service?

### S8. DQN training stall, 40% shorter runs

In sports analytics research at USC, I prototyped a reinforcement-learning agent for NFL fourth-down decisions using 420K plays. The agent used expected points added in its reward design, and each training run took 52 minutes. My work included improving the training pipeline so each experiment spent less time on data handling. I vectorized replay-buffer sampling, moving that work away from inefficient per-item processing. I removed a data-loader stall. Both changes targeted the path feeding training rather than changing the problem into a request for more compute. I kept the performance result separate from the model-quality result: making the pipeline quicker and improving decision agreement are different accomplishments with different measurements. Training time fell to 31 minutes per run, about a 40% reduction in runtime. Separately, agreement with EPA-optimal calls improved from 68% to 74% on held-out 2024 drives. The lesson is to understand the work surrounding model computation. Data movement and sampling can limit experiment speed even when the model itself gets most of the attention.

**Practise these follow-ups:**

- How would you isolate the same training bottleneck?
- How do the runtime and quality results differ?

### S9. PacSun executive intelligence app

At USC Annenberg, my work is a multi-agent application on Claude Enterprise for an executive audience. The application needs to bring together context from internal systems and present it in a form that supports decisions. My task is to connect that context with ranked operational issues, clear owners, and useful executive outputs. I am wiring MCP connectors into internal systems so the agents can pull live context. I am building the workflow that ranks operational issues into an owner-tagged view and drafts CEO briefs. The presentation puts the issue and its owner together instead of making the executive reconstruct the connection. I also engineered a scheduling workflow that ranks open issues by urgency and owner, then proposes meeting slots with agendas. The work is ongoing. The application brings context gathering, issue ranking, brief drafting, and meeting proposals into a workflow for executive decision-making. The lesson is that executive communication is part of the solution design. Information becomes useful when the audience can see what needs attention and who owns the next step.

**Practise these follow-ups:**

- How do agents get live data safely?
- How do you stop a wrong brief from reaching the CEO?
- Why several agents instead of one?

### S10. Human-in-the-loop annotation pipeline

At USC AI Trust Lab, my work includes using Llama 3.3 70B to label caseworker notes. Annotation needs a consistent definition of the labels, while the model also needs a path to escalate cases it cannot handle confidently. My task was to turn that into a pipeline with a rubric, confidence scores, and human-in-the-loop review. I built the rubric-based labeling workflow on Llama 3.3 70B, giving the annotation process explicit criteria rather than asking for an unconstrained answer. I included confidence scoring and routed low-confidence cases to domain experts. The model handles labeling, while the review path gives the workflow a way to involve human judgment. I kept the implementation centered on those responsibilities: produce a label, expose uncertainty, and route the cases that need attention. The pipeline labels notes, scores confidence, and routes lower-confidence cases to experts. That gives the annotation workflow a concrete path from an initial model label to domain-expert review. The design lesson is that confidence should guide review, not stand in for proof that a model is correct. The escalation path belongs in the architecture.

**Practise these follow-ups:**

- What does the rubric contribute?
- How do you know the labels are good?

### S11. ModelScope quantization study

I benchmarked Llama-3.2-3B and Gemma-2-2B on a T4 GPU to understand quantization tradeoffs. A smaller memory footprint is only useful if the model also meets the quality and performance requirements of its workload. My task was to compare configurations across latency, throughput, peak memory, and evaluation quality instead of selecting precision from a single metric. I tested 8 configurations spanning FP16, INT8, INT4, and NF4, using PyTorch and CUDA to profile inference. I measured the resource and performance dimensions, then used a Pareto sweep to compare tradeoffs. That makes it possible to identify configurations that improve one requirement without ignoring the others. I included MMLU as a quality check alongside the performance measurements, keeping the conclusion tied to the benchmark setup. INT4 used 2299 MB, 62% below FP16, while sustaining 13.7 tokens per second and keeping MMLU within a point of baseline. The lesson is to benchmark the workload before recommending a model configuration, then choose a configuration that meets its quality, performance, and operational requirements.

**Practise these follow-ups:**

- Why was INT8 slower?
- Would you ship INT4 to a customer?

### S12. Nightly Databricks feed

At MSRcosmos, the ERP agents depended on financial data from Databricks workspaces across AWS, Azure, and GCP. The data pipeline was part of making the agent workflow useful: the agents needed the underlying records available for processing. My task was to automate the nightly feed and stage the financial tables into Delta Lake. I built the feed with PySpark, bringing the 17 tables and 4.2M rows into Delta Lake. I used partition pruning to reduce unnecessary reads, and incremental merges to incorporate changes without treating every update as a complete rewrite. I automated the feed across the cloud workspaces, connecting the data-engineering layer with the multi-agent ERP system. The processing choices addressed how much data the job needed to read and update. The full refresh held at 22 minutes. The lesson is that an AI application still depends on its data foundation. Efficient ingestion and clear refresh behavior matter just as much as the agent logic that uses the data.

**Practise these follow-ups:**

- Why incremental merges?
- What would you do if a source workspace were late?
- How do full refresh and incremental merges fit together?

## Delivery drills

### Make one real scene visible

- Name the affected user or stakeholder and the exact workflow.
- State what could go wrong or what was delayed; use a real example, not an invented crisis.
- Explain the choice you owned, the alternative, and the constraint in plain words.

### Rehearse a 90-second core

- Spend roughly 20 seconds on context and task, 50 on actions and reasoning, and 20 on result and lesson; adjust naturally.
- Say one main metric with baseline and unit. Define acronyms briefly.
- Record yourself, replay once, and remove any line that does not clarify the decision. These timings are a practice drill.

### Prepare a deeper follow-up

- Spend up to three practice minutes explaining the rejected alternative, a failure mode, and the measurement method.
- Answer what you actually did before describing a hypothetical AWS equivalent.
- If a value was not measured, say so and explain how you would measure it now.

### Build breadth across episodes

- Practise S1/S2/S4/S5 as anchors and S3/S6/S8/S11/S12 as technical alternatives.
- Count S7 as another S1 angle. S12 shares the ERP program even when its technical decision is distinct.
- Fill the failure, disagreement, and mentoring gaps from real memory; keep S9/S10 as ongoing design discussions until outcomes or accepted milestones exist.

### One story for engineers and executives

- Technical audience: give S1 a 90-second explanation of the financial migration, your ownership, routing decision, rejected alternative, validation, failure recovery, and reported result. Confirm each mechanism rather than borrowing a proposed AWS design as history.
- Executive audience: give S1 a 30-second version. Proposed wording: I worked on financial migration across 12 entities. The workflow combined automation with human review, and reported turnaround fell from 3 days to 5.5 hours. [confirm: measurement period, your contribution, and the customer decision this supported].
- As an alternative, use S2: engineers need actual diagnostic signals and false-tag handling; executives need the reported P1 recovery change from 94 to 26 minutes and the affected workflow. Confirm the measurement and customer impact before using either version.
- Rehearse a handoff to a sales partner: ask what business objective, decision-maker, constraint, and success measure the customer has. This is a proposed role-play, not a claim of prior sales collaboration.

## Optional deeper preparation

### S1. Multi-agent ERP migration with human-in-the-loop

- **stakes:** Financial-record accuracy is plausible context; audit obligations, cutoff dates, and impact must be confirmed.
- **ownership:** The resume says designed and launched; it does not establish sole engineering ownership.
- **decision:** LangGraph and confidence routing are named, but the rejected alternative and rationale are absent.
- **tradeoff:** Automation versus review workload is a useful discussion; actual threshold error rates are missing.
- **measurement:** Define reconciliation effort, turnaround start/end, sample size, and whether all metrics share the same cohort.

### S2. P1 MTTR from 94 to 26 minutes

- **stakes:** P1 severity suggests urgency, but affected customers and the actual service impact are unspecified.
- **ownership:** Instrumenting and tagging are in the resume; exact design and rollout ownership need confirmation.
- **decision:** The tag logic and choice between rules and a model are not given.
- **tradeoff:** Diagnostic speed versus false confidence, telemetry cost, and cardinality need actual examples.
- **measurement:** MTTR is 94 to 26 minutes, about 72% lower; incident count, time window, and other changes are missing.

### S3. SLO alerting, 41% fewer false pages

- **stakes:** Alert fatigue is a reasonable risk; quantify real burden only if you observed it.
- **ownership:** Architected the stack is resume language; dashboard, alert, and rollout responsibilities need boundaries.
- **decision:** A CPU or memory threshold is not by itself a user-facing SLO; explain the actual indicator.
- **tradeoff:** Lower noise can hide failures; describe the chosen sensitivity and verification.
- **measurement:** 41% reduction needs before/after page counts, labels, measurement windows, and comparable traffic.

### S4. CLI validation toolchain adopted by 4 teams

- **stakes:** Configuration errors reached production, but a concrete consequence and deadline are missing.
- **ownership:** The resume says shipped the toolchain; authority, collaborators, and persuasion tactics are not recorded.
- **decision:** Explain one validation check and why it belonged before deployment.
- **tradeoff:** Check depth versus build time, false failures, exception policy, and adoption friction need evidence.
- **measurement:** Define release-cycle duration, deploy denominator, comparison period, and attribution.

### S5. NetSuite search latency down 30%

- **stakes:** A slower search affects users, but frequency and business impact have not been stated.
- **ownership:** The resume names profiling, indexes, and SQL work; team boundary and target are absent.
- **decision:** Explain the actual query plan change and why that index fit the predicates.
- **tradeoff:** Read gain versus write cost, storage, locking, and regression risk require measured details.
- **measurement:** P50 is median page load, not a query percentile or p99; test conditions and tail behavior are missing.

### S6. Kubernetes autoscaling on custom metrics

- **stakes:** Release surges are given; actual customer consequences of saturation remain unspecified.
- **ownership:** Containerization and autoscaling are resume claims; exact implementation boundary needs confirmation.
- **decision:** The custom metric is unnamed, so the core decision cannot yet be explained convincingly.
- **tradeoff:** Response speed versus flapping, cost, node capacity, and dependency saturation need actual settings.
- **measurement:** 2x peak needs baseline RPS, workload shape, p99 threshold, duration, and test or production distinction.

### S7. Applying LangGraph and MCP to the ERP workflow

- **stakes:** The migration had a real delivery context; a compressed ramp-up is not established in the resume.
- **ownership:** Using the tools does not establish who selected them or learned them from scratch.
- **decision:** Prototype-first learning and source reading were earlier draft assumptions, not resume facts.
- **tradeoff:** Describe depth versus delivery speed only using an actual choice and feedback.
- **measurement:** S1 metrics are shared results; do not double-count this as a distinct episode.

### S8. DQN training stall, 40% shorter runs

- **stakes:** Shorter experiments suggest faster iteration; the actual research deadline or blocked hypothesis needs confirmation.
- **ownership:** The resume attributes implementation to you; collaborators and experimental ownership remain unknown.
- **decision:** Vectorization and loader change are explicit; explain the evidence that prioritized them.
- **tradeoff:** Optimization can change sampling semantics or determinism; explain actual checks.
- **measurement:** 52 to 31 minutes is about 40% less runtime, not a 40% increase in speed; agreement gain is 6 percentage points.

### S9. PacSun executive intelligence app

- **stakes:** The executive audience is stated, but the exact pain and cost of the old process are not.
- **ownership:** The resume says building and engineered; separate completed components from planned ones.
- **decision:** Multi-agent roles and ranking are described, but the alternative and evaluation are missing.
- **tradeoff:** Live access and action proposals create correctness and permission tradeoffs requiring real controls.
- **measurement:** No outcome metric or accepted milestone is in the resume; retain ongoing status.

### S10. Human-in-the-loop annotation pipeline

- **stakes:** Caseworker notes make handling constraints important, but the data classification and stakes need confirmation.
- **ownership:** The pipeline is attributed to you; rubric design and expert-review responsibility are unspecified.
- **decision:** Low-confidence routing is explicit, but choice of model, threshold, and evaluation are absent.
- **tradeoff:** Review burden versus missed errors is the central tradeoff; confidence is not a verified probability.
- **measurement:** No label-agreement, throughput, reviewer-load, or business-result measure is supplied.

### S11. ModelScope quantization study

- **stakes:** This is a project benchmark; no actual customer cost or production outcome is established.
- **ownership:** Benchmark construction and profiling are explicit; external constraints and collaborators are not.
- **decision:** A Pareto sweep is named; show the actual nondominated alternatives and chosen quality constraint.
- **tradeoff:** Quality, memory, throughput, latency, and hardware compatibility can change the choice.
- **measurement:** Clarify model, batch size, sequence length, warmup, repeats, memory definition, and INT8 comparator.

### S12. Nightly Databricks feed

- **stakes:** The agents need fresh data; actual cutoff and the effect of stale data are unspecified.
- **ownership:** Automation and staging are attributed to you; workspace infrastructure and scheduling ownership are unclear.
- **decision:** Pruning and merges are named; explain actual keys and why this approach fit the source changes.
- **tradeoff:** Incremental speed can complicate deletes, late events, replays, and correctness.
- **measurement:** 22 minutes is labeled full refresh while merges suggest incrementality; clarify exactly what was timed.

## Additional real examples

Failure, disagreement, and mentoring answers require distinct personal experiences. Use the optional prompts in the app to extend the bank; these are not fictional episodes.

## Sources

Anuvik_Thota_Resume.pdf supplied by the user; one-page extracted resume reviewed on 2026-10-15.

- [Amazon recruiting manager: STAR, data, and individual contributions](https://www.aboutamazon.com/news/workplace/amazon-interview-best-tips)
- [Amazon Leadership Principles](https://www.amazon.jobs/content/en/our-workplace/leadership-principles)
