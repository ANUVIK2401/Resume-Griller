// AI fundamentals page: flashcards by topic (30-second answer, key terms, 2-minute answer), decision table, honest gaps.
(function () {
  const { el, load, ui, store, setReadout } = { ...window.Prep, store: window.Prep.store };

  const answerBlocks = (c) => [
    el('div', { class: 'kv' }, el('p', { class: 'label' }, '30-second answer'), el('p', { class: 'answer-short' }, ui.fill(c.short))),
    el('div', { class: 'explain' },
      el('div', { class: 'explain-col' }, el('p', { class: 'h3' }, 'Key terms, simply'), ui.list(c.terms)),
      el('div', { class: 'explain-col' }, el('p', { class: 'h3' }, '2-minute answer'), ui.list(c.long))),
  ];

  function cardItem(c, data, onStatus) {
    const body = el('div', { class: 'item-body' });
    const node = el('details', { class: 'item', id: `ai-${c.id}` },
      el('summary', {},
        el('span', { class: 'item-title' }, c.question),
        el('span', { class: 'item-meta', onclick: (e) => e.stopPropagation() },
          c.pinned ? el('span', { class: 'chip chip-gold' }, 'Anchor answer') : null,
          ui.statusSelect(`ai-${c.id}`, data.status_options, onStatus))),
      body);
    node.addEventListener('toggle', () => {
      if (!node.open || body.childElementCount) return;
      body.append(...answerBlocks(c),
        el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Likely follow-ups'),
          el('div', { class: 'item-list' }, c.followups.map((f) => el('div', { class: 'probe' }, el('p', { class: 'probe-q' }, f.q), el('p', {}, ui.fill(f.a)))))),
        el('div', { class: 'resume-line' }, el('strong', {}, 'Tie to my work: '), ui.fill(c.tie)),
        el('div', { class: 'row' }, ui.confidence(`ai-${c.id}`)),
        ui.notesBox(`ai-${c.id}`, 'Your version, in your words'));
    });
    return node;
  }

  function decisionSection(t) {
    return ui.section('decide', 'Prompt, RAG, or fine-tune', 'Decision table', el('span', {}, 'Prompt, RAG, or ', el('em', {}, 'fine-tune')),
      el('div', { class: 'table-wrap', style: { marginTop: '1.25rem' } }, el('table', { class: 'table' },
        el('thead', {}, el('tr', {}, t.columns.map((c) => el('th', { scope: 'col' }, c)))),
        el('tbody', {}, t.rows.map((r) => el('tr', {}, r.map((c) => el('td', {}, c))))))));
  }

  function gapsSection(gaps) {
    return ui.section('gaps', 'Honest gaps', 'Say it before they find it', el('span', {}, 'Honest ', el('em', {}, 'gaps')),
      el('p', { class: 'section-intro' }, 'Name the gap, show the nearest thing you have done, say how you are closing it.'),
      el('div', { class: 'comp-grid' }, gaps.map((g) => el('div', { class: 'comp is-gap' },
        el('p', { class: 'h3' }, g.gap),
        el('p', {}, g.framing),
        el('p', { class: 'gap-prompt' }, el('b', {}, 'Plan'), ui.fill(g.plan))))));
  }

  window.Prep.pages.ai = async ({ main }) => {
    const data = await load('ai');
    const knownId = data.status_options.at(-1).id;
    const statusOf = (c) => store.get('status', `ai-${c.id}`, data.status_options[0].id);
    const updateReadout = () => setReadout('Cards known', data.cards.filter((c) => statusOf(c) === knownId).length, data.cards.length);
    let activeFilters = { q: '' };
    const onStatus = () => { updateReadout(); apply(activeFilters); };
    const items = new Map(data.cards.map((c) => [c.id, cardItem(c, data, onStatus)]));
    const lists = data.topics.map((t) => ({ t, list: el('div', { class: 'item-list' }), cards: data.cards.filter((c) => c.topic === t.id) }));

    let shown = data.cards;
    const apply = (f) => {
      activeFilters = { ...f };
      const keep = (c) => (!f.q || `${c.question} ${c.short} ${c.terms.join(' ')}`.toLowerCase().includes(f.q))
        && (!f.status || statusOf(c) === f.status);
      shown = data.cards.filter(keep);
      for (const { list, cards } of lists) {
        const visible = cards.filter(keep);
        list.replaceChildren(...visible.map((c) => items.get(c.id)));
        list.closest('section').hidden = visible.length === 0;
      }
    };
    const bar = ui.filterBar({ placeholder: 'Search questions and terms', selects: [{ key: 'status', label: 'Any status', options: data.status_options }], onChange: apply });
    const rehearse = () => ui.rehearse(ui.shuffle(shown).map((c) => ({
      kicker: data.topics.find((t) => t.id === c.topic).name,
      front: () => el('span', {}, c.question),
      back: () => el('div', { class: 'stack' }, answerBlocks(c)),
    })), 'Rehearse AI answers');

    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      el('div', { class: 'card stack' },
        el('p', { class: 'muted' }, `${data.cards.length} questions. Say the 30-second answer first, then go deeper only if asked.`),
        bar,
        el('div', { class: 'row' }, el('button', { class: 'btn btn-gold', type: 'button', onclick: rehearse }, 'Rehearse as flashcards'))),
      ...lists.map(({ t, list, cards }) => ui.section(`t-${t.id}`, `${t.name} (${cards.length})`, t.pinned ? 'Pinned for the HM round' : 'Topic', t.name, list)),
      decisionSection(data.decision_table),
      gapsSection(data.gaps)));
    apply({ q: '' });
    updateReadout();
  };
})();
