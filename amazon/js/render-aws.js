// AWS glossary page: searchable terms by category, flashcards, resume mapping, pillars, 7 Rs, DR tiers.
(function () {
  const { el, load, ui, store, setReadout } = { ...window.Prep, store: window.Prep.store };
  const { table } = ui;

  const useAvoid = (s) => el('dl', { class: 'use-avoid' },
    el('dt', {}, 'Pick it when'), el('dd', {}, s.use_when),
    el('dt', {}, 'Avoid when'), el('dd', {}, s.avoid_when));

  function termCard(s, data, onStatus) {
    return el('article', { class: 'term card', id: `aws-${s.id}` },
      el('div', { class: 'term-head' }, el('h3', { class: 'h3' }, s.name), ui.statusSelect(`aws-${s.id}`, data.status_options, onStatus)),
      el('p', {}, s.one_liner),
      useAvoid(s));
  }

  function glossarySection(data, onStatus) {
    const cards = new Map(data.services.map((s) => [s.id, termCard(s, data, () => { apply(); onStatus(); })]));
    const groups = data.categories.map((c) => ({ c, grid: el('div', { class: 'term-grid' }), services: data.services.filter((s) => s.category === c.id) }));
    const statusOf = (s) => store.get('status', `aws-${s.id}`, data.status_options[0].id);
    let filters = { q: '', category: '', status: '' };
    let shown = data.services;
    const apply = (f = filters) => {
      filters = f;
      const keep = (s) => (!f.q || `${s.name} ${s.one_liner} ${s.use_when}`.toLowerCase().includes(f.q))
        && (!f.category || s.category === f.category) && (!f.status || statusOf(s) === f.status);
      shown = data.services.filter(keep);
      for (const { grid, services } of groups) {
        const visible = services.filter(keep);
        grid.replaceChildren(...visible.map((s) => cards.get(s.id)));
        grid.closest('section').hidden = visible.length === 0;
      }
    };
    const bar = ui.filterBar({
      placeholder: 'Search services, e.g. queue, cache, DR',
      selects: [{ key: 'category', label: 'Any category', options: data.categories.map((c) => ({ id: c.id, label: c.name })) }, { key: 'status', label: 'Any status', options: data.status_options }],
      onChange: apply,
    });
    // Front: the service. Back: one line plus when to pick it.
    const flashcards = () => ui.rehearse(ui.shuffle(shown).map((s) => ({
      kicker: data.categories.find((c) => c.id === s.category).name,
      front: () => el('span', {}, s.name),
      back: () => el('div', { class: 'stack' }, el('p', { class: 'answer-short' }, s.one_liner), useAvoid(s)),
    })), 'AWS flashcards');
    const intro = el('div', { class: 'card stack' },
      el('a', { class: 'btn btn-gold', href: 'cheatsheet.html' }, 'Start with the two-week AWS cheat sheet'),
      el('p', { class: 'h3' }, data.mental_model),
      el('p', { class: 'muted' }, `${data.services.length} terms. ${data.verify_note}`),
      bar,
      el('div', { class: 'row' }, el('button', { class: 'btn btn-gold', type: 'button', onclick: flashcards }, 'Flashcards for what is shown'),
        el('span', { class: 'muted' }, 'Tip: filter Status to New or Shaky first.')));
    const sections = groups.map(({ c, grid, services }) => ui.section(`cat-${c.id}`, `${c.name} (${services.length})`, 'Category', c.name, grid));
    apply();
    return [intro, ...sections];
  }

  function resumeSection(data, behavioral) {
    const story = (id) => behavioral.stories.find((s) => s.id === id);
    return ui.section('resume-map', 'Resume to AWS', 'Say this out loud', el('span', {}, 'Your resume, ', el('em', {}, 'on AWS')),
      el('p', { class: 'section-intro' }, 'These are proposed AWS designs. Describe the platform you actually used first; then say how you would approach the same problem on AWS.'),
      table(['You did', 'AWS equivalent', 'Story'], data.resume_map.map((r) => [r.you_did, r.aws,
        r.story ? el('a', { href: `behavioral.html#story-${r.story}` }, story(r.story).code) : ''])));
  }

  function pillarsSection(data) {
    return ui.section('pillars', 'Well-Architected', '6 pillars', el('span', {}, 'Well-Architected ', el('em', {}, 'pillars')),
      el('div', { class: 'grid-3', style: { marginTop: '1.25rem' } }, data.pillars.map((p) => el('div', { class: 'card stack pillar' },
        el('p', { class: 'h3' }, p.name),
        el('p', { class: 'probe-q' }, p.question),
        ui.list(p.practices),
        el('p', { class: 'muted' }, `Your proof: ${p.tie}`)))));
  }

  function migrationSection(data) {
    return ui.section('seven-rs', 'Migration 7 Rs', 'Least to most change', el('span', {}, 'The ', el('em', {}, '7 Rs')),
      table(['Strategy', 'What it means', 'Example'], data.seven_rs.map((r) => [r.name, r.what, r.example])));
  }

  function drSection(data) {
    return ui.section('dr', 'DR tiers', 'Cheapest to fastest', el('span', {}, 'Disaster ', el('em', {}, 'recovery')),
      el('div', { class: 'grid-2', style: { marginTop: '1.25rem' } }, data.dr_terms.map((t) => el('div', { class: 'card card-navy stack' }, el('p', { class: 'h3' }, t.term), el('p', {}, t.meaning)))),
      el('div', { style: { marginTop: '1rem' } }, table(['Strategy', 'RPO', 'RTO', 'Cost', 'How'], data.dr_tiers.map((d) => [d.name, d.rpo, d.rto, d.cost, d.how]))),
      el('p', { class: 'muted', style: { marginTop: '0.75rem' } }, 'RPO and RTO values are typical ranges for discussion, not guarantees. Always ask the customer for theirs first.'));
  }

  function sharedSection(data) {
    const s = data.shared_responsibility;
    return ui.section('shared', 'Shared responsibility', 'Who secures what', el('span', {}, 'Shared ', el('em', {}, 'responsibility')),
      el('div', { class: 'grid-2', style: { marginTop: '1.25rem' } },
        el('div', { class: 'card stack' }, el('p', { class: 'h3' }, 'AWS: security of the cloud'), ui.list(s.aws)),
        el('div', { class: 'card stack' }, el('p', { class: 'h3' }, 'Customer: security in the cloud'), ui.list(s.customer))),
      el('p', { class: 'muted', style: { marginTop: '0.75rem' } }, s.note),
      el('div', { class: 'grid-2', style: { marginTop: '1rem' } }, data.other_frameworks.map((f) => el('div', { class: 'comp' }, el('p', { class: 'h3' }, f.name), el('p', { class: 'muted' }, f.what)))));
  }

  window.Prep.pages.aws = async ({ main }) => {
    const [data, behavioral] = await Promise.all([load('aws'), load('behavioral')]);
    const knownId = data.status_options.at(-1).id;
    const updateReadout = () => setReadout('Terms known', data.services.filter((s) => store.get('status', `aws-${s.id}`) === knownId).length, data.services.length);
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      ...glossarySection(data, updateReadout),
      resumeSection(data, behavioral),
      pillarsSection(data),
      migrationSection(data),
      drSection(data),
      sharedSection(data)));
    updateReadout();
  };
})();
