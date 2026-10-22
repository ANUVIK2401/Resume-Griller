// Writes amazon/stories.md from data/behavioral.json so the STAR bank reads well on GitHub.
// Run after editing stories: node amazon/scripts/stories_md.mjs
// scripts/check.mjs fails if stories.md is out of date.
import { readFileSync, writeFileSync } from 'node:fs';

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), 'utf8'));

export function render(behavioral, profile) {
  const story = (id) => behavioral.stories.find((s) => s.id === id);
  const org = (s) => (profile.experience.find((e) => e.id === s.experience_id) || profile.projects.find((p) => p.id === s.experience_id)).org
    || profile.projects.find((p) => p.id === s.experience_id).name;
  const lpName = (id) => behavioral.lps.find((lp) => lp.id === id).name;
  const ref = (id) => (id ? `${story(id).code} ${story(id).title}` : '**GAP**');
  const lines = [
    '# Amazon Solutions Architect: STAR Story Bank',
    '',
    'Generated from `data/behavioral.json` by `scripts/stories_md.mjs`. Edit the JSON, then rerun the script.',
    '',
    'Read the evidence, confirmation prompts, and delivery review in [RESUME-STAR-REVIEW.md](RESUME-STAR-REVIEW.md) or [the interactive review](review.html). Resume claims have not been independently verified. AWS mappings are proposed designs.',
    '',
    '## How to answer',
    '',
    ...behavioral.rules.map((r) => `- ${r}`),
    '',
    `## ${behavioral.pitch.target_sec}-second pitch`,
    '',
    ...behavioral.pitch.beats.map((b) => `**${b.label}.** ${b.text}`).flatMap((l) => [l, '']),
    `> ${behavioral.pitch.closing_line}`,
    '',
    '## Leadership Principle map',
    '',
    'The first 8 rows are the principles the recruiter named for this role.',
    '',
    '| Leadership Principle | Primary story | Backup story |',
    '|---|---|---|',
    ...behavioral.lps.map((lp) => `| ${lp.named ? `**${lp.name}**` : lp.name} | ${ref(lp.primary)} | ${ref(lp.backup)} |`),
    '',
    '## Recruiter sample questions',
    '',
    ...behavioral.samples.flatMap((q) => [`- **${q.q}** ${q.opener} (${q.story ? ref(q.story) : 'failure story'})`]),
    '',
  ];
  for (const s of behavioral.stories) {
    lines.push(
      `## ${s.code}. ${s.title} (${org(s)})`,
      '',
      `**LPs:** ${s.lps.map(lpName).join(', ')}`,
      '',
      `**Open with:** ${s.headline}`,
      '',
      `- **S:** ${s.s}`,
      `- **T:** ${s.t}`,
      `- **A:**`,
      ...s.a.map((a) => `  - ${a}`),
      `- **R:** ${s.r}`,
      '',
      '**For the 2 to 4 minute version, add:**',
      '',
      `- **Stakes:** ${s.long.stakes}`,
      `- **Obstacle:** ${s.long.obstacle}`,
      `- **Tradeoff:** ${s.long.tradeoff}`,
      `- **Buy-in:** ${s.long.buy_in}`,
      `- **Result with metrics:** ${s.long.result}`,
      '',
      `**Close with:** ${s.lesson}`,
      '',
      `**What I would do differently:** ${s.long.different}`,
      '',
      `**How I would do this at AWS:** ${s.long.at_aws}`,
      '',
      '### Preparation notes, separate from the speaking script',
      '',
      `**Evidence boundary:** ${s.evidence_note}`,
      '',
      ...(s.note ? [`**Context:** ${s.note}`, ''] : []),
      ...(s.ongoing ? ['**Status:** Ongoing work; describe implemented capabilities without inventing a business outcome.', ''] : []),
      `**SA audience bridge:** ${s.twist}`,
      '',
      `**Proposed AWS design:** ${s.aws}`,
      '',
      '**Probes:**',
      '',
      ...s.probes.map((p) => `- *${p.q}* ${p.a}`),
      '',
    );
  }
  lines.push('## LP question bank', '', ...behavioral.question_bank.map((q) => `- ${lpName(q.lp)}: ${q.q} Use ${q.story ? ref(q.story) : 'the failure story'}.`), '');
  lines.push('## Gap stories: write these from real events', '');
  for (const g of behavioral.gaps) {
    lines.push(
      `### ${g.name}${g.required ? ' (required)' : ''}`,
      '',
      `**LPs:** ${g.lps.map(lpName).join(', ')}. **Asked as:** ${g.asked_as.join(' ')}`,
      '',
      `**Where to look:** ${g.seeds}`,
      '',
      ...(g.worksheet ? g.worksheet.map((w, i) => `${i + 1}. ${w.prompt}`) : ['s', 't', 'a', 'r'].map((k) => `- **${k.toUpperCase()}:** ${g.template[k]}`)),
      '',
    );
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  writeFileSync(new URL('../stories.md', import.meta.url), render(read('behavioral'), read('profile')));
  console.log('wrote amazon/stories.md');
}
