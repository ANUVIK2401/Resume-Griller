/* ============ Resume → STAR ============ */

const input = document.getElementById('resume-input');
const generateBtn = document.getElementById('generate-btn');
const results = document.getElementById('results');

const METRIC_RE = /(\d[\d,.]*\s?%|\$\s?\d[\d,.]*\s?[kKmMbB]?|\b\d[\d,.]*\s?(x|ms|hrs?|hours?|days?|weeks?|months?|users?|customers?|requests?|reps?)\b)/i;

function splitBullets(text) {
  return text
    .split('\n')
    .map(line => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
}

function lowerFirst(str) {
  return str ? str.charAt(0).toLowerCase() + str.slice(1) : str;
}

function findPrewritten(bullet) {
  if (typeof STAR_DATA === 'undefined') return null;
  const match = STAR_DATA.find(entry => entry.bullet.trim() === bullet.trim());
  return match || null;
}

function buildStar(bullet) {
  const prewritten = findPrewritten(bullet);
  if (prewritten) {
    return {
      situation: prewritten.situation,
      task: prewritten.task,
      action: prewritten.action,
      result: prewritten.result,
    };
  }

  const metricMatch = bullet.match(METRIC_RE);
  const metric = metricMatch ? metricMatch[0] : null;

  const situation = `Fill in the context: what problem or need existed before this?`;
  const task = `I was responsible for ${lowerFirst(bullet)}`;
  const action = `I ${lowerFirst(bullet)}`;
  const result = metric
    ? `This resulted in ${metric}.`
    : `Fill in the specific outcome or number here.`;

  return { situation, task, action, result };
}

function renderCard(bullet) {
  const star = buildStar(bullet);

  const card = document.createElement('div');
  card.className = 'star-card';

  const bulletEl = document.createElement('div');
  bulletEl.className = 'bullet';
  bulletEl.textContent = bullet;
  card.appendChild(bulletEl);

  const rows = [
    ['S', star.situation],
    ['T', star.task],
    ['A', star.action],
    ['R', star.result],
  ];

  rows.forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'star-row';

    const labelEl = document.createElement('div');
    labelEl.className = 'label';
    labelEl.textContent = label;

    const valueEl = document.createElement('div');
    valueEl.className = 'value';
    valueEl.contentEditable = 'true';
    valueEl.textContent = value;

    row.appendChild(labelEl);
    row.appendChild(valueEl);
    card.appendChild(row);
  });

  return card;
}

function generate() {
  const bullets = splitBullets(input.value);
  results.innerHTML = '';

  if (bullets.length === 0) {
    const hint = document.createElement('div');
    hint.className = 'empty-hint';
    hint.textContent = 'Paste at least one resume bullet above to get started.';
    results.appendChild(hint);
    return;
  }

  bullets.forEach(bullet => {
    results.appendChild(renderCard(bullet));
  });
}

generateBtn.addEventListener('click', generate);

if (typeof STAR_DATA !== 'undefined' && STAR_DATA.length > 0) {
  input.value = STAR_DATA.map(entry => entry.bullet).join('\n');
  generate();
}
