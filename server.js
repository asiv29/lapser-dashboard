const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
require('dotenv').config();

const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 4000;
const db = new DatabaseSync(path.join(__dirname, 'dashboard.db'));

// ── Google OAuth Setup ────────────────────────────────────────────────────────
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  // Store tokens in profile for session
  profile.accessToken = accessToken;
  profile.refreshToken = refreshToken;
  return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ── Calendar Cache ───────────────────────────────────────────────────────────
let calendarCache = {
  tasks: [],
  timestamp: 0,
  ttl: (process.env.CALENDAR_CACHE_TTL || 600) * 1000
};

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// ── Schema ────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS mrr_entries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    year_month  TEXT NOT NULL UNIQUE,
    amount      REAL NOT NULL,
    note        TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS work_sessions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    date        TEXT NOT NULL,
    hours       REAL NOT NULL,
    description TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Helpers ───────────────────────────────────────────────────────────────────
function localDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function localYearMonth() {
  return localDate().substring(0, 7);
}

// ── MRR ───────────────────────────────────────────────────────────────────────
app.get('/api/mrr', (_req, res) => {
  const rows = db.prepare(`
    SELECT * FROM mrr_entries ORDER BY year_month ASC LIMIT 24
  `).all();
  res.json(rows);
});

app.post('/api/mrr', (req, res) => {
  const { amount, note, year_month } = req.body;
  const ym = year_month || localYearMonth();
  const existing = db.prepare('SELECT id FROM mrr_entries WHERE year_month = ?').get(ym);
  if (existing) {
    db.prepare(`
      UPDATE mrr_entries SET amount = ?, note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(amount, note || null, existing.id);
  } else {
    db.prepare(`
      INSERT INTO mrr_entries (year_month, amount, note) VALUES (?, ?, ?)
    `).run(ym, amount, note || null);
  }
  res.json({ ok: true, year_month: ym, amount });
});

// ── Work Sessions ─────────────────────────────────────────────────────────────
app.get('/api/sessions', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 30, 90);
  const rows = db.prepare(`
    SELECT date, SUM(hours) AS hours, GROUP_CONCAT(description, ' · ') AS description
    FROM work_sessions
    GROUP BY date
    ORDER BY date DESC
    LIMIT ?
  `).all(limit);
  res.json(rows.reverse());
});

app.post('/api/sessions', (req, res) => {
  const { hours, description, date } = req.body;
  const d = date || localDate();
  db.prepare('INSERT INTO work_sessions (date, hours, description) VALUES (?, ?, ?)').run(d, hours, description || null);
  res.json({ ok: true, date: d, hours });
});

app.delete('/api/sessions/:date', (req, res) => {
  const { date } = req.params;
  db.prepare('DELETE FROM work_sessions WHERE date = ?').run(date);
  res.json({ ok: true, deleted: date });
});

// ── Stats ─────────────────────────────────────────────────────────────────────
app.get('/api/stats', (_req, res) => {
  const today = localDate();
  const ym = localYearMonth();

  // Previous month
  const prevDate = new Date();
  prevDate.setDate(1);
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevYM = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  // Today's hours
  const todayHours = db.prepare(`
    SELECT COALESCE(SUM(hours), 0) AS h FROM work_sessions WHERE date = ?
  `).get(today).h;

  // MRR
  const currMRR = db.prepare('SELECT amount FROM mrr_entries WHERE year_month = ?').get(ym);
  const prevMRR = db.prepare('SELECT amount FROM mrr_entries WHERE year_month = ?').get(prevYM);

  const mrrCurrent = currMRR?.amount ?? 0;
  const mrrLast = prevMRR?.amount ?? null;
  const mrrGrowth = mrrLast && mrrLast > 0
    ? ((mrrCurrent - mrrLast) / mrrLast) * 100
    : null;

  // Streak — days with >= 1 h logged, consecutive going back from today
  const datesWithHours = db.prepare(`
    SELECT date FROM work_sessions
    GROUP BY date HAVING SUM(hours) >= 1
    ORDER BY date DESC
  `).all().map(r => r.date);

  let streak = 0;
  const check = new Date(today + 'T00:00:00');
  for (let i = 0; i < 730; i++) {
    const ds = check.toISOString().split('T')[0];
    if (datesWithHours.includes(ds)) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else if (i === 0) {
      // Today not logged yet — still check yesterday to maintain live streak
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }

  // Weekly hours (Mon–today)
  const weekStart = new Date(today + 'T00:00:00');
  const dow = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - ((dow + 6) % 7)); // ISO week (Mon)
  const weeklyHours = db.prepare(`
    SELECT COALESCE(SUM(hours), 0) AS h FROM work_sessions WHERE date >= ?
  `).get(weekStart.toISOString().split('T')[0]).h;

  // Monthly hours
  const monthlyHours = db.prepare(`
    SELECT COALESCE(SUM(hours), 0) AS h FROM work_sessions WHERE date LIKE ?
  `).get(`${ym}%`).h;

  // Total hours all-time (used for XP/level)
  const totalHours = db.prepare(`
    SELECT COALESCE(SUM(hours), 0) AS h FROM work_sessions
  `).get().h;

  res.json({
    today: { date: today, hours: todayHours },
    mrr: { current: mrrCurrent, last: mrrLast, growth: mrrGrowth },
    streak,
    weeklyHours,
    monthlyHours,
    xp: Math.round(totalHours),
    totalHours,
  });
});

// ── Update endpoint (for laptop: pull latest code from GitHub) ──────────────
app.post('/api/update', (_req, res) => {
  const { exec } = require('child_process');

  console.log('🔄 Update requested: pulling latest code from GitHub...');

  exec('git pull origin main', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Git pull failed:', error.message);
      return res.status(500).json({
        ok: false,
        error: error.message,
        stderr
      });
    }

    console.log('✅ Git pull successful');
    console.log(stdout);

    // Return success but don't restart (let client reload page)
    res.json({
      ok: true,
      message: 'Code updated from GitHub. Reload the page to see changes.',
      output: stdout
    });
  });
});

// ── Google OAuth Routes ──────────────────────────────────────────────────────
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

app.get('/auth/status', (req, res) => {
  if (req.user) {
    res.json({
      authenticated: true,
      email: req.user.emails?.[0]?.value || req.user.displayName
    });
  } else {
    res.json({ authenticated: false });
  }
});

app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    res.json({ ok: true });
  });
});

// ── Google Calendar API Routes ────────────────────────────────────────────────
async function getCalendarTasks(accessToken) {
  const calendar = google.calendar({ version: 'v3', auth: accessToken });

  try {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: futureDate.toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime',
      q: 'task' // Filter for tasks (optional)
    });

    // Map Google Calendar events to task format
    return (events.data.items || []).map(event => ({
      id: event.id,
      title: event.summary || 'Untitled',
      dueDate: event.start?.dateTime || event.start?.date || null,
      description: event.description || '',
      completed: event.status === 'cancelled' ? false : (event.extendedProperties?.private?.completed === 'true'),
      googleEvent: true
    }));
  } catch (error) {
    console.error('Calendar API error:', error.message);
    return [];
  }
}

app.get('/api/calendar/tasks', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ authenticated: false, tasks: [] });
  }

  try {
    // Check cache
    const now = Date.now();
    if (calendarCache.tasks.length > 0 && (now - calendarCache.timestamp) < calendarCache.ttl) {
      return res.json(calendarCache.tasks);
    }

    // Fetch fresh tasks
    const tasks = await getCalendarTasks(req.user.accessToken);

    // Update cache
    calendarCache.tasks = tasks;
    calendarCache.timestamp = now;

    res.json(tasks);
  } catch (error) {
    console.error('Calendar tasks error:', error);
    res.status(500).json({ error: error.message, tasks: [] });
  }
});

app.patch('/api/calendar/tasks/:taskId', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { taskId } = req.params;
  const { completed } = req.body;

  try {
    const calendar = google.calendar({ version: 'v3', auth: req.user.accessToken });

    // Get event
    const event = await calendar.events.get({
      calendarId: 'primary',
      eventId: taskId
    });

    // Update completion status
    event.data.status = completed ? 'cancelled' : 'confirmed';
    event.data.extendedProperties = {
      private: { completed: completed ? 'true' : 'false' }
    };

    // Update event
    await calendar.events.update({
      calendarId: 'primary',
      eventId: taskId,
      resource: event.data
    });

    // Clear cache
    calendarCache.tasks = [];
    calendarCache.timestamp = 0;

    // Return updated task
    res.json({
      id: taskId,
      title: event.data.summary,
      dueDate: event.data.start?.dateTime || event.data.start?.date,
      description: event.data.description || '',
      completed: completed
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── Boot ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ⬢  Lapser Dashboard → http://localhost:${PORT}\n`);
  console.log(`  📅 Google Calendar: ${process.env.GOOGLE_CLIENT_ID ? '✅ Connected' : '⚠️  Not configured'}\n`);
});
