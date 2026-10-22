// Writes the print pages from data: presentation-handout.html (one Letter page), final-review.html
// (one page per section), and FINAL-REVIEW.md. Run after editing data: node amazon/scripts/print_pages.mjs
// scripts/check.mjs fails if any of them is out of date.
import { readFileSync, writeFileSync } from 'node:fs';

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const TOP_CONCEPTS = 12; // ponytail: fixed cut keeps each domain on one Letter page; the full sheet lives on domains.html
const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const cell = (s) => String(s).replace(/\|/g, '\\|');

const BASE_CSS = `
  :root { --ink: #0F1720; --muted: #3A4656; --line: #C9CFD6; --accent: #FF9900; --accent-ink: #8A4B00; --sunk: #EEF0F2; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #fff; color: var(--ink); font: 11pt/1.4 'Aptos', 'Segoe UI', system-ui, -apple-system, sans-serif; }
  .page { max-width: 7.5in; margin: 0 auto; padding: 0.4in 0.2in; }
  h1 { font-size: 20pt; line-height: 1.15; margin: 0 0 0.1in; }
  h2 { font-size: 14pt; margin: 0.14in 0 0.06in; }
  p { margin: 0 0 0.08in; }
  ul, ol { margin: 0 0 0.08in; padding-left: 0.22in; }
  li { margin: 0 0 0.03in; }
  .muted { color: var(--muted); }
  .kicker { text-transform: uppercase; letter-spacing: 0.08em; font-size: 8.5pt; color: var(--accent-ink); font-weight: 700; margin: 0 0 0.04in; }
  .noprint { background: var(--sunk); padding: 0.08in 0.12in; border-radius: 6px; font-size: 9.5pt; }
  table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
  th, td { text-align: left; vertical-align: top; padding: 0.035in 0.06in; border-bottom: 1px solid var(--line); }
  th { font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }
  @page { size: letter; margin: 0.5in; }
  @media print { .noprint { display: none; } .page { padding: 0; max-width: none; } .break { break-before: page; } }
`;

const doc = (title, css, body) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'">
  <meta name="robots" content="noindex">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%278%27 fill=%27%23232F3E%27/%3E%3Cpath d=%27M8 20c5 3 11 3 16 0%27 stroke=%27%23FF9900%27 stroke-width=%273%27 fill=%27none%27 stroke-linecap=%27round%27/%3E%3C/svg%3E">
  <title>${esc(title)}</title>
  <style>${BASE_CSS}${css}</style>
</head>
<body>
${body}
</body>
</html>
`;

export function handout(presentation, profile) {
  const h = presentation.handout;
  const css = `
  .bars { display: grid; gap: 0.16in; margin: 0.1in 0 0.08in; }
  .bar-head { display: flex; justify-content: space-between; gap: 0.2in; font-size: 11pt; }
  .track { height: 0.34in; background: var(--sunk); border-radius: 0.17in; overflow: hidden; }
  .fill { display: block; height: 100%; background: #6B7684; border-radius: inherit; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  .fill.int4 { background: var(--accent); }
  .note { font-size: 9.5pt; color: var(--muted); margin-top: 0.03in; }
  .analogy { font-size: 14pt; border-left: 5px solid var(--accent); padding: 0.06in 0.14in; margin: 0.1in 0 0.14in; }
  .cta { margin-top: 0.18in; padding: 0.14in 0.18in; border: 2px solid var(--ink); border-radius: 10px; }
  .cta strong { display: block; font-size: 15pt; margin-bottom: 0.04in; }
  footer { margin-top: 0.2in; font-size: 9pt; color: var(--muted); }`;
  const bars = h.bars.map((b) => `    <div>
      <div class="bar-head"><strong>${esc(b.label)}</strong><span class="muted">${esc(b.bits)}</span></div>
      <div class="track"><span class="fill ${esc(b.id)}" style="width: ${(b.ratio * 100).toFixed(1)}%"></span></div>
      <p class="note">${esc(b.note)}</p>
    </div>`).join('\n');
  return doc(`${h.title}: handout`, css, `<main class="page">
  <p class="noprint">Print with Cmd+P or Ctrl+P on Letter paper, 5 copies. Check the preview shows one page.</p>
  <p class="kicker">${esc(presentation.subtitle)}</p>
  <h1>${esc(h.title)}</h1>
  <p class="analogy">${esc(h.analogy)}</p>
  <h2>${esc(h.chart_title)}</h2>
  <div class="bars" role="img" aria-label="${esc(h.chart_title)}">
${bars}
  </div>
  <p class="note">${esc(h.chart_note)}</p>
  <h2>Three takeaways</h2>
  <ol>
${h.takeaways.map((t) => `    <li>${esc(t)}</li>`).join('\n')}
  </ol>
  <div class="cta"><strong>${esc(h.cta)}</strong>${esc(h.first_step)}</div>
  <footer>${esc(profile.name)} · ModelScope, a personal benchmarking project. Models: Llama-3.2-3B and Gemma-2-2B, 8 configs, T4 GPU.</footer>
</main>`);
}

// Shared content model so the HTML and Markdown versions cannot drift.
function review(loop, behavioral, presentation, domains) {
  const story = (id) => behavioral.stories.find((s) => s.id === id);
  const named = behavioral.lps.filter((lp) => lp.named).map((lp) => ({ lp: lp.name, story: story(lp.primary), backup: story(lp.backup) }));
  let at = 0;
  const sections = presentation.sections.map((s) => { const start = at; at += s.seconds; return { ...s, start, end: at }; });
  return { named, sections, domains: domains.domains };
}

export function finalReviewHtml(loop, behavioral, presentation, domains) {
  const r = review(loop, behavioral, presentation, domains);
  const css = `
  .two { display: grid; grid-template-columns: 1fr 1fr; gap: 0.2in; }
  .slots { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.05in; font-size: 9.5pt; }
  .slots li { border: 1px solid var(--line); border-radius: 6px; padding: 0.04in 0.06in; }
  .box { list-style: none; padding: 0; } .box li::before { content: "\\2610  "; }
  .cue { border-left: 4px solid var(--accent); padding-left: 0.1in; margin-bottom: 0.08in; }
  .cue p { margin: 0 0 0.02in; font-size: 10pt; }
  td.term { width: 27%; font-weight: 700; }
  td .probe { color: var(--muted); font-size: 8pt; display: block; margin-top: 0.02in; }
  body { font-size: 10pt; }
  h1 { font-size: 17pt; }
  table { font-size: 9pt; }
  h2 { font-size: 12.5pt; margin-top: 0.1in; }`;
  const dayOf = `<section class="page">
  <p class="kicker">Final review · ${esc(loop.req.title)}</p>
  <h1>Wednesday, October 28: the day</h1>
  <p><strong>Arrive by ${esc(loop.event.arrive)}.</strong> Interviews ${esc(loop.event.window)}, ${esc(loop.event.location)}.</p>
  <ul class="slots">
${loop.schedule.map((s) => `    <li><strong>${esc(s.time)}</strong><br>${esc(s.label)}</li>`).join('\n')}
  </ul>
  <div class="two">
    <div>
      <h2>Bring</h2>
      <ul class="box">
${loop.day_of.bring.map((b) => `        <li>${esc(b.text)}</li>`).join('\n')}
      </ul>
      <p class="muted">No laptop and no slides for the presentation.</p>
    </div>
    <div>
      <h2>Answer rubric</h2>
      <ul>
${loop.answer_rubric.map((n) => `        <li>${esc(n)}</li>`).join('\n')}
      </ul>
    </div>
  </div>
  <h2>The 8 named LPs: open with</h2>
  <table>
    <thead><tr><th>LP</th><th>Lead story and first sentence</th><th>Backup</th></tr></thead>
    <tbody>
${r.named.map((n) => `      <tr><td class="term">${esc(n.lp)}</td><td>${esc(`${n.story.code} ${n.story.title}`)}<span class="probe">${esc(n.story.headline)}</span></td><td>${esc(n.backup.code)}</td></tr>`).join('\n')}
    </tbody>
  </table>
  <p class="muted">Failure story: ${esc(behavioral.samples.find((s) => s.gap === 'failure')?.opener.includes('[fill:') ? 'write it in the worksheet before the day.' : 'ready.')}</p>
</section>`;
  const cue = `<section class="page break">
  <p class="kicker">Presentation cue card · ${clock(presentation.target_seconds)} target</p>
  <h1>${esc(presentation.title)} ${esc(presentation.subtitle)}</h1>
${r.sections.map((s) => `  <div class="cue">
    <p><strong>${esc(s.label)}</strong> <span class="muted">${clock(s.start)} to ${clock(s.end)}</span></p>
    <p>${esc(s.say)}</p>
    <p class="muted">${esc(s.cues.slice(0, 2).join(' '))}</p>
  </div>`).join('\n')}
  <p><strong>Warnings:</strong> ${presentation.warnings.map((w) => esc(w.text)).join(' ')}</p>
  <p><strong>Call to action:</strong> ${esc(presentation.handout.cta)}</p>
</section>`;
  const domainPages = r.domains.map((d) => `<section class="page break">
  <p class="kicker">${esc(d.role)} · ${d.questions.length} questions in the bank</p>
  <h1>${esc(d.name)}</h1>
  <table>
    <thead><tr><th>Concept</th><th>In one line, and what they probe</th></tr></thead>
    <tbody>
${d.cheatsheet.slice(0, TOP_CONCEPTS).map((c) => `      <tr><td class="term">${esc(c.term)}</td><td>${esc(c.def)}<span class="probe">Probe: ${esc(c.probe)}</span></td></tr>`).join('\n')}
    </tbody>
  </table>
</section>`).join('\n');
  return doc('Final review', css, `<main>
<p class="noprint page">Print with Cmd+P or Ctrl+P on Letter paper. One page per section: the day, the talk, then each domain.</p>
${dayOf}
${cue}
${domainPages}
</main>`);
}

export function finalReviewMd(loop, behavioral, presentation, domains) {
  const r = review(loop, behavioral, presentation, domains);
  const lines = [
    '# Final review: Amazon SA loop, October 28, 2026',
    '',
    'Generated from `data/*.json` by `scripts/print_pages.mjs`. The printable version is [final-review.html](final-review.html).',
    '',
    '## The day',
    '',
    `Arrive by ${loop.event.arrive}. Interviews ${loop.event.window}, ${loop.event.location}.`,
    '',
    ...loop.schedule.map((s) => `- **${s.time}** ${s.label}`),
    '',
    '**Bring:**',
    '',
    ...loop.day_of.bring.map((b) => `- [ ] ${b.text}`),
    '',
    ...loop.day_of.notes.map((n) => `- ${n}`),
    '',
    '## Answer rubric',
    '',
    ...loop.answer_rubric.map((n) => `- ${n}`),
    '',
    '## The 8 named LPs: open with',
    '',
    '| LP | Lead story | First sentence | Backup |',
    '|---|---|---|---|',
    ...r.named.map((n) => `| ${n.lp} | ${n.story.code} ${cell(n.story.title)} | ${cell(n.story.headline)} | ${n.backup.code} |`),
    '',
    `## Presentation cue card: ${presentation.title} ${presentation.subtitle}`,
    '',
    ...r.sections.flatMap((s) => [`**${s.label}** (${clock(s.start)} to ${clock(s.end)}): ${s.say}`, '']),
    `**Call to action:** ${presentation.handout.cta}`,
    '',
  ];
  for (const d of r.domains) {
    lines.push(`## ${d.name}`, '', '| Concept | In one line | What they probe |', '|---|---|---|',
      ...d.cheatsheet.map((c) => `| ${cell(c.term)} | ${cell(c.def)} | ${cell(c.probe)} |`), '');
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

export function renderAll() {
  const [loop, behavioral, presentation, domains, profile] = ['loop', 'behavioral', 'presentation', 'domains', 'profile'].map(read);
  return {
    'presentation-handout.html': handout(presentation, profile),
    'final-review.html': finalReviewHtml(loop, behavioral, presentation, domains),
    'FINAL-REVIEW.md': finalReviewMd(loop, behavioral, presentation, domains),
  };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  for (const [file, text] of Object.entries(renderAll())) writeFileSync(new URL(`../${file}`, import.meta.url), text);
  console.log('wrote presentation-handout.html, final-review.html, FINAL-REVIEW.md');
}
