# Final review: Amazon SA loop, October 28, 2026

Generated from `data/*.json` by `scripts/print_pages.mjs`. The printable version is [final-review.html](final-review.html).

## The day

Arrive by 9:00 am. Interviews 9:30 am to 2:30 pm, In person, USC campus.

- **9:00 am** Arrive and check in
- **9:30 am** Interview 1, 60 minutes
- **10:30 am** Interview 2, 60 minutes
- **11:30 am** Lunch break, 60 minutes
- **12:30 pm** Interview 3, 60 minutes
- **1:30 pm** Interview 4, 60 minutes
- **2:30 pm** Done

**Bring:**

- [ ] Printed resume, 5 copies
- [ ] Printed presentation handout, 5 copies
- [ ] Printed final review sheet, for lunch only
- [ ] Notebook and pen
- [ ] Water

- No laptop is needed for the presentation. No slides.
- Keep the presentation free of any employer's proprietary information.
- Lunch is 11:30 am to 12:30 pm. Eat, walk, reread the day-of sheet once. Do not cram.
- Track which stories you told in each round so later rounds hear fresh ones.

## Answer rubric

- Use STAR: Situation, Task, Action, Result.
- Speak for 2 to 4 minutes, not 60 to 90 seconds.
- Put a metric in every result.
- Say "I" for your work, not "we".
- Use examples from the last 5 years.
- Each answer should show 4 to 6 Leadership Principles.
- Be ready for "How would you implement this at AWS?" and "What would you do differently?"

## The 8 named LPs: open with

| LP | Lead story | First sentence | Backup |
|---|---|---|---|
| Customer Obsession | S1 Multi-agent ERP migration with human-in-the-loop | I built an ERP migration workflow that cut turnaround from 3 days to 5.5 hours across 12 client entities. | S9 |
| Ownership | S2 P1 MTTR from 94 to 26 minutes | I reduced P1 incident recovery time at Oracle from 94 to 26 minutes by putting diagnostic context in front of on-call engineers. | S12 |
| Bias for Action | S8 DQN training stall, 40% shorter runs | I shortened DQN training runs from 52 to 31 minutes by fixing replay-buffer sampling and a data-loader stall. | S2 |
| Earn Trust | S4 CLI validation toolchain adopted by 4 teams | I shipped a validation toolchain adopted by 4 teams that reduced failed deployments from 11% to 4%. | S1 |
| Learn and Be Curious | S11 ModelScope quantization study | In ModelScope, my INT4 benchmark used 2299 MB and sustained 13.7 tokens per second with MMLU within a point of baseline. | S7 |
| Insist on the Highest Standards | S3 SLO alerting, 41% fewer false pages | I reduced false-positive on-call pages by 41% by improving the observability and alerting approach at Oracle. | S6 |
| Deliver Results | S1 Multi-agent ERP migration with human-in-the-loop | I built an ERP migration workflow that cut turnaround from 3 days to 5.5 hours across 12 client entities. | S4 |
| Dive Deep | S5 NetSuite search latency down 30% | I reduced NetSuite search P50 page-load latency from 840 milliseconds to 588 milliseconds, a 30% reduction. | S8 |

## Presentation cue card: How do you fit a big AI model on a small computer? Quantization explained

**Hook and intro** (0:00 to 1:00): In the next nine minutes I want to show you how to make a big model fit on a small computer, and how to know if it still works.

**What is it** (1:00 to 3:00): Quantization is saving the model as a JPEG instead of a RAW photo: much smaller, almost the same picture.

**Why should we care** (3:00 to 6:00): If the model is smaller, it is cheaper to run, often faster, and it can run in places it could not before.

**How it works** (6:00 to 8:00): In my tests the 4-bit version used 62% less memory than the original and scored within a point on the exam.

**Call to action** (8:00 to 9:00): Before you buy a bigger GPU, benchmark a smaller number format.

**Call to action:** Before you buy a bigger GPU, benchmark a smaller number format.

## AI and machine learning

| Concept | In one line | What they probe |
|---|---|---|
| Overfitting vs underfitting | Overfitting memorizes training data and fails on new data; underfitting is too simple to learn the pattern at all. | High training score with much lower validation score is overfitting; both low is underfitting. |
| Precision vs recall | Precision: of the cases flagged, how many were real. Recall: of the real cases, how many were flagged. | Which error costs the business more decides which one you favor, via the threshold. |
| Class imbalance | When one class is rare (fraud at a few percent), accuracy rewards always predicting the common class. | Use precision, recall, PR-AUC, and evaluate on the real distribution, never a rebalanced one. |
| ROC-AUC | Probability the model scores a random positive above a random negative; 0.5 is chance, 1.0 is perfect. | It is a ranking measure, not accuracy, and can look rosy under heavy imbalance; pair it with PR-AUC. |
| Gradient descent and backprop | Backprop computes how each weight affects the loss; gradient descent nudges every weight downhill by the learning rate. | Epoch is a full pass over data; iteration is one batch update. |
| Attention | Each token scores every other token (query vs key) and takes a weighted blend of their values. | Cost grows with the square of sequence length, which is why long prompts are expensive. |
| Tokens and context window | Tokens are subword pieces the model reads and is billed on; the context window is the max tokens per request, input plus output. | A big context window does not remove the need for RAG: cost, latency, and focus. |
| Temperature | Scales the next-token probabilities: low is focused and repeatable, high is varied and riskier. | Temperature 0 means most likely, not most true; it does not stop hallucination. |
| Embeddings | Vectors that place similar meanings close together so search works by meaning, not keywords. | Queries and documents must use the same embedding model; changing it means re-embedding. |
| RAG | Retrieve relevant chunks from your data and put them in the prompt so the model answers from sources with citations. | Most RAG failures are retrieval failures: check whether the right chunk reached the prompt. |
| RAG vs fine-tuning | RAG supplies knowledge at question time; fine-tuning changes behavior, format, and style. | Fine-tuning does not reliably teach facts and gives no citations; default to prompt, then RAG, then tune. |
| Agents and MCP | An agent is an LLM in a loop that calls tools; MCP is an open standard for connecting models to tools and data. | The model only proposes tool calls; your code executes them, which is where permissions and approvals live. |
| Hallucination | Fluent, confident output that is false, because models predict likely text rather than check facts. | Mitigate with grounding, citations, validation, and human review; it never reaches zero. |
| KV cache and memory-bound decode | Cached keys and values for prior tokens so each new token is cheap; decode is usually limited by memory bandwidth. | KV cache grows with context length and batch size and caps concurrency on a GPU. |
| Quantization | Storing weights in fewer bits (FP16 to INT8 or INT4) to cut memory and often speed up inference. | Always smaller, not always faster: speed depends on kernels and hardware for that format. |

## Networking

| Concept | In one line | What they probe |
|---|---|---|
| OSI vs TCP/IP model | OSI has 7 teaching layers; the real internet runs the 4-layer TCP/IP model (link, internet, transport, application). | Name a protocol at each layer and say which layer a load balancer or firewall works at. |
| TCP vs UDP | TCP is connection-based, ordered, and retransmits lost data; UDP sends independent datagrams with no delivery guarantee. | Why video calls and DNS lean on UDP, and why HTTP/3 builds reliability on top of UDP. |
| Ports | A 16-bit number that picks which program on a host gets the traffic: 443 HTTPS, 80 HTTP, 22 SSH, 53 DNS. | Return traffic uses an ephemeral client port, which matters for stateless NACL rules. |
| HTTP status families | 2xx success, 3xx redirect, 4xx the client asked wrong, 5xx the server failed. | 401 means not authenticated, 403 means authenticated but not allowed; 502 and 504 usually mean the backend behind a proxy failed. |
| TLS 1.3 | Encrypts and authenticates a connection in one round trip using an ephemeral key exchange and the server's certificate. | What the certificate proves (identity) vs what the key exchange provides (secrecy). |
| DNS resolution | Recursive resolver walks root, then TLD, then the authoritative server, and caches the answer for the record's TTL. | Lower the TTL days before a migration, not on the day. |
| CIDR | Address/prefix length: /16 is 65,536 addresses, /24 is 256, each extra bit halves the block. | AWS reserves 5 IPs per subnet, so a /24 gives 251 usable addresses. |
| NAT | Rewrites private source addresses to a public one so private hosts can reach out without being reachable from outside. | In AWS, a public NAT gateway lives in a public subnet and needs an Elastic IP. |
| Stateful vs stateless filtering | Stateful remembers a connection and auto-allows the reply; stateless judges every packet alone. | Security groups are stateful and allow-only; network ACLs are stateless, ordered, and can deny. |
| L4 vs L7 load balancing | L4 balances TCP/UDP connections by address and port; L7 reads HTTP and can route by path, host, or header. | ALB is layer 7, NLB is layer 4 with static IPs and very low latency. |
| Latency vs bandwidth vs throughput | Latency is delay per trip, bandwidth is the pipe's capacity, throughput is what you actually get. | More bandwidth does not fix a chatty app on a high-latency link. |
| Route 53 alias record | A Route 53 extension that points a name, including the zone apex, at an AWS resource and answers with its current IPs. | CNAME cannot sit at the apex; alias can, and alias queries to AWS resources are free. |
| AWS PrivateLink | Exposes one service into another VPC as private IPs (an interface endpoint), with no internet gateway, NAT, or peering. | It shares a service, not a whole network, so overlapping CIDRs are fine. |
| Transit Gateway | A regional hub that connects many VPCs and on-premises networks through attachments and route tables. | VPC peering is non-transitive one-to-one; Transit Gateway is hub and spoke. |

## Databases and analytics

| Concept | In one line | What they probe |
|---|---|---|
| ACID | Atomicity, Consistency, Isolation, Durability: the guarantees a transaction gives. | Atomicity is all-or-nothing; durability is survives a crash after commit. Do not mix them up. |
| Isolation levels | Read uncommitted, read committed, repeatable read, serializable: each blocks more anomalies. | Which anomaly each level allows: dirty, non-repeatable, phantom. |
| B-tree index | A balanced, sorted tree that finds a row in a few page reads instead of scanning the table. | Faster reads, slower writes, extra storage. |
| Composite index | An index on several columns in a fixed order, such as (customer_id, order_date). | Leftmost prefix rule: it helps filters on customer_id, not on order_date alone. |
| Normalization vs denormalization | Store each fact once (normalized) or copy data to avoid joins (denormalized). | Normalize for write correctness, denormalize for read speed. |
| CAP theorem | During a network partition, a distributed system must choose consistency or availability. | It is not pick any two at all times; partitions are not optional. |
| BASE and eventual consistency | Basically available, soft state, eventually consistent: replicas converge over time. | Eventual does not mean wrong; it means a read may briefly be stale. |
| Sync vs async replication | Sync waits for the copy before confirming a write; async confirms first and copies after. | RDS Multi-AZ standby is synchronous; read replicas are asynchronous. |
| Partition key | The value that decides which shard or partition holds a record. | Low-cardinality or skewed keys create hot partitions. |
| Cache-aside vs write-through | Cache-aside loads the cache on a miss; write-through updates cache and database on every write. | Cache-aside can serve stale data; write-through adds write latency. |
| OLTP vs OLAP | OLTP runs many small transactions; OLAP runs big analytical scans over history. | Row storage suits OLTP, columnar suits OLAP. |
| Warehouse, lake, lakehouse | Warehouse: structured and modeled. Lake: raw files in object storage. Lakehouse: lake files with table features like ACID and schema. | Delta Lake, Apache Iceberg, and Apache Hudi are the table formats that make a lakehouse. |
| ETL vs ELT | ETL transforms before loading; ELT loads raw data first and transforms inside the warehouse or lake. | ELT is common now because cloud compute and storage are cheap and elastic. |
| Partition pruning | The engine skips whole partitions whose values cannot match the filter. | Only works if you filter on the partition column. |
| DynamoDB read consistency | Eventually consistent by default; strongly consistent reads are optional on tables and LSIs. | GSIs and streams are always eventually consistent; strong reads cost twice as much. |

## Security

| Concept | In one line | What they probe |
|---|---|---|
| CIA triad | Confidentiality (only the right people see it), integrity (it is not changed silently), availability (it is there when needed). | Name a control for each: encryption for confidentiality, hashing or signatures for integrity, redundancy and DDoS protection for availability. |
| Authentication vs authorization | Authentication proves who you are; authorization decides what you may do. | OIDC is for authentication, OAuth 2.0 is for authorization. A 401 means not authenticated, a 403 means authenticated but not allowed. |
| Hashing vs encryption | Hashing is one-way and fixed length; encryption is two-way with a key. | Passwords are hashed with a slow, salted algorithm, never encrypted. |
| Symmetric vs asymmetric | Symmetric uses one shared key and is fast; asymmetric uses a public and private key pair and is slower. | TLS uses asymmetric crypto to agree on keys, then symmetric crypto for the bulk data. |
| Envelope encryption | Encrypt data with a data key, then encrypt the data key with a KMS key and store it next to the data. | The KMS key never leaves the KMS HSMs unencrypted; only the small data key travels to KMS. |
| Least privilege | Give each person or workload only the permissions it needs, for only as long as it needs them. | Prefer roles with temporary credentials over long-lived access keys. |
| Zero trust | Never trust a request because of where it comes from on the network; verify identity, device, and context on every request. | It does not mean removing the network perimeter; it means the perimeter is no longer the only check. |
| IAM evaluation | Everything starts as an implicit deny; an allow is needed to proceed; any explicit deny anywhere wins. | An explicit deny in an identity policy, resource policy, SCP, or boundary overrides every allow. |
| Service control policy | An AWS Organizations guardrail that caps the maximum permissions of IAM users and roles in member accounts. | SCPs never grant permissions and do not affect the management account or service-linked roles. |
| Shield Standard vs Advanced | Standard is automatic, at no extra charge, against common network and transport layer DDoS; Advanced is a paid tier with more detection, response team access, and cost protection. | Layer 7 floods are handled together with AWS WAF rules. |
| CloudTrail vs Config | CloudTrail records who called which API and when; Config records what each resource looked like over time and checks it against rules. | CloudTrail answers who did it; Config answers what changed and is it compliant. |
| Amazon GuardDuty | Managed threat detection that analyzes CloudTrail management events, VPC Flow Logs, and Route 53 Resolver DNS logs. | You do not have to turn those logs on yourself, and GuardDuty detects; it does not block. |
| Cognito user pool vs identity pool | A user pool signs users in and issues JWTs; an identity pool trades a trusted token for temporary AWS credentials. | User pool answers who is this user; identity pool answers which AWS resources may they reach. |
| Shared responsibility | AWS secures the cloud itself; the customer secures what they put in the cloud. | The line moves with the service: more customer work on EC2, less on Lambda or S3. |

## CS fundamentals and coding concepts

| Concept | In one line | What they probe |
|---|---|---|
| Big-O | How time or memory grows with input size, ignoring constants: O(1), O(log n), O(n), O(n log n), O(n^2). | State time and space separately, and remember Big-O ignores constant factors that still matter in practice. |
| Amortized cost | Average cost per operation over any sequence, such as O(1) list appends despite occasional O(n) resizes. | Amortized is not average case: it is a worst-case guarantee over a whole sequence. |
| Hash map | Key to hash to bucket index, then compare keys; O(1) average for get, put, and delete. | Worst case is O(n) on heavy collisions; resizing keeps the load factor low. |
| Heap / priority queue | Tree in an array where the parent beats its children; peek O(1), push and pop O(log n), build O(n). | Only the root is ordered; top k in O(n log k) with a size-k heap. |
| Balanced BST and B-tree | Ordered tree giving O(log n) search, insert, and delete plus sorted and range queries. | An unbalanced BST on sorted input degrades to O(n); databases use shallow B-trees. |
| BFS vs DFS | BFS goes level by level with a queue; DFS goes deep with a stack. Both O(V + E). | BFS gives shortest paths only on unweighted graphs; weighted needs Dijkstra. |
| DP vs greedy | DP reuses answers to overlapping subproblems; greedy commits to the best local choice. | Greedy fails on coins 1, 3, 4 for amount 6; DP handles it. |
| Quicksort vs merge sort | Quicksort: O(n log n) average, O(n^2) worst, in place. Merge sort: O(n log n) always, stable, O(n) extra. | Name quicksort's worst case and how random pivots or introsort avoid it. |
| SOLID | Single responsibility, open-closed, Liskov substitution, interface segregation, dependency inversion. | Have one concrete example per letter, such as Square versus Rectangle for Liskov. |
| Race condition | Outcome depends on thread timing around shared state, such as count += 1. | The GIL does not make read-modify-write atomic; use a lock or avoid shared state. |
| Deadlock (Coffman) | Needs all four: mutual exclusion, hold and wait, no preemption, circular wait. | Break one; a global lock order removes circular wait. |
| Stack vs heap memory | Stack: per-thread call frames, fast, auto-freed. Heap: dynamic objects, freed manually or by GC. | GC languages still leak through reachable but unused objects. |
| Virtual memory | Per-process address spaces mapped to physical pages through page tables and the TLB. | It is about translation and isolation, not just swap; thrashing when the working set exceeds RAM. |
| CAP and consistency | During a partition choose consistency or availability; models range from linearizable to eventual. | Partition tolerance is not optional; 'pick two' is the wrong framing. |
| Idempotency, backoff, jitter | Retry only idempotent ops on transient errors, with timeouts, capped exponential backoff, and jitter. | Without jitter clients retry in lockstep; without idempotency a retry can double-charge. |

## Application development

| Concept | In one line | What they probe |
|---|---|---|
| CI vs CD | Continuous integration merges and tests every change automatically; continuous delivery keeps every build releasable, and continuous deployment ships it automatically. | Delivery has a human approval before production; deployment does not. |
| Infrastructure as code | Define servers, networks, and permissions in versioned files that a tool applies, instead of clicking in a console. | AWS CDK synthesizes AWS CloudFormation templates; CloudFormation does the actual provisioning. |
| Monolith vs microservices | One deployable unit vs many small services owned by separate teams and deployed independently. | Microservices trade code complexity for operational and network complexity. |
| Idempotency key | A unique client-supplied ID that lets the server recognize a retry and return the original result instead of repeating the action. | Needed because networks retry and SQS standard queues can deliver duplicates. |
| Stateless service | A server that keeps no client session in its own memory, so any instance can handle any request. | Put session state in a shared store such as ElastiCache or DynamoDB, not in sticky sessions. |
| Horizontal vs vertical scaling | Add more machines vs make one machine bigger. | Horizontal needs stateless design but has no single-box ceiling and improves availability. |
| Queue vs pub/sub | A queue hands each message to one consumer; pub/sub copies each message to every subscriber. | SNS to multiple SQS queues is the classic fan-out pattern. |
| SQS standard vs FIFO | Standard: nearly unlimited throughput, at-least-once delivery, best-effort ordering. FIFO: ordering within a message group and exactly-once processing, with lower throughput. | Standard consumers must be idempotent. |
| AWS Lambda limits | Event-driven functions billed per request and duration, with a timeout of 3 seconds by default and 15 minutes maximum. | Long-running jobs belong in Step Functions, ECS, or Fargate. |
| Step Functions Standard vs Express | Standard: up to one year, exactly-once, priced per state transition. Express: up to five minutes, at-least-once (async), priced per execution and duration. | Use Standard for non-idempotent steps like payments. |
| AWS Fargate | Serverless compute for containers on Amazon ECS and Amazon EKS, so you do not manage EC2 instances. | Fargate is not an orchestrator; ECS or EKS still schedules the containers. |
| SLI, SLO, error budget | SLI is the measurement, SLO is the target, and the error budget is the allowed failure, 100% minus the SLO. | A 99.9% monthly SLO allows about 43 minutes of downtime in 30 days. |
| Canary vs blue/green | Canary sends a small slice of traffic to the new version first; blue/green runs two full environments and switches all traffic at once. | Both make rollback a traffic switch instead of a redeploy. |
| API Gateway REST vs HTTP API | REST APIs have more features; HTTP APIs are simpler and lower cost. | API keys, usage plans, request validation, caching, and AWS WAF are REST API features. |

## Cloud computing

| Concept | In one line | What they probe |
|---|---|---|
| Cloud computing | On-demand IT resources over the internet with pay-as-you-go pricing. | Renting electricity from the grid instead of running your own generator. |
| IaaS, PaaS, SaaS | Rent raw servers, rent a platform to run your code, or rent finished software. | Who manages what: the higher the model, the less you manage. |
| Public, private, hybrid, multi-cloud | Shared provider cloud, dedicated cloud, a mix with on-premises, or several providers. | Hybrid mixes on-premises with cloud; multi-cloud means more than one provider. |
| Six advantages of cloud | Variable expense, economies of scale, stop guessing capacity, speed and agility, stop running data centers, go global in minutes. | Name them in AWS's words. |
| Region and Availability Zone | A Region is a geographic area with multiple isolated AZs; an AZ is one or more data centers with separate power and networking. | Spread across AZs for high availability; across Regions for disaster recovery. |
| Edge location | A site close to users that caches content and serves DNS and edge security. | Used by CloudFront, Route 53, and Global Accelerator; you do not run EC2 there. |
| HA vs fault tolerance vs DR | HA: brief blips are OK. Fault tolerance: no visible interruption. DR: recovering from a major disaster. | Fault tolerance costs more than HA because spares are always running. |
| RPO and RTO | RPO: how much data you can lose. RTO: how long you can be down. | RPO looks back to the last good copy, RTO looks forward to recovery. |
| Four DR strategies | Backup and restore, pilot light, warm standby, multi-site active/active: cheapest and slowest to costliest and fastest. | Pilot light cannot serve traffic until switched on; warm standby can, at reduced capacity. |
| Elasticity vs scalability | Scalability is the ability to grow; elasticity is growing and shrinking automatically with demand. | Elastic means you also scale in and stop paying. |
| Pricing models | On-Demand, Savings Plans, Reserved Instances, Spot. | Spot is cheapest but can be interrupted with a two-minute warning. |
| Well-Architected pillars | Operational excellence, security, reliability, performance efficiency, cost optimization, sustainability. | There are six; sustainability was added last. |
| Migration 7 Rs | Retire, retain, rehost, relocate, repurchase, replatform, refactor. | Rehost is lift and shift; replatform is lift, tinker, and shift. |
| Shared responsibility model | AWS secures the cloud itself; the customer secures what they put in the cloud. | The split shifts with the service, but data and access are always the customer's. |

## Hardware

| Concept | In one line | What they probe |
|---|---|---|
| Core vs thread | A core is an independent processing unit; a hardware thread lets one core juggle two instruction streams by sharing its parts. | On x86 EC2 a vCPU is usually one hardware thread; on Graviton a vCPU is a full core. |
| CPU cache (L1, L2, L3) | Small fast memory on the chip: L1 and L2 per core, L3 shared, each level bigger and slower. | Code that reads memory in order (good locality) stays in cache and runs far faster. |
| Latency orders of magnitude | About 1 ns for L1, about 100 ns for RAM, tens of microseconds for SSD, milliseconds for HDD and long network trips. | Each step down is roughly 10x to 1000x slower, which is why caching matters. |
| GPU vs CPU | A CPU has a few powerful cores for varied logic; a GPU has thousands of simple cores doing the same math in parallel. | Neural networks are mostly matrix multiplication, which is exactly what GPUs parallelize. |
| Inferentia and Trainium | AWS-designed AI chips: Inferentia for running models (inference), Trainium for training them, both programmed through the AWS Neuron SDK. | The pitch is lower cost per inference or per training run than comparable GPU instances. |
| AWS Graviton | AWS-designed Arm-based processors for EC2, aimed at better price performance and lower energy use than comparable x86. | Software must run on arm64: interpreted languages usually just work, native binaries and images need arm64 builds. |
| HDD vs SSD vs NVMe | HDD spins a platter and moves a head; SSD uses flash with no moving parts; NVMe is a fast interface that connects SSDs over PCIe. | NVMe's many deep queues are why it beats older SATA SSDs on parallel I/O. |
| IOPS vs throughput | IOPS counts read or write operations per second; throughput is data volume per second. Throughput is about IOPS times I/O size. | Databases with small random I/O need IOPS; log processing and big scans need throughput. |
| RAID 0, 1, 5, 10 | 0 stripes for speed with no protection, 1 mirrors, 5 stripes with parity and survives one disk loss, 10 mirrors then stripes. | RAID 0 doubles the chance of losing everything; RAID 10 is the usual choice for fast, safe databases. |
| VM vs container vs bare metal | A VM runs its own OS on a hypervisor; a container shares the host kernel; bare metal has no virtualization layer. | Containers start in seconds and pack densely, but the isolation boundary is weaker than a VM's. |
| AWS Nitro System | The platform under modern EC2: Nitro Cards for networking, storage, and management, the Nitro Security Chip, and a minimal Nitro Hypervisor. | Offloading to dedicated hardware gives near bare-metal performance and keeps operators out of customer instances. |
