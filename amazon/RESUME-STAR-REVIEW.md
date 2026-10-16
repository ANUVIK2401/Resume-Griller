# Resume and STAR review for Amazon Solutions Architect

Reviewed 2026-10-15. Anuvik_Thota_Resume.pdf supplied by the user; one-page extracted resume reviewed on 2026-10-15.

The resume has strong quantified engineering examples. The main weakness is the explanation between the problem and the numbers: customer stakes, your own decision, the alternative, and how the result was measured. For the recruiter-confirmed AWSI-ETP Solutions Architect role, lead with S1, S2, S4, and S5 after confirming those details. Translate the mechanism into customer outcomes, and adapt the explanation for engineers and executives. This is a qualitative preparation review, not an Amazon evaluation or a prediction of an offer.

Resume-supported means the PDF contains the claim; it is not independently verified. Existing story scripts are drafts, not source evidence. Proposed lessons, motivations, dialogue, mechanisms, ownership scope, and decision rationales need confirmation. Never add a deadline, conflict, customer quote, audit guarantee, or measured outcome simply to complete STAR.

Interactive version: [review.html](review.html). Speaking notes save through the browser-local draft editors.

Drafts and rehearsal notes save in this browser on this device through local storage; they are not sent to a server by this page. Shared-browser users can read saved notes, exports contain them, and clearing browser site data removes them. Keep confidential customer and financial details out of notes and exported files.

## Recruiter-confirmed role context

AWSI-ETP Solutions Architect, full-time. User-supplied recruiter screenshot, reviewed in this conversation; role context is not independently verified through public sources.

- Design AWS solutions for customer challenges.
- Collaborate with sales on understanding and addressing customer needs.
- Communicate effectively with technical experts and executives.

Positive customer impact is the stated measure of success, rather than sales quotas. Use business outcomes you can substantiate; the screenshot does not establish specific accounts, seniority, or interview round counts.

## Resume consistency

- **PDF:** MSRcosmos: May 2026 to Aug 2026. **Earlier site:** Site profile: Jun 2026 to Aug 2026. **Action:** Site profile is aligned to the PDF, including legal_dates. Confirm exact dates against your records before forms or background checks.

- **PDF:** USC Sports Analytics: AI/ML Research Intern, Jun 2025 to Sep 2025. **Earlier site:** Site profile and S8: volunteer research. **Action:** Display the PDF title; volunteer status is not established by the supplied PDF. Reconcile official classification with your appointment records.

- **PDF:** Oracle: Jul 2022 to Jan 2025, approximately two and a half years by month boundaries. **Earlier site:** Site required the phrase close to 3 years. **Action:** Use the exact dates or the approximate duration consistently; month-only dates do not establish exact days of service.

- **PDF:** PDF gives tools, actions, and reported metrics; it does not claim sole ERP ownership, guaranteed audit compliance, no unchecked mistakes, or particular persuasion tactics. **Earlier site:** Story drafts asserted sole engineer, zero unchecked records, universal INT8 conclusions, and 40% faster DQN runs. **Action:** Use evidence-bounded wording and [confirm: ...] prompts. Runtime reduction is about 40%; benchmark conclusions depend on model, hardware, workload, and comparator.

- **PDF:** Oracle containers and Kubernetes were on OCI. MSRcosmos describes cloud-agnostic Docker and Databricks workspaces across AWS, Azure, and GCP. **Earlier site:** AWS design analogies could be read as services already implemented. **Action:** Call native AWS mappings proposed designs. Be precise about what AWS services you actually configured versus studied.

- **PDF:** Marshall ETL/survey validation and the fraud GNN (0.923 ROC-AUC, +0.03 over XGBoost) appear in the PDF. **Earlier site:** The current 12-story bank does not include these as separate STAR stories. **Action:** Keep as reserve material. Marshall needs ownership, validation examples, and an outcome; the GNN needs split/leakage controls, class imbalance, and why ROC-AUC suited the use case. Do not invent customer or production impact.

## Preparation assessment

Amazon recommends STAR, relevant data, and clarity about your own contributions. The readiness labels and the 90-second core/3-minute follow-up exercise below are editorial practice tools, not an official rubric or fixed answer time.

The supplied resume supports strong technical mechanisms and reported outcomes. It does not establish all of the personal decisions, customer dialogue, ownership boundaries, or measurement conditions needed for a convincing interview answer. Treat these as drafts until you can answer the probes.

| Story | Preparation status | Main repair |
|---|---|---|
| S1 Multi-agent ERP migration with human-in-the-loop | Needs evidence details | Who set the acceptance criteria and what you personally owned. |
| S2 P1 MTTR from 94 to 26 minutes | Needs evidence details | One actual incident rather than a platform-wide retrospective. |
| S3 SLO alerting, 41% fewer false pages | Needs evidence details | Actual user-facing SLI, target, and who approved it. |
| S4 CLI validation toolchain adopted by 4 teams | Needs evidence details | Concrete adoption action and genuine stakeholder objection, if one occurred. |
| S5 NetSuite search latency down 30% | Needs evidence details | User workflow, representative query, and database engine. |
| S6 Kubernetes autoscaling on custom metrics | Needs evidence details | Exact metric, numeric target, and peak-load definition. |
| S7 Ramping up on LangGraph and MCP fast | Same episode, alternate angle | Evidence that the tools were new, the learning deadline, and the sequence. |
| S8 DQN training stall, 40% shorter runs | Needs evidence details | Role classification discrepancy and the profiler or timing evidence. |
| S9 PacSun executive intelligence app | Needs outcome or milestone | Live-versus-prototype status, stakeholder feedback, and personal ownership. |
| S10 Human-in-the-loop annotation pipeline | Needs outcome or milestone | Rubric author, label definition, calibration, and annotation result. |
| S11 ModelScope quantization study | Needs evidence details | Which model and workload produced each headline metric. |
| S12 Nightly Databricks feed | Needs evidence details | Full refresh versus incremental timing and exact correctness semantics. |

## S1. Multi-agent ERP migration with human-in-the-loop

**Preparation status:** Needs evidence details. Resume-supported claims, not independently verified; personal narrative details still need confirmation.

**Resume-supported material:**

- 10,000+ GL/AP/AR records; Sage X3 to Intacct; 12 entities.
- Claude API, LangGraph, Docker; human-review routing; 68% less manual reconciliation, 83% auto-approval, 3 days to 5.5 hours.

**What works:**

- Strong customer-facing anchor with a clear before/after.
- Human review makes the automation boundary a natural architectural decision.

**What is missing:**

- Who set the acceptance criteria and what you personally owned.
- Threshold calibration, exception checks, real tradeoff, and measurement window.

- **Stakes:** Financial-record accuracy is plausible context; audit obligations, cutoff dates, and impact must be confirmed.
- **Ownership:** The resume says designed and launched; it does not establish sole engineering ownership.
- **Decision:** LangGraph and confidence routing are named, but the rejected alternative and rationale are absent.
- **Tradeoff:** Automation versus review workload is a useful discussion; actual threshold error rates are missing.
- **Measurement:** Define reconciliation effort, turnaround start/end, sample size, and whether all metrics share the same cohort.

**Make the story visible:**

- Open with turnaround, then briefly explain GL/AP/AR as financial records.
- Paint one actual reviewer decision; do not invent a customer quote, audit event, or zero-error claim.

- For engineers, explain confidence routing, independent validation, and safe replay. For executives, explain the reported turnaround from 3 days to 5.5 hours and the reviewer decision boundary. Confirm the measurement and stakeholder acceptance; do not claim audit compliance or zero errors.

**Speaking template, confirm before use:**

At MSRcosmos, I worked on moving financial records from Sage X3 to Sage Intacct across 12 client entities. The problem was to reduce reconciliation work while preserving a human review path. [confirm: the specific stakeholder requirement and my ownership boundary]. I built the workflow with the Claude API and LangGraph, and designed routing over Sage REST APIs and MCP tools. Records above a confidence threshold were auto-approved; other cases went to reviewers. [confirm: how that threshold was validated and one alternative I rejected]. The reported results were 68% less manual reconciliation and turnaround from 3 days to 5.5 hours. I would explain the measurement window before attributing the full change to my work. [confirm: one genuine lesson and what I changed afterward].

**Tailored follow-ups:**

- What did the finance stakeholder ask you to protect, in their own words?
- What was one record that automation could not safely approve, and how was it handled?
- How did you validate 83% auto-approval without interpreting confidence as correctness?
- Were 68% effort reduction and 3-day to 5.5-hour turnaround measured over the same entities and period?


## S2. P1 MTTR from 94 to 26 minutes

**Preparation status:** Needs evidence details. Resume-supported claims, not independently verified; personal narrative details still need confirmation.

**Resume-supported material:**

- Real-time API diagnostics on high-throughput event streams across 1M+ endpoints.
- Root-cause tags and runbook context; P1 MTTR reported from 94 to 26 minutes.

**What works:**

- Very clear operational result and credible technical depth.
- Fits Deliver Results and Dive Deep when anchored in one decision.

**What is missing:**

- One actual incident rather than a platform-wide retrospective.
- Incident sample, mean-versus-median definition, rollout, and false diagnoses.

- **Stakes:** P1 severity suggests urgency, but affected customers and the actual service impact are unspecified.
- **Ownership:** Instrumenting and tagging are in the resume; exact design and rollout ownership need confirmation.
- **Decision:** The tag logic and choice between rules and a model are not given.
- **Tradeoff:** Diagnostic speed versus false confidence, telemetry cost, and cardinality need actual examples.
- **Measurement:** MTTR is 94 to 26 minutes, about 72% lower; incident count, time window, and other changes are missing.

**Make the story visible:**

- Explain the old on-call workflow before describing the event pipeline.
- Pause after 94 to 26 minutes; add one real incident detail instead of listing all scale numbers.

- For engineers, explain the actual event signals, tag logic, false diagnoses, and rollout. For executives, explain recovery from 94 to 26 minutes and the affected customer workflow. Confirm the measurement and impact; a P1 does not establish every customer was down.

**Speaking template, confirm before use:**

At Oracle, I instrumented real-time API diagnostics for NSX, using high-throughput event streams across more than a million endpoints. P1 incidents had a reported MTTR of 94 minutes. [confirm: one incident that shows what the on-call engineer struggled with]. My work added root-cause tags for 400- and 500-series failures and gave on-call engineers runbook context. [confirm: the tagging rule I owned, an alternative, and how I validated it]. After the change, reported P1 MTTR was 26 minutes, about 72% lower. [confirm: incident count, measurement period, and other contributors]. The customer value was a faster recovery path; I would be specific about the affected workflow rather than claim every tenant was down. [confirm: what this taught me about operational design].

**Tailored follow-ups:**

- Walk through one P1 from first signal to mitigation, naming your own intervention.
- What fields produced a root-cause tag, and when was it wrong?
- What other changes could explain part of the MTTR decrease?
- How did you avoid leaking tenant data in diagnostic context?


## S3. SLO alerting, 41% fewer false pages

**Preparation status:** Needs evidence details. Resume-supported claims, not independently verified; personal narrative details still need confirmation.

**Resume-supported material:**

- Prometheus/Grafana across 37,000+ enterprise tenants; 47 dashboards and alert rules.
- Static-threshold to SLO-oriented alerting; false-positive pages reported 41% lower.

**What works:**

- Clear operational pain and a measurable result.
- Good chance to demonstrate judgment through signal selection.

**What is missing:**

- Actual user-facing SLI, target, and who approved it.
- False-positive definition and checks for missed true incidents.

- **Stakes:** Alert fatigue is a reasonable risk; quantify real burden only if you observed it.
- **Ownership:** Architected the stack is resume language; dashboard, alert, and rollout responsibilities need boundaries.
- **Decision:** A CPU or memory threshold is not by itself a user-facing SLO; explain the actual indicator.
- **Tradeoff:** Lower noise can hide failures; describe the chosen sensitivity and verification.
- **Measurement:** 41% reduction needs before/after page counts, labels, measurement windows, and comparable traffic.

**Make the story visible:**

- Use one noisy alert and the signal that replaced it.
- Explain an SLO in plain words before naming Prometheus or Grafana.

- For engineers, explain the actual SLI, target, alert sensitivity, and missed-incident checks. For executives, connect 41% fewer false-positive pages to attention available for real incidents, without claiming measured productivity or customer benefit that was not recorded.

**Speaking template, confirm before use:**

At Oracle, I worked on Prometheus and Grafana observability for NSX across more than 37,000 enterprise tenants. The stack used static thresholds, and my project moved alerting toward SLOs, with 47 dashboards and alert rules. [confirm: one noisy page and the user-facing signal it should have represented]. I used CPU, memory, and p99 latency signals in that work. [confirm: the actual service-level indicator, target, and decision I owned]. I would explain why the new alert better distinguished meaningful degradation, and how we checked for missed incidents. The reported outcome was 41% fewer false-positive pages. [confirm: the underlying counts and comparison window]. This is a useful reliability story once I can show the decision and its detection tradeoff, rather than just name the monitoring stack.

**Tailored follow-ups:**

- What was the actual SLI and which customer promise set the SLO?
- Were CPU and memory leading signals or objectives themselves?
- How did you ensure true-positive detection did not get worse?
- How did you control high-cardinality labels and telemetry cost?


## S4. CLI validation toolchain adopted by 4 teams

**Preparation status:** Needs evidence details. Resume-supported claims, not independently verified; personal narrative details still need confirmation.

**Resume-supported material:**

- Jenkins CLI toolchain with scripted pre-deployment validation; adopted by 4 engineering teams.
- Release cycles 34% shorter; failed deploys from 11% to 4%.

**What works:**

- Strong Invent and Simplify anchor with adoption evidence.
- Connects developer effort to release reliability.

**What is missing:**

- Concrete adoption action and genuine stakeholder objection, if one occurred.
- Evidence of coaching is absent; adoption cannot stand in for mentoring.

- **Stakes:** Configuration errors reached production, but a concrete consequence and deadline are missing.
- **Ownership:** The resume says shipped the toolchain; authority, collaborators, and persuasion tactics are not recorded.
- **Decision:** Explain one validation check and why it belonged before deployment.
- **Tradeoff:** Check depth versus build time, false failures, exception policy, and adoption friction need evidence.
- **Measurement:** Define release-cycle duration, deploy denominator, comparison period, and attribution.

**Make the story visible:**

- Begin with the production error, then show how CI moved detection earlier.
- Use one team interaction you remember accurately; avoid generic influence language.

- For engineers, demonstrate one pre-deployment check and its exception policy. For executives, explain failed deploys falling from 11% to 4% and release cycles 34% shorter. Confirm attribution and adoption actions before presenting this as a customer-influence example.

**Speaking template, confirm before use:**

At Oracle, I shipped a CLI toolchain in Jenkins CI/CD to catch configuration errors before production. [confirm: one real error and the customer or engineering cost it caused]. I built scripted pre-deployment validation so that the same class of issue could be detected in CI. [confirm: a representative check, the alternative, and my ownership]. Four teams adopted the toolchain. [confirm: what I did to help one team adopt it and an actual concern they raised]. Reported release cycles were 34% shorter, and failed deploys dropped from 11% to 4%. [confirm: the period, deployment counts, and other changes]. The adoption is evidence of a useful tool; I would only describe mentoring or disagreement if I can give a separate, real interaction that demonstrates it.

**Tailored follow-ups:**

- Show one check that prevented a real configuration failure.
- What did you personally do for another team to adopt it?
- Did any team disagree, and what was their actual concern?
- Did someone become more capable independently because of your coaching, or was this only tooling adoption?


## S5. NetSuite search latency down 30%

**Preparation status:** Needs evidence details. Resume-supported claims, not independently verified; personal narrative details still need confirmation.

**Resume-supported material:**

- Profiled query plans, restructured indexes on hot predicates, and rewrote SQL driving full scans.
- NetSuite search P50 page load: 840 ms to 588 ms, 30% lower.

**What works:**

- Focused technical mechanism with a clean baseline.
- Strong Dive Deep option that can translate into customer database advice.

**What is missing:**

- User workflow, representative query, and database engine.
- Write overhead, correctness, rollout safety, and measurement conditions.

- **Stakes:** A slower search affects users, but frequency and business impact have not been stated.
- **Ownership:** The resume names profiling, indexes, and SQL work; team boundary and target are absent.
- **Decision:** Explain the actual query plan change and why that index fit the predicates.
- **Tradeoff:** Read gain versus write cost, storage, locking, and regression risk require measured details.
- **Measurement:** P50 is median page load, not a query percentile or p99; test conditions and tail behavior are missing.

**Make the story visible:**

- Describe a user waiting for search, using an actual workflow.
- Translate full scan into reading too much data before returning to the technical detail.

- For engineers, explain one query plan, index choice, write cost, and rollout. For executives, explain median search page load falling from 840 ms to 588 ms and ask which user workflow matters. Do not invent hardware savings or increased revenue.

**Speaking template, confirm before use:**

At Oracle, I worked on NetSuite search where P50 page-load latency was 840 milliseconds at enterprise data volumes. [confirm: the specific search workflow and why that delay mattered]. I profiled query plans, restructured indexes on hot predicates, and rewrote SQL that drove full scans. [confirm: one query, the plan evidence, and why I chose that index instead of another approach]. The reported P50 page load fell to 588 milliseconds, a 30% reduction. [confirm: the comparison conditions and how I checked write overhead, correctness, and tail latency]. I would keep the result at the level measured: median page load. The resume does not establish a hardware saving, so I would describe cost reduction only if I have separate evidence.

**Tailored follow-ups:**

- What did EXPLAIN show before and after?
- Why that column order and selectivity for the index?
- What happened to writes, storage, and p95 or p99 latency?
- How did you check correctness and roll back the SQL or index change?


## S6. Kubernetes autoscaling on custom metrics

**Preparation status:** Needs evidence details. Resume-supported claims, not independently verified; personal narrative details still need confirmation.

**Resume-supported material:**

- Docker and Kubernetes containerization for NSX on OCI.
- Horizontal autoscaling used custom Prometheus metrics; p99 SLOs held at 2x peak load.

**What works:**

- Direct reliability and scaling evidence.
- Excellent bridge from OCI operating experience to a proposed AWS design.

**What is missing:**

- Exact metric, numeric target, and peak-load definition.
- Scale-up lag, pod versus node capacity, stabilization, and test evidence.

- **Stakes:** Release surges are given; actual customer consequences of saturation remain unspecified.
- **Ownership:** Containerization and autoscaling are resume claims; exact implementation boundary needs confirmation.
- **Decision:** The custom metric is unnamed, so the core decision cannot yet be explained convincingly.
- **Tradeoff:** Response speed versus flapping, cost, node capacity, and dependency saturation need actual settings.
- **Measurement:** 2x peak needs baseline RPS, workload shape, p99 threshold, duration, and test or production distinction.

**Make the story visible:**

- Say OCI explicitly, then explain the portable scaling principle.
- Draw one path from signal to desired replicas to available capacity.

- For engineers, trace the actual metric through replica demand, node capacity, readiness, and stabilization. For executives, describe holding p99 objectives at 2x peak load, with the test conditions confirmed. Distinguish OCI experience from a proposed EKS or ECS design.

**Speaking template, confirm before use:**

At Oracle, I containerized NSX services with Docker and Kubernetes on OCI. The services needed to maintain latency objectives through release surges. I drove horizontal autoscaling from custom Prometheus metrics rather than CPU alone. [confirm: the metric, target, and evidence that it represented the bottleneck]. The reported result was holding p99 SLOs at twice peak load. [confirm: baseline traffic, p99 target, test duration, and whether this was a load test or production observation]. I would also explain scale-up delay, pod readiness, and how node capacity was available. [confirm: the mechanisms I actually implemented]. My experience here is OCI; an EKS or ECS version would be a proposed design, with the same need to validate signals and capacity.

**Tailored follow-ups:**

- Which metric predicted the bottleneck, and why did CPU alone miss it?
- What was the p99 objective and how long did the 2x test run?
- How did node provisioning and pod readiness affect scale-up?
- What prevented scale-down from causing another surge or connection loss?


## S7. Ramping up on LangGraph and MCP fast

**Preparation status:** Same episode, alternate angle. Resume-supported claims, not independently verified; personal narrative details still need confirmation.

**Resume-supported material:**

- The ERP migration used Claude API, LangGraph, and MCP tool calling.
- 68% less manual reconciliation is an outcome of that same S1 system.

**What works:**

- Relevant Learn and Be Curious topic if actual learning decisions are supplied.
- The domain and tools provide concrete material for a learning example.

**What is missing:**

- Evidence that the tools were new, the learning deadline, and the sequence.
- An initial misconception, feedback, changed approach, and a distinct learning outcome.

- **Stakes:** The migration had a real delivery context; a compressed ramp-up is not established in the resume.
- **Ownership:** Using the tools does not establish who selected them or learned them from scratch.
- **Decision:** Prototype-first learning and source reading were earlier draft assumptions, not resume facts.
- **Tradeoff:** Describe depth versus delivery speed only using an actual choice and feedback.
- **Measurement:** S1 metrics are shared results; do not double-count this as a distinct episode.

**Make the story visible:**

- Use only for a question that asks about learning, after confirming the learning sequence.
- Tell the misconception and correction; avoid another full retelling of the migration.

- For engineers, describe a real learning experiment and how it changed the implementation. For executives, explain why learning reduced delivery uncertainty only if you can substantiate that connection. This is another angle on S1, not a separate customer result.

**Speaking template, confirm before use:**

The ERP migration at MSRcosmos used the Claude API, LangGraph, and MCP tool calling. It is the same project as my reconciliation story, so I would use this angle specifically for a learning question. [confirm: what I had not used before and the deadline for learning it]. I worked with LangGraph and Sage REST APIs exposed through MCP tools. [confirm: the small experiment or documentation that helped me understand the relevant behavior]. [confirm: one initial misconception, how I discovered it, and what I changed]. The overall system reported 68% less manual reconciliation, but that is a shared project outcome rather than a measure of learning speed. I would close with the method I actually reused afterward, once I have supplied that evidence.

**Tailored follow-ups:**

- What did you not know on day one, and how did you test that you understood it?
- What was the first thing you tried that did not work?
- Which source or small experiment changed the implementation?
- What changed in your behavior afterward, beyond shipping S1?


## S8. DQN training stall, 40% shorter runs

**Preparation status:** Needs evidence details. Resume-supported claims, not independently verified; personal narrative details still need confirmation.

**Resume-supported material:**

- DQN for NFL fourth-down calls over 420K plays; vectorized replay-buffer sampling and removed a loader stall.
- Runtime 52 to 31 minutes; agreement with EPA-optimal calls separately 68% to 74% on held-out 2024 drives.

**What works:**

- Simple bottleneck-to-fix narrative suited to Dive Deep.
- Concrete runtime baseline makes the result easy to understand.

**What is missing:**

- Role classification discrepancy and the profiler or timing evidence.
- Equivalent-workload checks and the separate cause of model-quality improvement.

- **Stakes:** Shorter experiments suggest faster iteration; the actual research deadline or blocked hypothesis needs confirmation.
- **Ownership:** The resume attributes implementation to you; collaborators and experimental ownership remain unknown.
- **Decision:** Vectorization and loader change are explicit; explain the evidence that prioritized them.
- **Tradeoff:** Optimization can change sampling semantics or determinism; explain actual checks.
- **Measurement:** 52 to 31 minutes is about 40% less runtime, not a 40% increase in speed; agreement gain is 6 percentage points.

**Make the story visible:**

- Use 52 to 31 minutes and say shorter runtime.
- Keep runtime optimization and model-quality improvement as separate claims.

- For engineers, explain sampling vectorization, the loader stall, and equivalent-workload checks. For executives, explain runs shortening from 52 to 31 minutes without claiming measured cost savings. Keep the separate quality change and research context explicit.

**Speaking template, confirm before use:**

In USC sports analytics research, I prototyped a DQN for NFL fourth-down decisions over 420,000 plays. A training run took 52 minutes. [confirm: the research constraint and profiling evidence]. I vectorized replay-buffer sampling and removed a data-loader stall. [confirm: why those were the bottlenecks, and how I checked sampling behavior and training remained correct]. Per-run time dropped to 31 minutes, about 40% shorter. Separately, agreement with EPA-optimal calls rose from 68% to 74% on held-out 2024 drives; I would not attribute that quality gain to a runtime change without evidence. [confirm: my actual lesson]. The PDF calls the role AI/ML Research Intern; I need to reconcile the earlier volunteer label before using an official classification.

**Tailored follow-ups:**

- Which timing trace isolated replay sampling and the loader stall?
- What sampling behavior and convergence checks did you preserve?
- What changed agreement from 68% to 74%, independent of runtime?
- Was the official appointment an internship, volunteer role, or another research classification?


## S9. PacSun executive intelligence app

**Preparation status:** Needs outcome or milestone. Resume-supported claims, not independently verified; personal narrative details still need confirmation.

**Resume-supported material:**

- Current USC Annenberg work: multi-agent retail intelligence on Claude Enterprise with MCP connectors.
- Owner-tagged issue view, CEO briefs, and scheduling proposals with agendas are described.

**What works:**

- Relevant customer discovery and executive communication context.
- Can demonstrate current design reasoning without claiming completed business impact.

**What is missing:**

- Live-versus-prototype status, stakeholder feedback, and personal ownership.
- Adoption, quality, time saved, source checking, approval, and data authorization.

- **Stakes:** The executive audience is stated, but the exact pain and cost of the old process are not.
- **Ownership:** The resume says building and engineered; separate completed components from planned ones.
- **Decision:** Multi-agent roles and ranking are described, but the alternative and evaluation are missing.
- **Tradeoff:** Live access and action proposals create correctness and permission tradeoffs requiring real controls.
- **Measurement:** No outcome metric or accepted milestone is in the resume; retain ongoing status.

**Make the story visible:**

- Use present tense and a concrete current milestone.
- Explain the executive decision the brief supports; avoid suggesting measured adoption.

- For engineers, explain connector permissions, source attribution, ranking evaluation, and approval. For executives, explain which decision the owner-tagged view supports. State what is live and what remains a prototype; measured adoption or business impact is not yet supplied.

**Speaking template, confirm before use:**

At USC Annenberg, I am building a retail intelligence app on Claude Enterprise for PacSun executives. It connects to internal systems through MCP, ranks operational issues into an owner-tagged view, and drafts briefs. [confirm: the stakeholder problem and what I personally own]. I also engineered a scheduling workflow that proposes meeting slots and agendas based on urgency and owner. [confirm: which components are live and how proposals are reviewed]. This is ongoing work, so I would report its current stage rather than claim a completed business result. [confirm: one dated piece of feedback or an accepted milestone]. The SA connection is learning what decision an executive needs to make and designing around that; I still need evidence of actual adoption and evaluated output quality.

**Tailored follow-ups:**

- What did an actual executive or stakeholder ask for?
- Which component has real users, and what feedback changed your design?
- How are connector scopes enforced and meeting proposals approved?
- What would make you abandon the multi-agent design for a simpler workflow?


## S10. Human-in-the-loop annotation pipeline

**Preparation status:** Needs outcome or milestone. Resume-supported claims, not independently verified; personal narrative details still need confirmation.

**Resume-supported material:**

- Rubric-based annotation on Llama 3.3 70B, confidence scores, and low-confidence routing to domain experts.
- A separate resume bullet covers a six-model Veracity benchmark across eight trust pillars.

**What works:**

- Responsible-AI design with a specific human escalation path.
- Useful technical discussion of evaluation and confidence limitations.

**What is missing:**

- Rubric author, label definition, calibration, and annotation result.
- Actual data handling controls and measured agreement or an accepted pilot milestone.

- **Stakes:** Caseworker notes make handling constraints important, but the data classification and stakes need confirmation.
- **Ownership:** The pipeline is attributed to you; rubric design and expert-review responsibility are unspecified.
- **Decision:** Low-confidence routing is explicit, but choice of model, threshold, and evaluation are absent.
- **Tradeoff:** Review burden versus missed errors is the central tradeoff; confidence is not a verified probability.
- **Measurement:** No label-agreement, throughput, reviewer-load, or business-result measure is supplied.

**Make the story visible:**

- Keep the annotation story separate from the six-model benchmark.
- Explain what the human checks, then name the model.

- For engineers, explain rubric evaluation, confidence calibration, expert review, and actual data controls. For executives, describe the boundary of model decision-making and what evidence is still needed. Do not claim measured accuracy or reviewer savings without a result.

**Speaking template, confirm before use:**

At USC AI Trust Lab, I built a rubric-based annotation pipeline using Llama 3.3 70B for caseworker notes. It labels notes, scores confidence, and routes low-confidence cases to domain experts. [confirm: the actual annotation problem, rubric owner, and my responsibility]. My contribution was building that pipeline and review routing. [confirm: how expert labels were used to validate the rubric and confidence threshold, and which data handling controls were implemented]. The resume establishes the functionality, but does not give an expert-agreement or throughput result. [confirm: a dated pilot outcome or accepted milestone; if unmeasured, say so]. I also benchmarked frontier models in separate work, which I would discuss separately rather than imply that benchmark validated this annotation system.

**Tailored follow-ups:**

- Who defined the rubric and how were disagreements resolved?
- How did expert labels validate the confidence threshold?
- What percentage of high-confidence outputs was sampled for errors?
- What data access, retention, and redaction controls actually existed?


## S11. ModelScope quantization study

**Preparation status:** Needs evidence details. Resume-supported claims, not independently verified; personal narrative details still need confirmation.

**Resume-supported material:**

- Llama-3.2-3B and Gemma-2-2B across eight configurations on a T4 GPU.
- INT4: 2299 MB, 62% below FP16, 13.7 tok/s, MMLU within a point; INT8 comparison needs setup and comparator.

**What works:**

- Natural evidence-based judgment and Frugality example.
- Multiple quality and resource dimensions support a real tradeoff discussion.

**What is missing:**

- Which model and workload produced each headline metric.
- Comparator for INT8, repeated-run variance, quality uncertainty, and benchmark limitations.

- **Stakes:** This is a project benchmark; no actual customer cost or production outcome is established.
- **Ownership:** Benchmark construction and profiling are explicit; external constraints and collaborators are not.
- **Decision:** A Pareto sweep is named; show the actual nondominated alternatives and chosen quality constraint.
- **Tradeoff:** Quality, memory, throughput, latency, and hardware compatibility can change the choice.
- **Measurement:** Clarify model, batch size, sequence length, warmup, repeats, memory definition, and INT8 comparator.

**Make the story visible:**

- Say in this T4 benchmark before stating the result.
- End with the decision boundary; avoid a universal claim that INT8 is wrong.

- For engineers, explain the exact model, workload, measurement method, comparator, and quality constraint. For executives, describe the tested resource-versus-quality choice and the need for customer-specific evaluation. No production cost saving or universal precision recommendation is established.

**Speaking template, confirm before use:**

In ModelScope, I benchmarked Llama-3.2-3B and Gemma-2-2B across eight quantization configurations on a T4 GPU. I profiled latency, throughput, and peak memory, and used a Pareto sweep to compare tradeoffs. [confirm: the quality requirement and workload]. The resume reports INT4 at 2299 MB, 62% below FP16, with 13.7 tokens per second and MMLU within a point of baseline. [confirm: which model and configuration those numbers describe]. It also reports INT8 dominated with 53% more memory and 2.1 times lower throughput. [confirm: the comparator, measurement conditions, and repeated-run evidence]. I would limit that conclusion to the tested setup. For a customer, I would rerun the evaluation on their workload before recommending a precision or instance.

**Tailored follow-ups:**

- Which exact model/configuration produced 2299 MB and 13.7 tok/s?
- What was INT8 compared against for the 53% and 2.1x claims?
- What was the MMLU sample and uncertainty, and what did it fail to capture?
- What changes on different GPU kernels or a customer-specific evaluation set?


## S12. Nightly Databricks feed

**Preparation status:** Needs evidence details. Resume-supported claims, not independently verified; personal narrative details still need confirmation.

**Resume-supported material:**

- Nightly Databricks feed across AWS, Azure, and GCP workspaces; PySpark into Delta Lake.
- 17 financial tables, 4.2M rows, partition pruning, incremental merges, reported full refresh 22 minutes.

**What works:**

- Specific pipeline scale and technical mechanism.
- Can show reliability reasoning behind the ERP agent workflow.

**What is missing:**

- Full refresh versus incremental timing and exact correctness semantics.
- Freshness SLA, failure handling, cost, and acceptance evidence.

- **Stakes:** The agents need fresh data; actual cutoff and the effect of stale data are unspecified.
- **Ownership:** Automation and staging are attributed to you; workspace infrastructure and scheduling ownership are unclear.
- **Decision:** Pruning and merges are named; explain actual keys and why this approach fit the source changes.
- **Tradeoff:** Incremental speed can complicate deletes, late events, replays, and correctness.
- **Measurement:** 22 minutes is labeled full refresh while merges suggest incrementality; clarify exactly what was timed.

**Make the story visible:**

- Start with the downstream need for fresh financial data.
- Use one actual late-source or merge-key example and define full refresh precisely.

- For engineers, explain merge keys, deletes, late arrivals, correctness, and the meaning of full refresh. For executives, explain the 22-minute reported refresh in relation to the customer freshness requirement once confirmed. Native AWS equivalents remain proposed designs.

**Speaking template, confirm before use:**

At MSRcosmos, I automated the nightly Databricks feed behind the ERP agents across AWS, Azure, and GCP workspaces. The pipeline staged 17 financial tables and 4.2 million rows into Delta Lake using PySpark. [confirm: the freshness requirement and my infrastructure versus pipeline responsibility]. I used partition pruning and incremental merges. [confirm: the merge key, handling of deletes and late data, and why this design fit the sources]. The resume reports a 22-minute full refresh. [confirm: exactly what full refresh means here, the compute configuration, and measurement period]. I would explain retry and reconciliation behavior before calling the pipeline reliable. This is part of the ERP program, with a distinct data-engineering decision; it is not evidence that I built equivalent native pipelines in every cloud.

**Tailored follow-ups:**

- Was 22 minutes a full reload, full scan with merge, or incremental refresh?
- How did you handle source deletes and late or replayed updates?
- What happened if one workspace was unavailable?
- What did correctness and freshness checks compare before publishing data?

## Three gaps that require real experiences

### A real failure or mistake

No existing story establishes something you owned that went wrong, its consequence, and your change in behavior. A success with a difficult starting point is not automatically a failure story.

- What did I decide or miss, and what evidence shows it was wrong?
- Who was affected, what did I disclose, and what did I do first?
- What changed afterward, and how do I know the prevention mechanism worked?

### A real disagreement and commitment

No documented disagreement exists. The CLI adoption and SLO redesign are only places to search your memory, not proof that resistance occurred.

- Who disagreed and what was their strongest reason?
- What data or customer need did I bring, and who made the decision?
- If my proposal lost, what did I do to commit to the chosen direction?

### A real person who grew through your help

Four-team adoption does not demonstrate coaching. Show a person's starting point, your deliberate intervention, and what they could do independently afterward.

- Who did I help and what could they not do initially?
- What specific feedback, pairing, exercise, or review did I provide?
- What did they do independently later, and what evidence shows progress?

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

## Source guidance

Amazon recommends STAR, relevant metrics, and clarity about individual contributions; see [Amazon recruiting interview tips](https://www.aboutamazon.com/news/workplace/amazon-interview-best-tips).

The mappings and gap analysis are editorial interpretations of the [Amazon Leadership Principles](https://www.amazon.jobs/content/en/our-workplace/leadership-principles), not an official hiring rubric.
