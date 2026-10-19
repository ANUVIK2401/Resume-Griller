// Top SA questions: the answer method, moves for handling the room, and the most asked
// questions with a model answer, follow-ups and the trap. Data: data/top.json.
(function () {
  const RANK = { P0: 0, P1: 1 };
  // P0 first, then file order. statusOf lets the page filter by saved status.
  function filterQuestions(questions, filters = {}, statusOf = () => '') {
    const q = String(filters.q || '').trim().toLowerCase();
    return questions
      .filter((item) => (!filters.priority || item.priority === filters.priority)
        && (!filters.group || item.group === filters.group)
        && (!filters.status || statusOf(item) === filters.status)
        && (!q || [item.q, item.tests, ...item.answer, item.trap].join(' ').toLowerCase().includes(q)))
      .map((item, i) => [item, i])
      .sort(([a, i], [b, j]) => RANK[a.priority] - RANK[b.priority] || i - j)
      .map(([item]) => item);
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { filterQuestions };
  if (typeof window === 'undefined') return;

  const { el, load, ui, store, setReadout } = { ...window.Prep, store: window.Prep.store };
  const kv = (label, ...body) => el('div', { class: 'kv' }, el('p', { class: 'label' }, label), ...body);
  const modelAnswer = (item) => el('ol', { class: 'model-answer' }, item.answer.map((line) => el('li', {}, line)));
  const trap = (item) => el('p', { class: 'trap' }, el('strong', {}, 'Trap: '), item.trap);

  function methodSection(data) {
    return ui.section('method', 'Answer method', 'Any design question', el('span', {}, 'Seven steps, said ', el('em', {}, 'out loud')),
      el('p', { class: 'section-intro' }, 'Use this order for every open design prompt. The minutes assume a 25 to 30 minute whiteboard; compress them for a 10 minute question.'),
      el('div', { class: 'steps' }, data.method.map((m) => el('div', { class: 'step' },
        el('div', { class: 'stack', style: { gap: '0.35rem' } }, el('p', { class: 'h3' }, m.step), el('p', { class: 'say' }, `"${m.say}"`)),
        el('span', { class: 'step-min' }, m.minutes)))));
  }

  function movesSection(data) {
    return ui.section('moves', 'Handling the room', 'When it gets hard', el('span', {}, 'How to ', el('em', {}, 'handle'), ' it live'),
      el('div', { class: 'grid-2' }, data.moves.map((m) => el('article', { class: 'card stack', id: `move-${m.id}` },
        el('h3', { class: 'h3' }, m.situation), el('p', {}, m.do),
        el('p', { class: 'probe say' }, `"${m.say}"`)))));
  }

  function questionItem(item, data, onStatus) {
    return el('details', { class: 'item', id: `top-${item.id}` },
      el('summary', {},
        el('span', { class: 'item-title' }, item.q),
        el('span', { class: 'item-meta', onclick: (e) => e.stopPropagation() },
          el('span', { class: `chip ${item.priority === 'P0' ? 'chip-gold' : ''}` }, item.priority),
          ui.statusSelect(`top-${item.id}`, data.status_options, onStatus))),
      el('div', { class: 'item-body' },
        kv('What they are testing', el('p', {}, item.tests)),
        item.ask_first ? kv('Ask first', ui.list(item.ask_first)) : null,
        kv('Model answer, about one minute', modelAnswer(item)),
        kv('How to handle it', ui.list(item.handle)),
        item.followups?.length ? kv('Likely follow-ups', item.followups.map((f) => el('div', { class: 'probe' }, el('p', { class: 'probe-q' }, f.q), el('p', {}, f.a)))) : null,
        trap(item),
        item.link ? el('a', { class: 'chip chip-gold', href: item.link.href }, `${item.link.label} →`) : null,
        ui.notesBox(`top-${item.id}`, 'Your version, in your own words')));
  }

  function questionSections(data, onStatus) {
    const statusOf = (item) => store.get('status', `top-${item.id}`, data.status_options[0].id);
    const items = new Map(data.questions.map((item) => [item.id, questionItem(item, data, () => { apply(); onStatus(); })]));
    const groups = data.groups.map((g) => ({ g, list: el('div', { class: 'item-list' }) }));
    const count = el('p', { class: 'muted', role: 'status', 'aria-live': 'polite' });
    let filters = {};
    const apply = (next = filters) => {
      filters = next;
      const shown = filterQuestions(data.questions, filters, statusOf);
      for (const { g, list } of groups) {
        const mine = shown.filter((item) => item.group === g.id);
        list.replaceChildren(...mine.map((item) => items.get(item.id)));
        list.closest('section').hidden = mine.length === 0;
      }
      count.textContent = `${shown.length} of ${data.questions.length} questions shown`;
    };
    const rehearse = (list, title) => ui.rehearse(ui.shuffle(list).map((item) => ({
      kicker: `${item.priority} / ${data.groups.find((g) => g.id === item.group).name}`,
      front: () => el('div', { class: 'stack' }, el('h3', { class: 'h3' }, item.q), el('p', { class: 'muted' }, `Testing: ${item.tests}`)),
      back: () => el('div', { class: 'stack' }, modelAnswer(item), trap(item)),
    })), title);
    const p0 = data.questions.filter((item) => item.priority === 'P0');
    const bar = ui.filterBar({
      placeholder: 'Search questions, e.g. DR, queue, cost',
      selects: [
        { key: 'priority', label: 'Any priority', options: data.priorities.map((p) => ({ id: p.id, label: `${p.id}: ${p.name}` })) },
        { key: 'group', label: 'Any type', options: data.groups.map((g) => ({ id: g.id, label: g.name })) },
        { key: 'status', label: 'Any status', options: data.status_options },
      ],
      onChange: apply,
    });
    const intro = el('div', { class: 'card stack', id: 'drill' },
      el('p', { class: 'h3' }, data.intro), bar, count,
      el('div', { class: 'row' },
        el('button', { class: 'btn btn-gold', type: 'button', onclick: () => rehearse(p0, 'Top priority drill') }, `Drill the ${p0.length} P0 questions`),
        el('button', { class: 'btn', type: 'button', onclick: () => rehearse(filterQuestions(data.questions, filters, statusOf), 'Questions shown') }, 'Rehearse what is shown'),
        el('a', { class: 'btn', href: '#method' }, 'First time? Read the answer method')));
    const sections = groups.map(({ g, list }) => ui.section(`group-${g.id}`, g.name,
      `${data.questions.filter((item) => item.group === g.id).length} questions`, g.name,
      el('p', { class: 'section-intro' }, g.intro), list));
    apply();
    return [intro, ...sections];
  }

  window.Prep.pages.top = async ({ main }) => {
    const data = await load('top');
    const readyId = data.status_options.at(-1).id;
    const updateReadout = () => setReadout('Questions ready', data.questions.filter((item) => store.get('status', `top-${item.id}`) === readyId).length, data.questions.length);
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      ...questionSections(data, updateReadout),
      methodSection(data),
      movesSection(data)));
    updateReadout();
  };
})();
