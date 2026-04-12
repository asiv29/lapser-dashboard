# 🚀 Quick Start - Lapser Dashboard (Laptop)

## Setup (One-Time Only)

### Option 1: Download ZIP (Easiest)
1. Go to: https://github.com/asiv29/lapser-dashboard
2. Click green **"Code"** button → **"Download ZIP"**
3. Extract/unzip the folder
4. Open Terminal/Command Prompt in that folder
5. Run:

**Mac/Linux:**
```bash
./setup.sh
```

**Windows:**
```bash
setup.bat
```

That's it! Setup automatically installs everything.

---

### Option 2: Clone with Git
```bash
git clone https://github.com/asiv29/lapser-dashboard.git
cd lapser-dashboard
npm install
```

---

## Start the Server (Every Time)

### Mac or Linux
```bash
./start-laptop.sh
```

### Windows
```bash
start-laptop.bat
```

**Server runs on:** http://localhost:4000

---

## Update Code Changes

1. **On Mac**: Make changes → Commit → Push to GitHub
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

- **"Port 4000 already in use?"** → Change in `server.js` line 6: `const PORT = 3000`
- **"npm not found?"** → Install Node.js from https://nodejs.org/
- **"Update button not working?"** → Make sure internet is on and you pushed to GitHub
- **More help?** → See `LAPTOP_SETUP.md` for detailed guide
