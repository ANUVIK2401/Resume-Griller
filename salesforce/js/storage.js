// Browser-local progress only. Validate imports before replacing any saved work.
(function () {
  const KEY = 'sfprep:v1';
  const VERSION = 1;
  const MAX_FILE_BYTES = 5 * 1024 * 1024;
  const BUCKETS = ['status', 'notes', 'confidence', 'checks', 'loop'];
  const ID = /^[a-z0-9][a-z0-9_-]{0,159}$/;
  const empty = () => ({ version: VERSION, updated: null, status: {}, notes: {}, confidence: {}, checks: {}, loop: {}, quiz: [] });
  const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const validId = (value) => typeof value === 'string' && ID.test(value) && !['constructor', 'prototype', '__proto__'].includes(value);
  const validDate = (value) => typeof value === 'string' && value.length <= 40 && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
  const copy = (value) => JSON.parse(JSON.stringify(value));
  const invalid = () => { throw new Error('This progress file has invalid data. Import an unmodified export from this site.'); };

  function validEntry(bucket, value) {
    if (bucket === 'status') return typeof value === 'string' && /^[a-z][a-z0-9_-]{0,39}$/.test(value);
    if (bucket === 'notes') return typeof value === 'string' && value.length <= 100000;
    if (bucket === 'confidence') return Number.isInteger(value) && value >= 1 && value <= 5;
    if (bucket === 'checks') return typeof value === 'boolean';
    return record(value) && Object.keys(value).every((key) => ['status', 'date'].includes(key))
      && (value.status === undefined || ['not_started', 'scheduled', 'done', 'passed'].includes(value.status))
      && (value.date === undefined || value.date === null || validDate(value.date));
  }

  function validQuiz(value) {
    return record(value) && Object.keys(value).every((key) => ['at', 'score', 'total', 'missed'].includes(key))
      && validDate(value.at) && Number.isInteger(value.total) && value.total > 0 && value.total <= 10000
      && Number.isInteger(value.score) && value.score >= 0 && value.score <= value.total
      && Array.isArray(value.missed) && value.missed.length <= value.total && value.missed.every(validId);
  }

  function validate(parsed) {
    if (!record(parsed) || parsed.version !== VERSION) invalid();
    if (!Object.keys(parsed).every((key) => ['version', 'updated', 'quiz', ...BUCKETS].includes(key))) invalid();
    if (parsed.updated !== undefined && parsed.updated !== null && !validDate(parsed.updated)) invalid();
    for (const bucket of BUCKETS) {
      if (parsed[bucket] === undefined) continue;
      if (!record(parsed[bucket]) || Object.keys(parsed[bucket]).length > 10000) invalid();
      if (!Object.entries(parsed[bucket]).every(([id, value]) => validId(id) && validEntry(bucket, value))) invalid();
    }
    if (parsed.quiz !== undefined && (!Array.isArray(parsed.quiz) || parsed.quiz.length > 50 || !parsed.quiz.every(validQuiz))) invalid();
    return { ...empty(), ...copy(parsed) };
  }

  let persistent = true;
  let state = empty();
  function readLatest(fallback = state) {
    if (!persistent) return fallback;
    let raw;
    try { raw = localStorage.getItem(KEY); }
    catch (err) { persistent = false; console.warn('Progress storage is blocked:', err); return fallback; }
    try { return raw ? validate(JSON.parse(raw)) : empty(); }
    catch { console.warn('Invalid browser progress ignored. Export a backup before importing.'); return fallback; }
  }
  state = readLatest();
  const listeners = new Set();
  const announce = () => listeners.forEach((fn) => fn(copy(state)));

  function save(next) {
    state = { ...next, updated: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (err) { persistent = false; console.warn('Progress save failed. Export before leaving:', err); }
    announce();
  }

  function get(bucket, id, fallback) {
    const value = Object.hasOwn(state[bucket] || {}, id) ? state[bucket][id] : undefined;
    return value === undefined ? fallback : (typeof value === 'object' ? copy(value) : value);
  }

  function set(bucket, id, value) {
    if (!BUCKETS.includes(bucket) || !validId(id) || (value !== null && value !== undefined && !validEntry(bucket, value))) invalid();
    const latest = readLatest();
    const next = Object.fromEntries(Object.entries(latest[bucket]).filter(([key]) => key !== id));
    save({ ...latest, [bucket]: value === null || value === undefined ? next : { ...next, [id]: copy(value) } });
  }

  function pushQuiz(result) {
    if (!validQuiz(result)) invalid();
    const latest = readLatest();
    save({ ...latest, quiz: [...latest.quiz, copy(result)].slice(-50) });
  }

  function exportFile() {
    state = readLatest();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sfprep-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 0);
  }

  async function importFile(file) {
    if (file.size > MAX_FILE_BYTES) throw new Error('This progress file is too large. Use an export smaller than 5 MB.');
    const raw = await file.text();
    if (raw.length > MAX_FILE_BYTES) throw new Error('This progress file is too large. Use an export smaller than 5 MB.');
    save(validate(JSON.parse(raw)));
  }

  window.addEventListener('storage', (event) => {
    if (event.key !== KEY && event.key !== null) return;
    try { state = event.newValue ? validate(JSON.parse(event.newValue)) : empty(); announce(); }
    catch { console.warn('Invalid progress update from another tab ignored.'); }
  });
  window.Prep = window.Prep || {};
  window.Prep.store = {
    get, set, pushQuiz, exportFile, importFile,
    all: () => copy(state),
    get persistent() { return persistent; },
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
  };
})();
