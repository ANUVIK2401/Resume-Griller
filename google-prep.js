/* ============ Google Prep page ============
   Renders GOOGLE_PREP_BANK competency cards and pulls in matching
   STAR stories from star-bank.js via linkedTags. Data-driven:
   edit data/google-prep-bank.js, no code changes needed. */

const searchBox = document.getElementById('search-box');
const filterRow = document.getElementById('filter-row');
const board = document.getElementById('board');

let state = { search: '', activeTag: null };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function normalize(str) {
  return (str || '').toLowerCase();
}

function linkedStories(item) {
  return STAR_BANK.filter(s => (s.tags || []).some(t => (item.linkedTags || []).includes(t)));
}

function searchableText(item) {
  const storyText = linkedStories(item).map(s => `${s.role} ${s.bullet}`).join(' ');
  const qaText = (item.questions || []).map(q => `${q.question} ${q.answer} ${(q.followUps || []).join(' ')}`).join(' ');
  return [item.competency, item.googleDefinition, qaText, ...(item.linkedTags || []), storyText].join(' ');
}

function renderFilterRow() {
  filterRow.innerHTML = '';
  const tagCounts = new Map();
  GOOGLE_PREP_BANK.forEach(item => {
    (item.linkedTags || []).forEach(tag => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1));
  });

  const allChip = el('button', 'chip' + (state.activeTag === null ? ' active' : ''), 'all');
  allChip.addEventListener('click', () => {
    state.activeTag = null;
    render();
  });
  filterRow.appendChild(allChip);

  [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).forEach(([tag, count]) => {
    const chip = el('button', 'chip' + (state.activeTag === tag ? ' active' : ''), `${tag} · ${count}`);
    chip.addEventListener('click', () => {
      state.activeTag = state.activeTag === tag ? null : tag;
      render();
    });
    filterRow.appendChild(chip);
  });
}

function filteredItems() {
  const q = normalize(state.search);
  return GOOGLE_PREP_BANK.filter(item => {
    if (state.activeTag && !(item.linkedTags || []).includes(state.activeTag)) return false;
    if (q && !normalize(searchableText(item)).includes(q)) return false;
    return true;
  });
}

function buildStoryBlock(story) {
  const wrap = el('div', 'linked-stories');
  const pill = el('span', 'linked-story-pill', story.role);
  pill.style.cursor = 'pointer';
  wrap.appendChild(pill);
  wrap.appendChild(el('div', 'guidance-line', story.bullet));

  let detail = null;
  pill.addEventListener('click', () => {
    if (detail) {
      detail.remove();
      detail = null;
      return;
    }
    detail = el('div', 'story-detail');
    [['S', story.situation], ['T', story.task], ['A', story.action], ['R', story.result]].forEach(([letter, text]) => {
      const row = el('div', 'star-line');
      row.appendChild(el('div', 'letter', letter));
      row.appendChild(el('div', 'text', text));
      detail.appendChild(row);
    });
    wrap.appendChild(detail);
  });
  return wrap;
}

function buildCardBody(item) {
  const body = el('div', 'card-body');
  body.appendChild(el('div', 'guidance-line', item.googleDefinition));

  (item.questions || []).forEach(qa => {
    const qRow = el('div', 'star-line');
    qRow.appendChild(el('div', 'letter', 'Q'));
    qRow.appendChild(el('div', 'text', qa.question));
    body.appendChild(qRow);

    if (qa.answer) {
      const aRow = el('div', 'star-line');
      aRow.appendChild(el('div', 'letter', 'A'));
      const answer = el('div', 'text', qa.answer);
      answer.contentEditable = 'true';
      aRow.appendChild(answer);
      body.appendChild(aRow);
    }

    (qa.followUps || []).forEach(f => {
      body.appendChild(el('div', 'guidance-line', '↳ follow-up: ' + f));
    });
  });

  linkedStories(item).forEach(story => body.appendChild(buildStoryBlock(story)));
  return body;
}

function renderCard(item) {
  const card = el('div', 'card');

  const eyebrow = el('div', 'card-eyebrow');
  eyebrow.appendChild(el('div', 'card-role', 'Googleyness'));
  eyebrow.appendChild(el('div', 'card-caret', '▸'));
  card.appendChild(eyebrow);

  card.appendChild(el('div', 'card-title', item.competency));

  const tags = item.linkedTags || [];
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
    card.appendChild(buildCardBody(item));
  });

  return card;
}

function render() {
  renderFilterRow();
  board.innerHTML = '';

  const items = filteredItems();
  if (items.length === 0) {
    board.appendChild(el('div', 'empty-hint', 'Nothing matches. Clear the search or filter.'));
    return;
  }

  const section = el('div', 'board-section');
  const head = el('div', 'section-head');
  head.appendChild(el('h2', null, 'Googleyness Competencies'));
  head.appendChild(el('span', 'section-count', String(items.length)));
  section.appendChild(head);

  const grid = el('div', 'card-grid');
  items.forEach(item => grid.appendChild(renderCard(item)));
  section.appendChild(grid);
  board.appendChild(section);
}

searchBox.addEventListener('input', () => {
  state.search = searchBox.value;
  render();
});

render();
