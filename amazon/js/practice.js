// Pure practice logic shared by the LP randomizer, mock round, and loop page.
// No DOM here, so scripts/test_practice.mjs can run it in Node.
(function (root) {
  // Self-score after every mock answer. Ids are stored in quiz history as "missed".
  const RUBRIC = [
    { id: 'star', label: 'STAR complete: situation, task, action, result' },
    { id: 'metric', label: 'A metric stated, and I could defend it' },
    { id: 'i-not-we', label: 'Said "I", not "we", for my own actions' },
    { id: 'under-2', label: 'Finished in under 2 minutes before follow-ups' },
    { id: 'tradeoff', label: 'Named a tradeoff or the alternative I rejected' },
  ];

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

  // Two LP questions on different principles, then one technical item:
  // a rapid-fire question or a whiteboard design, chosen at random.
  function pickMockRound(questions, designs, rng = Math.random) {
    const first = pick(questions.lp_questions, rng);
    const others = questions.lp_questions.filter((q) => q.lp !== first.lp);
    const second = pick(others.length ? others : questions.lp_questions.filter((q) => q.id !== first.id), rng);
    const useDesign = designs.designs.length && rng() < 0.5;
    const tech = useDesign
      ? { kind: 'design', id: `design-${pick(designs.designs, rng).id}` }
      : { kind: 'tech', id: pick(questions.rapid_fire, rng).id };
    return [{ kind: 'lp', id: first.id }, { kind: 'lp', id: second.id }, tech];
  }

  // checks: { [questionIndex]: Set or array of rubric ids ticked }
  function scoreRound(round, checks) {
    const total = round.length * RUBRIC.length;
    const missed = [];
    round.forEach((item, i) => {
      const ticked = new Set(checks[i] || []);
      RUBRIC.forEach((r) => { if (!ticked.has(r.id)) missed.push(`${r.id}-${i + 1}`); });
    });
    return { score: total - missed.length, total, missed };
  }

  // Whole days from now until the start of the target day, in local time.
  function daysUntil(iso, now = new Date()) {
    const target = new Date(iso);
    const startOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    return Math.round((startOf(target) - startOf(now)) / 86400000);
  }

  // "YYYY-MM-DD" compared with today's local date.
  function dayState(date, now = new Date()) {
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return date < today ? 'past' : date === today ? 'today' : 'future';
  }

  const api = { RUBRIC, suggestStories, pickMockRound, scoreRound, daysUntil, dayState };
  if (typeof module !== 'undefined') { module.exports = api; return; }
  root.Prep = root.Prep || {};
  root.Prep.practice = api;
})(typeof window !== 'undefined' ? window : globalThis);
