// Look-alike pairs: each pair shows the one-line tell and when to pick each side.
// Drill mode hides the tell so you say it first.
(function () {
  const { el, load, ui, store, setReadout } = { ...window.Prep, store: window.Prep.store };

  function pairCard(p, data, aws, onStatus) {
    const service = (id) => aws.services.find((s) => s.id === id);
    return el('article', { class: 'card stack compare-card', id: `cmp-${p.id}` },
      el('div', { class: 'term-head' },
        el('h3', { class: 'h3' }, p.a, el('span', { class: 'vs' }, ' vs '), p.b),
        ui.statusSelect(`cmp-${p.id}`, data.status_options, onStatus)),
      el('p', { class: 'tell' }, el('strong', {}, 'The tell: '), p.tell),
      el('dl', { class: 'use-avoid' },
        el('dt', {}, `Pick ${p.a}`), el('dd', {}, p.pick_a),
        el('dt', {}, `Pick ${p.b}`), el('dd', {}, p.pick_b)),
      p.services.length ? el('div', { class: 'row' }, p.services.map((id) => el('a', { class: 'chip', href: `aws.html#aws-${id}` }, service(id).name))) : null);
  }

  window.Prep.pages.compare = async ({ main }) => {
    const [data, aws] = await Promise.all([load('compare'), load('aws')]);
    const knownId = data.status_options.at(-1).id;
    const updateReadout = () => setReadout('Pairs known', data.pairs.filter((p) => store.get('status', `cmp-${p.id}`) === knownId).length, data.pairs.length);
    const cards = new Map(data.pairs.map((p) => [p.id, pairCard(p, data, aws, () => { apply(); updateReadout(); })]));
    const groups = data.groups.map((g) => ({ g, grid: el('div', { class: 'term-grid' }) }));
    const statusOf = (p) => store.get('status', `cmp-${p.id}`, data.status_options[0].id);
    const count = el('p', { class: 'muted', role: 'status', 'aria-live': 'polite' });
    let filters = { q: '', group: '', status: '' };
    let shown = data.pairs;
    function apply(f = filters) {
      filters = f;
      shown = data.pairs.filter((p) => (!f.q || `${p.a} ${p.b} ${p.tell}`.toLowerCase().includes(f.q))
        && (!f.group || p.group === f.group) && (!f.status || statusOf(p) === f.status));
      for (const { g, grid } of groups) {
        const visible = shown.filter((p) => p.group === g.id);
        grid.replaceChildren(...visible.map((p) => cards.get(p.id)));
        grid.closest('section').hidden = visible.length === 0;
      }
      count.textContent = `${shown.length} of ${data.pairs.length} pairs shown`;
    }
    const bar = ui.filterBar({
      placeholder: 'Search pairs, e.g. SQS, NACL, replica',
      selects: [{ key: 'group', label: 'Any group', options: data.groups.map((g) => ({ id: g.id, label: g.name })) }, { key: 'status', label: 'Any status', options: data.status_options }],
      onChange: apply,
    });
    // Front: the two names. Back: the tell and when to pick each.
    const drill = () => ui.rehearse(ui.shuffle(shown).map((p) => ({
      kicker: data.groups.find((g) => g.id === p.group).name,
      front: () => el('span', {}, `${p.a} vs ${p.b}`),
      back: () => el('div', { class: 'stack' }, el('p', { class: 'answer-short' }, p.tell),
        el('dl', { class: 'use-avoid' }, el('dt', {}, `Pick ${p.a}`), el('dd', {}, p.pick_a), el('dt', {}, `Pick ${p.b}`), el('dd', {}, p.pick_b))),
    })), 'Say the tell');
    const sections = groups.map(({ g, grid }) => ui.section(`grp-${g.id}`, g.name, 'Group', g.name, grid));
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      el('div', { class: 'card stack' },
        el('p', { class: 'h3' }, data.intro),
        bar, count,
        el('div', { class: 'row' }, el('button', { class: 'btn btn-gold', type: 'button', onclick: drill }, 'Drill what is shown'),
          el('span', { class: 'muted' }, 'Say the tell before you reveal it.'))),
      ...sections));
    apply();
    updateReadout();
  };
})();
