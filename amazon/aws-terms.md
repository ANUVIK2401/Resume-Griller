# AWS Services and Terminology for the SA Loop

Mental model: **an SA maps a customer problem to a few well-chosen services, then justifies the tradeoff against the Well-Architected pillars.** Know each service in one line, plus when *not* to use it.

## 1. Global infrastructure
- **Region:** a geographic area with multiple AZs. Pick by latency, compliance, service availability, price.
- **Availability Zone (AZ):** one or more isolated data centers in a Region. Multi-AZ = high availability.
- **Edge location:** CloudFront and Route 53 points of presence near users.
- **Local Zones / Wavelength / Outposts:** low latency near a metro, at 5G edge, or AWS hardware on premises.

## 2. Compute
| Service | One line | Pick it when |
|---|---|---|
| EC2 | Virtual servers | Full OS control, steady workloads |
| Auto Scaling Group | Adds or removes EC2 by policy | Variable load, self-healing |
| Lambda | Run code per event, no servers, 15 min max | Spiky, event-driven, short tasks |
| ECS / Fargate | AWS container orchestration; Fargate = no nodes to manage | Containers without Kubernetes overhead |
| EKS | Managed Kubernetes | Team already on Kubernetes, portability |
| Elastic Beanstalk | Managed app platform | Simple web apps, fast start |
| Batch | Managed batch jobs | Large queued compute jobs |

Purchase options: **On-Demand** (flexible), **Reserved / Savings Plans** (1 to 3 year commit, up to large discounts), **Spot** (spare capacity, can be reclaimed, good for fault-tolerant batch).

## 3. Storage
- **S3:** object storage, 11 nines durability. Classes: Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant/Flexible/Deep Archive. Lifecycle policies move data between them. Versioning, replication (CRR/SRR).
- **EBS:** block storage for one EC2 instance in one AZ (gp3, io2). Snapshots go to S3.
- **EFS:** shared NFS file system across many instances and AZs.
- **FSx:** managed Windows, Lustre (HPC), NetApp, OpenZFS.
- **Storage Gateway / DataSync:** hybrid access and online migration. **Snowball:** check current customer eligibility and ordering availability before recommending offline devices.

## 4. Databases
| Need | Service |
|---|---|
| Relational, managed | RDS (MySQL, PostgreSQL, Oracle, SQL Server) |
| High-performance relational | Aurora (up to 15 read replicas, serverless option) |
| Key-value, single-digit ms at any scale | DynamoDB (partition key design, DAX cache, Streams) |
| In-memory cache | ElastiCache (Redis, Memcached), MemoryDB |
| Data warehouse | Redshift |
| Document | DocumentDB |
| Graph | Neptune (good for fraud graphs, see GNN project) |
| Time series | Timestream |
| Search | OpenSearch Service |

- **RDS Multi-AZ DB instance:** primary plus one synchronous standby for failover; the standby does not serve reads. **RDS Multi-AZ DB cluster:** writer plus two readable standbys across three AZs, for supported MySQL/PostgreSQL versions. **Read replicas:** generally asynchronous copies for read scaling. [AWS deployment comparison](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html).

## 5. Networking
- **VPC:** controls networking for resources such as EC2 and RDS. S3, DynamoDB, and default Lambda execution do not require a customer VPC. Add VPC attachment when private access requires it. **Subnet** is public if its route table has a route to an **Internet Gateway**; internet access also needs appropriate addressing and security rules.
- **NAT Gateway:** private subnets reach the internet outbound only.
- **Security Group:** stateful, instance level, allow rules only. **NACL:** stateless, subnet level, allow and deny.
- **VPC Peering** (1 to 1, non-transitive) vs **Transit Gateway** (hub for many VPCs and on-prem).
- **PrivateLink / VPC Endpoints:** reach AWS services without the internet (Gateway endpoints for S3 and DynamoDB).
- **Direct Connect** (dedicated line) vs **Site-to-Site VPN** (encrypted over internet).
- **Load balancers:** ALB (layer 7, HTTP paths/hosts), NLB (layer 4, TCP/UDP, static IP, ultra low latency), GWLB (appliances).
- **Route 53:** DNS. Routing policies: simple, weighted, latency, failover, geolocation, geoproximity, multivalue.
- **CloudFront:** CDN for static and dynamic HTTP content, including uncacheable requests through edge connections. Disable caching for personalized paths unless cache isolation is proven. **Global Accelerator:** static anycast IPs and regional routing for TCP/UDP. [CloudFront cache policies](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html).
- **API Gateway:** managed REST, HTTP, WebSocket APIs with throttling and auth.

## 6. Security and identity
- **Shared responsibility model:** AWS secures the cloud (hardware, facilities); customer secures what is in the cloud (data, IAM, OS patches on EC2).
- **IAM:** users, groups, **roles** (temporary credentials, preferred), policies (JSON, least privilege). **Organizations + SCPs** set guardrails across accounts. **IAM Identity Center** for SSO.
- **KMS:** managed encryption keys. **Secrets Manager** (rotation) vs **Parameter Store**.
- **Encryption:** at rest (KMS) and in transit (TLS, ACM certificates).
- **WAF** (layer 7 rules), **Shield** (DDoS), **GuardDuty** (threat detection), **Inspector** (vulnerabilities), **Macie** (PII in S3), **Security Hub** (aggregates findings), **CloudTrail** (who did what API call), **Config** (resource configuration history and rules).
- **Cognito:** user sign-up and sign-in for apps.

## 7. Integration and serverless
- **SQS:** Standard has at-least-once delivery and best-effort ordering. FIFO orders within each message group and deduplicates sends within a 5-minute window. Use idempotent consumers for both: a crash after charging a card but before deleting a message can repeat processing. Visibility timeout is a processing lease, not an atomic transaction with the payment provider. [SQS visibility timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html).
- **SNS:** pub/sub fan-out. Pattern: SNS to many SQS queues.
- **EventBridge:** event bus with rules, SaaS events, schedules.
- **Step Functions:** orchestrate workflows with retries and state. Good for agent pipelines like S1.
- **Kinesis Data Streams / Firehose:** real-time streaming ingest. **MSK:** managed Kafka.

## 8. Analytics
- **Data lake pattern:** S3 + Glue Data Catalog + Athena (serverless SQL on S3) + Lake Formation (permissions).
- **Glue:** serverless ETL (Spark). **EMR:** managed Spark/Hadoop clusters. **QuickSight:** BI dashboards.

## 9. AI and ML (expect these, given your background)
- **Amazon Bedrock:** managed foundation-model inference with Knowledge Bases (RAG), Agents, Guardrails, and evaluation. Verify the selected model, API, retention policy, invocation logging, and inference profile before making privacy claims. Models run in AWS service deployment accounts; global cross-Region inference can process requests in other supported commercial Regions. [Data protection](https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html), [retention](https://docs.aws.amazon.com/bedrock/latest/userguide/data-retention.html), [global inference](https://docs.aws.amazon.com/bedrock/latest/userguide/global-cross-region-inference.html).
- **RAG permissions:** derive entitlements from trusted authenticated identity server-side; enforce metadata filters on every retrieval and prevent clients from bypassing that layer. Scope answer caches to identity or equivalent authorization, tenant, and document/permission versions. Guardrails are content filters, not document access control; Knowledge Base Guardrails do not apply to retrieved references, so evaluate and authorize sources separately. [Metadata filters](https://docs.aws.amazon.com/bedrock/latest/userguide/kb-test-config.html), [retrieval and generation](https://docs.aws.amazon.com/bedrock/latest/userguide/kb-test-retrieve-generate.html).
- **SageMaker AI:** build, train, tune, deploy your own models. Endpoints (real-time, serverless, async, batch).
- **Amazon Q:** generative AI assistant for business (Q Business) and developers (Q Developer).
- **Purpose-built chips:** **Trainium** (training) and **Inferentia** (inference) for lower cost.
- AI services: Rekognition (vision), Textract (documents), Comprehend (NLP), Transcribe, Polly, Translate, Kendra (enterprise search).
- Verify product names on aws.amazon.com before the loop; AI branding changes often.

## 10. Observability and management
- **CloudWatch:** metrics, logs, alarms, dashboards. **X-Ray:** distributed tracing. **Managed Prometheus / Managed Grafana** map directly to your Oracle work.
- **CloudFormation / CDK:** infrastructure as code. **Systems Manager:** patching, run commands.
- **Trusted Advisor, Cost Explorer, Budgets, Compute Optimizer:** cost and best-practice checks.
- **Control Tower:** multi-account landing zone.

## 11. Frameworks every SA references
- **Well-Architected Framework, 6 pillars:** Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability.
- **Migration 7 Rs:** Retire, Retain, Rehost (lift and shift), Relocate, Repurchase (move to SaaS), Replatform (lift and reshape), Refactor (re-architect). Replacing an ERP with a SaaS product is **Repurchase** with data migration; use your own project details only after verification.
- **Disaster recovery, cheapest to fastest:** Backup and Restore, Pilot Light, Warm Standby, Multi-site Active/Active. Tie to **RPO** (data loss tolerated) and **RTO** (downtime tolerated).
- **Working Backwards / PR-FAQ:** Amazon starts from the customer press release.
- **CAF (Cloud Adoption Framework):** business, people, governance, platform, security, operations perspectives.

## 12. Your resume mapped to AWS (say this out loud)
| You did | AWS equivalent |
|---|---|
| Prometheus/Grafana SLOs | Amazon Managed Prometheus + Managed Grafana, CloudWatch SLOs (Application Signals) |
| Kubernetes on OCI with HPA | EKS with HPA, Karpenter for nodes |
| Jenkins CLI validation | CodePipeline / CodeBuild, or GitHub Actions to AWS |
| Databricks + Delta Lake | Glue / EMR + S3 + Iceberg + Athena |
| Claude + LangGraph agents | Bedrock (Claude) + Step Functions or Bedrock Agents |
| MCP tool calling | Bedrock Agents action groups, Lambda tools |
| HITL review queue | Step Functions task token wait + SQS + A2I |
| NetSuite SQL tuning | RDS / Aurora + CloudWatch Database Insights (check support) |
| GNN fraud graph | Neptune + SageMaker |

## 13. Reliability traps to explain out loud

- **Database plus queue:** commit an order and an outbox event in the same database transaction. A publisher retries sending committed events; idempotent consumers handle duplicate delivery. This closes the database/SQS dual-write gap. [Transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html).
- **DR objectives:** the tier gives a cost and complexity direction. Any example timing is illustrative, not a guaranteed RPO or RTO. Measure DNS, client reconnects, failover approval, replication lag, scaling, and reconciliation during drills. [Define recovery objectives](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_planning_for_recovery_objective_defined_recovery.html).
- **Aurora Global Database:** one primary writer; secondary clusters support reads, and write forwarding still sends changes to the primary. Fence the old writer before promotion and test failback. [Write forwarding](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database-write-forwarding.html), [failover](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database-disaster-recovery.html).
- **Payments across Regions:** eventually consistent DynamoDB global tables do not turn regional conditional writes or transactions into globally atomic deduplication. Use a single authoritative write path, stable payment-provider idempotency keys, a durable ledger, and reconciliation of ambiguous outcomes. Check the chosen global-table consistency mode and its limitations separately. [Global table semantics](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/globaltables_HowItWorks.html).

Technical review date: October 15, 2026. These AWS mappings are proposed architectures; do not present them as AWS production work you performed unless you can substantiate that experience.

Additional current service details: [Snowball customer eligibility](https://docs.aws.amazon.com/snowball/latest/developer-guide/doc-history.html), [ACM exportable certificates](https://docs.aws.amazon.com/acm/latest/userguide/acm-exportable-certificates.html), [CloudWatch Database Insights](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_DatabaseInsights.html).
