import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:8000';
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
try {
  for (const [path, id] of [['review', 'review-erp-hitl'], ['design', 'design-rag-chatbot'], ['behavioral', 'failure'], ['domains', 'q-net-url-enter']]) {
    await page.goto(`${base}/amazon/${path}.html#${id}`);
    await page.locator(`#${id}`).waitFor({ state: 'attached' });
    await page.waitForFunction(() => document.querySelector('#toc a'));
    const state = await page.locator(`#${id}`).evaluate(target => {
      const folds = [];
      for (let node = target; node; node = node.parentElement) if (node.tagName === 'DETAILS') folds.push(node.open);
      return { open: folds.every(Boolean), top: target.getBoundingClientRect().top };
    });
    assert.ok(state.open, `${path} deep link must open containing details`);
    assert.ok(state.top < 1000, `${path} target should be scrolled into view`);
  }
  await page.goto(`${base}/amazon/review.html`);
  await page.locator('#review-erp-hitl').waitFor();
  await page.evaluate(() => { location.hash = '#review-p1-mttr'; });
  await page.waitForFunction(() => document.getElementById('review-p1-mttr').open);
  await page.evaluate(() => {
    Object.defineProperty(Storage.prototype, 'setItem', { configurable: true, value() { throw new DOMException('quota exceeded', 'QuotaExceededError'); } });
  });
  await page.locator('#review-p1-mttr input[type="checkbox"]').check();
  assert.match(await page.locator('#storage-message').innerText(), /export before leaving/i);
  assert.match(await page.locator('#storage-message').innerText(), /memory/i);
  console.log('Navigation checks passed: initial fragments, hash changes, hidden ancestors and failed-storage recovery.');
} finally { await browser.close(); }
