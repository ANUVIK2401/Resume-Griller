// Behavioral page: pitch, numbers quiz, STAR bank, competency map, values, V2MOM, questions.
(function () {
  const { el, load, ui, store, setReadout } = { ...window.Prep, store: window.Prep.store };

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
    const node = document.getElementById(`story-${id}`);
    if (!node) return;
    node.open = true;
    node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  const storyLink = (story) => el('a', { href: `#story-${story.id}`, onclick: (e) => { e.preventDefault(); openStory(story.id); } }, story.title);

  function pitchSection(pitch) {
    const t = ui.timer(pitch.target_sec / 60);
    return ui.section('pitch', 'Pitch', `${pitch.target_sec}-second pitch`, el('span', {}, 'Tell me about ', el('em', {}, 'yourself')),
      el('p', { class: 'section-intro' }, 'Say it out loud with the timer. Land the last line word for word.'),
      el('div', { class: 'card pitch' },
        el('div', { class: 'row' }, t.node),
        el('div', {}, pitch.beats.map((b) => el('div', { class: 'pitch-beat' }, el('span', { class: 'label' }, b.label), el('p', {}, ui.fill(b.text))))),
        el('p', { class: 'pitch-close' }, pitch.closing_line)));
  }

  function storyItem(story, data, profile, onStatus) {
    const exp = sourceOf(profile, story);
    const facts = (story.number_ids || []).map((id) => profile.numbers.find((n) => n.id === id)?.fact);
    const comps = story.competencies.map((id) => data.competencies.find((c) => c.id === id)?.name);
    const stop = (e) => e.stopPropagation();
    return el('details', { class: 'item', id: `story-${story.id}` },
      el('summary', {},
        el('span', { class: 'item-title' }, story.title),
        el('span', { class: 'item-meta', onclick: stop },
          story.lead ? el('span', { class: 'chip chip-gold' }, 'Lead') : null,
          el('span', { class: 'chip' }, exp.org || exp.name),
          ui.statusSelect(`story-${story.id}`, data.status_options, onStatus))),
      el('div', { class: 'item-body' },
        el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Resume line'),
          story.resume_lines.map((line) => el('blockquote', { class: 'resume-line' }, line))),
        el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Salesforce values'),
          el('div', { class: 'row' }, story.values.map((id) => el('span', { class: 'chip chip-gold' }, data.values.find((v) => v.id === id).name)))),
        el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Questions this answers'), ui.list(story.prompts)),
        explainBlock(story),
        el('p', { class: 'label' }, 'STAR answer'),
        starBlock(story),
        el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Numbers to say'), el('div', { class: 'row' }, [...new Set(facts)].map((f) => el('span', { class: 'chip chip-gold' }, f)))),
        el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Shows'), el('div', { class: 'row' }, comps.map((c) => el('span', { class: 'chip' }, c)))),
        el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Expected probes'),
          el('div', { class: 'item-list' }, story.probes.map((p) => el('div', { class: 'probe' }, el('p', { class: 'probe-q' }, p.q), el('p', {}, ui.fill(p.a)))))),
        el('div', { class: 'row' }, ui.confidence(`story-${story.id}`)),
        ui.notesBox(`story-${story.id}`, 'Your version, in your words')));
  }

  function storiesSection(data, profile, onStatus) {
    const listBox = el('div', { class: 'item-list' });
    const items = data.stories.map((s) => ({ story: s, node: storyItem(s, data, profile, onStatus) }));
    const apply = (f) => {
      listBox.replaceChildren(...items.filter(({ story }) => {
        const text = `${story.title} ${story.s} ${story.prompts.join(' ')}`.toLowerCase();
        return (!f.q || text.includes(f.q))
          && (!f.comp || story.competencies.includes(f.comp))
          && (!f.role || story.experience_id === f.role)
          && (!f.value || story.values.includes(f.value))
          && (!f.status || store.get('status', `story-${story.id}`, data.status_options[0].id) === f.status);
      }).map((x) => x.node));
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
    apply({ q: '' });
    const rehearse = () => ui.rehearse(ui.shuffle(data.stories).map((s) => ({
      kicker: ui.shuffle(s.prompts)[0],
      front: () => el('span', {}, s.title),
      back: () => starBlock(s),
    })), 'Rehearse stories');
    return ui.section('stories', 'STAR bank', `${data.stories.length} stories`, el('span', {}, 'The ', el('em', {}, 'STAR'), ' bank'),
      el('p', { class: 'section-intro' }, `${data.intro} Gold "fill" marks are specifics only you know; replace them in your notes before the interview.`),
      el('div', { class: 'row', style: { marginBottom: '1rem' } }, el('button', { class: 'btn btn-gold', type: 'button', onclick: rehearse }, 'Rehearse stories')),
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
