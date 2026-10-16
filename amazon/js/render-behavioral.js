// Leadership Principles page: rules, 60-second pitch, numbers quiz, LP map, STAR bank with LP chips, gap stories.
(function () {
  const { el, load, ui, store, setReadout } = { ...window.Prep, store: window.Prep.store };
  const confirmed = text => ui.fill(String(text).replace(/\[confirm:/g, '[fill: confirm:'));
  const STAR = [['s', 'S'], ['t', 'T'], ['a', 'A'], ['r', 'R']];
  const STORY_SECONDS = 90;
  let showStory = () => {};

  function starBlock(story) {
    return el('div', { class: 'star' }, STAR.map(([key, letter]) => el('div', { class: 'star-row' },
      el('span', { class: 'star-key', 'aria-hidden': 'true' }, letter),
      Array.isArray(story[key]) ? el('ul', { class: 'list' }, story[key].map(text => el('li', {}, confirmed(text)))) : el('p', {}, confirmed(story[key])))));
  }

  const storyLink = (story) => el('a', { href: `#story-${story.id}`, onclick: (e) => { e.preventDefault(); showStory(story.id); } }, `${story.code} ${story.title}`);

  // Collapsed by default: open only after you have said the story once.
  const fold = (title, ...body) => el('details', { class: 'fold' }, el('summary', {}, title), el('div', { class: 'fold-body' }, ...body));

  function rulesSection(data) {
    return ui.section('rules', 'Delivery rules', 'Every answer', el('span', {}, 'How to ', el('em', {}, 'answer')),
      el('div', { class: 'card card-navy stack' }, ui.list(data.rules)));
  }

  function pitchSection(pitch) {
    const t = ui.timer(pitch.target_sec / 60);
    const words = [...pitch.beats.map((b) => b.text), pitch.closing_line].join(' ').split(/\s+/).filter(Boolean).length;
    return ui.section('pitch', 'Pitch', `${pitch.target_sec}-second pitch`, el('span', {}, 'Tell me about ', el('em', {}, 'yourself')),
      el('p', { class: 'section-intro' }, `${words} words: about ${Math.round(words / 2.5)} seconds at a calm 150 words a minute. Say it with the timer. The answer is ready to rehearse; the notes field is optional.`),
      el('div', { class: 'card pitch' },
        el('div', { class: 'row' }, t.node),
        el('div', {}, pitch.beats.map((b) => el('div', { class: 'pitch-beat' }, el('span', { class: 'label' }, b.label), el('p', {}, confirmed(b.text))))),
        el('p', { class: 'pitch-close' }, confirmed(pitch.closing_line)),
        ui.notesBox('pitch', 'Your pitch, in your own words')));
  }

  function lpMapSection(data) {
    const byId = (id) => data.stories.find((s) => s.id === id);
    return ui.section('lp-map', 'LP map', '16 principles', el('span', {}, 'Leadership Principle ', el('em', {}, 'map')),
      el('p', { class: 'section-intro' }, 'Two stories per principle. Red means a story is still missing: write it from a real event in the gap section below.'),
      el('div', { class: 'comp-grid' }, data.lps.map((lp) => {
        const missing = !lp.primary || !lp.backup;
        return el('div', { class: `comp${missing ? ' is-gap' : ''}` },
          el('div', { class: 'row' }, el('p', { class: 'h3' }, lp.name), missing ? el('span', { class: 'chip chip-red' }, 'Gap') : null),
          el('p', { class: 'muted' }, lp.meaning),
          el('ul', { class: 'list' },
            lp.primary ? el('li', {}, 'Primary: ', storyLink(byId(lp.primary))) : el('li', { class: 'gap-text' }, 'Primary: missing'),
            lp.backup ? el('li', {}, 'Backup: ', storyLink(byId(lp.backup))) : el('li', { class: 'gap-text' }, `Backup: write the ${lp.gap} story`)));
      })));
  }

  function storyItem(story, data, profile, onStatus) {
    const exp = profile.experience.find((e) => e.id === story.experience_id) || profile.projects.find((p) => p.id === story.experience_id);
    const facts = [...new Set(story.number_ids.map((id) => profile.numbers.find((n) => n.id === id)?.fact).filter(Boolean))];
    const lpName = (id) => data.lps.find((lp) => lp.id === id).name;
    const timer = ui.timer(STORY_SECONDS / 60);
    return el('details', { class: 'item', id: `story-${story.id}` },
      el('summary', {},
        el('span', { class: 'item-title' }, `${story.code}. ${story.title}`),
        el('span', { class: 'item-meta', onclick: (e) => e.stopPropagation() },
          story.lead ? el('span', { class: 'chip chip-gold' }, 'Lead') : null,
          story.ongoing ? el('span', { class: 'chip' }, 'In progress') : null,
          el('span', { class: 'chip' }, exp.org || exp.name),
          ui.statusSelect(`story-${story.id}`, data.status_options, onStatus))),
      el('div', { class: 'item-body' },
        el('div', { class: 'row' }, story.lps.map((id) => el('span', { class: 'chip chip-gold' }, lpName(id)))),
        el('div', { class: 'row' }, el('span', { class: 'label' }, `${STORY_SECONDS}-second rehearsal`), timer.node),
        el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Open with'), el('p', { class: 'answer-short' }, story.headline)),
        starBlock(story),
        el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Close with'), el('p', { class: 'resume-line' }, confirmed(story.lesson))),
        facts.length ? el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Numbers to say'), el('div', { class: 'row' }, facts.map((f) => el('span', { class: 'chip chip-gold' }, f)))) : null,
        fold('Optional preparation notes',
          story.note ? el('p', {}, story.note) : null,
          el('p', {}, story.evidence_note),
          el('a', { href: `review.html#review-${story.id}` }, 'Open coaching and follow-up preparation')),
        fold('SA framing and a proposed AWS design',
          el('div', { class: 'probe' }, el('p', { class: 'probe-q' }, 'SA twist'), el('p', {}, story.twist)),
          el('div', { class: 'probe' }, el('p', { class: 'probe-q' }, 'If they ask how you would build it on AWS'), el('p', {}, story.aws))),
        fold(`Probes to rehearse (${story.probes.length})`,
          el('div', { class: 'item-list' }, story.probes.map((p) => el('div', { class: 'probe' }, el('p', { class: 'probe-q' }, p.q), el('p', {}, confirmed(p.a)))))),
        el('div', { class: 'row' }, ui.confidence(`story-${story.id}`)),
        ui.notesBox(`story-${story.id}`, 'Your version, in your words')));
  }

  function storiesSection(data, profile, onStatus) {
    const lpName = (id) => data.lps.find((lp) => lp.id === id).name;
    const listBox = el('div', { class: 'item-list' });
    let filters = { q: '', status: '' };
    let lpFilter = '';
    let shown = data.stories;
    const items = new Map(data.stories.map((s) => [s.id, storyItem(s, data, profile, () => { apply(); onStatus(); })]));
    const statusOf = (s) => store.get('status', `story-${s.id}`, data.status_options[0].id);
    function apply() {
      shown = data.stories.filter((s) => (!filters.q || `${s.title} ${s.s} ${s.r}`.toLowerCase().includes(filters.q))
        && (!filters.status || statusOf(s) === filters.status)
        && (!lpFilter || s.lps.includes(lpFilter)));
      listBox.replaceChildren(...(shown.length ? shown.map((s) => items.get(s.id))
        : [el('p', { class: 'notice is-error' }, lpFilter ? 'No story yet for this principle. It is a gap: write it in the gap section below.' : 'No stories match these filters.')]));
    }
    const chips = data.lps.map((lp) => {
      const count = data.stories.filter((s) => s.lps.includes(lp.id)).length;
      const chip = el('button', { class: `chip chip-btn${count ? '' : ' chip-red'}`, type: 'button', 'aria-pressed': 'false' }, `${lp.name} (${count})`);
      chip.addEventListener('click', () => {
        lpFilter = lpFilter === lp.id ? '' : lp.id;
        chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
        if (lpFilter) chip.setAttribute('aria-pressed', 'true');
        apply();
      });
      return chip;
    });
    const bar = ui.filterBar({ placeholder: 'Search stories', selects: [{ key: 'status', label: 'Any status', options: data.status_options }], onChange: (f) => { filters = f; apply(); } });
    showStory = (id) => {
      lpFilter = '';
      chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
      bar.resetFilters();
      const node = items.get(id);
      if (!node) return;
      node.open = true;
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    apply();
    // Front names the story and its principles; say it in 90 seconds, then check against the STAR.
    const rehearse = () => ui.rehearse(ui.shuffle(shown).map((s) => ({
      kicker: s.lps.map(lpName).join(' · '),
      front: () => el('span', {}, `${s.code}. ${s.title}`),
      back: () => el('div', { class: 'stack' }, el('p', { class: 'answer-short' }, s.headline), starBlock(s), el('p', { class: 'muted' }, confirmed(s.lesson))),
    })), 'Rehearse stories');
    return ui.section('stories', 'STAR bank', `${data.stories.length} stories`, el('span', {}, 'The ', el('em', {}, 'STAR'), ' bank'),
      el('p', { class: 'section-intro' }, 'Filter by principle, open a story, start the timer, and say it before you read it. These complete answers use your resume numbers. Start with S1, S2, S4, and S5; rehearse aloud, then open the follow-ups only when you need more depth.'),
      el('div', { class: 'row lp-chips', role: 'group', 'aria-label': 'Filter by Leadership Principle' }, chips),
      bar,
      el('div', { class: 'row', style: { marginBottom: '1rem' } }, el('button', { class: 'btn btn-gold', type: 'button', onclick: rehearse }, 'Rehearse shown stories')),
      listBox);
  }

  function gapsSection(data) {
    const lpName = (id) => data.lps.find((lp) => lp.id === id).name;
    return ui.section('gaps', 'Gap stories', 'Before your interview', el('span', {}, 'Close the ', el('em', {}, 'gaps')),
      el('p', { class: 'section-intro' }, 'Prepare these from real events; the supplied material does not establish them yet. Drafts save in this browser.'),
      el('div', { class: 'comp-grid' }, data.gaps.map((g) => el('div', { class: 'comp is-gap' },
        el('div', { class: 'row' }, el('p', { class: 'h3' }, g.name), el('span', { class: 'chip chip-red' }, 'Gap')),
        el('div', { class: 'row' }, g.lps.map((id) => el('span', { class: 'chip' }, lpName(id)))),
        el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Asked as'), ui.list(g.asked_as)),
        el('p', { class: 'muted' }, g.seeds),
        STAR.map(([key, letter]) => el('div', { class: 'kv' },
          el('p', { class: 'gap-prompt' }, el('b', {}, letter), g.template[key]),
          ui.notesBox(`gap-${g.id}-${key}`, `${letter} draft`)))))));
  }

  window.Prep.pages.behavioral = async ({ main, profile }) => {
    const data = await load('behavioral');
    const readyId = data.status_options.at(-1).id;
    const updateReadout = () => setReadout('Stories ready', data.stories.filter((s) => store.get('status', `story-${s.id}`) === readyId).length, data.stories.length);
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      pitchSection(data.pitch),
      storiesSection(data, profile, updateReadout),
      ui.section('numbers', 'Numbers quiz', 'Rapid fire', el('span', {}, 'Know your ', el('em', {}, 'numbers')), window.Prep.quiz.mount(profile)),
      lpMapSection(data),
      rulesSection(data),
      fold('Optional: build additional failure, disagreement, and mentoring examples', gapsSection(data))));
    updateReadout();
    if (location.hash.startsWith('#story-')) showStory(location.hash.slice(7));
  };
})();
