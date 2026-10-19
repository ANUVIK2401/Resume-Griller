// Whiteboard page: the 7-step framework, then six designs with a timer and a hidden answer.
(function () {
  const { el, load, ui, store, setReadout, icon } = { ...window.Prep, store: window.Prep.store };
  const { table } = ui;

  function frameworkSection(data) {
    const total = data.framework.reduce((n, s) => n + s.minutes, 0);
    return ui.section('framework', 'Framework', `${total} minutes`, el('span', {}, 'Say the ', el('em', {}, 'framework')),
      el('p', { class: 'section-intro' }, 'Same order every time, out loud. The orange step is what most candidates skip: always end on a tradeoff and a next step.'),
      el('div', { class: 'steps' }, data.framework.map((s) => el('div', { class: `step${s.differentiator ? ' is-diff' : ''}` },
        el('div', { class: 'stack', style: { gap: '0.4rem' } }, el('p', { class: 'h3' }, s.step), ui.list(s.prompts)),
        el('span', { class: 'step-min' }, `${s.minutes} min`)))));
  }

  function answer(d, behavioral) {
    const story = d.story && behavioral.stories.find((s) => s.id === d.story);
    const steps = d.flow.map((text, i) => ({ text, nodes: d.diagram.focus?.[i] || [] }));
    const figure = window.Prep.arch.figure(d.diagram, steps, `Architecture diagram for ${d.title}`);
    const block = (label, items) => (items?.length ? el('div', { class: 'kv' }, el('p', { class: 'label' }, label), ui.list(items)) : null);
    return el('div', { class: 'stack answer' },
      el('div', { class: 'grid-2' },
        block('Functional requirements', d.requirements.functional),
        block('Non-functional requirements', d.requirements.non_functional)),
      figure.figure,
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Request flow'), figure.steps),
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Why these choices'), table(['Decision', 'Why'], d.why.map((w) => [w.decision, w.reason]))),
      el('div', { class: 'probe' }, el('p', { class: 'probe-q' }, 'Watch out'), el('p', {}, d.watch_out)),
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Components'), table(['Component', 'Role'], d.components.map((c) => [c.name, c.role]))),
      el('div', { class: 'grid-3' },
        block('Scale', d.scale), block('Security', d.security), block('Cost', d.cost)),
      el('div', { class: 'probe' }, el('p', { class: 'probe-q' }, 'The tradeoff to say out loud'), el('p', {}, d.tradeoff)),
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Failure modes'), table(['Failure', 'Mitigation'], d.failure_modes.map((f) => [f.failure, f.mitigation]))),
      block('Interviewer follow-ups', d.followups),
      story ? el('p', { class: 'resume-line' }, el('strong', {}, 'Tie to your story: '), el('a', { href: `behavioral.html#story-${story.id}` }, `${story.code} ${story.title}`)) : null);
  }

  // Full-screen practice: prompt, timer, framework checklist. The answer stays hidden.
  function whiteboard(d, data) {
    const t = ui.timer(data.whiteboard_minutes);
    const dialog = el('dialog', { class: 'rehearse', 'aria-label': `Whiteboard: ${d.title}` },
      el('div', { class: 'rh-top' },
        el('span', { class: 'rh-title' }, 'Whiteboard mode'), el('span', { class: 'rh-count' }, d.title),
        el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Close', onclick: () => dialog.close() }, icon('close'))),
      el('div', { class: 'rh-body' },
        el('p', { class: 'rh-front rh-prompt' }, d.prompt),
        el('div', { class: 'row' }, t.node),
        el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Ask first'), ui.list(d.clarifying)),
        el('div', { class: 'stack', style: { gap: '0.6rem' } },
          el('p', { class: 'label' }, 'Framework checklist'),
          data.framework.map((s) => ui.checkbox(`wb-${d.id}-${s.id}`, `${s.step} (${s.minutes} min)`)))));
    dialog.addEventListener('close', () => { t.stop(); dialog.remove(); });
    document.body.append(dialog);
    dialog.showModal();
  }

  function designItem(d, data, behavioral, onStatus) {
    const timer = ui.timer(data.whiteboard_minutes);
    const holder = el('div');
    const reveal = el('button', { class: 'btn btn-gold', type: 'button', 'aria-expanded': 'false' }, 'Reveal answer');
    reveal.addEventListener('click', () => {
      const open = reveal.getAttribute('aria-expanded') !== 'true';
      reveal.setAttribute('aria-expanded', String(open));
      reveal.textContent = open ? 'Hide answer' : 'Reveal answer';
      if (open && !holder.childElementCount) holder.append(answer(d, behavioral));
      holder.hidden = !open;
    });
    holder.hidden = true;
    return el('details', { class: 'item', id: `design-${d.id}` },
      el('summary', {},
        el('span', { class: 'item-title' }, d.title),
        el('span', { class: 'item-meta', onclick: (e) => e.stopPropagation() },
          el('button', { class: 'btn btn-sm', type: 'button', onclick: () => whiteboard(d, data) }, 'Full screen'),
          ui.statusSelect(`design-${d.id}`, data.status_options, onStatus))),
      el('div', { class: 'item-body' },
        el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Prompt'), el('p', { class: 'h3' }, d.prompt)),
        el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Ask first'), ui.list(d.clarifying)),
        el('div', { class: 'row' }, el('span', { class: 'label' }, `${data.whiteboard_minutes}-minute timer`), timer.node),
        el('p', { class: 'muted' }, 'Draw it on paper or a whiteboard first. Reveal only after the timer.'),
        el('div', { class: 'row' }, reveal),
        holder,
        el('div', { class: 'row' }, ui.confidence(`design-${d.id}`)),
        ui.notesBox(`design-${d.id}`, 'What you forgot under the timer')));
  }

  window.Prep.pages.design = async ({ main }) => {
    const [data, behavioral] = await Promise.all([load('designs'), load('behavioral')]);
    const readyId = data.status_options.at(-1).id;
    const updateReadout = () => setReadout('Designs ready', data.designs.filter((d) => store.get('status', `design-${d.id}`) === readyId).length, data.designs.length);
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      frameworkSection(data),
      ui.section('designs', 'Designs', `${data.designs.length} practice designs`, el('span', {}, 'Practice ', el('em', {}, 'designs')),
        el('p', { class: 'section-intro' }, 'Do 4 of 6 under the timer before the loop. Start with the retailer and the RAG chatbot; they map closest to the role.'),
        el('div', { class: 'item-list' }, data.designs.map((d) => designItem(d, data, behavioral, updateReadout))))));
    updateReadout();
  };
})();
