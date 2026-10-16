// Generate the portable rehearsal pack from the same scripts used in the app.
import { readFileSync, writeFileSync } from 'node:fs';
export function render(data) {
  const lines = [
    '# Amazon Solutions Architect: ready-to-rehearse answers', '',
    'Start with S1 (ERP migration), S2 (incident response), S4 (deployment validation), and S5 (query performance). Say one answer aloud, then practise its follow-ups.', '',
    'The numbers come from the supplied resume. Current work stays in progress; AWS translations describe proposed designs. Additional coaching is separate from the spoken scripts.', '',
    `## ${data.role_context.role}`, '',
    ...data.role_context.responsibilities.map(text => `- ${text}`), '',
    '## Speaking scripts', '',
  ];
  for (const story of data.stories) {
    lines.push(`### ${story.code}. ${story.title}`, '', story.draft, '',
      '**Practise these follow-ups:**', '', ...story.probes.map(text => `- ${text}`), '');
  }
  lines.push('## Delivery drills', '');
  for (const drill of data.delivery_drills) lines.push(`### ${drill.title}`, '', ...drill.steps.map(text => `- ${text}`), '');
  lines.push('## Optional deeper preparation', '');
  for (const story of data.stories) lines.push(`### ${story.code}. ${story.title}`, '',
    ...Object.entries(story.assessment).map(([key, value]) => `- **${key}:** ${value}`), '');
  lines.push('## Additional real examples', '', 'Failure, disagreement, and mentoring answers require distinct personal experiences. Use the optional prompts in the app to extend the bank; these are not fictional episodes.', '',
    '## Sources', '', data.resume_source, '', ...data.sources.map(source => `- [${source.title}](${source.url})`), '');
  return `${lines.join('\n').trimEnd()}\n`;
}
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const data = JSON.parse(readFileSync(new URL('../data/review.json', import.meta.url), 'utf8'));
  writeFileSync(new URL('../RESUME-STAR-REVIEW.md', import.meta.url), render(data));
  console.log('wrote amazon/RESUME-STAR-REVIEW.md');
}
