# Resume → STAR

Turns resume bullet points into concise STAR-format (Situation / Task / Action /
Result) interview answers. Loads pre-written for my own resume by default; paste
any other bullets in to get an editable draft.

**Stack:** pure HTML/CSS/JS. No frameworks, no build step. One page, dark theme.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page shell |
| `styles.css` | Dark theme, responsive |
| `app.js` | Parses bullets, renders editable STAR cards |
| `star-data.js` | **Pre-written STAR answers for my resume bullets — edit this one** |

## Live site

**https://anuvik2401.github.io/Resume-Griller/**

Deploys automatically via GitHub Actions (`.github/workflows/`) on every push to `main`.

## Editing your STAR answers

Edit the objects in `star-data.js` — each has `bullet`, `situation`, `task`,
`action`, `result`. The `bullet` text must match your resume line exactly for
the app to find it; anything pasted into the textarea that isn't in
`star-data.js` gets an auto-generated draft instead (fill in the blanks by
clicking into any field — it's editable in place).

```bash
git add star-data.js
git commit -m "content: refine ERP migration STAR answer"
git push       # Pages redeploys in ~1 min
```

## Usage on Mac / iPad

Just open the Pages URL — works in any browser, syncs nothing (it's stateless,
no login, no localStorage dependency for the core content). On iPad, Safari →
Share → **Add to Home Screen** for an app-like icon.
