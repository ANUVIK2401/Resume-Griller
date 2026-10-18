// Interview bar: one strip on every page that switches between the Salesforce and Amazon
// modules, shows each interview's countdown, and lists the current module's pages.
// Interview dates come from each module's data/loop.json, so updating the loop updates the bar.
(function () {
  const ZONE = 'America/Los_Angeles';
  const MODULES = [
    { id: 'salesforce', name: 'Salesforce', round: 'Hiring manager', href: 'salesforce/index.html',
      date: (loop) => loop.stages.find((s) => s.id === 'hm')?.default_date },
    { id: 'amazon', name: 'Amazon', round: 'Solutions Architect', href: 'amazon/index.html',
      date: (loop) => loop.event?.date || loop.event?.target_date },
  ];

  // Calendar-day difference in Pacific time, so "today" matches the interview's own clock.
  function pacificDay(date) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
    return Date.parse(`${parts}T00:00:00Z`);
  }
  function countdown(iso, now = new Date()) {
    if (!iso) return null;
    const [day, time] = iso.split('T');
    const target = Date.parse(`${day}T00:00:00Z`);
    if (Number.isNaN(target)) return null;
    const days = Math.round((target - pacificDay(now)) / 86400000);
    const when = new Date(`${day}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
    const at = time ? ` ${time.slice(0, 5)}` : '';
    if (days < 0) return { days, short: 'done', long: `${when}, done` };
    if (days === 0) return { days, short: 'today', long: `Today${at}` };
    return { days, short: `${days}d`, long: `${when}${at} · ${days === 1 ? 'tomorrow' : `in ${days} days`}` };
  }

  if (typeof module !== 'undefined' && module.exports) { module.exports = { countdown }; return; }

  const script = document.currentScript;
  const root = new URL('../', script.src);
  const active = MODULES.find((m) => location.pathname.includes(`/${m.id}/`));

  function el(tag, attrs = {}, ...kids) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) if (v != null && v !== false) node.setAttribute(k, v === true ? '' : v);
    node.append(...kids.flat().filter((k) => k != null));
    return node;
  }

  function build() {
    const tabs = MODULES.map((m) => {
      const when = el('span', { class: 'gx-when' }, m.round);
      const link = el('a', { class: `gx-tab gx-${m.id}`, href: new URL(m.href, root).href, 'aria-current': m === active ? 'true' : null },
        el('span', { class: 'gx-dot', 'aria-hidden': 'true' }), el('span', { class: 'gx-name' }, m.name), when);
      fetch(new URL(`${m.id}/data/loop.json`, root)).then((r) => (r.ok ? r.json() : null)).then((loop) => {
        const c = loop && countdown(m.date(loop));
        if (!c) return;
        when.replaceChildren(el('span', { class: 'gx-long' }, `${m.round} · ${c.long}`), el('span', { class: 'gx-short' }, c.short));
        link.dataset.days = c.days;
        link.title = `${m.name} ${m.round}: ${c.long}`;
        markNext();
      }).catch(() => {}); // ponytail: countdown is decorative; the tab still navigates without it.
      return link;
    });
    function markNext() {
      const upcoming = tabs.filter((t) => Number(t.dataset.days) >= 0).sort((a, b) => a.dataset.days - b.dataset.days);
      tabs.forEach((t) => t.classList.toggle('is-next', t === upcoming[0]));
    }

    const pages = el('nav', { class: 'gx-pages', 'aria-label': active ? `${active.name} pages` : 'Pages' });
    if (active) {
      fetch(new URL(`${active.id}/data/site.json`, root)).then((r) => r.json()).then((site) => {
        const here = document.body.dataset.page;
        pages.replaceChildren(...site.pages.map((p) => el('a', { href: new URL(`${active.id}/${p.href}`, root).href, 'aria-current': p.id === here ? 'page' : null }, p.short || p.label)));
      }).catch(() => {});
    }

    const bar = el('div', { class: 'gx-bar' },
      el('a', { class: 'gx-home', href: new URL('index.html', root).href, 'aria-label': 'All interview prep', title: 'All interview prep' },
        el('span', { class: 'gx-mark', 'aria-hidden': 'true' }, 'RG')),
      el('nav', { class: 'gx-tabs', 'aria-label': 'Interviews' }, tabs), pages);
    // Keep the skip link as the first thing a keyboard user reaches.
    const skip = document.body.querySelector(':scope > .skip');
    if (skip) skip.after(bar); else document.body.prepend(bar);
  }

  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
