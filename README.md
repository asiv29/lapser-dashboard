# Lapser Dashboard

A beautiful, ADHD-optimized productivity dashboard for tracking MRR (Monthly Recurring Revenue) and productive hours.

## Features

- 💰 **MRR Tracking**: Log and visualize monthly revenue with growth indicators
- ⏰ **Hours Logging**: Track productive work hours with daily goals
- 🎨 **Luxury Design**: Apple-inspired dark mode with smooth animations
- 🌊 **Wave Background**: Real-time color-reactive background based on performance
- 📊 **Stats Dashboard**: Weekly revenue, daily averages, consistency metrics
- 🎮 **Gamification**: Streak counter and XP system for motivation
- 📱 **Responsive**: Works on desktop, tablet, and mobile

## Quick Start

### Mac (Development)
```bash
npm install
npm run dev
# Server runs on http://localhost:4000
```

### Laptop (Production)
```bash
npm install
npm start
# Server runs on http://localhost:4000
# Use "Update" button in UI to pull latest code changes from GitHub
```

## Architecture

- **Backend**: Express.js + SQLite
- **Frontend**: Vanilla JavaScript (React conversion coming soon)
- **Database**: Single-file SQLite (dashboard.db)
- **Styling**: Apple design system with Tailwind CSS

## Workflow

1. **Code on Mac**: Edit files, test locally
2. **Commit & Push**: Push changes to GitHub
3. **Update on Laptop**: Click "Update" button in dashboard
4. **Server Restarts**: Dashboard pulls latest code and reloads

## API Endpoints

- `GET /api/stats` - Current stats (today's hours, MRR, streak, etc.)
- `GET /api/mrr` - Historical MRR entries
- `POST /api/mrr` - Add/update MRR
- `GET /api/sessions` - Work sessions
- `POST /api/sessions` - Log work session
- `DELETE /api/sessions/:date` - Delete sessions for date
- `POST /api/update` - Pull latest code and restart (laptop only)

## Development

The project uses a simple setup optimized for fast iteration:
- No build step (vanilla JS)
- LocalStorage for goals persistence
- Real-time stats refreshing every 30 seconds

## TODO

- [ ] React + shadcn/ui conversion
- [ ] Modals for add/update UI
- [ ] OpenClaw integration for AI suggestions
- [ ] Voice input for logging
- [ ] Advanced charts and analytics
