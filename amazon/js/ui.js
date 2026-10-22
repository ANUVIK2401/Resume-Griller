// Shared UI pieces used by every segment renderer.
(function () {
  const { el, icon, store } = { ...window.Prep, store: window.Prep.store };

  // <section data-toc> feeds the sidebar "On this page" list.
  function section(id, toc, eyebrow, title, ...children) {
    return el('section', { class: 'section', id, 'data-toc': toc, 'aria-labelledby': `${id}-h` },
      el('p', { class: 'eyebrow' }, eyebrow),
      el('h2', { class: 'section-title', id: `${id}-h` }, title),
      ...children);
  }

  // Highlights "[fill: ...]" placeholders so unwritten specifics stand out.
  function fill(text) {
    return String(text).split(/(\[fill:[^\]]*\])/).map((part) =>
      part.startsWith('[fill:') ? el('mark', { class: 'fill' }, part.slice(6, -1).trim()) : part);
  }

  // Status per item. options: [{ id, label }], first option is the default.
  function statusSelect(id, options, onChange) {
    const select = el('select', { class: 'field field-sm status', 'aria-label': 'Status' },
      options.map((o) => el('option', { value: o.id }, o.label)));
    select.value = store.get('status', id, options[0].id);
    select.dataset.status = select.value;
    select.addEventListener('change', () => {
      store.set('status', id, select.value === options[0].id ? null : select.value);
      select.dataset.status = select.value;
      onChange?.(select.value);
    });
    return select;
  }

  // Flush only dirty notes, including text entered just before navigation.
  let pendingNotes = new Set();
  const flushNotes = () => [...pendingNotes].forEach((flush) => flush());
  window.addEventListener('pagehide', flushNotes);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushNotes(); });

  function notesBox(id, placeholder = 'Your notes') {
    const area = el('textarea', { class: 'field notes', rows: '3', maxlength: '100000', placeholder, 'aria-label': placeholder });
    area.value = store.get('notes', id, '');
    let handle;
    const flush = () => {
      if (!pendingNotes.has(flush)) return;
      clearTimeout(handle);
      store.set('notes', id, area.value.trim() ? area.value : null);
      pendingNotes = new Set([...pendingNotes].filter((entry) => entry !== flush));
    };
    area.addEventListener('input', () => {
      clearTimeout(handle);
      pendingNotes = new Set([...pendingNotes, flush]);
      handle = setTimeout(flush, 400);
    });
    area.addEventListener('blur', flush);
    return area;
  }

  // Confidence 1 to 5 as a radio group.
  function confidence(id) {
    const name = `conf-${id}`;
    const current = store.get('confidence', id, 0);
    return el('fieldset', { class: 'confidence' },
      el('legend', {}, 'Confidence'),
      [1, 2, 3, 4, 5].map((n) => el('label', {},
        el('input', { type: 'radio', name, value: String(n), checked: n === current, onchange: () => store.set('confidence', id, n) }),
        el('span', {}, String(n)))));
  }

  function checkbox(id, label) {
    return el('label', { class: 'check' },
      el('input', { type: 'checkbox', checked: store.get('checks', id, false), onchange: (e) => store.set('checks', id, e.target.checked || null) }),
      el('span', {}, label));
  }

  function codeBlock(text, label = 'python') {
    const pre = el('pre', { class: 'code', tabindex: '0' }, el('code', {}, text));
    const copy = el('button', { class: 'code-copy', type: 'button' }, 'Copy');
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        copy.textContent = 'Copied';
      } catch {
        copy.textContent = 'Select and copy';
      }
      setTimeout(() => { copy.textContent = 'Copy'; }, 1400);
    });
    return el('div', { class: 'code-wrap' }, el('div', { class: 'code-bar' }, el('span', {}, label), copy), pre);
  }

  // Search plus selects. Calls onChange({ q, [key]: value }) on every edit.
  function filterBar({ placeholder = 'Search', selects = [], toggles = [], onChange }) {
    let state = { q: '' };
    const update = (patch) => { state = { ...state, ...patch }; onChange({ ...state }); };
    const search = el('input', { class: 'field', type: 'search', placeholder, 'aria-label': placeholder });
    search.addEventListener('input', () => update({ q: search.value.trim().toLowerCase() }));
    const selectNodes = selects.map(({ key, label, options }) => {
      state = { ...state, [key]: '' };
      const s = el('select', { class: 'field', 'aria-label': label },
        el('option', { value: '' }, label), options.map((o) => el('option', { value: o.id }, o.label)));
      s.addEventListener('change', () => update({ [key]: s.value }));
      return s;
    });
    const toggleInputs = toggles.map(({ key }) => {
      state = { ...state, [key]: false };
      return el('input', { type: 'checkbox', onchange: (e) => update({ [key]: e.target.checked }) });
    });
    const toggleNodes = toggles.map(({ label }, i) => el('label', { class: 'check check-pill' }, toggleInputs[i], el('span', {}, label)));
    const toolbar = el('div', { class: 'toolbar', role: 'search' }, search, selectNodes, toggleNodes);
    toolbar.resetFilters = () => {
      search.value = '';
      selectNodes.forEach((select) => { select.value = ''; });
      toggleInputs.forEach((input) => { input.checked = false; });
      state = Object.fromEntries(Object.entries(state).map(([key, value]) => [key, typeof value === 'boolean' ? false : '']));
      onChange({ ...state });
    };
    return toolbar;
  }

  // Use a deadline so background tabs and delayed ticks count real elapsed time.
  function timer(minutes, onEnd) {
    const duration = Math.round(Number(minutes) * 60000);
    if (!Number.isFinite(duration) || duration <= 0) throw new Error('Timer duration must be positive.');
    let remaining = duration;
    let deadline = null;
    let handle = null;
    let ended = false;
    const lowAt = Math.min(300000, duration * 0.2);
    const face = el('span', { class: 'timer-face', role: 'timer', 'aria-live': 'off' });
    const paint = () => {
      const seconds = Math.ceil(remaining / 1000);
      face.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
      face.classList.toggle('is-low', remaining <= lowAt);
    };
    const stop = () => {
      if (deadline !== null) remaining = Math.max(0, deadline - Date.now());
      deadline = null;
      clearInterval(handle);
      handle = null;
      document.removeEventListener('visibilitychange', tick);
      toggle.textContent = remaining <= 0 ? 'Done' : 'Start';
      paint();
    };
    const tick = () => {
      if (deadline === null) return;
      remaining = Math.max(0, deadline - Date.now());
      paint();
      if (remaining > 0) return;
      stop();
      if (!ended) { ended = true; onEnd?.(); }
    };
    const start = () => {
      if (handle !== null || remaining <= 0) return;
      deadline = Date.now() + remaining;
      toggle.textContent = 'Pause';
      handle = setInterval(tick, 250);
      document.addEventListener('visibilitychange', tick);
    };
    const reset = () => { stop(); remaining = duration; ended = false; toggle.textContent = 'Start'; paint(); };
    const toggle = el('button', { class: 'btn btn-sm', type: 'button', onclick: () => (handle !== null ? stop() : start()) }, 'Start');
    paint();
    return { node: el('div', { class: 'timer' }, face, toggle, el('button', { class: 'btn btn-sm', type: 'button', onclick: reset }, 'Reset')), start, stop, reset };
  }

  // Counts up; onTick(seconds, face) lets the caller paint windows, sections, or warnings.
  function stopwatch(onTick) {
    let elapsed = 0;
    let startedAt = null;
    let handle = null;
    const face = el('span', { class: 'timer-face', role: 'timer', 'aria-live': 'off' });
    const now = () => elapsed + (startedAt === null ? 0 : Date.now() - startedAt);
    const seconds = () => Math.floor(now() / 1000);
    const paint = () => {
      const s = seconds();
      face.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
      onTick?.(s, face, handle !== null);
    };
    const toggle = el('button', { class: 'btn btn-sm', type: 'button' }, 'Start');
    const start = () => {
      if (handle !== null) return;
      startedAt = Date.now();
      handle = setInterval(paint, 250);
      toggle.textContent = 'Pause';
      paint();
    };
    const stop = () => {
      if (handle === null) return;
      elapsed = now();
      startedAt = null;
      clearInterval(handle);
      handle = null;
      toggle.textContent = 'Start';
      paint();
    };
    const reset = () => { stop(); elapsed = 0; paint(); };
    toggle.addEventListener('click', () => (handle !== null ? stop() : start()));
    paint();
    return { node: el('div', { class: 'timer' }, face, toggle, el('button', { class: 'btn btn-sm', type: 'button', onclick: reset }, 'Reset')), start, stop, reset, seconds };
  }

  // 2 to 4 minute story stopwatch with a live status line.
  const STORY_STATUS = {
    short: { live: 'Keep going: aim past 2:00.', done: 'Under 2:00. Add the obstacle, the tradeoff, and the metric.' },
    ok: { live: 'In the 2 to 4 minute window.', done: 'In the window. Good length.' },
    long: { live: 'Over 4:00. Land the result and stop.', done: 'Over 4:00. Cut the situation down.' },
  };
  function storyTimer(min = 120, max = 240) {
    const status = el('span', { class: 'timer-status', 'aria-live': 'polite' });
    const watch = stopwatch((s, face, running) => {
      const state = window.Prep.practice.windowStatus(s, min, max);
      face.dataset.window = s === 0 ? '' : state;
      status.dataset.window = s === 0 ? '' : state;
      status.textContent = s === 0 ? 'Target: 2:00 to 4:00' : STORY_STATUS[state][running ? 'live' : 'done'];
    });
    return { ...watch, node: el('div', { class: 'row' }, watch.node, status) };
  }

  // Full-screen flashcard dialog. items: [{ kicker, front: () => Node, back: () => Node }]
  // Keyboard: space reveals, j and k move, esc closes. Touch: tap the card to reveal, swipe to move.
  function rehearse(items, title = 'Rehearse') {
    if (!items.length) return;
    let i = 0;
    let revealed = false;
    const count = el('span', { class: 'rh-count' });
    const body = el('div', { class: 'rh-body' });
    const revealBtn = el('button', { class: 'btn btn-gold', type: 'button' });
    const dialog = el('dialog', { class: 'rehearse', 'aria-label': title },
      el('div', { class: 'rh-top' },
        el('span', { class: 'rh-title' }, title), count,
        el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Close', onclick: () => dialog.close() }, icon('close'))),
      body,
      el('div', { class: 'rh-controls' },
        el('button', { class: 'btn', type: 'button', onclick: () => go(-1) }, el('kbd', {}, 'k'), ' Previous'),
        revealBtn,
        el('button', { class: 'btn', type: 'button', onclick: () => go(1) }, 'Next ', el('kbd', {}, 'j'))));
    const paint = () => {
      const item = items[i];
      count.textContent = `${i + 1} / ${items.length}`;
      body.replaceChildren(
        item.kicker ? el('p', { class: 'eyebrow' }, item.kicker) : null,
        el('div', { class: 'rh-front' }, item.front()),
        revealed ? el('div', { class: 'rh-back' }, item.back()) : el('p', { class: 'rh-hint' }, 'Say your answer out loud, then tap the card or Reveal. Swipe to move.'));
      revealBtn.replaceChildren(revealed ? 'Hide ' : 'Reveal ', el('kbd', {}, 'space'));
    };
    const go = (d) => { i = (i + d + items.length) % items.length; revealed = false; paint(); };
    revealBtn.addEventListener('click', () => { revealed = !revealed; paint(); });
    // Tap anywhere on the card (not on a control) to reveal; horizontal swipe moves.
    const SWIPE_PX = 60;
    let startX = null;
    let startY = null;
    body.addEventListener('pointerdown', (e) => { startX = e.clientX; startY = e.clientY; });
    body.addEventListener('pointerup', (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      startX = null;
      if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) { go(dx < 0 ? 1 : -1); return; }
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && !e.target.closest('a, button, input, textarea, select, summary')) {
        revealed = !revealed;
        paint();
      }
    });
    dialog.addEventListener('keydown', (e) => {
      if (e.target.closest('input, textarea, select')) return;
      const actions = { ' ': () => { revealed = !revealed; paint(); }, j: () => go(1), k: () => go(-1) };
      if (!actions[e.key]) return;
      e.preventDefault();
      e.stopPropagation();
      actions[e.key]();
    });
    dialog.addEventListener('close', () => dialog.remove());
    document.body.append(dialog);
    paint();
    dialog.showModal();
  }

  function shuffle(list) {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  const list = (items, cls = 'list') => el('ul', { class: cls }, items.map((t) => el('li', {}, fill(t))));

  const table = (headers, rows) => el('div', { class: 'table-wrap' }, el('table', { class: 'table' },
    el('thead', {}, el('tr', {}, headers.map((h) => el('th', { scope: 'col' }, h)))),
    el('tbody', {}, rows.map((r) => el('tr', {}, r.map((c) => el('td', {}, c)))))));


  window.Prep.ui = { section, fill, table, statusSelect, notesBox, confidence, checkbox, codeBlock, filterBar, timer, stopwatch, storyTimer, rehearse, shuffle, list };
})();
