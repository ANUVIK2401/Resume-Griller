// Real browser regression test. Serve repo root at BASE_URL, install playwright or set PLAYWRIGHT_MODULE.
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:8000';
// Allow a newly started CI server a brief startup window.
for (let attempt = 0; ; attempt++) {
  try { const response = await fetch(base); if (response.ok) break; } catch {}
  if (attempt >= 30) throw new Error(`Test server unavailable at ${base}`);
  await new Promise(resolve => setTimeout(resolve, 100));
}
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, timezoneId: 'America/New_York' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const visit = async path => {
  await page.goto(`${base}/${path}`);
  await page.waitForFunction(() => document.querySelector('main')?.textContent.trim().length > 100);
  assert.equal(await page.getByRole('alert').count(), 0, `${path} failed to render`);
  assert.equal(await page.locator('h1').count(), 1);
};
try {
  await visit('index.html');
  await page.getByRole('link', { name: /Open today's plan/ }).click();
  await page.locator('#plan').waitFor();
  assert.equal(await page.locator('#plan .plan-day').count(), 7);
  assert.equal(await page.locator('#rounds .stage').count(), 4);
  assert.match(await page.locator('#countdown').innerText(), /Confirmed by the recruiter/);
  assert.match(await page.locator('#day-of').innerText(), /Printed resume, 5 copies/);
  const musts = (await page.locator('#readout').innerText()).match(/0 \/ (\d+)/);
  assert.ok(musts, 'readout starts at zero');
  await page.locator('#day-p1022 input[type="checkbox"]').first().check();
  assert.match(await page.locator('#readout').innerText(), new RegExp(`1 / ${musts[1]}`));
  await page.reload();
  assert.equal(await page.locator('#day-p1022 input[type="checkbox"]').first().isChecked(), true);
  for (const path of ['domains', 'presentation']) await visit(`amazon/${path}.html`);
  await visit('amazon/domains.html');
  assert.ok(await page.locator('#ai-ml details.dq').count() >= 45);
  assert.ok(await page.locator('svg.fig-svg').count() >= 6);
  await page.locator('#ai-ml details.dq summary').first().click();
  assert.match(await page.locator('#ai-ml details.dq').first().innerText(), /Explain it simply/);
  await visit('amazon/presentation.html');
  await page.locator('#practice').getByRole('button', { name: 'Start', exact: true }).click();
  await page.waitForFunction(() => /Now: Hook/.test(document.querySelector('.talk-now').textContent));
  await page.locator('#practice').getByRole('button', { name: 'Pause', exact: true }).click();
  for (const box of await page.locator('#practice fieldset.rubric input').all()) await box.check();
  await page.getByRole('button', { name: 'Save this run', exact: true }).click();
  assert.match(await page.locator('#practice').innerText(), /6 \/ 6/);
  for (const path of ['review', 'behavioral', 'cheatsheet', 'architecture', 'aws', 'design', 'questions', 'mock']) await visit(`amazon/${path}.html`);
  await visit('amazon/architecture.html');
  assert.equal(await page.locator('svg.arch-svg').count(), 8);
  await page.locator('#pattern-ha-web').getByRole('button', { name: 'Trace the request' }).click();
  assert.equal(await page.locator('#pattern-ha-web svg.arch-svg.is-tracing').count(), 1);
  assert.ok(await page.locator('#pattern-ha-web .arch-edge.is-on').count() >= 1);
  await page.getByRole('tab', { name: 'Databases' }).click();
  assert.equal(await page.locator('#panel-database').isVisible(), true);
  await visit('amazon/behavioral.html#story-erp-hitl');
  await page.locator('#story-erp-hitl[open]').waitFor();
  assert.doesNotMatch(await page.locator('#story-erp-hitl .star').innerText(), /fill:|confirm:|reported/i);
  await visit('amazon/review.html');
  const story = page.locator('#review-erp-hitl');
  await story.locator('summary').first().click();
  const editor = story.getByRole('textbox');
  await story.getByRole('button', { name: 'Load answer into empty editor', exact: true }).click();
  assert.match(await editor.inputValue(), /MSRcosmos/);
  await editor.fill('My confirmed scope: implemented the review router.'); await editor.blur();
  await story.getByRole('button', { name: 'Load answer into empty editor', exact: true }).click();
  assert.equal(await editor.inputValue(), 'My confirmed scope: implemented the review router.');
  await page.reload(); await story.locator('summary').first().click();
  assert.equal(await editor.inputValue(), 'My confirmed scope: implemented the review router.');
  await page.getByPlaceholder('Search story reviews').fill('no-such-interview-story');
  assert.match(await page.locator('#story-review').innerText(), /No stories match/);
  await page.getByPlaceholder('Search story reviews').fill('');
  assert.equal(await page.locator('#story-review details.item').count(), 12);
  await visit('amazon/cheatsheet.html');
  assert.equal(await page.getByLabel('All priorities', { exact: true }).inputValue(), 'P0');
  const decisionSearch = page.getByPlaceholder('Search decisions, tradeoffs or failure modes');
  await decisionSearch.fill('idempotency');
  assert.equal(await page.getByLabel('All priorities', { exact: true }).inputValue(), 'P0');
  assert.ok(await page.locator('#decisions article').count() > 0);
  await decisionSearch.fill('');
  await page.locator('#decisions input[type="checkbox"]').first().check();
  assert.match(await page.locator('#readout').innerText(), /1 \/ 23/);
  await page.getByRole('button', { name: 'Rehearse shown decisions', exact: true }).click();
  await page.locator('dialog').waitFor({ state: 'visible' });
  await page.keyboard.press('Escape');
  await page.locator('dialog').waitFor({ state: 'hidden' });
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export progress to a file', exact: true }).click();
  const download = await downloadEvent;
  await page.locator('#decisions input[type="checkbox"]').first().uncheck();
  await Promise.all([page.waitForEvent('load'), page.locator('input[type="file"]').setInputFiles(await download.path())]);
  await page.locator('#decisions article').first().waitFor();
  assert.equal(await page.locator('#decisions input[type="checkbox"]').first().isChecked(), true);
  await visit('amazon/mock.html');
  await page.getByRole('button', { name: 'Start a mock day', exact: true }).click();
  await page.getByRole('button', { name: 'Begin round', exact: true }).click();
  await page.getByRole('button', { name: 'Show hint after answering', exact: true }).click();
  while (await page.getByRole('button', { name: 'Next', exact: true }).count()) await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Finish round and score', exact: true }).click();
  const groups = page.locator('#day fieldset.rubric');
  assert.ok(await groups.count() >= 6);
  assert.doesNotMatch(await groups.nth(2).innerText(), /STAR complete|Said "I"/);
  for (const box of await groups.locator('input').all()) await box.check();
  await page.getByRole('button', { name: 'Save round', exact: true }).click();
  await page.getByRole('button', { name: 'Begin round', exact: true }).waitFor();
  assert.match(await page.locator('#day').innerText(), /Round 2 of 4/);
  await page.reload();
  assert.match(await page.locator('#history').innerText(), /(\d+) \/ \1/);
  await page.getByRole('button', { name: 'Resume round 2', exact: true }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['index', 'domains', 'behavioral', 'presentation', 'mock', 'review', 'cheatsheet']) {
    await visit(`amazon/${path}.html`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${path}: mobile overflow`);
  }
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await page.locator('.side-nav').getByRole('link', { name: 'AWS cheat sheet', exact: true }).click();
  await page.locator('#main section').first().waitFor();
  if (process.env.SCREENSHOT_DIR) {
    mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
    await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/cheatsheet-mobile.png`, fullPage: false });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await visit('amazon/review.html');
    await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/review-desktop.png`, fullPage: false });
  }
  assert.deepEqual(errors, []);
  console.log('Browser checks passed: 12 routes, confirmed loop plan, domain figures, presentation timer and saved run, mock day resume, traceable architecture diagrams, saved progress, private draft preservation, cheat sheet filters/flashcards, export/import, tailored mock scoring, mobile layout and navigation.');
} finally { await browser.close(); }
