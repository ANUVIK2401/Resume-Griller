import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const data = () => JSON.parse(readFileSync(new URL('../data/behavioral.json', import.meta.url)));
const core = story => [story.headline, story.s, story.t, ...story.a, story.r, story.lesson].join(' ');
const scaffolding = /\[(?:confirm|fill):|Proposed motivation|Proposed close|\breported\b|\bthe resume\b|\bconfirm:|\bfill:/i;

test('all twelve STAR cores are complete speaking scripts without editorial prompts', () => {
  const bank = data();
  assert.equal(bank.stories.length, 12);
  for (const story of bank.stories) {
    const speech = core(story);
    assert.doesNotMatch(speech, scaffolding, story.id);
    const words = speech.split(/\s+/).length;
    assert.ok(words >= 140 && words <= 210, `${story.id}: ${words} words`);
    assert.ok(story.a.length >= 2, `${story.id} has a real action sequence`);
    for (const probe of story.probes) {
      assert.doesNotMatch(probe.a, scaffolding, `${story.id}: ${probe.q}`);
      assert.ok(probe.a.length > 45, `${story.id}: incomplete probe answer`);
    }
  }
  const pitch = [...bank.pitch.beats.map(beat => beat.text), bank.pitch.closing_line].join(' ');
  assert.doesNotMatch(pitch, scaffolding);
  assert.match(pitch, /customer/);
  assert.match(pitch, /engineer|technical/);
});

test('speaking scripts retain measured outcomes and distinguish research from customer production', () => {
  const bank = data();
  const story = id => bank.stories.find(s => s.id === id);
  for (const metric of ['12', '10,000', '68%', '83%', '3 days', '5.5 hours']) assert.ok(core(story('erp-hitl')).includes(metric), metric);
  assert.match(core(story('p1-mttr')), /94.*26/);
  assert.match(core(story('k8s-autoscaling')), /OCI/);
  assert.match(core(story('dqn-stall')), /52.*31/);
  assert.doesNotMatch(core(story('dqn-stall')), /40% faster|quality.*because.*faster/i);
  assert.equal(story('pacsun-exec').ongoing, true);
  assert.equal(story('trust-hitl').ongoing, true);
  assert.match(core(story('pacsun-exec')), /am building|in progress|ongoing/i);
  assert.match(core(story('trust-hitl')), /function|pipeline|review/i);
  assert.doesNotMatch(core(story('modelscope')), /53%|2\.1|never the right/);
  assert.match(story('learn-langgraph').note, /same.*S1|S1.*same/i);
  assert.doesNotMatch(core(story('learn-langgraph')), /never used|one summer|read.*source|sole engineer/);
});

test('story selection does not present tool adoption as a mentoring episode', () => {
  const bank = data();
  const mentoring = bank.lps.find(lp => lp.id === 'hire-and-develop');
  assert.equal(mentoring.primary, null);
  assert.equal(mentoring.backup, null);
  assert.equal(mentoring.gap, 'mentoring');
  assert.ok(!bank.stories.some(story => story.lps.includes('hire-and-develop')));
});

test('follow-up scripts explain numeric changes without confusing percentage points or inventing comparator data', () => {
  const bank = data();
  const story = id => bank.stories.find(item => item.id === id);
  const deploy = story('cli-toolchain').probes.map(probe => probe.a).join(' ');
  const sports = story('dqn-stall').probes.map(probe => probe.a).join(' ');
  assert.match(deploy, /7 percentage points/);
  assert.match(sports, /6 percentage points/);
  assert.doesNotMatch(deploy, /7% reduction/);
  assert.doesNotMatch(story('modelscope').number_ids.join(' '), /ms-int8/);
  for (const item of bank.stories) {
    for (const probe of item.probes) assert.doesNotMatch(probe.a, /\binvent\b|\bunverified\b|without (?:supporting )?implementation detail/i, `${item.id}: ${probe.q}`);
  }
});
