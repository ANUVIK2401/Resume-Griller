/* Google "Googleyness" competency bank for google-prep.html.
   Add new entries any time — the page picks them up automatically.
   `linkedTags` must match tags used in star-bank.js so matching
   STAR stories get pulled in inline.

   A 45-min Googleyness round fits ~3-4 questions at 8-10 min each,
   with follow-up probes. Every answer is in STAR form:
   star: { s: situation, t: task, a: action, r: result }. */

const GOOGLE_INTRO = {
  title: "Tell me about yourself — 60-90 second intro",
  pitch: [
    "I'm a CS master's student at USC graduating December 2026, and right now I'm an AI forward-deployed SWE intern at MSRcosmos, where as the sole engineer I ship a production LangGraph multi-agent system on AWS that migrates ERP financial data — the pilot cut manual reconciliation effort 70%.",
    "Before grad school I spent two and a half years at Oracle as a Software Engineer II on NSX cloud infrastructure, and that's where my center of gravity is: observability and reliability at scale. I built the Prometheus and Grafana platform that enforces CPU, memory, and p99 latency SLOs across 37,000+ enterprise tenants — it took P1 mean-time-to-resolution from 90 minutes down to 25 — and I containerized NSX on OCI with Kubernetes autoscaling driven by custom Prometheus metrics, which held p99 SLOs under 2x peak load while cutting infra cost about 25%.",
    "In between, I did AI/ML research at USC, where I compressed a DQN training cycle from 6+ hours to 10 minutes and built the experiment-tracking service the lab still runs on.",
    "The thread through all of it: I like owning production systems end to end — instrumenting them, understanding how they behave under load, and automating the toil away. That's why Google interests me: it's infrastructure at a scale where observability and reliability aren't support work, they're the product."
  ],
  tips: [
    "Target 60-90 seconds; stop talking when you hit the 'why Google' line.",
    "The Oracle paragraph is the anchor — slow down on the numbers (37K tenants, 90→25 min, 2x load, ~25% cost).",
    "Tailor the last sentence to the team if you know it (SRE, Cloud, Core infra).",
    "Every claim here has a full STAR story below — expect 'tell me more about X' and welcome it."
  ]
};

const GOOGLE_PREP_BANK = [
  {
    competency: "Leadership",
    googleDefinition: "Google looks for 'emergent leadership' — stepping up without a title, influencing peers, and knowing when to lead versus when to defer. They probe whether you create clarity for others and multiply the team's output, not just your own.",
    questions: [
      {
        question: "Tell me about a time you led a project or initiative without formal authority.",
        star: {
          s: "At Oracle I was an SWE II with no mandate over other teams, and every NSX team was hand-rolling its own pre-deployment validation — releases were slow and failures were common.",
          t: "I wanted to standardize release validation across teams I had no authority over.",
          a: "I built a CLI toolchain with Jenkins CI/CD and scripted pre-deployment validation, then drove adoption team by team — starting with the team whose release pain was worst so the win would be visible, and folding their feedback into the tool before approaching the next team.",
          r: "Four engineering teams adopted it, the release cycle dropped 35%, and teams recovered 9+ engineering hours weekly."
        },
        followUps: [
          "How did you get the first team to adopt it when you couldn't mandate it?",
          "What resistance did you hit, and what did you change based on it?",
          "How did you keep it maintained after adoption — did it survive you leaving?"
        ]
      },
      {
        question: "Describe a time you influenced people who were initially skeptical of your approach.",
        star: {
          s: "When I proposed the Prometheus/Grafana observability platform for Oracle NSX, service teams were skeptical — instrumenting their services for custom metrics felt like extra work with no payoff, and they trusted their existing ad-hoc logs.",
          t: "I needed teams to adopt shared instrumentation and SLO dashboards voluntarily, or the platform would enforce SLOs nobody was feeding data into.",
          a: "Instead of arguing, I instrumented one high-incident service myself and built its Grafana dashboards, then during their next P1 walked the on-call engineer through diagnosing it from the dashboard instead of grepping logs. The diagnosis that usually took an hour took minutes, in front of the people who'd been skeptical.",
          r: "That team adopted the platform and became its advocates; adoption spread across NSX, and platform-wide P1 MTTR eventually fell from 90 to 25 minutes."
        },
        followUps: [
          "What would you have done if the live demo had gone badly?",
          "Tell me about a time influence didn't work and you had to escalate or let it go."
        ]
      },
      {
        question: "Tell me about a time you saw something falling through the cracks and stepped up.",
        star: {
          s: "Oracle NSX served 37,000+ enterprise tenants, but capacity problems were only ever discovered during P1 incidents — no one owned proactive capacity planning because it sat between the service teams and the infra team.",
          t: "I decided to own the gap: give the org a way to see capacity risk before it became an incident.",
          a: "I extended the observability platform to track CPU, memory, and p99 SLO burn per tenant cohort in Grafana, and set up capacity-planning reviews driven by those dashboards, flagging tenants trending toward saturation weeks ahead.",
          r: "Capacity issues moved from incident response to planned work, and the proactive planning was a major driver of P1 MTTR dropping 72% — from 90 to 25 minutes."
        },
        followUps: [
          "How did you balance this against your assigned work?",
          "Who did you need to convince to get it prioritized?",
          "What signal told you this was the right gap to fill versus other gaps?"
        ]
      },
      {
        question: "How do you decide when to lead and when to follow?",
        star: {
          s: "I've been on both sides: at Oracle I led the observability and tooling efforts because I was closest to the operational pain; at MSRcosmos I work with client ERP experts who know the financial domain far better than I do.",
          t: "The judgment call is the same each time: who should be steering this decision?",
          a: "My rule is that whoever owns the hardest constraint should lead. On observability, I had the most context on what broke at 3am, so I drove the design. On the ERP migration, 'correct' was defined by accountants, so I deferred entirely on domain rules and led only on how to encode them into the agent system.",
          r: "Both worked: the observability platform cut MTTR 72%, and the migration shipped with zero data loss because the domain experts' rules — not my assumptions — were the gate."
        },
        followUps: [
          "Give me an example where you deferred and it turned out to be the wrong call.",
          "How do you hand off leadership of something you started?"
        ]
      }
    ],
    linkedTags: ["leadership", "cross-team"]
  },
  {
    competency: "Collaboration / Teamwork",
    googleDefinition: "Google evaluates how you work across teams and functions — sharing context, resolving disagreements constructively, and putting the team's goal above being right. They listen for genuine credit-sharing and how you handle working with people unlike you.",
    questions: [
      {
        question: "Describe a project where you had to coordinate across multiple teams to deliver.",
        star: {
          s: "Rolling out the NSX observability platform meant getting multiple service teams to agree on shared definitions — each team measured 'latency' and 'availability' differently, so SLOs couldn't be compared or enforced consistently.",
          t: "I had to get every team onto common metric definitions and SLO targets without owning any of their roadmaps.",
          a: "I ran working sessions with each team's on-call engineers to catalog what they actually measured, proposed a common Prometheus metric taxonomy (request rate, errors, p99 duration, saturation), and encoded it as shared instrumentation libraries and Grafana dashboard templates so conforming was easier than diverging.",
          r: "All the NSX service teams converged on the shared taxonomy, which is what made platform-wide SLO enforcement across 37,000+ tenants possible at all."
        },
        followUps: [
          "How did you resolve conflicts between two teams' definitions?",
          "What did you do when a team was slow to adopt the shared standard?"
        ]
      },
      {
        question: "Tell me about a time you had to work closely with a difficult stakeholder.",
        star: {
          s: "At MSRcosmos, the client's finance team deeply distrusted automation touching their GL, AP, and AR records — every conversation started from 'the migration will corrupt our books.'",
          t: "I needed their domain knowledge and their sign-off, so I had to convert distrust into collaboration.",
          a: "I stopped pitching the system and started asking them to define what a wrong record looked like, then turned their answers into explicit field-level validation rules they could review and veto — making their own rules the gate the automation had to pass.",
          r: "They became the system's biggest advocates, and the pilot shipped with zero data loss under audit-ready constraints."
        },
        followUps: [
          "What specifically made them difficult, and did your view of them change?",
          "How would they describe working with you?"
        ]
      },
      {
        question: "Tell me about a technical disagreement with a colleague. How did you resolve it?",
        star: {
          s: "On the ERP migration, a colleague argued every migrated record needed human review — full automation was too risky for audit compliance — while I thought full manual review just recreated the problem we were hired to solve.",
          t: "We had to converge on a design without either of us simply overruling the other.",
          a: "We reframed the disagreement as a measurable question: what fraction of records can the system validate with high confidence? I built confidence-based routing so high-confidence records flowed through automatically and low-confidence ones went to human review.",
          r: "Zero data loss and a 70% reduction in manual effort — each of us got the property we actually cared about."
        },
        followUps: [
          "What if you couldn't find a middle design — whose call was it?",
          "Tell me about a disagreement where you turned out to be wrong."
        ]
      },
      {
        question: "How do you explain complex technical work to non-technical people?",
        star: {
          s: "The client's finance team needed to trust a LangGraph multi-agent pipeline they couldn't read a line of.",
          t: "I had to explain the architecture well enough that they could challenge it, not just tolerate it.",
          a: "I never said 'multi-agent pipeline' — I described a digital audit team where each agent is a clerk with one job, like checking currency totals, and anything a clerk isn't sure about goes to a human supervisor. Same trick at Oracle: executives didn't get 'p99 SLO burn,' but they got 'a dashboard that shows which customers will hit problems next month.'",
          r: "The finance team asked sharp process questions that genuinely improved the validation design, and at Oracle the capacity dashboards got leadership attention because they answered a business question, not a technical one."
        },
        followUps: [
          "Tell me about a time your explanation failed and you had to try again.",
          "How do you check they actually understood rather than just nodded?"
        ]
      },
      {
        question: "Tell me about a time a teammate was struggling or blocking the team. What did you do?",
        star: {
          s: "During Oracle on-call rotations, newer engineers were drowning in P1 escalations — manually tracing 400/500-series failures through event streams across a million monitored endpoints.",
          t: "Rather than keep absorbing their escalations, I wanted to fix why they were struggling.",
          a: "I paired with one engineer through a full incident to see exactly where they got stuck — it was correlating failures to root cause, not the tooling itself. That shaped what I built next: automated root-cause tagging on 400/500-series failures, plus Grafana views organized around the questions on-call actually asks.",
          r: "P1 on-call escalations dropped 40%, and the pairing sessions became how we onboarded engineers to on-call."
        },
        followUps: [
          "What if the struggle was attitude rather than skill?",
          "Did you ever have to give a peer direct critical feedback? How did it go?"
        ]
      }
    ],
    linkedTags: ["cross-team", "tooling", "mcp"]
  },
  {
    competency: "Comfort with Ambiguity",
    googleDefinition: "Google explicitly screens for thriving without a spec — making progress when requirements, ownership, or data are unclear, and adapting as things change. They want to see you form a plan under uncertainty, state assumptions, and iterate rather than freeze.",
    questions: [
      {
        question: "Tell me about a time you were handed a vague problem with no spec or clear owner.",
        star: {
          s: "MSRcosmos handed me 'automate the client's ERP migration' — no spec, no success criteria, and the domain rules lived in the heads of people across several client teams.",
          t: "As sole engineer, I had to turn an unowned, ambiguous problem into a buildable one.",
          a: "I timeboxed a week to extract the rules from the client's experts and write them down as agent task specs, got the client to sign off on those specs as ground truth, and only then started building — the spec I wrote became the contract.",
          r: "The pilot shipped to production and cut manual reconciliation effort 70% across thousands of GL, AP, and AR records."
        },
        followUps: [
          "What assumptions did you make that turned out wrong?",
          "How did you know when you'd gathered enough requirements to start building?"
        ]
      },
      {
        question: "Describe a decision you made with incomplete information.",
        star: {
          s: "When I containerized Oracle NSX on OCI with Kubernetes, I had to configure horizontal pod autoscaling with no historical data on how the service scaled — the wrong thresholds could either violate p99 SLOs or burn money on idle capacity.",
          t: "I had to pick scaling triggers and limits before any production evidence existed.",
          a: "I made the decision reversible and observable: started with deliberately conservative HPA thresholds driven by custom Prometheus metrics (queue depth and p99 latency, not just CPU), load-tested to 2x projected peak in staging, then tuned the thresholds weekly against real production metrics.",
          r: "The service sustained p99 SLOs under 2x peak load while infra cost came down about 25% as tuning converged."
        },
        followUps: [
          "Why custom metrics instead of default CPU-based scaling?",
          "Tell me about an irreversible decision you had to make under uncertainty."
        ]
      },
      {
        question: "Tell me about a time priorities or requirements shifted mid-project.",
        star: {
          s: "At USC my project was tuning the RL agent's performance, but the real blocker turned out to be that each DQN training cycle took 6+ hours — no tuning plan survives one experiment per day.",
          t: "I had to convince my advisor the priority should invert: fix iteration speed first, chase performance second.",
          a: "I made the case with arithmetic — planned sweeps at current cycle time meant months — then redesigned the reward structure and state-action representations to make the learning signal denser.",
          r: "Training dropped from 6+ hours to 10 minutes, and the hyperparameter sweeps that followed drove an 18% task-completion improvement over rule-based baselines."
        },
        followUps: [
          "How did you convince your advisor to accept the detour?",
          "What would you have done if the speedup attempt had failed after two weeks?"
        ]
      },
      {
        question: "Tell me about a time you had to quickly become competent in a domain you knew nothing about.",
        star: {
          s: "I knew nothing about ERP financial data — GL, AP, AR, multi-entity multi-currency accounting — when I started the Sage migration as sole engineer.",
          t: "I had to get accurate enough in the domain to encode its rules into a production system under audit constraints.",
          a: "I learned by encoding: every conversation with the client's domain experts became a written validation rule or task spec sent back for correction the same day — being visibly wrong in writing was the fastest way to learn.",
          r: "Within weeks I could translate their domain rules into agent specs accurately enough to ship a production system with zero data loss."
        },
        followUps: [
          "How do you decide what's essential to learn versus what to delegate to experts?",
          "What do you do when experts give you contradictory answers?"
        ]
      },
      {
        question: "How do you make progress when you genuinely don't know the right answer?",
        star: {
          s: "This comes up constantly in infrastructure work — the HPA thresholds on OCI and the confidence thresholds in the migration pipeline both had no ground truth on day one.",
          t: "In both cases I needed a way to act safely before the data existed.",
          a: "Same three moves both times: write assumptions down so they're testable instead of invisible, choose the option that's cheapest to reverse, and instrument everything — Prometheus metrics on the autoscaler, audit trails on the pipeline — so reality can correct me on a weekly cadence.",
          r: "The autoscaler converged to ~25% cost savings without an SLO breach, and the pipeline hit zero data loss; neither initial guess was right, but both systems were built to survive wrong guesses."
        },
        followUps: [
          "Give me a concrete example where your first assumption failed the test.",
          "When has 'just start and iterate' been the wrong strategy?"
        ]
      }
    ],
    linkedTags: ["ambiguity", "solo-project", "system-design"]
  },
  {
    competency: "Ownership / Bias for Action",
    googleDefinition: "Google values people who treat problems as theirs to fix — noticing gaps nobody assigned, driving them to done, and preferring a reversible action now over a perfect plan later. They probe follow-through: did you stay with it until the impact landed?",
    questions: [
      {
        question: "Tell me about a time you fixed a problem that wasn't your responsibility.",
        star: {
          s: "At USC, researchers running 5+ parallel GPU experiments were each manually pulling and aggregating logs — 8+ hours a week of collective waste that nobody owned because it was everyone's annoyance and no one's job.",
          t: "Nobody asked me to fix it; I decided the lab needed real experiment telemetry.",
          a: "I built a distributed experiment-tracking service with a REST API and SQL-backed telemetry that logged concurrent metrics from all parallel GPU runs automatically — essentially bringing the observability discipline from my Oracle infra work into a research lab.",
          r: "It eliminated the 8+ hours a week of manual aggregation entirely and outlived my internship."
        },
        followUps: [
          "How did you justify spending time on it instead of your assigned research?",
          "How did you get others to actually adopt it?"
        ]
      },
      {
        question: "Describe something you built or improved that nobody asked you to.",
        star: {
          s: "On-call at Oracle, we kept solving the same class of P1: manually tracing 400/500-series failures through high-throughput event streams across a million monitored endpoints.",
          t: "Nobody had asked for it, but I decided the manual trace itself was the bug.",
          a: "I engineered real-time API diagnostics over the event streams with automated root-cause tagging on 400/500-series failures, wired into the Prometheus/Grafana platform so a tagged failure landed on the on-call dashboard with its probable cause attached.",
          r: "P1 on-call escalations dropped 40% across NSX production — the best incident response is the escalation that never happens."
        },
        followUps: [
          "What almost stopped you from building it?",
          "How did you measure it actually caused the 40% drop versus something else?"
        ]
      },
      {
        question: "Tell me about driving a project to completion when momentum stalled.",
        star: {
          s: "The ERP migration pilot stalled at the go-live decision — the client kept deferring because 'production financial data' made everyone risk-averse, and as sole engineer there was no team to share the push.",
          t: "I had to manufacture the confidence the client needed to say yes.",
          a: "I proposed a shadow run: the pipeline processed real records in parallel with the manual process for two full cycles, with every discrepancy audited and explained — evidence instead of assurances.",
          r: "The shadow run's zero-data-loss record got go-live approved, and the pilot cut manual reconciliation 70%."
        },
        followUps: [
          "What would you have done if the shadow run had surfaced discrepancies?",
          "When is it right to let a stalled project die instead of pushing?"
        ]
      },
      {
        question: "Tell me about a time you took ownership of a cost or efficiency problem.",
        star: {
          s: "Oracle NSX ran provisioned for peak load around the clock — expensive, and unowned, because touching capacity risked the p99 SLOs everyone was measured on.",
          t: "I took on making capacity elastic without ever breaching an SLO.",
          a: "I containerized NSX on OCI via Docker and Kubernetes and built HPA driven by custom Prometheus metrics — p99 latency and queue depth rather than naive CPU — because the observability platform I'd built earlier meant we could finally trust the metrics enough to let them drive scaling.",
          r: "The service sustained p99 SLOs under 2x peak load while cutting infra cost about 25%."
        },
        followUps: [
          "How did you de-risk the rollout of autoscaling on a production system?",
          "What metric would have told you this was failing?"
        ]
      },
      {
        question: "Tell me about a time you had to trade off speed against quality.",
        star: {
          s: "The ERP migration needed to move fast, but audit-ready financial data allows zero data loss — I couldn't globally trade correctness for speed.",
          t: "I had to find a design where speed and correctness weren't a single dial.",
          a: "I made the tradeoff per record instead of per system: confidence-based routing let high-confidence records move at full automation speed while low-confidence ones took the slow human-review path, and the thresholds were tunable as evidence accumulated.",
          r: "70% effort reduction and zero data loss simultaneously — because no single record ever traded its correctness for the system's speed."
        },
        followUps: [
          "Tell me about a time you chose speed and it bit you.",
          "How do you decide what's a hard constraint versus a preference?"
        ]
      }
    ],
    linkedTags: ["ownership", "automation", "impact"]
  },
  {
    competency: "Handling Failure / Conflict",
    googleDefinition: "Google wants intellectual humility: owning mistakes plainly, updating your view when the data disagrees with you, and turning failure into a concrete process change. Blame-shifting or 'my only weakness is caring too much' answers are red flags.",
    questions: [
      {
        question: "Tell me about a time you failed. What did you change afterward?",
        star: {
          s: "My first attempt at fixing the 6-hour DQN training cycle at USC failed badly: I changed the reward structure, state representation, and training config all at once, and training destabilized.",
          t: "I'd lost a week and couldn't even say which change broke it — I had to recover both the project and my process.",
          a: "I rolled everything back and rebuilt my experiment discipline: one variable at a time, a fixed evaluation baseline before and after each change, and results logged in the tracking service so regressions were visible immediately.",
          r: "The systematic redesign got training from 6+ hours to 10 minutes, and I've run every optimization project since — including the Kubernetes autoscaling tuning at Oracle — with the same one-change-one-measurement rule."
        },
        followUps: [
          "How did you explain the lost week to your advisor?",
          "What's a failure that you couldn't recover from within the project?"
        ]
      },
      {
        question: "Tell me about a production incident you owned. What happened afterward?",
        star: {
          s: "Oracle NetSuite search latency was degrading for 37,000+ enterprise customers, and I owned the investigation.",
          t: "Find the root cause and fix it without making search behavior worse for anyone.",
          a: "Query-plan analysis showed SQL bottlenecks from missing and misaligned indexes. I restructured the indexes, validated against production-shaped workloads, and — the part that mattered more — wrote up the query-plan method and added latency panels to our Grafana dashboards so this class of regression would be caught trending, not reported by customers.",
          r: "P50 page load latency dropped 30% for all 37,000+ customers, and index review became part of change review."
        },
        followUps: [
          "Walk me through the actual debugging — how did you narrow it down?",
          "What was the riskiest moment in the fix, and how did you protect against it?"
        ]
      },
      {
        question: "Tell me about a time you received hard feedback. How did you respond?",
        star: {
          s: "Early in the CLI toolchain work at Oracle, a senior engineer told me bluntly that my tool was built for how I worked, not how the teams worked — the interface assumptions didn't match their release flows.",
          t: "The core engineering was solid, but they were right about the part that determined adoption — I had to rebuild the interface around users I hadn't watched.",
          a: "I shadowed two teams' releases end to end, redesigned the CLI around their actual sequence of steps, and brought the redesign back to the engineer who'd criticized it for another pass.",
          r: "That redesigned version is what 4 teams adopted, and it permanently changed how I build tools: watch the user first, build second."
        },
        followUps: [
          "Tell me about feedback you got that you disagreed with.",
          "What's the most recent piece of critical feedback you've received?"
        ]
      },
      {
        question: "Describe a conflict where you and the other person never fully agreed.",
        star: {
          s: "A client stakeholder on the validation pipeline never stopped believing every record should get human review — even after confidence routing proved itself, they saw any automated pass-through as risk.",
          t: "We weren't going to converge on philosophy, so I had to make the disagreement stop costing the project.",
          a: "I made their caution a design input instead of an obstacle: the confidence threshold became a configuration they controlled, with an audit trail showing exactly what auto-passed and why — they kept a real veto over the system's aggressiveness.",
          r: "The system kept its speed, they kept their control, and the working relationship stayed strong; they never fully agreed with me, and the project didn't need them to."
        },
        followUps: [
          "When should a disagreement like that be escalated instead of accommodated?",
          "Did accommodating their caution cost the project anything?"
        ]
      },
      {
        question: "What's a genuine weakness you're working on?",
        star: {
          s: "As a sole engineer on projects like the MSRcosmos integration, I default to solving problems myself before surfacing them — I once spent three days stuck on a Sage API quirk that a 20-minute call with their support would have resolved.",
          t: "I need blockers to surface in hours, not days, especially on solo projects with no teammate to notice I'm stuck.",
          a: "My working rule now: stuck for more than half a day means I write up what I've tried and ask — even when I feel close. The write-up itself often solves it, and when it doesn't, someone else usually can.",
          r: "Blocker turnaround on my current project is measured in hours, and the write-ups have become useful documentation on their own."
        },
        followUps: [
          "Give me a recent example where you caught yourself doing this.",
          "How would your last manager describe your biggest growth area?"
        ]
      }
    ],
    linkedTags: ["debugging", "on-call", "reliability"]
  }
];
