// Local rehearsal tools. Source facts stay unchanged; personal drafts use the progress store.
(function () {
  function wordCount(text) {
    const spoken = String(text ?? '').replace(/\[fill:[^\]]*\]/g, '').trim();
    return spoken ? spoken.split(/\s+/).length : 0;
  }

  function placeholderCount(value) {
    if (typeof value === 'string') return (value.match(/\[fill:[^\]]*\]/g) || []).length;
    if (Array.isArray(value)) return value.reduce((total, item) => total + placeholderCount(item), 0);
    if (value && typeof value === 'object') return placeholderCount(Object.values(value));
    return 0;
  }

  function spokenOutline(story) {
    const actions = story.a?.length ? story.a : story.simple;
    return [
      { label: 'Context', text: story.s || '' },
      { label: 'Ownership', text: story.t || '' },
      { label: 'Your actions', text: Array.isArray(actions) ? actions.slice(0, 2).join(' ') : actions || '' },
      { label: 'Result and limits', text: story.r || '' },
    ];
  }

  function rubric(id, checks) {
    const { el, ui } = window.Prep;
    return el('div', { class: 'delivery-rubric stack' },
      el('p', { class: 'label' }, 'Check after speaking'),
      checks.map((text, index) => ui.checkbox(`${id}-${index}`, text)));
  }

  function outline(story) {
    const { el, ui } = window.Prep;
    return el('div', { class: 'delivery-outline stack' },
      el('p', { class: 'label' }, 'Your spoken outline'),
      el('p', { class: 'muted' }, 'Use these existing facts as cues. Choose the two actions that best answer the question.'),
      spokenOutline(story).map((part) => el('div', { class: 'kv' },
        el('p', { class: 'label' }, part.label), el('p', {}, ui.fill(part.text)))));
  }

  function storyPractice(story) {
    const { el, ui } = window.Prep;
    const timer = ui.timer(1.5);
    return el('div', { class: 'delivery-card card stack' },
      el('div', { class: 'row' }, el('p', { class: 'h3' }, '90-second story rehearsal'), timer.node),
      rubric(`delivery-story-${story.id}`, [
        'I answered this question and made my ownership clear.',
        'I explained two decisions and why I made them.',
        'I can defend the result and every number I used.',
        'I finished in 90 seconds and left room for a follow-up.',
      ]));
  }

  async function render(sectionId = 'delivery') {
    const { el, load, ui } = window.Prep;
    const data = await load('delivery');
    const card = (step, index) => el('article', { class: 'delivery-card card stack' },
      el('div', { class: 'row' }, el('span', { class: 'chip chip-gold delivery-step' }, `${index + 1} / ${data.steps.length}`),
        el('span', { class: 'chip' }, `${step.minutes} min practice`)),
      el('h3', { class: 'h3' }, step.title),
      el('p', { class: 'probe-q' }, step.prompt),
      el('div', { class: 'row' }, el('span', { class: 'label' }, `${step.speaking_seconds}-second answer timer`), ui.timer(step.speaking_seconds / 60).node),
      ui.list(step.outline), rubric(`delivery-${step.id}`, step.checks),
      el('p', { class: 'muted' }, step.retry),
      ui.notesBox(`delivery-${step.id}`, `Your ${step.title.toLowerCase()} draft and retry notes`));
    return ui.section(sectionId, 'Delivery practice', '20 minutes, out loud', data.title,
      el('p', { class: 'section-intro' }, data.intro),
      el('p', { class: 'muted' }, 'Timers guide the spoken answer; the four practice budgets total 20 minutes. Notes and checks stay in this browser. No audio is recorded.'),
      el('div', { class: 'delivery-grid' }, data.steps.map(card)));
  }

  window.Prep.delivery = { render, wordCount, placeholderCount, spokenOutline, outline, storyPractice, rubric };
})();
