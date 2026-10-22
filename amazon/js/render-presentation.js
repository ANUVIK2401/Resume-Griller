// Presentation: timed script cues, handout preview, audience Q&A, a 10-minute practice timer
// that names the current section, self-score against the recruiter's six criteria, and saved runs.
(function () {
  const { el, load, ui, store, setReadout, practice } = { ...window.Prep, store: window.Prep.store };
  const MAX_SECONDS = 600;
  const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // Cumulative end time of each section, for the timeline and the script headings.
  const withEnds = (sections) => sections.reduce((out, s) => [...out, { ...s, start: out.at(-1)?.end || 0, end: (out.at(-1)?.end || 0) + s.seconds }], []);

  function timeline(sections) {
    const total = sections.at(-1).end;
    return el('ol', { class: 'talk-line', 'aria-label': 'Section timing' }, sections.map((s) => {
      const li = el('li', { class: 'talk-seg', 'data-section': s.id }, el('span', {}, s.label), el('span', { class: 'muted' }, `${clock(s.start)} to ${clock(s.end)}`));
      li.style.setProperty('--w', s.seconds / total);
      return li;
    }));
  }

  function bars(handout) {
    return el('div', { class: 'bars', role: 'img', 'aria-label': handout.chart_title },
      handout.bars.map((b) => {
        const fill = el('span', { class: `bar-fill bar-${b.id}` });
        fill.style.setProperty('--w', b.ratio);
        return el('div', { class: 'bar-row' },
          el('p', { class: 'bar-label' }, el('strong', {}, b.label), el('span', { class: 'muted' }, ` ${b.bits}`)),
          el('div', { class: 'bar-track' }, fill),
          el('p', { class: 'bar-note' }, b.note));
      }));
  }

  function scriptSection(data, sections) {
    return ui.section('script', 'Script', `${clock(data.target_seconds)} total, five sections`, el('span', {}, 'The ', el('em', {}, 'script')),
      el('p', { class: 'section-intro' }, 'Bullet cues, not an essay: glance, look up, speak. Rewrite each section in your own words in its box; the box saves in this browser.'),
      timeline(sections),
      el('div', { class: 'stack' }, sections.map((s, i) => el('article', { class: 'card stack talk-card', id: `talk-${s.id}` },
        el('div', { class: 'row' }, el('span', { class: 'stage-num' }, String(i + 1)), el('h3', { class: 'h3' }, s.label),
          el('span', { class: 'spacer' }), el('span', { class: 'chip chip-gold' }, `${clock(s.start)} to ${clock(s.end)} · ${clock(s.seconds)}`)),
        el('p', { class: 'muted' }, s.goal),
        ui.list(s.cues),
        el('p', { class: 'say' }, el('b', {}, 'Key line: '), s.say),
        ui.notesBox(`talk-cue-${s.id}`, `${s.label}: my cues`)))));
  }

  function historyTable() {
    const runs = store.all().quiz.filter((r) => r.kind === 'talk');
    if (!runs.length) return el('p', { class: 'muted' }, 'No saved runs yet. Aim for at least six before October 28.');
    return ui.table(['When', 'Length', 'Score'], [...runs].reverse().map((r) => [
      new Date(r.at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      r.seconds === undefined ? '' : clock(r.seconds),
      `${r.score} / ${r.total}`]));
  }

  function practiceSection(data, sections) {
    const now = el('p', { class: 'h3 talk-now', 'aria-live': 'polite' }, 'Press Start, then speak.');
    const warn = el('p', { class: 'notice', hidden: true, role: 'status' });
    const segs = () => document.querySelectorAll('.talk-line [data-section]');
    const watch = ui.stopwatch((s, face, running) => {
      const current = practice.sectionAt(s, sections);
      const w = practice.warningAt(s, data.warnings);
      face.dataset.window = s === 0 ? '' : s < 480 ? 'short' : s <= MAX_SECONDS ? 'ok' : 'long';
      if (s === 0) { now.textContent = 'Press Start, then speak.'; warn.hidden = true; return; }
      now.textContent = s >= data.target_seconds ? `Past the ${clock(data.target_seconds)} target: land the call to action.` : `Now: ${current.label}, until ${clock(current.end)}`;
      warn.hidden = !w;
      if (w) warn.textContent = w.text;
      segs().forEach((n) => n.toggleAttribute('data-now', running && n.dataset.section === current.id));
    });
    const history = el('div', {}, historyTable());
    const checks = new Set();
    const rubric = el('fieldset', { class: 'rubric' }, el('legend', { class: 'label' }, 'Self-score this run'),
      data.rubric.map((r) => el('label', { class: 'check' },
        el('input', { type: 'checkbox', onchange: (e) => (e.target.checked ? checks.add(r.id) : checks.delete(r.id)) }), el('span', {}, r.label))));
    const saved = el('p', { class: 'muted', role: 'status' });
    const save = () => {
      watch.stop();
      const missed = data.rubric.map((r) => r.id).filter((id) => !checks.has(id));
      store.pushQuiz({ at: new Date().toISOString(), kind: 'talk', score: data.rubric.length - missed.length, total: data.rubric.length, missed, seconds: watch.seconds() });
      saved.textContent = `Saved: ${clock(watch.seconds())}, ${data.rubric.length - missed.length} of ${data.rubric.length} criteria.`;
      history.replaceChildren(historyTable());
      updateReadout();
    };
    return ui.section('practice', 'Practice timer', 'Stand up, speak out loud', el('span', {}, 'Timed ', el('em', {}, 'run')),
      el('p', { class: 'section-intro' }, `Target ${clock(data.target_seconds)}. The timer names the section you should be in, warns at 8:00, and tells you to stop at 10:00.`),
      el('div', { class: 'card card-navy stack' }, watch.node, now, warn),
      el('div', { class: 'card stack' }, rubric, el('div', { class: 'row' }, el('button', { class: 'btn btn-gold', type: 'button', onclick: save }, 'Save this run'), saved)),
      el('h3', { class: 'h3' }, 'Saved runs'), history);
  }

  function updateReadout() {
    setReadout('Practice runs saved', Math.min(6, store.all().quiz.filter((r) => r.kind === 'talk').length), 6);
  }

  function handoutSection(data) {
    const h = data.handout;
    return ui.section('handout', 'Handout', 'One printed page', el('span', {}, 'The ', el('em', {}, 'handout')),
      el('p', { class: 'section-intro' }, 'Open the print version, print 5 copies on Letter paper, and check it fits one page. Hand it out at the start of "What is it" and point to the bars.'),
      el('a', { class: 'btn btn-gold', href: 'presentation-handout.html', target: '_blank', rel: 'noopener' }, 'Open the printable handout'),
      el('div', { class: 'card stack' }, el('p', { class: 'h3' }, h.title), el('p', {}, h.analogy), el('p', { class: 'label' }, h.chart_title), bars(h), el('p', { class: 'muted' }, h.chart_note),
        el('p', { class: 'say' }, el('b', {}, 'Call to action: '), h.cta)));
  }

  function qaSection(data) {
    const rehearse = () => ui.rehearse(ui.shuffle(data.qa).map((x) => ({ kicker: 'Audience question', front: () => el('span', {}, x.q), back: () => el('p', {}, ui.fill(x.a)) })), 'Rehearse Q&A');
    return ui.section('qa', 'Q&A', `${data.qa.length} likely questions`, el('span', {}, 'Audience ', el('em', {}, 'questions')),
      el('p', { class: 'section-intro' }, 'Answer in about 30 seconds: the answer, one reason, stop. If you do not know, say what you would measure.'),
      el('div', { class: 'row' }, el('button', { class: 'btn btn-gold', type: 'button', onclick: rehearse }, 'Rehearse Q&A')),
      el('div', { class: 'item-list' }, data.qa.map((x) => el('details', { class: 'item', id: x.id },
        el('summary', {}, el('span', { class: 'item-title' }, x.q)), el('div', { class: 'item-body' }, el('p', {}, ui.fill(x.a)))))));
  }

  function backupSection(b) {
    return ui.section('backup', 'Backup topic', 'If they redirect you', el('span', {}, 'Backup: ', el('em', {}, b.title)),
      el('p', { class: 'section-intro' }, b.note),
      el('div', { class: 'grid-2' }, b.sections.map((s) => el('div', { class: 'card stack' }, el('p', { class: 'label' }, s.label), ui.list(s.cues)))));
  }

  window.Prep.pages.presentation = async ({ main }) => {
    const data = await load('presentation');
    const sections = withEnds(data.sections);
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      ui.section('overview', 'Overview', 'Communication assessment', el('span', {}, data.title, ' ', el('em', {}, data.subtitle)),
        el('div', { class: 'card card-navy stack' }, el('p', {}, el('strong', {}, 'Audience: '), data.audience), ui.list(data.format))),
      scriptSection(data, sections),
      practiceSection(data, sections),
      handoutSection(data),
      qaSection(data),
      backupSection(data.backup)));
    updateReadout();
  };
})();
