# Salesforce MTS prep

Interview prep for the Salesforce Software Engineering MTS loop (JR359223), part of Resume Griller. Static HTML, CSS, and vanilla JS. No build step.

| Page | What it covers |
|---|---|
| `index.html` | Loop tracker: next-round countdown, six stages with status, date, checklist; progress across sections |
| `behavioral.html` | 90-second pitch, numbers quiz, a STAR story for every resume bullet mapped to Salesforce values, competency gaps, V2MOM, questions for the HM |
| `ai.html` | AI fundamentals flashcards with the AI SRE anchor answer, decision table, honest gaps |
| `hld.html` | System design framework, cheat sheet, GCP mapping, 4 designs, whiteboard mode |
| `dsa.html` | All 193 Salesforce-tagged LeetCode problems by pattern, 51 with tested solutions, OA simulator |
| `lld.html` | 7 object-oriented designs with tested solutions and catch-the-AI exercises |

All content lives in `data/*.json`; the pages only render it.

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
```

Fails on em or en dashes, duplicate ids, broken cross references, and copy that contradicts `data/profile.json`.


## Live site

https://anuvik2401.github.io/Resume-Griller/salesforce/

Deployed by the repo's GitHub Pages workflow on every push to `main`.

## Privacy

The site is public. Keep the visa case number, contact names, and anything else private out of `data/`. Progress, notes, and drafts live only in your browser's localStorage and are never committed; use Export to back them up.
