/* Google "Googleyness" competency bank for google-prep.html.
   Add new entries any time — the page picks them up automatically.
   `linkedTags` must match tags used in star-bank.js so matching
   STAR stories get pulled in inline.

   A 45-min Googleyness round fits ~3-4 questions at 8-10 min each,
   with follow-up probes. Each question here has an answer sketch
   (grounded in the resume stories) and the follow-ups to expect. */

const GOOGLE_PREP_BANK = [
  {
    competency: "Leadership",
    googleDefinition: "Google looks for 'emergent leadership' — stepping up without a title, influencing peers, and knowing when to lead versus when to defer. They probe whether you create clarity for others and multiply the team's output, not just your own.",
    questions: [
      {
        question: "Tell me about a time you led a project or initiative without formal authority.",
        answer: "At Oracle I was an SWE II with no mandate over other teams, but I saw every team hand-rolling its own pre-deployment validation, which made releases slow and error-prone. I built a CLI toolchain with Jenkins CI/CD and scripted validation, then drove adoption team by team — starting with the team whose release pain was worst so the win was visible. It ended up adopted by 4 engineering teams, cut the release cycle 35%, and recovered 9+ engineering hours weekly.",
        followUps: [
          "How did you get the first team to adopt it when you couldn't mandate it?",
          "What resistance did you hit, and what did you change based on it?",
          "How did you keep it maintained after adoption — did it survive you leaving?"
        ]
      },
      {
        question: "Describe a time you influenced people who were initially skeptical of your approach.",
        answer: "Teams at Oracle were skeptical the CLI toolchain was worth changing their release process for — 'our scripts work fine.' Instead of arguing, I instrumented one team's release and showed them where the hours were going, then ran their next release through my toolchain side by side. The concrete before/after numbers did the persuading; after the first team's cycle dropped, the other three came to me.",
        followUps: [
          "What would you have done if the numbers hadn't been convincing?",
          "Tell me about a time influence didn't work and you had to escalate or let it go."
        ]
      },
      {
        question: "Tell me about a time you saw something falling through the cracks and stepped up.",
        answer: "Oracle NSX had 37,000+ enterprise tenants but no unified SLO enforcement — capacity problems were only discovered during P1 incidents, and nobody owned fixing that. I took it on: built a Prometheus/Grafana observability platform enforcing CPU, memory, and p99 SLOs, and used it for proactive capacity planning. P1 MTTR dropped from 90 to 25 minutes.",
        followUps: [
          "How did you balance this against your assigned work?",
          "Who did you need to convince to get it prioritized?",
          "What signal told you this was the right gap to fill versus other gaps?"
        ]
      },
      {
        question: "How do you decide when to lead and when to follow?",
        answer: "I lead when I have the most context or the gap is unowned — like the validation tooling at Oracle, where I was closest to the pain. I follow when someone else has deeper domain knowledge — at MSRcosmos the client's ERP experts owned what 'correct' meant for financial data, so I deferred completely on domain rules and led only on how to encode them into the agent system. The test I use: whoever owns the outcome's hardest constraint should be steering.",
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
        question: "Tell me about a time you had to work closely with a difficult stakeholder.",
        answer: "At MSRcosmos, the client's finance team initially distrusted automation touching their GL, AP, and AR records — every conversation started from 'the migration will corrupt our books.' I stopped pitching the system and started asking them to define what a wrong record looked like, then turned their answers into explicit field-level validation rules they could review. Once their own rules were the gate, they became the system's biggest advocates, and the pilot shipped with zero data loss under audit constraints.",
        followUps: [
          "What specifically made them difficult, and did your view of them change?",
          "How would they describe working with you?"
        ]
      },
      {
        question: "Describe a project where you had to coordinate across multiple teams to deliver.",
        answer: "Cross-team ERP data handoffs at MSRcosmos took days because each team had its own rules and no shared bridge to Sage's APIs. As the sole engineer on the integration, I interviewed each team to extract their domain rules, translated them into agent task specs everyone could read and correct, and shipped the multi-agent system that automated the handoffs. Cycles dropped from days to hours — and the spec review process itself fixed several rule conflicts between teams that nobody had noticed.",
        followUps: [
          "How did you resolve conflicts between two teams' rules?",
          "What did you do when a team was slow to give you their requirements?"
        ]
      },
      {
        question: "Tell me about a technical disagreement with a colleague. How did you resolve it?",
        answer: "On the ERP migration, a colleague argued every migrated record needed human review — full automation was too risky for audit compliance — while I thought full manual review recreated the problem we were solving. Instead of relitigating positions, we agreed the real question was measurable: what fraction of records could the system validate with high confidence? I built confidence-based routing so high-confidence records flowed through automatically and low-confidence ones went to humans. We got zero data loss and the 70% effort reduction — both of us were right about the thing we each cared about.",
        followUps: [
          "What if you couldn't find a middle design — whose call was it?",
          "Tell me about a disagreement where you turned out to be wrong."
        ]
      },
      {
        question: "How do you explain complex technical work to non-technical people?",
        answer: "With the client's finance team I never said 'LangGraph multi-agent pipeline' — I described it as a digital audit team where each agent has one job, like a clerk who only checks currency totals, and anything a clerk isn't sure about goes to a human supervisor. Mapping the architecture onto roles they already understood let them ask sharp questions about the process instead of being intimidated by the technology. Their questions actually improved the validation design.",
        followUps: [
          "Tell me about a time your explanation failed and you had to try again.",
          "How do you check they actually understood rather than just nodded?"
        ]
      },
      {
        question: "Tell me about a time a teammate was struggling or blocking the team. What did you do?",
        answer: "During on-call rotations at Oracle, newer engineers were drowning in P1 escalations — digging manually through event streams across a million endpoints. Rather than just covering for them, I paired with one engineer through a full incident to see exactly where they got stuck, and that's what shaped the automated root-cause tagging I built for 400/500-series failures. Escalations dropped 40%, and the pairing sessions became how we onboarded people to on-call.",
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
        answer: "MSRcosmos handed me 'automate the client's ERP migration' — no spec, no defined success criteria, and the domain rules lived in the heads of people across several client teams. I timeboxed a week to extract and write down the rules as agent task specs, got the client to sign off on those specs as the ground truth, and only then started building. Writing the spec myself and getting it validated turned an unowned, ambiguous problem into a concrete one — the pilot shipped to production and cut manual reconciliation 70%.",
        followUps: [
          "What assumptions did you make that turned out wrong?",
          "How did you know when you'd gathered enough requirements to start building?"
        ]
      },
      {
        question: "Describe a decision you made with incomplete information.",
        answer: "For the confidence-based routing in the validation pipeline, I had no ground-truth data to calibrate what confidence threshold was 'safe' — the migration hadn't run yet. I set the initial threshold deliberately conservative so almost everything went to human review, which was inefficient but couldn't lose data, then re-tuned weekly as reviewed records became labeled data. The key was making the decision reversible: a wrong threshold cost reviewer time, never data integrity.",
        followUps: [
          "How would you have handled it if the data never came?",
          "Tell me about an irreversible decision you had to make under uncertainty."
        ]
      },
      {
        question: "Tell me about a time priorities or requirements shifted mid-project.",
        answer: "At USC my project was tuning the RL agent's performance, but the real blocker turned out to be that each DQN training cycle took 6+ hours — no tuning plan survives a one-experiment-per-day iteration speed. I flagged to my advisor that the priority had to invert: fix iteration speed first, performance second. Redesigning the reward structure and state-action representations got training to 10 minutes, and the hyperparameter sweeps that followed drove the actual performance gains.",
        followUps: [
          "How did you convince your advisor to accept the detour?",
          "What would you have done if the speedup attempt had failed after two weeks?"
        ]
      },
      {
        question: "Tell me about a time you had to quickly become competent in a domain you knew nothing about.",
        answer: "I knew nothing about ERP financial data — GL, AP, AR, multi-entity multi-currency accounting — when I started the Sage migration as sole engineer. I learned by encoding: every conversation with the client's domain experts, I turned immediately into a written validation rule or task spec and sent it back for correction — being visibly wrong in writing was the fastest way to learn. Within weeks I could translate their domain rules into agent specs accurately enough to ship a production system under audit constraints.",
        followUps: [
          "How do you decide what's essential to learn versus what to delegate to experts?",
          "What do you do when experts give you contradictory answers?"
        ]
      },
      {
        question: "How do you make progress when you genuinely don't know the right answer?",
        answer: "Three moves: write down my assumptions so they're testable instead of invisible, pick the path that's cheapest to reverse, and set a checkpoint where I'll re-decide with better data. That's exactly how I set the HITL confidence thresholds — conservative start, weekly re-tuning, and reviewer time rather than data integrity as the cost of being wrong. Freezing until certainty arrives is usually the only strictly wrong option.",
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
        answer: "At USC, researchers running 5+ parallel GPU experiments were each manually pulling and aggregating logs — 8+ hours a week of collective waste that nobody owned because it was everyone's annoyance and no one's job. I built a distributed experiment-tracking service with a REST API and SQL-backed telemetry that logged all concurrent runs automatically. Nobody asked for it; it eliminated the manual aggregation entirely and outlived my internship.",
        followUps: [
          "How did you justify spending time on it instead of your assigned research?",
          "How did you get others to actually adopt it?"
        ]
      },
      {
        question: "Describe something you built or improved that nobody asked you to.",
        answer: "On-call at Oracle, I noticed we were solving the same class of P1 over and over: manually tracing 400/500-series failures through event streams across a million endpoints. Rather than keep getting faster at the manual trace, I built automated root-cause tagging into the diagnostics pipeline so the classification happened before a human ever looked. P1 on-call escalations dropped 40% — the best incident response is the escalation that never happens.",
        followUps: [
          "What almost stopped you from building it?",
          "How did you measure it actually caused the 40% drop versus something else?"
        ]
      },
      {
        question: "Tell me about driving a project to completion when momentum stalled.",
        answer: "The ERP migration pilot stalled at the go-live decision — the client kept deferring because 'production financial data' made everyone risk-averse, and as sole engineer there was no team to share the push. I broke the deadlock by proposing a shadow run: the pipeline processed real records in parallel with the manual process for two cycles, with every discrepancy audited. The shadow run's zero-data-loss record gave the client the evidence to approve go-live, and the pilot cut manual reconciliation 70%.",
        followUps: [
          "What would you have done if the shadow run had surfaced discrepancies?",
          "When is it right to let a stalled project die instead of pushing?"
        ]
      },
      {
        question: "Tell me about a time you had to trade off speed against quality.",
        answer: "The migration needed to move fast, but audit-ready financial data allows zero data loss — I couldn't trade correctness for speed globally. So I traded it locally: the confidence-based routing let high-confidence records move at full automation speed while low-confidence ones took the slow human path. We got 70% effort reduction and zero data loss simultaneously, because the tradeoff was made per record instead of for the whole system.",
        followUps: [
          "Tell me about a time you chose speed and it bit you.",
          "How do you decide what's a hard constraint versus a preference?"
        ]
      },
      {
        question: "Tell me about a time you took ownership of a cost or efficiency problem.",
        answer: "Oracle NSX's infrastructure was provisioned for peak load all the time — expensive, and nobody was tasked with fixing it because touching capacity risked SLOs. I containerized the service on OCI with Kubernetes and built HPA driven by custom Prometheus metrics, so capacity followed actual load. It sustained p99 SLOs under 2x peak load while cutting infra cost about 25% — the observability platform I'd built earlier is what made autoscaling trustworthy.",
        followUps: [
          "How did you de-risk the rollout of autoscaling on a production system?",
          "What metric would have told you this was failing?"
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
        answer: "My first attempt at fixing the 6-hour DQN training cycle failed: I changed the reward structure, state representation, and training config all at once, training destabilized, and I lost a week unable to tell which change broke it. I rolled everything back and rebuilt the experiment discipline — one variable at a time, with a fixed evaluation baseline before and after each change. The redesign that eventually got training to 10 minutes came out of that slower, systematic process, and I've run every optimization project since with the same one-change-one-measurement rule.",
        followUps: [
          "How did you explain the lost week to your advisor?",
          "What's a failure that you couldn't recover from within the project?"
        ]
      },
      {
        question: "Tell me about a production incident you owned. What happened afterward?",
        answer: "At Oracle, NetSuite search latency was degrading for 37,000+ enterprise customers, and I owned the investigation. Query-plan analysis showed SQL bottlenecks from missing and misaligned indexes; I restructured the indexes and cut P50 page load latency 30%. The 'afterward' mattered more: I wrote up the query-plan analysis method so latency regressions were diagnosed the same way instead of by guesswork, and index review became part of change review.",
        followUps: [
          "Walk me through the actual debugging — how did you narrow it down?",
          "What was the riskiest moment in the fix, and how did you protect against it?"
        ]
      },
      {
        question: "Tell me about a time you received hard feedback. How did you respond?",
        answer: "Early in the CLI toolchain work at Oracle, a senior engineer told me bluntly that my tool was built for how I worked, not how the teams worked — the interface assumptions didn't match their release flows. It stung because the core engineering was solid, but they were right about the part that determined adoption. I shadowed two teams' releases end to end, redesigned the interface around their actual sequence of steps, and that redesigned version is what 4 teams adopted. It permanently changed how I build tools: watch the user first, build second.",
        followUps: [
          "Tell me about feedback you got that you disagreed with.",
          "What's the most recent piece of critical feedback you've received?"
        ]
      },
      {
        question: "Describe a conflict where you and the other person never fully agreed.",
        answer: "On the validation pipeline, a client stakeholder never stopped believing every record should get human review — even after the confidence-routing design proved itself, they saw any automated pass-through as risk. We didn't converge on philosophy, so I made the disagreement cheap instead: the threshold was a configuration they controlled, with an audit trail showing exactly what auto-passed and why. They kept their veto, the system kept its speed, and the working relationship stayed strong because I treated their caution as a requirement to design for rather than an obstacle to argue down.",
        followUps: [
          "When should a disagreement like that be escalated instead of accommodated?",
          "Did accommodating their caution cost the project anything?"
        ]
      },
      {
        question: "What's a genuine weakness you're working on?",
        answer: "As a sole engineer on projects like the MSRcosmos integration, I default to solving problems myself before surfacing them — I once spent three days stuck on a Sage API quirk that a 20-minute call with their support would have resolved. I'm deliberately practicing raising blockers early: my current rule is that if I'm stuck for more than half a day, I write up what I've tried and ask, even when I feel close. The write-up itself often solves it, and when it doesn't, someone else usually can.",
        followUps: [
          "Give me a recent example where you caught yourself doing this.",
          "How would your last manager describe your biggest growth area?"
        ]
      }
    ],
    linkedTags: ["debugging", "on-call", "reliability"]
  }
];
