// IT fundamentals page: rapid-fire quiz by topic (say it, reveal, mark yourself), score history,
// and a browsable bank with per-question status.
(function () {
  const { el, load, ui, store, setReadout } = { ...window.Prep, store: window.Prep.store };
  const SAY_SECONDS = 30;

  function quizSection(data, onDone) {
    const box = el('div', { class: 'quiz card' });
    const topics = new Set(data.topics.map((t) => t.id));
    const known = data.status_options.at(-1).id;
    const shaky = data.status_options[1].id;
    function setup() {
      const runs = store.all().quiz.filter((r) => r.kind === 'fundamentals');
      const last = runs.at(-1);
      const pick = (items) => run(ui.shuffle(items));
      const chosen = () => data.items.filter((x) => topics.has(x.topic));
      const notKnown = () => chosen().filter((x) => store.get('status', `fund-${x.id}`) !== known);
      box.replaceChildren(
        el('p', { class: 'muted' }, `Say each answer out loud in about ${SAY_SECONDS} seconds, reveal, then mark yourself honestly. Target: ${data.pass_pct}% or better.`),
        el('div', { class: 'row', role: 'group', 'aria-label': 'Topics' }, data.topics.map((t) => el('label', { class: 'check check-pill' },
          el('input', { type: 'checkbox', checked: topics.has(t.id), onchange: (e) => (e.target.checked ? topics.add(t.id) : topics.delete(t.id)) }),
          el('span', {}, t.name)))),
        el('div', { class: 'row' },
          el('button', { class: 'btn btn-gold', type: 'button', onclick: () => pick(chosen()) }, 'Quiz the chosen topics'),
          el('button', { class: 'btn', type: 'button', onclick: () => pick(ui.shuffle(chosen()).slice(0, 10)) }, '10 at random'),
          el('button', { class: 'btn', type: 'button', onclick: () => pick(notKnown()) }, 'Only the ones not yet known'),
          last ? el('span', { class: 'muted label' }, `Last: ${last.score} / ${last.total} (${Math.round((100 * last.score) / last.total)}%)`) : null));
    }
    function run(items) {
      if (!items.length) {
        box.querySelector('.notice')?.remove();
        box.prepend(el('p', { class: 'notice' }, 'Nothing to quiz: pick at least one topic, or every chosen question is already known.'));
        return;
      }
      const missed = [];
      let i = 0;
      let timer = null;
      const paint = () => {
        const item = items[i];
        timer?.stop();
        timer = ui.timer(SAY_SECONDS / 60);
        const back = el('div', { class: 'stack', hidden: true },
          el('p', { class: 'answer-short' }, item.a),
          el('p', { class: 'muted' }, el('strong', {}, 'Likely follow-up: '), item.followup),
          el('div', { class: 'row' },
            el('button', { class: 'btn btn-gold', type: 'button', onclick: () => next(true) }, 'Knew it'),
            el('button', { class: 'btn', type: 'button', onclick: () => next(false) }, 'Missed it')));
        box.replaceChildren(
          el('div', { class: 'row' }, el('span', { class: 'label' }, `${i + 1} / ${items.length}`),
            el('span', { class: 'chip' }, data.topics.find((t) => t.id === item.topic).name), el('span', { class: 'spacer' }),
            el('button', { class: 'btn btn-sm', type: 'button', onclick: () => { timer.stop(); setup(); } }, 'Stop')),
          el('p', { class: 'quiz-q', 'aria-live': 'polite' }, item.q),
          el('div', { class: 'row' }, timer.node),
          el('button', { class: 'btn', type: 'button', onclick: (e) => { timer.stop(); back.hidden = false; e.target.remove(); } }, 'Reveal'),
          back);
        timer.start();
      };
      const next = (knew) => {
        const item = items[i];
        if (!knew) missed.push(item);
        store.set('status', `fund-${item.id}`, knew ? known : shaky);
        i += 1;
        if (i < items.length) { paint(); return; }
        timer.stop();
        const score = items.length - missed.length;
        store.pushQuiz({ at: new Date().toISOString(), kind: 'fundamentals', score, total: items.length, missed: missed.map((m) => `fund-${m.id}`) });
        onDone();
        const pct = Math.round((100 * score) / items.length);
        box.replaceChildren(
          el('p', { class: 'score' }, `${score} / ${items.length}`),
          el('p', { class: pct >= data.pass_pct ? 'muted' : 'notice is-error' }, pct >= data.pass_pct ? `${pct}%: at or above the ${data.pass_pct}% target.` : `${pct}%: below the ${data.pass_pct}% target. Retry the missed ones tomorrow.`),
          missed.length ? el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Missed'), ui.list(missed.map((m) => m.q))) : null,
          el('div', { class: 'row' },
            missed.length ? el('button', { class: 'btn btn-gold', type: 'button', onclick: () => run(ui.shuffle(missed)) }, 'Retry missed') : null,
            el('button', { class: 'btn', type: 'button', onclick: setup }, 'New round')));
      };
      paint();
    }
    setup();
    return ui.section('quiz', 'Rapid-fire quiz', `${data.items.length} questions`, el('span', {}, 'Rapid-fire ', el('em', {}, 'fundamentals')),
      el('p', { class: 'section-intro' }, data.intro), box);
  }

  function bankSection(data, onStatus) {
    return data.topics.map((t) => {
      const items = data.items.filter((x) => x.topic === t.id);
      return ui.section(`topic-${t.id}`, t.name, `${items.length} questions`, t.name,
        el('div', { class: 'item-list' }, items.map((x) => el('details', { class: 'item', id: `fund-${x.id}` },
          el('summary', {},
            el('span', { class: 'item-title' }, x.q),
            el('span', { class: 'item-meta', onclick: (e) => e.stopPropagation() }, ui.statusSelect(`fund-${x.id}`, data.status_options, onStatus))),
          el('div', { class: 'item-body' },
            el('p', { class: 'answer-short' }, x.a),
            el('div', { class: 'probe' }, el('p', { class: 'probe-q' }, 'Likely follow-up'), el('p', {}, x.followup)))))));
    });
  }

  window.Prep.pages.fundamentals = async ({ main }) => {
    const data = await load('fundamentals');
    const knownId = data.status_options.at(-1).id;
    const updateReadout = () => setReadout('Fundamentals known', data.items.filter((x) => store.get('status', `fund-${x.id}`) === knownId).length, data.items.length);
    // Status selects in the bank are rebuilt on quiz completion so they show the latest marks.
    const bank = el('div', { class: 'stack', style: { gap: 'var(--section)' } });
    const paintBank = () => bank.replaceChildren(...bankSection(data, updateReadout));
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      quizSection(data, () => { updateReadout(); paintBank(); }),
      bank));
    paintBank();
    updateReadout();
  };
})();
