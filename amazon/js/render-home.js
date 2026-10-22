// Confirmed loop: countdown and schedule, the 7-day plan, what is evaluated, four round cards,
// the answer rubric, the day-of panel, and progress across sections.
(function () {
  const { el, load, ui, store, setReadout, practice } = { ...window.Prep, store: window.Prep.store };

  const SEGMENTS = [
    { page: 'domains', noun: 'domain questions known', items: (d) => d.domains.flatMap((x) => x.questions), prefix: 'dq-' },
    { page: 'behavioral', noun: 'stories ready', items: (d) => d.stories, prefix: 'story-' },
    { page: 'top', noun: 'top questions ready', items: (d) => d.questions, prefix: 'top-' },
    { page: 'fundamentals', noun: 'fundamentals known', items: (d) => d.items, prefix: 'fund-' },
    { page: 'compare', noun: 'look-alike pairs known', items: (d) => d.pairs, prefix: 'cmp-' },
  ];

  const pacificToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const fmtDay = (ymd) => new Date(`${ymd}T12:00:00Z`).toLocaleDateString(undefined, { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' });
  const pageOf = (site, id) => site.pages.find((p) => p.id === id);
  const href = (site, task) => `${pageOf(site, task.page)?.href || 'index.html'}${task.anchor ? `#${task.anchor}` : ''}`;

  function countdownSection(loop) {
    const face = el('p', { class: 'countdown', 'aria-live': 'polite' });
    const paint = () => {
      const days = practice.daysUntil(loop.event.date);
      face.replaceChildren(days > 1 ? `${days} days` : days === 1 ? 'Tomorrow' : days === 0 ? 'Today' : 'Done');
    };
    paint();
    setInterval(paint, 60000);
    return ui.section('countdown', 'The day', `Confirmed ${fmtDay(loop.event.confirmed_on)}`, el('span', {}, 'Wednesday, ', el('em', {}, 'October 28')),
      el('div', { class: 'card card-navy next-round stack' },
        el('div', { class: 'row' }, face, el('span', { class: 'chip chip-green' }, 'Confirmed by the recruiter'), el('span', { class: 'chip' }, loop.event.location)),
        el('p', { class: 'h3' }, `Interviews ${loop.event.window}. Arrive by ${loop.event.arrive}.`),
        el('p', {}, loop.event.note),
        el('ol', { class: 'day-line' }, loop.schedule.map((s) => el('li', { class: `day-slot slot-${s.kind}` }, el('span', { class: 'label' }, s.time), el('span', {}, s.label)))),
        el('p', { class: 'muted' }, loop.role.summary)));
  }

  function planSection(loop, site, onChange) {
    const grid = el('div', { class: 'plan-grid' });
    let shownDay;
    const paint = () => {
      shownDay = pacificToday();
      grid.replaceChildren(...loop.plan.map((day) => {
        const state = practice.dayState(day.date);
        const done = () => day.tasks.filter((t) => store.get('checks', `plan-${t.id}`, false)).length;
        const count = el('span', { class: 'chip' }, `${done()} / ${day.tasks.length}`);
        const minutes = (list) => list.reduce((sum, t) => sum + t.minutes, 0);
        const card = el('article', { class: `plan-day plan-${state}`, id: `day-${day.id}` },
          el('div', { class: 'row' }, el('p', { class: 'plan-date' }, fmtDay(day.date)),
            state === 'today' ? el('span', { class: 'chip chip-gold' }, 'Today') : null, el('span', { class: 'spacer' }), count),
          el('h3', { class: 'h3' }, day.focus),
          el('p', { class: 'muted' }, `Minimum ${Math.round(minutes(day.tasks.filter((t) => t.minimum)) / 6) / 10} h · full ${Math.round(minutes(day.tasks) / 6) / 10} h`),
          el('div', { class: 'stage-checks' }, day.tasks.map((t) => el('div', { class: 'plan-task' },
            ui.checkbox(`plan-${t.id}`, `${t.minimum ? 'Must' : 'If time'} · ${t.minutes} min: ${t.text}`),
            el('a', { class: 'chip', href: href(site, t) }, `${pageOf(site, t.page)?.label || 'Open'} →`)))),
          el('p', {}, el('strong', {}, 'Done when: '), day.gate));
        card.addEventListener('change', () => { count.textContent = `${done()} / ${day.tasks.length}`; onChange(); });
        return card;
      }));
    };
    paint();
    setInterval(() => { if (pacificToday() !== shownDay) paint(); }, 60000);
    const today = loop.plan.find((d) => practice.dayState(d.date) === 'today');
    return ui.section('plan', '7-day plan', 'October 22 to 28', el('span', {}, 'Today’s ', el('em', {}, 'plan')),
      el('p', { class: 'section-intro' }, 'Each day has Must tasks first. Every task links to the exact section to open. Checkmarks save in this browser; export from the sidebar to move them between devices.'),
      today ? el('a', { class: 'btn btn-gold', href: `#day-${today.id}` }, `Go to today: ${today.focus}`) : null,
      grid);
  }

  function streamsSection(loop, site) {
    return ui.section('evaluated', 'What they evaluate', 'Three streams', el('span', {}, 'What they ', el('em', {}, 'score')),
      el('div', { class: 'grid-3' }, loop.streams.map((s) => el('article', { class: 'card stack' },
        el('p', { class: 'h3' }, s.title), el('p', { class: 'muted' }, s.summary),
        s.parts.map((p) => el('p', {}, el('strong', {}, `${p.label}: `), p.text)),
        el('a', { class: 'btn btn-sm', href: pageOf(site, s.page).href }, `Open ${pageOf(site, s.page).label} →`)))),
      el('div', { class: 'card stack', id: 'rubric' },
        el('p', { class: 'label' }, 'Amazon’s answer rubric, from the recruiter’s study guide'), ui.list(loop.answer_rubric)));
  }

  function roundsSection(loop, behavioral) {
    const leads = behavioral.stories.filter((s) => s.lead);
    return ui.section('rounds', 'Four rounds', 'Four interviewers, 60 minutes each', el('span', {}, 'The ', el('em', {}, 'rounds')),
      el('div', { class: 'card stack' }, el('p', { class: 'label' }, 'Any round may include'), ui.list(loop.round_expect),
        el('p', { class: 'label' }, 'Still unknown'), ui.list(loop.unknowns)),
      el('div', { class: 'pipeline' }, loop.rounds.map((r) => el('article', { class: 'stage' },
        el('div', { class: 'stage-top' }, el('span', { class: 'stage-num' }, String(r.order)),
          el('div', { class: 'stack', style: { gap: '0.15rem' } }, el('h3', { class: 'h3' }, r.title), el('p', { class: 'muted stage-meta' }, r.time))),
        el('div', { class: 'stage-checks' }, r.checklist.map((c) => ui.checkbox(`round-${c.id}`, c.text)))))),
      el('div', { class: 'row' }, el('span', { class: 'label' }, 'Lead stories to spread across rounds'),
        leads.map((s) => el('a', { class: 'chip chip-gold', href: `behavioral.html#story-${s.id}` }, `${s.code} ${s.title}`))));
  }

  function dayOfSection(loop) {
    const d = loop.day_of;
    return ui.section('day-of', 'Day-of', 'Pack the night before', el('span', {}, 'On the ', el('em', {}, 'day')),
      el('div', { class: 'grid-2' },
        el('div', { class: 'card card-navy stack' }, el('p', { class: 'h3' }, d.arrive), el('p', { class: 'label' }, 'Bring'),
          d.bring.map((b) => ui.checkbox(`dayof-${b.id}`, b.text))),
        el('div', { class: 'card stack' }, ui.list(d.notes), ui.list(loop.logistics),
          el('a', { class: 'btn btn-gold', href: 'final-review.html', target: '_blank', rel: 'noopener' }, 'Open the printable final review'))));
  }

  async function progressSection(site) {
    const rows = await Promise.all(SEGMENTS.map(async (seg) => {
      const data = await load(seg.page);
      const items = seg.items(data);
      const doneId = data.status_options.at(-1).id;
      return { seg, page: pageOf(site, seg.page), done: items.filter((x) => store.get('status', `${seg.prefix}${x.id}`) === doneId).length, total: items.length };
    }));
    const quiz = store.all().quiz;
    const extra = [
      { href: 'presentation.html#practice', label: 'Presentation runs', n: quiz.filter((r) => r.kind === 'talk').length, noun: 'aim for 6' },
      { href: 'mock.html', label: 'Mock rounds', n: quiz.filter((r) => r.kind === 'mock').length, noun: 'aim for 4, one full day' },
    ];
    const meterCard = (hrefTo, label, done, total, noun) => {
      const meter = el('div', { class: 'meter meter-light' }, el('span'));
      meter.firstChild.style.setProperty('--p', total ? Math.min(1, done / total) : 0);
      return el('a', { class: 'card stack progress-card', href: hrefTo }, el('p', { class: 'label' }, label),
        el('p', { class: 'progress-num' }, `${done}`, el('span', { class: 'muted' }, ` / ${total}`)), el('p', { class: 'muted' }, noun), meter);
    };
    return ui.section('progress', 'Progress', 'Across every section', el('span', {}, 'Where you ', el('em', {}, 'stand')),
      el('div', { class: 'grid-3', style: { marginTop: '1.25rem' } },
        rows.map(({ seg, page, done, total }) => meterCard(page.href, page.label, done, total, seg.noun)),
        extra.map((x) => meterCard(x.href, x.label, x.n, x.label.startsWith('Mock') ? 4 : 6, x.noun))));
  }

  window.Prep.pages.home = async ({ main, loop }) => {
    const [site, behavioral] = await Promise.all([load('site'), load('behavioral')]);
    const musts = loop.plan.flatMap((d) => d.tasks.filter((t) => t.minimum).map((t) => `plan-${t.id}`));
    const updateReadout = () => setReadout('Must-do tasks', musts.filter((id) => store.get('checks', id, false)).length, musts.length);
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      countdownSection(loop),
      planSection(loop, site, updateReadout),
      streamsSection(loop, site),
      roundsSection(loop, behavioral),
      dayOfSection(loop),
      await progressSection(site)));
    updateReadout();
  };
})();
