// Loop page: next-round countdown, the six stages as an editable pipeline, progress across segments.
(function () {
  const { el, load, ui, store, setReadout } = { ...window.Prep, store: window.Prep.store };

  // Where each segment keeps its items and how its status ids are prefixed in storage.
  const SEGMENTS = [
    { page: 'behavioral', list: 'stories', prefix: 'story-', noun: 'stories ready' },
    { page: 'dsa', list: 'problems', prefix: 'dsa-', noun: 'problems solved' },
    { page: 'hld', list: 'problems', prefix: 'hld-', noun: 'designs ready' },
    { page: 'ai', list: 'cards', prefix: 'ai-', noun: 'cards known' },
    { page: 'lld', list: 'problems', prefix: 'lld-', noun: 'designs ready' },
  ];

  const stageState = (s) => ({ status: s.default_status, date: s.default_date, ...store.get('loop', s.id, {}) });
  const saveStage = (s, patch) => store.set('loop', s.id, { ...store.get('loop', s.id, {}), ...patch });
  const fmtDate = (iso) => new Date(iso).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  function countdownText(iso) {
    const ms = new Date(iso) - Date.now();
    if (ms <= 0) return 'now';
    const mins = Math.floor(ms / 60000);
    const d = Math.floor(mins / 1440);
    const h = Math.floor((mins % 1440) / 60);
    const m = mins % 60;
    return d ? `${d}d ${h}h` : `${h}h ${m}m`;
  }

  function nextRound(loop) {
    return loop.stages
      .map((s) => ({ stage: s, ...stageState(s) }))
      .filter((x) => x.status === 'scheduled' && x.date && new Date(x.date) > Date.now())
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  }

  function heroCard(loop, site) {
    const box = el('div', { class: 'card card-navy next-round' });
    const paint = () => {
      const next = nextRound(loop);
      const pending = loop.stages.find((s) => stageState(s).status !== 'passed' && stageState(s).status !== 'done');
      box.replaceChildren(
        el('p', { class: 'label' }, 'Next round'),
        next
          ? el('div', { class: 'stack', style: { gap: '0.4rem' } },
            el('p', { class: 'countdown' }, countdownText(next.date)),
            el('p', { class: 'h3' }, `${next.stage.title}, ${fmtDate(next.date)}`))
          : el('div', { class: 'stack', style: { gap: '0.4rem' } },
            el('p', { class: 'countdown' }, 'No date yet'),
            el('p', { class: 'muted' }, pending ? `${pending.title}: ${pending.note || 'set a date below once it is booked.'}` : 'Every round is done.')),
        pending ? el('div', { class: 'row' }, pending.prep_pages.map((id) => {
          const pg = site.pages.find((p) => p.id === id);
          return el('a', { class: 'btn btn-sm btn-gold', href: pg.href }, `Prep: ${pg.label}`);
        })) : null);
    };
    paint();
    setInterval(paint, 30000);
    document.addEventListener('loopchange', paint);
    return box;
  }

  function stageCard(s, loop, site, onChange) {
    const state = stageState(s);
    const status = el('select', { class: 'field field-sm status', 'aria-label': `${s.title} status` },
      loop.status_options.map((o) => el('option', { value: o.id }, o.label)));
    const tone = (v) => (v === 'passed' ? 'solved' : v === 'scheduled' ? 'review' : v);
    status.value = state.status;
    status.dataset.status = tone(state.status);
    const date = el('input', { class: 'field field-sm', type: 'datetime-local', value: state.date || '', 'aria-label': `${s.title} date and time` });
    const countDone = () => s.checklist.filter((c) => store.get('checks', `loop-${c.id}`, false)).length;
    const checkLabel = el('p', { class: 'label' }, `Checklist ${countDone()} / ${s.checklist.length}`);
    const card = el('article', { class: `stage stage-${state.status}`, 'aria-labelledby': `stage-${s.id}` },
      el('div', { class: 'stage-top' },
        el('span', { class: 'stage-num' }, String(s.order)),
        el('div', { class: 'stack', style: { gap: '0.15rem' } },
          el('h3', { class: 'h3', id: `stage-${s.id}` }, s.title),
          el('p', { class: 'muted stage-meta' }, [s.format, s.duration_min ? `${s.duration_min} min` : null, s.location].filter(Boolean).join(' · ')))),
      el('div', { class: 'row' }, status, date),
      s.note ? el('p', { class: 'stage-note' }, s.note) : null,
      el('div', { class: 'stage-checks' },
        checkLabel,
        s.checklist.map((c) => ui.checkbox(`loop-${c.id}`, c.text))),
      el('div', { class: 'row' }, s.prep_pages.map((id) => {
        const pg = site.pages.find((p) => p.id === id);
        return el('a', { class: 'chip', href: pg.href }, pg.label);
      })));
    // Update in place so keyboard focus stays where it is.
    status.addEventListener('change', () => {
      saveStage(s, { status: status.value });
      status.dataset.status = tone(status.value);
      card.className = `stage stage-${status.value}`;
      onChange();
    });
    date.addEventListener('change', () => { saveStage(s, { date: date.value || null }); onChange(); });
    card.addEventListener('change', (e) => {
      if (e.target.type !== 'checkbox') return;
      checkLabel.textContent = `Checklist ${countDone()} / ${s.checklist.length}`;
      onChange();
    });
    return card;
  }

  async function progressSection(site) {
    const rows = await Promise.all(SEGMENTS.map(async (seg) => {
      const data = await load(seg.page);
      const items = data[seg.list] || [];
      const doneId = data.status_options?.at(-1).id;
      const done = items.filter((x) => store.get('status', `${seg.prefix}${x.id}`) === doneId).length;
      return { seg, page: site.pages.find((p) => p.id === seg.page), done, total: items.length };
    }));
    return ui.section('progress', 'Progress', 'Across every section', el('span', {}, 'Where you ', el('em', {}, 'stand')),
      el('div', { class: 'grid-3', style: { marginTop: '1.25rem' } }, rows.map(({ seg, page, done, total }) => {
        const meter = el('div', { class: 'meter meter-light' }, el('span'));
        meter.firstChild.style.setProperty('--p', total ? done / total : 0);
        return el('a', { class: 'card stack progress-card', href: page.href },
          el('p', { class: 'label' }, page.label),
          el('p', { class: 'progress-num' }, `${done}`, el('span', { class: 'muted' }, ` / ${total}`)),
          el('p', { class: 'muted' }, seg.noun),
          meter);
      })));
  }

  function factsSection(loop) {
    const facts = [
      ['Role', `${loop.req.title}, ${loop.req.company}`],
      ['Req', loop.req.id],
      ['Applied', `${loop.req.applied} via ${loop.req.source.toLowerCase()}`],
      ['Team', `${loop.team.name}. ${loop.team.mission}`],
      ['Urgency', loop.team.urgency],
      ['Contacts', loop.contacts.map((c) => [c.role, c.title].filter(Boolean).join(', ')).join('; ')],
      ['Visa', `${loop.visa.provider}: ${loop.visa.step} (${loop.visa.date})`],
      ['Status', `${loop.status.summary} (as of ${loop.status.as_of})`],
    ];
    return ui.section('process', 'Process', 'The req', el('span', {}, 'The ', el('em', {}, 'process')),
      el('div', { class: 'grid-2', style: { marginTop: '1.25rem' } },
        el('div', { class: 'card v2mom' }, facts.map(([k, v]) => el('div', { class: 'v2mom-row' }, el('p', { class: 'label' }, k), el('p', {}, v)))),
        el('div', { class: 'card stack' }, el('p', { class: 'label' }, 'What the team builds'), ui.list(loop.team.work))));
  }

  window.Prep.pages.home = async ({ main, loop }) => {
    const site = await load('site');
    const pipeline = el('div', { class: 'pipeline' });
    const allChecks = loop.stages.flatMap((s) => s.checklist);
    const updateReadout = () => setReadout('Loop checklist', allChecks.filter((c) => store.get('checks', `loop-${c.id}`, false)).length, allChecks.length);
    const onChange = () => { updateReadout(); document.dispatchEvent(new Event('loopchange')); };
    pipeline.replaceChildren(...loop.stages.map((s) => stageCard(s, loop, site, onChange)));
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      ui.section('next', 'Next round', 'Countdown', el('span', {}, 'Next ', el('em', {}, 'round')), heroCard(loop, site)),
      await window.Prep.delivery.render('delivery'),
      ui.section('experiences', 'Recent reports', 'Learn from other loops', el('span', {}, 'Evidence into ', el('em', {}, 'practice')),
        el('div', { class: 'card stack' },
          el('p', { class: 'h3' }, 'Strong coding still needs a clear story.'),
          el('p', { class: 'muted' }, 'Read seven first-person reports from 2025 and 2026, plus official Salesforce advice. Each source comes with a speaking drill. Filter by level and location to keep your preparation relevant.'),
          el('div', { class: 'row' }, el('a', { class: 'btn btn-gold', href: 'experiences.html' }, 'Explore experiences'), el('a', { class: 'btn', href: 'behavioral.html#stories' }, 'Rehearse your projects')))),
      ui.section('loop', 'The loop', `${loop.stages.length} rounds`, el('span', {}, 'The ', el('em', {}, 'loop')),
        el('p', { class: 'section-intro' }, 'Set status and date as rounds get booked. Everything here saves in this browser.'),
        pipeline),
      await progressSection(site),
      factsSection(loop)));
    updateReadout();
  };
})();
