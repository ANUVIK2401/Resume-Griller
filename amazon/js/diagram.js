// Architecture diagrams drawn as native SVG from a small grid spec, in the style of AWS
// reference architectures: category-coloured service tiles, boundary groups (Region, VPC,
// subnets), and numbered orange step badges that light up the request path.
//
// Spec: { cols, rows, nodes: [{ id, label, sub?, cat, at: [col, row] }],
//         groups?: [{ label, kind, from: [col, row], to: [col, row] }],
//         edges: [{ from, to, label?, step?, route?: 'hv' | 'vh', dashed? }] }
// ponytail: grid placement plus elbow routing, no auto-layout. Specs place nodes by hand,
// which keeps diagrams readable; add a layout engine only if specs become hard to maintain.
(function () {
  const CELL_W = 236, CELL_H = 118, NODE_W = 136, NODE_H = 62, PAD = 24;
  const CHAR_W = 6.7, BADGE_W = 22, LINE_MAX = 16, SUB_MAX = 19;

  const CATS = {
    client: 'Client', edge: 'Networking and edge', compute: 'Compute', container: 'Containers',
    storage: 'Storage', database: 'Database', security: 'Security and identity',
    integration: 'Integration', analytics: 'Analytics', ml: 'AI and ML', mgmt: 'Operations',
    iot: 'IoT', media: 'Media', external: 'External system',
  };
  const GROUP_KINDS = ['region', 'vpc', 'az', 'public', 'private', 'edge', 'onprem', 'generic'];

  const center = ([c, r]) => ({ x: PAD + c * CELL_W + CELL_W / 2, y: PAD + r * CELL_H + CELL_H / 2 });

  // Splits a tile label into lines of at most LINE_MAX characters on word boundaries.
  function wrapLines(value) {
    const lines = [''];
    for (const word of String(value).split(' ')) {
      const line = lines[lines.length - 1];
      if (line && (line + ' ' + word).length > LINE_MAX) lines.push(word); else lines[lines.length - 1] = line ? `${line} ${word}` : word;
    }
    return lines;
  }

  function validate(spec) {
    const errors = [];
    const ids = new Set();
    for (const n of spec.nodes) {
      if (ids.has(n.id)) errors.push(`duplicate node ${n.id}`);
      ids.add(n.id);
      if (!CATS[n.cat]) errors.push(`node ${n.id}: unknown category ${n.cat}`);
      const [c, r] = n.at;
      if (c < 0 || r < 0 || c >= spec.cols || r >= spec.rows) errors.push(`node ${n.id}: outside the grid`);
      if (wrapLines(n.label).length > 2) errors.push(`node ${n.id}: label needs more than two lines`);
      if (n.sub && (n.sub.length > SUB_MAX || wrapLines(n.label).length > 1)) errors.push(`node ${n.id}: subtitle too long or label wraps (max ${SUB_MAX} characters on a one-line label)`);
    }
    const cells = new Set();
    for (const n of spec.nodes) {
      const key = n.at.join(',');
      if (cells.has(key)) errors.push(`node ${n.id}: shares cell ${key}`);
      cells.add(key);
    }
    for (const e of spec.edges) {
      if (!ids.has(e.from) || !ids.has(e.to)) errors.push(`edge ${e.from} to ${e.to}: unknown node`);
      if (e.from === e.to) errors.push(`edge ${e.from}: loops to itself`);
    }
    for (const g of spec.groups || []) if (!GROUP_KINDS.includes(g.kind)) errors.push(`group ${g.label}: unknown kind ${g.kind}`);
    if (errors.length) return errors;
    // Geometry: labels must fit their segment, and no line may cross a tile it does not connect.
    const L = layout(spec);
    for (const g of L.groups) if (!g.labelClear) errors.push(`group ${g.label}: label has no clear spot on its border`);
    for (const e of L.edges) {
      const name = `edge ${e.from} to ${e.to}`;
      const need = e.anchor.vertical ? 26 : pillWidth(e) + 6;
      if ((e.label || e.step) && e.anchor.len < need) errors.push(`${name}: label "${e.label || e.step}" needs ${Math.round(need)}px, segment is ${Math.round(e.anchor.len)}px`);
      for (const n of L.nodes) {
        if (n.id === e.from || n.id === e.to) continue;
        if (e.points.some((p, i) => i && crosses(e.points[i - 1], p, n))) errors.push(`${name}: crosses ${n.id}`);
      }
    }
    return errors;
  }

  const pillWidth = (e) => (e.step ? BADGE_W : 0) + (e.label ? e.label.length * CHAR_W + 12 + (e.step ? 2 : 0) : 0);

  // Axis-aligned segment against a tile rectangle.
  function crosses([x1, y1], [x2, y2], n) {
    const left = n.x - NODE_W / 2, right = n.x + NODE_W / 2, top = n.y - NODE_H / 2, bottom = n.y + NODE_H / 2;
    if (y1 === y2) return y1 > top && y1 < bottom && Math.max(x1, x2) > left && Math.min(x1, x2) < right;
    return x1 > left && x1 < right && Math.max(y1, y2) > top && Math.min(y1, y2) < bottom;
  }

  // Orthogonal path between tile borders. Same row or column: straight. Otherwise an elbow,
  // horizontal first by default so the bend sits in the gap between columns.
  function route(a, b, mode) {
    const p = center(a.at), q = center(b.at);
    const sx = Math.sign(q.x - p.x), sy = Math.sign(q.y - p.y);
    if (p.y === q.y) return { points: [[p.x + sx * NODE_W / 2, p.y], [q.x - sx * NODE_W / 2, q.y]] };
    if (p.x === q.x) return { points: [[p.x, p.y + sy * NODE_H / 2], [q.x, q.y - sy * NODE_H / 2]] };
    if (mode === 'vh') {
      const start = [p.x, p.y + sy * NODE_H / 2];
      return { points: [start, [p.x, q.y], [q.x - sx * NODE_W / 2, q.y]] };
    }
    const mx = (p.x + q.x) / 2;
    const midX = Math.abs(q.x - p.x) > CELL_W ? q.x - sx * CELL_W / 2 : mx;
    return { points: [[p.x + sx * NODE_W / 2, p.y], [midX, p.y], [midX, q.y], [q.x - sx * NODE_W / 2, q.y]] };
  }

  // Label anchor: middle of the longest segment.
  function anchor(points) {
    let best = null;
    for (let i = 1; i < points.length; i += 1) {
      const [x1, y1] = points[i - 1], [x2, y2] = points[i];
      const len = Math.hypot(x2 - x1, y2 - y1);
      if (!best || len > best.len) best = { len, x: (x1 + x2) / 2, y: (y1 + y2) / 2, vertical: x1 === x2 };
    }
    return best;
  }

  function groupBoxes(spec) {
    const groups = spec.groups || [];
    const contains = (o, i) => o.from[0] <= i.from[0] && o.from[1] <= i.from[1] && o.to[0] >= i.to[0] && o.to[1] >= i.to[1];
    return groups.map((g) => {
      const depth = groups.filter((o) => o !== g && contains(o, g)).length;
      const inset = 4 + depth * 7;
      return {
        ...g,
        x: PAD + g.from[0] * CELL_W + inset,
        y: PAD + g.from[1] * CELL_H + inset - 4,
        w: (g.to[0] - g.from[0] + 1) * CELL_W - inset * 2,
        h: (g.to[1] - g.from[1] + 1) * CELL_H - inset * 2 + 8,
      };
    });
  }

  const groupLabelWidth = (g) => g.label.length * 7 + 14;

  // Rectangles a group label must not cover: edge label pills and vertical lines through the border.
  function obstacles(edges) {
    const out = [];
    for (const e of edges) {
      if (e.label || e.step) {
        const w = pillWidth(e), { x, y } = e.anchor;
        out.push({ x1: x - w / 2, x2: x + w / 2, y1: y - 11, y2: y + 11 });
      }
      e.points.forEach((p, i) => {
        const q = e.points[i - 1];
        if (q && q[0] === p[0]) out.push({ x1: p[0] - 3, x2: p[0] + 3, y1: Math.min(q[1], p[1]), y2: Math.max(q[1], p[1]) });
      });
    }
    return out;
  }

  // Slides each group label right along its top border until it is clear; falls back to the left edge.
  function placeLabels(groups, edges) {
    const blocks = obstacles(edges);
    return groups.map((g) => {
      const w = groupLabelWidth(g);
      const hit = (x) => blocks.some((b) => b.x1 < x + w && b.x2 > x && b.y1 < g.y + 9 && b.y2 > g.y - 9);
      let labelX = g.x + 10;
      while (hit(labelX) && labelX + w < g.x + g.w - 10) labelX += 12;
      return { ...g, labelX: hit(labelX) ? g.x + 10 : labelX, labelW: w, labelClear: !hit(labelX) };
    });
  }

  function layout(spec) {
    const byId = new Map(spec.nodes.map((n) => [n.id, n]));
    const edges = spec.edges.map((e) => {
      const { points } = route(byId.get(e.from), byId.get(e.to), e.route);
      return { ...e, points, anchor: anchor(points) };
    });
    return {
      width: PAD * 2 + spec.cols * CELL_W,
      height: PAD * 2 + spec.rows * CELL_H,
      groups: placeLabels(groupBoxes(spec), edges),
      nodes: spec.nodes.map((n) => ({ ...n, ...center(n.at) })),
      edges,
      categories: [...new Set(spec.nodes.map((n) => n.cat))],
    };
  }

  const api = { layout, validate, CATS, GROUP_KINDS, NODE_W, NODE_H };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window === 'undefined') return;

  const NS = 'http://www.w3.org/2000/svg';
  let seq = 0;
  function s(tag, attrs = {}, ...kids) {
    const node = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null && v !== false) node.setAttribute(k, String(v));
    for (const kid of kids.flat()) if (kid != null) node.append(kid);
    return node;
  }
  const text = (attrs, value) => { const t = s('text', attrs); t.textContent = value; return t; };


  function svg(spec, title) {
    const L = layout(spec);
    seq += 1;
    const arrow = `arch-arrow-${seq}`, arrowOn = `arch-arrow-on-${seq}`;
    const heading = s('title', { id: `arch-title-${seq}` });
    heading.textContent = title;
    const root = s('svg', { class: 'arch-svg', viewBox: `0 0 ${L.width} ${L.height}`, role: 'img', 'aria-labelledby': `arch-title-${seq}` }, heading);
    // ponytail: fixed 0.8 floor keeps tile text near 12px; below that the figure scrolls sideways.
    root.style.setProperty('--arch-min', `${Math.round(L.width * 0.8)}px`);
    root.append(s('defs', {},
      s('marker', { id: arrow, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, s('path', { d: 'M0 0L10 5L0 10z', class: 'arch-head' })),
      s('marker', { id: arrowOn, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, s('path', { d: 'M0 0L10 5L0 10z', class: 'arch-head is-on' }))));

    for (const g of L.groups) {
      root.append(s('g', { class: `arch-group kind-${g.kind}` },
        s('rect', { x: g.x, y: g.y, width: g.w, height: g.h, rx: 10, class: 'arch-group-box' }),
        s('rect', { x: g.labelX, y: g.y - 8, width: g.labelW, height: 16, rx: 8, class: 'arch-group-pill' }),
        text({ x: g.labelX + 7, y: g.y + 4, class: 'arch-group-label' }, g.label)));
    }

    const edgeLayer = s('g', { class: 'arch-edges' });
    const labelLayer = s('g', { class: 'arch-labels' });
    for (const e of L.edges) {
      const d = e.points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
      edgeLayer.append(s('path', { d, class: `arch-edge${e.dashed ? ' is-dashed' : ''}`, 'data-step': e.step, 'data-from': e.from, 'data-to': e.to,
        'marker-end': `url(#${arrow})`, 'data-marker': arrow, 'data-marker-on': arrowOn }));
      if (!e.label && !e.step) continue;
      const { x, y } = e.anchor;
      const label = e.label || '';
      const badgeW = e.step ? BADGE_W : 0;
      const textW = label.length * CHAR_W;
      const w = pillWidth(e);
      const left = x - w / 2;
      labelLayer.append(s('g', { class: 'arch-edge-label', 'data-step': e.step },
        label ? s('rect', { x: left + badgeW - (e.step ? 4 : 0), y: y - 9, width: textW + 12 + (e.step ? 4 : 0), height: 18, rx: 9, class: 'arch-pill' }) : null,
        e.step ? s('circle', { cx: left + 11, cy: y, r: 11, class: 'arch-badge' }) : null,
        e.step ? text({ x: left + 11, y: y + 4, class: 'arch-badge-num', 'text-anchor': 'middle' }, String(e.step)) : null,
        label ? text({ x: left + badgeW + 6 + (e.step ? 2 : 0), y: y + 4, class: 'arch-edge-text' }, label) : null));
    }
    root.append(edgeLayer);

    for (const n of L.nodes) {
      const x = n.x - NODE_W / 2, y = n.y - NODE_H / 2;
      const lines = wrapLines(n.label);
      const hasSub = Boolean(n.sub) && lines.length === 1;
      const top = n.y - ((lines.length - 1) * 9) - (hasSub ? 7 : 0) + 5;
      root.append(s('g', { class: `arch-node cat-${n.cat}`, 'data-node': n.id },
        s('rect', { x, y, width: NODE_W, height: NODE_H, rx: 9, class: 'arch-tile' }),
        s('rect', { x, y, width: 5, height: NODE_H, rx: 2.5, class: 'arch-strip' }),
        ...lines.map((line, i) => text({ x: n.x + 3, y: top + i * 18, class: 'arch-node-label', 'text-anchor': 'middle' }, line)),
        hasSub ? text({ x: n.x + 3, y: top + 18, class: 'arch-node-sub', 'text-anchor': 'middle' }, n.sub) : null));
    }
    root.append(labelLayer);
    return { root, layout: L };
  }

  // Lights up one step: its edges, their endpoints, and any nodes the step names.
  function trace(root, step, extraNodes = []) {
    root.classList.toggle('is-tracing', step != null);
    const on = new Set(extraNodes);
    root.querySelectorAll('.arch-edge').forEach((p) => {
      const hit = step != null && p.dataset.step === String(step);
      p.classList.toggle('is-on', hit);
      p.setAttribute('marker-end', `url(#${hit ? p.dataset.markerOn : p.dataset.marker})`);
      if (hit) { on.add(p.dataset.from); on.add(p.dataset.to); }
    });
    root.querySelectorAll('.arch-edge-label').forEach((g) => g.classList.toggle('is-on', step != null && g.dataset.step === String(step)));
    root.querySelectorAll('.arch-node').forEach((g) => g.classList.toggle('is-on', on.has(g.dataset.node)));
  }

  // Diagram plus legend plus a numbered step list; pressing a step lights up its path.
  // steps: [{ text, nodes? }]. Returns { figure, steps } DOM nodes.
  function figure(spec, steps, title) {
    const { el } = window.Prep;
    const { root, layout: L } = svg(spec, title);
    let active = null;
    const buttons = steps.map((step, i) => el('button', {
      class: 'trace-step', type: 'button', 'aria-pressed': 'false',
      onclick: () => select(active === i + 1 ? null : i + 1),
    }, el('span', { class: 'trace-num', 'aria-hidden': 'true' }, String(i + 1)), el('span', {}, step.text)));
    const prev = el('button', { class: 'btn btn-sm', type: 'button', disabled: true, onclick: () => select(Math.max(1, (active || 1) - 1)) }, 'Previous');
    const next = el('button', { class: 'btn btn-sm btn-gold', type: 'button', onclick: () => select(active === steps.length ? 1 : (active || 0) + 1) }, 'Trace the request');
    function select(n) {
      active = n;
      trace(root, n, n ? steps[n - 1].nodes || [] : []);
      buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i + 1 === n)));
      prev.disabled = !n || n === 1;
      next.textContent = n === steps.length ? 'Start over' : n ? 'Next step' : 'Trace the request';
    }
    const legend = el('ul', { class: 'arch-legend', 'aria-label': 'Legend' },
      L.categories.map((c) => el('li', { class: `cat-${c}` }, el('span', { class: 'swatch', 'aria-hidden': 'true' }), CATS[c])),
      el('li', {}, el('span', { class: 'trace-num', 'aria-hidden': 'true' }, '1'), 'Step in the flow'));
    const scroller = el('div', { class: 'arch-scroll', tabindex: '0', 'aria-label': `${title}. Scrolls sideways when the screen is narrow.` }, root);
    const fig = el('figure', { class: 'arch-figure' }, scroller, legend);
    // Show the sideways hint only when the diagram really overflows on this screen.
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => fig.classList.toggle('can-scroll', scroller.scrollWidth > scroller.clientWidth + 1)).observe(scroller);
    return {
      figure: fig,
      steps: el('div', { class: 'trace' }, el('div', { class: 'row trace-controls' }, prev, next), el('ol', { class: 'trace-list' }, buttons.map((b) => el('li', {}, b)))),
    };
  }

  window.Prep = window.Prep || {};
  window.Prep.arch = { ...api, svg, trace, figure };
})();
