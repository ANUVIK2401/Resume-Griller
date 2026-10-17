# Salesforce hiring manager round: brief

**Thursday, October 22, 2026, 11:45 to 12:30 (45 min, video).** Treat it as Pacific time and check the invite. Role: Software Engineering MTS (JR359223), Public Cloud Engineering. Stored team context: AI SRE tooling to cut MTTD and MTTR, AI developer-velocity tools, a GCP platform for agentic work, RCAs. Confirm the current scope in the interview.

This is the only page you need for this round. The full bank lives in [behavioral.html](behavioral.html) and [ai.html](ai.html). Coding, design, and OOD prep can wait until this round passes.

## Time plan with the Amazon SA loop (Oct 28)

About 80% of the work is shared: the same Oracle and MSRcosmos stories, told with a different emphasis.

| Day | Salesforce (this brief) | Amazon |
|---|---|---|
| Fri Oct 16 to Sun Oct 18 | 45 min a day: pitch, three lead stories | Main block |
| Mon Oct 19 to Tue Oct 20 | 60 min a day: AI SRE answers, gap stories | Main block |
| Wed Oct 21 | 90 min: one full 45-minute mock, timed | Light |
| Thu Oct 22 | 30 min warm-up: pitch, numbers, two questions | Amazon mock 2 in the afternoon |
| Fri Oct 23 onward | Done | Full focus |

## Likely shape of the 45 minutes

1. Intros and your pitch (5 min)
2. Two or three deep dives on your resume, especially incident response and agents (20 min)
3. AI SRE thinking: how you would cut MTTD and MTTR, how you would trust an agent (10 min)
4. Your questions (5 to 10 min)

This is a likely shape, not a confirmed format.

## 90-second pitch

> I'm Anuvik, an infrastructure engineer who now builds agentic AI systems. I spent nearly 3 years at Oracle as a Software Engineer II on NSX, working on observability, incident response, and Kubernetes across 37,000+ tenants.
>
> My API diagnostics gave on-call engineers root-cause tags and runbook context: P1 MTTR went from 94 to 26 minutes. Moving alerting toward SLOs cut false pages 41%.
>
> I came to USC for my MS to go deeper on AI. At MSRcosmos this summer I shipped a Claude and LangGraph ERP migration workflow with confidence-based review. It auto-approved 83% of records and cut turnaround from 3 days to 5.5 hours.
>
> Now I build a multi-agent retail intelligence app at USC Annenberg and benchmark LLM factual accuracy at the AI Trust Lab.
>
> I bring the view of the engineer who gets paged and the engineer who builds agents. That is the work I want to do next: reliable AI tools that help engineers resolve incidents faster.

## Three lead stories

Open with the result, give one decision you owned, then stop for a follow-up.

**1. P1 MTTR from 94 to 26 minutes (Oracle).** On-call lost the first part of every P1 working out which API was failing across 1M+ endpoints. I instrumented real-time API diagnostics on the event streams, auto-tagged root causes on 400 and 500 series failures, and linked each tag to its runbook. P1 MTTR fell 72%. *Lesson:* most of MTTR is the time it takes to get context, so bring the context to the engineer.
- *How was it measured?* Same definition before and after, from incident start to recovery. The incident tracker has the exact window. The metric does not prove diagnostics were the only contributor.
- *Were the tags right?* A tag is a hypothesis. The runbook verifies it. Today I would measure top-tag precision against the postmortem root cause.

**2. CLI validation toolchain, 4 teams (Oracle).** Config errors reached production and 11% of deploys failed. I shipped a CLI toolchain with scripted pre-deployment validation in Jenkins, so errors failed in CI. Four NSX teams adopted it. Failed deploys went from 11% to 4% and release cycles became 34% shorter. *Lesson:* reliability speeds delivery when the safe path is the default.
- *11% to 4% is 7 percentage points*, not 7%.

**3. Multi-agent ERP migration (MSRcosmos).** I built a 10,000+ record GL/AP/AR migration from Sage X3 to Sage Intacct on the Claude API and LangGraph, with an explicit state graph so each step can be checkpointed and audited. Confidence routing auto-approved records above a threshold and sent the rest to a reviewer. Manual reconciliation fell 68%, 83% auto-approved, and turnaround went from 3 days to 5.5 hours across 12 entities. *Lesson:* automation needs an explicit boundary between what the system decides and what a person reviews.
- *Why LangGraph?* Financial writes need explicit state, checkpoints, and replay. A free agent loop is harder to bound.
- *Threshold?* I do not quote one without calibration evidence. Calibrate on labeled samples, pick the error rate the business accepts, and audit approved records.

## AI SRE anchor answers (30 seconds each)

**How would you use AI to cut MTTD and MTTR?** Start with diagnosis. Gather telemetry and recent changes, retrieve similar past incidents and runbooks, and have the model rank causes, each citing evidence; it abstains when evidence is weak. Diagnostics are read-only and budgeted. Mitigations need approval, a blast-radius check, and a tested rollback. Bridge: "It is my Oracle MTTR work, with retrieval and ranked hypotheses in place of a single tag."

**How do you know the agent is good enough to trust?** Replay past incidents using only data that existed at the time. Score top-3 root-cause accuracy, time to first useful hypothesis, wrong-action rate, and abstain rate. Then run shadow mode for suggestion quality and a controlled rollout to measure the real MTTR effect. Every prompt or model change has to pass the replay. Bridge: "At the Trust Lab I score 6 frontier models with the same discipline."

**Main risks?** Hallucinated causes (require citations), stale runbooks (freshness dates), alert storms (group first), runaway cost (step and token budgets).

## Gap stories: prepare one real example each

These are the questions most likely to catch you without an answer. Use a real moment; do not invent one.

| Prompt | Where to look | Shape |
|---|---|---|
| Failure or mistake | An Oracle deploy before the toolchain existed, or an early MSRcosmos agent run that went wrong | What broke, what you did in the first hour, what you changed, the habit you kept |
| Disagreement | Someone who pushed back on SLO alerting or on a validation gate | Their position, the data you brought, the decision, the relationship afterward |
| Mentoring | Someone onboarding to your toolchain or runbooks, or a lab teammate | One specific thing you taught and what they could do alone afterward |

## Numbers to say without thinking

94 to 26 min (72%) · 37,000+ tenants · 1M+ endpoints · 47 dashboards · 41% fewer false pages · 840 to 588 ms (30%) · 4 teams · 34% shorter releases · 11% to 4% failed deploys · 2x peak · 10,000+ records · 68% less reconciliation · 83% auto-approved · 3 days to 5.5 hours · 12 entities

## Ask two questions

1. Where does most of your MTTR go today: detection, diagnosis, or mitigation?
2. How mature is the agentic SRE work: prototype, internal pilot, or running on real incidents?

Backup: What would a strong first 90 days look like? How do you decide an AI SRE agent is ready for a live incident?

## Boundaries

- Oracle: say "nearly 3 years." PacSun, Trust Lab, and scheduling work are **ongoing**; describe the design, not a final result.
- GCP: your production depth is OCI and Kubernetes. Say so, then map the parts to GCP (GKE, Managed Prometheus, Pub/Sub).
- When a probe asks for a detail you do not have, say what you would check. Do not guess a number.
- Availability: full time from January 2027.
