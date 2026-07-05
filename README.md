# Resume Griller 🔥

Elite interview-prep web app built from my resume. 122 questions across 8 tracks with
senior-engineer model answers, spaced-repetition drills, timed interview simulation,
a behavioral story matrix, and a progress dashboard.

**Stack:** pure HTML/CSS/JS. No frameworks, no build step. One page, dark theme.
Only external dependency is `marked.js` from CDN (cached offline by the service worker).

## Files

| File | Purpose |
|------|---------|
| `index.html` | App shell + sidebar |
| `styles.css` | Spotify-style dark theme, responsive at 768px |
| `app.js` | All app logic (views, drill queue, timer, dashboard, export/import) |
| `questions.js` | **The question bank — edit this one** |
| `manifest.json` + `sw.js` + `icon-*.png` | PWA / offline support |

## Getting it on GitHub Pages

```bash
cd Resume-Griller
git init
git add .
git commit -m "feat: initial Resume Griller build"
git branch -M main
git remote add origin git@github.com:ANUVIK2401/Resume-Griller.git
git push -u origin main
```

Enable Pages (either way works):

```bash
# CLI (needs gh auth login):
gh repo create ANUVIK2401/Resume-Griller --public --source=. --push
gh api repos/ANUVIK2401/Resume-Griller/pages -X POST \
  -f "source[branch]=main" -f "source[path]=/"
```

Or in the browser: repo → **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**.

Live at: **https://anuvik2401.github.io/Resume-Griller/**

## Daily editing workflow

```bash
# edit questions.js in any editor, then:
git add questions.js
git commit -m "content: add Kafka follow-ups to oracle-obs"
git push       # Pages redeploys automatically in ~1 min
```

## Adding questions

Append an object to the `QUESTIONS` array in `questions.js`:

```js
{
  id: 'obs-17',                 // unique, prefix by track
  track: 'oracle-obs',          // msrcosmos | oracle-obs | oracle-infra | sql |
                                // modelscope | gnn | usc-rl | behavioral
  difficulty: 2,                // 1 easy · 2 medium · 3 hard
  question: 'The question as an interviewer would ask it?',
  answer: `**Direct answer:** lead with the answer.

**Mechanism:** how it works.

**Tradeoffs:** what it costs.`,   // markdown; avoid backticks inside
  followUps: ['Likely follow-up?'],
  lastReviewed: null, confidence: 0,
  tags: ['prometheus', 'scenario']
}
```

Notes:
- **Behavioral questions:** tags double as Story Matrix columns. Use any of
  `Ownership, Ambiguity, Conflict, Failure, Leadership, Impact, Speed, Deep Dive`
  (exact spelling) to light up matrix dots.
- Progress is keyed by `id` — keep ids stable or you lose that card's history.
- Sanity check after editing: `node --check questions.js`

## Progress & syncing across devices

Confidence ratings, review timestamps, and streaks live in **localStorage** —
per browser, per device. To sync manually:

1. **Export progress** (sidebar) on device A → downloads a JSON file
2. Move it (AirDrop / iCloud / a private gist)
3. **Import progress** on device B — imports are **merged**, newest rating per
   question wins, so it's safe in both directions.

## iPad usage

1. Open the Pages URL in **Safari** on the iPad
2. Share button → **Add to Home Screen** → it installs as a full-screen PWA
   (dark status bar, no browser chrome, its own icon)
3. The service worker caches everything on first load — the app then **works
   fully offline** (airplane mode drilling ✈)
4. After you push new questions, open the app once with network — it fetches
   fresh content network-first and re-caches
5. Tips: the ☰ button toggles the sidebar; cards, confidence buttons, and
   timers are sized for touch (44px+ targets); landscape gives you the
   two-column card grid

## The 8 tracks

1. **MSRcosmos · Agents** — LangGraph multi-agent, MCP, HITL validation, ERP migration
2. **Oracle · Observability** — Prometheus/Grafana, SLOs, burn rates, MTTR, root-cause tagging
3. **Oracle · Infra & CI/CD** — Docker/K8s, HPA on custom metrics, CLI tooling, Jenkins
4. **SQL Optimization** — query plans, indexing, NetSuite latency, multi-tenant skew
5. **ModelScope · Inference** — quantization, Pareto frontiers, TTFT/tok-s, KV cache, PagedAttention
6. **GNN Fraud** — HeteroRGCN, focal loss, graph construction, leakage, GNN vs trees
7. **USC · RL Research** — DQN, reward shaping, multi-GPU pipelines, experiment tracking
8. **Behavioral · STAR** — stories mapped to competencies in the Story Matrix

## Study loop that works

- **New material:** Browse → read answers → rate honestly (0–2 if you couldn't say it aloud)
- **Daily:** one Drill session (20 cards, auto-prioritizes weak + stale)
- **Pre-interview:** Interview Mode on the relevant tracks, 2-min timer, answer out loud
- **Weekly:** Dashboard → attack the reddest track
