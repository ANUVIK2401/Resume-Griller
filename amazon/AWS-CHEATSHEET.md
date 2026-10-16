# AWS Solutions Architect interview cheatsheet

Verified against linked official AWS documentation: 2026-10-15.

Two-week Amazon Solutions Architect rehearsal: explain the customer decision, tradeoff, failure mode and validation before naming more services.

Your OCI and Databricks work is actual experience only where supported by your resume and confirmed details. Every AWS architecture below is a hypothetical translation or practice design, not evidence you deployed it. Say: In my OCI work I did X; on AWS I would evaluate Y because Z. A completed lab is a lab, not production AWS experience.

## How to answer

1. Clarify the customer outcome, workload shape, existing estate and constraints.
2. State measurable requirements: throughput, p95/p99 latency, availability, RPO/RTO, compliance and budget.
3. Draw the simplest viable data flow; explain why each component earns its place.
4. Compare one credible alternative and make the cost, reliability and operational tradeoff explicit.
5. Walk through a failure, detection, recovery and validation experiment; agree the next customer step.

## P0: Must explain without notes

Days 1-7, then daily retrieval practice. Master these before expanding breadth.

### VPC, subnets, routes, IGW and NAT

- Choose: Trace DNS, route table, security controls and return traffic. A public subnet has an internet-gateway route; an IPv4 instance also needs a public address for direct internet access.
- Tradeoff: Use public ingress with private application/data tiers. NAT supplies outbound IPv4 connectivity, with a cost and availability design to justify.
- Failure: A private subnet does not automatically have internet access. Check routes, NAT connectivity, DNS and security rules separately.
- Say: I would draw the complete packet path and isolate the first failed hop before changing firewall rules.
- Probe: Can the private worker download a package, and what happens if its egress path fails?

Sources: [VPC internet gateway](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html), [NAT gateway](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html)

### Security groups, NACLs and private endpoints

- Choose: Security groups are stateful allow controls on associated resources; NACLs are stateless subnet controls with allow and deny rules.
- Tradeoff: Use security groups as the main workload boundary; add subnet controls for a specific requirement. Endpoints solve service connectivity, not all authorization.
- Failure: A restrictive NACL can block return traffic. A private endpoint policy can still deny a request allowed by a role.
- Say: I would allow the application security group to reach the database port and test both the route and permissions.
- Probe: Why can a TCP connection fail even when the destination security group allows it?

Sources: [Security groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html), [Network ACLs](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html), [Gateway endpoints](https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html)

### IAM roles, least privilege and Organizations

- Choose: Use temporary role credentials, workload identities and narrowly scoped actions/resources. Applicable explicit denies override allows; trust policy and permissions answer different questions.
- Tradeoff: SCPs set an organization permission ceiling; they do not grant access. Identity, resource, key, boundary and organization policies interact.
- Failure: An AdministratorAccess policy does not bypass an applicable explicit deny. Cross-account access also needs the correct trust/resource side.
- Say: I would identify the principal, action, resource and request conditions, then evaluate the applicable policies.
- Probe: Why does an assumed role still receive AccessDenied?

Sources: [IAM policy evaluation](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)

### EC2, Lambda and ECS on Fargate

- Choose: Use EC2 for host control, Lambda for suitable event-driven functions, ECS on Fargate for managed container processes.
- Tradeoff: Compare startup latency, invocation/runtime constraints, sustained utilization, dependencies and team ownership. Serverless still needs scaling and cost controls.
- Failure: Unbounded compute scaling can overload a database or downstream API. Set concurrency/backpressure and test realistic bursts.
- Say: For this workload I would compare a function against a container using its execution shape and operational constraints.
- Probe: What changes if the job becomes continuous or latency-sensitive?

Sources: [Fargate or Lambda decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/fargate-or-lambda.html)

### ALB, NLB, API Gateway and CloudFront

- Choose: ALB fits HTTP application routing; NLB fits transport-layer load balancing. Discuss API management and edge caching as separate needs.
- Tradeoff: Pick ingress from protocol, authentication, caching and latency requirements. Avoid stacking services without a customer benefit.
- Failure: Healthy load balancer targets can still fail customer requests if a dependency is unhealthy; test meaningful health checks.
- Say: I would first ask whether this is a web application, a managed public API or a TCP service.
- Probe: Where does TLS terminate and which component owns authentication?

Sources: [Elastic Load Balancing](https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html)

### S3, EBS and EFS

- Choose: Choose S3 for objects, EBS for block storage attached to compute and EFS for shared file access. Start with the access protocol.
- Tradeoff: Compare sharing, latency, durability/recovery, lifecycle and access cost. S3 is not a drop-in POSIX filesystem.
- Failure: A volume or mounted path is not a backup strategy. Test restore and permissions rather than relying on the storage label.
- Say: I would ask whether the application needs object APIs, a block device or shared file semantics.
- Probe: How would you move an application that requires a shared filesystem?

Sources: [Storage decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/choosing-aws-storage-service.html)

### S3 access, consistency, lifecycle and recovery

- Choose: S3 provides strong consistency for object PUT/DELETE and subsequent reads. Keep buckets private and grant only required access.
- Tradeoff: Separate storage durability from versioning, retention and recovery needs. Lifecycle choices trade retrieval behavior and cost against access patterns.
- Failure: A valid but unwanted overwrite or delete requires recovery controls; strong consistency does not undo application mistakes.
- Say: I would validate access boundaries and rehearse restoring the required object version.
- Probe: Does strong consistency remove the need for versioning or backups?

Sources: [Amazon S3 overview](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)

### RDS/Aurora versus DynamoDB

- Choose: Use relational engines for relational transactions and query flexibility; consider DynamoDB for designed key-value/document access patterns.
- Tradeoff: For DynamoDB, explain partition/access-pattern design. For relational systems, explain connections, indexing and query/load behavior.
- Failure: A hot key or inefficient query can defeat capacity planning. Test skewed traffic and realistic queries.
- Say: I would choose the data model from the reads, writes, transactions and consistency requirements.
- Probe: What new access pattern would cause you to reconsider this choice?

Sources: [Aurora and DynamoDB comparison](https://aws.amazon.com/compare/aurora-and-dynamodb/)

### Multi-AZ, read replicas and backups

- Choose: An RDS Multi-AZ DB instance standby serves failover, not reads. Read replicas address read scaling; backups address recovery.
- Tradeoff: Distinguish DB instance deployments from Multi-AZ DB clusters and Aurora. Replica lag and failover behavior depend on the chosen topology.
- Failure: An application must reconnect after failover; a read replica may return stale data. Neither feature replaces tested backups.
- Say: I would clarify whether the customer needs availability, read throughput or recovery before proposing replication.
- Probe: Can we serve reports from the standby, and what changes with a Multi-AZ DB cluster?

Sources: [RDS Multi-AZ DB instance deployments](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZSingleStandby.html), [RDS FAQs and read replicas](https://aws.amazon.com/rds/faqs/)

### SQS, retries, DLQs and idempotency

- Choose: Use SQS to buffer work and decouple consumers. Receive hides a message; delete after successful processing.
- Tradeoff: Tune visibility to processing time and retries; a longer timeout delays recovery. DLQs need alarms, investigation and controlled redrive.
- Failure: The worker can commit a side effect then crash before deletion. Use a durable idempotency strategy for business effects.
- Say: I would make duplicate delivery safe and monitor queue age alongside the dead-letter queue.
- Probe: What happens if a payment succeeds but the worker crashes before acknowledging?

Sources: [SQS visibility timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html), [SQS at-least-once delivery](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html)

### Availability, RPO/RTO and disaster recovery

- Choose: Start with tolerable data loss (RPO) and restoration time (RTO). Multi-AZ addresses zonal resilience; regional DR is a separate decision.
- Tradeoff: Compare backup/restore, pilot light, warm standby and active/active against recovery objectives and complexity.
- Failure: Replication can propagate corruption; failover also needs data, identity, routing and dependency readiness.
- Say: I would agree the recovery objectives, then prove them with a measured restore or failover drill.
- Probe: What fails during a regional outage, and how do you prevent split-brain writes?

Sources: [Disaster recovery options](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html)

### Unit economics, right-sizing and cost controls

- Choose: Estimate cost per customer transaction or workload unit using measured demand, service usage and data movement.
- Tradeoff: Reduce waste before committing spend. Compare managed-service labor savings with runtime, storage, request, logging and transfer costs.
- Failure: A cheaper compute rate can be outweighed by idle capacity or transfer. A budget alert does not instantly stop spend.
- Say: I would baseline usage and cost, make one change, and validate performance plus unit cost.
- Probe: Which assumptions dominate the estimate and how will we validate them?

Sources: [Cost Optimization pillar](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html), [AWS Budgets and billing delays](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html)

### KMS, Secrets Manager and encryption boundaries

- Choose: KMS manages cryptographic keys; Secrets Manager handles secret storage/retrieval and rotation. Use TLS in transit plus the required at-rest controls.
- Tradeoff: Compare managed versus customer-managed keys from audit, separation of duties and lifecycle requirements. Encryption is distinct from authorization.
- Failure: A role may read a resource but lack decrypt permission; a rotated credential can break clients that never refresh it.
- Say: I would trace both data access and key access and rehearse credential rotation with the application owner.
- Probe: Why can an application read encrypted data yesterday but receive a decryption error today?

Sources: [AWS KMS](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html), [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html), [IAM policy evaluation](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)

## P1: Working fluency

Days 6-11. Tie these to a customer scenario and one failure drill.

### SNS, EventBridge, Kinesis and Step Functions

- Choose: SNS supports fanout; EventBridge routes events by rules; Kinesis retains a stream for consumers/replay; Step Functions models workflow coordination.
- Tradeoff: Choose work queue, pub/sub, event routing, stream or orchestration from semantics. Persistence/replay features are configuration- and service-specific.
- Failure: A routing service does not eliminate downstream retries or duplicates. Ordering is scoped, never assume global ordering.
- Say: I would separate the need to distribute an event from the need to buffer work and coordinate a workflow.
- Probe: Can independent consumers replay history, and who tracks a multi-step business process?

Sources: [SQS, SNS and EventBridge decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/sns-or-sqs-or-eventbridge.html), [Kinesis Data Streams concepts](https://docs.aws.amazon.com/streams/latest/dev/key-concepts.html)

### CloudWatch, CloudTrail, Config and runbooks

- Choose: CloudWatch supports operational telemetry; CloudTrail records account/API activity; Config tracks resource configuration/compliance.
- Tradeoff: Use customer-facing SLOs plus dependency metrics. Audit logs and operational logs answer different questions.
- Failure: High CPU alone does not identify the customer impact. Correlate request IDs, latency, errors and recent changes.
- Say: I would start from the customer symptom, compare against the baseline and follow the failing dependency.
- Probe: Which evidence tells you who changed a resource versus why requests are slow?

Sources: [Management and governance services](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/management-governance.html)

### Migration strategy, DMS and DataSync

- Choose: Assess dependencies and choose a migration strategy before tools. Evaluate DMS for supported database migration/CDC and DataSync for supported data transfer.
- Tradeoff: Rehosting can reduce initial change; replatforming/refactoring may improve operations but increases testing and delivery risk.
- Failure: A copy completing does not prove a cutover works. Reconcile data, test dependencies and define rollback plus write ownership.
- Say: I would propose a representative pilot with success criteria, cutover rehearsal and an explicit rollback trigger.
- Probe: What if the source continues receiving writes during migration?

Sources: [Migration decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/migration-on-aws-how-to-choose.html)

### Bedrock, RAG, evaluation and guardrails

- Choose: For a knowledge assistant, evaluate retrieval-grounded generation with Bedrock and Knowledge Bases against the customer task.
- Tradeoff: Evaluate retrieval quality, groundedness, latency and cost on a representative test set. RAG and fine-tuning solve different needs.
- Failure: Retrieved text may carry prompt injection or stale content. Enforce authorization before retrieval and treat model output as untrusted.
- Say: I would build an evaluation set, test retrieval and citations, and define escalation for uncertain answers.
- Probe: How will you prevent one tenant from retrieving another tenant's documents?

Sources: [Bedrock Knowledge Bases](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html), [Bedrock Guardrails](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html)

### GenAI data handling and shared responsibility

- Choose: For standard Bedrock model inference, AWS documentation describes isolation from model providers. Review the exact model, feature and data path before promising data handling.
- Tradeoff: Application logs, knowledge stores, tool calls and external integrations have their own permissions and retention choices.
- Failure: A secure model endpoint does not stop sensitive prompts being written to an application log or sent to an external tool.
- Say: I would inventory where prompts, retrieved content, outputs and logs travel and apply the customer's data policy.
- Probe: Which components can retain customer content and who can read it?

Sources: [Bedrock data protection](https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html)

### CloudFront, WAF and protected origins

- Choose: CloudFront distributes content through edge locations; WAF applies HTTP/HTTPS request rules to supported protected resources.
- Tradeoff: Choose cache keys and freshness deliberately; evaluate WAF rules with observed traffic. Edge protection complements origin and application controls.
- Failure: Caching personalized content with an unsafe cache key can disclose data. A public alternate origin path can bypass intended controls.
- Say: I would define cacheable content and test isolation, freshness and the origin access path.
- Probe: What would you cache, and how would you avoid returning one user's content to another?

Sources: [Amazon CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html), [AWS WAF and Shield](https://docs.aws.amazon.com/waf/latest/developerguide/what-is-aws-waf.html)

### ElastiCache and cache-aside

- Choose: Evaluate an in-memory cache for measured hot reads or suitable ephemeral data; retain a clear source of truth.
- Tradeoff: Define TTL, invalidation, eviction and acceptable staleness. A cache adds operational and consistency decisions even when managed.
- Failure: A cold cache or synchronized expiry can stampede the database. Use bounded concurrency and a controlled refill plan.
- Say: I would prove that caching improves the hot path and test how the database behaves when the cache disappears.
- Probe: Which reads may be stale, and what happens when the cache is empty?

Sources: [Amazon ElastiCache](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html)

### Glue, Athena, Redshift and data governance

- Choose: Evaluate Glue for catalog/ETL, Athena for querying S3 data, and Redshift for warehouse analytics using the actual workload.
- Tradeoff: Compare data freshness, query concurrency, file layout, performance and governance. Keep the AWS version of Databricks work explicitly hypothetical.
- Failure: A successful ETL run can publish wrong data. Validate schemas, quality and reconciliation before downstream consumption.
- Say: I would benchmark representative queries and establish data-quality gates before choosing the platform.
- Probe: Which customer requirement favors a warehouse over ad hoc lake queries?

Sources: [AWS analytics decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/analytics-on-aws-how-to-choose.html)

## P2: Targeted awareness

Days 10-12, only after P0 is fluent. Deepen if the job description or recruiter emphasizes it.

### Hybrid connectivity and network scale

- Choose: Know the questions for VPN, Direct Connect, peering, Transit Gateway and private service access: bandwidth, resilience, routing and overlapping address space.
- Tradeoff: Treat dedicated connectivity and encryption as separate requirements. Compare topology and operations before adding network hubs.
- Failure: An apparently redundant design can share a failure dependency. Validate routes and the actual failover path.
- Say: I would document connectivity assumptions and test a single-link failure with the networking team.
- Probe: Which dependency remains common to both connectivity paths?

Sources: [VPC connectivity options](https://docs.aws.amazon.com/whitepapers/latest/aws-vpc-connectivity-options/introduction.html), [Gateway endpoints](https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html)

### ECS versus EKS

- Choose: EKS provides managed Kubernetes; evaluate it when Kubernetes APIs, ecosystem or existing skills are a real requirement. ECS offers an AWS-native orchestration path.
- Tradeoff: Compare team expertise, platform operations, portability needs and integration burden before choosing an orchestrator.
- Failure: A managed control plane does not mean application health, networking, permissions and capacity operate themselves.
- Say: I would ask what requires Kubernetes and who will own the platform before selecting EKS.
- Probe: How does the customer benefit from Kubernetes enough to justify its operational model?

Sources: [Amazon EKS](https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html), [Fargate or Lambda decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/fargate-or-lambda.html)

## Comparison traps

### Security group vs NACL

Stateful resource-level allow rules vs stateless subnet-level allow/deny rules.

Trap: A NACL needs return-path rules; adding an allow security group does not override a NACL deny.

Sources: [Security groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html), [Network ACLs](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html)

### IGW vs NAT gateway

IGW is an internet routing component; a public NAT gateway enables outbound IPv4 from private workloads.

Trap: A public subnet route alone does not give every IPv4 resource internet connectivity.

Sources: [VPC internet gateway](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html), [NAT gateway](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html)

### Gateway endpoint vs NAT

S3/DynamoDB gateway endpoints provide service routes; NAT handles broader outbound internet paths.

Trap: A gateway endpoint is not generic internet access or a blanket authorization grant.

Sources: [Gateway endpoints](https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html), [NAT gateway](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html)

### Lambda vs Fargate

Event-driven functions vs container processes: compare execution shape, runtime needs and operations.

Trap: Serverless does not mean infinite concurrency or zero cost when idle in every configuration.

Sources: [Fargate or Lambda decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/fargate-or-lambda.html)

### ALB vs NLB

Choose application-layer HTTP routing vs transport-layer balancing from the protocol requirement.

Trap: A load balancer is not the same as an API-management or edge-cache product.

Sources: [Elastic Load Balancing](https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html)

### S3 vs EFS vs EBS

Object APIs vs shared files vs block devices.

Trap: Do not choose storage only by capacity or treat S3 as POSIX.

Sources: [Storage decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/choosing-aws-storage-service.html)

### Multi-AZ vs read replica

For RDS DB instances, synchronous standby supports HA; read replicas support read scaling.

Trap: A Multi-AZ DB cluster has different read behavior; name the deployment type.

Sources: [RDS Multi-AZ DB instance deployments](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZSingleStandby.html), [RDS FAQs and read replicas](https://aws.amazon.com/rds/faqs/)

### Aurora/RDS vs DynamoDB

Relational query/transaction needs vs designed key-value/document access patterns.

Trap: NoSQL does not remove data modeling or automatically solve hot keys.

Sources: [Aurora and DynamoDB comparison](https://aws.amazon.com/compare/aurora-and-dynamodb/)

### SQS vs SNS

Buffered work for consumers vs pub/sub fanout; SNS to separate SQS queues can combine them.

Trap: One SQS queue with multiple consumers distributes work, not a copy to each application.

Sources: [SQS, SNS and EventBridge decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/sns-or-sqs-or-eventbridge.html)

### Standard vs FIFO queues

Standard tolerates duplicates and relaxed order; FIFO adds scoped ordering and deduplication semantics.

Trap: FIFO does not make external side effects transactional; retries after consumer failure still need idempotency.

Sources: [SQS visibility timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html), [SQS at-least-once delivery](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html)

### EventBridge vs Kinesis

Event routing by rules vs a retained stream processed by independent consumers.

Trap: Ask about ordering, retention and replay rather than calling every event flow streaming.

Sources: [SQS, SNS and EventBridge decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/sns-or-sqs-or-eventbridge.html), [Kinesis Data Streams concepts](https://docs.aws.amazon.com/streams/latest/dev/key-concepts.html)

### High availability vs DR vs backup

Survive a component/zonal failure vs recover from a larger disaster vs restore a recoverable data point.

Trap: Replication alone does not protect against propagated application corruption.

Sources: [Disaster recovery options](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html)

### CloudWatch vs CloudTrail vs Config

Operational telemetry vs account/API activity vs configuration/compliance state.

Trap: A log of who changed a setting is different from request tracing and application latency.

Sources: [Management and governance services](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/management-governance.html)

### RAG vs fine-tuning

Retrieve relevant knowledge at inference vs adjust model behavior using training examples.

Trap: RAG still requires authorization, document quality and evaluation; citations can be wrong.

Sources: [Bedrock Knowledge Bases](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html), [Bedrock Guardrails](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html)

### Secrets Manager vs Parameter Store

Purpose-built secret lifecycle and rotation vs centralized named configuration, including encrypted SecureString values.

Trap: Encryption alone does not supply a rotation workflow. Choose from secret lifecycle and configuration needs.

Sources: [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html), [Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)

### WAF vs security groups

HTTP request inspection/rules vs stateful network allow controls for associated resources.

Trap: WAF rules do not replace authentication, authorization, patched code or origin network boundaries.

Sources: [AWS WAF and Shield](https://docs.aws.amazon.com/waf/latest/developerguide/what-is-aws-waf.html), [Security groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html)

## Customer architecture walkthroughs

All walkthroughs are hypothetical practice. Service selections require workload validation.

### Customer web application

A retailer needs an application that handles promotions without losing orders.

Ask first:

- What is peak traffic, acceptable checkout latency and the business impact of failure?
- Which transactions require consistency, and what are the RPO/RTO targets?
- What team operates it, what must remain on premises, and what is the budget?

Proposed flow:

1. Browser to DNS/edge layer; use an ALB for HTTP application routing where appropriate.
2. Application containers on ECS/Fargate across AZs, with private data access and scoped workload roles.
3. Use relational storage for order transactions if the model requires it; publish asynchronous work through a reliable handoff to SQS.

Tradeoff: Compare containers with a serverless API. Add caches only for a measured read problem and define invalidation. A database outbox can help avoid a commit/publish gap.

Failure drill: The database fails over during checkout: explain reconnects, bounded retries and an idempotent order request without charging twice.

Validate: Measure checkout success and tail latency during burst and failover tests; verify order reconciliation and recovery objectives.

Sources: [Fargate or Lambda decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/fargate-or-lambda.html), [Elastic Load Balancing](https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html), [Aurora and DynamoDB comparison](https://aws.amazon.com/compare/aurora-and-dynamodb/), [RDS Multi-AZ DB instance deployments](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZSingleStandby.html), [SQS visibility timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html), [Disaster recovery options](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html)

### Customer data platform

A customer has batch files and growing analytics demand; relate this to Databricks only as a hypothetical AWS design.

Ask first:

- What are volume, freshness, schema and data-quality expectations?
- Which datasets contain sensitive fields, and who may query them?
- Is this batch analytics, transaction processing or real-time decisioning?

Proposed flow:

1. Land immutable source objects in private S3 storage with recovery and retention controls.
2. Evaluate Glue/Spark processing for transformations and a catalog/governance layer suited to the customer.
3. Evaluate Athena for ad hoc S3 queries or Redshift for a warehouse workload; choose from query concurrency and performance needs.

Tradeoff: A managed lake pattern and a warehouse have different operational and performance tradeoffs. Benchmark the representative queries rather than claiming one is always cheaper.

Failure drill: A batch is delivered twice and late: show idempotent partition processing, quality gates and how consumers discover corrected data.

Validate: Replay a small synthetic dataset; compare row counts, quality checks, freshness and cost per successful pipeline run.

Sources: [Amazon S3 overview](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html), [Storage decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/choosing-aws-storage-service.html), [Cost Optimization pillar](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html), [AWS analytics decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/analytics-on-aws-how-to-choose.html)

### Customer Oracle migration

A customer wants to reduce infrastructure management while preserving business continuity.

Ask first:

- Which Oracle features, licensing obligations and application dependencies must remain compatible?
- How much downtime and data loss are acceptable, and can the application change?
- What makes rollback possible after the target starts accepting writes?

Proposed flow:

1. Assess compatibility and select rehost, replatform or refactor for the workload.
2. Pilot a supported target and migration tool; evaluate DMS replication with validation where suitable.
3. Rehearse cutover: drain/coordinate writes, verify replication and reconciliation, switch the application, observe and make a deliberate rollback decision.

Tradeoff: Preserving the engine can reduce change; moving engines can require schema and application changes. Migration replication does not perform every conversion automatically.

Failure drill: Replication lag rises before cutover: delay the switch, protect source write ownership and use agreed go/no-go criteria.

Validate: Prove representative transaction behavior, data reconciliation, cutover time and recovery in a rehearsal.

Sources: [Migration decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/migration-on-aws-how-to-choose.html), [Aurora and DynamoDB comparison](https://aws.amazon.com/compare/aurora-and-dynamodb/), [Disaster recovery options](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html)

### Customer document assistant

A company wants answers from its internal documents with traceable evidence.

Ask first:

- Who can see which documents, and is multi-tenant isolation required?
- What are answer-quality, latency and cost goals, and when should it refuse or escalate?
- Where may source content, prompts, embeddings and logs be stored?

Proposed flow:

1. Authenticate the user; map identity to authorized document scopes before retrieval.
2. Store approved source documents, chunk/index with an evaluated retrieval pipeline or Bedrock Knowledge Bases.
3. Invoke an approved model with retrieved context; validate output, show source evidence and record safe operational metrics.

Tradeoff: Compare a retrieval approach with a simpler keyword search before adding generation. Model selection follows measured quality, latency, data controls and cost.

Failure drill: A retrieved document says to reveal secrets: treat it as untrusted data, maintain policy boundaries and test adversarial examples.

Validate: Evaluate held-out questions, unsupported answers, cross-tenant access attempts, stale documents and a budgeted latency/cost sample.

Sources: [Bedrock Knowledge Bases](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html), [Bedrock data protection](https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html), [Bedrock Guardrails](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html)

## Optional labs

Labs are optional and are not executed by this preparation site. Prefer the offline exercise if time or billing access is limited. Use a dedicated sandbox, MFA and temporary credentials. Estimate current regional charges first, use synthetic data and a short timer, and inspect every resource after cleanup. AWS Budgets alerts are not a hard spending cap; billing and notifications can lag. No lab requires NAT gateways, paid database instances, EKS clusters, provisioned concurrency, OpenSearch domains or live Bedrock calls.

### Packet-path and IAM tabletop (35 minutes)

Default is offline: no AWS charges. If inspecting an existing sandbox, use read-only access and create nothing.

1. Draw public ingress, private compute and private database subnets; annotate request and response paths.
2. Remove a route, then a security-group rule, then an IAM allow; explain which symptom each produces.
3. Write the least-privilege actions/resources for a worker reading one bucket prefix and consuming one queue.

Offline alternative: Use a local diagram and a policy JSON sketch. Explain explicit-deny and role-trust cases aloud; no account required.

Cleanup:

- Discard any temporary local diagram containing account identifiers.
- If you inspected a sandbox, sign out and verify you created no resources.

Sources: [VPC internet gateway](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html), [Security groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html), [IAM policy evaluation](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)

### Optional SQS receive/retry/delete (40 minutes)

Requests can incur charges. Check current SQS regional pricing and account billing first; use a sandbox and a few synthetic messages only.

1. Create one standard queue with a short, deliberate visibility timeout; record its name and Region.
2. Send one synthetic message, receive without deleting, then wait for visibility expiry and receive again.
3. Delete with the latest receipt handle and explain why business side effects need durable idempotency.

Offline alternative: Simulate a queue using a local list and draw the visible/in-flight/deleted timeline, including a crash after processing.

Cleanup:

- Delete the queue and any manually created test queues or DLQs.
- Check the selected Region for remaining resources; review billing again after usage is processed.

Sources: [SQS visibility timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html), [SQS at-least-once delivery](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html), [AWS Budgets and billing delays](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html)

### Optional private S3 recovery rehearsal (40 minutes)

Storage, requests and versions can incur charges. Use tiny synthetic text files; check current regional charges and do not enable paid add-ons.

1. Create one private test bucket with public access blocked; enable versioning for this rehearsal.
2. Upload a tiny text object, overwrite it, and verify you can retrieve the previous version using its version ID.
3. Explain IAM scope, a delete marker and why versioning is distinct from an immutable backup policy.

Offline alternative: Create two local file versions and a restore manifest, then describe the S3 permissions and recovery steps on paper.

Cleanup:

- Remove every object version and delete marker, then delete the bucket; ordinary object deletion is insufficient in a versioned bucket.
- Delete any additional resources you created and inspect billing after usage is processed.

Sources: [Amazon S3 overview](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html), [AWS Budgets and billing delays](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html), [S3 Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html), [Deleting an S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/delete-bucket.html)

### Offline retrieval and GenAI evaluation (45 minutes)

Default is offline with no model API calls or cloud charges. Live Bedrock/vector-store exercises are outside this lab.

1. Write five synthetic source paragraphs and ten questions, including unanswerable and unauthorized cases.
2. For each question choose allowed evidence and draft the expected answer or escalation; add one prompt-injection paragraph.
3. Score evidence relevance, unsupported claims, permission leakage and refusal quality; explain what you would measure in a future pilot.

Offline alternative: The entire exercise uses local text and a spreadsheet or paper scorecard. No real customer documents or hosted model required.

Cleanup:

- Delete synthetic test material when no longer useful.
- Verify you created no cloud model, index or knowledge-base resources.

Sources: [Bedrock Knowledge Bases](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html), [Bedrock Guardrails](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html), [Bedrock data protection](https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html)

## Official references

- [VPC internet gateway](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html)
- [NAT gateway](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html)
- [Security groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html)
- [Network ACLs](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html)
- [Gateway endpoints](https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html)
- [IAM policy evaluation](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)
- [Fargate or Lambda decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/fargate-or-lambda.html)
- [Elastic Load Balancing](https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html)
- [Storage decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/choosing-aws-storage-service.html)
- [Amazon S3 overview](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)
- [Aurora and DynamoDB comparison](https://aws.amazon.com/compare/aurora-and-dynamodb/)
- [RDS Multi-AZ DB instance deployments](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZSingleStandby.html)
- [RDS FAQs and read replicas](https://aws.amazon.com/rds/faqs/)
- [SQS, SNS and EventBridge decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/sns-or-sqs-or-eventbridge.html)
- [SQS visibility timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html)
- [SQS at-least-once delivery](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html)
- [Kinesis Data Streams concepts](https://docs.aws.amazon.com/streams/latest/dev/key-concepts.html)
- [Disaster recovery options](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html)
- [Management and governance services](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/management-governance.html)
- [Cost Optimization pillar](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html)
- [AWS Budgets and billing delays](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html)
- [Migration decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/migration-on-aws-how-to-choose.html)
- [Bedrock data protection](https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html)
- [Bedrock Knowledge Bases](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html)
- [Bedrock Guardrails](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html)
- [AWS analytics decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/analytics-on-aws-how-to-choose.html)
- [S3 Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html)
- [Deleting an S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/delete-bucket.html)
- [VPC connectivity options](https://docs.aws.amazon.com/whitepapers/latest/aws-vpc-connectivity-options/introduction.html)
- [AWS KMS](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)
- [Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
- [AWS WAF and Shield](https://docs.aws.amazon.com/waf/latest/developerguide/what-is-aws-waf.html)
- [Amazon CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)
- [Amazon ElastiCache](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html)
- [Amazon EKS](https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html)

Use this for decision practice. Confirm Region, feature, pricing, availability and current limits before a real design.
