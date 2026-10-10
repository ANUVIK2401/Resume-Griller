// Shared by the page and content checks. Reports are evidence, not predictions.
(function () {
  const required = ['id', 'title', 'level', 'region', 'role', 'location', 'datePrecision', 'sourceType', 'takeaway', 'rehearsalPrompt', 'caveat'];
  const validDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}(?:-\d{2})?$/.test(value)
    && !Number.isNaN(Date.parse(`${value.length === 7 ? `${value}-01` : value}T12:00:00Z`))
    && new Date(`${value.length === 7 ? `${value}-01` : value}T12:00:00Z`).toISOString().startsWith(value);
  function validate(data) {
    if (!data || !Array.isArray(data.records)) return ['records must be an array'];
    const errors = validDate(data.reviewedAsOf) ? [] : ['reviewedAsOf must be a valid date'];
    const ids = new Set();
    for (const record of data.records) {
      if (!record || typeof record !== 'object') { errors.push('invalid record'); continue; }
      for (const key of required) if (typeof record[key] !== 'string' || !record[key].trim()) errors.push(`${record.id}: missing ${key}`);
      if (ids.has(record.id)) errors.push(`duplicate id: ${record.id}`);
      ids.add(record.id);
      if (!['firsthand', 'official'].includes(record.evidence)) errors.push(`${record.id}: unknown evidence`);
      if (record.interviewDate !== null && !validDate(record.interviewDate)) errors.push(`${record.id}: invalid interview date`);
      try { if (new URL(record.sourceUrl).protocol !== 'https:') throw new Error(); }
      catch { errors.push(`${record.id}: source must use HTTPS`); }
      if (!Array.isArray(record.reportedRounds) || !record.reportedRounds.length || record.reportedRounds.some(x => typeof x !== 'string' || !x.trim())) errors.push(`${record.id}: missing reported rounds`);
    }
    return errors;
  }
  function select(records, filters = {}) {
    return records.filter(record => ['level', 'region', 'evidence'].every(key => !filters[key] || record[key] === filters[key])
      && (!filters.q || JSON.stringify(record).toLowerCase().includes(filters.q.toLowerCase())));
  }
  function dateLabel(date) {
    if (!date) return 'Official guidance';
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', ...(date.length === 10 ? { day: 'numeric' } : {}), timeZone: 'UTC' })
      .format(new Date(`${date.length === 7 ? `${date}-01` : date}T12:00:00Z`));
  }
  const api = { validate, select, dateLabel };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { window.Prep = window.Prep || {}; window.Prep.experiences = api; }
})();
