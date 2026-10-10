# Salesforce MTS prep

Interview prep for the Salesforce Software Engineering MTS loop (JR359223), part of Resume Griller. Static HTML, CSS, and vanilla JS. No build step.

| Page | What it covers |
|---|---|
| `index.html` | Loop tracker: next-round countdown, six stages with status, date, checklist; progress across sections |
| `behavioral.html` | 90-second pitch, numbers quiz, a STAR story for every resume bullet mapped to Salesforce values, competency gaps, V2MOM, questions for the HM |
| `ai.html` | Concise AI fundamentals answers with deeper follow-ups, AI SRE evaluation, trade-offs, honest gaps |
| `hld.html` | System design framework, cheat sheet, GCP mapping, 4 designs, whiteboard mode |
| `dsa.html` | 193 company-tagged LeetCode problems plus 2 reconstructed drills, 51 Python solutions with built-in tests, OA simulator |
| `experiences.html` | Seven dated first-person reports, two official resources, level/location filters, source links, and speaking drills |
| `lld.html` | 7 object-oriented designs with tested solutions and catch-the-AI exercises |

Content lives in `data/*.json`; the pages render it. Candidate claims and metrics in `data/profile.json` are the source of truth for personalized preparation. A `[fill: ...]` prompt needs a real detail from the candidate before that story is ready.

## Prepare for delivery

Rehearse the pitch and the three lead stories before exploring the full bank. State the answer first, explain one decision you owned, give its measured result, then stop for follow-up questions. Practice a short answer and a deeper version, and explain the baseline, time window, and measurement behind every metric. The pitch targets 90 seconds; time your own spoken pace.

The stored six-stage loop is this candidate's preparation plan, last recorded October 9, 2026. It is not a universal Salesforce process or a confirmed schedule. Keep the stage dates and formats aligned with the recruiter.

## Source and accuracy notes

The DSA list comes from a third-party company-tag snapshot. Its frequency scores guide study order; they are not interview probabilities. Source-window badges are historical, and the import date was not recorded. Two reconstructed DSA drills, the workflow logger, and the notification design had no original candidate-report links in the previous notes, so they are labeled as practice variants. Reference solutions have runnable example tests; passing them does not establish complete coverage.

Technical wording was checked against [Google's SLO alerting guidance](https://sre.google/workbook/alerting-on-slos/), [Pub/Sub delivery guarantees](https://docs.cloud.google.com/pubsub/docs/exactly-once-delivery), [Pub/Sub ordering guarantees](https://docs.cloud.google.com/pubsub/docs/ordering), and [MCP security guidance](https://github.com/modelcontextprotocol/modelcontextprotocol/security). In particular, request-based error budgets are not automatically outage durations, ordered delivery has an explicit scope, and exactly-once message delivery does not automatically cover external side effects.

## October 10, 2026 audit

Reviewed all Salesforce content banks, page renderers, shared runtime, schemas, and reference solutions. Corrected source certainty and timing labels, the linked-list reversal template, rate-limit validation, alert fingerprint ambiguity, swallowed notification failures, incident-state guards, and LFU frequency-bucket growth. Fixed progress import validation, stale-tab writes, lost last-second notes, background timer drift, hidden filter sections, and OA answer availability. GitHub Pages now runs the content and regression checks before publishing.

Delivery is the priority: three lead stories appear first, unfinished details stay visible, and short spoken outlines precede full reference answers. The new Experiences page separates seven self-reported candidate experiences from two official resources, with source/date/level/location and a speaking drill for each.

Remaining preparation depends on the candidate: complete the original fill prompts, identify the exact Oracle NSX product context, verify metric baselines and measurement windows, and draft real failure, disagreement, and mentoring examples. The supplied resume is a consistency reference, not independently verified employment evidence. Do not memorize an unfinished or ongoing result as a completed claim.

All content checks and reference tests pass. Added 18 runtime and 15 solution regression cases. Measured line coverage is 97.2% for the experience model, 100% for the changed runtime logic exercised by the VM suite, and 92.6% to 97.4% for the five corrected Python solutions; these are scoped results, not whole-app coverage. Manual browser verification covered light/dark layouts, experience navigation/search/expansion, timer controls, and persisted checklist/notes. Mobile layouts received responsive CSS review but were not device-tested.

## Run locally

Browsers block `fetch()` of local JSON from a `file://` page, so serve the repo root:

```sh
python3 -m http.server 8000
# open http://localhost:8000/salesforce/
```

## Check content before committing

Run from `salesforce/`:

```sh
node scripts/check.mjs      # dashes, ids, cross refs, ground truth, quiz answers
python3 scripts/test_solutions.py  # runs every DSA and LLD solution test
node scripts/test_experiences.mjs
node scripts/test_delivery.mjs
node scripts/test_runtime.mjs
python3 scripts/test_rate_limiter.py
python3 scripts/test_lld_regressions.py
```

Fails on em or en dashes, duplicate ids, broken cross references, and copy that contradicts `data/profile.json`.


## Live site

https://anuvik2401.github.io/Resume-Griller/salesforce/

Deployed by the repo's GitHub Pages workflow on every push to `main`.

## Privacy

The site is public. Keep the visa case number, contact names, and anything else private out of `data/`. Delivery practice on the Loop and Behavioral pages turns reference content into timed spoken answers, saved rubrics, and personal drafts.

Progress, notes, and drafts live only in your browser's localStorage and are never committed; use Export to back them up.
