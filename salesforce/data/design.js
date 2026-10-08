/* LLD + system design checklist for the Salesforce MTS loop. */
const SF_PAGE = {
  key: 'design',
  sections: [
    {
      title: 'LLD framework (run it every time)',
      intro: 'Graded on clean classes, state handling, extensibility, and tests. Code it in Java or Python.',
      items: [
        { title: '1. Clarify requirements and non-goals', notes: 'Who calls this? Single process or distributed? Persistence needed? Concurrency?', tags: ['lld-method'] },
        { title: '2. Name entities, enums, and interfaces', notes: 'Model state as an enum with an explicit allowed-transition map.', tags: ['lld-method'] },
        { title: '3. Pick patterns on purpose', notes: 'State, Strategy, Observer, Factory, Repository. Say why each one fits.', tags: ['lld-method'] },
        { title: '4. Handle concurrency and failure', notes: 'Locks or atomic ops, idempotency keys, retries, what happens on a crash mid-write.', tags: ['lld-method'] },
        { title: '5. Show tests and extension points', notes: 'Name 3 unit tests. Show how a new state or storage backend plugs in.', tags: ['lld-method'] }
      ]
    },
    {
      title: 'LLD problems',
      items: [
        { title: 'Workflow step state-transition logger', meta: 'Reported 2026', tags: ['lld', 'reported'],
          notes: 'Steps move Pending to Running to Completed or Failed. Validate transitions, append-only event log with timestamps, persist via a repository interface, query history per step and per workflow.',
          anchor: 'MSRcosmos agent pipeline states plus the human-in-the-loop review queue.' },
        { title: 'Incident ticket state machine', tags: ['lld', 'sre'], notes: 'Open, Acknowledged, Mitigated, Resolved, Postmortem. Owner assignment, escalation timers, audit trail.' },
        { title: 'Alert deduplicator and grouper', tags: ['lld', 'sre'], notes: 'Fingerprint alerts by labels, group within a time window, suppress flapping, notify once per group.',
          anchor: 'Oracle alert rules that cut false-positive pages 41%.' },
        { title: 'Rate limiter (token bucket and sliding window)', tags: ['lld'], notes: 'Per-tenant limits behind a Strategy interface. Thread-safe. Discuss moving to Redis.' },
        { title: 'Job scheduler with priorities and retries', tags: ['lld'], notes: 'Priority queue, worker pool, exponential backoff, dead-letter queue. Ties into the reported task-scheduling DSA question.' },
        { title: 'LRU / TTL cache', tags: ['lld'], notes: 'Hash map plus doubly linked list, TTL eviction, pluggable eviction policy.' },
        { title: 'Pub/sub event bus', tags: ['lld'], notes: 'Topics, subscribers, at-least-once delivery, ordering per key.' },
        { title: 'Feature flag service', tags: ['lld'], notes: 'Rules by tenant and percentage rollout, kill switch, cache with invalidation.' }
      ]
    },
    {
      title: 'System design framework',
      items: [
        { title: 'Requirements: functional, non-functional, scale numbers', notes: 'Spend 5 min. Write QPS, data size, latency target, and availability target.', tags: ['sd-method'] },
        { title: 'API and data model', notes: 'Main endpoints and entities before boxes.', tags: ['sd-method'] },
        { title: 'High-level diagram, then the 2 hardest components in depth', tags: ['sd-method'] },
        { title: 'Scaling: partitioning, caching, queues, replication', tags: ['sd-method'] },
        { title: 'Reliability: SLOs, failure modes, observability, rollout', notes: 'Your strongest area. Always close with how you would monitor and alert on it.', tags: ['sd-method'] }
      ]
    },
    {
      title: 'System design problems',
      items: [
        { title: 'AI incident triage agent', meta: 'Highest priority', tags: ['sd', 'ai-sre'],
          notes: 'Alert ingestion, then context retrieval from logs, traces, metrics, and runbooks (RAG), then an agent ranks root-cause hypotheses with tools, a human-in-the-loop gate for remediation, then an RCA draft. Cover evals, hallucination guardrails, cost, and latency.',
          anchor: 'Oracle root cause auto-tagging plus the MSRcosmos HITL confidence threshold.' },
        { title: 'Observability platform: metrics, logs, traces at multi-tenant scale', tags: ['sd', 'sre'],
          notes: 'OTEL collectors, a time-series store, cardinality control, retention tiers, SLO-based alerting.',
          anchor: 'Oracle Prometheus/Grafana over 37K tenants.' },
        { title: 'Real-time notification system for millions of users', meta: 'Reported', tags: ['sd', 'reported'],
          notes: 'Fan-out, per-channel workers, user preferences, dedup, retries, rate limits.' },
        { title: 'Distributed rate limiter', tags: ['sd'], notes: 'Redis token bucket, consistency vs latency, failure behavior when Redis is down.' },
        { title: 'RAG service over internal docs (Vertex AI Search style)', tags: ['sd', 'ai'],
          notes: 'Ingestion, chunking, embeddings, hybrid retrieval, reranking, caching, eval loop, access control per tenant.' },
        { title: 'Multi-cloud deployment platform (CI/CD + canary)', tags: ['sd', 'sre'],
          notes: 'Pre-deploy validation, progressive rollout, automatic rollback on SLO burn.',
          anchor: 'Oracle Jenkins validation, failed deploys 11% to 4%.' },
        { title: 'Metrics ingestion pipeline', tags: ['sd'], notes: 'Kafka, stream processing, downsampling, hot and cold storage.' },
        { title: 'Distributed job scheduler', tags: ['sd'], notes: 'Leader election, sharded queues, exactly-once vs at-least-once.' }
      ]
    },
    {
      title: 'Resources',
      items: [
        { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', tags: ['resource'] },
        { title: 'Google SRE Book (SLOs, alerting, incident response chapters)', url: 'https://sre.google/sre-book/table-of-contents/', tags: ['resource', 'sre'] },
        { title: 'Google SRE Workbook: alerting on SLOs', url: 'https://sre.google/workbook/alerting-on-slos/', tags: ['resource', 'sre'] },
        { title: 'OpenTelemetry concepts', url: 'https://opentelemetry.io/docs/concepts/', tags: ['resource', 'sre'] },
        { title: 'Refactoring Guru design patterns (for LLD)', url: 'https://refactoring.guru/design-patterns', tags: ['resource', 'lld'] },
        { title: 'Istio concepts (service mesh)', url: 'https://istio.io/latest/docs/concepts/', tags: ['resource'] },
        { title: 'ByteByteGo blog', url: 'https://blog.bytebytego.com/', tags: ['resource'] }
      ]
    }
  ]
};
