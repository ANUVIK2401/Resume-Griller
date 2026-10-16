// Questions page: openers, rapid-fire quiz, LP randomizer, customer role-plays, questions to ask.
(function () {
  const { el, load, ui, store, setReadout, practice } = { ...window.Prep, store: window.Prep.store };
  const LP_ANSWER_MIN = 2;
  const ROLEPLAY_MIN = 10;

  function openersSection(data) {
    return ui.section('openers', 'Openers', 'Have crisp answers', el('span', {}, 'The ', el('em', {}, 'openers')),
      el('div', { class: 'item-list' }, data.openers.map((o) => el('details', { class: 'item', id: `opener-${o.id}` },
        el('summary', {}, el('span', { class: 'item-title' }, o.q)),
        el('div', { class: 'item-body' }, ui.list(o.outline), ui.notesBox(`opener-${o.id}`, 'Your answer, in your words'))))));
  }

  // Self-graded: reveal, then mark knew it or missed. Results go to quiz history as kind "tech".
  function rapidQuiz(data, onDone) {
    const box = el('div', { class: 'quiz card' });
    const ranges = [['First 12', 0, 12], ['Last 12', 12, 24], ['All 24', 0, data.rapid_fire.length]];
    function setup() {
      const last = store.all().quiz.filter((r) => r.kind === 'tech').at(-1);
      box.replaceChildren(
        el('p', { class: 'muted' }, 'Answer out loud in one or two sentences, reveal, then mark yourself honestly.'),
        el('div', { class: 'row' }, ranges.map(([label, from, to]) => el('button', { class: 'btn', type: 'button', onclick: () => run(ui.shuffle(data.rapid_fire.slice(from, to))) }, label)),
          last ? el('span', { class: 'muted label' }, `Last: ${last.score} / ${last.total}`) : null));
    }
    function run(items) {
      const missed = [];
      let i = 0;
      const paint = () => {
        const item = items[i];
        const back = el('div', { class: 'stack', hidden: true }, el('p', { class: 'answer-short' }, item.a),
          el('div', { class: 'row' },
            el('button', { class: 'btn btn-gold', type: 'button', onclick: () => next(true) }, 'Knew it'),
            el('button', { class: 'btn', type: 'button', onclick: () => next(false) }, 'Missed it')));
        box.replaceChildren(
          el('div', { class: 'row' }, el('span', { class: 'label' }, `${i + 1} / ${items.length}`), el('span', { class: 'spacer' }),
            el('button', { class: 'btn btn-sm', type: 'button', onclick: setup }, 'Stop')),
          el('p', { class: 'quiz-q', 'aria-live': 'polite' }, item.q),
          el('button', { class: 'btn', type: 'button', onclick: (e) => { back.hidden = false; e.target.remove(); } }, 'Reveal'),
          back);
      };
      const next = (knew) => {
        const item = items[i];
        if (!knew) missed.push(item);
        store.set('status', `q-${item.id}`, knew ? 'known' : 'shaky');
        i += 1;
        if (i < items.length) { paint(); return; }
        store.pushQuiz({ at: new Date().toISOString(), kind: 'tech', score: items.length - missed.length, total: items.length, missed: missed.map((m) => m.id) });
        onDone();
        box.replaceChildren(
          el('p', { class: 'score' }, `${items.length - missed.length} / ${items.length}`),
          missed.length ? el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Missed'), ui.list(missed.map((m) => m.q))) : el('p', { class: 'muted' }, 'Clean run.'),
          el('div', { class: 'row' },
            missed.length ? el('button', { class: 'btn btn-gold', type: 'button', onclick: () => run(ui.shuffle(missed)) }, 'Retry missed') : null,
            el('button', { class: 'btn', type: 'button', onclick: setup }, 'New round')));
      };
      paint();
    }
    setup();
    return box;
  }

  function rapidSection(data, onStatus) {
    const list = el('div', { class: 'item-list' }, data.rapid_fire.map((r, i) => el('details', { class: 'item', id: `q-${r.id}` },
      el('summary', {},
        el('span', { class: 'item-title' }, `${i + 1}. ${r.q}`),
        el('span', { class: 'item-meta', onclick: (e) => e.stopPropagation() }, ui.statusSelect(`q-${r.id}`, data.status_options, onStatus))),
      el('div', { class: 'item-body' }, el('p', { class: 'answer-short' }, r.a)))));
    return ui.section('rapid', 'Rapid fire', `${data.rapid_fire.length} questions`, el('span', {}, 'Rapid-fire ', el('em', {}, 'fundamentals')),
      rapidQuiz(data, onStatus),
      el('details', { class: 'fold', style: { marginTop: '1rem' } }, el('summary', {}, 'Browse every question and answer'), el('div', { class: 'fold-body' }, list)));
  }

  function storyChip(story, role) {
    return el('a', { class: `chip ${role === 'primary' ? 'chip-gold' : ''}`, href: `behavioral.html#story-${story.id}` }, `${role}: ${story.code} ${story.title}`);
  }

  function randomizerSection(data, behavioral) {
    const box = el('div', { class: 'card stack randomizer' });
    let timer = null;
    const roll = () => {
      timer?.stop();
      const q = data.lp_questions[Math.floor(Math.random() * data.lp_questions.length)];
      const { lp, stories, gap } = practice.suggestQuestionStories(q, behavioral);
      timer = ui.timer(LP_ANSWER_MIN);
      box.replaceChildren(
        el('span', { class: 'chip chip-gold' }, lp.name),
        el('p', { class: 'quiz-q' }, q.q),
        el('div', { class: 'row' }, el('span', { class: 'label' }, 'Suggested stories'), stories.map(({ story, role }) => storyChip(story, role))),
        gap ? el('p', { class: 'notice is-error' }, `Gap: ${gap.name}. Use a real episode that answers this particular question.`) : null,
        el('div', { class: 'row' }, el('span', { class: 'label' }, `${LP_ANSWER_MIN}-minute answer`), timer.node),
        el('div', { class: 'row' }, el('button', { class: 'btn btn-gold', type: 'button', onclick: roll }, 'Another question')));
    };
    box.append(el('p', { class: 'muted' }, 'A random Leadership Principle question with two suggested stories. Answer before you look at the story.'),
      el('div', { class: 'row' }, el('button', { class: 'btn btn-gold', type: 'button', onclick: roll }, 'Give me a question')));
    return ui.section('randomizer', 'LP randomizer', `${data.lp_questions.length} questions`, el('span', {}, 'LP ', el('em', {}, 'randomizer')), box);
  }

  function roleplayItem(rp, data) {
    const timer = ui.timer(ROLEPLAY_MIN);
    const answer = el('div', { class: 'stack', hidden: true },
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Discovery questions to ask'), ui.list(rp.discovery)),
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Options and tradeoffs'),
        el('div', { class: 'item-list' }, rp.options.map((o) => el('div', { class: 'probe' }, el('p', { class: 'probe-q' }, o.name), el('p', {}, o.tradeoff))))),
      el('div', { class: 'probe' }, el('p', { class: 'probe-q' }, 'Close'), el('p', {}, rp.close)));
    const reveal = el('button', { class: 'btn', type: 'button', onclick: () => { answer.hidden = !answer.hidden; reveal.textContent = answer.hidden ? 'Reveal a strong answer' : 'Hide answer'; } }, 'Reveal a strong answer');
    return el('details', { class: 'item', id: `rp-${rp.id}` },
      el('summary', {}, el('span', { class: 'item-title' }, rp.title), el('span', { class: 'item-meta' }, el('span', { class: 'chip' }, rp.audience))),
      el('div', { class: 'item-body' },
        el('blockquote', { class: 'resume-line' }, `"${rp.opening}"`),
        el('div', { class: 'row' }, el('span', { class: 'label' }, `${ROLEPLAY_MIN}-minute role-play`), timer.node),
        el('div', { class: 'stack', style: { gap: '0.5rem' } }, el('p', { class: 'label' }, 'Checklist after speaking'),
          data.roleplay_rules.map((rule, i) => ui.checkbox(`rp-${rp.id}-${i}`, rule))),
        el('div', { class: 'row' }, reveal), answer,
        ui.notesBox(`rp-${rp.id}`, 'What you said, and what to change')));
  }

  function roleplaySection(data) {
    return ui.section('roleplay', 'Customer role-play', `${data.roleplays.length} scenarios`, el('span', {}, 'Customer ', el('em', {}, 'role-play')),
      el('div', { class: 'card card-navy stack' }, el('p', { class: 'label' }, 'How to win it'), ui.list(data.roleplay_rules)),
      el('div', { class: 'item-list', style: { marginTop: '1rem' } }, data.roleplays.map((rp) => roleplayItem(rp, data))));
  }

  function askSection(data) {
    return ui.section('ask', 'Questions to ask', 'Your turn', el('span', {}, 'Questions to ', el('em', {}, 'ask them')),
      el('div', { class: 'item-list' }, data.ask.map((a, i) => el('div', { class: `card stack${i === 0 ? ' card-navy' : ''}` },
        el('p', { class: 'h3' }, a.q), el('p', { class: 'muted' }, a.why)))));
  }

  window.Prep.pages.questions = async ({ main }) => {
    const [data, behavioral] = await Promise.all([load('questions'), load('behavioral')]);
    const knownId = data.status_options.at(-1).id;
    const updateReadout = () => setReadout('Rapid fire known', data.rapid_fire.filter((r) => store.get('status', `q-${r.id}`) === knownId).length, data.rapid_fire.length);
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      openersSection(data),
      rapidSection(data, updateReadout),
      randomizerSection(data, behavioral),
      roleplaySection(data),
      askSection(data)));
    updateReadout();
  };
})();
