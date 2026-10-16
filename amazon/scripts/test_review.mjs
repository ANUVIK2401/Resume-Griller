import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = name => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url)));

test('every existing STAR has an evidence-aware review and a speakable draft', () => {
  const data = read('review');
  const bank = read('behavioral');
  assert.equal(data.stories.length, bank.stories.length);
  assert.deepEqual(data.stories.map(s => s.story_id).sort(), bank.stories.map(s => s.id).sort());
  for (const story of data.stories) {
    assert.ok(['needs-confirmation', 'needs-outcome', 'overlapping-angle'].includes(story.readiness));
    for (const key of ['evidence', 'strengths', 'missing', 'probes', 'delivery']) assert.ok(story[key].length >= 2, `${story.story_id}.${key}`);
    for (const field of ['stakes', 'ownership', 'decision', 'tradeoff', 'measurement']) assert.ok(story.assessment[field].length > 20);
    assert.doesNotMatch(story.draft, /\[(?:confirm|fill):|reported|resume reports|Proposed motivation/i);
    const source = bank.stories.find(item => item.id === story.story_id);
    assert.equal(story.draft, [source.s, source.t, ...source.a, source.r, source.lesson].join(' '));
    assert.ok(story.draft.split(/\s+/).length >= 90, story.story_id);
    assert.match(story.evidence_status, /resume|not independent/i);
  }
  assert.match(data.evidence_policy, /not.*verif|not independently/i);
  assert.match(data.privacy, /browser|local/i);
});

test('assessment exposes the real gaps, overlapping episodes and resume discrepancies', () => {
  const data = read('review');
  const byId = id => data.stories.find(s => s.story_id === id);
  assert.equal(byId('learn-langgraph').episode_id, byId('erp-hitl').episode_id);
  assert.equal(byId('learn-langgraph').readiness, 'overlapping-angle');
  for (const id of ['pacsun-exec', 'trust-hitl']) assert.equal(byId(id).readiness, 'needs-outcome');
  assert.deepEqual(data.gaps.map(g => g.id).sort(), ['disagreement', 'failure', 'mentoring']);
  assert.ok(data.discrepancies.some(d => /May/.test(d.resume) && /Jun/.test(d.previous)));
  assert.ok(data.discrepancies.some(d => /Intern/.test(d.resume) && /volunteer/.test(d.previous)));
  assert.ok(data.discrepancies.some(d => /2022/.test(d.resume) && /2025/.test(d.resume)));
});

test('the bank no longer turns plausible details into personal history', () => {
  const bank = read('behavioral');
  const all = JSON.stringify(bank);
  assert.doesNotMatch(all, /sole engineer|without letting a single record through unchecked|INT8 was never the right choice|40% faster|In volunteer research|Say \\"volunteer research/);
  for (const story of bank.stories) {
    assert.match(story.aws, /^Proposed AWS design/);
    assert.ok(story.evidence_note.length > 30);
  }
  assert.match(bank.stories.find(s => s.id === 'dqn-stall').r, /shorter|reduction/);
  assert.match(bank.stories.find(s => s.id === 'modelscope').r, /2299|2,299/);
  const profile = read('profile');
  assert.equal(profile.experience.find(e => e.id === 'msrcosmos').legal_dates.start, '2026-05');
  assert.equal(profile.experience.find(e => e.id === 'sports').role, 'AI/ML Research Intern');
  assert.match(profile.experience.find(e => e.id === 'oracle').dates_display, /Jul 2022.*Jan 2025/);
});

test('review sources resolve and the page uses safe shared controls for local drafts', () => {
  const data = read('review');
  const ids = new Set(data.sources.map(s => s.id));
  for (const source of data.sources) assert.match(source.url, /^https:\/\/(www\.)?(amazon\.jobs|aboutamazon\.com)\//);
  for (const id of data.guidance_sources) assert.ok(ids.has(id));
  const js = readFileSync(new URL('../js/render-review.js', import.meta.url), 'utf8');
  assert.match(js, /ui\.notesBox\(/);
  assert.match(js, /ui\.timer\(/);
  assert.match(js, /ui\.filterBar\(/);
  assert.doesNotMatch(js, /innerHTML|outerHTML|fetch\(|https:\/\//);
  const html = readFileSync(new URL('../review.html', import.meta.url), 'utf8');
  assert.match(html, /data-page="review"/);
  assert.match(html, /render-review\.js/);
});

// Exercise the renderer with the real shared UI controls and an event-driven DOM stub.
// This verifies filtering, draft loading, no overwrite, and persistence rather than snapshots.
import vm from 'node:vm';
class Events {
  listeners = new Map();
  addEventListener(type, fn) { this.listeners.set(type, [...(this.listeners.get(type) || []), fn]); }
  removeEventListener(type, fn) { this.listeners.set(type, (this.listeners.get(type) || []).filter(value => value !== fn)); }
  dispatchEvent(event) { for (const fn of this.listeners.get(event.type) || []) fn({ ...event, target: this }); }
}
class Element extends Events {
  constructor(tag, attrs = {}, children = []) {
    super(); this.tag = tag; this.attrs = attrs; this.children = []; this.value = ''; this.dataset = {}; this.classList = { toggle() {} };
    for (const [key, value] of Object.entries(attrs)) if (key.startsWith('on')) this.addEventListener(key.slice(2), value);
    this.append(...children);
  }
  append(...items) { this.children.push(...items.flat(Infinity).filter(value => value !== null && value !== undefined && value !== false)); }
  replaceChildren(...items) { this.children = []; this.append(...items); }
  setAttribute(key, value) { this.attrs[key] = value; }
  get textContent() { return this.children.map(value => value instanceof Element ? value.textContent : String(value)).join(''); }
  set textContent(value) { this.children = [String(value)]; }
}
const find = (node, predicate) => node instanceof Element ? [...(predicate(node) ? [node] : []), ...node.children.flatMap(child => find(child, predicate))] : [];
async function renderReview() {
  const writes = new Map();
  const window = new Events(); const document = new Events();
  const main = new Element('main');
  window.Prep = { pages: {}, el: (tag, attrs, ...children) => new Element(tag, attrs, children),
    icon: () => new Element('svg'), load: async name => read(name),
    store: { get: (bucket, key, fallback) => writes.get(`${bucket}:${key}`) ?? fallback, set: (bucket, key, value) => writes.set(`${bucket}:${key}`, value) }, setReadout() {} };
  const context = { window, document, console, Event: class { constructor(type) { this.type = type; } }, navigator: {}, Date, Set, Map,
    setTimeout: () => 1, clearTimeout() {}, setInterval: () => 1, clearInterval() {} };
  for (const file of ['ui.js', 'render-review.js']) vm.runInNewContext(readFileSync(new URL(`../js/${file}`, import.meta.url), 'utf8'), context);
  await window.Prep.pages.review({ main });
  return { main, writes, window };
}
test('review filters preserve the edited draft and load templates without overwriting', async () => {
  const { main, writes, window } = await renderReview();
  const sections = find(main, node => node.tag === 'section');
  const stories = sections.find(node => node.attrs.id === 'story-review');
  assert.equal(find(stories, node => node.tag === 'details' && node.attrs.class === 'item').length, 12);
  const search = find(stories, node => node.attrs.type === 'search')[0];
  const filter = find(stories, node => node.tag === 'select')[0];
  filter.value = 'needs-outcome'; filter.dispatchEvent({ type: 'change' });
  assert.equal(find(stories, node => node.tag === 'details' && node.attrs.class === 'item').length, 2);
  search.value = 'not-a-real-story'; search.dispatchEvent({ type: 'input' });
  assert.match(stories.textContent, /No stories match/);
  filter.value = ''; filter.dispatchEvent({ type: 'change' });
  search.value = 'S1 '; search.dispatchEvent({ type: 'input' });
  const card = find(stories, node => node.attrs.id === 'review-erp-hitl')[0];
  const editor = find(card, node => node.tag === 'textarea')[0];
  const button = find(card, node => node.tag === 'button' && node.textContent.includes('Load answer'))[0];
  button.dispatchEvent({ type: 'click' });
  assert.equal(editor.value, read('review').stories[0].draft);
  editor.dispatchEvent({ type: 'blur' });
  assert.equal(writes.get('notes:review-erp-hitl'), editor.value);
  editor.value = 'My corrected, personally confirmed version'; editor.dispatchEvent({ type: 'input' }); editor.dispatchEvent({ type: 'blur' });
  button.dispatchEvent({ type: 'click' });
  assert.equal(editor.value, 'My corrected, personally confirmed version');
  assert.match(card.textContent, /existing draft is preserved/);
  search.value = 'S2'; search.dispatchEvent({ type: 'input' });
  search.value = 'S1'; search.dispatchEvent({ type: 'input' });
  assert.equal(find(stories, node => node.attrs.id === 'review-erp-hitl')[0], card);
  assert.equal(writes.get('notes:review-erp-hitl'), 'My corrected, personally confirmed version');
  const checkbox = find(card, node => node.attrs.type === 'checkbox')[0];
  checkbox.checked = true; checkbox.dispatchEvent({ type: 'change' });
  assert.equal(writes.get('checks:review-checked-erp-hitl'), true);
  assert.ok(window.Prep.pages.review);
});

test('recruiter-confirmed AWSI-ETP context and audience drills preserve evidence boundaries', () => {
  const review = read('review');
  const bank = read('behavioral');
  assert.match(review.role_context.role, /AWSI-ETP/);
  assert.match(review.role_context.source, /user.supplied recruiter screenshot/i);
  assert.match(review.role_context.success, /customer impact/i);
  assert.match(review.role_context.responsibilities.join(' '), /sales/);
  assert.match(review.role_context.responsibilities.join(' '), /executives/);
  const drill = review.delivery_drills.find(d => d.id === 'audience');
  assert.ok(drill);
  assert.match(drill.steps.join(' '), /90.second/);
  assert.match(drill.steps.join(' '), /30.second/);
  assert.match(drill.steps.join(' '), /3 days.*5\.5 hours/);
  assert.match(drill.steps.join(' '), /confirm.*measurement/i);
  assert.doesNotMatch(bank.pitch.closing_line, /confirm:|Proposed close/);
  assert.match(bank.pitch.beats.find(beat => beat.label === 'Why SA').text, /customer/);
  for (const story of bank.stories) assert.match(story.twist, /engineer|technical audience|executive/i);
});

test('portable review contains the same complete speaking scripts', async () => {
  const { render } = await import('./review_md.mjs');
  assert.equal(readFileSync(new URL('../RESUME-STAR-REVIEW.md', import.meta.url), 'utf8'), render(read('review')));
});
