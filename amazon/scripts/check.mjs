// Content guard. Run before every commit: node amazon/scripts/check.mjs
// Fails on: invalid JSON, schema violations, em/en dashes anywhere, duplicate ids,
// broken story/LP cross references, candidate metrics missing from profile.json,
// source-aligned employment chronology, domain question minimums, the 8 named LPs,
// Oracle tenure wording, privacy patterns, and stale generated files.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createRequire } from 'node:module';

const root = new URL('..', import.meta.url).pathname;
const errors = [];
const warnings = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (name.startsWith('.') || name === 'node_modules') return [];
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

// 1. No em or en dashes in any shipped text file.
const DASH = /[\u2013\u2014]/;
for (const path of walk(root).filter((p) => /\.(html|css|js|mjs|json|md|py)$/.test(p))) {
  readFileSync(path, 'utf8').split('\n').forEach((line, i) => {
    if (DASH.test(line)) fail(`${relative(root, path)}:${i + 1}`, 'em or en dash, use a comma, colon, or period');
  });
}

// 2. Every data file parses.
const dataDir = join(root, 'data');
const schemaDir = join(dataDir, 'schema');
const data = {};
for (const name of readdirSync(dataDir).filter((n) => n.endsWith('.json'))) {
  try {
    data[name.replace('.json', '')] = JSON.parse(readFileSync(join(dataDir, name), 'utf8'));
  } catch (err) {
    fail(`data/${name}`, `invalid JSON: ${err.message}`);
  }
}

// 3. Schema validation. A small subset of JSON Schema, enough for these files.
// ponytail: hand-rolled subset (type, required, properties, items, $ref, enum, pattern, not, min/max);
// swap in ajv if a schema ever needs more.
const schemas = Object.fromEntries(readdirSync(schemaDir).map((n) => [n, JSON.parse(readFileSync(join(schemaDir, n), 'utf8'))]));
function resolveRef(ref, file) {
  const [doc, pointer = ''] = ref.split('#');
  const target = doc || file;
  const node = pointer.split('/').filter(Boolean).reduce((n, key) => n?.[key], schemas[target]);
  if (!node) throw new Error(`unresolved $ref ${ref} in ${file}`);
  return { node, file: target };
}
const typeOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v);
const typeOk = (want, v) => [want].flat().some((t) => t === typeOf(v) || (t === 'number' && typeof v === 'number'));
function check(value, schema, file, where) {
  if (schema.$ref) { const r = resolveRef(schema.$ref, file); return check(value, r.node, r.file, where); }
  if (schema.type && !typeOk(schema.type, value)) return fail(where, `expected ${schema.type}, got ${typeOf(value)}`);
  if (schema.enum && !schema.enum.includes(value)) fail(where, `"${value}" not in ${schema.enum.join(', ')}`);
  if (typeof value === 'string') {
    if (schema.minLength && value.length < schema.minLength) fail(where, 'empty text');
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) fail(where, `"${value}" does not match ${schema.pattern}`);
    if (schema.not?.pattern && new RegExp(schema.not.pattern).test(value)) fail(where, 'matches a forbidden pattern');
  }
  if (typeof value === 'number' && schema.minimum !== undefined && value < schema.minimum) fail(where, `below ${schema.minimum}`);
  if (Array.isArray(value)) {
    if (schema.minItems && value.length < schema.minItems) fail(where, `needs at least ${schema.minItems} items`);
    if (schema.maxItems && value.length > schema.maxItems) fail(where, `allows at most ${schema.maxItems} items`);
    if (schema.items) value.forEach((v, i) => check(v, schema.items, file, `${where}[${v?.id ?? i}]`));
  }
  if (typeOf(value) === 'object') {
    for (const key of schema.required || []) if (!(key in value)) fail(where, `missing "${key}"`);
    for (const [key, v] of Object.entries(value)) {
      if (key === '$schema') continue;
      if (schema.properties?.[key]) check(v, schema.properties[key], file, `${where}.${key}`);
      else if (schema.additionalProperties === false) fail(where, `unexpected "${key}"`);
      else if (typeof schema.additionalProperties === 'object') check(v, schema.additionalProperties, file, `${where}.${key}`);
    }
  }
}
for (const [name, json] of Object.entries(data)) {
  const file = `${name}.schema.json`;
  if (!schemas[file]) { fail(`data/${name}.json`, `no schema at data/schema/${file}`); continue; }
  check(json, schemas[file], file, name);
}

// 4. Ids unique within each array, at any depth.
function uniqueIds(node, where) {
  if (Array.isArray(node)) {
    const seen = new Set();
    node.forEach((item) => {
      if (item && typeof item === 'object' && 'id' in item) {
        if (seen.has(item.id)) fail(where, `duplicate id "${item.id}"`);
        seen.add(item.id);
      }
      uniqueIds(item, where);
    });
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) uniqueIds(value, `${where}.${key}`);
  }
}
for (const [name, json] of Object.entries(data)) uniqueIds(json, name);

// 5. Cross references resolve, and the LP map agrees with story tags.
const ids = (list) => new Set((list || []).map((x) => x.id));
function refs(where, values, valid) {
  for (const v of values.filter((x) => x !== null && x !== undefined)) if (!valid.has(v)) fail(where, `unknown reference "${v}"`);
}
const { profile = {}, behavioral = {}, aws = {}, designs = {}, questions = {}, loop = {}, site = {} } = data;
const expIds = new Set([...ids(profile.experience), ...ids(profile.projects)]);
const storyIds = ids(behavioral.stories);
const lpIds = ids(behavioral.lps);
const gapIds = ids(behavioral.gaps);
const pageIds = ids(site.pages);
for (const s of behavioral.stories || []) {
  refs(`behavioral.stories.${s.id}.experience_id`, [s.experience_id], expIds);
  refs(`behavioral.stories.${s.id}.number_ids`, s.number_ids || [], ids(profile.numbers));
  refs(`behavioral.stories.${s.id}.lps`, s.lps || [], lpIds);
}
for (const lp of behavioral.lps || []) {
  refs(`behavioral.lps.${lp.id}`, [lp.primary, lp.backup], storyIds);
  refs(`behavioral.lps.${lp.id}.gap`, [lp.gap], gapIds);
  for (const sid of [lp.primary, lp.backup].filter(Boolean)) {
    const story = behavioral.stories.find((s) => s.id === sid);
    if (story && !story.lps.includes(lp.id)) fail(`behavioral.lps.${lp.id}`, `story "${sid}" is mapped here but not tagged with this LP`);
  }
}
for (const g of behavioral.gaps || []) refs(`behavioral.gaps.${g.id}.lps`, g.lps, lpIds);
refs('aws.services.category', (aws.services || []).map((s) => s.category), ids(aws.categories));
refs('aws.resume_map.story', (aws.resume_map || []).map((r) => r.story), storyIds);
refs('designs.designs.story', (designs.designs || []).map((d) => d.story), storyIds);
refs('top.questions.group', (data.top?.questions || []).map((q) => q.group), ids(data.top?.groups));
refs('questions.lp_questions.lp', (questions.lp_questions || []).map((q) => q.lp), lpIds);
const domainIds = ids(data.domains?.domains);
for (const day of loop.plan || []) refs(`loop.plan.${day.id}`, day.tasks.map((t) => t.page), pageIds);
refs('loop.streams.page', (loop.streams || []).map((x) => x.page), pageIds);
const focus = loop.focus_areas || {};
refs('loop.focus_areas', [focus.depth, ...(focus.breadth || []), ...(focus.backup || [])], domainIds);
for (const page of site.pages || []) if (!existsSync(join(root, page.href))) fail('site.pages', `missing page ${page.href}`);
refs('profile.numbers.group', (profile.numbers || []).map((n) => n.group), ids(profile.number_groups));

// 5b. The 8 named LPs: exactly 8, each with a primary and backup story and at least two tagged stories;
// the question bank has 5 per named LP; samples and bank point at real stories or gaps.
const named = (behavioral.lps || []).filter((lp) => lp.named);
if (named.length !== 8) fail('behavioral.lps', `expected 8 named LPs, found ${named.length}`);
for (const lp of named) {
  if (!lp.primary || !lp.backup) fail(`behavioral.lps.${lp.id}`, 'a named LP needs a primary and a backup story');
  const tagged = (behavioral.stories || []).filter((st) => st.lps.includes(lp.id)).length;
  if (tagged < 2) fail(`behavioral.lps.${lp.id}`, `a named LP needs at least two stories, found ${tagged}`);
  const asked = (behavioral.question_bank || []).filter((q) => q.lp === lp.id).length;
  if (asked < 5) fail(`behavioral.question_bank`, `${lp.id} has ${asked} questions, needs 5`);
}
for (const q of [...(behavioral.samples || []), ...(behavioral.question_bank || [])]) {
  refs(`behavioral.${q.id}.story`, [q.story, q.alt], storyIds);
  refs(`behavioral.${q.id}.gap`, [q.gap], gapIds);
  refs(`behavioral.${q.id}.lp`, [q.lp], lpIds);
  if (!q.story && !q.gap) fail(`behavioral.${q.id}`, 'needs a story or a gap');
}
if (!(behavioral.gaps || []).some((g) => g.id === 'failure' && g.required && g.worksheet?.length >= 8)) fail('behavioral.gaps', 'the failure story must be a required 8-prompt worksheet');

// 5c. Domains: each meets its minimum, depth is AI/ML at 45+, CS carries 10 drills, ids are unique site-wide.
const MINIMUMS = { 'ai-ml': 45, networking: 30, databases: 30, security: 30, cs: 35, appdev: 25, cloud: 25, hardware: 15 };
const seenQ = new Set();
for (const d of data.domains?.domains || []) {
  const min = MINIMUMS[d.id];
  if (min === undefined) fail(`domains.${d.id}`, 'unknown domain');
  if (d.min_questions !== min) fail(`domains.${d.id}`, `min_questions should be ${min}`);
  if (d.questions.length < min) fail(`domains.${d.id}`, `${d.questions.length} questions, needs ${min}`);
  for (const q of d.questions) {
    if (seenQ.has(q.id)) fail(`domains.${d.id}`, `question id "${q.id}" is used in another domain`);
    seenQ.add(q.id);
    if (!q.plain?.trim() || !q.technical?.trim()) fail(`domains.${d.id}.${q.id}`, 'needs a plain and a technical answer');
  }
}
if ((data.domains?.domains || []).find((d) => d.id === 'cs')?.drills?.length !== 10) fail('domains.cs.drills', 'needs exactly 10 code drills');
if (data.presentation) {
  const total = data.presentation.sections.reduce((n, x) => n + x.seconds, 0);
  if (total !== data.presentation.target_seconds) fail('presentation.sections', `section times total ${total}s, target is ${data.presentation.target_seconds}s`);
}

// 6. Every LP has at least one story. A planned gap story keeps the build green but is reported.
for (const lp of behavioral.lps || []) {
  const tagged = (behavioral.stories || []).filter((s) => s.lps.includes(lp.id));
  if (tagged.length) continue;
  if (lp.gap) warnings.push(`LP "${lp.name}" has no story yet; write the "${lp.gap}" gap story`);
  else fail(`behavioral.lps.${lp.id}`, 'no story is tagged with this LP and no gap story is planned');
}
for (const lp of behavioral.lps || []) {
  if (!(questions.lp_questions || []).some((q) => q.lp === lp.id)) fail(`questions.lp_questions`, `no question for LP "${lp.id}"`);
}

// 7. Candidate metrics must exist in profile.json. Every number spoken in the pitch,
// a story's S/T/A/R or twist, or the resume map must appear somewhere in profile.json.
// Probes are excluded: they carry general AWS facts, not resume claims.
function strings(node, out = []) {
  if (typeof node === 'string') out.push(node);
  else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) if (k !== '$schema') strings(v, out);
  return out;
}
const numbersIn = (text) => (text.match(/\d+(?:[.,]\d+)*/g) || []).map((n) => n.replace(/,/g, ''));
const known = new Set(strings(profile).flatMap(numbersIn));
const spoken = [
  ...(behavioral.pitch?.beats || []).map((b) => ['behavioral.pitch', b.text]),
  ['behavioral.pitch.closing_line', behavioral.pitch?.closing_line || ''],
  ...(behavioral.stories || []).flatMap((s) => [s.headline, s.s, s.t, ...s.a, s.r, s.lesson, s.twist].map((text) => [`behavioral.stories.${s.id}`, text])),
  ...(aws.resume_map || []).map((r) => ['aws.resume_map', r.you_did]),
  ...(behavioral.stories || []).flatMap((st) => Object.values(st.long || {}).map((text) => [`behavioral.stories.${st.id}.long`, text])),
  ...(behavioral.samples || []).map((q) => [`behavioral.samples.${q.id}`, q.opener]),
  ...(data.domains?.domains || []).flatMap((d) => d.questions.filter((q) => q.resume).map((q) => [`domains.${q.id}.resume`, q.resume])),
  // Clock times like 8:00 are timing cues, not metrics.
  ...strings(data.presentation || {}).map((text) => ['presentation', text.replace(/\b\d{1,2}:\d{2}\b/g, '')]),
];
for (const [where, text] of spoken) {
  for (const n of numbersIn(String(text).replace(/\[fill:[^\]]*\]/g, ''))) if (!known.has(n)) fail(where, `metric "${n}" is not in profile.json`);
}

// 8. Resume chronology is source-aligned; do not force unsupported employment labels.
const experience = Object.fromEntries((profile.experience || []).map(item => [item.id, item]));
for (const [id, expected] of Object.entries({ oracle: ['2022-07', '2025-01'], msrcosmos: ['2026-05', '2026-08'] })) {
  const dates = experience[id]?.legal_dates;
  if (dates?.start !== expected[0] || dates?.end !== expected[1]) fail(`profile.experience.${id}`, 'dates differ from the reviewed resume');
}

// 8b. Oracle tenure is spoken as "nearly 3 years" everywhere.
for (const [where, text] of [...strings(behavioral).map((t) => ['behavioral', t]), ...strings(data.domains || {}).map((t) => ['domains', t]), ...strings(data.presentation || {}).map((t) => ['presentation', t])]) {
  for (const m of text.matchAll(/(\w+\s+)?(?:2|two|2\.5|3|three)\+?\s+years\b/gi)) {
    if (/Oracle/i.test(text) && !/^nearly\s/i.test(m[0])) fail(where, `Oracle tenure must be "nearly 3 years", found "${m[0]}"`);
  }
}

// 8c. Public repo privacy: no emails, phone numbers, street addresses, or work-authorization terms.
const PRIVACY = [
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, 'email address'],
  [/(?:\+1[\s.-]?)?\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/, 'phone number'],
  [/\b\d{1,5}\s+(?:[A-Z][a-z]+\s+){1,3}(?:Street|St\.|Avenue|Ave\.|Boulevard|Blvd|Road|Rd\.|Drive|Dr\.|Way|Lane)\b/, 'street address'],
  [/\b(?:H-1B|H1B|OPT|CPT)\b/, 'work-authorization detail'],
  [/\b(?:F-1 visa|green card|visa sponsorship|work authorization|work permit)\b/i, 'work-authorization detail'],
];
for (const path of walk(root).filter((p) => /\.(html|json|md)$/.test(p) && !p.includes('/scripts/'))) {
  readFileSync(path, 'utf8').split('\n').forEach((line, i) => {
    for (const [re, what] of PRIVACY) if (re.test(line)) fail(`${relative(root, path)}:${i + 1}`, `looks like a ${what}; keep it out of the public repo`);
  });
}

// 9. Every quiz number is answerable.
const { isCorrect } = createRequire(import.meta.url)('../js/quiz.js');
for (const n of profile.numbers || []) {
  if (!isCorrect(n, n.a)) fail(`profile.numbers.${n.id}`, `canonical answer "${n.a}" does not parse`);
  for (const a of n.accept || []) if (!isCorrect(n, a)) fail(`profile.numbers.${n.id}`, `accepted "${a}" does not match ${n.a}`);
}

// 10. stories.md is generated from behavioral.json and must be current.
const { render: storiesMd } = await import('./stories_md.mjs');
if (data.behavioral && data.profile && readFileSync(join(root, 'stories.md'), 'utf8') !== storiesMd(data.behavioral, data.profile)) {
  fail('stories.md', 'out of date: run node amazon/scripts/stories_md.mjs');
}

// 11. Print pages are generated from data and must be current.
const { renderAll } = await import('./print_pages.mjs');
for (const [file, text] of Object.entries(renderAll())) {
  if (!existsSync(join(root, file)) || readFileSync(join(root, file), 'utf8') !== text) fail(file, 'out of date: run node amazon/scripts/print_pages.mjs');
}

for (const w of warnings) console.warn(`warning: ${w}`);
if (errors.length) {
  console.error(`check failed, ${errors.length} problem(s):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
const qCount = (data.domains?.domains || []).reduce((n, d) => n + d.questions.length, 0);
console.log(`check passed: ${Object.keys(data).length} data files, ${(behavioral.stories || []).length} stories, ${(behavioral.lps || []).length} LPs, ${qCount} domain questions, ${(aws.services || []).length} AWS terms`);
