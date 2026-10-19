// Two-week plan, user-confirmed interview details, and practice scenarios.
(function () {
  const { el, load, ui, store, setReadout, practice } = { ...window.Prep, store: window.Prep.store };

  // Where each segment keeps its items and how its status ids are prefixed in storage.
  const SEGMENTS = [
    { page: 'behavioral', list: 'stories', prefix: 'story-', noun: 'stories ready' },
    { page: 'aws', list: 'services', prefix: 'aws-', noun: 'AWS terms known' },
    { page: 'design', data: 'designs', list: 'designs', prefix: 'design-', noun: 'designs ready' },
    { page: 'top', list: 'questions', prefix: 'top-', noun: 'top questions ready' },
    { page: 'questions', list: 'rapid_fire', prefix: 'q-', noun: 'rapid-fire known' },
  ];

  const pacificToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const fmtDate = (iso) => `${iso.slice(0, 10)} at ${iso.slice(11, 16)} Pacific Time`;
  const fmtDay = (ymd) => new Date(`${ymd}T12:00:00Z`).toLocaleDateString(undefined, { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const eventDate = (loop) => store.get('loop', 'interview-event', {}).date || loop.event.date;
  const planStart = (loop) => {
    const saved = store.get('notes', 'plan-start-date', loop.plan_start);
    return practice.validPlanDate(saved) ? saved : loop.plan_start;
  };
  const pageOf = (site, id) => site.pages.find((p) => p.id === id);

  function recruitingContext(loop) {
    const context = loop.recruiting_context;
    return el('details', { class: 'card stack', id: 'recruiting-context' },
      el('summary', {}, 'Recruiting context and older email notes'),
      el('p', {}, context.assessment.title),
      el('p', {}, context.assessment.detail),
      el('p', {}, context.hold.title),
      el('p', {}, context.hold.detail),
      el('p', {}, context.interview_conditions),
      el('p', {}, el('strong', {}, 'Older email clarification: '), context.timing_conflict),
      ui.list(context.pending),
      el('p', {}, context.role.locations),
      el('p', {}, `Planned cohort starts: ${context.role.cohort_starts.join(' or ')}.`),
      el('p', { class: 'muted' }, context.role.cohort_note),
      ui.list(context.role.focus),
      el('p', {}, context.role.success),
      el('p', { class: 'muted' }, context.plan_relationship));
  }

  function sprintSection(loop, site, onChange) {
    const sprint = loop.sprint;
    const schedule = el('div', { class: 'stack' });
    let displayedDay;
    const paint = () => {
      displayedDay = pacificToday();
      const active = sprint.days.find((day) => practice.dayState(day.date) === 'today');
      schedule.replaceChildren(
        active ? el('a', { class: 'btn btn-gold', href: `#sprint-${active.id}` }, `Start today: ${active.focus}`) : null,
        el('div', { class: 'plan-grid' }, sprint.days.map((day) => {
          const state = practice.dayState(day.date);
          const countDone = () => day.tasks.filter((task) => store.get('checks', `sprint-${task.id}`, false)).length;
          const count = el('span', { class: 'chip' }, `${countDone()} / ${day.tasks.length}`);
          const card = el('article', { class: `sprint-day plan-day plan-${state}`, id: `sprint-${day.id}` },
            el('div', { class: 'row' }, el('p', { class: 'plan-date' }, fmtDay(day.date)),
              state === 'today' ? el('span', { class: 'chip chip-gold' }, 'Today') : null, count),
            el('h3', { class: 'h3' }, day.focus),
            el('p', { class: 'muted' }, day.id === 'sp12' ? '90-minute taper; extensions optional, rest first' : '90-minute minimum; about 3 hours full path'),
            el('div', { class: 'stage-checks' }, day.tasks.map((task) => {
              const page = pageOf(site, task.page);
              return el('div', { class: 'plan-task' }, ui.checkbox(`sprint-${task.id}`, `${task.minimum ? 'Minimum' : 'Extension'} · ${task.minutes} min: ${task.text}`),
                page ? el('a', { class: 'chip', href: page.href }, page.label) : null);
            })),
            el('p', {}, el('strong', {}, 'Deliverable: '), day.deliverable),
            el('p', {}, el('strong', {}, 'Readiness gate: '), day.readiness_gate));
          card.addEventListener('change', () => { count.textContent = `${countDone()} / ${day.tasks.length}`; onChange(); });
          return card;
        })));
    };
    paint();
    setInterval(() => { if (pacificToday() !== displayedDay) paint(); }, 60000);
    return ui.section('sprint', '12-day sprint', 'October 16-27 preparation', el('span', {}, 'Your focused ', el('em', {}, 'sprint')),
      el('p', { class: 'section-intro' }, sprint.note),
      el('a', { class: 'btn', href: 'FINAL-PREP.md', download: 'FINAL-PREP.md' }, 'Download the final preparation card'),
      el('p', {}, sprint.story_strategy),
      el('p', { class: 'muted' }, sprint.gap_policy), schedule,
      el('article', { class: 'card stack', id: 'interview-day' },
        el('h3', { class: 'h3' }, `${sprint.interview_day.title}: ${fmtDay(sprint.interview_day.date)}`),
        el('p', {}, sprint.interview_day.note),
        sprint.interview_day.tasks.map((task) => ui.checkbox(`sprint-${task.id}`, task.text))));
  }

  function heroCard(loop) {
    const date = el('input', { class: 'field field-sm', type: 'datetime-local', value: eventDate(loop), 'aria-label': 'Interview date and start time in Pacific Time' });
    const confirmed = ui.checkbox('interview-confirmed', 'Date and time confirmed with the recruiter');
    const face = el('div', { class: 'stack', style: { gap: '0.4rem' }, 'aria-live': 'polite' });
    const paint = () => {
      const iso = eventDate(loop);
      const days = practice.daysUntil(iso || loop.event.target_date);
      const isConfirmed = !!iso && store.get('checks', 'interview-confirmed', false);
      face.replaceChildren(
        el('p', { class: 'countdown' }, days === null ? 'Date unconfirmed' : days > 1 ? `${days} days${iso ? '' : ' to tentative target'}` : days === 1 ? 'Tomorrow' : days === 0 ? 'Today' : 'Date has passed'),
        el('p', { class: 'h3' }, iso ? `Interview: ${fmtDate(iso)}` : `Tentative: ${fmtDay(loop.event.target_date)} on campus at USC`),
        el('div', { class: 'row' },
          el('span', { class: `chip ${isConfirmed ? 'chip-green' : 'chip-red'}` }, isConfirmed ? 'Confirmed by you' : 'Pending confirmation'),
          el('span', { class: 'chip' }, loop.event.location)),
        el('a', { class: 'btn btn-gold', href: '#sprint' }, 'Start today’s essentials'));
    };
    date.addEventListener('change', () => {
      if (date.value && (!date.validity.valid || !practice.validPlanDate(date.value.slice(0, 10)))) return;
      store.set('loop', 'interview-event', date.value ? { date: date.value } : null);
      store.set('checks', 'interview-confirmed', null);
      confirmed.querySelector('input').checked = false;
      paint();
    });
    confirmed.addEventListener('change', paint);
    paint();
    setInterval(paint, 60000);
    return el('div', { class: 'card card-navy next-round' },
      el('p', { class: 'label' }, 'Latest target: tentative Wednesday October 28'), face,
      el('details', {}, el('summary', {}, 'Set recruiter-confirmed date and time'),
        el('p', { class: 'muted' }, loop.event.note),
        el('p', { class: 'muted' }, 'Changing the interview date does not move the study plan. The sprint stays October 16-27; the original movable plan retains its saved dates below.'),
        el('label', { class: 'stack' }, 'Interview date and time (Pacific Time)', date), confirmed));
  }

  function planSection(loop, site, onChange) {
    const start = el('input', { class: 'field field-sm', type: 'date', value: planStart(loop), 'aria-label': '14-day study plan start date' });
    const schedule = el('div', { class: 'stack' });
    let displayedDay;
    const paint = () => {
      displayedDay = pacificToday();
      const plan = practice.schedulePlan(loop.plan, planStart(loop));
      const today = plan.find((d) => practice.dayState(d.date) === 'today');
      schedule.replaceChildren(
        el('p', { class: 'muted' }, `${fmtDay(plan[0].date)} to ${fmtDay(plan.at(-1).date)}. Day labels and Today use Pacific Time (America/Los_Angeles). Checkmarks stay with their task when dates move.`),
        today ? el('a', { class: 'btn btn-gold', href: `#day-${today.id}` }, `Jump to today: ${today.focus}`) : null,
        el('div', { class: 'plan-grid' }, plan.map((day, index) => {
          const state = practice.dayState(day.date);
          const done = () => day.tasks.filter((t) => store.get('checks', `plan-${t.id}`, false)).length;
          const count = el('span', { class: 'chip' }, `${done()} / ${day.tasks.length}`);
          const card = el('article', { class: `plan-day plan-${state}`, id: `day-${day.id}` },
            el('div', { class: 'row' }, el('p', { class: 'plan-date' }, `Day ${index + 1}: ${fmtDay(day.date)}`),
              state === 'today' ? el('span', { class: 'chip chip-gold' }, 'Today') : null,
              el('span', { class: 'spacer' }), count),
            el('p', { class: 'h3' }, day.focus),
            el('p', { class: 'muted' }, '180 minutes full plan; 90 minutes minimum'),
            el('div', { class: 'stage-checks' }, day.tasks.map((t) => {
              const page = t.page && pageOf(site, t.page);
              return el('div', { class: 'plan-task' }, ui.checkbox(`plan-${t.id}`, `${t.minimum ? 'Minimum' : 'Extension'} · ${t.minutes} min: ${t.text}`),
                page ? el('a', { class: 'chip', href: page.href }, page.label) : null);
            })),
            el('p', {}, el('strong', {}, 'Deliverable: '), day.deliverable),
            el('p', {}, el('strong', {}, 'Readiness gate: '), day.readiness_gate));
          card.addEventListener('change', () => { count.textContent = `${done()} / ${day.tasks.length}`; onChange(); });
          return card;
        })));
    };
    start.addEventListener('change', () => {
      if (!practice.validPlanDate(start.value)) { start.setCustomValidity('Choose a valid start date.'); start.reportValidity(); return; }
      start.setCustomValidity('');
      store.set('notes', 'plan-start-date', start.value);
      paint();
    });
    start.addEventListener('input', () => start.setCustomValidity(''));
    paint();
    setInterval(() => { if (pacificToday() !== displayedDay) paint(); }, 60000);
    return ui.section('plan', 'Daily plan', '14 days, adjustable start', el('span', {}, 'The ', el('em', {}, 'plan')),
      el('p', { class: 'section-intro' }, loop.plan_note),
      el('label', { class: 'stack' }, 'Study plan start date (saved in this browser)', start),
      el('p', { class: 'muted' }, 'The plan stays at this start date on future visits. Entering an interview date above does not reschedule it. Move the start deliberately if your availability changes.'),
      el('div', { class: 'row' }, ['cheatsheet', 'review'].map((id) => pageOf(site, id)).filter(Boolean).map((p) => el('a', { class: 'chip', href: p.href }, p.label))), schedule);
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
    const leads = s.lead_stories.map((id) => behavioral.stories.find((x) => x.id === id)).filter(Boolean);
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
          el('p', { class: 'muted' }, mocks.length ? `Last score ${mocks.at(-1).score} / ${mocks.at(-1).total}` : 'None yet. Aim for three practice sessions across the plan.'))));
  }

  window.Prep.pages.home = async ({ main, loop }) => {
    const [site, behavioral] = await Promise.all([load('site'), load('behavioral')]);
    const sprintChecks = [...loop.sprint.days.flatMap((day) => day.tasks.filter((task) => task.minimum).map((task) => `sprint-${task.id}`)), ...loop.sprint.interview_day.tasks.map((task) => `sprint-${task.id}`)];
    const updateReadout = () => setReadout('Sprint essentials', sprintChecks.filter((id) => store.get('checks', id, false)).length, sprintChecks.length);
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      ui.section('countdown', 'Interview details', 'Tentative date-only target', el('span', {}, 'The ', el('em', {}, 'date')), heroCard(loop)),
      sprintSection(loop, site, updateReadout),
      recruitingContext(loop),
      el('details', { class: 'card', id: 'extended-plan' }, el('summary', {}, 'Original adjustable 14-day plan (saved progress retained)'), planSection(loop, site, updateReadout)),
      ui.section('rounds', 'Practice scenarios', `${loop.stages.length} practice scenarios`, el('span', {}, 'Skills to ', el('em', {}, 'rehearse')),
        el('p', { class: 'section-intro' }, loop.structure_note),
        el('div', { class: 'pipeline' }, loop.stages.map((s) => stageCard(s, loop, site, behavioral, updateReadout)))),
      await progressSection(site),
      ui.section('logistics', 'Logistics', 'The day itself', el('span', {}, 'Prepare the ', el('em', {}, 'logistics')),
        el('div', { class: 'card stack' }, ui.list(loop.logistics)))));
    updateReadout();
  };
})();
