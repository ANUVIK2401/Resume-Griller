// Architecture page: eight reference architectures with traceable diagrams, requirement-to-service
// heuristics, family comparison tables, a service map, and the design checklist.
(function () {
  const { el, load, ui, store, setReadout, arch } = window.Prep;

  function scenarioCard(s, onCheck) {
    const t = arch.figure(s.diagram, s.steps, `${s.title}: reference architecture`);
    return el('article', { class: 'card stack scenario', id: `pattern-${s.id}` },
      el('header', { class: 'scenario-head' },
        el('h3', { class: 'h3' }, s.title),
        s.practice ? el('a', { class: 'btn btn-sm', href: `design.html#design-${s.practice}` }, 'Practise on the whiteboard') : null),
      el('p', { class: 'scenario-brief' }, s.scenario),
      t.figure,
      el('div', { class: 'scenario-body' },
        el('div', { class: 'stack' }, el('p', { class: 'label' }, 'Request flow'), t.steps),
        el('div', { class: 'stack' },
          el('p', { class: 'label' }, 'Why these services'),
          el('dl', { class: 'why-list' }, s.why.flatMap((w) => [el('dt', {}, w.decision), el('dd', {}, w.reason)])),
          el('p', { class: 'watch' }, el('strong', {}, 'Watch out. '), s.watch))),
      el('div', { class: 'row', onchange: onCheck }, ui.checkbox(`pattern-${s.id}`, 'I can draw this from memory and explain each step')));
  }

  function patterns(data, onCheck) {
    return ui.section('patterns', 'Reference architectures', `${data.scenarios.length} patterns`, el('span', {}, 'Reference ', el('em', {}, 'architectures')),
      el('p', { class: 'section-intro' }, 'Press Trace the request and say each step out loud. Then cover the diagram and draw it from memory.'),
      el('nav', { class: 'chip-row', 'aria-label': 'Jump to a pattern' }, data.scenarios.map((s) => el('a', { class: 'chip', href: `#pattern-${s.id}` }, s.title))),
      el('div', { class: 'stack scenarios' }, data.scenarios.map((s) => scenarioCard(s, onCheck))));
  }

  function heuristics(data) {
    return ui.section('heuristics', 'Fast heuristics', 'Requirement first', 'If you hear this, reach for that',
      el('div', { class: 'heuristics' }, data.heuristics.map((h) => el('div', { class: 'heuristic' },
        el('p', { class: 'need' }, h.need), el('p', { class: 'choose' }, h.choose)))));
  }

  // Accessible tabs: arrow keys move between families, one panel visible at a time.
  function tables(data) {
    const tabs = [], panels = [];
    const show = (i, focus) => {
      tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
      panels.forEach((p, j) => { p.hidden = i !== j; });
      if (focus) tabs[i].focus();
    };
    data.tables.forEach((t, i) => {
      tabs.push(el('button', { class: `tab cat-${t.cat}`, type: 'button', role: 'tab', id: `tab-${t.id}`, 'aria-controls': `panel-${t.id}`, onclick: () => show(i) }, t.title));
      panels.push(el('div', { class: 'tab-panel stack', role: 'tabpanel', id: `panel-${t.id}`, 'aria-labelledby': `tab-${t.id}`, tabindex: '0' },
        ui.table(['Service', 'Choose it when', 'Tradeoff to name'], t.rows.map((r) => [el('strong', {}, r.service), r.use, r.tradeoff])),
        el('p', { class: 'rule' }, el('strong', {}, 'Rule of thumb. '), t.rule)));
    });
    const list = el('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Service families' }, tabs);
    list.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const to = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (to === undefined) return;
      e.preventDefault();
      show((to + tabs.length) % tabs.length, true);
    });
    show(0);
    return ui.section('compare', 'Compare services', `${data.tables.length} families`, 'Choose between similar services', list, ...panels);
  }

  function serviceMap(data) {
    return ui.section('map', 'Service map', 'Building blocks', 'The services that keep coming up',
      el('div', { class: 'family-grid' }, data.families.map((f) => el('section', { class: `family cat-${f.cat}`, 'aria-label': f.name },
        el('h3', { class: 'family-name' }, f.name),
        el('dl', {}, f.services.flatMap((s) => [el('dt', {}, s.name), el('dd', {}, s.role)]))))));
  }

  function checklist(data) {
    return ui.section('checklist', 'Design checklist', 'Before you finish', 'Close every design the same way',
      ui.table(['Dimension', 'Questions to answer'], data.checklist.map((c) => [el('strong', {}, c.dimension), c.questions])),
      el('blockquote', { class: 'answer-format' }, el('p', { class: 'label' }, 'Say it like this'), el('p', {}, data.answer_format)));
  }

  window.Prep.pages.architecture = async ({ main }) => {
    const data = await load('architecture');
    const updateReadout = () => setReadout('Patterns I can draw', data.scenarios.filter((s) => store.get('checks', `pattern-${s.id}`, false)).length, data.scenarios.length);
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      el('div', { class: 'card stack thesis' },
        el('p', { class: 'thesis-text' }, data.principle),
        el('p', { class: 'muted' }, data.source_note)),
      patterns(data, updateReadout), heuristics(data), tables(data), serviceMap(data), checklist(data)));
    updateReadout();
  };
})();
