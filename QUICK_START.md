# 🚀 Quick Start - Lapser Dashboard

## Laptop Setup (One-Time)

```bash
git clone https://github.com/asiv29/lapser-dashboard.git
cd lapser-dashboard
npm install
```

## Start the Server

### Mac or Linux
```bash
./start-laptop.sh
```

### Windows
```bash
start-laptop.bat
```

### Or Manual (Any OS)
```bash
npm start
```

**Server runs on:** http://localhost:4000

---

## Update Code Changes

1. **On Mac**: Edit files → Commit → Push to GitHub
   ```bash
   git add .
   git commit -m "Your change"
   git push
   ```

2. **On Laptop**: Click **"⟳ Update"** button in dashboard header
   - Pulls latest code from GitHub
   - Auto-reloads page

Done! 🎉

---

## Troubleshooting

- **Port 4000 already in use?** Change in `server.js` line 6: `const PORT = 3000`
- **npm not found?** Install Node.js from nodejs.org
- **Update button not working?** Make sure you're on the internet and have pushed to GitHub
- **More help?** See `LAPTOP_SETUP.md` for detailed troubleshooting
