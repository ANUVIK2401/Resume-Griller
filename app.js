/* ============ Interview OS ============ */

const searchBox = document.getElementById('search-box');
const statsBar = document.getElementById('stats-bar');
const moduleNav = document.getElementById('module-nav');
const filterRow = document.getElementById('filter-row');
const board = document.getElementById('board');

const MODULES = [
  { id: 'star', label: 'Resume · STAR', data: () => STAR_BANK },
  { id: 'technical', label: 'Technical', data: () => TECHNICAL_BANK },
  { id: 'behavioral', label: 'Behavioral', data: () => BEHAVIORAL_BANK },
];

let state = {
  module: 'star',
  search: '',
  activeTag: null,
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function editableEl(tag, className, text) {
  const node = el(tag, className, text);
  node.contentEditable = 'true';
  return node;
}

function normalize(str) {
  return (str || '').toLowerCase();
}

// ---------- Data access per module ----------

function itemsFor(moduleId) {
  const mod = MODULES.find(m => m.id === moduleId);
  return mod ? mod.data() : [];
}

function tagsFor(moduleId, item) {
  if (moduleId === 'star') return item.tags || [];
  if (moduleId === 'technical') return item.tags || [];
  if (moduleId === 'behavioral') return item.linkedTags || [];
  return [];
}

function searchableText(moduleId, item) {
  if (moduleId === 'star') {
    return [item.role, item.bullet, item.situation, item.task, item.action, item.result, ...(item.tags || [])].join(' ');
  }
  if (moduleId === 'technical') {
    return [item.category, item.question, item.answer, ...(item.tags || [])].join(' ');
  }
  if (moduleId === 'behavioral') {
    return [item.competency, item.question, item.guidance, ...(item.linkedTags || [])].join(' ');
  }
  return '';
}

function groupKeyFor(moduleId, item) {
  if (moduleId === 'star') return item.role || 'Other';
  if (moduleId === 'technical') return item.category || 'Other';
  if (moduleId === 'behavioral') return item.competency || 'Other';
  return 'Other';
}

// ---------- Rendering ----------

function renderStats() {
  statsBar.innerHTML = '';
  MODULES.forEach(mod => {
    const count = mod.data().length;
    const span = el('span', null, `${mod.label} `);
    const numEl = el('span', 'stat-num', String(count));
    span.appendChild(numEl);
    statsBar.appendChild(span);
  });
}

function renderModuleNav() {
  moduleNav.innerHTML = '';
  MODULES.forEach(mod => {
    const btn = el('button', 'module-btn' + (state.module === mod.id ? ' active' : ''));
    btn.appendChild(el('span', null, mod.label));
    btn.appendChild(el('span', 'count', String(mod.data().length)));
    btn.addEventListener('click', () => {
      state.module = mod.id;
      state.activeTag = null;
      render();
    });
    moduleNav.appendChild(btn);
  });
}

function renderFilterRow() {
  filterRow.innerHTML = '';
  const items = itemsFor(state.module);
  const tagCounts = new Map();
  items.forEach(item => {
    tagsFor(state.module, item).forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  const sortedTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);

  const allChip = el('button', 'chip' + (state.activeTag === null ? ' active' : ''), 'all');
  allChip.addEventListener('click', () => {
    state.activeTag = null;
    render();
  });
  filterRow.appendChild(allChip);

  sortedTags.forEach(([tag, count]) => {
    const chip = el('button', 'chip' + (state.activeTag === tag ? ' active' : ''), `${tag} · ${count}`);
    chip.addEventListener('click', () => {
      state.activeTag = state.activeTag === tag ? null : tag;
      render();
    });
    filterRow.appendChild(chip);
  });
}

function filteredItems() {
  const items = itemsFor(state.module);
  const q = normalize(state.search);

  return items.filter(item => {
    if (state.activeTag && !tagsFor(state.module, item).includes(state.activeTag)) return false;
    if (q && !normalize(searchableText(state.module, item)).includes(q)) return false;
    return true;
  });
}

function buildStarCardBody(item) {
  const body = el('div', 'card-body');
  const rows = [
    ['S', item.situation],
    ['T', item.task],
    ['A', item.action],
    ['R', item.result],
  ];
  rows.forEach(([letter, text]) => {
    const row = el('div', 'star-line');
    row.appendChild(el('div', 'letter', letter));
    row.appendChild(editableEl('div', 'text', text));
    body.appendChild(row);
  });
  return body;
}

function buildTechnicalCardBody(item) {
  const body = el('div', 'card-body');
  body.appendChild(editableEl('div', 'answer-text', item.answer));
  return body;
}

function buildBehavioralCardBody(item) {
  const body = el('div', 'card-body');
  if (item.guidance) {
    body.appendChild(el('div', 'guidance-line', item.guidance));
  }
  if (item.linkedTags && item.linkedTags.length) {
    const starItems = STAR_BANK.filter(s => (s.tags || []).some(t => item.linkedTags.includes(t)));
    if (starItems.length) {
      const wrap = el('div', 'linked-stories');
      starItems.slice(0, 4).forEach(s => {
        wrap.appendChild(el('span', 'linked-story-pill', s.role));
      });
      body.appendChild(wrap);
    }
  }
  return body;
}

function renderCard(item) {
  const card = el('div', 'card');
  const key = JSON.stringify(item);
  card.dataset.key = key;

  const eyebrow = el('div', 'card-eyebrow');
  const roleLabel = state.module === 'star' ? item.role
    : state.module === 'technical' ? item.category
    : item.competency;
  eyebrow.appendChild(el('div', 'card-role', roleLabel || ''));
  eyebrow.appendChild(el('div', 'card-caret', '▸'));
  card.appendChild(eyebrow);

  const titleText = state.module === 'star' ? item.bullet : item.question;
  card.appendChild(el('div', 'card-title', titleText));

  const tags = tagsFor(state.module, item);
  if (tags.length) {
    const tagWrap = el('div', 'card-tags');
    tags.forEach(tag => tagWrap.appendChild(el('span', 'tag-pill', tag)));
    card.appendChild(tagWrap);
  }

  card.addEventListener('click', (e) => {
    if (card.classList.contains('expanded')) {
      if (e.target.closest('.card-body')) return;
      card.classList.remove('expanded');
      const body = card.querySelector('.card-body');
      if (body) body.remove();
      return;
    }
    card.classList.add('expanded');
    const body = state.module === 'star' ? buildStarCardBody(item)
      : state.module === 'technical' ? buildTechnicalCardBody(item)
      : buildBehavioralCardBody(item);
    card.appendChild(body);
  });

  return card;
}

function render() {
  renderStats();
  renderModuleNav();
  renderFilterRow();

  board.innerHTML = '';
  const items = filteredItems();

  if (items.length === 0) {
    board.appendChild(el('div', 'empty-hint', 'Nothing matches. Clear the search or filter.'));
    return;
  }

  const groups = new Map();
  items.forEach(item => {
    const key = groupKeyFor(state.module, item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });

  groups.forEach((groupItems, groupKey) => {
    const section = el('div', 'board-section');
    const head = el('div', 'section-head');
    head.appendChild(el('h2', null, groupKey));
    head.appendChild(el('span', 'section-count', String(groupItems.length)));
    section.appendChild(head);

    const grid = el('div', 'card-grid');
    groupItems.forEach(item => grid.appendChild(renderCard(item)));
    section.appendChild(grid);

    board.appendChild(section);
  });
}

searchBox.addEventListener('input', () => {
  state.search = searchBox.value;
  render();
});

render();
