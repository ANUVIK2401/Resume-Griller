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

  function notesBox(id, placeholder = 'Your notes') {
    const area = el('textarea', { class: 'field notes', rows: '3', placeholder, 'aria-label': placeholder });
    area.value = store.get('notes', id, '');
    let timer;
    area.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => store.set('notes', id, area.value.trim() ? area.value : null), 400);
    });
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
    const state = { q: '' };
    const search = el('input', { class: 'field', type: 'search', placeholder, 'aria-label': placeholder });
    search.addEventListener('input', () => { state.q = search.value.trim().toLowerCase(); onChange({ ...state }); });
    const selectNodes = selects.map(({ key, label, options }) => {
      state[key] = '';
      const s = el('select', { class: 'field', 'aria-label': label },
        el('option', { value: '' }, label), options.map((o) => el('option', { value: o.id }, o.label)));
      s.addEventListener('change', () => { state[key] = s.value; onChange({ ...state }); });
      return s;
    });
    const toggleNodes = toggles.map(({ key, label }) => {
      state[key] = false;
      return el('label', { class: 'check check-pill' },
        el('input', { type: 'checkbox', onchange: (e) => { state[key] = e.target.checked; onChange({ ...state }); } }),
        el('span', {}, label));
    });
    return el('div', { class: 'toolbar', role: 'search' }, search, selectNodes, toggleNodes);
  }

  // Countdown. Returns { node, start, stop, reset }. onEnd fires once at zero.
  function timer(minutes, onEnd) {
    let left = minutes * 60;
    const lowAt = Math.min(300, minutes * 60 * 0.2); // last 20%, capped at 5 min
    let handle = null;
    const face = el('span', { class: 'timer-face', role: 'timer', 'aria-live': 'off' });
    const paint = () => {
      const m = Math.floor(left / 60);
      const s = left % 60;
      face.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      face.classList.toggle('is-low', left <= lowAt);
    };
    const stop = () => { clearInterval(handle); handle = null; toggle.textContent = 'Start'; };
    const start = () => {
      if (handle || left <= 0) return;
      toggle.textContent = 'Pause';
      handle = setInterval(() => {
        left -= 1;
        paint();
        if (left <= 0) { stop(); onEnd?.(); }
      }, 1000);
    };
    const reset = () => { stop(); left = minutes * 60; paint(); };
    const toggle = el('button', { class: 'btn btn-sm', type: 'button', onclick: () => (handle ? stop() : start()) }, 'Start');
    paint();
    return { node: el('div', { class: 'timer' }, face, toggle, el('button', { class: 'btn btn-sm', type: 'button', onclick: reset }, 'Reset')), start, stop, reset };
  }

  // Full-screen flashcard dialog. items: [{ kicker, front: () => Node, back: () => Node }]
  // space reveals, j and k move, esc closes (native <dialog>).
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
        revealed ? el('div', { class: 'rh-back' }, item.back()) : null);
      revealBtn.replaceChildren(revealed ? 'Hide ' : 'Reveal ', el('kbd', {}, 'space'));
    };
    const go = (d) => { i = (i + d + items.length) % items.length; revealed = false; paint(); };
    revealBtn.addEventListener('click', () => { revealed = !revealed; paint(); });
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

  // Mermaid colors read from the palette; navy nodes and gold lines work on both themes.
  let mermaidReady = false;
  let diagramSeq = 0;
  function initMermaid() {
    if (mermaidReady || !window.mermaid) return Boolean(window.mermaid);
    window.mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      fontFamily: 'Aptos, Segoe UI, system-ui, sans-serif',
      flowchart: { htmlLabels: false, curve: 'basis' }, // SVG text: sized correctly regardless of page CSS
      themeVariables: {
        primaryColor: '#1F2B5C', primaryTextColor: '#FFFFFF', primaryBorderColor: '#C9A35B',
        lineColor: '#C9A35B', secondaryColor: '#131D45', tertiaryColor: '#E9D3A2',
        textColor: '#131D45', edgeLabelBackground: '#E9D3A2', fontSize: '14px',
      },
    });
    mermaidReady = true;
    return true;
  }

  // Mermaid returns sanitized SVG (securityLevel strict) built from our own data files.
  async function drawDiagram(box, source) {
    if (!initMermaid()) {
      box.replaceChildren(el('p', { class: 'muted' }, 'Diagram library failed to load. Source:'), codeBlock(source, 'mermaid'));
      return;
    }
    try {
      await document.fonts.ready; // measure with the real font
      diagramSeq += 1;
      const { svg } = await window.mermaid.render(`mmd-${diagramSeq}`, source);
      box.innerHTML = svg;
    } catch (err) {
      box.replaceChildren(el('p', { class: 'notice is-error' }, `Diagram error: ${err.message}`), codeBlock(source, 'mermaid'));
    }
  }

  const table = (headers, rows) => el('div', { class: 'table-wrap' }, el('table', { class: 'table' },
    el('thead', {}, el('tr', {}, headers.map((h) => el('th', { scope: 'col' }, h)))),
    el('tbody', {}, rows.map((r) => el('tr', {}, r.map((c) => el('td', {}, c)))))));


  // Rendered lazily; works on any page that loads mermaid from the CDN.
  function diagram(source, label) {
    const box = el('div', { class: 'mermaid-box', role: 'img', 'aria-label': label }, el('p', { class: 'muted' }, 'Rendering diagram...'));
    drawDiagram(box, source);
    return box;
  }

  window.Prep.ui = { section, fill, table, diagram, statusSelect, notesBox, confidence, checkbox, codeBlock, filterBar, timer, rehearse, shuffle, list };
})();
