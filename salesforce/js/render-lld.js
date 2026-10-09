// LLD page: AI-assisted workflow, catch-the-AI practice, designs with tested solutions, pattern reference.
(function () {
  const { el, load, loadText, ui, store, setReadout, icon } = { ...window.Prep, store: window.Prep.store };

  const TEST_BLOCK = '\nif __name__ == "__main__":';
  const CATCH_MINUTES = 15;

  async function splitSolution(path) {
    const text = await loadText(path);
    const at = text.indexOf(TEST_BLOCK);
    return at < 0 ? { code: text.trimEnd(), tests: '' } : { code: text.slice(0, at).trimEnd(), tests: text.slice(at + 1).trimEnd() };
  }

  // Code that arrives later: placeholder now, code block when loaded.
  function lazyCode(label, loader) {
    const box = el('div', { class: 'kv' }, el('p', { class: 'label' }, label), el('p', { class: 'muted' }, 'Loading...'));
    loader()
      .then(([text, name]) => box.replaceChildren(el('p', { class: 'label' }, label), ui.codeBlock(text, name)))
      .catch((err) => box.replaceChildren(el('p', { class: 'notice is-error' }, `${label} failed to load: ${err.message}`)));
    return box;
  }

  function bugList(p) {
    return el('div', { class: 'item-list' }, p.ai_exercise.bugs.map((b) => el('div', { class: 'probe' },
      el('div', { class: 'row' }, ui.checkbox(`catch-${p.id}-${b.id}`, ''), el('span', { class: 'chip chip-red' }, b.category), el('span', { class: 'chip' }, b.where)),
      el('p', { class: 'probe-q' }, b.bug),
      el('p', {}, el('strong', {}, 'Fix: '), b.fix))));
  }

  // Practice: read the flawed code, write what you see, then reveal.
  function catchTheAI(p) {
    const t = ui.timer(CATCH_MINUTES);
    const reveal = el('div', { class: 'stack' });
    const revealBtn = el('button', { class: 'btn btn-gold', type: 'button', onclick: () => {
      t.stop();
      reveal.replaceChildren(el('p', { class: 'label' }, `${p.ai_exercise.bugs.length} planted bugs. Tick the ones you caught.`), bugList(p));
      revealBtn.disabled = true;
    } }, 'Reveal the bugs');
    const dialog = el('dialog', { class: 'rehearse rehearse-wide', 'aria-label': `Catch the AI: ${p.title}` },
      el('div', { class: 'rh-top' },
        el('span', { class: 'rh-title' }, 'Catch the AI'), el('span', { class: 'rh-count' }, p.title),
        el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Close', onclick: () => dialog.close() }, icon('close'))),
      el('div', { class: 'rh-body' },
        el('p', { class: 'muted' }, 'An assistant wrote this. Review it out loud like the interviewer is watching: thread safety, single responsibility, missing states, edge cases, leaked internals.'),
        el('div', { class: 'row' }, t.node),
        lazyCode('AI-generated code', async () => [await loadText(p.ai_exercise.flawed_file), `${p.id}.flawed.py`]),
        ui.notesBox(`catch-${p.id}`, 'Bugs you found, one per line'),
        el('div', { class: 'row' }, revealBtn),
        reveal));
    dialog.addEventListener('close', () => { t.stop(); dialog.remove(); });
    document.body.append(dialog);
    dialog.showModal();
    t.start();
  }

  function designBody(p, data) {
    return [
      p.prompt ? el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Prompt'), el('p', { class: 'h3' }, p.prompt)) : null,
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Requirements'), ui.list(p.requirements)),
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Entities'), ui.table(['Class', 'Role'], p.entities.map((e) => [e.name, e.role]))),
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Class diagram'), ui.diagram(p.diagram, `Class diagram for ${p.title}`)),
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Key interfaces'), ui.list(p.interfaces)),
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Patterns used'),
        el('div', { class: 'row' }, p.patterns.map((id) => el('a', { class: 'chip chip-gold', href: `#pat-${id}` }, data.pattern_cards.find((c) => c.id === id).name)))),
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Concurrency'), ui.list(p.concurrency)),
      lazyCode('Reference solution, tested', async () => [(await splitSolution(p.solution_file)).code, `${p.id}.py`]),
      lazyCode('Tests', async () => [(await splitSolution(p.solution_file)).tests, 'tests']),
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Extension questions'), ui.list(p.extensions)),
    ];
  }

  function designItem(p, data, onStatus) {
    const body = el('div', { class: 'item-body' });
    const node = el('details', { class: 'item', id: `lld-${p.id}` },
      el('summary', {},
        el('span', { class: 'item-title' }, p.title),
        el('span', { class: 'item-meta', onclick: (e) => e.stopPropagation() },
          p.reported ? el('span', { class: 'chip chip-gold' }, 'Reported 2026') : null,
          el('span', { class: `chip diff-${p.difficulty}` }, p.difficulty),
          el('button', { class: 'btn btn-sm', type: 'button', onclick: () => catchTheAI(p) }, 'Catch the AI'),
          ui.statusSelect(`lld-${p.id}`, data.status_options, onStatus))),
      body);
    node.addEventListener('toggle', () => {
      if (!node.open || body.childElementCount) return;
      body.append(...designBody(p, data).filter(Boolean), el('div', { class: 'row' }, ui.confidence(`lld-${p.id}`)), ui.notesBox(`lld-${p.id}`, 'Your notes'));
    });
    return node;
  }

  function workflowSection(data) {
    return ui.section('workflow', 'AI-assisted workflow', 'Round 5', el('span', {}, 'How I use AI ', el('em', {}, 'in the round')),
      el('p', { class: 'section-intro' }, 'Say this plan before you open the assistant. The interviewer is grading your judgment, not the AI.'),
      el('div', { class: 'card card-navy' }, el('div', { class: 'steps' }, data.workflow.map((w) => el('div', { class: 'step' }, el('p', {}, w), el('span'))))));
  }

  function catchSection(data) {
    const found = (p) => p.ai_exercise.bugs.filter((b) => store.get('checks', `catch-${p.id}-${b.id}`, false)).length;
    return ui.section('catch', 'Catch the AI', 'Practice', el('span', {}, 'Catch the ', el('em', {}, 'AI')),
      el('p', { class: 'section-intro' }, `Each design has a plausible AI-written version with planted bugs. ${CATCH_MINUTES} minutes, find them, then reveal.`),
      el('div', { class: 'grid-3' }, data.problems.map((p) => el('div', { class: 'comp' },
        el('p', { class: 'h3' }, p.title),
        el('p', { class: 'muted' }, `${found(p)} of ${p.ai_exercise.bugs.length} bugs caught so far`),
        el('div', { class: 'row' }, el('button', { class: `btn btn-sm${p.pinned ? ' btn-gold' : ''}`, type: 'button', onclick: () => catchTheAI(p) }, 'Start'))))));
  }

  function patternsSection(cards) {
    return ui.section('patterns', 'Pattern reference', 'Reference', el('span', {}, 'Pattern ', el('em', {}, 'reference')),
      el('div', { class: 'grid-2', style: { marginTop: '1.25rem' } }, cards.map((c) => el('div', { class: 'card stack', id: `pat-${c.id}` },
        el('p', { class: 'h3' }, c.name),
        el('p', { class: 'muted' }, c.when),
        ui.codeBlock(c.sketch, c.name.toLowerCase()),
        c.pitfalls ? ui.list(c.pitfalls) : null))));
  }

  window.Prep.pages.lld = async ({ main }) => {
    const data = await load('lld');
    const readyId = data.status_options.at(-1).id;
    const updateReadout = () => setReadout('Designs ready', data.problems.filter((p) => store.get('status', `lld-${p.id}`) === readyId).length, data.problems.length);
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      workflowSection(data),
      catchSection(data),
      ui.section('designs', 'Designs', `${data.problems.length} designs`, el('span', {}, 'The ', el('em', {}, 'designs')),
        el('p', { class: 'section-intro' }, 'Every reference solution runs and passes its tests, including a concurrency test.'),
        el('div', { class: 'item-list' }, data.problems.map((p) => designItem(p, data, updateReadout)))),
      patternsSection(data.pattern_cards)));
    updateReadout();
  };
})();
