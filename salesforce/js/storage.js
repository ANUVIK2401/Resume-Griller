// Progress store. One localStorage key holds everything the user changes:
// statuses, notes, confidence, checklist ticks, loop overrides, quiz history.
// Content never lives here; it comes from data/*.json.
(function () {
  const KEY = 'sfprep:v1';
  const VERSION = 1;
  const empty = () => ({ version: VERSION, updated: null, status: {}, notes: {}, confidence: {}, checks: {}, loop: {}, quiz: [] });

  let persistent = true;
  let state = empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...empty(), ...JSON.parse(raw) };
  } catch (err) {
    persistent = false; // private mode or blocked storage: keep working in memory
    console.warn('Progress will not persist:', err);
  }

  const listeners = new Set();

  function save() {
    state = { ...state, updated: new Date().toISOString() };
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      persistent = false;
      console.warn('Progress save failed:', err);
    }
    listeners.forEach((fn) => fn(state));
  }

  // Read one entry from a bucket, e.g. get('status', 'dsa-two-sum', 'todo').
  function get(bucket, id, fallback) {
    const value = state[bucket]?.[id];
    return value === undefined ? fallback : value;
  }

  // Write one entry. null or undefined deletes it.
  function set(bucket, id, value) {
    const next = { ...state[bucket] };
    if (value === null || value === undefined) delete next[id];
    else next[id] = value;
    state = { ...state, [bucket]: next };
    save();
  }

  function pushQuiz(result) {
    state = { ...state, quiz: [...state.quiz, result].slice(-50) };
    save();
  }

  function exportFile() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sfprep-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 0);
  }

  // Replaces all progress with the file's contents. Throws on a file that is not ours.
  async function importFile(file) {
    const parsed = JSON.parse(await file.text());
    if (!parsed || typeof parsed !== 'object' || parsed.version !== VERSION) {
      throw new Error('This file is not a progress export from this site.');
    }
    state = { ...empty(), ...parsed };
    save();
  }

  window.Prep = window.Prep || {};
  window.Prep.store = {
    get, set, pushQuiz, exportFile, importFile,
    all: () => state,
    get persistent() { return persistent; },
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
  };
})();
