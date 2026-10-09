// DSA page: a Salesforce-only problem sheet grouped by pattern, plus the interview script and OA simulator.
// Rows with a solution_file expand into insight, approach, tested Python, and notes; the rest link to LeetCode.
(function () {
  const { el, load, loadText, ui, store, setReadout, icon } = { ...window.Prep, store: window.Prep.store };

  const TEST_BLOCK = '\nif __name__ == "__main__":';
  const solutionText = async (p) => (await loadText(p.solution_file)).split(TEST_BLOCK)[0].trimEnd();
  const statusOf = (data, p) => store.get('status', `dsa-${p.id}`, data.status_options[0].id);
  const byFreq = (a, b) => (b.salesforce?.freq || 0) - (a.salesforce?.freq || 0);

  function freqCell(p) {
    if (!p.salesforce) return el('span', { class: 'chip chip-gold' }, 'Reported 2026');
    const bar = el('span', { class: 'freq-bar', 'aria-hidden': 'true' }, el('span'));
    bar.firstChild.style.setProperty('--f', p.salesforce.freq / 100);
    return el('span', { class: 'freq', title: `Salesforce frequency ${p.salesforce.freq} of 100` }, bar, String(Math.round(p.salesforce.freq)));
  }

  function solutionBlock(p) {
    const box = el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Python solution'), el('p', { class: 'muted' }, 'Loading...'));
    solutionText(p)
      .then((code) => box.replaceChildren(el('p', { class: 'label' }, 'Python solution, tested'), ui.codeBlock(code, `${p.id}.py`)))
      .catch((err) => box.replaceChildren(el('p', { class: 'notice is-error' }, `Could not load ${p.solution_file}: ${err.message}`)));
    return box;
  }

  function problemBody(p) {
    return [
      p.prompt ? el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Problem'), el('p', {}, p.prompt)) : null,
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Key insight'), el('p', { class: 'h3' }, p.insight)),
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Approach'), ui.list(p.approach)),
      el('div', { class: 'row' }, el('span', { class: 'chip chip-gold' }, `Time ${p.time}`), el('span', { class: 'chip chip-gold' }, `Space ${p.space}`)),
      el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Edge cases to test'), ui.list(p.edge_cases)),
    ];
  }

  // One spreadsheet row: status, problem, difficulty, frequency, recency, action.
  function rowCells(p, data, onStatus, action) {
    return [
      el('span', { class: 'sheet-status', onclick: (e) => e.stopPropagation() }, ui.statusSelect(`dsa-${p.id}`, data.status_options, onStatus)),
      el('span', { class: 'sheet-title' }, p.title),
      el('span', {}, el('span', { class: `chip diff-${p.difficulty}` }, p.difficulty)),
      el('span', {}, freqCell(p)),
      el('span', {}, p.salesforce?.recent ? el('span', { class: 'chip chip-green' }, p.salesforce.recent) : ''),
      el('span', { class: 'sheet-action' }, action),
    ];
  }

  function sheetRow(p, data, onStatus, withId = true) {
    const lc = p.leetcode ? el('a', { class: 'btn btn-sm', href: p.leetcode, target: '_blank', rel: 'noopener', onclick: (e) => e.stopPropagation() }, 'LeetCode ', icon('external')) : null;
    if (!p.solution_file) return el('div', { class: 'sheet-row', id: withId ? `dsa-${p.id}` : null }, rowCells(p, data, onStatus, lc));
    const body = el('div', { class: 'item-body' });
    const node = el('details', { class: 'sheet-row is-curated', id: withId ? `dsa-${p.id}` : null },
      el('summary', {}, rowCells(p, data, onStatus, el('span', { class: 'row' }, el('span', { class: 'btn btn-sm btn-gold sheet-open' }), lc))),
      body);
    node.addEventListener('toggle', () => {
      if (!node.open || body.childElementCount) return;
      body.append(...problemBody(p).filter(Boolean), solutionBlock(p),
        el('div', { class: 'row' }, ui.confidence(`dsa-${p.id}`)),
        ui.notesBox(`dsa-${p.id}`, 'Your notes: mistakes, the moment it clicked'));
    });
    return node;
  }

  const sheetHead = () => el('div', { class: 'sheet-row sheet-head', 'aria-hidden': 'true' },
    ['Status', 'Problem', 'Level', 'SF freq', 'Asked', ''].map((h) => el('span', {}, h)));

  function cheatCard(pattern) {
    return el('details', { class: 'card card-navy cheat' },
      el('summary', { class: 'row' }, el('span', { class: 'label' }, 'Pattern cheat card'), el('span', { class: 'spacer' }), el('span', { class: 'chip chip-gold cheat-toggle' })),
      el('div', { class: 'grid-2', style: { marginTop: '1rem' } },
        el('div', { class: 'stack' },
          el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Reach for it when'), ui.list(pattern.signals)),
          el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Pitfalls'), ui.list(pattern.pitfalls))),
        ui.codeBlock(pattern.template, 'template')));
  }

  function scriptSection(data) {
    return ui.section('script', 'Interview script', 'Live coding', el('span', {}, 'Say this, in ', el('em', {}, 'this order')),
      el('div', { class: 'card card-navy' },
        el('div', { class: 'steps' }, data.script.map((s) => el('div', { class: 'step' },
          el('div', { class: 'stack', style: { gap: '0.25rem' } }, el('p', { class: 'h3' }, s.step), el('p', { class: 'muted' }, s.say)),
          el('span', { class: 'step-min' }, `${s.minutes} min`))))),
      el('p', { class: 'section-intro' }, 'Pattern deep dives live on your DSA Patterns site: ',
        el('a', { href: data.dsa_patterns_site, target: '_blank', rel: 'noopener' }, 'ANUVIK2401.github.io/DSA_Patterns'), '.'));
  }

  function timedSection(data) {
    const chosen = new Set(data.patterns.slice(0, 7).map((p) => p.id));
    const stage = el('div', { class: 'stack' });
    const setup = () => stage.replaceChildren(
      el('p', { class: 'muted' }, `${data.timed.count} random Salesforce problems from the patterns you pick, ${data.timed.minutes} minutes, solutions hidden until you finish.`),
      el('div', { class: 'row' }, data.patterns.map((p) => el('label', { class: 'check check-pill' },
        el('input', { type: 'checkbox', checked: chosen.has(p.id), onchange: (e) => (e.target.checked ? chosen.add(p.id) : chosen.delete(p.id)) }),
        el('span', {}, p.name)))),
      el('div', { class: 'row' }, el('button', { class: 'btn btn-gold', type: 'button', onclick: start }, `Start ${data.timed.minutes}-minute OA`)));

    function start() {
      const pool = data.problems.filter((p) => chosen.has(p.pattern));
      if (pool.length < data.timed.count) return;
      const picks = ui.shuffle(pool).slice(0, data.timed.count);
      const answers = el('div', { class: 'sheet' });
      const finish = () => {
        t.stop();
        answers.replaceChildren(sheetHead(), ...picks.map((p) => sheetRow(p, data, null, false)));
        done.disabled = true;
      };
      const t = ui.timer(data.timed.minutes, finish);
      const done = el('button', { class: 'btn btn-gold', type: 'button', onclick: finish }, 'Finish and reveal');
      stage.replaceChildren(
        el('div', { class: 'row' }, t.node, el('span', { class: 'spacer' }), done, el('button', { class: 'btn', type: 'button', onclick: () => { t.stop(); setup(); } }, 'Quit')),
        ...picks.map((p, i) => el('div', { class: 'card stack' },
          el('p', { class: 'label' }, `Problem ${i + 1}`),
          el('p', { class: 'h3' }, p.title),
          p.prompt ? el('p', {}, p.prompt) : el('a', { href: p.leetcode, target: '_blank', rel: 'noopener' }, 'Open on LeetCode'))),
        answers);
      t.start();
    }
    setup();
    return ui.section('timed', 'OA simulator', 'Timed mode', el('span', {}, 'HackerRank ', el('em', {}, 'simulator')), el('div', { class: 'card' }, stage));
  }

  window.Prep.pages.dsa = async ({ main }) => {
    const data = await load('dsa');
    const solvedId = data.status_options.at(-1).id;
    const updateReadout = () => setReadout('Solved', data.problems.filter((p) => statusOf(data, p) === solvedId).length, data.problems.length);
    const rows = new Map(data.problems.map((p) => [p.id, sheetRow(p, data, updateReadout)]));

    const groups = data.patterns.map((pat) => ({
      pat,
      items: data.problems.filter((p) => p.pattern === pat.id).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || byFreq(a, b)),
      sheet: el('div', { class: 'sheet' }),
      count: el('span', { class: 'chip' }),
    }));

    let filtered = data.problems;
    const apply = (f) => {
      const keep = (p) => (!f.q || `${p.title} ${p.insight || ''} ${(p.topics || []).join(' ')}`.toLowerCase().includes(f.q))
        && (!f.difficulty || p.difficulty === f.difficulty)
        && (!f.status || statusOf(data, p) === f.status)
        && (!f.solved || p.solution_file)
        && (!f.recent || p.salesforce?.recent || p.reported);
      filtered = data.problems.filter(keep);
      for (const g of groups) {
        const shown = g.items.filter(keep);
        g.sheet.replaceChildren(sheetHead(), ...shown.map((p) => rows.get(p.id)));
        g.count.textContent = `${shown.length} of ${g.items.length}`;
        g.sheet.closest('section').hidden = shown.length === 0;
      }
    };
    const bar = ui.filterBar({
      placeholder: 'Search problems or topics',
      selects: [
        { key: 'difficulty', label: 'Any difficulty', options: ['easy', 'medium', 'hard'].map((d) => ({ id: d, label: d[0].toUpperCase() + d.slice(1) })) },
        { key: 'status', label: 'Any status', options: data.status_options },
      ],
      toggles: [{ key: 'recent', label: 'Asked in last 6 months' }, { key: 'solved', label: 'Has my solution' }],
      onChange: apply,
    });
    const rehearse = () => ui.rehearse(ui.shuffle(filtered.filter((p) => p.insight)).map((p) => ({
      kicker: data.patterns.find((x) => x.id === p.pattern).name,
      front: () => el('span', {}, p.title),
      back: () => el('div', { class: 'stack' }, problemBody(p)),
    })), 'Rehearse problems');

    const solvedCount = data.problems.filter((p) => p.solution_file).length;
    main.replaceChildren(el('div', { class: 'wrap stack', style: { gap: 'var(--section)' } },
      el('div', { class: 'card stack', id: 'sheet-top' },
        el('p', {}, el('strong', {}, `${data.problems.length} Salesforce problems, ${solvedCount} with tested solutions. `),
          el('span', { class: 'muted' }, data.source.note), ' ',
          el('a', { href: data.source.url, target: '_blank', rel: 'noopener' }, 'Source')),
        bar,
        el('div', { class: 'row' }, el('button', { class: 'btn btn-gold', type: 'button', onclick: rehearse }, 'Rehearse problems with solutions'))),
      ...groups.map(({ pat, items, sheet, count }) => ui.section(`p-${pat.id}`, `${pat.name} (${items.length})`, 'Pattern',
        el('span', { class: 'row', style: { gap: '0.75rem' } }, pat.name, count),
        cheatCard(pat), sheet)),
      scriptSection(data),
      timedSection(data)));
    apply({ q: '' });
    updateReadout();
  };
})();
