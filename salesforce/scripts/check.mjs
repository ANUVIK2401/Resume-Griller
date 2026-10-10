// Content guard. Run before every commit: node scripts/check.mjs
// Fails on: invalid JSON, em/en dashes anywhere, duplicate ids, broken cross
// references, and copy that contradicts profile.json ground truth.
// Structural schema checks happen in the editor via each file's "$schema".
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createRequire } from 'node:module';

const root = new URL('..', import.meta.url).pathname;
const errors = [];
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
const data = {};
for (const name of readdirSync(dataDir).filter((n) => n.endsWith('.json'))) {
  try {
    data[name.replace('.json', '')] = JSON.parse(readFileSync(join(dataDir, name), 'utf8'));
  } catch (err) {
    fail(`data/${name}`, `invalid JSON: ${err.message}`);
  }
}

// 3. Ids unique within each array, at any depth.
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

// 4. Cross references resolve.
const ids = (list) => new Set((list || []).map((x) => x.id));
function refs(where, values, valid) {
  for (const v of values.filter(Boolean)) if (!valid.has(v)) fail(where, `unknown reference "${v}"`);
}
const { profile = {}, behavioral = {}, ai = {}, dsa = {}, lld = {}, loop = {} } = data;
const expIds = new Set([...ids(profile.experience), ...ids(profile.projects)]);
const numIds = ids(profile.numbers);
refs('profile.numbers.group', (profile.numbers || []).map((n) => n.group), ids(profile.number_groups));
const storyIds = ids(behavioral.stories);
const compIds = ids(behavioral.competencies);
for (const s of behavioral.stories || []) {
  refs(`behavioral.stories.${s.id}.experience_id`, [s.experience_id], expIds);
  refs(`behavioral.stories.${s.id}.number_ids`, s.number_ids || [], numIds);
  refs(`behavioral.stories.${s.id}.competencies`, s.competencies || [], compIds);
}
const valueIds = ids(behavioral.values);
for (const s of behavioral.stories || []) {
  refs(`behavioral.stories.${s.id}.values`, s.values || [], valueIds);
  for (const k of ['terms', 'stack', 'simple']) {
    const n = (s[k] || []).length;
    if (n < 3 || n > 5) fail(`behavioral.stories.${s.id}.${k}`, `needs 3 to 5 bullets, has ${n}`);
  }
}
refs('ai.cards.topic', (ai.cards || []).map((c) => c.topic), ids(ai.topics));
refs('dsa.problems.pattern', (dsa.problems || []).map((p) => p.pattern), ids(dsa.patterns));
for (const p of lld.problems || []) refs(`lld.problems.${p.id}.patterns`, p.patterns, ids(lld.pattern_cards));
for (const s of loop.stages || []) refs(`loop.stages.${s.id}.default_status`, [s.default_status], ids(loop.status_options));

// 5. Ground truth: copy never contradicts profile.json.
function strings(node, path, out = []) {
  if (typeof node === 'string') out.push([path, node]);
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) if (k !== 'legal_dates' && k !== '$schema') strings(v, `${path}.${k}`, out);
  }
  return out;
}
const RULES = [
  [/\b(?<!nearly )(3|three) years\b/i, 'Oracle tenure is "nearly 3 years"'],
  [/\bJul(y)? 2022\b/, 'exact Oracle dates belong in legal_dates only'],
  [/\bMay 2026\b/, 'MSRcosmos started Jun 2026'],
  [/Sports Analytics(?![^.]*volunteer)[^.]*\b(intern|internship|job|employed)\b/i, 'Sports Analytics is volunteer research'],
];
for (const [name, json] of Object.entries(data)) {
  // Candidate resume rules do not apply to other candidates' dated reports.
  if (name === 'experiences') continue;
  for (const [path, text] of strings(json, name)) {
    for (const [re, why] of RULES) if (re.test(text)) fail(path, why);
  }
}

// 6. Every quiz number is answerable: canonical answer and each accepted spelling score as correct.
const { isCorrect } = createRequire(import.meta.url)('../js/quiz.js');
for (const n of profile.numbers || []) {
  if (!isCorrect(n, n.a)) fail(`profile.numbers.${n.id}`, `canonical answer "${n.a}" does not parse`);
  for (const a of n.accept || []) if (!isCorrect(n, a)) fail(`profile.numbers.${n.id}`, `accepted "${a}" does not match ${n.a}`);
}

// 7. Experience sources and site navigation are checked before deployment.
const { validate } = createRequire(import.meta.url)('../js/experience-model.js');
for (const error of validate(data.experiences)) fail('experiences', error);
const pages = data.site?.pages || [];
for (const page of pages) {
  if (!walk(root).includes(join(root, page.href))) fail('site.pages', `missing page ${page.href}`);
}
for (const stage of loop.stages || []) refs(`loop.${stage.id}.prep_pages`, stage.prep_pages || [], ids(pages));

if (errors.length) {
  console.error(`check failed, ${errors.length} problem(s):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`check passed: ${Object.keys(data).length} data files, ${(profile.numbers || []).length} quiz numbers`);
