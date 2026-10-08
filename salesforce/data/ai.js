/* AI concepts mapped to the Salesforce MTS JD. notes = likely question, anchor = your proof. */
const SF_PAGE = {
  key: 'ai',
  sections: [
    {
      title: 'LLM fundamentals and model tradeoffs',
      intro: 'JD: "You understand the trade-offs between different model architectures and sizes."',
      items: [
        { title: 'Model size vs latency vs cost vs quality', tags: ['llm', 'strong'],
          notes: 'Q: When would you pick a small model over a frontier model for incident triage?',
          anchor: 'ModelScope: INT4 at 62% less memory with MMLU within a point.' },
        { title: 'Quantization: INT8, INT4, NF4', tags: ['llm', 'strong'],
          notes: 'Q: Why was INT8 strictly dominated in your sweep?',
          anchor: 'ModelScope Pareto sweep, INT8 at 53% more memory and 2.1x lower throughput.' },
        { title: 'Context windows, tokens, KV cache, batching', tags: ['llm'],
          notes: 'Q: How do you fit a large log window into context? Summarize, retrieve, or chunk.' },
        { title: 'Hallucination and grounding', tags: ['llm'],
          notes: 'Q: How do you stop an RCA agent from inventing a root cause? Cite retrieved evidence, abstain on low confidence.' },
        { title: 'Structured output and function calling', tags: ['llm', 'agents', 'strong'],
          notes: 'Q: How do you guarantee valid JSON for downstream tools?',
          anchor: 'MSRcosmos MCP tool calling over Sage REST APIs.' },
        { title: 'Gemini on Vertex AI basics', tags: ['llm', 'gcp', 'gap'],
          notes: 'Q: Why might a team pick Gemini for multimodal incident data such as screenshots or dashboards?',
          links: [{ label: 'Vertex AI docs', url: 'https://cloud.google.com/vertex-ai/docs' }] }
      ]
    },
    {
      title: 'Agentic orchestration',
      intro: 'JD: "autonomous agent frameworks (ReAct, LangChain, or custom orchestration) ... multi-step tasks, tool use, and API interaction."',
      items: [
        { title: 'ReAct: reason, act, observe loop', tags: ['agents'],
          notes: 'Q: Walk through a ReAct trace for "why is p99 latency up on service X?"',
          links: [{ label: 'ReAct paper', url: 'https://arxiv.org/abs/2210.03629' }] },
        { title: 'Graph orchestration (LangGraph): state, nodes, checkpoints', tags: ['agents', 'strong'],
          notes: 'Q: Why a graph over a free-running agent loop?',
          anchor: 'MSRcosmos multi-agent ERP migration on LangGraph.',
          links: [{ label: 'LangGraph docs', url: 'https://langchain-ai.github.io/langgraph/' }] },
        { title: 'Multi-agent patterns: supervisor, planner-executor, specialist agents', tags: ['agents'],
          notes: 'Q: When does multi-agent add value, and when is it just more failure points?',
          anchor: 'PacSun retail intelligence app.' },
        { title: 'Tool design and MCP', tags: ['agents', 'strong'],
          notes: 'Q: How do you scope tools so an agent cannot take a destructive action?',
          anchor: 'MCP connectors at MSRcosmos and PacSun.',
          links: [{ label: 'MCP spec', url: 'https://modelcontextprotocol.io/' }] },
        { title: 'Human-in-the-loop and confidence gating', tags: ['agents', 'strong'],
          notes: 'Q: How did you choose the auto-approve threshold?',
          anchor: 'MSRcosmos 83% auto-approved; Trust Lab routing low-confidence cases to experts.' },
        { title: 'Agent failure modes: loops, tool errors, cost blowups', tags: ['agents'],
          notes: 'Q: How do you cap steps, retries, and spend per run?' },
        { title: 'Agent overview reading', tags: ['agents'],
          links: [{ label: 'Lilian Weng: LLM agents', url: 'https://lilianweng.github.io/posts/2023-06-23-agent/' }] }
      ]
    },
    {
      title: 'RAG and vector architectures',
      intro: 'JD: "RAG ... vector database management (Vertex AI Search, Pinecone, or Milvus) and semantic search optimization." Biggest gap: build one small RAG demo.',
      items: [
        { title: 'Chunking strategies: fixed, semantic, structure-aware', tags: ['rag', 'gap'],
          notes: 'Q: How would you chunk runbooks vs logs vs code?' },
        { title: 'Embeddings and similarity metrics', tags: ['rag', 'gap'],
          notes: 'Q: Cosine vs dot product, and when to fine-tune embeddings.' },
        { title: 'ANN indexes: HNSW, IVF, product quantization', tags: ['rag', 'gap'],
          notes: 'Q: Recall vs latency vs memory tradeoff. Links back to your quantization work.' },
        { title: 'Hybrid search (BM25 + vectors) and reranking', tags: ['rag', 'gap'],
          notes: 'Q: Why add keyword search for error codes and stack traces?' },
        { title: 'RAG evaluation: retrieval recall, faithfulness, answer relevance', tags: ['rag', 'evals', 'gap'],
          notes: 'Q: How do you know retrieval, not generation, is the problem?' },
        { title: 'Vector DB options: Vertex AI Search, Pinecone, Milvus, pgvector', tags: ['rag', 'gcp', 'gap'],
          links: [
            { label: 'RAG paper', url: 'https://arxiv.org/abs/2005.11401' },
            { label: 'Vertex AI Search', url: 'https://cloud.google.com/enterprise-search' }
          ] }
      ]
    },
    {
      title: 'Prompt optimization and evals',
      intro: 'JD: "automated prompt optimization and building robust evaluation pipelines (DSPy or RAGAS)."',
      items: [
        { title: 'DSPy: signatures, modules, optimizers', tags: ['evals', 'gap'],
          notes: 'Q: How does DSPy replace hand-tuned prompts with optimized ones against a metric?',
          links: [{ label: 'DSPy', url: 'https://dspy.ai/' }] },
        { title: 'RAGAS metrics', tags: ['evals', 'gap'],
          notes: 'Q: Faithfulness vs context precision vs answer relevancy.',
          links: [{ label: 'RAGAS docs', url: 'https://docs.ragas.io/' }] },
        { title: 'LLM-as-judge and rubric scoring', tags: ['evals', 'strong'],
          notes: 'Q: How do you check the judge is reliable? Agreement with humans, position bias.',
          anchor: 'Trust Lab rubric-based annotation pipeline on Llama 3.3 70B.' },
        { title: 'Benchmark design and regression suites', tags: ['evals', 'strong'],
          notes: 'Q: How would you gate an agent release on eval scores?',
          anchor: 'Trust Lab 6-model Veracity benchmark across 8 trust pillars.' },
        { title: 'Offline vs online evals, golden datasets', tags: ['evals'],
          notes: 'Q: For incident triage, what is your golden set? Past incidents with confirmed RCAs.' }
      ]
    },
    {
      title: 'AIOps and AI SRE (core of this team)',
      intro: 'JD: "AI SRE Tooling to help reduce MTTD/MTTR" and "AIOps ... to automate incident resolutions."',
      items: [
        { title: 'MTTD vs MTTR and where AI cuts each', tags: ['ai-sre', 'strong'],
          notes: 'Q: Anomaly detection shortens MTTD; retrieval plus RCA ranking shortens MTTR.',
          anchor: 'Oracle P1 MTTR 94 to 26 min.' },
        { title: 'Anomaly detection on metrics', tags: ['ai-sre'],
          notes: 'Q: Static thresholds vs seasonal baselines vs ML. How do you control false positives?',
          anchor: 'Oracle move from static thresholds to SLOs.' },
        { title: 'Log clustering and alert correlation', tags: ['ai-sre'],
          notes: 'Q: How do you group 500 alerts into one incident? Topology, time windows, embeddings.' },
        { title: 'Automated RCA and RCA report drafting', tags: ['ai-sre'],
          notes: 'JD says you will write high-quality RCA reports. Q: What goes into a good RCA, and what can an LLM safely draft?' },
        { title: 'Auto-remediation safety: runbooks, blast radius, approvals', tags: ['ai-sre'],
          notes: 'Q: Which actions can an agent take alone? Read-only first, then reversible actions with approval.' },
        { title: 'Developer velocity AI tools', tags: ['ai-sre'],
          notes: 'JD item. Q: What would you build first? Log summarizer, PR risk scorer, flaky test triage.' }
      ]
    },
    {
      title: 'Observability and cloud infra',
      intro: 'JD: Prometheus, Splunk, Grafana, Zipkin, OTEL; Kubernetes and service mesh.',
      items: [
        { title: 'SLIs, SLOs, error budgets, burn-rate alerts', tags: ['infra', 'strong'],
          anchor: 'Oracle SLO-based alerting.',
          links: [{ label: 'SRE Workbook: SLO alerting', url: 'https://sre.google/workbook/alerting-on-slos/' }] },
        { title: 'Distributed tracing: spans, context propagation, sampling', tags: ['infra', 'gap'],
          notes: 'Q: Head vs tail sampling, and why tail sampling helps find errors.',
          links: [{ label: 'OTEL concepts', url: 'https://opentelemetry.io/docs/concepts/' }] },
        { title: 'Metrics cardinality and storage', tags: ['infra'],
          notes: 'Q: How did you keep Prometheus cardinality under control across 37K tenants?' },
        { title: 'Kubernetes: HPA on custom metrics, probes, rollouts', tags: ['infra', 'strong'],
          anchor: 'Oracle NSX on OCI, p99 held at 2x peak.' },
        { title: 'Service mesh: sidecars, mTLS, traffic shifting', tags: ['infra', 'gap'],
          links: [{ label: 'Istio concepts', url: 'https://istio.io/latest/docs/concepts/' }] },
        { title: 'GCP: GKE, Cloud Monitoring, Pub/Sub', tags: ['infra', 'gcp', 'gap'],
          notes: 'Know the GCP names for what you used on OCI and AWS.' }
      ]
    },
    {
      title: 'Salesforce context',
      items: [
        { title: 'Agentforce: what it is and how Gemini fits', tags: ['context'],
          links: [{ label: 'Agentforce', url: 'https://www.salesforce.com/agentforce/' }] },
        { title: 'Salesforce on GCP partnership', tags: ['context'],
          notes: 'Mentioned in the JD. Read the latest announcement so you can speak to it in the hiring manager call.' },
        { title: 'Salesforce Engineering blog: observability and AI posts', url: 'https://engineering.salesforce.com/', tags: ['context'] }
      ]
    }
  ]
};
