// Mock day: four 60-minute rounds like the real loop. Each round has two LP questions, one breadth,
// one AI/ML depth, one explain-it-simply question, and your own questions; one round adds the
// presentation. Self-score per round, a day summary, and saved history. The day in progress
// survives a reload (browser storage, this device only).
(function () {
  const { el, load, ui, store, setReadout, practice } = { ...window.Prep, store: window.Prep.store };
  const DAY_KEY = 'awsprep:mockday';
  const MINUTES = { breadth: 6, depth: 8, explain: 2, talk: 15, ask: 5 };
  const KIND_LABEL = { lp: 'Leadership Principle', breadth: 'Technical breadth', depth: 'AI/ML depth', explain: 'Explain it simply', talk: 'Presentation and Q&A', ask: 'Your questions' };

  const readDay = () => { try { return JSON.parse(localStorage.getItem(DAY_KEY)); } catch { return null; } };
  const writeDay = (day) => { try { if (day) localStorage.setItem(DAY_KEY, JSON.stringify(day)); else localStorage.removeItem(DAY_KEY); } catch { /* day stays in memory */ } };

  window.Prep.pages.mock = async ({ main, loop }) => {
    const [behavioral, domains, presentation, questions] = await Promise.all([load('behavioral'), load('domains'), load('presentation'), load('questions')]);
    const domainQ = new Map(domains.domains.flatMap((d) => d.questions.map((q) => [q.id, { ...q, domainName: d.name }])));
    const bankQ = new Map(behavioral.question_bank.map((q) => [q.id, q]));
    const storyOf = (id) => behavioral.stories.find((s) => s.id === id);
    const lpName = (id) => behavioral.lps.find((lp) => lp.id === id)?.name;
    const rubricOf = (item) => (item.kind === 'talk' ? presentation.rubric : practice.rubricFor(item.kind));
    const allRubrics = [...practice.RUBRIC, ...practice.rubricFor('tech'), ...practice.rubricFor('explain'), ...practice.rubricFor('ask'), ...presentation.rubric];

    const stage = el('div', { class: 'card stack mock' });
    const history = el('div');
    let day = readDay();

    function describe(item) {
      if (item.kind === 'lp') {
        const q = bankQ.get(item.id);
        const story = q.story && storyOf(q.story);
        return { text: q.q, tag: lpName(q.lp), timer: ui.storyTimer(),
          hint: story ? el('p', {}, 'Recommended: ', el('a', { href: `behavioral.html#story-${story.id}`, target: '_blank' }, `${story.code} ${story.title}`)) : el('p', { class: 'gap-text' }, 'This needs your failure story.') };
      }
      if (item.kind === 'talk') return { text: `Give your 8 to 10 minute presentation, standing: "${presentation.title}" Then take 5 minutes of questions.`, timer: ui.timer(MINUTES.talk), hint: el('a', { href: 'presentation.html#qa', target: '_blank' }, 'Open the Q&A list') };
      if (item.kind === 'ask') return { text: 'The interviewer asks: "What questions do you have for me?" Ask two.', timer: ui.timer(MINUTES.ask), hint: ui.list(questions.ask.map((a) => a.q)) };
      const q = domainQ.get(item.id);
      const text = item.kind === 'explain' ? `Explain this to a non-technical customer: ${q.q}` : q.q;
      return { text, tag: q.domainName, timer: ui.timer(MINUTES[item.kind]),
        hint: el('div', { class: 'stack' }, el('p', {}, el('b', {}, 'Plain: '), q.plain), item.kind === 'explain' ? null : el('p', {}, el('b', {}, 'Technical: '), q.technical)) };
    }

    function intro() {
      stage.replaceChildren(
        el('p', { class: 'h3' }, 'A full mock day: four rounds, lunch after round 2, presentation in one round.'),
        ui.list([
          'Each round: two LP questions (2 to 4 minutes each), one breadth question, one AI/ML depth question, one explain-it-simply question, and your own questions.',
          'All eight named LPs appear once across the day. No question repeats within a day.',
          'Answer out loud, standing for the presentation. Reveal the hint only after you answer.',
          'Score each round honestly. The weakest check across the day is what to fix tonight.',
        ]),
        el('div', { class: 'row' }, el('button', { class: 'btn btn-gold', type: 'button', onclick: startDay }, day ? 'Start a new mock day' : 'Start a mock day'),
          day && !day.done ? el('button', { class: 'btn', type: 'button', onclick: () => roundIntro() }, `Resume round ${day.round + 1}`) : null));
    }

    function startDay() {
      day = { rounds: practice.pickMockDay(behavioral, domains, loop.focus_areas), round: 0, item: 0, scores: [], done: false };
      writeDay(day);
      roundIntro();
    }

    function roundIntro() {
      const items = day.rounds[day.round];
      stage.replaceChildren(
        el('div', { class: 'row' }, el('span', { class: 'chip chip-gold' }, `Round ${day.round + 1} of ${day.rounds.length}`), el('span', { class: 'chip' }, '60 minutes')),
        day.round === 2 ? el('p', { class: 'notice' }, 'Lunch first, as on the real day: eat, walk, reread the day-of sheet once.') : null,
        el('p', { class: 'h3' }, 'This round'),
        ui.list(items.map((item) => KIND_LABEL[item.kind])),
        el('div', { class: 'row' }, el('button', { class: 'btn btn-gold', type: 'button', onclick: () => { day.item = 0; writeDay(day); ask(); } }, 'Begin round')));
    }

    function ask() {
      const items = day.rounds[day.round];
      const item = items[day.item];
      const view = describe(item);
      const hintBox = el('div', { class: 'stack', hidden: true }, view.hint);
      const next = () => {
        view.timer.stop();
        day.item += 1;
        writeDay(day);
        if (day.item < items.length) ask(); else score();
      };
      stage.replaceChildren(
        el('div', { class: 'row' }, el('span', { class: 'chip chip-gold' }, `Round ${day.round + 1} · ${day.item + 1} / ${items.length}`), el('span', { class: 'chip' }, KIND_LABEL[item.kind]),
          view.tag ? el('span', { class: 'chip' }, view.tag) : null, el('span', { class: 'spacer' }),
          el('button', { class: 'btn btn-sm', type: 'button', onclick: () => { view.timer.stop(); intro(); } }, 'Pause day')),
        el('p', { class: 'quiz-q' }, view.text),
        view.timer.node,
        el('div', { class: 'row' },
          el('button', { class: 'btn', type: 'button', onclick: (e) => { hintBox.hidden = false; e.target.remove(); } }, 'Show hint after answering'),
          el('button', { class: 'btn btn-gold', type: 'button', onclick: next }, day.item + 1 < items.length ? 'Next' : 'Finish round and score')),
        hintBox);
      view.timer.start();
    }

    function score() {
      const items = day.rounds[day.round];
      const checks = items.map(() => new Set());
      const blocks = items.map((item, i) => el('fieldset', { class: 'rubric' },
        el('legend', { class: 'label' }, `${KIND_LABEL[item.kind]}: ${describe(item).text}`),
        rubricOf(item).map((r) => el('label', { class: 'check' },
          el('input', { type: 'checkbox', onchange: (e) => (e.target.checked ? checks[i].add(r.id) : checks[i].delete(r.id)) }), el('span', {}, r.label)))));
      const save = () => {
        const round = items.map((item) => ({ ...item, rubric: rubricOf(item) }));
        const result = practice.scoreRound(round, checks.map((s) => [...s]));
        store.pushQuiz({ at: new Date().toISOString(), kind: 'mock', ...result, items: items.map((x) => x.id) });
        day.scores.push(result);
        day.round += 1;
        day.done = day.round >= day.rounds.length;
        writeDay(day);
        paintHistory();
        if (day.done) summary(); else roundIntro();
      };
      stage.replaceChildren(el('p', { class: 'h3' }, `Score round ${day.round + 1}. Tick only what you actually did.`), ...blocks,
        el('div', { class: 'row' }, el('button', { class: 'btn btn-gold', type: 'button', onclick: save }, 'Save round')));
    }

    function weakest(missedIds) {
      const counts = new Map();
      missedIds.map((id) => id.replace(/-\d+$/, '')).forEach((id) => counts.set(id, (counts.get(id) || 0) + 1));
      const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
      return top && (allRubrics.find((r) => r.id === top[0])?.label || top[0]);
    }

    function summary() {
      const total = day.scores.reduce((s, r) => s + r.total, 0);
      const got = day.scores.reduce((s, r) => s + r.score, 0);
      const weak = weakest(day.scores.flatMap((r) => r.missed));
      stage.replaceChildren(el('p', { class: 'score' }, `${got} / ${total}`), el('p', { class: 'h3' }, 'Mock day complete'),
        ui.table(['Round', 'Score'], day.scores.map((r, i) => [`Round ${i + 1}`, `${r.score} / ${r.total}`])),
        weak ? el('p', { class: 'notice is-error' }, `Most missed today: ${weak}. Rewrite one answer with that fixed, then rest.`) : null,
        el('div', { class: 'row' }, el('button', { class: 'btn btn-gold', type: 'button', onclick: startDay }, 'Start another mock day')));
    }

    function paintHistory() {
      const mocks = store.all().quiz.filter((r) => r.kind === 'mock');
      setReadout('Mock rounds done', Math.min(mocks.length, 4), 4);
      if (!mocks.length) { history.replaceChildren(el('p', { class: 'muted' }, 'No rounds yet. Run one full mock day on October 27.')); return; }
      const weak = weakest(mocks.flatMap((m) => m.missed));
      history.replaceChildren(
        weak ? el('p', { class: 'notice is-error' }, `Most missed across all rounds: ${weak}.`) : null,
        ui.table(['When', 'Score'], [...mocks].reverse().map((m) => [new Date(m.at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }), `${m.score} / ${m.total}`])));
    }

    if (day && day.done) day = null;
    intro();
    paintHistory();
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      ui.section('day', 'Mock day', 'Four rounds, about 4 hours with lunch', el('span', {}, 'Run the ', el('em', {}, 'day')), stage),
      ui.section('rubric', 'Rubrics', 'What each answer is scored on', el('span', {}, 'The ', el('em', {}, 'rubrics')),
        el('div', { class: 'grid-2' },
          el('div', { class: 'card card-navy stack' }, el('h3', { class: 'h3' }, 'Leadership Principles'), ui.list(practice.RUBRIC.map((r) => r.label))),
          el('div', { class: 'card stack' }, el('h3', { class: 'h3' }, 'Technical'), ui.list(practice.rubricFor('tech').map((r) => r.label))),
          el('div', { class: 'card stack' }, el('h3', { class: 'h3' }, 'Explain it simply'), ui.list(practice.rubricFor('explain').map((r) => r.label))),
          el('div', { class: 'card stack' }, el('h3', { class: 'h3' }, 'Presentation'), ui.list(presentation.rubric.map((r) => r.label))))),
      ui.section('history', 'History', 'Saved in this browser', el('span', {}, 'Your ', el('em', {}, 'history')), history)));
  };
})();
