// Leadership Principles: answer rubric, pitch, the 8 named LPs with two stories each, recruiter sample
// questions, the story bank with 2 to 4 minute versions and a self-assessment, the failure worksheet,
// a 40-question LP bank, the numbers quiz, and the other 8 LPs.
(function () {
  const { el, load, ui, store, setReadout } = { ...window.Prep, store: window.Prep.store };
  const confirmed = (text) => ui.fill(String(text).replace(/\[confirm:/g, '[fill: confirm:'));
  let showStory = () => {};

  const fold = (title, ...body) => el('details', { class: 'fold' }, el('summary', {}, title), el('div', { class: 'fold-body' }, ...body));
  const storyLink = (story) => el('a', { href: `#story-${story.id}`, onclick: (e) => { e.preventDefault(); showStory(story.id); } }, `${story.code} ${story.title}`);

  // The full spoken answer: core STAR plus the beats that make it 2 to 4 minutes.
  function fullAnswer(story) {
    const L = story.long;
    const beat = (key, title, ...parts) => el('div', { class: 'star-row' }, el('span', { class: 'star-key', 'aria-hidden': 'true' }, key),
      el('div', { class: 'stack', style: { gap: '0.4rem' } }, el('p', { class: 'label' }, title), ...parts));
    return el('div', { class: 'star' },
      beat('S', 'Situation and stakes', el('p', {}, confirmed(story.s)), el('p', {}, confirmed(L.stakes))),
      beat('T', 'Task', el('p', {}, confirmed(story.t))),
      beat('A', 'Action, obstacle, tradeoff, buy-in',
        el('ul', { class: 'list' }, story.a.map((t) => el('li', {}, confirmed(t)))),
        el('p', {}, el('b', {}, 'Obstacle: '), confirmed(L.obstacle)),
        el('p', {}, el('b', {}, 'Tradeoff: '), confirmed(L.tradeoff)),
        el('p', {}, el('b', {}, 'Buy-in: '), confirmed(L.buy_in))),
      beat('R', 'Result, with the metric', el('p', {}, confirmed(L.result))));
  }

  function selfCheck(story, data) {
    const lpName = (id) => data.lps.find((lp) => lp.id === id).name;
    return el('fieldset', { class: 'rubric self-check', id: `check-${story.id}` },
      el('legend', { class: 'label' }, 'Self-assessment after you say it (saves in this browser)'),
      data.self_rubric.map((r) => ui.checkbox(`sa-${story.id}-${r.id}`, r.label)),
      el('p', { class: 'label' }, 'Which LPs did it show? Aim for 4 to 6.'),
      el('div', { class: 'row' }, story.lps.map((id) => el('span', { class: 'check-pill' }, ui.checkbox(`sa-${story.id}-lp-${id}`, lpName(id))))));
  }

  function storyItem(story, data, profile, onStatus) {
    const exp = profile.experience.find((e) => e.id === story.experience_id) || profile.projects.find((p) => p.id === story.experience_id);
    const facts = [...new Set(story.number_ids.map((id) => profile.numbers.find((n) => n.id === id)?.fact).filter(Boolean))];
    const lp = (id) => data.lps.find((x) => x.id === id);
    return el('details', { class: 'item', id: `story-${story.id}` },
      el('summary', {},
        el('span', { class: 'item-title' }, `${story.code}. ${story.title}`),
        el('span', { class: 'item-meta', onclick: (e) => e.stopPropagation() },
          story.lead ? el('span', { class: 'chip chip-gold' }, 'Lead') : null,
          story.ongoing ? el('span', { class: 'chip' }, 'In progress: say building') : null,
          el('span', { class: 'chip' }, exp.org || exp.name),
          ui.statusSelect(`story-${story.id}`, data.status_options, onStatus))),
      el('div', { class: 'item-body' },
        el('div', { class: 'row' }, story.lps.map((id) => el('span', { class: `chip ${lp(id).named ? 'chip-gold' : ''}` }, lp(id).name))),
        el('div', { class: 'row' }, el('span', { class: 'label' }, '2 to 4 minute rehearsal'), ui.storyTimer().node),
        el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Open with'), el('p', { class: 'answer-short' }, story.headline)),
        fullAnswer(story),
        el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Close with the lesson'), el('p', { class: 'resume-line' }, confirmed(story.lesson))),
        facts.length ? el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Numbers to say'), el('div', { class: 'row' }, facts.map((f) => el('span', { class: 'chip chip-gold' }, f)))) : null,
        el('div', { class: 'grid-2' },
          el('div', { class: 'probe' }, el('p', { class: 'probe-q' }, 'What would you do differently?'), el('p', {}, confirmed(story.long.different))),
          el('div', { class: 'probe' }, el('p', { class: 'probe-q' }, 'How would you implement this at AWS?'), el('p', {}, confirmed(story.long.at_aws)))),
        selfCheck(story, data),
        fold(`Follow-up probes (${story.probes.length})`,
          el('div', { class: 'item-list' }, story.probes.map((p) => el('div', { class: 'probe' }, el('p', { class: 'probe-q' }, p.q), el('p', {}, confirmed(p.a)))))),
        fold('Audience framing and notes',
          el('p', {}, story.twist), story.note ? el('p', {}, story.note) : null, el('p', { class: 'muted' }, story.evidence_note),
          el('a', { href: `review.html#review-${story.id}` }, 'Open coaching for this story')),
        el('div', { class: 'row' }, ui.confidence(`story-${story.id}`)),
        ui.notesBox(`story-${story.id}`, 'Your version, in your words')));
  }

  function storiesSection(data, profile, onStatus) {
    const ordered = [...data.stories].sort((a, b) => Number(b.lead) - Number(a.lead));
    const items = new Map(ordered.map((s) => [s.id, storyItem(s, data, profile, onStatus)]));
    const listBox = el('div', { class: 'item-list' }, [...items.values()]);
    let lpFilter = '';
    const chips = data.lps.filter((lp) => lp.named).map((lp) => {
      const chip = el('button', { class: 'chip chip-btn', type: 'button', 'aria-pressed': 'false' }, lp.name);
      chip.addEventListener('click', () => {
        lpFilter = lpFilter === lp.id ? '' : lp.id;
        chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip && !!lpFilter)));
        ordered.forEach((s) => { items.get(s.id).hidden = !!lpFilter && !s.lps.includes(lpFilter); });
      });
      return chip;
    });
    showStory = (id) => {
      lpFilter = '';
      chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
      items.forEach((n) => { n.hidden = false; });
      const node = items.get(id);
      if (!node) return;
      node.open = true;
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const rehearse = () => ui.rehearse(ui.shuffle(ordered.filter((s) => !items.get(s.id).hidden)).map((s) => ({
      kicker: s.lps.map((id) => data.lps.find((lp) => lp.id === id).name).join(' · '),
      front: () => el('span', {}, `${s.code}. ${s.title}`),
      back: () => el('div', { class: 'stack' }, el('p', { class: 'answer-short' }, s.headline), fullAnswer(s), el('p', { class: 'muted' }, confirmed(s.lesson))),
    })), 'Rehearse stories');
    return ui.section('stories', 'Story bank', `${data.stories.length} stories, 8 lead`, el('span', {}, 'The ', el('em', {}, 'stories')),
      el('p', { class: 'section-intro' }, 'Lead stories first. Open one, press Start, and say the full answer before reading it. Land between 2:00 and 4:00, then tick the self-assessment. Lines marked in yellow are details only you can fill in from memory.'),
      el('div', { class: 'row lp-chips', role: 'group', 'aria-label': 'Filter by named Leadership Principle' }, chips),
      el('div', { class: 'row', style: { marginBottom: '1rem' } }, el('button', { class: 'btn btn-gold', type: 'button', onclick: rehearse }, 'Rehearse shown stories')),
      listBox);
  }

  function namedSection(data) {
    const byId = (id) => data.stories.find((s) => s.id === id);
    const card = (lp) => el('div', { class: 'comp' },
      el('p', { class: 'h3' }, lp.name), el('p', { class: 'muted' }, lp.meaning),
      el('ul', { class: 'list' }, el('li', {}, 'Primary: ', storyLink(byId(lp.primary))), el('li', {}, 'Backup: ', storyLink(byId(lp.backup)))));
    return ui.section('lp-map', 'The 8 named LPs', 'Named for this role', el('span', {}, 'The eight that ', el('em', {}, 'matter most')),
      el('p', { class: 'section-intro' }, 'The recruiter named these eight as most relevant. Each has a primary and a backup story, so no round hears the same story twice.'),
      el('div', { class: 'comp-grid' }, data.lps.filter((lp) => lp.named).map(card)));
  }

  function samplesSection(data) {
    const byId = (id) => data.stories.find((s) => s.id === id);
    return ui.section('samples', 'Recruiter samples', 'From the study guide', el('span', {}, 'The five ', el('em', {}, 'sample questions')),
      el('div', { class: 'item-list' }, data.samples.map((s) => el('div', { class: `card stack${s.gap ? ' is-gap' : ''}` },
        el('p', { class: 'h3' }, s.q),
        el('p', { class: 'answer-short' }, ui.fill(s.opener)),
        s.story ? el('p', {}, 'Story: ', storyLink(byId(s.story)), s.alt ? el('span', { class: 'muted' }, ' · backup: ', storyLink(byId(s.alt))) : null)
          : el('p', {}, el('a', { href: '#failure' }, 'Write it in the failure worksheet below'))))));
  }

  function failureSection(data) {
    const g = data.gaps.find((x) => x.id === 'failure');
    const lpName = (id) => data.lps.find((lp) => lp.id === id).name;
    return ui.section('failure', 'Failure story', 'Required: asked directly', el('span', {}, 'Your ', el('em', {}, 'failure'), ' story'),
      el('div', { class: 'card is-gap stack' },
        el('p', {}, el('strong', {}, 'This one is required. '), 'The recruiter’s guide asks it directly, and no story in the bank covers it. Use a real event from the last 5 years where you owned part of the cause.'),
        el('div', { class: 'row' }, g.lps.map((id) => el('span', { class: 'chip' }, lpName(id)))),
        el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Asked as'), ui.list(g.asked_as)),
        el('p', { class: 'muted' }, g.seeds),
        g.worksheet.map((w, i) => el('div', { class: 'kv' },
          el('p', { class: 'gap-prompt' }, el('b', {}, `${i + 1}`), w.prompt),
          ui.notesBox(`failure-${w.key}`, w.prompt))),
        el('div', { class: 'row' }, el('span', { class: 'label' }, 'Say it, 2 to 4 minutes'), ui.storyTimer().node)));
  }

  function bankSection(data) {
    const byId = (id) => data.stories.find((s) => s.id === id);
    const lps = data.lps.filter((lp) => lp.named);
    const target = (q) => (q.story ? storyLink(byId(q.story)) : el('a', { href: '#failure', class: 'gap-text' }, 'Failure story: write it first'));
    const pickBox = el('div', { class: 'card stack', hidden: true });
    const pick = () => {
      const q = ui.shuffle(data.question_bank)[0];
      pickBox.hidden = false;
      pickBox.replaceChildren(el('p', { class: 'label' }, lps.find((lp) => lp.id === q.lp).name), el('p', { class: 'quiz-q' }, q.q), ui.storyTimer().node,
        el('details', {}, el('summary', {}, 'Recommended story'), el('p', {}, target(q))));
    };
    return ui.section('bank', 'LP question bank', `${data.question_bank.length} questions, 5 per named LP`, el('span', {}, 'Question ', el('em', {}, 'bank')),
      el('div', { class: 'row' }, el('button', { class: 'btn btn-gold', type: 'button', onclick: pick }, 'Give me a random question')), pickBox,
      el('div', { class: 'grid-2' }, lps.map((lp) => el('div', { class: 'card stack' }, el('p', { class: 'h3' }, lp.name),
        el('ol', { class: 'list' }, data.question_bank.filter((q) => q.lp === lp.id).map((q) => el('li', { id: q.id }, q.q, el('br'), el('span', { class: 'muted' }, 'Use: '), target(q))))))));
  }

  function pitchSection(pitch) {
    const t = ui.timer(pitch.target_sec / 60);
    return ui.section('pitch', 'Pitch', `${pitch.target_sec}-second pitch`, el('span', {}, 'Tell me about ', el('em', {}, 'yourself')),
      el('div', { class: 'card pitch' },
        el('div', { class: 'row' }, t.node),
        el('div', {}, pitch.beats.map((b) => el('div', { class: 'pitch-beat' }, el('span', { class: 'label' }, b.label), el('p', {}, confirmed(b.text))))),
        el('p', { class: 'pitch-close' }, confirmed(pitch.closing_line)),
        ui.notesBox('pitch', 'Your pitch, in your own words')));
  }

  function otherSection(data) {
    const byId = (id) => data.stories.find((s) => s.id === id);
    return fold('The other 8 Leadership Principles (secondary for this role)',
      el('div', { class: 'comp-grid' }, data.lps.filter((lp) => !lp.named).map((lp) => el('div', { class: `comp${lp.primary ? '' : ' is-gap'}` },
        el('p', { class: 'h3' }, lp.name), el('p', { class: 'muted' }, lp.meaning),
        lp.primary ? el('ul', { class: 'list' }, el('li', {}, 'Primary: ', storyLink(byId(lp.primary))), el('li', {}, 'Backup: ', storyLink(byId(lp.backup))))
          : el('p', { class: 'gap-text' }, `No story yet. Lower priority: the ${lp.gap} worksheet is below.`)))),
      ...data.gaps.filter((g) => !g.required).map((g) => el('div', { class: 'comp is-gap stack' },
        el('p', { class: 'h3' }, g.name), ui.list(g.asked_as), el('p', { class: 'muted' }, g.seeds),
        ['s', 't', 'a', 'r'].map((k) => el('div', { class: 'kv' }, el('p', { class: 'gap-prompt' }, el('b', {}, k.toUpperCase()), g.template[k]), ui.notesBox(`gap-${g.id}-${k}`, `${k.toUpperCase()} draft`))))));
  }

  window.Prep.pages.behavioral = async ({ main, profile }) => {
    const data = await load('behavioral');
    const readyId = data.status_options.at(-1).id;
    const updateReadout = () => setReadout('Stories ready', data.stories.filter((s) => store.get('status', `story-${s.id}`) === readyId).length, data.stories.length);
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      ui.section('rules', 'Answer rubric', 'How Amazon scores it', el('span', {}, 'How to ', el('em', {}, 'answer')), el('div', { class: 'card card-navy stack' }, ui.list(data.rules))),
      pitchSection(data.pitch),
      namedSection(data),
      samplesSection(data),
      storiesSection(data, profile, updateReadout),
      failureSection(data),
      bankSection(data),
      ui.section('numbers', 'Numbers quiz', 'Rapid fire', el('span', {}, 'Know your ', el('em', {}, 'numbers')), window.Prep.quiz.mount(profile)),
      otherSection(data)));
    updateReadout();
    if (location.hash.startsWith('#story-')) showStory(location.hash.slice(7));
  };
})();
