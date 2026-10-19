# Amazon AWSI ETP Solutions Architect prep

Interview prep for the AWS AWSI Emerging Talent Program (ETP) Solutions Architect role, full time, part of Resume Griller. Static HTML, CSS, and vanilla JS. No build step.

The online assessment was passed on October 14, 2026. The on-campus loop at USC is targeted for Wednesday, October 28, 2026; the recruiter has not confirmed its format. Planned cohort start: January 4, 2027.

| Page | What it covers |
|---|---|
| `index.html` | Loop tracker: countdown to October 28, four reported rounds with status and a checklist each, the October 16 to 27 sprint, progress across every section |
| `top.html` | The 26 most asked SA questions with one-minute answers, live handling, follow-ups, and traps |
| `review.html` | Speaking scripts, story assessment, resume discrepancies, delivery coaching |
| `behavioral.html` | 60-second pitch with timer, 12 STAR stories filterable by Leadership Principle, a 90-second rehearsal timer per story, numbers quiz, LP map, and the three unfinished gap stories |
| `cheatsheet.html` | Prioritized AWS decisions, comparison traps, customer scenarios, optional labs |
| `architecture.html` | Eight reference architectures as traceable diagrams, requirement-to-service heuristics |
| `aws.html` | 120 AWS terms searchable by family and tier, full forms on every card, flashcards, a 65-entry acronym list and drill, resume-to-AWS map, Well-Architected, 7 Rs, DR tiers |
| `compare.html` | 48 look-alike pairs (SQS or SNS, security group or NACL, Multi-AZ or read replica) with a one-line tell and when to pick each, plus a drill |
| `design.html` | Whiteboard framework and six designs: inline SVG flow diagram with numbered steps, why each choice, watch-outs, a 30-minute timer, and a reveal-answer toggle |
| `fundamentals.html` | 37 IT fundamentals (DNS, networking layers, TCP and HTTP, encryption, containers vs VMs, SQL vs NoSQL, sharding, stateful vs stateless, storage types) as a timed rapid-fire quiz with self-scoring |
| `questions.html` | Openers, AWS rapid fire, LP randomizer, customer role-plays, questions to ask |
| `mock.html` | A 45-minute round: 2 LP questions and 1 technical question (design, fundamentals deep dive, or AWS rapid fire), self-score rubric, saved history |

Content lives in `data/*.json`, each with a schema in `data/schema/`; the pages render it. `data/profile.json` is the source of truth for candidate facts. Its numbers are copied from `salesforce/data/profile.json`, and the check fails if they drift.

## The reported loop

Reported, not confirmed. Public 2025 and 2026 candidate reports describe 3 to 4 interviews of about an hour. Every round opens with 2 to 3 Leadership Principle questions in STAR format. At least one round goes deep on the resume and IT fundamentals; some candidates also report a whiteboard architecture or a short "present a project you built" segment. Amazon has 16 Leadership Principles. Replace the four rounds in `data/loop.json` with the real format once the recruiter confirms it.

## What you still have to write

Three gap entries in `data/behavioral.json` are unfinished `[fill: ...]` prompts: **failure**, **disagreement**, and **mentoring**. No existing story honestly covers Have Backbone; Disagree and Commit or Hire and Develop the Best, so those two LPs rely on the gap entries. They need real events from you; the site never invents them. Draft them on the Leadership Principles page (drafts save in your browser), then move the finished story into `stories` in `behavioral.json`.

## Facts that hold everywhere

Confirmed by the candidate on October 19, 2026, and enforced by `scripts/check.mjs`:

- Oracle Software Engineer II, Jul 2022 to Jan 2025. Prep text says "nearly 3 years" (or "about 3 years").
- MSRcosmos AI Forward Deployed SWE Intern, Jun 2026 to Aug 2026.
- USC Sports Analytics is volunteer research, not an internship.
- USC MS Computer Science graduates December 16, 2026.

The earlier resume PDF shows a different MSRcosmos start month and a different Sports Analytics title; `review.html` keeps that discrepancy visible until the PDF is updated.

## Run locally

Browsers block `fetch()` of local JSON from a `file://` page, so serve the repo root:

```sh
python3 -m http.server 8000
# open http://localhost:8000/amazon/
```

## Check content before committing

Run from the repo root:

```sh
node amazon/scripts/check.mjs        # schemas, dashes, ids, cross refs, metrics, facts, LP coverage, privacy
node amazon/scripts/test_practice.mjs
node --test amazon/scripts/test_review.mjs amazon/scripts/test_cheatsheet.mjs amazon/scripts/test_architecture.mjs amazon/scripts/test_storage.mjs amazon/scripts/test_recruiting.mjs amazon/scripts/test_rehearsal.mjs amazon/scripts/test_finalprep.mjs amazon/scripts/test_diagrams.mjs amazon/scripts/test_top.mjs
node amazon/scripts/test_integration.mjs
```

With the server running and Playwright available (`PLAYWRIGHT_MODULE` can point at an existing install):

```sh
node amazon/scripts/test_browser.mjs
node amazon/scripts/test_navigation.mjs
node shared/test_pages.mjs           # every page, 390px and desktop, light and dark
```

`check.mjs` fails on: schema violations, em or en dashes, duplicate ids, broken cross references (stories, LPs, pages, AWS services, pairs, topics), a spoken metric missing from `profile.json`, a number that differs from the Salesforce profile, a contradicted fact above, an LP with no story and no gap entry, and any email, phone number, case number, or personal status detail anywhere in the repo. `stories.md`, `RESUME-STAR-REVIEW.md`, `FINAL-PREP.md`, and `AWS-CHEATSHEET.md` are generated from JSON by the `*_md.mjs` scripts; the check fails if `stories.md` is stale.

## Live site

https://anuvik2401.github.io/Resume-Griller/amazon/

Deployed by the repo's GitHub Pages workflow on every push to `main`, after every check above passes.

## Privacy

The site is public. Keep recruiter and interviewer names, emails, phone numbers, case numbers, and personal status details out of every file; the check enforces it. Progress, notes, and drafts live only in your browser's localStorage and are never committed; use Export in the sidebar to back them up or move them to another device. `noindex` is a search preference, not access control.
