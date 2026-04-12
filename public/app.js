/* ── Config ──────────────────────────────────────────────────────────────── */
let GOAL_HOURS = 6;
let GOAL_MRR = 10000;

// ADHD-optimized color gradient: vibrant, high-saturation, high-contrast
// Red → Orange → Yellow → Cyan → Bright Green
const COLORS = [
  { score: 0,   r: 255, g: 20,  b: 20  },   // Vibrant Red
  { score: 20,  r: 255, g: 100, b: 0   },   // Bold Orange
  { score: 40,  r: 255, g: 180, b: 0   },   // Bright Yellow
  { score: 60,  r: 0,   g: 200, b: 255 },   // Cyan (dopamine peak)
  { score: 80,  r: 0,   g: 220, b: 100 },   // Bright Green-Cyan
  { score: 100, r: 50,  g: 255, b: 100 },   // Bright Lime Green
];

/* ── State ───────────────────────────────────────────────────────────────── */
let stats = {}, mrrData = [];
let waveColor = { r: 10, g: 210, b: 120 };
let waveTarget = { r: 10, g: 210, b: 120 };

/* ── Init ────────────────────────────────────────────────────────────────── */
async function init() {
  loadGoals();
  initHeaderVisibility(); // Show header on load and mouse movement
  startClock();
  await refresh();
  setInterval(refresh, 30_000);
  setupWaveCanvas();
  animateWaves();
}

async function refresh() {
  stats = await fetch('/api/stats').then(r => r.json());
  mrrData = await fetch('/api/mrr').then(r => r.json());
  render();
}

/* ── Goals ───────────────────────────────────────────────────────────────── */
function loadGoals() {
  const h = localStorage.getItem('goal-hours');
  const m = localStorage.getItem('goal-mrr');

  if (h) GOAL_HOURS = parseFloat(h);
  if (m) GOAL_MRR = parseFloat(m);

  document.getElementById('goal-hours').value = GOAL_HOURS;
  document.getElementById('goal-mrr').value = GOAL_MRR;
}

function saveGoals() {
  GOAL_HOURS = parseFloat(document.getElementById('goal-hours').value) || 6;
  GOAL_MRR = parseFloat(document.getElementById('goal-mrr').value) || 10000;

  localStorage.setItem('goal-hours', GOAL_HOURS);
  localStorage.setItem('goal-mrr', GOAL_MRR);

  closeModal('settings');
  render();
}

/* ── Clock ───────────────────────────────────────────────────────────────── */
function startClock() {
  const el = document.getElementById('live-clock');
  const tick = () => {
    const n = new Date();
    el.textContent = n.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' }).toUpperCase()
      + ' ' + n.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
  };
  tick();
  setInterval(tick, 1000);
}

/* ── Update screen border color based on performance ──────────────────────── */
function updateBorderColor() {
  const score = getPerformanceScore(
    stats.today?.hours || 0,
    GOAL_HOURS,
    stats.mrr?.current || 0,
    GOAL_MRR
  );
  const color = scoreToColor(score);
  document.documentElement.style.setProperty('--border-r', Math.round(color.r));
  document.documentElement.style.setProperty('--border-g', Math.round(color.g));
  document.documentElement.style.setProperty('--border-b', Math.round(color.b));
}

/* ── Render ──────────────────────────────────────────────────────────────── */
function render() {
  renderMRR();
  renderHours();
  renderInsights();
  updateWaveColor();
  updateBorderColor();
}

function getCardState(pct) {
  if (pct >= 100) return 'green';
  if (pct >= 80) return 'cyan';
  if (pct >= 60) return 'yellow';
  if (pct >= 40) return 'orange';
  if (pct === 0) return 'red';
  return 'orange';
}

function renderMRR() {
  const current = stats.mrr?.current ?? 0;
  const growth = stats.mrr?.growth;
  const pct = Math.min(100, (current / GOAL_MRR) * 100);

  const card = document.getElementById('card-mrr');
  const val = document.getElementById('val-mrr');
  const prog = document.getElementById('prog-mrr');
  const text = document.getElementById('text-mrr');

  animateValue(val, current, 1200, v => '$' + Math.round(v).toLocaleString());
  text.textContent = `$${Math.round(current).toLocaleString()} / $${GOAL_MRR.toLocaleString()} goal`;

  setTimeout(() => { prog.style.width = pct + '%'; }, 150);

  card.className = 'card card-mrr ' + getCardState(pct);
}

function renderHours() {
  const hours = stats.today?.hours ?? 0;
  const pct = Math.min(100, (hours / GOAL_HOURS) * 100);

  const card = document.getElementById('card-hours');
  const val = document.getElementById('val-hours');
  const prog = document.getElementById('prog-hours');
  const text = document.getElementById('text-hours');
  const deleteBtn = document.getElementById('btn-delete-hours');

  animateValue(val, hours, 900, v => v.toFixed(1) + 'h');
  text.textContent = `${hours.toFixed(1)}h / ${GOAL_HOURS}h goal`;

  setTimeout(() => { prog.style.width = pct + '%'; }, 150);

  // Show delete button if there are hours
  deleteBtn.style.display = hours > 0 ? 'block' : 'none';

  card.className = 'card card-hours ' + getCardState(pct);
}

async function deleteHoursForToday() {
  const today = new Date().toISOString().split('T')[0];
  if (!confirm('Delete all hours logged for today?')) return;
  await fetch(`/api/sessions/${today}`, { method: 'DELETE' });
  await refresh();
}

function renderInsights() {
  // Weekly MRR (sum of last 7 days)
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekStart = weekAgo.toISOString().substring(0, 7);
  const weeklyMRR = mrrData.filter(d => d.year_month >= weekStart).reduce((s, d) => s + d.amount, 0);

  // Weekly hours
  const weeklyHours = stats.weeklyHours ?? 0;

  // Daily average (last 7 days)
  const lastSevenSessions = sessionsData.slice(-7);
  const dailyAvg = lastSevenSessions.length > 0
    ? (lastSevenSessions.reduce((s, d) => s + d.hours, 0) / 7)
    : 0;

  // Consistency (days logged in last 7 days)
  const consistencyPct = lastSevenSessions.length > 0 ? (lastSevenSessions.length / 7) * 100 : 0;

  animateValue(document.getElementById('weekly-mrr'), weeklyMRR, 1000, v => '$' + Math.round(v).toLocaleString());
  animateValue(document.getElementById('weekly-hours'), weeklyHours, 900, v => v.toFixed(1) + 'h');
  animateValue(document.getElementById('daily-avg'), dailyAvg, 900, v => v.toFixed(1) + 'h');
  animateValue(document.getElementById('consistency'), consistencyPct, 1000, v => Math.round(v) + '%');
}

function animateValue(el, to, dur, fmt) {
  const from = parseFloat(el.dataset.cur ?? 0) || 0;
  el.dataset.cur = to;
  const start = performance.now();
  const step = now => {
    const t = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = fmt(from + (to - from) * ease);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ── Wave color logic ────────────────────────────────────────────────────── */
function getPerformanceScore() {
  const hoursScore = Math.min(100, (stats.today?.hours ?? 0) / GOAL_HOURS * 100);
  const mrrScore = Math.min(100, (stats.mrr?.current ?? 0) / GOAL_MRR * 100);
  return Math.round((hoursScore + mrrScore) / 2);
}

function scoreToColor(score) {
  const s = Math.min(Math.max(score, 0), 100);
  for (let i = 1; i < COLORS.length; i++) {
    const lo = COLORS[i - 1], hi = COLORS[i];
    if (s <= hi.score) {
      const t = (s - lo.score) / (hi.score - lo.score);
      return {
        r: Math.round(lo.r + (hi.r - lo.r) * t),
        g: Math.round(lo.g + (hi.g - lo.g) * t),
        b: Math.round(lo.b + (hi.b - lo.b) * t),
      };
    }
  }
  return { ...COLORS[COLORS.length - 1] };
}

function lerpColor(cur, target, speed = 0.018) {
  return {
    r: cur.r + (target.r - cur.r) * speed,
    g: cur.g + (target.g - cur.g) * speed,
    b: cur.b + (target.b - cur.b) * speed,
  };
}

function updateWaveColor() {
  const score = getPerformanceScore();
  waveTarget = scoreToColor(score);
}

/* ── Wave canvas ─────────────────────────────────────────────────────────── */
const wCanvas = document.getElementById('wave-canvas');
const wCtx = wCanvas.getContext('2d');
let wavePhase = 0;

function setupWaveCanvas() {
  wCanvas.width = window.innerWidth;
  wCanvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    wCanvas.width = window.innerWidth;
    wCanvas.height = window.innerHeight;
  });
}

function animateWaves() {
  waveColor = lerpColor(waveColor, waveTarget);

  const root = document.documentElement;
  root.style.setProperty('--wr', Math.round(waveColor.r));
  root.style.setProperty('--wg', Math.round(waveColor.g));
  root.style.setProperty('--wb2', Math.round(waveColor.b));

  const W = wCanvas.width, H = wCanvas.height;
  wCtx.clearRect(0, 0, W, H);

  const waves = [
    { amp: H * 0.055, freq: 0.0016, speed: 0.008,  yBase: H * 0.72, alpha: 0.07 },
    { amp: H * 0.040, freq: 0.0022, speed: 0.012,  yBase: H * 0.80, alpha: 0.09 },
    { amp: H * 0.028, freq: 0.0030, speed: 0.018,  yBase: H * 0.88, alpha: 0.11 },
    { amp: H * 0.018, freq: 0.0040, speed: 0.024,  yBase: H * 0.94, alpha: 0.13 },
  ];

  const { r, g, b } = waveColor;

  waves.forEach(({ amp, freq, speed, yBase, alpha }, i) => {
    const phase = wavePhase * speed * (i % 2 === 0 ? 1 : -1);
    wCtx.beginPath();
    wCtx.moveTo(0, H);
    for (let x = 0; x <= W; x += 3) {
      const y = yBase + Math.sin(x * freq + phase) * amp
                      + Math.sin(x * freq * 1.6 + phase * 1.3) * amp * 0.4;
      wCtx.lineTo(x, y);
    }
    wCtx.lineTo(W, H);
    wCtx.closePath();

    const grad = wCtx.createLinearGradient(0, yBase - amp, 0, H);
    grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    wCtx.fillStyle = grad;
    wCtx.fill();
  });

  wavePhase++;
  requestAnimationFrame(animateWaves);
}

/* ── Modals ──────────────────────────────────────────────────────────────── */
function openModal(id) {
  document.getElementById(`modal-${id}`).classList.add('open');
  setTimeout(() => {
    const first = document.querySelector(`#modal-${id} .field-input`);
    if (first) first.focus();
  }, 180);
}

function closeModal(id) {
  document.getElementById(`modal-${id}`).classList.remove('open');
}

/* ── Submit handlers ─────────────────────────────────────────────────────── */
async function submitMRR() {
  const amount = parseFloat(document.getElementById('in-mrr').value);
  if (isNaN(amount) || amount < 0) return;

  const year_month = new Date().toISOString().substring(0, 7);
  await fetch('/api/mrr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, year_month }),
  });

  closeModal('mrr');
  document.getElementById('in-mrr').value = '';
  await refresh();
}

async function submitHours() {
  const hours = parseFloat(document.getElementById('in-hours').value);
  if (isNaN(hours) || hours <= 0) return;

  const date = new Date().toISOString().split('T')[0];
  await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hours, date }),
  });

  closeModal('hours');
  document.getElementById('in-hours').value = '';
  await refresh();
}

async function deleteHoursForDate(date) {
  if (!confirm(`Delete all hours logged for ${date}?`)) return;
  await fetch(`/api/sessions/${date}`, { method: 'DELETE' });
  await refresh();
}

/* ── Keyboard ────────────────────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal('mrr');
    closeModal('hours');
    closeModal('settings');
  }
  if (e.key === 'Enter') {
    if (document.getElementById('modal-mrr').classList.contains('open')) submitMRR();
    if (document.getElementById('modal-hours').classList.contains('open')) submitHours();
  }
});

/* ── Header visibility (show on page load + mouse movement) ────────────── */
function initHeaderVisibility() {
  const header = document.getElementById('header');
  if (!header) return;

  // Show header on page load (give users a hint it's there)
  header.style.opacity = '1';
  header.style.transform = 'translateY(0)';

  // Hide after 3 seconds of no movement
  let hideTimeout;
  function hideHeader() {
    hideTimeout = setTimeout(() => {
      header.style.opacity = '0';
      header.style.transform = 'translateY(-100%)';
    }, 3000);
  }

  // Show on mouse movement
  document.addEventListener('mousemove', () => {
    clearTimeout(hideTimeout);
    header.style.opacity = '1';
    header.style.transform = 'translateY(0)';
    hideHeader();
  });

  // Start hide timer
  hideHeader();
}

/* ── Update endpoint (pull latest code from GitHub) ──────────────────────── */
async function updateCode() {
  const btn = document.getElementById('btn-update');
  if (!btn) return;

  btn.disabled = true;
  btn.textContent = '⟳';
  btn.style.opacity = '0.5';

  try {
    const res = await fetch('/api/update', { method: 'POST' });
    const data = await res.json();

    if (data.ok) {
      btn.textContent = '✓';
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      btn.textContent = '⟳';
      btn.disabled = false;
      btn.style.opacity = '1';
      alert('Update failed: ' + (data.error || 'Unknown error'));
    }
  } catch (err) {
    btn.textContent = '⟳';
    btn.disabled = false;
    btn.style.opacity = '1';
    alert('Error: ' + err.message);
  }
}

/* ── Go ──────────────────────────────────────────────────────────────────── */
init();
