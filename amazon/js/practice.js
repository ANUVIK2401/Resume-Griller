// Pure practice logic shared by the LP randomizer, mock day, rehearsal timers, and loop page.
// No DOM here, so scripts/test_practice.mjs can run it in Node.
(function (root) {
  // Self-score after every mock answer. Ids are stored in quiz history as "missed".
  const RUBRIC = [
    { id: 'star', label: 'STAR complete: situation, task, action, result' },
    { id: 'metric', label: 'Defensible outcome or progress, quantitative when available' },
    { id: 'i-not-we', label: 'Said "I", not "we", for my own actions' },
    { id: 'length', label: 'Spoke for 2 to 4 minutes before follow-ups' },
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
  // Explaining to a non-technical audience is scored on its own terms.
  const EXPLAIN_RUBRIC = [
    { id: 'no-jargon', label: 'No unexplained jargon' },
    { id: 'analogy', label: 'Used an everyday analogy' },
    { id: 'why-care', label: 'Said why it matters to them' },
    { id: 'check-in', label: 'Checked that they followed' },
    { id: 'short', label: 'Kept it under 2 minutes' },
  ];
  const ASK_RUBRIC = [{ id: 'asked', label: 'Asked a thoughtful question of my own' }];
  const KIND_RUBRIC = { design: DESIGN_RUBRIC, tech: TECH_RUBRIC, breadth: TECH_RUBRIC, depth: TECH_RUBRIC, explain: EXPLAIN_RUBRIC, ask: ASK_RUBRIC };
  const rubricFor = (kind) => KIND_RUBRIC[kind] || RUBRIC;

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

  function shuffle(list, rng) {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // A mock day mirrors the real loop: four rounds, each with two LP questions, one breadth,
  // one AI/ML depth, one explain-it-simply question, and the candidate's own questions.
  // The eight named LPs are spread so each appears once; no question repeats within the day.
  // One random round also holds the presentation.
  function pickMockDay(behavioral, domains, focus, rng = Math.random, rounds = 4) {
    const named = shuffle(behavioral.lps.filter((lp) => lp.named).map((lp) => lp.id), rng);
    const byDomain = Object.fromEntries(domains.domains.map((d) => [d.id, d.questions.map((q) => ({ ...q, domain: d.id }))]));
    const used = new Set();
    const take = (pool) => {
      const fresh = shuffle(pool.filter((q) => !used.has(q.id)), rng);
      if (!fresh.length) throw new Error('Not enough questions for a full mock day.');
      used.add(fresh[0].id);
      return fresh[0];
    };
    const breadthPool = [...focus.breadth, ...focus.backup].flatMap((id) => byDomain[id] || []);
    const explainPool = Object.values(byDomain).flat().filter((q) => q.level !== 'deep');
    const talkRound = Math.floor(rng() * rounds);
    return Array.from({ length: rounds }, (_, r) => {
      const lpItems = [0, 1].map((k) => {
        const lp = named[(r * 2 + k) % named.length];
        return { kind: 'lp', id: take(behavioral.question_bank.filter((q) => q.lp === lp)).id };
      });
      const breadth = take(breadthPool);
      const depth = take(byDomain[focus.depth] || []);
      const explain = take(explainPool);
      return [
        ...lpItems,
        { kind: 'breadth', id: breadth.id, domain: breadth.domain },
        { kind: 'depth', id: depth.id, domain: depth.domain },
        { kind: 'explain', id: explain.id, domain: explain.domain },
        ...(r === talkRound ? [{ kind: 'talk', id: 'presentation' }] : []),
        { kind: 'ask', id: 'own-questions' },
      ];
    });
  }

  // Story rehearsal window: under 2:00 is thin, over 4:00 loses the room.
  function windowStatus(seconds, min = 120, max = 240) {
    return seconds < min ? 'short' : seconds > max ? 'long' : 'ok';
  }

  // The scripted section a talk should be in at `seconds`, from each section's target length.
  function sectionAt(seconds, sections) {
    let end = 0;
    for (const section of sections) {
      end += section.seconds;
      if (seconds < end) return section;
    }
    return sections.at(-1);
  }

  // The latest timer warning already reached, or null.
  const warningAt = (seconds, warnings) => [...warnings].sort((a, b) => a.at - b.at).filter((w) => seconds >= w.at).at(-1) || null;

  // checks: { [questionIndex]: Set or array of rubric ids ticked }
  function scoreRound(round, checks) {
    const total = round.reduce((sum, item) => sum + (item.rubric || rubricFor(item.kind)).length, 0);
    const missed = [];
    round.forEach((item, i) => {
      const ticked = new Set(checks[i] || []);
      (item.rubric || rubricFor(item.kind)).forEach((r) => { if (!ticked.has(r.id)) missed.push(`${r.id}-${i + 1}`); });
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

  const api = { RUBRIC, rubricFor, suggestStories, suggestQuestionStories, pickMockDay, windowStatus, sectionAt, warningAt, scoreRound, daysUntil, dayState, validPlanDate };
  if (typeof module !== 'undefined') { module.exports = api; return; }
  root.Prep = root.Prep || {};
  root.Prep.practice = api;
})(typeof window !== 'undefined' ? window : globalThis);
