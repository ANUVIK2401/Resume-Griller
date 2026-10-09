// Shared shell: data loading, DOM helper, sidebar, masthead, keyboard, page dispatch.
// Page renderers register on Prep.pages[id] from js/render-<id>.js.
(function () {
  const Prep = (window.Prep = window.Prep || {});
  Prep.pages = Prep.pages || {};

  // Builds DOM without innerHTML so data strings are always text.
  // el('a', { href, class: 'x', onclick: fn }, 'label', childNode, [more])
  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value === null || value === undefined || value === false) continue;
      if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
      else if (key === 'class') node.className = value;
      else if (key === 'style' && typeof value === 'object') Object.assign(node.style, value);
      else node.setAttribute(key, value === true ? '' : value);
    }
    for (const child of children.flat(Infinity)) {
      if (child === null || child === undefined || child === false) continue;
      node.append(child instanceof Node ? child : String(child));
    }
    return node;
  }

  const cache = new Map();
  function fetchOnce(path, as) {
    if (!cache.has(path)) {
      cache.set(path, fetch(path).then((res) => {
        if (!res.ok) throw new Error(`${path} returned ${res.status}`);
        return as === 'text' ? res.text() : res.json();
      }));
    }
    return cache.get(path);
  }
  const load = (name) => fetchOnce(`data/${name}.json`, 'json');
  const loadText = (path) => fetchOnce(path, 'text');

  // Inline SVG from path data; icons are UI, not content.
  const ICONS = {
    sun: 'M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
    moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
    download: 'M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
    upload: 'M12 21V9m0 0-4 4m4-4 4 4M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2',
    menu: 'M4 7h16M4 12h16M4 17h10',
    close: 'M6 6l12 12M18 6 6 18',
    external: 'M14 4h6v6m0-6-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4',
  };
  function icon(name) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    for (const [k, v] of Object.entries({ viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' })) svg.setAttribute(k, v);
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', ICONS[name]);
    svg.append(path);
    return svg;
  }

  function currentTheme() {
    return document.documentElement.dataset.theme
      || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  function themeButton() {
    const btn = el('button', { class: 'icon-btn', type: 'button' });
    const paint = () => {
      const dark = currentTheme() === 'dark';
      btn.replaceChildren(icon(dark ? 'sun' : 'moon'));
      btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      btn.title = btn.getAttribute('aria-label');
    };
    btn.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('sfprep:theme', next); } catch { /* theme falls back to system */ }
      document.querySelectorAll('.icon-btn[data-theme-btn]').forEach((b) => b.dispatchEvent(new Event('repaint')));
      document.dispatchEvent(new CustomEvent('themechange', { detail: next }));
    });
    btn.dataset.themeBtn = '';
    btn.addEventListener('repaint', paint);
    paint();
    return btn;
  }

  function progressButtons() {
    const input = el('input', { type: 'file', accept: 'application/json,.json', class: 'visually-hidden', tabindex: '-1' });
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        await Prep.store.importFile(file);
        location.reload();
      } catch (err) {
        alert(`Import failed: ${err.message}`);
      }
      input.value = '';
    });
    return [
      el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Import progress from a file', title: 'Import progress', onclick: () => input.click() }, icon('upload')),
      el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Export progress to a file', title: 'Export progress', onclick: () => Prep.store.exportFile() }, icon('download')),
      input,
    ];
  }

  // A- / A+ : scales every rem-based size, saved per device (applied early by theme.js).
  const SCALE = { min: 90, max: 140, step: 10 };
  function textSizeButtons() {
    const read = () => Number(document.documentElement.style.fontSize.replace('%', '')) || 100;
    const apply = (next) => {
      const v = Math.min(SCALE.max, Math.max(SCALE.min, next));
      document.documentElement.style.fontSize = `${v}%`;
      try { localStorage.setItem('sfprep:scale', String(v)); } catch { /* size resets next visit */ }
    };
    return el('span', { class: 'text-size', role: 'group', 'aria-label': 'Text size' },
      el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Smaller text', title: 'Smaller text', onclick: () => apply(read() - SCALE.step) }, 'A−'),
      el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Larger text', title: 'Larger text', onclick: () => apply(read() + SCALE.step) }, 'A+'));
  }

  const wordmark = () => el('a', { class: 'wordmark', href: 'index.html' }, 'SF ', el('b', {}, 'MTS'), el('i', {}, '.'), ' prep');

  function setNavOpen(open) {
    document.body.classList.toggle('nav-open', open);
    document.getElementById('scrim').hidden = !open;
    document.getElementById('menu-btn')?.setAttribute('aria-expanded', String(open));
    if (open) document.querySelector('.sidebar a')?.focus();
  }

  function renderTopbar() {
    document.getElementById('topbar').replaceChildren(
      el('button', { class: 'icon-btn', id: 'menu-btn', type: 'button', 'aria-label': 'Open navigation', 'aria-controls': 'sidebar', 'aria-expanded': 'false', onclick: () => setNavOpen(true) }, icon('menu')),
      wordmark(),
      textSizeButtons(),
      themeButton(),
    );
    document.getElementById('scrim').addEventListener('click', () => setNavOpen(false));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('nav-open')) setNavOpen(false); });
  }

  function renderSidebar(site, loop, pageId) {
    document.getElementById('sidebar').replaceChildren(
      el('div', { class: 'sidebar-head' },
        wordmark(),
        el('button', { class: 'icon-btn sidebar-close', type: 'button', 'aria-label': 'Close navigation', onclick: () => setNavOpen(false) }, icon('close'))),
      el('p', { class: 'sidebar-meta' }, `${loop.req.company} · ${loop.req.id}`),
      el('a', { class: 'sidebar-back', href: '../index.html' }, '← All interviews'),
      el('nav', { class: 'side-nav', 'aria-label': 'Sections' },
        el('p', { class: 'side-label' }, 'Sections'),
        el('ul', {}, site.pages.map((p) => el('li', {},
          el('a', { href: p.href, 'aria-current': p.id === pageId ? 'page' : null },
            el('span', { class: 'side-dot', 'aria-hidden': 'true' }), p.label))))),
      el('nav', { class: 'side-toc', id: 'toc', 'aria-label': 'On this page', hidden: true }),
      el('div', { class: 'sidebar-foot' },
        el('div', { class: 'sidebar-tools' }, textSizeButtons(), themeButton(), progressButtons()),
        el('p', {}, Prep.store.persistent ? 'Progress saves in this browser. Export to back it up.' : 'Storage is blocked here, so progress resets on reload. Export before leaving.')),
    );
  }

  // Builds "On this page" from every <section data-toc="Label" id="..."> in main,
  // and highlights the one in view.
  function buildToc() {
    const toc = document.getElementById('toc');
    const sections = [...document.querySelectorAll('main section[data-toc][id]')];
    if (!toc || !sections.length) return;
    const links = new Map(sections.map((s) => [s.id, el('a', { href: `#${s.id}`, onclick: () => setNavOpen(false) }, s.dataset.toc)]));
    toc.replaceChildren(el('p', { class: 'side-label' }, 'On this page'), el('ul', {}, [...links.values()].map((a) => el('li', {}, a))));
    toc.hidden = false;
    const spy = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((a) => a.removeAttribute('aria-current'));
        links.get(entry.target.id)?.setAttribute('aria-current', 'true');
      }
    }, { rootMargin: '-15% 0px -75% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  function renderMasthead(page) {
    document.getElementById('masthead').replaceChildren(el('div', { class: 'wrap' },
      el('p', { class: 'prompt' }, el('b', {}, '➜ '), page.prompt),
      el('h1', {}, `${page.title} `, el('em', {}, page.accent)),
      el('p', { class: 'lede' }, page.lede),
      el('div', { class: 'readout', id: 'readout', hidden: true }),
    ));
  }

  // Segment pages call this with their own done/total counts.
  function setReadout(label, done, total) {
    const box = document.getElementById('readout');
    if (!box) return;
    box.hidden = false;
    const meter = el('div', { class: 'meter', role: 'progressbar', 'aria-label': label, 'aria-valuemin': '0', 'aria-valuemax': String(total), 'aria-valuenow': String(done) }, el('span'));
    meter.style.setProperty('--p', total ? done / total : 0);
    box.replaceChildren(el('div', { class: 'readout-row' }, el('span', {}, label), el('strong', {}, `${done} / ${total}`)), meter);
  }

  function renderFooter(profile) {
    document.querySelector('.shell').append(el('footer', { class: 'site-footer' }, el('div', { class: 'wrap' },
      el('span', {}, `${profile.name}. ${profile.location}.`),
      el('span', {}, 'Shortcuts in rehearse mode: ', el('kbd', {}, 'space'), ' reveal, ', el('kbd', {}, 'j'), ' next, ', el('kbd', {}, 'k'), ' previous, ', el('kbd', {}, 'esc'), ' exit.'),
    )));
  }

  // Keyboard: one registry per page. Ignored while typing in a field.
  const keyHandlers = new Map();
  function onKey(key, fn) { keyHandlers.set(key, fn); }
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const fn = keyHandlers.get(e.key === ' ' ? 'space' : e.key);
    if (!fn) return;
    if (fn(e) !== false) e.preventDefault();
  });

  function showError(err) {
    const fileMode = location.protocol === 'file:';
    document.getElementById('main').replaceChildren(el('div', { class: 'wrap' }, el('div', { class: 'notice is-error', role: 'alert' },
      el('h2', {}, fileMode ? 'Serve this folder to load the data' : 'Data failed to load'),
      el('p', { class: 'muted' }, fileMode
        ? 'Browsers block reading data/*.json from a file:// page. Start a local server in the repo folder, then open http://localhost:8000.'
        : `${err.message}. Check that the file exists and is valid JSON.`),
      fileMode ? el('pre', {}, 'python3 -m http.server 8000') : null,
    )));
  }

  async function boot() {
    const pageId = document.body.dataset.page;
    try {
      const [site, profile, loop] = await Promise.all([load('site'), load('profile'), load('loop')]);
      const page = site.pages.find((p) => p.id === pageId);
      document.title = `${page.label} · ${site.title}`;
      renderTopbar();
      renderSidebar(site, loop, pageId);
      renderMasthead(page);
      renderFooter(profile);
      const render = Prep.pages[pageId];
      const main = document.getElementById('main');
      if (render) await render({ main, page, profile, loop });
      else main.replaceChildren(el('div', { class: 'wrap' }, el('div', { class: 'notice' },
        el('h2', {}, 'Not built yet'),
        el('p', { class: 'muted' }, `This segment lands in a later commit. Its content will come from data/${pageId === 'home' ? 'loop' : pageId}.json.`))));
      buildToc();
      if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
    } catch (err) {
      console.error(err);
      showError(err);
    }
  }

  Object.assign(Prep, { el, load, loadText, icon, onKey, setReadout });
  document.addEventListener('DOMContentLoaded', boot);
})();
