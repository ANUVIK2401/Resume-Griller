// System design page: framework, whiteboard mode, cheat sheet (numbers, blocks, reliability, GCP), problems.
(function () {
  const { el, load, ui, store, setReadout, icon } = { ...window.Prep, store: window.Prep.store };

  const { table } = ui;

  function frameworkSection(data) {
    const total = data.framework.reduce((n, s) => n + s.minutes, 0);
    return ui.section('framework', 'Framework', `${total} minutes`, el('span', {}, 'The ', el('em', {}, 'framework')),
      el('p', { class: 'section-intro' }, 'Same order every time. The gold step is your differentiator; never skip it.'),
      el('div', { class: 'steps' }, data.framework.map((s) => el('div', { class: `step${s.differentiator ? ' is-diff' : ''}` },
        el('div', { class: 'stack', style: { gap: '0.4rem' } }, el('p', { class: 'h3' }, s.step), ui.list(s.prompts)),
        el('span', { class: 'step-min' }, `${s.minutes} min`)))));
  }

  // Full-screen practice: prompt, timer, framework checklist. Solution stays hidden.
  function whiteboard(problem, data) {
    const t = ui.timer(data.whiteboard_minutes);
    const dialog = el('dialog', { class: 'rehearse', 'aria-label': `Whiteboard: ${problem.title}` },
      el('div', { class: 'rh-top' },
        el('span', { class: 'rh-title' }, 'Whiteboard mode'), el('span', { class: 'rh-count' }, problem.title),
        el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Close', onclick: () => dialog.close() }, icon('close'))),
      el('div', { class: 'rh-body' },
        el('p', { class: 'rh-front rh-prompt' }, problem.prompt),
        el('div', { class: 'row' }, t.node),
        el('div', { class: 'stack', style: { gap: '0.6rem' } },
          el('p', { class: 'label' }, 'Framework checklist'),
          data.framework.map((s) => ui.checkbox(`wb-${problem.id}-${s.id}`, `${s.step} (${s.minutes} min)`))),
        el('div', { class: 'row' }, el('button', { class: 'btn btn-sm', type: 'button', onclick: () => {
          data.framework.forEach((s) => store.set('checks', `wb-${problem.id}-${s.id}`, null));
          dialog.close();
          whiteboard(problem, data);
        } }, 'Clear checklist'))));
    dialog.addEventListener('close', () => { t.stop(); dialog.remove(); });
    document.body.append(dialog);
    dialog.showModal();
  }

  function whiteboardSection(data) {
    return ui.section('whiteboard', 'Whiteboard mode', 'Practice', el('span', {}, 'Whiteboard ', el('em', {}, 'mode')),
      el('p', { class: 'section-intro' }, `Prompt, a ${data.whiteboard_minutes}-minute timer, and the framework to tick off. The solution stays hidden until you close it.`),
      el('div', { class: 'row' }, data.problems.map((p) => el('button', { class: `btn${p.pinned ? ' btn-gold' : ''}`, type: 'button', onclick: () => whiteboard(p, data) }, p.title))));
  }

  function numbersSection(n) {
    return ui.section('numbers', 'Numbers', 'Back of the envelope', el('span', {}, 'Numbers to ', el('em', {}, 'know')),
      el('p', { class: 'section-intro' }, n.note),
      el('div', { class: 'grid-2' },
        table(['Operation', 'Roughly'], n.latency.map((r) => [r.op, r.value])),
        table(['Rule of thumb', 'Value'], n.capacity.map((r) => [r.rule, r.value]))));
  }

  function blocksSection(blocks) {
    return ui.section('blocks', 'Building blocks', 'Components', el('span', {}, 'Building ', el('em', {}, 'blocks')),
      table(['Block', 'Use it for', 'Watch out for', 'On GCP'], blocks.map((b) => [b.name, b.use, b.watch, b.gcp])));
  }

  function reliabilitySection(r) {
    return ui.section('reliability', 'Reliability and SLOs', 'Your differentiator', el('span', {}, 'SLOs and ', el('em', {}, 'burn rates')),
      el('div', { class: 'grid-2', style: { marginTop: '1.25rem' } },
        el('div', { class: 'card card-navy stack' }, r.terms.map((t) => el('div', { class: 'kv' }, el('p', { class: 'label' }, t.term), el('p', {}, t.meaning)))),
        el('div', { class: 'stack' },
          table(['Alert', 'Budget spent', 'Burn rate', 'Windows'], r.burn_rates.map((b) => [b.severity, b.budget, b.burn_rate, b.windows])),
          el('p', { class: 'muted' }, r.burn_note))),
      el('div', { class: 'grid-3', style: { marginTop: '1rem' } }, r.patterns.map((p) => el('div', { class: 'comp' }, el('p', { class: 'h3' }, p.name), el('p', { class: 'muted' }, p.what)))));
  }

  function gcpSection(data) {
    return ui.section('gcp', 'GCP mapping', 'Say the GCP name', el('span', {}, 'On ', el('em', {}, 'GCP')),
      table(['You know', 'On GCP', 'Note'], data.gcp_map.map((g) => [g.generic, g.gcp, g.note])),
      el('div', { class: 'card stack', style: { marginTop: '1rem' } }, el('p', { class: 'label' }, 'Salesforce context'), ui.list(data.context)));
  }

  function problemBody(p) {
    const diagram = ui.diagram(p.diagram, `Architecture diagram for ${p.title}`);
    return [
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Prompt'), el('p', { class: 'h3' }, p.prompt)),
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Ask first'), ui.list(p.clarifying)),
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Back of the envelope'),
        table(['Quantity', 'Estimate', 'How'], p.estimates.map((e) => [e.label, e.value, e.math || '']))),
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Diagram'), diagram),
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Components'),
        table(['Component', 'Role', 'GCP'], p.components.map((c) => [c.name, c.role, c.gcp || '']))),
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Deep dive options'),
        el('div', { class: 'grid-3' }, p.deep_dives.map((d) => el('div', { class: 'comp' }, el('p', { class: 'h3' }, d.title), ui.list(d.points))))),
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Failure modes'),
        table(['Failure', 'Mitigation'], p.failure_modes.map((f) => [f.failure, f.mitigation]))),
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Interviewer follow-ups'), ui.list(p.followups)),
      el('div', { class: 'probe' }, el('p', { class: 'probe-q' }, 'Tie to my experience'), el('p', {}, p.tie)),
    ];
  }

  function problemItem(p, data, onStatus) {
    const body = el('div', { class: 'item-body' });
    const node = el('details', { class: 'item', id: `hld-${p.id}` },
      el('summary', {},
        el('span', { class: 'item-title' }, p.title),
        el('span', { class: 'item-meta', onclick: (e) => e.stopPropagation() },
          p.pinned ? el('span', { class: 'chip chip-gold' }, 'Top priority') : null,
          p.reported ? el('span', { class: 'chip chip-gold' }, 'Reported') : null,
          el('span', { class: `chip diff-${p.difficulty}` }, p.difficulty),
          el('button', { class: 'btn btn-sm', type: 'button', onclick: () => whiteboard(p, data) }, 'Whiteboard'),
          ui.statusSelect(`hld-${p.id}`, data.status_options, onStatus))),
      body);
    node.addEventListener('toggle', () => {
      if (!node.open || body.childElementCount) return;
      body.append(...problemBody(p), el('div', { class: 'row' }, ui.confidence(`hld-${p.id}`)), ui.notesBox(`hld-${p.id}`, 'Your notes: what you forgot under the timer'));
    });
    return node;
  }

  window.Prep.pages.hld = async ({ main }) => {
    const data = await load('hld');
    const readyId = data.status_options.at(-1).id;
    const updateReadout = () => setReadout('Problems ready', data.problems.filter((p) => store.get('status', `hld-${p.id}`) === readyId).length, data.problems.length);
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      frameworkSection(data),
      whiteboardSection(data),
      ui.section('problems', 'Problems', `${data.problems.length} designs`, el('span', {}, 'Practice ', el('em', {}, 'problems')),
        el('p', { class: 'section-intro' }, 'Open one to see the full answer. Try it in whiteboard mode first.'),
        el('div', { class: 'item-list' }, data.problems.map((p) => problemItem(p, data, updateReadout)))),
      numbersSection(data.numbers),
      blocksSection(data.blocks),
      reliabilitySection(data.reliability),
      gcpSection(data)));
    updateReadout();
  };
})();
