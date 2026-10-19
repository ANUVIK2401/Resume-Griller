// Pure practice logic shared by the LP randomizer, mock round, and loop page.
// No DOM here, so scripts/test_practice.mjs can run it in Node.
(function (root) {
  // Self-score after every mock answer. Ids are stored in quiz history as "missed".
  const RUBRIC = [
    { id: 'star', label: 'STAR complete: situation, task, action, result' },
    { id: 'metric', label: 'Defensible outcome or progress, quantitative when available' },
    { id: 'i-not-we', label: 'Said "I", not "we", for my own actions' },
    { id: 'under-2', label: 'Finished in under 2 minutes before follow-ups' },
    { id: 'tradeoff', label: 'Explained a personal decision, tradeoff, or learning relevant to the prompt' },
  ];

  const DESIGN_RUBRIC = [
    { id: 'requirements', label: 'Clarified the customer requirements and constraints' },
    { id: 'choice', label: 'Justified the choice and discussed an alternative' },
    { id: 'recovery', label: 'Explained a failure mode and recovery approach' },
    { id: 'security', label: 'Addressed identity, access, and data security' },
    { id: 'cost-next', label: 'Covered cost drivers and a practical next step' },
  ];
  const TECH_RUBRIC = [
    { id: 'direct-answer', label: 'Gave a direct and correct answer' },
    { id: 'mechanism', label: 'Explained how it works, beyond naming the service' },
    { id: 'example', label: 'Used a useful distinction or example' },
    { id: 'scope', label: 'Stated the relevant scope or limitation' },
    { id: 'clarity', label: 'Kept the explanation concise and clear' },
  ];
  const rubricFor = (kind) => kind === 'design' ? DESIGN_RUBRIC : kind === 'tech' ? TECH_RUBRIC : RUBRIC;

  const pick = (list, rng) => list[Math.floor(rng() * list.length)];

  // Primary and backup story for an LP, plus the gap story still to write.
  function suggestStories(lpId, behavioral) {
    const lp = behavioral.lps.find((x) => x.id === lpId);
    if (!lp) return { lp: null, stories: [], gap: null };
    const byId = (id) => behavioral.stories.find((s) => s.id === id);
    const stories = [['primary', lp.primary], ['backup', lp.backup]]
      .filter(([, id]) => id)
      .map(([role, id]) => ({ role, story: byId(id) }))
      .filter((x) => x.story);
    return { lp, stories, gap: lp.gap ? behavioral.gaps.find((g) => g.id === lp.gap) || null : null };
  }

  // These prompts require a specific episode that the current story bank does not
  // establish. Revisit this map only after adding a verified matching episode.
  const QUESTION_GAPS = {
    'rl-wrong': ['failure', 'Failure or mistake'],
    'dr-missed': ['failure', 'Failure or mistake'],
    'hb-manager': ['disagreement', 'Disagreement (Have Backbone)'],
    'hd-grow': ['mentoring', 'Mentoring (Hire and Develop)'],
    'co-no': ['refusal', 'A real customer request you declined'],
    'et-feedback': ['feedback', 'A real difficult-feedback conversation'],
    'hs-refuse': ['refusal', 'A real refusal to accept a quality compromise'],
    'lc-fast': ['learning-specific', 'A real rapid-learning episode and learning sequence'],
    'lc-recent': ['recent-learning', 'A recent learning episode you can date and explain'],
  };

  function suggestQuestionStories(question, behavioral) {
    const suggestion = suggestStories(question.lp, behavioral);
    const missing = QUESTION_GAPS[question.id];
    if (!missing) return suggestion;
    const [id, name] = missing;
    const gap = behavioral.gaps.find((item) => item.id === id) || { id, name };
    return { lp: suggestion.lp, stories: [], gap };
  }

  // Two LP questions on different principles, then one technical item:
  // a rapid-fire question or a whiteboard design, chosen at random.
  // The technical slot is a whiteboard design, an IT fundamentals deep dive (when that bank is
  // passed), or an AWS rapid-fire question, in roughly equal shares.
  function pickMockRound(questions, designs, rng = Math.random, fundamentals = null) {
    const first = pick(questions.lp_questions, rng);
    const others = questions.lp_questions.filter((q) => q.lp !== first.lp);
    const second = pick(others.length ? others : questions.lp_questions.filter((q) => q.id !== first.id), rng);
    const roll = rng();
    const useFundamentals = fundamentals?.items?.length && roll < 1 / 3;
    const useDesign = !useFundamentals && designs.designs.length && roll < (fundamentals?.items?.length ? 2 / 3 : 0.5);
    const tech = useFundamentals ? { kind: 'tech', id: `fund-${pick(fundamentals.items, rng).id}` }
      : useDesign ? { kind: 'design', id: `design-${pick(designs.designs, rng).id}` }
        : { kind: 'tech', id: pick(questions.rapid_fire, rng).id };
    return [{ kind: 'lp', id: first.id }, { kind: 'lp', id: second.id }, tech];
  }

  // checks: { [questionIndex]: Set or array of rubric ids ticked }
  function scoreRound(round, checks) {
    const total = round.reduce((sum, item) => sum + rubricFor(item.kind).length, 0);
    const missed = [];
    round.forEach((item, i) => {
      const ticked = new Set(checks[i] || []);
      rubricFor(item.kind).forEach((r) => { if (!ticked.has(r.id)) missed.push(`${r.id}-${i + 1}`); });
    });
    return { score: total - missed.length, total, missed };
  }

  const PACIFIC = 'America/Los_Angeles';
  const calendarDay = (now) => new Intl.DateTimeFormat('en-CA', {
    timeZone: PACIFIC, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);

  function validPlanDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T12:00:00Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }

  // Date-only arithmetic avoids DST shifts and the browser's local time zone.
  function daysUntil(iso, now = new Date()) {
    const day = typeof iso === 'string' ? iso.slice(0, 10) : '';
    if (!validPlanDate(day)) return null;
    return Math.round((Date.parse(`${day}T12:00:00Z`) - Date.parse(`${calendarDay(now)}T12:00:00Z`)) / 86400000);
  }

  function dayState(date, now = new Date()) {
    const today = calendarDay(now);
    return date < today ? 'past' : date === today ? 'today' : 'future';
  }

  function schedulePlan(plan, start) {
    if (!validPlanDate(start)) throw new Error('Choose a valid plan start date.');
    const epoch = Date.parse(`${start}T12:00:00Z`);
    return plan.map((day, index) => ({ ...day, date: new Date(epoch + index * 86400000).toISOString().slice(0, 10) }));
  }

  const api = { RUBRIC, rubricFor, suggestStories, suggestQuestionStories, pickMockRound, scoreRound, daysUntil, dayState, validPlanDate, schedulePlan };
  if (typeof module !== 'undefined') { module.exports = api; return; }
  root.Prep = root.Prep || {};
  root.Prep.practice = api;
})(typeof window !== 'undefined' ? window : globalThis);
