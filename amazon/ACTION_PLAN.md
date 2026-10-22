# Action plan: Amazon SA final loop, October 28, 2026

Feed this file to Claude Code in the Resume-Griller repo. Execute every phase in order, autonomously, then push to `main` so GitHub Pages deploys. Do not stop to ask questions; where something is ambiguous, pick the reading that best serves interview preparation and note it in the final report.

## 0. What changed: the format is now confirmed

The recruiter confirmed the loop on October 21, 2026. Everything labeled "reported, not confirmed" in `amazon/` must be replaced with the facts below.

- **Role:** AWS Solutions Architect, 2027 full time, L4, AWSI Emerging Talent Program. Customer-facing, pre-sales architecture. This is not an SWE loop.
- **Day:** Wednesday, October 28, 2026, 9:30 am to 2:30 pm, in person on the USC campus. Lunch break 11:30 am to 12:30 pm. Arrive 9:00 am.
- **Format:** four 60-minute interviews with four interviewers. Which interviewer covers which part is not stated; assume Leadership Principle (LP) questions in every round.
- **No live coding and no DSA round.** Instead: "a thorough examination and discussion of coding concepts and principles." Candidates must explain code and concepts verbally.
- **Technical evaluation, three parts:**
  1. **Breadth** across 3 of: CS fundamentals, databases/analytics, networking, hardware, application development, security, AI/ML.
  2. **Depth** in 1 of the same list.
  3. **Explaining technical concepts to a non-technical audience.** The recruiter repeated this four times; treat it as the most important skill.
  - The prep list also includes **cloud computing**.
- **Candidate's chosen areas:** depth = **AI/ML**; breadth = **networking, databases/analytics, security**; plus CS fundamentals, application development, hardware, and cloud computing as backup coverage, because interviewers choose.
- **Behavioral:** LPs named as most relevant to this role (exactly these 8): **Customer Obsession, Ownership, Bias for Action, Earn Trust, Learn and Be Curious, Insist on the Highest Standards, Deliver Results, Dive Deep.** Have Backbone and Hire and Develop are not on the list; deprioritize those gaps but keep the failure story as a must.
- **Amazon's own answer rubric** (from the recruiter's study guide): STAR, answers 2 to 4 minutes (not 60 to 90 seconds), metrics in every result, "I" not "we", examples within the last 5 years, each answer should show 4 to 6 LPs, and be ready for "How would you implement this at AWS?" and "What would you do differently?"
- **Sample behavioral questions from the recruiter's guide:** a problem with several possible solutions and how you chose; a time you took a risk, made a mistake, or failed; a time you took the lead on a project; motivating a group or promoting collaboration; using data to develop a strategy.
- **Communication assessment:** an 8 to 10 minute oral presentation on a topic of the candidate's choice, then brief Q&A. **No laptop, no slides.** Simple handouts, diagrams, or props are allowed. Audience: technical professionals unfamiliar with the topic. Scored on clarity, engagement, organization, confidence and presence, time management, and a clear call to action. Suggested structure: hook and intro (30 to 60 s), what is it (1 to 2 min), why should we care (2 to 3 min), how does it work (1 to 2 min), call to action (30 to 60 s). Avoid proprietary employer information.
- **Chosen presentation topic:** "How do you fit a big AI model on a small computer? Quantization explained," built on the candidate's own ModelScope project. Use only numbers already in `data/profile.json` (INT4 2299 MB, 62% below FP16, 13.7 tok/s, MMLU within a point, INT8 dominated: 53% more memory and 2.1x lower throughput, T4 GPU, Llama-3.2-3B and Gemma-2-2B, 8 configs). If a number is not in profile.json, do not use it.

## 1. Rules that apply to every phase

- Reuse the existing `amazon/` architecture: data in `data/*.json` with a schema in `data/schema/`, renderers in `js/`, checks in `scripts/`. Extend; do not rebuild what works.
- **Accuracy over volume.** Every technical answer must be correct. Verify AWS facts (service names, limits, defaults) against docs.aws.amazon.com; record the check date in the data file's `verified_on`. When unsure, leave the claim out.
- **No invented candidate facts.** Only use metrics in `data/profile.json`. Unwritten personal stories stay as `[fill: ...]` prompts.
- **Candidate facts:** Oracle SWE II Jul 2022 to Jan 2025, spoken as "nearly 3 years"; MSRcosmos AI Forward Deployed SWE Intern Jun 2026 to Aug 2026; USC Sports Analytics is volunteer research; USC MS CS graduates December 16, 2026. PacSun and Trust Lab work is ongoing: say "building", not "built".
- **No em dashes or en dashes anywhere.** Commas, colons, periods.
- **Public repo privacy:** no recruiter names or emails, no phone numbers, no street address or room number, no immigration or visa details. Say "USC campus" for the location.
- Plain, spoken English in every answer. Short sentences. Answer first, then the reason.

## 2. Phase A: update the loop to the confirmed format

- Rewrite `data/loop.json`: the real schedule (four 60-minute rounds, lunch break, arrival time), what each of the three evaluation streams covers (technical breadth/depth/communication, LPs, presentation), and a day-by-day plan from October 22 to October 28:
  - Oct 22: expand the 8 lead stories to 2 to 4 minutes; draft the failure story.
  - Oct 23: presentation outline, handout, first timed run.
  - Oct 24: AI/ML depth.
  - Oct 25: networking, databases, security breadth.
  - Oct 26: CS fundamentals and coding concepts (verbal), application development, hardware basics.
  - Oct 27: full mock day (four rounds) plus two presentation runs.
  - Oct 28: light review of the day-of sheet only.
- Remove every "reported, not confirmed" label that the confirmed format now answers. Keep the label only on things still unknown (which interviewer covers what).
- Update `index.html` countdown, round cards, and checklists to match. Add a "Day-of" panel: arrive 9:00, what to bring (printed resume x5, printed presentation handouts x5, notebook and pen, water), no laptop needed for the presentation.
- Update `amazon/README.md` and the root `README.md` to describe the confirmed format.

## 3. Phase B: technical domains, one cheatsheet and one question bank each

Create `data/domains.json` (+ schema) and a new page `domains.html` with a tab or anchor per domain. For **every** domain produce:

1. **Cheatsheet:** one screen. The 8 to 15 concepts that matter most, each as a term, a one-line definition, and the one distinction interviewers probe. Include a small inline SVG diagram where a picture beats words (OSI stack, TLS handshake, B-tree index, memory hierarchy, transformer flow, RAG pipeline).
2. **Question bank.** Each question has all of these fields:
   - `q`: the question as an interviewer would ask it
   - `level`: basic, intermediate, deep
   - `plain`: the answer for a non-technical listener, 2 to 3 sentences, with an everyday analogy. Required on every question.
   - `technical`: the 60-second technical answer an engineer would accept
   - `probes`: 2 to 3 likely follow-ups, each with a short answer
   - `aws`: how this shows up in AWS (service or practice), when relevant
   - `resume`: the candidate's own experience that demonstrates it, when a real one exists in profile.json or stories; otherwise omit
   - `trap`: the common wrong answer or confusion
3. **Minimum question counts:** AI/ML (depth) 45; networking, databases/analytics, security 30 each; CS fundamentals and coding concepts 35; application development 25; cloud computing 25; hardware 15.

### Topics each domain must cover

**AI/ML (depth area; go deepest here)**
- ML basics: supervised, unsupervised, reinforcement learning; training vs inference; features and labels
- Data splits, overfitting and underfitting, bias-variance tradeoff, regularization, cross-validation
- Metrics: accuracy, precision, recall, F1, ROC-AUC, confusion matrix, when accuracy misleads (class imbalance)
- Classic models at concept level: linear and logistic regression, decision trees, random forests, gradient boosting (XGBoost)
- Neural networks: neurons, layers, activation, loss, gradient descent, backpropagation, epochs, batch size, learning rate
- Deep learning families: CNN, RNN, transformers; attention explained simply
- LLMs: tokens, context window, temperature, embeddings, pretraining vs fine-tuning vs instruction tuning vs RLHF
- Prompting, RAG (chunking, embeddings, vector search, reranking), fine-tuning vs RAG decision
- Agents and tool use, MCP, orchestration (LangGraph), human-in-the-loop design
- Hallucination and mitigation, evaluation of LLM apps (golden sets, LLM-as-judge, human review), guardrails and responsible AI, prompt injection
- Inference performance: GPU vs CPU, memory bound vs compute bound, batching, KV cache, quantization (FP16, INT8, INT4), distillation, latency vs throughput, cost per token
- Graph neural networks at concept level (candidate's fraud project: 726K nodes, 19.5M edges, 0.923 ROC-AUC, +0.03 over XGBoost)
- MLOps: model registry, drift, monitoring, A/B tests, retraining
- AWS: Bedrock (models, Knowledge Bases, Agents, Guardrails), SageMaker AI, Inferentia and Trainium, Textract, Rekognition, Comprehend, Amazon Q. When to use Bedrock vs SageMaker vs a task-specific AI service.

**Networking**
- OSI and TCP/IP layers with an example protocol at each
- TCP vs UDP, three-way handshake, ports
- HTTP methods and status codes, HTTP/1.1 vs HTTP/2 vs HTTP/3, HTTPS and the TLS handshake
- DNS resolution step by step, record types (A, AAAA, CNAME, MX, TXT, alias), TTL
- IP addressing, IPv4 vs IPv6, CIDR and subnetting, public vs private ranges, NAT
- Routing, gateways, firewalls (stateful vs stateless), proxies and reverse proxies
- Load balancing L4 vs L7, algorithms (round robin, least connections), health checks, sticky sessions
- CDNs and caching, latency vs bandwidth vs throughput
- VPN, dedicated links, WebSockets, REST vs gRPC
- "What happens when you type a URL and press Enter," end to end
- AWS: VPC, subnets, route tables, Internet Gateway, NAT Gateway, security groups vs NACLs, ALB vs NLB, Route 53, CloudFront, PrivateLink, Transit Gateway, VPN vs Direct Connect

**Databases and analytics**
- Relational model, SQL basics, joins (inner, left, right, full), GROUP BY, subqueries at concept level
- ACID, transactions, isolation levels and anomalies (dirty, non-repeatable, phantom reads)
- Normalization vs denormalization
- Indexes: what a B-tree index is, why it speeds reads and slows writes, composite indexes, query plans
- NoSQL types: key-value, document, wide column, graph, time series; BASE and eventual consistency; CAP theorem
- Replication (primary/replica, sync vs async), sharding and partition keys, hot partitions
- Caching patterns (cache-aside, write-through), cache invalidation
- OLTP vs OLAP, data warehouse vs data lake vs lakehouse, columnar formats (Parquet), ETL vs ELT, batch vs streaming
- Big data concepts: MapReduce, Spark, partition pruning
- AWS: RDS, Aurora, DynamoDB, ElastiCache, Redshift, Athena, Glue, Lake Formation, Kinesis, EMR, OpenSearch, QuickSight
- Candidate tie-ins: NetSuite P50 840 to 588 ms via index restructuring; Databricks feed of 17 tables and 4.2M rows held at 22 minutes

**Security**
- CIA triad; authentication vs authorization; MFA; SSO, OAuth 2.0, OpenID Connect, JWT at concept level
- Encryption: symmetric vs asymmetric, hashing vs encryption, salting, digital signatures, PKI and certificates, TLS
- Encryption at rest vs in transit, key management, envelope encryption
- Least privilege, zero trust, defense in depth, network segmentation
- OWASP Top 10 concepts: injection, XSS, CSRF, broken access control; DDoS
- Secrets management, logging and audit, incident response basics
- Shared responsibility model
- AWS: IAM (users, roles, policies), Organizations and SCPs, KMS, Secrets Manager, ACM, WAF, Shield, GuardDuty, CloudTrail, Config, Security Hub, Macie, Cognito

**CS fundamentals and coding concepts (verbal, no live coding)**
- Big-O for time and space, with examples; best, average, worst case; amortized cost
- Data structures: array, linked list, hash map (collisions), stack, queue, heap, tree, BST, trie, graph; when to use each and their operation costs
- Algorithms at concept level: binary search, sorting (merge, quick), BFS vs DFS, recursion, dynamic programming, greedy
- **"Walk me through this code" drills:** 10 short code snippets (Python) where the task is to say what it does, its complexity, a bug, and how to improve it. Include an O(n^2) loop that a hash map fixes, a recursive function missing a base case, a race condition, an N+1 query, a missing input validation.
- OOP: encapsulation, abstraction, inheritance, polymorphism; composition over inheritance; SOLID; common design patterns (singleton, factory, strategy, observer, adapter) explained simply
- Processes vs threads, concurrency vs parallelism, race conditions, locks, deadlock and its conditions
- Memory: stack vs heap, garbage collection, memory leaks
- Operating systems: scheduling, virtual memory and paging, system calls, file systems
- Compiled vs interpreted, static vs dynamic typing
- Distributed systems basics: CAP, consistency models, idempotency, retries with backoff, timeouts, circuit breakers
- Testing: unit, integration, end to end; TDD; code review practices; version control with git

**Application development**
- SDLC and Agile/Scrum basics, CI/CD, infrastructure as code
- Monolith vs microservices vs serverless; API design (REST resources, versioning, pagination, idempotency keys)
- Stateless vs stateful services, sessions, horizontal vs vertical scaling
- Synchronous vs asynchronous communication, queues, pub/sub, event-driven design
- Containers, Docker images, Kubernetes concepts (pod, deployment, service, autoscaling)
- Observability: logs, metrics, traces, SLIs, SLOs, error budgets, alerting on symptoms (tie in: SLO alerting cut false pages 41%; MTTR 94 to 26 min)
- Deployment strategies: rolling, blue/green, canary, feature flags, rollback (tie in: failed deploys 11% to 4%, release cycles 34% shorter)
- AWS: Lambda, ECS, EKS, Fargate, API Gateway, Step Functions, SQS, SNS, EventBridge, CodePipeline, CloudFormation, CDK, CloudWatch, X-Ray

**Cloud computing**
- What cloud computing is, in one plain sentence and one analogy (renting electricity vs running your own generator)
- IaaS vs PaaS vs SaaS with examples; public, private, hybrid, multi-cloud
- The six advantages of cloud from AWS's own material (trade capex for variable expense, economies of scale, stop guessing capacity, speed and agility, stop spending on data centers, go global in minutes). Verify wording on aws.amazon.com.
- Regions, Availability Zones, edge locations; high availability vs fault tolerance vs disaster recovery; RPO and RTO; DR tiers
- Elasticity vs scalability; pricing models (On-Demand, Savings Plans, Reserved, Spot); cost optimization
- Well-Architected Framework, 6 pillars; migration 7 Rs; shared responsibility
- Link to the existing `aws.html`, `compare.html`, `architecture.html`, `design.html` instead of duplicating them

**Hardware (breadth only)**
- CPU cores, threads, clock speed, cache hierarchy (L1, L2, L3), memory hierarchy and latency numbers at order-of-magnitude level
- GPU vs CPU and why GPUs suit AI; accelerators (Inferentia, Trainium); x86 vs ARM (Graviton)
- RAM vs storage; HDD vs SSD vs NVMe; IOPS vs throughput; RAID 0, 1, 5, 10
- Virtualization: hypervisors, VMs vs containers vs bare metal; AWS Nitro at concept level

## 4. Phase C: behavioral, rebuilt around the 8 named LPs

- In `data/behavioral.json` and `behavioral.html`:
  - Put the **8 named LPs first**, each with a primary and backup story. Mark the other 8 LPs as secondary.
  - Expand every story to a **2 to 4 minute** spoken version: richer Situation stakes, Action with obstacles, tradeoffs, and how buy-in was won, Result with metrics, plus "What I would do differently" and "How I would do this at AWS".
  - Tag each story with the **4 to 6 LPs** it demonstrates.
  - Change the rehearsal timer from 90 seconds to a 2 to 4 minute window (warn under 2:00, warn over 4:00).
- Map the recruiter's five sample questions to the best story for each, with a one-line opening sentence.
- Add a question bank of at least 40 LP questions focused on the 8 named LPs (5 per LP), each linked to the recommended story.
- **Gap stories:** the failure story is now required (the recruiter's guide asks it directly). Keep it as a prominent `[fill: ...]` prompt with the STAR worksheet questions: why it mattered, the risk, what I did specifically, the obstacle, the tradeoff, the result, the lesson, what I changed afterward. Disagreement and mentoring stay as lower-priority fills.
- Add the **self-assessment rubric** from the recruiter's guide as a checklist after each rehearsal: confident and enthusiastic tone, clear pace, concise (2 to 4 min), relevant, recent (within 5 years), complete, and which LPs it showed. Save results in localStorage.

## 5. Phase D: presentation page

Create `presentation.html` and `data/presentation.json` (+ schema):

- **Script** for "How do you fit a big AI model on a small computer? Quantization explained," split into the five recommended sections with target times that total 9 minutes:
  - Hook: a question the audience can picture (a model that needs more memory than the GPU has).
  - What is it: quantization as storing numbers with fewer digits; analogy: saving a RAW photo as a JPEG.
  - Why care: cost, speed, running AI on smaller and cheaper hardware; real-world uses.
  - How it works: FP16 to INT8 to INT4, what precision is lost, how quality is measured; the candidate's ModelScope results; the surprise that INT8 was worse than INT4 on both memory and speed in that setup.
  - Call to action: "Before you buy a bigger GPU, benchmark a smaller number format," with one concrete first step.
- Write the script as bullet cues, not a full essay, so it can be spoken without reading.
- **One-page handout spec:** a single bar chart of memory by precision from profile.json numbers, the analogy, and the call to action. Build it as a print-ready HTML page (`presentation-handout.html`) with a print stylesheet so it prints cleanly on one Letter page.
- **Q&A prep:** 15 likely audience questions with short answers (Does quantization hurt accuracy? Why was INT8 slower? When would you not quantize? How does this relate to AWS Inferentia or Bedrock? How did you measure quality?).
- **Practice tools:** a 10-minute timer with section markers and warnings at 8:00 and 10:00; a self-score rubric matching the six criteria the recruiter listed; saved run history.
- Add a short "backup topic" outline in case the interviewer redirects: "Why AI agents need a human in the loop," using only non-proprietary, general framing.

## 6. Phase E: mock day

Update `mock.html` to simulate the real day:

- Four 60-minute rounds. Each round: 2 LP questions from the 8 named LPs (2 to 4 minute answers), 1 technical block drawn from the domains (one breadth question, one depth AI/ML question, one "explain it to a non-technical customer" question), and 5 minutes for the candidate's own questions.
- One round must include the 10-minute presentation plus 5 minutes of Q&A.
- Randomize without repeating a question within a day. Keep a self-score per round and a day summary.

## 7. Phase F: a printable final review

- Generate `amazon/FINAL-REVIEW.md` and a print-ready `final-review.html`: one page per domain (top concepts only), the 8 LP story openers, the presentation cue card, and the day-of checklist. This is the night-before and morning-of document.

## 8. Phase G: checks, verification, deploy

- Extend `scripts/check.mjs`: schema-validate every new data file; every domain meets its minimum question count; every question has non-empty `plain` and `technical`; every LP in the 8 has at least two stories; no em or en dashes; no metric outside profile.json; Oracle tenure wording; privacy patterns (emails, phone numbers, street addresses, visa terms) fail the check.
- Add tests for the new renderers and timers in the style of the existing `scripts/test_*.mjs`.
- Run all existing Salesforce and Amazon checks and tests; everything must pass.
- Serve with `python3 -m http.server 8000`. With Playwright (Chromium is preinstalled; do not run `playwright install`), load every Amazon page in light and dark mode at 390 px and 1280 px. Fail on console errors, failed requests, or horizontal overflow. Print-preview the handout and final review to confirm one-page fit.
- Commit in logical commits, push to `main`, confirm the Pages workflow succeeds, and confirm each new page returns 200 on https://anuvik2401.github.io/Resume-Griller/amazon/.

## 9. Final report back to me

- Live URL for every page, new and updated.
- Question counts per domain and total.
- Anything you could not verify, and every `[fill: ...]` I still need to write.
- A 7-day checklist of what to practice each day, pointing to the exact page for each block.
