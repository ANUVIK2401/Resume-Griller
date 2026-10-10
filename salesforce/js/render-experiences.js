(function () {
  const { el, load, ui, store, experiences, setReadout } = window.Prep;
  function card(record, updateReadout) {
    const timer = ui.timer(1.5);
    const node = el('details', { class: 'item experience-card', id: `experience-${record.id}` },
      el('summary', {}, el('span', { class: 'item-title' }, record.title,
        el('span', { class: 'experience-date' }, `${experiences.dateLabel(record.interviewDate)} · ${record.region}`)),
        el('span', { class: 'item-meta' }, record.level !== 'Official' ? el('span', { class: 'chip' }, record.level) : null,
          el('span', { class: 'chip chip-gold evidence-type' }, record.evidence === 'firsthand' ? 'Candidate report' : 'Official'))),
      el('div', { class: 'item-body' },
        el('div', { class: 'experience-topline' }, el('p', { class: 'experience-date' }, experiences.dateLabel(record.interviewDate)), el('p', { class: 'muted' }, `${record.role} · ${record.location}`)),
        el('p', { class: 'muted' }, record.datePrecision),
        el('div', { class: 'kv experience-rounds' }, el('p', { class: 'label' }, record.evidence === 'firsthand' ? 'What this candidate reported' : 'Guidance from Salesforce'), ui.list(record.reportedRounds)),
        el('div', { class: 'experience-takeaway' }, el('p', { class: 'label' }, 'Use this in your preparation'), el('p', {}, record.takeaway)),
        el('div', { class: 'card delivery-card stack' }, el('p', { class: 'label' }, 'Say it aloud, then go deeper'), el('p', { class: 'h3' }, record.rehearsalPrompt), timer.node,
          ui.checkbox(`experience-${record.id}`, 'I practiced this takeaway aloud')),
        el('p', { class: 'muted' }, record.caveat),
        el('a', { class: 'btn btn-sm', href: record.sourceUrl, target: '_blank', rel: 'noopener noreferrer' }, `Read source: ${record.sourceType}`),
        ui.notesBox(`experience-${record.id}`, 'How I will apply this to my loop')));
    node.addEventListener('change', updateReadout);
    node.addEventListener('toggle', () => { if (!node.open) timer.stop(); });
    return node;
  }
  window.Prep.pages.experiences = async ({ main }) => {
    const data = await load('experiences');
    const errors = experiences.validate(data);
    if (errors.length) throw new Error(`Experience data is invalid: ${errors[0]}`);
    const update = () => setReadout('Takeaways practiced', data.records.filter(r => store.get('checks', `experience-${r.id}`, false)).length, data.records.length);
    let shown = data.records;
    const items = new Map(data.records.map(r => [r.id, card(r, update)]));
    const results = el('div', { class: 'experience-list item-list' });
    const count = el('p', { class: 'muted', role: 'status', 'aria-live': 'polite' });
    const apply = filters => {
      shown = experiences.select(data.records, filters);
      count.textContent = `${shown.length} of ${data.records.length} sources`;
      // Keep nodes connected so filtering preserves drafts and timer state.
      items.forEach((node, id) => { node.hidden = !shown.some(r => r.id === id); if (node.hidden) node.open = false; });
      empty.hidden = shown.length !== 0;
    };
    const empty = el('p', { class: 'empty-state', hidden: true }, 'No reports match. Clear the search or select another level, location, or source type.');
    const options = key => [...new Set(data.records.map(r => r[key]))].map(id => ({ id, label: id }));
    const filters = ui.filterBar({ placeholder: 'Search reports, topics, and takeaways', selects: [
      { key: 'level', label: 'Any level', options: options('level') },
      { key: 'region', label: 'Any location', options: options('region') },
      { key: 'evidence', label: 'Any source type', options: [{ id: 'firsthand', label: 'Candidate reports' }, { id: 'official', label: 'Official guidance' }] },
    ], onChange: apply });
    results.append(...items.values(), empty);
    const rehearse = () => ui.rehearse(shown.map(r => ({ kicker: `${r.level} · ${experiences.dateLabel(r.interviewDate)}`, front: () => el('span', {}, r.rehearsalPrompt), back: () => el('div', { class: 'stack' }, el('p', { class: 'h3' }, r.takeaway), el('p', { class: 'muted' }, r.caveat), el('a', { href: r.sourceUrl, target: '_blank', rel: 'noopener noreferrer' }, 'Read the report')) })), 'Practice report takeaways');
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      el('div', { class: 'notice stack' }, el('p', { class: 'h3' }, 'Learn from a loop. Prepare for your loop.'),
        el('p', {}, `Reviewed ${data.reviewedAsOf}. Seven first-person experiences and two official resources. Reports span 2025 and 2026 and are self-reported, mostly from India. Filter for your level and location.`),
        el('p', { class: 'muted' }, 'Round counts and questions vary by team. Your recruiter-confirmed agenda takes priority. These reports are practice evidence, not a prediction or a verified assessment rubric.'),
        el('div', { class: 'row' }, el('a', { class: 'btn btn-gold', href: 'index.html#delivery' }, 'Practice delivery'), el('a', { class: 'btn', href: 'index.html#loop' }, 'Your loop tracker'))),
      ui.section('reports', 'Reports and takeaways', 'Experiences', el('span', {}, 'From reports to ', el('em', {}, 'rehearsal')),
        filters, el('div', { class: 'row' }, count, el('button', { class: 'btn btn-gold', type: 'button', onclick: rehearse }, 'Rehearse filtered takeaways'),
          el('button', { class: 'btn', type: 'button', onclick: () => filters.resetFilters() }, 'Clear filters')), results)));
    apply({}); update();
  };
})();
