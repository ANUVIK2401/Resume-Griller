// Behavioral page: pitch, numbers quiz, STAR bank, competency map, values, V2MOM, questions.
(function () {
  const { el, load, ui, store, setReadout } = { ...window.Prep, store: window.Prep.store };

  const delivery = window.Prep.delivery;
  let resetStoryFilters = () => {};

  const STAR = [['s', 'S'], ['t', 'T'], ['a', 'A'], ['r', 'R']];

  function starBlock(story) {
    return el('div', { class: 'star' }, STAR.map(([key, letter]) => el('div', { class: 'star-row' },
      el('span', { class: 'star-key', 'aria-hidden': 'true' }, letter),
      Array.isArray(story[key]) ? ui.list(story[key]) : el('p', {}, ui.fill(story[key])))));
  }

  const sourceOf = (profile, story) => profile.experience.find((e) => e.id === story.experience_id)
    || profile.projects.find((p) => p.id === story.experience_id);

  // Plain-language explainer: key terms, tech stack, and what I did, 3 to 5 bullets each.
  function explainBlock(story) {
    const col = (title, items) => el('div', { class: 'explain-col' }, el('p', { class: 'h3' }, title), ui.list(items));
    return el('div', { class: 'explain' },
      col('Key terms, simply', story.terms),
      col('Tech stack', story.stack),
      col('What I did, simply', story.simple));
  }

  function openStory(id) {
    resetStoryFilters();
    const node = document.getElementById(`story-${id}`);
    if (!node) return;
    node.open = true;
    node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  const storyLink = (story) => el('a', { href: `#story-${story.id}`, onclick: (e) => { e.preventDefault(); openStory(story.id); } }, story.title);

  function pitchSection(pitch) {
    const t = ui.timer(pitch.target_sec / 60);
    const sourceText = [...pitch.beats.map((beat) => beat.text), pitch.closing_line].join(' ');
    const words = delivery.wordCount(sourceText);
    const minWords = Math.round(pitch.target_sec * 120 / 60);
    const maxWords = Math.round(pitch.target_sec * 150 / 60);
    const unfinished = delivery.placeholderCount(pitch);
    return ui.section('pitch', 'Pitch', `${pitch.target_sec}-second pitch`, el('span', {}, 'Tell me about ', el('em', {}, 'yourself')),
      el('p', { class: 'section-intro' }, 'Say it out loud with the timer. Lead with your strongest evidence, then connect it to the role.'),
      el('p', { class: 'delivery-estimate notice' }, `${words} spoken words in this pitch, excluding unfinished prompts. At a practice pace of 120 to 150 words/min, that is about ${Math.ceil(words * 60 / 150)} to ${Math.ceil(words * 60 / 120)} seconds. Your ${pitch.target_sec}-second target is roughly ${minWords} to ${maxWords} words; pauses need extra room.`),
      unfinished ? el('p', { class: 'delivery-warning notice is-error' }, `${unfinished} unfinished pitch detail${unfinished === 1 ? '' : 's'}. Verify them before using this script.`) : null,
      el('div', { class: 'card pitch' },
        el('div', { class: 'row' }, t.node),
        el('div', {}, pitch.beats.map((b) => el('div', { class: 'pitch-beat' }, el('span', { class: 'label' }, b.label), el('p', {}, ui.fill(b.text))))),
        el('p', { class: 'pitch-close' }, pitch.closing_line),
        delivery.rubric('delivery-pitch', ['I named my strongest evidence early.', 'I connected my experience to this role without assuming team details.', 'I met the time target and left room for a follow-up.']),
        ui.notesBox('delivery-pitch', 'Your shorter pitch, in your own words')));
  }

  function storyItem(story, data, profile, onStatus) {
    const exp = sourceOf(profile, story);
    const unfinished = delivery.placeholderCount(story);
    const facts = (story.number_ids || []).map((id) => profile.numbers.find((n) => n.id === id)?.fact);
    const comps = story.competencies.map((id) => data.competencies.find((c) => c.id === id)?.name);
    const stop = (e) => e.stopPropagation();
    return el('details', { class: 'item', id: `story-${story.id}` },
      el('summary', {},
        el('span', { class: 'item-title' }, story.title),
        el('span', { class: 'item-meta', onclick: stop },
          story.lead ? el('span', { class: 'chip chip-gold' }, 'Lead') : null,
          unfinished ? el('span', { class: 'chip chip-red' }, `${unfinished} unfinished`) : null,
          el('span', { class: 'chip' }, exp.org || exp.name),
          ui.statusSelect(`story-${story.id}`, data.status_options, onStatus))),
      el('div', { class: 'item-body' },
        // Spoken material first: the question, the answer, the numbers, the plain version, the follow-ups.
        el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Questions this answers'), ui.list(story.prompts)),
        unfinished ? el('p', { class: 'delivery-warning notice is-error' }, `${unfinished} unfinished detail${unfinished === 1 ? '' : 's'} in this story. Fill them in your personal notes with facts you can verify; keep an ongoing result clearly labeled.`) : null,
        delivery.outline(story),
        delivery.storyPractice(story),
        el('p', { class: 'label' }, 'Full STAR reference'),
        starBlock(story),
        facts.length ? el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Numbers to say'), el('div', { class: 'row' }, [...new Set(facts)].map((f) => el('span', { class: 'chip chip-gold' }, f)))) : null,
        explainBlock(story),
        el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Expected follow-ups'),
          el('div', { class: 'item-list' }, story.probes.map((p) => el('div', { class: 'probe' }, el('p', { class: 'probe-q' }, p.q), el('p', {}, ui.fill(p.a)))))),
        // Reference: where it came from and what it shows.
        el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Resume line'),
          story.resume_lines.map((line) => el('blockquote', { class: 'resume-line' }, line))),
        el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Salesforce values and competencies'),
          el('div', { class: 'row' },
            story.values.map((id) => el('span', { class: 'chip chip-gold' }, data.values.find((v) => v.id === id).name)),
            comps.map((c) => el('span', { class: 'chip' }, c)))),
        el('div', { class: 'row' }, ui.confidence(`story-${story.id}`)),
        ui.notesBox(`story-${story.id}`, 'Your version, in your words')));
  }

  function storiesSection(data, profile, onStatus) {
    const listBox = el('div', { class: 'item-list' });
    let active = { q: '' };
    let shown = [...data.stories];
    const statusChanged = () => { apply(active); onStatus(); };
    const ordered = [...data.stories].sort((a, b) => Number(Boolean(b.lead)) - Number(Boolean(a.lead)));
    const items = ordered.map((s) => ({ story: s, node: storyItem(s, data, profile, statusChanged) }));
    const apply = (f) => {
      active = { ...f };
      const filtered = items.filter(({ story }) => {
        const text = `${story.title} ${story.s} ${story.prompts.join(' ')}`.toLowerCase();
        return (!f.q || text.includes(f.q))
          && (!f.comp || story.competencies.includes(f.comp))
          && (!f.role || story.experience_id === f.role)
          && (!f.value || story.values.includes(f.value))
          && (!f.status || store.get('status', `story-${story.id}`, data.status_options[0].id) === f.status);
      });
      shown = filtered.map(({ story }) => story);
      listBox.replaceChildren(...(filtered.length ? filtered.map((item) => item.node) : [el('p', { class: 'notice' }, 'No stories match these filters. Clear a filter to see more stories.')]));
    };
    const bar = ui.filterBar({
      placeholder: 'Search stories',
      selects: [
        { key: 'role', label: 'Any role or project', options: [...new Set(data.stories.map((s) => s.experience_id))].map((id) => ({ id, label: sourceOf(profile, { experience_id: id }).org || sourceOf(profile, { experience_id: id }).name })) },
        { key: 'value', label: 'Any Salesforce value', options: data.values.map((v) => ({ id: v.id, label: v.name })) },
        { key: 'comp', label: 'Any competency', options: data.competencies.filter((c) => !c.gap).map((c) => ({ id: c.id, label: c.name })) },
        { key: 'status', label: 'Any status', options: data.status_options },
      ],
      onChange: apply,
    });
    resetStoryFilters = () => bar.resetFilters ? bar.resetFilters() : apply({ q: '' });
    apply({ q: '' });
    // Front is what the interviewer asks; recall the story, say it, then check.
    const rehearse = () => ui.rehearse(ui.shuffle(shown).map((s) => ({
      kicker: 'Interviewer asks',
      front: () => el('span', {}, ui.shuffle(s.prompts)[0]),
      back: () => el('div', { class: 'stack' }, el('p', { class: 'h3' }, `Story: ${s.title}`), starBlock(s)),
    })), 'Rehearse stories');
    return ui.section('stories', 'STAR bank', `${data.stories.length} stories`, el('span', {}, 'The ', el('em', {}, 'STAR'), ' bank'),
      el('p', { class: 'section-intro' }, `${data.intro} Gold "fill" marks are specifics only you know; replace them in your notes before the interview.`),
      el('div', { class: 'row', style: { marginBottom: '1rem' } }, el('button', { class: 'btn btn-gold', type: 'button', onclick: rehearse }, 'Rehearse filtered stories'),
        el('button', { class: 'btn', type: 'button', onclick: () => resetStoryFilters() }, 'Clear filters')),
      bar, listBox);
  }

  function competencySection(data) {
    return ui.section('competencies', 'Competency map', 'Coverage', el('span', {}, 'Competency ', el('em', {}, 'map')),
      el('p', { class: 'section-intro' }, 'Red cards have no story yet. Draft one in the template before the HM round; these come up in almost every behavioral loop.'),
      el('div', { class: 'comp-grid' }, data.competencies.map((c) => {
        const stories = data.stories.filter((s) => s.competencies.includes(c.id));
        if (!c.gap) {
          return el('div', { class: 'comp' }, el('p', { class: 'h3' }, c.name),
            el('ul', { class: 'list' }, stories.map((s) => el('li', {}, storyLink(s)))));
        }
        return el('div', { class: 'comp is-gap' },
          el('div', { class: 'row' }, el('p', { class: 'h3' }, c.name), el('span', { class: 'chip chip-red' }, 'Gap')),
          STAR.map(([key, letter]) => el('div', { class: 'kv' },
            el('p', { class: 'gap-prompt' }, el('b', {}, letter), c.template[key]),
            ui.notesBox(`gap-${c.id}-${key}`, `${letter} draft`))));
      })));
  }

  function valuesSection(data) {
    return ui.section('values', 'Salesforce values', 'Values', el('span', {}, 'Salesforce ', el('em', {}, 'values')),
      el('div', { class: 'grid-3' }, data.values.map((v) => el('div', { class: 'card value-card stack' },
        el('p', { class: 'h3' }, v.name),
        el('p', { class: 'muted' }, v.angle),
        el('ul', { class: 'list' }, data.stories.filter((s) => s.values.includes(v.id)).map((s) => el('li', {}, storyLink(s))))))));
  }

  function v2momSection(v) {
    const rows = [['Vision', [v.vision]], ['Values', v.values], ['Methods', v.methods], ['Obstacles', v.obstacles], ['Measures', v.measures]];
    return ui.section('v2mom', 'V2MOM', v.project, el('span', {}, el('em', {}, 'V2MOM'), ' for the ERP project'),
      el('p', { class: 'section-intro' }, 'Salesforce plans with V2MOM. Using its shape for your own project shows you know how they work.'),
      el('div', { class: 'card v2mom' }, rows.map(([k, items]) => el('div', { class: 'v2mom-row' },
        el('p', { class: 'v2mom-key' }, k), items.length === 1 ? el('p', {}, items[0]) : ui.list(items)))));
  }

  function questionsSection(qs) {
    return ui.section('questions', 'Questions for the HM', 'Your turn', el('span', {}, 'Questions for ', el('em', {}, 'the HM')),
      el('div', { class: 'item-list' }, qs.map((q) => el('div', { class: `card stack${q.primary ? ' card-navy' : ''}` },
        el('div', { class: 'row' }, q.primary ? el('span', { class: 'chip chip-gold' }, 'Ask first') : null),
        el('p', { class: 'h3' }, q.q),
        el('p', { class: 'muted' }, q.why)))));
  }

  window.Prep.pages.behavioral = async ({ main, profile }) => {
    const data = await load('behavioral');
    const readyId = data.status_options.at(-1).id;
    const updateReadout = () => setReadout('Stories ready', data.stories.filter((s) => store.get('status', `story-${s.id}`) === readyId).length, data.stories.length);
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      pitchSection(data.pitch),
      ui.section('numbers', 'Numbers quiz', 'Rapid fire', el('span', {}, 'Know your ', el('em', {}, 'numbers')), window.Prep.quiz.mount(profile)),
      storiesSection(data, profile, updateReadout),
      competencySection(data),
      valuesSection(data),
      v2momSection(data.v2mom),
      questionsSection(data.questions_for_hm)));
    updateReadout();
  };
})();
