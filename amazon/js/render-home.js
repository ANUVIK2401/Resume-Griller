// Loop page: countdown to the on-campus loop, the day-by-day plan, rounds with checklists, progress.
(function () {
  const { el, load, ui, store, setReadout, practice } = { ...window.Prep, store: window.Prep.store };

  // Where each segment keeps its items and how its status ids are prefixed in storage.
  const SEGMENTS = [
    { page: 'behavioral', list: 'stories', prefix: 'story-', noun: 'stories ready' },
    { page: 'aws', list: 'services', prefix: 'aws-', noun: 'AWS terms known' },
    { page: 'design', data: 'designs', list: 'designs', prefix: 'design-', noun: 'designs ready' },
    { page: 'questions', list: 'rapid_fire', prefix: 'q-', noun: 'rapid-fire known' },
  ];

  const fmtDate = (iso) => new Date(iso).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  const fmtDay = (ymd) => new Date(`${ymd}T12:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const eventDate = (loop) => store.get('loop', 'event', {}).date || loop.event.date;
  const pageOf = (site, id) => site.pages.find((p) => p.id === id);

  function heroCard(loop) {
    const date = el('input', { class: 'field field-sm', type: 'datetime-local', value: eventDate(loop), 'aria-label': 'Loop date and start time' });
    const confirmed = ui.checkbox('event-confirmed', 'Date and time confirmed with the recruiter');
    const face = el('div', { class: 'stack', style: { gap: '0.4rem' } });
    const paint = () => {
      const iso = eventDate(loop);
      const days = practice.daysUntil(iso);
      const isConfirmed = store.get('checks', 'event-confirmed', loop.event.confirmed);
      face.replaceChildren(
        el('p', { class: 'countdown' }, days > 1 ? `${days} days` : days === 1 ? 'Tomorrow' : days === 0 ? 'Today' : 'Done'),
        el('p', { class: 'h3' }, `On-campus loop, ${fmtDate(iso)}`),
        el('div', { class: 'row' },
          el('span', { class: `chip ${isConfirmed ? 'chip-green' : 'chip-red'}` }, isConfirmed ? 'Confirmed' : 'Pending confirmation'),
          el('span', { class: 'chip' }, loop.event.location)));
    };
    date.addEventListener('change', () => { store.set('loop', 'event', date.value ? { date: date.value } : null); paint(); });
    confirmed.addEventListener('change', paint);
    paint();
    setInterval(paint, 60000);
    return el('div', { class: 'card card-navy next-round' },
      el('p', { class: 'label' }, 'Countdown'), face,
      el('p', { class: 'muted' }, loop.event.note),
      el('div', { class: 'row' }, date), confirmed);
  }

  function planSection(loop, site, onChange) {
    const days = loop.plan.map((day) => {
      const state = practice.dayState(day.date);
      const done = () => day.tasks.filter((t) => store.get('checks', `plan-${t.id}`, false)).length;
      const count = el('span', { class: 'chip' }, `${done()} / ${day.tasks.length}`);
      const card = el('article', { class: `plan-day plan-${state}`, id: `day-${day.id}` },
        el('div', { class: 'row' },
          el('p', { class: 'plan-date' }, fmtDay(day.date)),
          state === 'today' ? el('span', { class: 'chip chip-gold' }, 'Today') : null,
          el('span', { class: 'spacer' }), count),
        el('p', { class: 'h3' }, day.focus),
        el('div', { class: 'stage-checks' }, day.tasks.map((t) => {
          const box = ui.checkbox(`plan-${t.id}`, t.text);
          const page = t.page && pageOf(site, t.page);
          return el('div', { class: 'plan-task' }, box, page ? el('a', { class: 'chip', href: page.href }, page.label) : null);
        })));
      card.addEventListener('change', () => { count.textContent = `${done()} / ${day.tasks.length}`; onChange(); });
      return card;
    });
    const today = loop.plan.find((d) => practice.dayState(d.date) === 'today');
    return ui.section('plan', 'Daily plan', `${loop.plan.length} days`, el('span', {}, 'The ', el('em', {}, 'plan')),
      el('p', { class: 'section-intro' }, 'One focus per day. Past days stay open so you can catch up; today is outlined in orange.'),
      today ? el('div', { class: 'row', style: { marginBottom: '1rem' } }, el('a', { class: 'btn btn-gold', href: `#day-${today.id}` }, `Jump to today: ${today.focus}`)) : null,
      el('div', { class: 'plan-grid' }, days));
  }

  function stageCard(s, loop, site, behavioral, onChange) {
    const saved = store.get('loop', s.id, {});
    const state = { status: s.default_status, date: s.default_date, ...saved };
    const status = el('select', { class: 'field field-sm status', 'aria-label': `${s.title} status` },
      loop.status_options.map((o) => el('option', { value: o.id }, o.label)));
    const tone = (v) => (v === 'passed' ? 'solved' : v === 'scheduled' ? 'review' : v);
    status.value = state.status;
    status.dataset.status = tone(state.status);
    const countDone = () => s.checklist.filter((c) => store.get('checks', `loop-${c.id}`, false)).length;
    const checkLabel = el('p', { class: 'label' }, `Checklist ${countDone()} / ${s.checklist.length}`);
    const leads = s.lead_stories.map((id) => behavioral.stories.find((x) => x.id === id));
    const card = el('article', { class: `stage stage-${state.status}`, 'aria-labelledby': `stage-${s.id}` },
      el('div', { class: 'stage-top' },
        el('span', { class: 'stage-num' }, String(s.order)),
        el('div', { class: 'stack', style: { gap: '0.15rem' } },
          el('h3', { class: 'h3', id: `stage-${s.id}` }, s.title),
          el('p', { class: 'muted stage-meta' }, [s.format, s.duration_min ? `about ${s.duration_min} min` : null, s.location].filter(Boolean).join(' · ')))),
      el('div', { class: 'row' }, status),
      s.note ? el('p', { class: 'stage-note' }, s.note) : null,
      leads.length ? el('div', { class: 'row' }, el('span', { class: 'label' }, 'Lead stories'),
        leads.map((st) => el('a', { class: 'chip chip-gold', href: `behavioral.html#story-${st.id}` }, `${st.code} ${st.title}`))) : null,
      el('div', { class: 'stage-checks' }, checkLabel, s.checklist.map((c) => ui.checkbox(`loop-${c.id}`, c.text))),
      el('div', { class: 'row' }, s.prep_pages.map((id) => el('a', { class: 'chip', href: pageOf(site, id).href }, pageOf(site, id).label))));
    status.addEventListener('change', () => {
      store.set('loop', s.id, { ...store.get('loop', s.id, {}), status: status.value });
      status.dataset.status = tone(status.value);
      card.className = `stage stage-${status.value}`;
    });
    card.addEventListener('change', (e) => {
      if (e.target.type !== 'checkbox') return;
      checkLabel.textContent = `Checklist ${countDone()} / ${s.checklist.length}`;
      onChange();
    });
    return card;
  }

  async function progressSection(site) {
    const rows = await Promise.all(SEGMENTS.map(async (seg) => {
      const data = await load(seg.data || seg.page);
      const items = data[seg.list] || [];
      const doneId = data.status_options.at(-1).id;
      const done = items.filter((x) => store.get('status', `${seg.prefix}${x.id}`) === doneId).length;
      return { seg, page: pageOf(site, seg.page), done, total: items.length };
    }));
    const mocks = store.all().quiz.filter((r) => r.kind === 'mock');
    return ui.section('progress', 'Progress', 'Across every section', el('span', {}, 'Where you ', el('em', {}, 'stand')),
      el('div', { class: 'grid-3', style: { marginTop: '1.25rem' } },
        rows.map(({ seg, page, done, total }) => {
          const meter = el('div', { class: 'meter meter-light' }, el('span'));
          meter.firstChild.style.setProperty('--p', total ? done / total : 0);
          return el('a', { class: 'card stack progress-card', href: page.href },
            el('p', { class: 'label' }, page.label),
            el('p', { class: 'progress-num' }, `${done}`, el('span', { class: 'muted' }, ` / ${total}`)),
            el('p', { class: 'muted' }, seg.noun), meter);
        }),
        el('a', { class: 'card stack progress-card', href: 'mock.html' },
          el('p', { class: 'label' }, 'Mock rounds'),
          el('p', { class: 'progress-num' }, String(mocks.length)),
          el('p', { class: 'muted' }, mocks.length ? `Last score ${mocks.at(-1).score} / ${mocks.at(-1).total}` : 'None yet. Aim for 3 before the loop.'))));
  }

  window.Prep.pages.home = async ({ main, loop }) => {
    const [site, behavioral] = await Promise.all([load('site'), load('behavioral')]);
    const allChecks = [...loop.stages.flatMap((s) => s.checklist.map((c) => `loop-${c.id}`)), ...loop.plan.flatMap((d) => d.tasks.map((t) => `plan-${t.id}`))];
    const updateReadout = () => setReadout('Plan and round checklists', allChecks.filter((id) => store.get('checks', id, false)).length, allChecks.length);
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      ui.section('countdown', 'Countdown', 'On-campus loop', el('span', {}, 'The ', el('em', {}, 'date')), heroCard(loop)),
      planSection(loop, site, updateReadout),
      ui.section('rounds', 'Rounds', `${loop.stages.length} stages`, el('span', {}, 'The ', el('em', {}, 'rounds')),
        el('p', { class: 'section-intro' }, loop.structure_note),
        el('div', { class: 'pipeline' }, loop.stages.map((s) => stageCard(s, loop, site, behavioral, updateReadout)))),
      await progressSection(site),
      ui.section('logistics', 'Logistics', 'The day itself', el('span', {}, 'On the ', el('em', {}, 'day')),
        el('div', { class: 'card stack' }, ui.list(loop.logistics)))));
    updateReadout();
  };
})();
