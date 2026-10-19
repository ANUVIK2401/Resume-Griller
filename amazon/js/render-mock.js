// Mock round: a 45-minute simulation. 2 LP questions and 1 technical item under per-question timers,
// notes, self-score rubric, history.
(function () {
  const { el, load, ui, store, setReadout, practice } = { ...window.Prep, store: window.Prep.store };
  const MINUTES = { lp: 12, tech: 21, design: 21 };
  const KIND_LABEL = { lp: 'Leadership Principle', tech: 'Technical', design: 'Whiteboard design' };

  function resolve(item, questions, designs, behavioral, fundamentals) {
    if (item.id.startsWith('fund-')) {
      const f = fundamentals.items.find((x) => `fund-${x.id}` === item.id);
      return { ...item, text: `${f.q} Then the follow-up: ${f.followup}`, answer: f.a };
    }
    if (item.kind === 'lp') {
      const q = questions.lp_questions.find((x) => x.id === item.id);
      return { ...item, text: q.q, hint: practice.suggestQuestionStories(q, behavioral) };
    }
    if (item.kind === 'tech') return { ...item, text: questions.rapid_fire.find((x) => x.id === item.id).q, answer: questions.rapid_fire.find((x) => x.id === item.id).a };
    const d = designs.designs.find((x) => `design-${x.id}` === item.id);
    return { ...item, text: d.prompt, link: `design.html#design-${d.id}` };
  }

  function historySection(behavioralCount, labelOf) {
    const mocks = store.all().quiz.filter((r) => r.kind === 'mock');
    if (!mocks.length) return el('p', { class: 'muted' }, `No mock rounds yet. Aim for 3 before the loop; you have ${behavioralCount} stories to draw from.`);
    const missCount = new Map();
    mocks.flatMap((m) => m.missed.map((id) => id.replace(/-\d+$/, ''))).forEach((id) => missCount.set(id, (missCount.get(id) || 0) + 1));
    const weakest = [...missCount.entries()].sort((a, b) => b[1] - a[1])[0];
    const weakLabel = weakest && [...practice.RUBRIC, ...practice.rubricFor('design'), ...practice.rubricFor('tech')].find((r) => r.id === weakest[0])?.label;
    return el('div', { class: 'stack' },
      weakLabel ? el('p', { class: 'notice is-error' }, `Most missed across your mocks: ${weakLabel}. Fix this first.`) : null,
      ui.table(['When', 'Asked', 'Score'], [...mocks].reverse().map((m) => [
        new Date(m.at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
        (m.items || []).map(labelOf).join(' / '),
        `${m.score} / ${m.total}`])));
  }

  window.Prep.pages.mock = async ({ main }) => {
    const [questions, designs, behavioral, fundamentals] = await Promise.all([load('questions'), load('designs'), load('behavioral'), load('fundamentals')]);
    const stage = el('div', { class: 'card stack mock' });
    const history = el('div');
    const paintHistory = () => {
      history.replaceChildren(historySection(behavioral.stories.length, (id) => questions.lp_questions.find((q) => q.id === id)?.q
        || questions.rapid_fire.find((q) => q.id === id)?.q
        || fundamentals.items.find((f) => `fund-${f.id}` === id)?.q
        || designs.designs.find((d) => `design-${d.id}` === id)?.title || id));
      const mocks = store.all().quiz.filter((r) => r.kind === 'mock');
      setReadout('Mock rounds done', Math.min(mocks.length, 3), 3);
    };

    function intro() {
      stage.replaceChildren(
        el('p', { class: 'h3' }, 'A 45-minute round: two Leadership Principle questions, then one technical deep dive or whiteboard design.'),
        ui.list([`${MINUTES.lp} minutes per LP question including follow-ups, then ${MINUTES.tech} minutes for the technical part: ${MINUTES.lp * 2 + MINUTES.tech} minutes in all, close to the reported one-hour round minus introductions and your questions.`, 'Answer out loud. Type notes as you go: what you said, what you forgot.', 'At the end, use the checks for the answer type: outcome and ownership for stories, correctness and clarity for rapid-fire, or requirements and tradeoffs for a design.']),
        el('div', { class: 'row' }, el('button', { class: 'btn btn-gold', type: 'button', onclick: start }, 'Start a mock round')));
    }

    function start() {
      const round = practice.pickMockRound(questions, designs, Math.random, fundamentals).map((item) => resolve(item, questions, designs, behavioral, fundamentals));
      ask(round, 0);
    }

    function ask(round, i) {
      const item = round[i];
      const timer = ui.timer(MINUTES[item.kind]);
      const hintBox = el('div', { class: 'stack', hidden: true },
        item.hint ? el('div', { class: 'row' }, el('span', { class: 'label' }, 'Suggested stories'),
          item.hint.stories.map(({ story, role }) => el('span', { class: 'chip' }, `${role}: ${story.code} ${story.title}`))) : null,
        item.hint?.gap ? el('p', { class: 'notice is-error' }, `Gap: ${item.hint.gap.name}.`) : null,
        item.answer ? el('p', { class: 'answer-short' }, item.answer) : null,
        item.link ? el('a', { class: 'btn btn-sm', href: item.link }, 'Open the full design answer') : null);
      stage.replaceChildren(
        el('div', { class: 'row' }, el('span', { class: 'chip chip-gold' }, `${i + 1} / ${round.length}`), el('span', { class: 'chip' }, KIND_LABEL[item.kind]),
          el('span', { class: 'spacer' }), el('button', { class: 'btn btn-sm', type: 'button', onclick: () => { timer.stop(); intro(); } }, 'Quit')),
        el('p', { class: 'quiz-q' }, item.text),
        el('div', { class: 'row' }, timer.node),
        ui.notesBox(`mock-${item.id}`, 'Notes while you answer'),
        el('div', { class: 'row' },
          el('button', { class: 'btn', type: 'button', onclick: (e) => { hintBox.hidden = false; e.target.remove(); } }, 'Show hint after answering'),
          el('button', { class: 'btn btn-gold', type: 'button', onclick: () => { timer.stop(); if (i + 1 < round.length) ask(round, i + 1); else score(round); } },
            i + 1 < round.length ? 'Next question' : 'Finish and self-score')),
        hintBox);
      timer.start();
    }

    function score(round) {
      const checks = round.map(() => new Set());
      const blocks = round.map((item, i) => el('fieldset', { class: 'rubric' },
        el('legend', { class: 'label' }, `${i + 1}. ${item.text}`),
        practice.rubricFor(item.kind).map((r) => el('label', { class: 'check' },
          el('input', { type: 'checkbox', onchange: (e) => (e.target.checked ? checks[i].add(r.id) : checks[i].delete(r.id)) }),
          el('span', {}, r.label)))));
      stage.replaceChildren(
        el('p', { class: 'h3' }, 'Self-score. Tick only what you actually did.'),
        ...blocks,
        el('div', { class: 'row' }, el('button', { class: 'btn btn-gold', type: 'button', onclick: () => {
          const result = practice.scoreRound(round, checks.map((s) => [...s]));
          store.pushQuiz({ at: new Date().toISOString(), kind: 'mock', ...result, items: round.map((x) => x.id) });
          paintHistory();
          stage.replaceChildren(el('p', { class: 'score' }, `${result.score} / ${result.total}`),
            el('p', { class: 'muted' }, 'Saved to your history below. Rewrite the weakest answer in your notes, then run another round tomorrow.'),
            el('div', { class: 'row' }, el('button', { class: 'btn btn-gold', type: 'button', onclick: start }, 'Another round')));
        } }, 'Save score')));
    }

    intro();
    paintHistory();
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      ui.section('round', 'Mock round', '45 minutes + review', el('span', {}, 'Run a ', el('em', {}, 'round')), stage),
      ui.section('rubric', 'Rubric', 'Five checks', el('span', {}, 'The ', el('em', {}, 'rubric')),
        el('div', { class: 'grid-3' },
          el('div', { class: 'card card-navy stack' }, el('h3', { class: 'h3' }, 'Leadership Principles'), ui.list(practice.RUBRIC.map((r) => r.label))),
          el('div', { class: 'card stack' }, el('h3', { class: 'h3' }, 'Architecture design'), ui.list(practice.rubricFor('design').map((r) => r.label))),
          el('div', { class: 'card stack' }, el('h3', { class: 'h3' }, 'Rapid-fire technical'), ui.list(practice.rubricFor('tech').map((r) => r.label))))),
      ui.section('history', 'History', 'Saved in this browser', el('span', {}, 'Your ', el('em', {}, 'history')), history)));
  };
})();
