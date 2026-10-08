/* ============ Salesforce Prep pages ============
   Shared renderer for every page in /salesforce. Each page loads one
   data file that defines SF_PAGE = { key, sections: [...] }.

   Section shape:
   { title, intro?, items: [
       { title, url?, meta?, tags?, notes?, anchor?, links?: [{label, url}] }
   ] }

   Every item gets a checkbox. Progress is saved per browser in
   localStorage (key: sf-<page>-<section index>-<item title>). */

(function () {
  const board = document.getElementById('board');
  const searchBox = document.getElementById('search-box');
  const progressEl = document.getElementById('progress');
  const filterRow = document.getElementById('filter-row');
  let state = { search: '', tag: null };

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function storeKey(si, item) {
    return `sf-${SF_PAGE.key}-${si}-${item.title}`;
  }

  function isDone(key) {
    try { return localStorage.getItem(key) === '1'; } catch (e) { return false; }
  }

  function setDone(key, done) {
    try { done ? localStorage.setItem(key, '1') : localStorage.removeItem(key); } catch (e) { /* storage blocked */ }
  }

  function matches(item) {
    if (state.tag && !(item.tags || []).includes(state.tag)) return false;
    if (!state.search) return true;
    const hay = [item.title, item.meta, item.notes, item.anchor, ...(item.tags || [])].join(' ').toLowerCase();
    return hay.includes(state.search.toLowerCase());
  }

  function updateProgress() {
    let total = 0, done = 0;
    SF_PAGE.sections.forEach((s, si) => s.items.forEach(item => {
      total++;
      if (isDone(storeKey(si, item))) done++;
    }));
    progressEl.textContent = `${done} / ${total} done`;
  }

  function renderFilters() {
    filterRow.innerHTML = '';
    const counts = new Map();
    SF_PAGE.sections.forEach(s => s.items.forEach(i => (i.tags || []).forEach(t => counts.set(t, (counts.get(t) || 0) + 1))));
    if (!counts.size) return;
    const all = el('button', 'chip' + (state.tag === null ? ' active' : ''), 'all');
    all.addEventListener('click', () => { state.tag = null; render(); });
    filterRow.appendChild(all);
    [...counts.entries()].sort((a, b) => b[1] - a[1]).forEach(([tag, n]) => {
      const chip = el('button', 'chip' + (state.tag === tag ? ' active' : ''), `${tag} · ${n}`);
      chip.addEventListener('click', () => { state.tag = state.tag === tag ? null : tag; render(); });
      filterRow.appendChild(chip);
    });
  }

  function renderItem(si, item) {
    const key = storeKey(si, item);
    const row = el('li', 'sf-item' + (isDone(key) ? ' done' : ''));

    const box = el('input');
    box.type = 'checkbox';
    box.checked = isDone(key);
    box.addEventListener('change', () => {
      setDone(key, box.checked);
      row.classList.toggle('done', box.checked);
      updateProgress();
    });
    row.appendChild(box);

    const main = el('div', 'sf-main');
    const head = el('div', 'sf-head');
    if (item.url) {
      const a = el('a', 'sf-title', item.title);
      a.href = item.url;
      a.target = '_blank';
      a.rel = 'noopener';
      head.appendChild(a);
    } else {
      head.appendChild(el('span', 'sf-title', item.title));
    }
    if (item.meta) head.appendChild(el('span', 'sf-meta', item.meta));
    main.appendChild(head);

    if (item.notes) main.appendChild(el('div', 'sf-notes', item.notes));
    if (item.anchor) {
      const anc = el('div', 'sf-anchor');
      anc.appendChild(el('span', 'sf-anchor-label', 'Your anchor'));
      anc.appendChild(el('span', null, item.anchor));
      main.appendChild(anc);
    }
    if (item.links && item.links.length) {
      const links = el('div', 'sf-links');
      item.links.forEach(l => {
        const a = el('a', 'tag-pill', l.label);
        a.href = l.url;
        a.target = '_blank';
        a.rel = 'noopener';
        links.appendChild(a);
      });
      main.appendChild(links);
    }
    if (item.tags && item.tags.length) {
      const tags = el('div', 'card-tags');
      item.tags.forEach(t => tags.appendChild(el('span', 'tag-pill', t)));
      main.appendChild(tags);
    }
    row.appendChild(main);
    return row;
  }

  function render() {
    renderFilters();
    board.innerHTML = '';
    let shown = 0;
    SF_PAGE.sections.forEach((section, si) => {
      const items = section.items.filter(matches);
      if (!items.length) return;
      shown += items.length;
      const wrap = el('section', 'card sf-section');
      const head = el('div', 'section-head');
      head.appendChild(el('h2', null, section.title));
      head.appendChild(el('span', 'section-count', String(items.length)));
      wrap.appendChild(head);
      if (section.intro) wrap.appendChild(el('div', 'sf-intro', section.intro));
      const list = el('ul', 'sf-list');
      items.forEach(item => list.appendChild(renderItem(si, item)));
      wrap.appendChild(list);
      board.appendChild(wrap);
    });
    if (!shown) board.appendChild(el('div', 'empty-hint', 'Nothing matches. Clear the search or filter.'));
    updateProgress();
  }

  searchBox.addEventListener('input', () => { state.search = searchBox.value; render(); });

  // Highlight the current page in the sub-nav
  document.querySelectorAll('.sf-nav a').forEach(a => {
    if (a.dataset.page === SF_PAGE.key) a.classList.add('active');
  });

  render();
})();
