// Site-wide browser sweep. Serve the repo root first (python3 -m http.server 8000), then:
//   node shared/test_pages.mjs
// Loads every page at phone and desktop width in light and dark mode. Fails on console
// errors, page errors, failed or non-2xx/304 local requests, and horizontal overflow.
// SCREENSHOT_DIR saves a full-page PNG per page and theme. PLAYWRIGHT_MODULE points at
// an existing Playwright ESM module; BASE_URL overrides localhost.
import { readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:8000/').replace(/\/?$/, '/');
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const shots = process.env.SCREENSHOT_DIR;
if (shots) mkdirSync(shots, { recursive: true });

const htmlIn = (dir) => readdirSync(join(root, dir)).filter((n) => n.endsWith('.html')).map((n) => (dir ? `${dir}/${n}` : n));
const pages = [...htmlIn(''), ...htmlIn('salesforce'), ...htmlIn('amazon')];
const VIEWPORTS = [{ name: 'phone', width: 390, height: 844 }, { name: 'desktop', width: 1280, height: 900 }];
const THEMES = ['light', 'dark'];

const browser = await chromium.launch(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {});
const problems = [];
for (const vp of VIEWPORTS) {
  for (const theme of THEMES) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, colorScheme: theme });
    for (const path of pages) {
      const page = await context.newPage();
      const where = `${path} [${vp.name}, ${theme}]`;
      page.on('console', (m) => { if (m.type() === 'error') problems.push(`${where}: console error: ${m.text()}`); });
      page.on('pageerror', (e) => problems.push(`${where}: page error: ${e.message}`));
      page.on('requestfailed', (r) => { if (r.url().startsWith(BASE)) problems.push(`${where}: request failed: ${r.url()}`); });
      page.on('response', (r) => { if (r.url().startsWith(BASE) && r.status() >= 400) problems.push(`${where}: ${r.status()} ${r.url()}`); });
      await page.goto(BASE + path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(150);
      const failed = await page.locator('.notice.is-error').count();
      if (failed) problems.push(`${where}: renders the data-load error notice`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 1) problems.push(`${where}: horizontal overflow of ${overflow}px`);
      if (shots && vp.name === 'phone') await page.screenshot({ path: join(shots, `${path.replace(/\//g, '_')}-${theme}.png`), fullPage: true });
      await page.close();
    }
    await context.close();
  }
}
await browser.close();
if (problems.length) {
  console.error(`Page sweep failed, ${problems.length} problem(s):\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`Page sweep passed: ${pages.length} pages x ${VIEWPORTS.length} widths x ${THEMES.length} themes, no console errors, failed requests, or overflow.`);
