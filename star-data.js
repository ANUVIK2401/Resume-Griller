/* Pre-written STAR answers for Anuvik Thota's resume bullets.
   Keyed by the exact bullet text from the resume. app.js falls back to
   auto-generation for any bullet not found here. */

const STAR_DATA = [
  {
    bullet: "Architect a production LangGraph multi-agent service on AWS automating client Sage X3 to Sage Intacct ERP financial-data migration; deployed initial production pilot cutting manual reconciliation effort 70% across thousands of GL, AP, and AR records.",
    situation: "A client needed to migrate financial data from Sage X3 to Sage Intacct, and the reconciliation of GL, AP, and AR records was being done manually across thousands of entries.",
    task: "I was asked to architect a production-grade system to automate this ERP migration and reconciliation process.",
    action: "I designed and built a multi-agent service using LangGraph on AWS, breaking the migration into agent tasks that could validate and reconcile records automatically, then deployed an initial pilot into production.",
    result: "The pilot cut manual reconciliation effort by 70% across thousands of GL, AP, and AR records."
  },
  {
    bullet: "Design a multi-stage validation pipeline with confidence-based human-in-the-loop routing that enforces field-level reconciliation and multi-entity, multi-currency integrity, ensuring zero data loss under audit-ready constraints.",
    situation: "The ERP migration touched multiple entities and currencies, and any silent error in field-level data could break audit compliance.",
    task: "I needed to guarantee data integrity end-to-end while still allowing automation to move fast.",
    action: "I designed a multi-stage validation pipeline that scored each record's confidence and routed low-confidence cases to a human reviewer, while enforcing field-level checks across entities and currencies.",
    result: "The pipeline ensured zero data loss and kept the system audit-ready throughout the migration."
  },
  {
    bullet: "Integrate Sage REST APIs with MCP-based agent tooling as sole engineer; translated ERP domain rules into agent task specs and shipped a production multi-agent system, reducing cross-team data-handoff cycles from days to hours.",
    situation: "Cross-team handoffs of ERP data were taking days because there was no automated bridge between Sage's REST APIs and the domain rules different teams relied on.",
    task: "As the sole engineer on this integration, I was responsible for connecting Sage's APIs to the agent tooling and encoding the ERP business rules correctly.",
    action: "I integrated Sage REST APIs with MCP-based agent tooling, translated ERP domain rules into concrete agent task specs, and shipped the resulting multi-agent system to production.",
    result: "Cross-team data-handoff cycles dropped from days to hours."
  },
  {
    bullet: "Redesigned the DQN reward structure and state-action representations to compress the RL training cycle from 6+ hours to 10 minutes, unlocking rapid hyperparameter sweeps.",
    situation: "The reinforcement learning research pipeline had a DQN training cycle that took over 6 hours, which made iterating on hyperparameters extremely slow.",
    task: "I needed to speed up training without losing model quality, since the current pace was blocking research velocity.",
    action: "I redesigned the reward structure and the state-action representations used by the DQN to make the learning signal denser and more efficient.",
    result: "Training time dropped from 6+ hours to 10 minutes, which unlocked rapid hyperparameter sweeps that weren't feasible before."
  },
  {
    bullet: "Profiled worker bottlenecks and restructured a multi-GPU data pipeline, improving agent task completion by 18% over rule-based baselines.",
    situation: "The multi-GPU training pipeline had worker-level bottlenecks that were limiting how well the RL agent could perform against rule-based baselines.",
    task: "I was tasked with diagnosing the bottleneck and improving pipeline throughput to improve agent performance.",
    action: "I profiled the data pipeline to find where GPU workers were stalling, then restructured the pipeline to remove those bottlenecks.",
    result: "Agent task completion improved 18% over rule-based baselines."
  },
  {
    bullet: "Built a distributed experiment-tracking service with a REST API and SQL-backed telemetry logging concurrent metrics across 5+ parallel GPU runs, eliminating 8+ hours/week of manual log aggregation.",
    situation: "Researchers were running 5+ parallel GPU experiments but had to manually pull and aggregate logs from each run, costing significant time every week.",
    task: "I set out to build a service that could track and log metrics from all concurrent runs automatically.",
    action: "I built a distributed experiment-tracking service with a REST API and SQL-backed telemetry storage that logged metrics from all parallel GPU runs in real time.",
    result: "This eliminated more than 8 hours per week of manual log aggregation."
  },
  {
    bullet: "Developed a Prometheus/Grafana observability platform for Oracle NSX enforcing CPU, memory, and p99 SLOs across 37,000+ enterprise tenants; drove P1 MTTR from 90 to 25 minutes (72%) with proactive capacity planning.",
    situation: "Oracle NSX served over 37,000 enterprise tenants without a unified way to enforce CPU, memory, and latency SLOs, making P1 incidents slow to diagnose.",
    task: "I was responsible for building an observability platform that could enforce SLOs and speed up incident response.",
    action: "I developed a Prometheus and Grafana-based observability platform that tracked CPU, memory, and p99 latency against SLOs, and used it to drive proactive capacity planning.",
    result: "P1 mean time to resolution dropped from 90 minutes to 25 minutes, a 72% improvement."
  },
  {
    bullet: "Engineered real-time API diagnostics over high-throughput event streams across 1M+ monitored endpoints with automated root-cause tagging on 400/500-series failures, cutting P1 on-call escalations 40% across Oracle NSX production deployments.",
    situation: "On-call engineers were manually digging through high-throughput event streams across more than 1 million endpoints to find the root cause of 400/500-series failures.",
    task: "I needed to build real-time diagnostics that could automatically identify and tag root causes to reduce the on-call burden.",
    action: "I engineered a real-time diagnostics system over the event streams with automated root-cause tagging for 400 and 500-series failures.",
    result: "P1 on-call escalations dropped 40% across Oracle NSX production deployments."
  },
  {
    bullet: "Identified and resolved critical SQL query bottlenecks in Oracle NetSuite search via query-plan analysis and index restructuring, cutting P50 page load latency 30% for 37,000+ enterprise customers.",
    situation: "Oracle NetSuite search was slow for over 37,000 enterprise customers due to inefficient SQL queries.",
    task: "I was asked to find and fix the root cause of the search latency.",
    action: "I analyzed query plans to identify bottlenecks and restructured indexes to make the underlying queries efficient.",
    result: "P50 page load latency dropped 30% for all 37,000+ enterprise customers."
  },
  {
    bullet: "Delivered a production CLI toolchain adopted by 4 engineering teams across Oracle NSX with Jenkins CI/CD and scripted pre-deployment validation; trimmed release cycle 35% and recovered 9+ engineering hours weekly.",
    situation: "Engineering teams across Oracle NSX had no standardized way to validate builds before deployment, which slowed down releases and wasted engineering time.",
    task: "I set out to build tooling that would standardize and automate pre-deployment validation across teams.",
    action: "I delivered a CLI toolchain integrated with Jenkins CI/CD that scripted pre-deployment validation, and drove its adoption across 4 engineering teams.",
    result: "Release cycle time dropped 35% and the teams recovered more than 9 engineering hours per week."
  },
  {
    bullet: "Containerized Oracle NSX on OCI via Docker and Kubernetes with HPA driven by custom Prometheus metrics, sustaining p99 SLOs under 2x peak load while cutting infra cost ~25%.",
    situation: "Oracle NSX needed to scale reliably under peak load on OCI while keeping infrastructure costs under control.",
    task: "I was responsible for containerizing the service and making it scale efficiently without breaking SLOs.",
    action: "I containerized Oracle NSX using Docker and Kubernetes on OCI, and configured horizontal pod autoscaling driven by custom Prometheus metrics.",
    result: "The system sustained p99 SLOs under 2x peak load while cutting infrastructure cost by about 25%."
  },
  {
    bullet: "Benchmarked Llama-3.2-3B and Gemma-2-2B across 8 quantization configs (FP16/INT8/INT4/NF4) on a CUDA T4; llama-int4 cut memory from 6128 MB to 2299 MB (62%), sustained 13.75 tok/s at 75ms p50 TTFT, with zero MMLU degradation vs FP16.",
    situation: "I wanted to understand which quantization strategy gave the best memory and speed tradeoff for running LLMs on constrained GPU hardware.",
    task: "I set out to systematically benchmark multiple models and quantization configs on a CUDA T4 GPU.",
    action: "I benchmarked Llama-3.2-3B and Gemma-2-2B across 8 quantization configs (FP16, INT8, INT4, NF4), measuring memory usage, throughput, and accuracy for each.",
    result: "The llama-int4 config cut memory from 6128 MB to 2299 MB (62% reduction), sustained 13.75 tokens/sec at 75ms p50 time-to-first-token, with zero MMLU degradation compared to FP16."
  },
  {
    bullet: "Designed 3-axis Pareto frontier analysis across throughput, memory, and quality; proved INT8 strictly dominated (53% more memory, half the speed, same accuracy) and NF4 degrades MMLU by 41% at identical footprint, making llama-int4 the sole optimal config.",
    situation: "With benchmark data across multiple quantization configs, I needed a rigorous way to determine which configuration was actually best rather than relying on gut feel.",
    task: "I wanted to formally compare configs across all three dimensions that mattered: throughput, memory, and quality.",
    action: "I designed a 3-axis Pareto frontier analysis across throughput, memory, and quality to compare every quantization config on equal footing.",
    result: "The analysis proved INT8 was strictly dominated (53% more memory, half the speed, same accuracy) and that NF4 degraded MMLU by 41% at the same memory footprint, establishing llama-int4 as the sole optimal configuration."
  },
  {
    bullet: "Trained a HeteroRGCN with weighted sampling and focal loss for class imbalance, reaching 92% ROC-AUC and outperforming XGBoost and LightGBM on the full 726K-node graph.",
    situation: "Fraud detection data is heavily class-imbalanced, since fraudulent transactions are rare, which typically hurts model performance.",
    task: "I wanted to build a graph-based model that handled this imbalance better than standard tabular baselines.",
    action: "I trained a HeteroRGCN using weighted sampling and focal loss specifically to address the class imbalance in the full 726K-node graph.",
    result: "The model reached 92% ROC-AUC, outperforming both XGBoost and LightGBM baselines."
  },
  {
    bullet: "Constructed a heterogeneous IEEE-CIS fraud graph of 726K nodes and 19.5M edges across transaction, user, device, and card entities, enabling multi-hop fraud pattern detection across 3-hop relationship chains unavailable to single-node classifiers.",
    situation: "Standard single-node classifiers couldn't see the multi-hop relationships between transactions, users, devices, and cards that often reveal fraud rings.",
    task: "I needed to build a graph representation of this data rich enough to expose those relationship patterns.",
    action: "I constructed a heterogeneous graph from the IEEE-CIS dataset with 726K nodes and 19.5M edges spanning transaction, user, device, and card entities.",
    result: "This enabled multi-hop fraud pattern detection across 3-hop relationship chains that single-node classifiers couldn't see."
  }
];
