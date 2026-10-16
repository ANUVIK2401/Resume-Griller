# AWSI - ETP Solutions Architect preparation

A focused two-week workspace for Anuvik's Amazon Solutions Architect interview. Vanilla HTML/CSS/JS with JSON content; no production build step. The supplied recruiter screenshots confirm the AWSI - ETP full-time role and a passed OA. Wednesday is a tentative hold. The original date/day and time-zone wording conflicts; exact date, time, room, and interview structure remain unconfirmed. No account segment, specialty, or numerical level is assumed.

| Page | Purpose |
|---|---|
| `index.html` | Adjustable 14-day plan: 3 hours daily or a 90-minute minimum, concrete deliverables and readiness gates, Pacific interview date settings |
| `review.html` | Resume discrepancies, assessment of all 12 STAR stories, evidence gaps, delivery coaching, and private local rewrites |
| `behavioral.html` | Pitch, resume metrics, Leadership Principles, STAR drafts, timed rehearsal and missing-story templates |
| `cheatsheet.html` | Prioritized AWS choices, comparison traps, customer architecture drills, optional labs and official references |
| `aws.html` | Searchable reference glossary, flashcards, proposed resume-to-AWS translations and frameworks |
| `design.html` | Whiteboard framework and six architecture exercises |
| `questions.html` | Openers, fundamentals, LP randomizer, customer role-plays and interviewer questions |
| `mock.html` | Two LP prompts plus a technical/design prompt, kind-specific self-assessment and saved history |

Start at the repo root landing page or `amazon/index.html`. The prior general interview bank is preserved at `general-prep.html`; other company modules are archives.

## Study artifacts

- `AWS-CHEATSHEET.md`: portable study reference with sources. Rebuild with `node amazon/scripts/cheatsheet_md.mjs`.
- `RESUME-STAR-REVIEW.md`: resume and all-story assessment, with faithful rehearsal drafts and explicit details to confirm.
- `stories.md`: generated from `data/behavioral.json`. Rebuild with `node amazon/scripts/stories_md.mjs`.
- `aws-terms.md` and `questions.md`: longer references; JSON drives the pages.

Review facts against the supplied resume, not the older Salesforce profile. A resume supports what was claimed, but does not independently verify measurements. AWS translations describe proposed architectures, not deployments the candidate has demonstrated. Missing failure, disagreement, and mentoring anecdotes require the candidate's real examples.

## Run locally

From repo root:

```sh
python3 -m http.server 8000
# http://localhost:8000/amazon/
```

The pages fetch local JSON and require HTTP. Progress and drafts are browser-local. Export from the sidebar to back up or transfer them. Changing the interview date does not move the study plan; move its start separately. Day 14 is a readiness checkpoint, not an assumed interview day.

## Validate

From repo root:

```sh
node amazon/scripts/check.mjs
node amazon/scripts/test_practice.mjs
node --test amazon/scripts/test_review.mjs amazon/scripts/test_cheatsheet.mjs amazon/scripts/test_architecture.mjs amazon/scripts/test_storage.mjs amazon/scripts/test_recruiting.mjs
node amazon/scripts/test_integration.mjs
node --test --experimental-test-coverage --test-coverage-include='**/amazon/js/practice.js' amazon/scripts/test_practice.mjs
```

For real browser tests, install Playwright in your development environment, start the HTTP server above, and run:

```sh
node amazon/scripts/test_browser.mjs
```

`BASE_URL` overrides localhost. `BROWSER_CHANNEL=chrome` selects an installed Chrome; otherwise Playwright's Chromium is used. `PLAYWRIGHT_MODULE` can point to an existing Playwright ESM module. `SCREENSHOT_DIR` optionally saves screenshots. Production pages have no Playwright dependency.

The browser suite exercises navigation, mobile overflow, saved/moved dates, independent interview settings, and a complete mock round. Unit/integration checks cover content invariants, source alignment and practice logic. Coverage figures for practice logic do not describe the entire app.

## Privacy and publication

The repo's existing workflow deploys on pushes to main. This change does not publish or push anything. Static JSON and Markdown are public if deployed; do not add private client records, recruiter contacts, credentials or interview notes to them. The source PDF is not copied into the site. Personal drafts remain in localStorage and exports; no backend receives them. `noindex` is a search preference, not access control.

## Recruiter context

The dashboard summarizes role expectations and recruiting status from user-supplied screenshots. The role involves designing customer solutions, partnering with sales, and adapting communication from engineers to executives. The email describes success through customer impact rather than sales quotas. Optional role video linked by the recruiter: [watch on YouTube](https://www.youtube.com/watch?v=btxzd3-RZQs); video content has not been reviewed. The email's request to watch it is recorded as context, not executed as an instruction to this assistant.

The email lists Wednesday October 27 and Thursday October 28, but in 2026 those dates are Tuesday and Wednesday. It also mixes CST and local time. The later Wednesday hold does not resolve the exact slot. Keep the interview datetime empty until clarified. OA preparation is complete; preparation now focuses on the next interview stage. General cohort/location information is not a candidate availability or relocation commitment. No intake answers or recruiter contact information are stored in the site.
