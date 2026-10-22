# Resume Griller

Interview prep for Anuvik Thota. Static HTML, CSS, and vanilla JS with JSON content; no build step. Every page shares one interview bar (`shared/switcher.js`) that switches modules and shows each countdown from the module's `data/loop.json`.

Live site: https://anuvik2401.github.io/Resume-Griller/

| Module | Interview | Live | Docs |
|---|---|---|---|
| Amazon SA Prep | AWS Solutions Architect, L4, AWSI Emerging Talent Program. Confirmed: four 60-minute rounds on the USC campus, Wednesday October 28, 2026, 9:30 am to 2:30 pm | [amazon/](https://anuvik2401.github.io/Resume-Griller/amazon/) | [amazon/README.md](amazon/README.md) |
| Salesforce Prep | Software Engineering MTS, hiring manager round Thursday October 22, 2026 | [salesforce/](https://anuvik2401.github.io/Resume-Griller/salesforce/) | [salesforce/README.md](salesforce/README.md) |
| General bank (archived) | Older general question bank; numbers predate the current resume | [general-prep.html](https://anuvik2401.github.io/Resume-Griller/general-prep.html) | |
| Google (archived) | Earlier Google prep; numbers predate the current resume | [google-prep.html](https://anuvik2401.github.io/Resume-Griller/google-prep.html) | |

Amazon pages: [7-day plan](https://anuvik2401.github.io/Resume-Griller/amazon/index.html), [technical domains](https://anuvik2401.github.io/Resume-Griller/amazon/domains.html), [Leadership Principles](https://anuvik2401.github.io/Resume-Griller/amazon/behavioral.html), [presentation](https://anuvik2401.github.io/Resume-Griller/amazon/presentation.html), [mock day](https://anuvik2401.github.io/Resume-Griller/amazon/mock.html), [printable final review](https://anuvik2401.github.io/Resume-Griller/amazon/final-review.html), [presentation handout](https://anuvik2401.github.io/Resume-Griller/amazon/presentation-handout.html), [AWS glossary](https://anuvik2401.github.io/Resume-Griller/amazon/aws.html), [look-alike pairs](https://anuvik2401.github.io/Resume-Griller/amazon/compare.html), [whiteboard designs](https://anuvik2401.github.io/Resume-Griller/amazon/design.html), [IT fundamentals](https://anuvik2401.github.io/Resume-Griller/amazon/fundamentals.html).

## Run locally

```sh
python3 -m http.server 8000
# http://localhost:8000/
```

The pages fetch local JSON, so they need HTTP, not `file://`. Progress, notes, and drafts save in your browser and can be exported from each module's sidebar.

## Checks and deploy

`.github/workflows/pages.yml` runs on every push to `main`: the Salesforce and Amazon content checks, unit and integration tests, the Python reference solutions, the Amazon browser tests, and `shared/test_pages.mjs`, which loads every page at 390px and desktop width in light and dark mode and fails on console errors, failed requests, or horizontal overflow. GitHub Pages deploys only when all of them pass. See each module's README for the commands.

## Privacy

The site is public. No recruiter or interviewer names, emails, phone numbers, case numbers, or personal status details belong in any file; `amazon/scripts/check.mjs` scans the whole repo and fails the build if one appears.
