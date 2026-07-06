# Interview OS

A command-center dashboard for interview prep: resume STAR stories, technical
Q&A, and behavioral questions, all searchable and filterable by tag. Built to
keep growing — add content by editing a data file and pushing.

**Stack:** pure HTML/CSS/JS. No frameworks, no build step.

## Live site

**https://anuvik2401.github.io/Resume-Griller/**

Deploys automatically via GitHub Actions on every push to `main`.

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Page shell |
| `styles.css` | Command-center dark theme |
| `app.js` | Rendering, search, filtering, module switching |
| `data/star-bank.js` | Resume bullets → STAR answers, tagged by role/competency |
| `data/technical-bank.js` | Technical Q&A grouped by category (agents, SQL, DevOps, ML, system design, etc.) |
| `data/behavioral-bank.js` | Common behavioral questions mapped to competencies, linked to matching STAR stories |

## Adding content

Everything is data-driven — add an object to the relevant array in `data/`,
push, and it shows up automatically (tags, filters, and counts all derive
from the data).

**`star-bank.js`** — one entry per resume bullet:
```js
{
  role: "Company · Title",
  bullet: "The exact resume line.",
  situation: "...", task: "...", action: "...", result: "...",
  tags: ["agents", "impact"]   // used for search + filter chips
}
```

**`technical-bank.js`** — one entry per question:
```js
{
  category: "System Design",   // groups questions in the UI
  question: "...",
  answer: "...",               // concise, direct — no filler
  tags: ["system-design", "reliability"]
}
```

**`behavioral-bank.js`** — one entry per competency question:
```js
{
  competency: "Ownership",
  question: "...",
  guidance: "What a strong answer should hit.",
  linkedTags: ["ownership"]     // matches tags in star-bank.js to suggest stories
}
```

```bash
git add data/technical-bank.js
git commit -m "content: add distributed systems questions"
git push       # Pages redeploys in ~1 min
```

## Using it

- **Search** (top bar) matches across question/answer/role/tags for whichever
  module is active.
- **Module tabs** switch between Resume · STAR, Technical, and Behavioral.
- **Filter chips** narrow to a tag within the current module; click again to clear.
- **Cards expand in place** — click to reveal the full answer, click again to
  collapse. Any answer text is editable directly (click into it) so you can
  refine wording as you rehearse, though edits aren't persisted — treat the
  data files as the source of truth.

## Mac / iPad

Just open the Pages URL — no login, no local state to sync. On iPad: Safari
→ Share → **Add to Home Screen** for an app-like icon.
