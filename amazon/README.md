# Amazon AWSI ETP Solutions Architect prep

Interview prep for the AWS Emerging Talent Program, Solutions Architect (AWSI) on-campus loop at USC, part of Resume Griller. Static HTML, CSS, and vanilla JS. No build step.

| Page | What it covers |
|---|---|
| `index.html` | Countdown to the loop, a 14-day plan with daily tasks, the OA and three rounds with checklists, progress across sections |
| `behavioral.html` | 60-second pitch, numbers quiz, 16-LP map, 12 STAR stories (open-with headline, S/T/A/R, close-with lesson) with LP filter chips, SA twist and probes folded, 90-second timer, gap stories |
| `aws.html` | 114 AWS terms by category with "pick it when" and "avoid when", flashcards, resume-to-AWS map, 6 pillars, 7 Rs, DR tiers, shared responsibility |
| `design.html` | 7-step whiteboard framework and 6 designs, each with a 30-minute timer and a hidden answer with diagram |
| `questions.html` | Openers, 24 rapid-fire questions with a self-graded quiz, LP randomizer with suggested stories, 6 customer role-plays, questions to ask |
| `mock.html` | 45-minute round: 2 LP questions and 1 technical item, timers, notes, a 5-check self-score, saved history |

All content lives in `data/*.json`; the pages only render it. `data/profile.json` is a copy of `salesforce/data/profile.json` and is the ground truth for every number. `stories.md` is generated from `data/behavioral.json` (`node amazon/scripts/stories_md.mjs`) and the check fails if it is stale. `aws-terms.md` and `questions.md` are the original sources the JSON was built from.

## Run locally

Browsers block `fetch()` of local JSON from a `file://` page, so serve the repo root:

```sh
python3 -m http.server 8000
# open http://localhost:8000/amazon/
```

## Check content before committing

Run from the repo root:

```sh
node amazon/scripts/check.mjs          # schemas, dashes, ids, cross refs, metrics, tenure
node amazon/scripts/test_practice.mjs  # LP coverage, randomizer, mock scoring, plan dates, progress store
```

`check.mjs` fails on em or en dashes, schema violations, duplicate ids, broken story and LP cross references, any number in the pitch, a story, or the resume map that is not in `profile.json`, and Oracle tenure written as anything other than "close to 3 years". An LP with no story fails the build unless a gap story is planned for it; planned gaps print a warning until you write them.

## Live site

https://anuvik2401.github.io/Resume-Griller/amazon/

Deployed by the repo's GitHub Pages workflow on every push to `main`, after the checks pass.

## Privacy

The site is public. Keep visa details, recruiter names, and contact info out of `data/`. Progress, notes, gap-story drafts, and mock history live only in your browser's localStorage (key `awsprep:v1`, separate from the Salesforce section) and are never committed; use Export in the sidebar to back them up.
