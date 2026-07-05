/* ============ Resume Griller — app.js ============ */
/* No frameworks. State lives in localStorage under 'rg-progress'. */

(function () {
  'use strict';

  // ---------- Constants ----------
  const TRACKS = [
    { id: 'msrcosmos',   label: 'MSRcosmos · Agents' },
    { id: 'oracle-obs',  label: 'Oracle · Observability' },
    { id: 'oracle-infra',label: 'Oracle · Infra & CI/CD' },
    { id: 'sql',         label: 'SQL Optimization' },
    { id: 'modelscope',  label: 'ModelScope · Inference' },
    { id: 'gnn',         label: 'GNN Fraud' },
    { id: 'usc-rl',      label: 'USC · RL Research' },
    { id: 'behavioral',  label: 'Behavioral · STAR' },
  ];
  const TRACK_LABEL = Object.fromEntries(TRACKS.map(t => [t.id, t.label]));
  const STORE_KEY = 'rg-progress';
  const LOG_KEY = 'rg-review-log';
  const STALE_DAYS = 4;
  const DEFAULT_TIMER = 120; // seconds

  // Behavioral competency columns for the story matrix
  const COMPETENCIES = ['Ownership', 'Ambiguity', 'Conflict', 'Failure', 'Leadership', 'Impact', 'Speed', 'Deep Dive'];

  // ---------- State ----------
  const state = {
    view: 'browse',
    track: 'all',
    diff: 'all',
    tag: null,
    search: '',
    openCard: null,
    drill: null,       // { queue: [ids], idx }
    interview: null,   // { qid, remaining, timerId, revealed, tracks, duration }
  };

  // ---------- Progress persistence ----------
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch { return {}; }
  }
  function saveProgress(p) { localStorage.setItem(STORE_KEY, JSON.stringify(p)); }
  function loadLog() {
    try { return JSON.parse(localStorage.getItem(LOG_KEY)) || {}; }
    catch { return {}; }
  }
  function saveLog(l) { localStorage.setItem(LOG_KEY, JSON.stringify(l)); }

  let progress = loadProgress();
  let reviewLog = loadLog(); // { 'YYYY-MM-DD': count }

  function qState(id) {
    return progress[id] || { confidence: 0, lastReviewed: null };
  }
  function rateQuestion(id, conf) {
    progress = { ...progress, [id]: { confidence: conf, lastReviewed: new Date().toISOString() } };
    saveProgress(progress);
    const day = todayKey();
    reviewLog = { ...reviewLog, [day]: (reviewLog[day] || 0) + 1 };
    saveLog(reviewLog);
  }
  function todayKey(d) {
    const dt = d || new Date();
    return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
  }

  // ---------- Helpers ----------
  const $ = sel => document.querySelector(sel);
  const main = $('#main');

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function md(text) {
    if (window.marked) return marked.parse(text);
    return '<pre style="white-space:pre-wrap">' + esc(text) + '</pre>';
  }
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 1800);
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function daysSince(iso) {
    if (!iso) return Infinity;
    return (Date.now() - new Date(iso).getTime()) / 86400000;
  }
  function diffLabel(d) { return d === 1 ? '● Easy' : d === 2 ? '●● Medium' : '●●● Hard'; }

  // ---------- Filtering ----------
  function filtered() {
    const s = state.search.trim().toLowerCase();
    return QUESTIONS.filter(q => {
      if (state.track !== 'all' && q.track !== state.track) return false;
      if (state.diff !== 'all' && q.difficulty !== Number(state.diff)) return false;
      if (state.tag && !q.tags.includes(state.tag)) return false;
      if (s && !(q.question.toLowerCase().includes(s) || q.answer.toLowerCase().includes(s) || q.tags.join(' ').toLowerCase().includes(s))) return false;
      return true;
    });
  }

  // ---------- Sidebar rendering ----------
  function renderTrackFilter() {
    const box = $('#track-filter');
    box.innerHTML = '';
    const all = el('button', 'chip' + (state.track === 'all' ? ' active' : ''), 'All <span class="chip-count">' + QUESTIONS.length + '</span>');
    all.addEventListener('click', () => { state.track = 'all'; state.openCard = null; renderTrackFilter(); render(); });
    box.appendChild(all);
    TRACKS.forEach(t => {
      const n = QUESTIONS.filter(q => q.track === t.id).length;
      const b = el('button', 'chip' + (state.track === t.id ? ' active' : ''), esc(t.label) + ' <span class="chip-count">' + n + '</span>');
      b.addEventListener('click', () => {
        state.track = state.track === t.id ? 'all' : t.id;
        state.openCard = null;
        renderTrackFilter(); render();
      });
      box.appendChild(b);
    });
  }

  function renderTagFilter() {
    const box = $('#tag-filter');
    box.innerHTML = '';
    const counts = {};
    QUESTIONS.forEach(q => q.tags.forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
    const tags = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    tags.forEach(t => {
      const b = el('button', 'chip' + (state.tag === t ? ' active' : ''), esc(t));
      b.addEventListener('click', () => {
        state.tag = state.tag === t ? null : t;
        state.openCard = null;
        renderTagFilter(); render();
      });
      box.appendChild(b);
    });
  }

  // ---------- Confidence UI ----------
  function confRow(qid, onRated) {
    const row = el('div', 'conf-row');
    row.appendChild(el('span', 'conf-row-label', 'Confidence:'));
    const cur = qState(qid).confidence;
    for (let i = 0; i <= 5; i++) {
      const b = el('button', 'conf-btn' + (cur === i && qState(qid).lastReviewed ? ' selected' : ''), String(i));
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        rateQuestion(qid, i);
        row.querySelectorAll('.conf-btn').forEach(x => x.classList.remove('selected'));
        b.classList.add('selected');
        toast('Saved: confidence ' + i);
        if (onRated) onRated(i);
      });
      row.appendChild(b);
    }
    return row;
  }

  // ---------- Answer block ----------
  function answerBlock(q) {
    const wrap = el('div', 'answer-wrap');
    const ans = el('div', 'answer');
    ans.innerHTML = md(q.answer);
    const copy = el('button', 'copy-btn', '⧉ Copy');
    copy.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(q.answer).then(
        () => toast('Answer copied'),
        () => toast('Copy failed')
      );
    });
    wrap.appendChild(copy);
    wrap.appendChild(ans);
    if (q.followUps && q.followUps.length) {
      const f = el('div', 'followups');
      f.appendChild(el('div', 'followups-title', 'Likely follow-ups'));
      const ul = el('ul');
      q.followUps.forEach(fu => ul.appendChild(el('li', null, esc(fu))));
      f.appendChild(ul);
      wrap.appendChild(f);
    }
    return wrap;
  }

  function metaRow(q) {
    const meta = el('div', 'qcard-meta');
    meta.appendChild(el('span', 'badge track', esc(TRACK_LABEL[q.track] || q.track)));
    meta.appendChild(el('span', 'badge diff-' + q.difficulty, diffLabel(q.difficulty)));
    const st = qState(q.id);
    if (st.lastReviewed) meta.appendChild(el('span', 'badge conf', 'conf ' + st.confidence + '/5'));
    if (daysSince(st.lastReviewed) > STALE_DAYS && st.lastReviewed) meta.appendChild(el('span', 'badge', 'stale'));
    return meta;
  }

  // ---------- Views ----------
  function render() {
    if (state.interview && state.interview.timerId && state.view !== 'interview') {
      clearInterval(state.interview.timerId);
      state.interview = null;
    }
    main.innerHTML = '';
    ({ browse: renderBrowse, drill: renderDrill, interview: renderInterview, matrix: renderMatrix, dashboard: renderDashboard }[state.view])();
    main.scrollTop = 0;
  }

  // ----- Browse -----
  function renderBrowse() {
    const qs = filtered();
    const head = el('div', 'view-header');
    head.appendChild(el('div', 'view-title', 'Browse'));
    head.appendChild(el('div', 'view-sub', qs.length + ' question' + (qs.length === 1 ? '' : 's') + ' — tap a card to reveal the answer'));
    main.appendChild(head);

    if (!qs.length) {
      main.appendChild(el('div', 'empty-state', '<div class="big">🕳</div>No questions match your filters.'));
      return;
    }
    const grid = el('div', 'card-grid');
    qs.forEach(q => {
      const open = state.openCard === q.id;
      const card = el('article', 'qcard' + (open ? ' open' : ''));
      card.appendChild(metaRow(q));
      card.appendChild(el('div', 'qcard-q', esc(q.question)));
      if (open) {
        card.appendChild(answerBlock(q));
        const tr = el('div', 'tag-row');
        q.tags.forEach(t => tr.appendChild(el('span', 'tag-pill', esc(t))));
        card.appendChild(tr);
        card.appendChild(confRow(q.id));
        const close = el('button', 'secondary-btn', 'Close');
        close.style.marginTop = '14px';
        close.addEventListener('click', (e) => { e.stopPropagation(); state.openCard = null; render(); });
        card.appendChild(close);
      } else {
        card.appendChild(el('div', 'qcard-hint', 'Tap to flip ↩'));
        card.addEventListener('click', () => { state.openCard = q.id; render(); });
      }
      grid.appendChild(card);
    });
    main.appendChild(grid);
  }

  // ----- Drill mode: spaced-repetition queue -----
  function buildDrillQueue() {
    // Priority score: low confidence first, then stalest. Unreviewed = highest priority.
    const scored = filtered().map(q => {
      const st = qState(q.id);
      const staleness = Math.min(daysSince(st.lastReviewed), 60);
      const score = (5 - st.confidence) * 10 + staleness;
      return { id: q.id, score };
    });
    scored.sort((a, b) => b.score - a.score);
    // Take top 20, lightly shuffled within priority bands so runs aren't identical
    const top = scored.slice(0, 20);
    const bands = [top.slice(0, 7), top.slice(7, 14), top.slice(14)];
    return bands.flatMap(shuffle).map(x => x.id);
  }

  function renderDrill() {
    const head = el('div', 'view-header');
    head.appendChild(el('div', 'view-title', 'Drill Mode'));
    head.appendChild(el('div', 'view-sub', 'Spaced repetition — lowest-confidence and stalest cards first. Rate yourself honestly after each.'));
    main.appendChild(head);

    if (!state.drill) {
      const stage = el('div', 'stage');
      const card = el('div', 'stage-card');
      const pool = filtered().length;
      card.appendChild(el('div', 'stage-q', 'Ready to drill?'));
      card.appendChild(el('p', null, '<span style="color:var(--text-dim)">Queue draws from your current sidebar filters (' + pool + ' questions in pool). Sessions are 20 cards or fewer.</span>'));
      const actions = el('div', 'stage-actions');
      const start = el('button', 'primary-btn', '▶ Start session');
      start.addEventListener('click', () => {
        const queue = buildDrillQueue();
        if (!queue.length) { toast('No questions in pool'); return; }
        state.drill = { queue, idx: 0, revealed: false };
        render();
      });
      actions.appendChild(start);
      card.appendChild(actions);
      stage.appendChild(card);
      main.appendChild(stage);
      return;
    }

    const d = state.drill;
    if (d.idx >= d.queue.length) {
      const stage = el('div', 'stage');
      const card = el('div', 'stage-card');
      card.appendChild(el('div', 'stage-q', '🏁 Session complete — ' + d.queue.length + ' cards reviewed.'));
      const actions = el('div', 'stage-actions');
      const again = el('button', 'primary-btn', '↻ New session');
      again.addEventListener('click', () => { state.drill = null; renderDrill_reset(); });
      const dash = el('button', 'secondary-btn', 'View dashboard');
      dash.addEventListener('click', () => switchView('dashboard'));
      actions.appendChild(again); actions.appendChild(dash);
      card.appendChild(actions);
      stage.appendChild(card);
      main.appendChild(stage);
      return;
    }

    const q = QUESTIONS.find(x => x.id === d.queue[d.idx]);
    const stage = el('div', 'stage');
    const prog = el('div', 'drill-progress');
    prog.appendChild(el('span', null, 'Card ' + (d.idx + 1) + ' of ' + d.queue.length));
    const st = qState(q.id);
    prog.appendChild(el('span', 'stale-note', st.lastReviewed
      ? 'last reviewed ' + Math.floor(daysSince(st.lastReviewed)) + 'd ago · conf ' + st.confidence + '/5'
      : 'never reviewed'));
    stage.appendChild(prog);
    const bar = el('div', 'drill-bar');
    const fill = el('div', 'drill-bar-fill');
    fill.style.width = (d.idx / d.queue.length * 100) + '%';
    bar.appendChild(fill);
    stage.appendChild(bar);

    const card = el('div', 'stage-card');
    card.appendChild(metaRow(q));
    card.appendChild(el('div', 'stage-q', esc(q.question)));

    if (d.revealed) {
      card.appendChild(answerBlock(q));
      card.appendChild(confRow(q.id, () => {
        setTimeout(() => { d.idx += 1; d.revealed = false; render(); }, 350);
      }));
      const actions = el('div', 'stage-actions');
      const skip = el('button', 'secondary-btn', 'Next without rating →');
      skip.addEventListener('click', () => { d.idx += 1; d.revealed = false; render(); });
      actions.appendChild(skip);
      card.appendChild(actions);
    } else {
      const actions = el('div', 'stage-actions');
      const reveal = el('button', 'primary-btn', 'Reveal answer');
      reveal.addEventListener('click', () => { d.revealed = true; render(); });
      const skip = el('button', 'secondary-btn', 'Skip →');
      skip.addEventListener('click', () => { d.idx += 1; render(); });
      actions.appendChild(reveal); actions.appendChild(skip);
      card.appendChild(actions);
    }
    stage.appendChild(card);
    main.appendChild(stage);
  }
  function renderDrill_reset() { render(); }

  // ----- Interview mode -----
  function renderInterview() {
    const head = el('div', 'view-header');
    head.appendChild(el('div', 'view-title', 'Interview Mode'));
    head.appendChild(el('div', 'view-sub', 'Random question, answer out loud, no peeking until the timer ends (or you reveal).'));
    main.appendChild(head);

    const stage = el('div', 'stage');

    if (!state.interview || !state.interview.qid) {
      const card = el('div', 'stage-card');
      const cfg = el('div', 'interview-config');
      const trackSel = el('select');
      trackSel.innerHTML = '<option value="all">All tracks</option>' + TRACKS.map(t => '<option value="' + t.id + '">' + esc(t.label) + '</option>').join('');
      const durSel = el('select');
      [[60, '1 min'], [120, '2 min (default)'], [180, '3 min'], [300, '5 min']].forEach(([v, l]) => {
        durSel.innerHTML += '<option value="' + v + '"' + (v === DEFAULT_TIMER ? ' selected' : '') + '>' + l + '</option>';
      });
      cfg.appendChild(trackSel); cfg.appendChild(durSel);
      card.appendChild(cfg);
      card.appendChild(el('div', 'stage-q', 'Simulate the pressure. One random question, one timer.'));
      const actions = el('div', 'stage-actions');
      const start = el('button', 'primary-btn', '🎲 Draw question');
      start.addEventListener('click', () => {
        const pool = QUESTIONS.filter(q => trackSel.value === 'all' || q.track === trackSel.value);
        if (!pool.length) { toast('No questions in that track'); return; }
        const q = pool[Math.floor(Math.random() * pool.length)];
        startInterview(q.id, Number(durSel.value), trackSel.value);
      });
      actions.appendChild(start);
      card.appendChild(actions);
      stage.appendChild(card);
      main.appendChild(stage);
      return;
    }

    const iv = state.interview;
    const q = QUESTIONS.find(x => x.id === iv.qid);
    const card = el('div', 'stage-card');
    card.appendChild(metaRow(q));

    const ring = el('div', 'timer-ring');
    const mm = Math.floor(Math.max(iv.remaining, 0) / 60);
    const ss = String(Math.max(iv.remaining, 0) % 60).padStart(2, '0');
    const tv = el('div', 'timer-val' + (iv.remaining <= 0 ? ' done' : iv.remaining <= 15 ? ' low' : ''), mm + ':' + ss);
    ring.appendChild(tv);
    ring.appendChild(el('div', 'timer-sub', iv.remaining > 0 ? 'Answer out loud. Structure first, then depth.' : 'Time. Compare against the model answer.'));
    card.appendChild(ring);

    card.appendChild(el('div', 'stage-q', esc(q.question)));

    if (iv.revealed || iv.remaining <= 0) {
      if (iv.timerId) { clearInterval(iv.timerId); iv.timerId = null; }
      card.appendChild(answerBlock(q));
      card.appendChild(confRow(q.id));
      const actions = el('div', 'stage-actions');
      const next = el('button', 'primary-btn', '🎲 Next question');
      next.addEventListener('click', () => {
        const pool = QUESTIONS.filter(x => iv.tracks === 'all' || x.track === iv.tracks);
        const nq = pool[Math.floor(Math.random() * pool.length)];
        startInterview(nq.id, iv.duration, iv.tracks);
      });
      const stop = el('button', 'secondary-btn', 'End session');
      stop.addEventListener('click', () => { clearInterviewTimer(); state.interview = null; render(); });
      actions.appendChild(next); actions.appendChild(stop);
      card.appendChild(actions);
    } else {
      const actions = el('div', 'stage-actions');
      const reveal = el('button', 'secondary-btn', 'Reveal early');
      reveal.addEventListener('click', () => { iv.revealed = true; render(); });
      const redraw = el('button', 'secondary-btn', '↻ Different question');
      redraw.addEventListener('click', () => {
        const pool = QUESTIONS.filter(x => iv.tracks === 'all' || x.track === iv.tracks);
        const nq = pool[Math.floor(Math.random() * pool.length)];
        startInterview(nq.id, iv.duration, iv.tracks);
      });
      actions.appendChild(reveal); actions.appendChild(redraw);
      card.appendChild(actions);
    }
    stage.appendChild(card);
    main.appendChild(stage);
  }

  function clearInterviewTimer() {
    if (state.interview && state.interview.timerId) clearInterval(state.interview.timerId);
  }
  function startInterview(qid, duration, tracks) {
    clearInterviewTimer();
    state.interview = { qid, remaining: duration, duration, tracks, revealed: false, timerId: null };
    state.interview.timerId = setInterval(() => {
      state.interview.remaining -= 1;
      if (state.view !== 'interview') { clearInterviewTimer(); return; }
      if (state.interview.remaining <= 0) {
        clearInterval(state.interview.timerId);
        state.interview.timerId = null;
      }
      render();
    }, 1000);
    render();
  }

  // ----- Story matrix -----
  function renderMatrix() {
    const head = el('div', 'view-header');
    head.appendChild(el('div', 'view-title', 'Story Matrix'));
    head.appendChild(el('div', 'view-sub', 'Every STAR story mapped to the competencies it proves. One story should cover 2–3 columns.'));
    main.appendChild(head);

    const stories = QUESTIONS.filter(q => q.track === 'behavioral');
    const scroll = el('div', 'matrix-scroll');
    const table = el('table', 'matrix');
    const thead = el('thead');
    let hrow = '<tr><th style="text-align:left">Story / Question</th>';
    COMPETENCIES.forEach(c => { hrow += '<th>' + esc(c) + '</th>'; });
    hrow += '</tr>';
    thead.innerHTML = hrow;
    table.appendChild(thead);
    const tbody = el('tbody');
    stories.forEach(q => {
      const tr = el('tr');
      const cell = el('td', 'story-cell', esc(q.question));
      cell.addEventListener('click', () => { state.view = 'browse'; state.track = 'behavioral'; state.openCard = q.id; syncNav(); renderTrackFilter(); render(); });
      tr.appendChild(cell);
      COMPETENCIES.forEach(c => {
        const has = q.tags.some(t => t.toLowerCase() === c.toLowerCase());
        tr.appendChild(el('td', null, has ? '<span class="dot">●</span>' : ''));
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    scroll.appendChild(table);
    main.appendChild(scroll);
  }

  // ----- Dashboard -----
  function renderDashboard() {
    const head = el('div', 'view-header');
    head.appendChild(el('div', 'view-title', 'Dashboard'));
    head.appendChild(el('div', 'view-sub', 'Confidence heatmap and review streak.'));
    main.appendChild(head);

    // Stats
    const reviewedToday = reviewLog[todayKey()] || 0;
    const totalReviewed = QUESTIONS.filter(q => qState(q.id).lastReviewed).length;
    let streak = 0;
    const d = new Date();
    // A streak counts consecutive days with >=1 review, ending today or yesterday
    if (!reviewLog[todayKey(d)]) d.setDate(d.getDate() - 1);
    while (reviewLog[todayKey(d)]) { streak += 1; d.setDate(d.getDate() - 1); }
    const avgConf = totalReviewed
      ? (QUESTIONS.reduce((s, q) => s + (qState(q.id).lastReviewed ? qState(q.id).confidence : 0), 0) / totalReviewed).toFixed(1)
      : '—';

    const stats = el('div', 'stat-row');
    [[reviewedToday, 'reviews today'], [streak, 'day streak 🔥'], [totalReviewed + ' / ' + QUESTIONS.length, 'questions touched'], [avgConf, 'avg confidence']].forEach(([n, l]) => {
      const c = el('div', 'stat-card');
      c.appendChild(el('div', 'stat-num', String(n)));
      c.appendChild(el('div', 'stat-label', l));
      stats.appendChild(c);
    });
    main.appendChild(stats);

    // Heatmap: one row per track, one cell per question, colored by confidence
    main.appendChild(el('div', 'view-sub', '<strong style="color:var(--text)">Per-track confidence heatmap</strong> — each cell is one question. Tap a cell to open it.'));
    const heat = el('div', 'heatmap');
    heat.style.marginTop = '14px';
    const colors = ['#3a3a3a', '#5a3d3d', '#7a5a35', '#7a7a35', '#4a7a45', '#1db954'];
    TRACKS.forEach(t => {
      const row = el('div', 'heat-row');
      row.appendChild(el('div', 'heat-label', esc(t.label)));
      const cells = el('div', 'heat-cells');
      QUESTIONS.filter(q => q.track === t.id).forEach(q => {
        const st = qState(q.id);
        const cell = el('button', 'heat-cell');
        cell.style.border = 'none';
        cell.style.cursor = 'pointer';
        cell.style.background = st.lastReviewed ? colors[st.confidence] : '#2a2a2a';
        cell.title = q.question + (st.lastReviewed ? ' — conf ' + st.confidence : ' — unreviewed');
        cell.addEventListener('click', () => { state.view = 'browse'; state.track = t.id; state.openCard = q.id; syncNav(); renderTrackFilter(); render(); });
        cells.appendChild(cell);
      });
      row.appendChild(cells);
      heat.appendChild(row);
    });
    main.appendChild(heat);

    const legend = el('div', 'heat-legend');
    legend.innerHTML =
      '<span><i class="heat-cell" style="display:inline-block;background:#2a2a2a"></i> unreviewed</span>' +
      colors.map((c, i) => '<span><i class="heat-cell" style="display:inline-block;background:' + c + '"></i> ' + i + '</span>').join('');
    main.appendChild(legend);
  }

  // ---------- Export / Import ----------
  function exportProgress() {
    const payload = { app: 'Resume-Griller', exportedAt: new Date().toISOString(), progress, reviewLog };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'resume-griller-progress-' + todayKey() + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Progress exported');
  }
  function importProgress(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || typeof data.progress !== 'object') throw new Error('bad shape');
        // Merge: keep whichever record is newer per question
        const merged = { ...progress };
        Object.entries(data.progress).forEach(([id, rec]) => {
          const mine = merged[id];
          if (!mine || new Date(rec.lastReviewed || 0) > new Date(mine.lastReviewed || 0)) merged[id] = rec;
        });
        progress = merged;
        saveProgress(progress);
        if (data.reviewLog) {
          const log = { ...reviewLog };
          Object.entries(data.reviewLog).forEach(([day, n]) => { log[day] = Math.max(log[day] || 0, n); });
          reviewLog = log;
          saveLog(reviewLog);
        }
        toast('Progress imported & merged');
        render();
      } catch {
        toast('Import failed: not a valid export file');
      }
    };
    reader.readAsText(file);
  }

  // ---------- Navigation ----------
  function syncNav() {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === state.view));
  }
  function switchView(v) {
    state.view = v;
    state.openCard = null;
    syncNav();
    render();
    closeSidebarOnMobile();
  }
  function closeSidebarOnMobile() {
    if (window.innerWidth <= 768) $('#sidebar').classList.remove('open');
  }

  // ---------- Wire up ----------
  document.querySelectorAll('.nav-item').forEach(b => b.addEventListener('click', () => switchView(b.dataset.view)));

  $('#search-box').addEventListener('input', e => {
    state.search = e.target.value;
    state.openCard = null;
    if (state.view !== 'browse') { state.view = 'browse'; syncNav(); }
    render();
  });

  document.querySelectorAll('#diff-filter .chip').forEach(b => {
    b.addEventListener('click', () => {
      state.diff = b.dataset.diff;
      document.querySelectorAll('#diff-filter .chip').forEach(x => x.classList.toggle('active', x === b));
      state.openCard = null;
      render();
    });
  });

  $('#export-btn').addEventListener('click', exportProgress);
  $('#import-btn').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', e => {
    if (e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = '';
  });

  $('#menu-toggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  main.addEventListener('click', closeSidebarOnMobile);

  // ---------- Init ----------
  renderTrackFilter();
  renderTagFilter();
  render();
})();
