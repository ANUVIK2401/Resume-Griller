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
  const qaText = (item.questions || []).map(q => {
    const star = q.star ? Object.values(q.star).join(' ') : '';
    return `${q.question} ${star} ${(q.followUps || []).join(' ')}`;
  }).join(' ');
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

  (item.questions || []).forEach((qa, i) => {
    const block = el('div', 'qa-block');

    const qRow = el('div', 'star-line qa-question');
    qRow.appendChild(el('div', 'letter', `Q${i + 1}`));
    qRow.appendChild(el('div', 'text', qa.question));
    block.appendChild(qRow);

    // Answer hidden behind a toggle so you can rehearse before peeking
    const content = el('div', 'qa-content');

    if (qa.star) {
      [['S', qa.star.s], ['T', qa.star.t], ['A', qa.star.a], ['R', qa.star.r]].forEach(([letter, text]) => {
        if (!text) return;
        const row = el('div', 'star-line');
        row.appendChild(el('div', 'letter', letter));
        const answer = el('div', 'text', text);
        answer.contentEditable = 'true';
        row.appendChild(answer);
        content.appendChild(row);
      });
    }

    if (qa.followUps && qa.followUps.length) {
      content.appendChild(el('div', 'followup-label', 'Likely follow-ups'));
      const list = el('ul', 'followups');
      qa.followUps.forEach(f => list.appendChild(el('li', null, f)));
      content.appendChild(list);
    }

    const toggle = el('button', 'reveal-btn', 'Show answer ▾');
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = block.classList.toggle('open');
      toggle.textContent = isOpen ? 'Hide answer ▴' : 'Show answer ▾';
    });
    block.appendChild(toggle);
    block.appendChild(content);

    body.appendChild(block);
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

function renderIntro() {
  const slot = document.getElementById('intro-slot');
  if (!slot || typeof GOOGLE_INTRO === 'undefined') return;

  const card = el('section', 'card format-card intro-card');
  const eyebrow = el('div', 'card-eyebrow');
  eyebrow.appendChild(el('div', 'card-role', 'Intro · Have this ready'));
  card.appendChild(eyebrow);
  card.appendChild(el('div', 'card-title', GOOGLE_INTRO.title));

  const body = el('div', 'card-body');
  (GOOGLE_INTRO.pitch || []).forEach(p => {
    const para = el('p', 'intro-para', p);
    para.contentEditable = 'true';
    body.appendChild(para);
  });

  if (GOOGLE_INTRO.tips && GOOGLE_INTRO.tips.length) {
    body.appendChild(el('div', 'followup-label', 'Delivery notes'));
    const list = el('ul', 'followups');
    GOOGLE_INTRO.tips.forEach(t => list.appendChild(el('li', null, t)));
    body.appendChild(list);
  }

  card.appendChild(body);
  slot.appendChild(card);
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

renderIntro();
render();
