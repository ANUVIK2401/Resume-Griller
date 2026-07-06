/* Technical Q&A bank. Add new entries any time — the app picks them up
   automatically. `category` groups questions in the UI; `tags` drive search. */

const TECHNICAL_BANK = [
  // ---- Agents / LangGraph / MCP ----
  {
    category: "Agents & LLM Systems",
    question: "How does LangGraph differ from a plain chain of LLM calls?",
    answer: "LangGraph models the workflow as a graph of nodes and edges with explicit state, so you get branching, loops, and retries instead of a linear pipe. State is a typed object passed between nodes, which makes it possible to checkpoint, resume, and route conditionally (e.g. to a human-in-the-loop node) based on confidence or validation results.",
    tags: ["langgraph", "agents"]
  },
  {
    category: "Agents & LLM Systems",
    question: "What is MCP (Model Context Protocol) and why use it over a custom tool-calling layer?",
    answer: "MCP standardizes how an agent discovers and calls external tools/resources through a client-server protocol, instead of every integration having its own bespoke function-calling schema. It decouples the agent's reasoning loop from tool implementation, so you can swap or add tool servers without touching agent code.",
    tags: ["mcp", "agents"]
  },
  {
    category: "Agents & LLM Systems",
    question: "How do you decide when to route an agent's output to a human reviewer instead of auto-committing it?",
    answer: "Score each decision with a confidence signal — model log-probs, output consistency across retries, or rule-based checks against known-good ranges — and set a threshold below which the item routes to a human queue. The threshold should be tuned against the cost of a false auto-approval versus the cost of reviewer time; log everything routed either way so the threshold can be recalibrated.",
    tags: ["agents", "hitl", "reliability"]
  },
  {
    category: "Agents & LLM Systems",
    question: "How do you prevent an agent from silently corrupting data during an automated migration?",
    answer: "Validate at the field level before any write: type/range checks, cross-entity referential checks, and reconciliation totals that must match pre- and post-migration. Make writes idempotent and reversible, log every transformation with enough detail to replay it, and never let the agent's own confidence be the only gate — pair it with deterministic invariant checks.",
    tags: ["agents", "data-integrity"]
  },

  // ---- Observability / SRE ----
  {
    category: "Observability & SRE",
    question: "Walk through how you'd design SLOs for a multi-tenant service.",
    answer: "Start from user-facing signals (latency, error rate, availability) rather than internal metrics. Define an SLI (e.g. p99 latency under 300ms), set an SLO (e.g. 99.9% of requests meet that over 30 days), and derive an error budget from the gap to 100%. Track burn rate, not just point-in-time breaches, so you can page before the budget is exhausted rather than after.",
    tags: ["sre", "slo", "observability"]
  },
  {
    category: "Observability & SRE",
    question: "How does a burn-rate alert differ from a static threshold alert?",
    answer: "A static threshold fires when a metric crosses a fixed line, with no sense of budget. A burn-rate alert compares how fast you're consuming your error budget against multiple time windows (e.g. 1h and 6h), so it can catch both a sharp spike and a slow leak, and it directly reflects whether you'll actually breach the SLO if the trend continues.",
    tags: ["sre", "slo", "alerting"]
  },
  {
    category: "Observability & SRE",
    question: "You're asked to cut P1 MTTR significantly. What levers do you pull?",
    answer: "Reduce time-to-detect with better alerting (burn rate over static thresholds), reduce time-to-diagnose with automated root-cause tagging and correlated dashboards so on-call isn't manually cross-referencing logs, and reduce time-to-mitigate with runbooks and one-click rollback/scale actions. Proactive capacity planning also prevents a class of P1s from happening at all.",
    tags: ["sre", "mttr", "incident-response"]
  },
  {
    category: "Observability & SRE",
    question: "How would you build automated root-cause tagging for HTTP failures across many endpoints?",
    answer: "Aggregate failures by status code family (4xx vs 5xx), then correlate against deploy timestamps, recent config changes, and dependency health metrics in the same time window. Rule-based tagging works for common patterns (e.g. 5xx spike right after a deploy = likely regression); anomaly detection on the request stream catches novel failure modes rule-based tagging misses.",
    tags: ["observability", "root-cause", "automation"]
  },

  // ---- SQL / Databases ----
  {
    category: "SQL & Databases",
    question: "A query got slow after the table grew. What's your diagnostic process?",
    answer: "Run EXPLAIN (or EXPLAIN ANALYZE) to see the actual query plan — look for sequential scans where an index scan is expected, or a good index that stopped being used because the optimizer's statistics are stale. Check if a composite index matches the actual WHERE/ORDER BY/JOIN columns, and consider whether the query itself is fetching more than it needs (missing LIMIT, unnecessary joins, SELECT *).",
    tags: ["sql", "performance", "indexing"]
  },
  {
    category: "SQL & Databases",
    question: "When does adding an index hurt more than it helps?",
    answer: "Every index adds write overhead (insert/update/delete now maintain the index too) and storage cost. On a write-heavy table, or a table with many indexes already, a new index can slow writes more than it speeds the specific read it targets. Composite indexes on low-cardinality columns often help less than expected because the optimizer can't narrow much with them.",
    tags: ["sql", "indexing", "tradeoffs"]
  },
  {
    category: "SQL & Databases",
    question: "How do you approach schema design for a multi-tenant system with very uneven tenant sizes?",
    answer: "Shared schema with a tenant_id column is simplest and works until a few large tenants create hot partitions or skew query plans for everyone. At that point, consider partitioning by tenant_id, or moving the largest tenants to dedicated schemas/shards, while keeping the application-level query interface identical so the split is transparent to callers.",
    tags: ["sql", "multi-tenant", "schema-design"]
  },
  {
    category: "SQL & Databases",
    question: "Explain the difference between an index scan, an index-only scan, and a sequential scan, and when the optimizer picks each.",
    answer: "A sequential scan reads every row and is cheapest when a large fraction of the table matches the filter. An index scan uses an index to find matching rows, then fetches each from the table — good for selective filters. An index-only scan answers the query entirely from the index without touching the table, which is fastest but only possible when every selected column is in the index.",
    tags: ["sql", "query-plans"]
  },

  // ---- DevOps / Infra ----
  {
    category: "DevOps & Infrastructure",
    question: "How does Horizontal Pod Autoscaling driven by a custom metric differ from CPU-based autoscaling?",
    answer: "CPU-based HPA scales on a proxy that doesn't always track actual load (e.g. an I/O-bound service can have low CPU but be saturated). A custom metric — request queue depth, p99 latency, or a Prometheus-exported business metric — scales on the signal that actually reflects user-facing pressure, which avoids both premature scale-up and under-provisioning during CPU-light but latency-sensitive spikes.",
    tags: ["kubernetes", "autoscaling", "devops"]
  },
  {
    category: "DevOps & Infrastructure",
    question: "What's your strategy for keeping infra cost down while still meeting SLOs under peak load?",
    answer: "Right-size baseline capacity to typical load, not peak, and let autoscaling absorb peaks with a metric that reacts fast enough to avoid SLO violations during scale-up lag. Use cheaper spot/preemptible capacity for stateless, interruption-tolerant workloads, and continuously review whether provisioned resources match actual utilization rather than provisioning once and forgetting.",
    tags: ["cost", "kubernetes", "scaling"]
  },
  {
    category: "DevOps & Infrastructure",
    question: "How do you design a CI/CD pipeline's pre-deployment validation so it catches regressions without slowing every release down?",
    answer: "Tier the checks: fast, cheap checks (lint, unit tests, static analysis) run on every commit; slower checks (integration tests, smoke tests against a staging environment) run pre-merge; the most expensive checks (full load tests) run pre-release or on a schedule. Fail fast on the cheap tier so expensive tiers don't run against code that was already broken.",
    tags: ["ci-cd", "devops", "testing"]
  },

  // ---- ML / LLM ----
  {
    category: "ML & LLM Systems",
    question: "Explain quantization (INT8, INT4, NF4) and the tradeoffs between them.",
    answer: "Quantization reduces the precision used to store model weights, cutting memory and often increasing throughput. INT8 halves memory versus FP16 with usually small accuracy loss. INT4 halves it again but needs a good quantization scheme (like NF4, which is designed around the actual distribution of neural net weights) to avoid larger accuracy drops. The real tradeoff is memory/speed gained versus accuracy lost, and that curve isn't linear — it depends heavily on the specific quantization method, not just the bit width.",
    tags: ["llm", "quantization", "ml"]
  },
  {
    category: "ML & LLM Systems",
    question: "What is a Pareto frontier analysis and why use it to pick a model configuration?",
    answer: "A Pareto frontier is the set of configurations where no other option is strictly better on every axis you care about (e.g. throughput, memory, quality) — improving one metric requires sacrificing another. Plotting configs this way lets you rule out anything strictly dominated (worse on every axis than some other option) and make the remaining tradeoff an explicit, informed choice instead of picking based on a single metric.",
    tags: ["ml", "evaluation", "analysis"]
  },
  {
    category: "ML & LLM Systems",
    question: "How would you design an evaluation to prove a smaller/quantized model is safe to ship over a larger baseline?",
    answer: "Benchmark on a standard general-capability set (like MMLU) as a floor check, but also evaluate on task-specific data that mirrors real production traffic, since general benchmarks can mask regressions in the tasks that actually matter. Measure the full picture — quality, latency (especially time-to-first-token for interactive use), memory, and throughput — because a model that wins on one axis and loses badly on another isn't actually a win.",
    tags: ["ml", "evaluation", "llm"]
  },
  {
    category: "ML & LLM Systems",
    question: "What's the difference between a GNN (like a HeteroRGCN) and a traditional tabular classifier (like XGBoost) for fraud detection?",
    answer: "A tabular classifier treats each transaction as an independent row of features. A GNN represents transactions, users, devices, and cards as a graph and can propagate information across multi-hop relationships — so it can catch a fraud ring where individual transactions look normal in isolation but the relationship pattern (shared device across many new accounts, say) is the actual signal. The cost is more complex data modeling and training infrastructure.",
    tags: ["gnn", "ml", "fraud-detection"]
  },
  {
    category: "ML & LLM Systems",
    question: "How do you handle severe class imbalance when training a fraud/anomaly detection model?",
    answer: "Weighted sampling oversamples the minority class during training so the model doesn't just learn to predict the majority class. Focal loss down-weights the loss contribution of easy, well-classified examples and focuses gradient signal on hard/misclassified ones, which matters a lot when the positive class is rare. Evaluate with ROC-AUC or PR-AUC rather than raw accuracy, since accuracy is misleading under imbalance.",
    tags: ["ml", "class-imbalance", "fraud-detection"]
  },

  // ---- System Design ----
  {
    category: "System Design",
    question: "How would you design a system that migrates financial records between two ERP systems with zero data loss?",
    answer: "Break the migration into idempotent, replayable stages rather than one big transfer. Validate each record at multiple levels — field-level type/range checks, cross-entity referential integrity, and aggregate reconciliation (totals must match before and after). Route anything below a confidence threshold to human review instead of auto-committing, log every transformation for audit, and make the whole pipeline resumable so a failure partway through doesn't require starting over.",
    tags: ["system-design", "data-migration", "reliability"]
  },
  {
    category: "System Design",
    question: "Design an experiment-tracking service for concurrent ML training runs.",
    answer: "A REST API accepts metric writes from each run tagged with a run ID, timestamp, and step; a SQL-backed store handles concurrent writes cleanly since metrics are naturally append-only time series. Batch writes client-side to avoid hammering the API on every training step, and expose a query API that can aggregate/compare metrics across runs for the dashboard, rather than making each run write directly to wherever the dashboard reads from.",
    tags: ["system-design", "ml-infra", "backend"]
  }
];
