# Claude Code prompts to finish the Amazon module

Run these in order from the repo root (`~/Documents/Projects/Resume-Griller-main`). Copy the `amazon/` folder in first. Commit after each prompt.

## Prompt 1: Data layer
```
Read salesforce/README.md, salesforce/data/*.json and salesforce/data/schema/*.json to learn the data model.
Then read amazon/stories.md, amazon/aws-terms.md and amazon/questions.md.
Create amazon/data/ with: profile.json (copy salesforce/data/profile.json, same numbers), loop.json
(3 on-campus rounds at USC, OA completed Oct 14 2026, interview date Oct 28 2026 pending confirmation),
behavioral.json (the 12 stories, each tagged with Amazon Leadership Principles instead of Salesforce values,
plus the 16-LP map and 3 gap entries), aws.json (every service from aws-terms.md as {id, category, name,
one_liner, use_when, avoid_when}), questions.json (sections A to F from questions.md) and designs.json
(the 6 whiteboard designs, each with requirements, components, flow, tradeoff, failure modes).
Add matching JSON schemas under amazon/data/schema/. Reuse common.schema.json patterns.
Do not invent metrics: every number must exist in profile.json. No em or en dashes anywhere.
```

## Prompt 2: Pages
```
Build amazon/ pages reusing salesforce/css and salesforce/js patterns (copy shared runtime into amazon/js
or import it; no build step, vanilla JS):
- amazon/index.html: loop tracker (OA done, on-campus rounds, countdown to Oct 28), checklist per round, progress.
- amazon/behavioral.html: 60-second pitch, story cards with S/T/A/R, LP filter chips, "SA twist" and probes
  collapsed by default, gap stories flagged in red, rehearsal timer (90 sec), status draft/rehearsing/ready.
- amazon/aws.html: searchable AWS glossary by category, flashcard mode (front: service, back: one-liner +
  use when), resume-to-AWS mapping table, Well-Architected pillars, 7 Rs, DR tiers.
- amazon/design.html: whiteboard framework plus the 6 designs, each with a "reveal answer" toggle and a timer.
- amazon/questions.html: rapid-fire quiz over section C, LP question randomizer that picks a question and
  suggests 2 stories, customer role-play scenarios with a checklist.
Mobile friendly, light and dark mode, progress in localStorage with export/import like salesforce.
Add an "Amazon SA Prep" button on the root index.html next to Salesforce Prep.
```

## Prompt 3: Checks and deploy
```
Copy salesforce/scripts/check.mjs to amazon/scripts/check.mjs and adapt it: validate amazon/data against
the schemas, fail on em/en dashes, duplicate ids, broken story/LP cross references, any metric not in
profile.json, and Oracle tenure written as anything other than "nearly 3 years" or "about 3 years".
Add a test that every LP has at least one story. Update .github/workflows/pages.yml to run the amazon checks.
Write amazon/README.md in the same style as salesforce/README.md. Run all checks, serve with
python3 -m http.server 8000, open http://localhost:8000/amazon/ and verify each page renders.
Then commit and push to main.
```

## Prompt 4: Mock interview mode (optional)
```
Add amazon/mock.html: a 45-minute round simulator. It shows 2 random LP questions and 1 technical or design
question, runs a timer per question, lets me type notes, then shows a self-score rubric (STAR complete,
metric stated, "I" not "we", under 2 minutes, tradeoff named) and saves history in localStorage.
```

## Before the loop: fill these yourself
- Failure, disagreement, and mentoring stories (templates at the bottom of stories.md).
- Confirm round format and start time in PT with Naomi.
