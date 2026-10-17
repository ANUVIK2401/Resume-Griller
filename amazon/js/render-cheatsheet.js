// Curated customer decisions, distinct from the full AWS glossary.
(function () {
  function filterTopics(topics, filters = {}) {
    const q = String(filters.q || '').trim().toLowerCase();
    return topics.filter((topic) => (!filters.priority || topic.priority === filters.priority)
      && (!filters.domain || topic.domain === filters.domain)
      && (!q || [topic.name, topic.domain, topic.decision, topic.tradeoff, topic.failure, topic.say, topic.probe]
        .join(' ').toLowerCase().includes(q)));
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { filterTopics };
  if (typeof window === 'undefined') return;
  const { el, load, ui, setReadout, store } = window.Prep;
  const field = (title, text) => el('p', {}, el('strong', {}, `${title}: `), text);
  const refs = (item, data) => el('p', { class: 'muted' }, 'Official AWS: ', item.sources.map((id, index) => {
    const source = data.sources.find((entry) => entry.id === id);
    return el('span', {}, index ? ' | ' : '', el('a', { href: source.url, target: '_blank', rel: 'noopener noreferrer' }, source.title));
  }));
  const topicCard = (topic, data) => el('article', { class: 'card stack', id: `decision-${topic.id}` },
    el('p', { class: 'label' }, `${topic.priority} / ${topic.domain}`),
    el('h3', { class: 'h3' }, topic.name), field('Choose', topic.decision),
    field('Tradeoff', topic.tradeoff), field('Failure', topic.failure),
    field('Say it aloud', topic.say), field('Interviewer probe', topic.probe),
    ui.checkbox(`decision-${topic.id}`, 'I can explain this and defend an alternative'), refs(topic, data));

  function decisions(data) {
    let filters = { priority: 'P0' };
    const grid = el('div', { class: 'grid-2' });
    const count = el('p', { class: 'muted', role: 'status', 'aria-live': 'polite' });
    const paint = () => {
      const topics = filterTopics(data.topics, filters);
      grid.replaceChildren(...topics.map((topic) => topicCard(topic, data)));
      count.textContent = `${topics.length} of ${data.topics.length} decisions shown`;
      if (!topics.length) grid.append(el('p', {}, 'No decisions match. Clear the search or change the filters.'));
    };
    const bar = ui.filterBar({ placeholder: 'Search decisions, tradeoffs or failure modes',
      selects: [{ key: 'priority', label: 'All priorities', options: data.priorities.map((p) => ({ id: p.id, label: `${p.id}: ${p.name}` })) },
        { key: 'domain', label: 'All domains', options: [...new Set(data.topics.map((t) => t.domain))].map((d) => ({ id: d, label: d })) }],
      onChange: (next) => { filters = next; paint(); } });
    // Initialize the select and rendered data to the same P0 default.
    bar.querySelector('select').value = 'P0';
    bar.querySelector('select').dispatchEvent(new Event('change'));
    const flashcards = () => ui.rehearse(ui.shuffle(filterTopics(data.topics, filters)).map((topic) => ({
      kicker: `${topic.priority} / ${topic.domain}`, front: () => el('div', {}, el('h3', {}, topic.name), el('p', {}, topic.probe)),
      back: () => el('div', { class: 'stack' }, field('Choose', topic.decision), field('Tradeoff', topic.tradeoff), field('Failure', topic.failure)),
    })), 'AWS customer decisions');
    paint();
    return ui.section('decisions', 'Service decisions', 'P0 first', 'Choose and defend the architecture',
      el('div', { class: 'card stack' }, bar, count,
        el('button', { class: 'btn btn-gold', type: 'button', onclick: flashcards }, 'Rehearse shown decisions')), grid);
  }

  function walkthroughs(data) {
    return ui.section('walkthroughs', 'Customer walkthroughs', 'Hypothetical AWS designs', 'Four customer conversations',
      el('p', { class: 'section-intro' }, 'Practice discovery, a simple data flow, an alternative, a failure and a measurable next step.'),
      ...data.walkthroughs.map((w) => el('article', { class: 'card stack', id: `walkthrough-${w.id}` },
        el('h3', { class: 'h3' }, w.name), el('p', {}, w.customer),
        el('h4', {}, 'Ask first'), ui.list(w.discovery), el('h4', {}, 'Proposed flow'), ui.list(w.flow),
        field('Tradeoff', w.tradeoff), field('Failure drill', w.challenge), field('Validate', w.validation), refs(w, data))));
  }

  function labs(data) {
    return ui.section('labs', 'Optional labs', 'Use synthetic data', 'Small experiments with an offline path',
      el('p', { class: 'section-intro' }, data.lab_policy),
      ...data.labs.map((lab) => el('article', { class: 'card stack' },
        el('h3', { class: 'h3' }, `${lab.name} (${lab.minutes} minutes)`),
        field('Cost gate', lab.cost_gate), ui.list(lab.steps), field('Offline alternative', lab.offline),
        el('h4', {}, 'Cleanup'), ui.list(lab.cleanup), refs(lab, data))));
  }

  window.Prep.pages.cheatsheet = async ({ main }) => {
    const data = await load('cheatsheet');
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      el('div', { class: 'card stack' }, el('p', { class: 'h3' }, data.purpose),
        el('p', {}, data.experience_boundary), el('p', { class: 'muted' }, `Official documentation verified ${data.verified_on}. Check current regional pricing, availability and quotas for real designs.`),
        el('div', { class: 'row' }, el('a', { href: 'architecture.html', class: 'btn btn-gold' }, 'Open the architecture diagrams'),
          el('a', { href: 'AWS-CHEATSHEET.md', download: 'AWS-CHEATSHEET.md', class: 'btn' }, 'Download the Markdown cheatsheet'))),
      ui.section('answer-frame', 'Answer structure', 'Start with the customer', 'A repeatable architecture answer', ui.list(data.answer_frame),
        el('div', { class: 'grid-3' }, data.priorities.map((p) => el('div', { class: 'card stack' }, el('h3', { class: 'h3' }, `${p.id}: ${p.name}`), el('p', {}, p.when))))),
      decisions(data),
      ui.section('comparisons', 'Comparison traps', 'Avoid overclaiming', 'Defend one credible alternative',
        el('div', { class: 'grid-2' }, data.comparisons.map((c) => el('article', { class: 'card stack' },
          el('h3', { class: 'h3' }, c.title), el('p', {}, c.answer), field('Trap', c.trap), refs(c, data))))),
      walkthroughs(data), labs(data)));
    const updateReadout = () => setReadout('Decisions I can defend',
      data.topics.filter((topic) => store.get('checks', `decision-${topic.id}`, false)).length, data.topics.length);
    updateReadout();
    const unsubscribe = store.subscribe(updateReadout);
    window.addEventListener('pagehide', (event) => { if (!event.persisted) unsubscribe(); });
  };
})();
