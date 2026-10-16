// Resume evidence, honest STAR readiness, and browser-local speaking drafts.
(function () {
  const { el, load, ui, store, setReadout } = window.Prep;
  const labels = { stakes: 'Customer stakes', ownership: 'Your ownership', decision: 'Decision and rationale', tradeoff: 'Tradeoff', measurement: 'Measurement' };

  function storyCard(story, data) {
    const readiness = data.readiness_options.find(option => option.id === story.readiness).label;
    const draft = ui.notesBox(`review-${story.story_id}`, 'Your confirmed speaking draft; edits save in this browser');
    const message = el('p', { class: 'muted', role: 'status', 'aria-live': 'polite' });
    const loadDraft = () => {
      if (draft.value.trim()) {
        message.textContent = 'Your existing draft is preserved. Clear the editor first if you want to load the reviewed template.';
        return;
      }
      draft.value = story.draft;
      draft.dispatchEvent(new Event('input', { bubbles: true }));
      message.textContent = 'Answer loaded. Rehearse it as written, or adapt the phrasing; edits save locally.';
    };
    return el('details', { class: 'item', id: `review-${story.story_id}` },
      el('summary', {}, el('span', { class: 'item-title' }, `${story.code}. ${story.title}`), el('span', { class: 'chip' }, readiness)),
      el('div', { class: 'item-body stack' },
        el('p', { class: 'speaking-script' }, story.draft),
        el('div', { class: 'row' }, el('span', { class: 'label' }, '90-second rehearsal'), ui.timer(1.5).node),
        el('a', { href: `behavioral.html#story-${story.story_id}` }, 'Open the STAR breakdown and follow-up answers'),
        el('div', { class: 'row' }, el('button', { class: 'btn', type: 'button', onclick: loadDraft }, 'Load answer into empty editor')),
        el('details', { class: 'fold' }, el('summary', {}, 'Optional coaching and deeper preparation'), el('div', { class: 'fold-body' },
          el('h3', { class: 'h3' }, 'Delivery'), ui.list(story.delivery),
          el('h3', { class: 'h3' }, 'Follow-up questions'), ui.list(story.probes),
          el('h3', { class: 'h3' }, 'Strengths'), ui.list(story.strengths),
          el('h3', { class: 'h3' }, 'Details for a deeper discussion'), ui.list(story.missing),
          Object.entries(labels).map(([key, title]) => el('div', { class: 'kv' }, el('p', { class: 'label' }, title), el('p', {}, story.assessment[key]))),
          el('p', { class: 'muted' }, story.evidence_status))),
        message, draft,
        ui.checkbox(`review-checked-${story.story_id}`, 'I checked every claim in my edited draft; this is my own preparation check')));
  }

  function storySection(data) {
    const list = el('div', { class: 'item-list' });
    const cards = new Map(data.stories.map(story => [story.story_id, storyCard(story, data)]));
    const apply = ({ q = '', readiness = '' } = {}) => {
      const shown = data.stories.filter(story => (!readiness || story.readiness === readiness)
        && (!q || `${story.code} ${story.title} ${story.evidence.join(' ')} ${story.missing.join(' ')}`.toLowerCase().includes(q)));
      list.replaceChildren(...(shown.length ? shown.map(story => cards.get(story.story_id)) : [el('p', { class: 'notice' }, 'No stories match. Clear the search or readiness filter.')]));
    };
    const filters = ui.filterBar({ placeholder: 'Search story reviews', selects: [{ key: 'readiness', label: 'All readiness labels', options: data.readiness_options }], onChange: apply });
    apply();
    return ui.section('story-review', 'Story review', `${data.stories.length} reviewed drafts`, 'Strengthen every STAR answer',
      el('p', { class: 'section-intro' }, 'Complete speaking scripts come first. The optional coaching fold holds the deeper review, so you can start practising immediately.'), filters, list);
  }

  window.Prep.pages.review = async ({ main }) => {
    const data = await load('review');
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      ui.section('overview', 'Overview', `Reviewed ${data.reviewed_on}`, data.title,
        el('p', { class: 'section-intro' }, data.summary),
        el('div', { class: 'card stack' }, el('h3', { class: 'h3' }, data.role_context.role), el('p', { class: 'muted' }, data.role_context.source), ui.list(data.role_context.responsibilities), el('p', {}, data.role_context.success)),
        el('a', { class: 'btn', href: 'RESUME-STAR-REVIEW.md', download: 'RESUME-STAR-REVIEW.md' }, 'Download the complete resume and STAR review'),
        el('details', { class: 'fold' }, el('summary', {}, 'Sources and preparation notes'), el('div', { class: 'fold-body' },
          el('p', {}, data.resume_source), el('p', {}, data.evidence_policy), el('p', {}, data.guidance), el('p', { class: 'muted' }, data.privacy)))),
      storySection(data),
      el('details', { class: 'fold' }, el('summary', {}, 'Optional: add more examples and review earlier inconsistencies'), el('div', { class: 'fold-body' },
      ui.section('discrepancies', 'Resume discrepancies', 'Reference only', 'Resume consistency notes',
        el('div', { class: 'comp-grid' }, data.discrepancies.map(item => el('div', { class: 'card stack' }, el('h3', { class: 'h3' }, item.resume), el('p', {}, item.action))))),
      ui.section('gaps', 'Missing episodes', 'Real experiences only', 'Fill the three genuine gaps',
        el('div', { class: 'comp-grid' }, data.gaps.map(gap => el('div', { class: 'comp is-gap stack' }, el('h3', { class: 'h3' }, gap.title), el('p', {}, gap.why), ui.list(gap.prompts), el('a', { href: 'behavioral.html#gaps' }, 'Open STAR gap templates'), ui.notesBox(`review-gap-${gap.id}`, `Real ${gap.id} episode; do not invent details`))))))),
      ui.section('delivery', 'Delivery drills', 'Practise aloud', 'Make the decision easy to picture',
        el('div', { class: 'comp-grid' }, data.delivery_drills.map(drill => el('div', { class: 'card stack' }, el('h3', { class: 'h3' }, drill.title), ui.list(drill.steps))))),
      ui.section('sources', 'Sources', 'Official Amazon guidance', 'Check the source guidance',
        el('ul', { class: 'list' }, data.sources.map(source => el('li', {}, el('a', { href: source.url, target: '_blank', rel: 'noopener noreferrer' }, source.title)))))));
    setReadout('Stories reviewed', data.stories.length, data.stories.length);
  };
})();
