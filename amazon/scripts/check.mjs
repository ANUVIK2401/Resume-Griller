// Content guard. Run before every commit: node amazon/scripts/check.mjs
// Fails on: invalid JSON, schema violations, em/en dashes anywhere, duplicate ids,
// broken cross references, candidate metrics missing from profile.json, numbers that drift
// from salesforce/data/profile.json, contradicted resume facts (Oracle tenure wording,
// MSRcosmos dates, Sports Analytics as volunteer research, graduation date), an LP with no
// story and no gap entry, and private data (emails, phone numbers, case numbers,
// immigration details) anywhere in the repo.
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
const awsIds = ids(aws.services);
refs('aws.acronyms.service', (aws.acronyms || []).map((a) => a.service), awsIds);
const { compare = {}, fundamentals = {} } = data;
refs('compare.pairs.group', (compare.pairs || []).map((p) => p.group), ids(compare.groups));
for (const p of compare.pairs || []) refs(`compare.pairs.${p.id}.services`, p.services, awsIds);
refs('fundamentals.items.topic', (fundamentals.items || []).map((x) => x.topic), ids(fundamentals.topics));
for (const d of designs.designs || []) {
  const focus = d.diagram?.focus;
  if (focus && focus.length > d.flow.length) fail(`designs.designs.${d.id}.diagram.focus`, 'more highlighted steps than flow steps');
}
refs('aws.services.family', (aws.services || []).map((s) => s.family), ids(aws.families));
refs('aws.resume_map.story', (aws.resume_map || []).map((r) => r.story), storyIds);
refs('designs.designs.story', (designs.designs || []).map((d) => d.story), storyIds);
refs('top.questions.group', (data.top?.questions || []).map((q) => q.group), ids(data.top?.groups));
refs('questions.lp_questions.lp', (questions.lp_questions || []).map((q) => q.lp), lpIds);
for (const st of loop.stages || []) {
  refs(`loop.stages.${st.id}.lead_stories`, st.lead_stories || [], storyIds);
  refs(`loop.stages.${st.id}.prep_pages`, st.prep_pages || [], pageIds);
  refs(`loop.stages.${st.id}.default_status`, [st.default_status], ids(loop.status_options));
}
for (const day of loop.plan || []) refs(`loop.plan.${day.id}`, day.tasks.map((t) => t.page), pageIds);
for (const page of site.pages || []) if (!existsSync(join(root, page.href))) fail('site.pages', `missing page ${page.href}`);
refs('profile.numbers.group', (profile.numbers || []).map((n) => n.group), ids(profile.number_groups));

// 6. Every LP has at least one story. The three gap entries (failure, disagreement, mentoring)
// are story slots the candidate must write from real events; an LP covered only by a gap entry
// passes but is listed as unfinished. An LP with neither fails the build.
for (const lp of behavioral.lps || []) {
  const tagged = (behavioral.stories || []).filter((s) => s.lps.includes(lp.id));
  if (tagged.length) continue;
  const gap = (behavioral.gaps || []).find((g) => g.id === lp.gap && g.lps.includes(lp.id));
  if (gap) warnings.push(`LP "${lp.name}" is covered only by the unfinished "${gap.id}" gap entry; write it from a real event`);
  else fail(`behavioral.lps.${lp.id}`, 'no story is tagged with this LP and no gap entry lists it');
}
for (const g of behavioral.gaps || []) {
  for (const key of ['s', 't', 'a', 'r']) if (!String(g.template?.[key] || '').trim()) fail(`behavioral.gaps.${g.id}.template.${key}`, 'empty STAR slot');
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
];
for (const [where, text] of spoken) {
  for (const n of numbersIn(String(text).replace(/\[fill:[^\]]*\]/g, ''))) if (!known.has(n)) fail(where, `metric "${n}" is not in profile.json`);
}

// 7b. Numbers are copied from salesforce/data/profile.json, never invented here: every Amazon
// number must exist there with the same answer and unit.
const repo = join(root, '..');
const sfProfile = JSON.parse(readFileSync(join(repo, 'salesforce/data/profile.json'), 'utf8'));
const sfNumbers = new Map(sfProfile.numbers.map((n) => [n.id, n]));
for (const n of profile.numbers || []) {
  const sf = sfNumbers.get(n.id);
  if (!sf) fail(`profile.numbers.${n.id}`, 'not in salesforce/data/profile.json; copy numbers from there, do not invent them');
  else if (sf.a !== n.a || sf.unit !== n.unit) fail(`profile.numbers.${n.id}`, `answer ${n.a} ${n.unit} differs from Salesforce ${sf.a} ${sf.unit}`);
}

// 8. Candidate-confirmed facts (October 19, 2026).
const experience = Object.fromEntries((profile.experience || []).map(item => [item.id, item]));
for (const [id, expected] of Object.entries({ oracle: ['2022-07', '2025-01'], msrcosmos: ['2026-06', '2026-08'] })) {
  const dates = experience[id]?.legal_dates;
  if (dates?.start !== expected[0] || dates?.end !== expected[1]) fail(`profile.experience.${id}`, `legal_dates must be ${expected[0]} to ${expected[1]}`);
}
if (experience.sports?.kind !== 'volunteer research') fail('profile.experience.sports.kind', 'USC Sports Analytics is volunteer research');
if (!/Dec 16, 2026/.test(profile.education?.find((e) => e.id === 'usc-ms')?.dates_display || '')) fail('profile.education.usc-ms', 'USC MS CS graduates Dec 16, 2026');
// Copy rules for every data string and Markdown file. The review's discrepancy log quotes the
// earlier resume PDF on purpose, so it is exempt.
const FACT_RULES = [
  [/\b(?<!nearly |about )(3|three) years\b|\b(2\.5|two and a half|2 and a half) years\b|\b(close to|almost|over|more than|around|roughly) (3|three) years\b/i, 'Oracle tenure is "nearly 3 years" or "about 3 years"'],
  [/\bMay 2026\b|2026-05/, 'MSRcosmos ran Jun 2026 to Aug 2026'],
  [/\bresearch intern(ship)?\b/i, 'USC Sports Analytics is volunteer research, not an internship'],
];
function pathStrings(node, path, out = []) {
  if (typeof node === 'string') out.push([path, node]);
  else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) if (k !== '$schema') pathStrings(v, `${path}.${k}`, out);
  return out;
}
const copyTexts = [
  ...Object.entries(data).flatMap(([name, json]) => pathStrings(json, name)).filter(([path]) => !path.startsWith('review.discrepancies')),
  ...walk(root).filter((p) => p.endsWith('.md')).flatMap((p) => readFileSync(p, 'utf8').split('\n')
    .map((line, i) => [`${relative(root, p)}:${i + 1}`, line]).filter(([, line]) => !/Earlier resume PDF|Candidate decision, October 19/.test(line))),
];
for (const [where, text] of copyTexts) for (const [re, why] of FACT_RULES) if (re.test(text)) fail(where, why);

// 8b. Privacy: the site is public. Scan every text file in the repo (not just amazon/) for
// emails, phone numbers, immigration case numbers, and immigration status details.
const PRIVATE = [
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z0-9.-]*[A-Za-z]{2,}/, 'email address'],
  [/(?<![\w.])(\+?1[ .-]?)?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}(?!\d)/, 'phone number'],
  [/\b(IOE|WAC|EAC|LIN|SRC|MSC|NBC|YSC)\d{10}\b/, 'immigration case number'],
  [/\b(visa|H-?1B|STEM OPT|USCIS|green card|I-20|I-765|I-797|immigration|sponsorship)\b/i, 'immigration detail'],
];
const SELF = new Set([join(root, 'scripts/check.mjs')]);
const repoFiles = (function walkRepo(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (name.startsWith('.') || ['node_modules', 'vendor'].includes(name)) return [];
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walkRepo(path) : [path];
  });
})(repo).filter((p) => /\.(html|css|js|mjs|json|md|py|yml)$/.test(p) && !SELF.has(p));
for (const path of repoFiles) {
  readFileSync(path, 'utf8').split('\n').forEach((line, i) => {
    for (const [re, what] of PRIVATE) if (re.test(line)) fail(`${relative(repo, path)}:${i + 1}`, `${what} in a public file`);
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

for (const w of warnings) console.warn(`warning: ${w}`);
if (errors.length) {
  console.error(`check failed, ${errors.length} problem(s):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`check passed: ${Object.keys(data).length} data files, ${(behavioral.stories || []).length} stories, ${(behavioral.gaps || []).length} unfinished gap entries, ${(behavioral.lps || []).length} LPs, ${(aws.services || []).length} AWS terms, ${(compare.pairs || []).length} pairs, ${(fundamentals.items || []).length} fundamentals`);
