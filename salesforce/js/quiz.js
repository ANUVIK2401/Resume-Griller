// Rapid-fire numbers quiz. Questions come from profile.json "numbers".
// parse() and isCorrect() are pure so scripts/check.mjs can test them in Node.
(function (root) {
  // "37,000+" -> 37000, "4.2M rows" -> 4200000, "72%" -> 72, ".923" -> 0.923
  function parse(raw) {
    const s = String(raw).toLowerCase().replace(/,/g, '').trim();
    const m = s.match(/[-+]?\d*\.?\d+/);
    if (!m) return null;
    let n = parseFloat(m[0]);
    const rest = s.slice(m.index + m[0].length).trim();
    if (/^k(?![a-z])/.test(rest)) n *= 1e3;
    else if (/^(m(?![a-z])|million)/.test(rest)) n *= 1e6;
    return n;
  }

  const squash = (s) => String(s).toLowerCase().replace(/[\s,]+/g, '');

  function isCorrect(item, raw) {
    if (!String(raw).trim()) return false;
    if ((item.accept || []).some((a) => squash(a) === squash(raw))) return true;
    const n = parse(raw);
    const want = Number(item.a);
    return n !== null && Math.abs(n - want) <= 1e-9 * Math.max(1, Math.abs(want));
  }

  if (typeof module !== 'undefined') { module.exports = { parse, isCorrect }; return; }

  const { el, ui, store } = root.Prep;

  function mount(profile) {
    const groups = profile.number_groups;
    const chosen = new Set(groups.map((g) => g.id));
    const box = el('div', { class: 'quiz card' });

    function setup() {
      const last = store.all().quiz.at(-1);
      box.replaceChildren(
        el('p', { class: 'muted' }, `${profile.numbers.length} numbers from your resume. Type the number; units, commas, k and M are fine.`),
        el('div', { class: 'row' }, groups.map((g) => el('label', { class: 'check check-pill' },
          el('input', { type: 'checkbox', checked: chosen.has(g.id), onchange: (e) => (e.target.checked ? chosen.add(g.id) : chosen.delete(g.id)) }),
          el('span', {}, g.label)))),
        el('div', { class: 'row' },
          el('button', { class: 'btn btn-gold', type: 'button', onclick: () => run(10) }, 'Quick 10'),
          el('button', { class: 'btn', type: 'button', onclick: () => run(Infinity) }, 'All numbers'),
          last ? el('span', { class: 'muted label' }, `Last: ${last.score} / ${last.total}`) : null));
    }

    function run(limit, pool) {
      const items = pool || ui.shuffle(profile.numbers.filter((n) => chosen.has(n.group))).slice(0, limit);
      if (!items.length) return;
      const missed = [];
      let i = 0;
      let answered = false;
      const q = el('p', { class: 'quiz-q', 'aria-live': 'polite' });
      const count = el('span', { class: 'label' });
      const input = el('input', { class: 'field', type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': 'Your answer' });
      const feedback = el('p', { class: 'quiz-feedback', 'aria-live': 'polite' });
      const submit = el('button', { class: 'btn btn-gold', type: 'submit' }, 'Check');
      const form = el('form', { class: 'quiz-form' }, input, submit);

      const paint = () => {
        count.textContent = `${i + 1} / ${items.length}`;
        q.textContent = items[i].q;
        input.value = '';
        feedback.textContent = '';
        feedback.className = 'quiz-feedback';
        submit.textContent = 'Check';
        answered = false;
        input.focus();
      };
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (answered) {
          i += 1;
          if (i < items.length) paint(); else finish(items, missed);
          return;
        }
        const item = items[i];
        const ok = isCorrect(item, input.value);
        if (!ok) missed.push(item);
        feedback.className = `quiz-feedback ${ok ? 'is-right' : 'is-wrong'}`;
        feedback.textContent = `${ok ? 'Right.' : `No: ${item.a}${item.unit && item.unit !== '+' ? ` ${item.unit}` : ''}.`} ${item.fact}.`;
        submit.textContent = i + 1 < items.length ? 'Next' : 'Finish';
        answered = true;
      });
      box.replaceChildren(el('div', { class: 'row' }, count, el('span', { class: 'spacer' }),
        el('button', { class: 'btn btn-sm', type: 'button', onclick: setup }, 'Stop')), q, form, feedback);
      paint();
    }

    function finish(items, missed) {
      const score = items.length - missed.length;
      store.pushQuiz({ at: new Date().toISOString(), score, total: items.length, missed: missed.map((m) => m.id) });
      box.replaceChildren(
        el('p', { class: 'score' }, `${score} / ${items.length}`),
        missed.length
          ? el('div', { class: 'kv' }, el('p', { class: 'label' }, 'Missed'), ui.list(missed.map((m) => `${m.fact}.`)))
          : el('p', { class: 'muted' }, 'Clean run.'),
        el('div', { class: 'row' },
          missed.length ? el('button', { class: 'btn btn-gold', type: 'button', onclick: () => run(Infinity, ui.shuffle(missed)) }, 'Retry missed') : null,
          el('button', { class: 'btn', type: 'button', onclick: setup }, 'New round')));
    }

    setup();
    return box;
  }

  root.Prep.quiz = { mount, parse, isCorrect };
})(typeof window !== 'undefined' ? window : globalThis);
