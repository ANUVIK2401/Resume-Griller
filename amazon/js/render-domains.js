// Technical domains: focus map, then per domain a cheat sheet, figures, and a question bank where the
// plain answer comes first. CS fundamentals also carries the spoken "walk me through this code" drills.
(function () {
  const { el, load, ui, store, setReadout, figure } = { ...window.Prep, store: window.Prep.store };
  const ROLE_LABEL = { depth: 'Depth', breadth: 'Breadth', backup: 'Backup' };
  const LEVELS = [{ id: 'basic', label: 'Basic' }, { id: 'intermediate', label: 'Intermediate' }, { id: 'deep', label: 'Deep' }];

  const kv = (label, body, cls) => el('div', { class: `kv${cls ? ` ${cls}` : ''}` }, el('p', { class: 'label' }, label), typeof body === 'string' ? el('p', {}, ui.fill(body)) : body);

  function questionItem(q, data, onStatus) {
    return el('details', { class: 'item dq', id: `q-${q.id}`, 'data-level': q.level },
      el('summary', {},
        el('span', { class: 'item-title' }, q.q),
        el('span', { class: 'item-meta', onclick: (e) => e.stopPropagation() },
          el('span', { class: `chip level-${q.level}` }, q.level),
          ui.statusSelect(`dq-${q.id}`, data.status_options, onStatus))),
      el('div', { class: 'item-body' },
        kv('Explain it simply', q.plain, 'explain-plain'),
        kv('Technical answer', q.technical),
        el('div', { class: 'item-list' }, q.probes.map((p) => el('div', { class: 'probe' }, el('p', { class: 'probe-q' }, p.q), el('p', {}, ui.fill(p.a))))),
        q.aws ? kv('On AWS', q.aws) : null,
        q.resume ? kv('From my work', q.resume, 'resume-tie') : null,
        el('div', { class: 'trap' }, el('p', { class: 'label' }, 'Trap'), el('p', {}, q.trap))));
  }

  function drillItem(d) {
    return el('details', { class: 'item', id: `drill-${d.id}` },
      el('summary', {}, el('span', { class: 'item-title' }, d.title)),
      el('div', { class: 'item-body' },
        ui.codeBlock(d.code),
        el('p', { class: 'muted' }, 'Say what it does, its cost, the bug, and the fix before you open the answer.'),
        el('details', { class: 'fold' }, el('summary', {}, 'Answer'),
          el('div', { class: 'fold-body' },
            kv('What it does', d.what), kv('Complexity', d.complexity), kv('Bug or risk', d.bug), kv('Improve it', d.improve), kv('Explain it simply', d.plain, 'explain-plain')))));
  }

  function cheatSheet(domain) {
    return el('div', { class: 'card stack' },
      el('p', { class: 'label' }, `Cheat sheet: ${domain.cheatsheet.length} concepts`),
      ui.table(['Concept', 'In one line', 'What they probe'], domain.cheatsheet.map((c) => [el('strong', {}, c.term), c.def, c.probe])));
  }

  function domainSection(domain, data, onStatus, register) {
    const byTopic = new Map();
    domain.questions.forEach((q) => byTopic.set(q.topic, [...(byTopic.get(q.topic) || []), q]));
    const items = domain.questions.map((q) => {
      const node = questionItem(q, data, onStatus);
      register(q, node);
      return [q.id, node];
    });
    const nodeOf = new Map(items);
    const rehearse = () => ui.rehearse(ui.shuffle(domain.questions).map((q) => ({
      kicker: `${domain.name} · ${q.level}`,
      front: () => el('span', {}, q.q),
      back: () => el('div', { class: 'stack' }, kv('Explain it simply', q.plain, 'explain-plain'), kv('Technical answer', q.technical)),
    })), `Rehearse ${domain.name}`);
    return ui.section(domain.id, domain.name, `${ROLE_LABEL[domain.role]} · ${domain.questions.length} questions`, el('span', {}, domain.name),
      el('p', { class: 'section-intro' }, domain.summary),
      el('div', { class: 'row' },
        el('button', { class: 'btn btn-gold', type: 'button', onclick: rehearse }, 'Rehearse this domain'),
        (domain.links || []).map((l) => el('a', { class: 'chip', href: l.href }, l.label))),
      cheatSheet(domain),
      domain.figures?.length ? el('div', { class: 'fig-grid' }, domain.figures.map(figure)) : null,
      [...byTopic.entries()].map(([topic, qs]) => el('div', { class: 'stack topic-group' },
        el('h3', { class: 'h3' }, topic),
        el('div', { class: 'item-list' }, qs.map((q) => nodeOf.get(q.id))))),
      domain.drills?.length ? el('section', { class: 'stack', id: 'drills', 'aria-labelledby': 'drills-h' },
        el('h3', { class: 'h3', id: 'drills-h' }, `Walk me through this code: ${domain.drills.length} drills`),
        el('p', { class: 'muted' }, 'No live coding in this loop. Read each snippet, then explain it out loud as if to the interviewer.'),
        el('div', { class: 'item-list' }, domain.drills.map(drillItem))) : null,
      el('details', { class: 'fold' }, el('summary', {}, `Sources checked on ${domain.verified_on}`),
        el('div', { class: 'fold-body' }, el('ul', { class: 'list' }, domain.sources.map((s) => el('li', {}, el('a', { href: s.url, rel: 'noopener', target: '_blank' }, s.label)))))));
  }

  function focusSection(data, loop) {
    const byId = (id) => data.domains.find((d) => d.id === id);
    const card = (d) => el('a', { class: `card stack domain-card role-${d.role}`, href: `#${d.id}` },
      el('p', { class: 'label' }, ROLE_LABEL[d.role]), el('p', { class: 'h3' }, d.name),
      el('p', { class: 'muted' }, `${d.questions.length} questions · ${d.cheatsheet.length} concepts`));
    const f = loop.focus_areas;
    return ui.section('focus', 'Your areas', 'Depth, breadth, backup', el('span', {}, 'Where to ', el('em', {}, 'spend time')),
      el('div', { class: 'card card-navy stack' },
        el('p', {}, el('strong', {}, 'The most important skill of the day: '), 'explaining a technical idea to a non-technical listener. On every question, say the plain answer first, then go technical only when they ask.'),
        el('p', { class: 'muted' }, f.note)),
      el('div', { class: 'grid-3', style: { marginTop: '1rem' } }, [f.depth, ...f.breadth, ...f.backup].map(byId).filter(Boolean).map(card)));
  }

  window.Prep.pages.domains = async ({ main, loop }) => {
    const data = await load('domains');
    const all = data.domains.flatMap((d) => d.questions);
    const knownId = data.status_options.at(-1).id;
    const updateReadout = () => setReadout('Questions known', all.filter((q) => store.get('status', `dq-${q.id}`) === knownId).length, all.length);
    const nodes = [];
    const register = (q, node) => nodes.push({ q, node });
    const bar = ui.filterBar({
      placeholder: 'Search all questions',
      selects: [{ key: 'level', label: 'Any level', options: LEVELS }, { key: 'status', label: 'Any status', options: data.status_options }],
      onChange: ({ q, level, status }) => nodes.forEach(({ q: item, node }) => {
        node.hidden = !((!q || `${item.q} ${item.plain} ${item.technical}`.toLowerCase().includes(q))
          && (!level || item.level === level)
          && (!status || store.get('status', `dq-${item.id}`, data.status_options[0].id) === status));
      }),
    });
    const sections = data.domains.map((d) => domainSection(d, data, updateReadout, register));
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      focusSection(data, loop),
      el('div', { class: 'sticky-filter' }, bar),
      ...sections));
    updateReadout();
  };
})();
