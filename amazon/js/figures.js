// Small concept diagrams from data: stack, pyramid, flow, sequence, tree.
// Inline SVG built with createElementNS so data strings stay text; colors come from CSS tokens.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const W = 600;
  const CHAR_PX = 7.6; // ponytail: rough width per character at 14px, good enough to keep labels inside the frame
  let markerSeq = 0;

  function node(tag, attrs, ...children) {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) if (v !== undefined && v !== null) n.setAttribute(k, v);
    for (const c of children.flat()) if (c !== null && c !== undefined) n.append(typeof c === 'string' ? document.createTextNode(c) : c);
    return n;
  }
  const text = (x, y, str, cls = 'fig-text', anchor = 'middle') => node('text', { x, y, class: cls, 'text-anchor': anchor, 'dominant-baseline': 'middle' }, String(str));
  const box = (x, y, w, h, cls = 'fig-box') => node('rect', { x, y, width: w, height: h, rx: 8, class: cls });

  function frame(height, title, body) {
    const id = `fig-arrow-${(markerSeq += 1)}`;
    const svg = node('svg', { viewBox: `0 0 ${W} ${height}`, class: 'fig-svg', role: 'img', 'aria-label': title, preserveAspectRatio: 'xMidYMin meet' },
      node('title', {}, title),
      node('defs', {}, node('marker', { id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' },
        node('path', { d: 'M0 0 10 5 0 10z', class: 'fig-head' }))),
      body(`url(#${id})`));
    return svg;
  }

  function stack(fig) {
    const rowH = 40;
    return frame(fig.items.length * (rowH + 6) + 4, fig.title, () => fig.items.map((item, i) => {
      const y = 2 + i * (rowH + 6);
      return node('g', {}, box(2, y, W - 4, rowH),
        text(18, y + rowH / 2, item.label, 'fig-text fig-strong', 'start'),
        item.sub ? text(W - 18, y + rowH / 2, item.sub, 'fig-text fig-muted', 'end') : null);
    }));
  }

  function pyramid(fig) {
    const rowH = 36;
    const n = fig.items.length;
    return frame(n * (rowH + 4) + 4, fig.title, () => fig.items.map((item, i) => {
      const w = W * (0.42 + (0.58 * i) / Math.max(1, n - 1));
      const y = 2 + i * (rowH + 4);
      const label = item.sub ? `${item.label} · ${item.sub}` : item.label;
      return node('g', {}, box((W - w) / 2, y, w, rowH, `fig-box fig-tier-${Math.min(i, 6)}`), text(W / 2, y + rowH / 2, label, 'fig-text fig-strong'));
    }));
  }

  // Vertical so it stays legible at phone width.
  function flow(fig) {
    const rowH = 42;
    const gap = 22;
    return frame(fig.items.length * (rowH + gap) - gap + 4, fig.title, (arrow) => fig.items.map((item, i) => {
      const y = 2 + i * (rowH + gap);
      return node('g', {}, box(60, y, W - 120, rowH),
        text(W / 2, y + (item.sub ? rowH / 2 - 8 : rowH / 2), item.label, 'fig-text fig-strong'),
        item.sub ? text(W / 2, y + rowH / 2 + 10, item.sub, 'fig-text fig-muted') : null,
        i < fig.items.length - 1 ? node('line', { x1: W / 2, y1: y + rowH, x2: W / 2, y2: y + rowH + gap - 2, class: 'fig-line', 'marker-end': arrow }) : null);
    }));
  }

  function sequence(fig) {
    const top = 36;
    const stepH = 40;
    const n = fig.actors.length;
    const xs = fig.actors.map((_, i) => (n === 1 ? W / 2 : 60 + (i * (W - 120)) / (n - 1)));
    const height = top + fig.steps.length * stepH + 16;
    return frame(height, fig.title, (arrow) => [
      ...fig.actors.map((a, i) => node('g', {}, box(xs[i] - 56, 2, 112, 26, 'fig-box fig-actor'), text(xs[i], 15, a, 'fig-text fig-strong'),
        node('line', { x1: xs[i], y1: 28, x2: xs[i], y2: height - 4, class: 'fig-life' }))),
      ...fig.steps.map((s, i) => {
        const y = top + i * stepH + 26;
        const [x1, x2] = [xs[s.from], xs[s.to]];
        const half = Math.min(W / 2 - 4, (String(s.label).length * CHAR_PX) / 2);
        const cx = Math.min(W - 4 - half, Math.max(4 + half, (x1 + x2) / 2));
        return node('g', {}, node('line', { x1, y1: y, x2: x1 === x2 ? x1 + 30 : x2, y2: y, class: 'fig-line', 'marker-end': arrow }),
          text(cx, y - 11, s.label, 'fig-text fig-small'));
      }),
    ]);
  }

  function tree(fig) {
    const levelH = 64;
    const nodeH = 30;
    const centers = fig.levels.map((level) => level.map((_, i) => ((i + 0.5) * W) / level.length));
    return frame(fig.levels.length * levelH - (levelH - nodeH) + 4, fig.title, () => fig.levels.flatMap((level, li) => level.map((label, i) => {
      const w = Math.min(130, W / level.length - 8);
      const y = 2 + li * levelH;
      const parents = fig.levels[li - 1];
      const parent = parents ? Math.min(parents.length - 1, Math.floor((i * parents.length) / level.length)) : null;
      return node('g', {},
        parent !== null ? node('line', { x1: centers[li - 1][parent], y1: y - levelH + nodeH, x2: centers[li][i], y2: y, class: 'fig-line' }) : null,
        box(centers[li][i] - w / 2, y, w, nodeH, li === fig.levels.length - 1 ? 'fig-box fig-leaf' : 'fig-box'),
        text(centers[li][i], y + nodeH / 2, label, 'fig-text fig-small'));
    })));
  }

  const DRAW = { stack, pyramid, flow, sequence, tree };

  function figure(fig) {
    const draw = DRAW[fig.type];
    if (!draw) return null;
    const { el } = window.Prep;
    return el('figure', { class: 'fig' }, draw(fig), el('figcaption', { class: 'label' }, fig.title));
  }

  window.Prep.figure = figure;
})();
