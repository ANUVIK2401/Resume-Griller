// Generate the portable companion from the same data as the browser page.
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
export function render(data) {
  const refs = (item) => 'Sources: ' + item.sources.map((id) => {
    const source = data.sources.find((s) => s.id === id);
    return `[${source.title}](${source.url})`;
  }).join(', ');
  const bullets = (items) => items.map((item) => `- ${item}`);
  const lines = ['# AWS Solutions Architect interview cheatsheet', '',
    `Verified against linked official AWS documentation: ${data.verified_on}.`, '', data.purpose, '', data.experience_boundary,
    '', '## How to answer', '', ...data.answer_frame.map((s, i) => `${i + 1}. ${s}`)];
  for (const priority of data.priorities) {
    lines.push('', `## ${priority.id}: ${priority.name}`, '', priority.when);
    for (const t of data.topics.filter((topic) => topic.priority === priority.id)) {
      lines.push('', `### ${t.name}`, '', `- Choose: ${t.decision}`, `- Tradeoff: ${t.tradeoff}`,
        `- Failure: ${t.failure}`, `- Say: ${t.say}`, `- Probe: ${t.probe}`, '', refs(t));
    }
  }
  lines.push('', '## Comparison traps');
  for (const c of data.comparisons) lines.push('', `### ${c.title}`, '', c.answer, '', `Trap: ${c.trap}`, '', refs(c));
  lines.push('', '## Customer architecture walkthroughs', '', 'All walkthroughs are hypothetical practice. Service selections require workload validation.');
  for (const w of data.walkthroughs) {
    lines.push('', `### ${w.name}`, '', w.customer, '', 'Ask first:', '', ...bullets(w.discovery), '', 'Proposed flow:', '',
      ...w.flow.map((s, i) => `${i + 1}. ${s}`), '', `Tradeoff: ${w.tradeoff}`, '', `Failure drill: ${w.challenge}`,
      '', `Validate: ${w.validation}`, '', refs(w));
  }
  lines.push('', '## Optional labs', '', data.lab_policy);
  for (const lab of data.labs) {
    lines.push('', `### ${lab.name} (${lab.minutes} minutes)`, '', lab.cost_gate, '',
      ...lab.steps.map((s, i) => `${i + 1}. ${s}`), '', `Offline alternative: ${lab.offline}`, '', 'Cleanup:', '', ...bullets(lab.cleanup), '', refs(lab));
  }
  lines.push('', '## Official references', '', ...bullets(data.sources.map((s) => `[${s.title}](${s.url})`)), '',
    'Use this for decision practice. Confirm Region, feature, pricing, availability and current limits before a real design.', '');
  return lines.join('\n');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = new URL('../', import.meta.url);
  writeFileSync(new URL('AWS-CHEATSHEET.md', root), render(JSON.parse(readFileSync(new URL('data/cheatsheet.json', root)))));
}
