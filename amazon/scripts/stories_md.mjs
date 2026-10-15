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
    '# Amazon AWSI ETP Solutions Architect: STAR Story Bank',
    '',
    'Generated from `data/behavioral.json` by `scripts/stories_md.mjs`. Edit the JSON, then rerun the script.',
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
    '| Leadership Principle | Primary story | Backup story |',
    '|---|---|---|',
    ...behavioral.lps.map((lp) => `| ${lp.name} | ${ref(lp.primary)} | ${ref(lp.backup)} |`),
    '',
  ];
  for (const s of behavioral.stories) {
    lines.push(
      `## ${s.code}. ${s.title} (${org(s)})`,
      '',
      `**LPs:** ${s.lps.map(lpName).join(', ')}${s.ongoing ? '. Ongoing work: say "building", not "built".' : ''}${s.note ? ` ${s.note}` : ''}`,
      '',
      `**Open with:** ${s.headline}`,
      '',
      `- **S:** ${s.s}`,
      `- **T:** ${s.t}`,
      `- **A:**`,
      ...s.a.map((a) => `  - ${a}`),
      `- **R:** ${s.r}`,
      '',
      `**Close with:** ${s.lesson}`,
      '',
      `**SA twist:** ${s.twist}`,
      '',
      `**On AWS:** ${s.aws}`,
      '',
      '**Probes:**',
      '',
      ...s.probes.map((p) => `- *${p.q}* ${p.a}`),
      '',
    );
  }
  lines.push('## Gap stories: write these from real events', '');
  for (const g of behavioral.gaps) {
    lines.push(
      `### ${g.name}`,
      '',
      `**LPs:** ${g.lps.map(lpName).join(', ')}. **Asked as:** ${g.asked_as.join(' ')}`,
      '',
      `**Where to look:** ${g.seeds}`,
      '',
      ...['s', 't', 'a', 'r'].map((k) => `- **${k.toUpperCase()}:** ${g.template[k]}`),
      '',
    );
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  writeFileSync(new URL('../stories.md', import.meta.url), render(read('behavioral'), read('profile')));
  console.log('wrote amazon/stories.md');
}
