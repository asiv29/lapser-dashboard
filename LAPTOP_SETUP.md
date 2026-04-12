# Lapser Dashboard: Laptop Server Setup

This guide walks you through setting up Lapser on your laptop to run as a persistent server, syncing code changes from your Mac via GitHub.

## Prerequisites

- Node.js installed on laptop
- Git installed on laptop
- GitHub account with `lapser-dashboard` repo created
- SSH key set up for GitHub (optional but recommended for easier git operations)

## Setup Steps

### 1. Clone the Repository on Laptop

```bash
# Navigate to your projects folder (adjust path as needed)
cd ~/Desktop/Projects

# Clone the repo
git clone https://github.com/YOUR_USERNAME/lapser-dashboard.git
cd lapser-dashboard

# Install dependencies
npm install

# You're ready!
```

### 2. Start the Server on Laptop

```bash
npm start
# Server will start on http://localhost:4000
```

Or if you want to see live logs:
```bash
npm run dev
# Same server, but with --watch flag for auto-restart on file changes
```

### 3. Access the Dashboard

Open in browser: **http://localhost:4000**

You should see:
- MRR counter (top left)
- Hours counter (top right)
- Wave background animation
- Header with logo, clock, **Update** button, and settings

## The Update Workflow

### On Your Mac (Development)

1. **Make code changes** in VS Code or editor
   - Edit `public/app.js`, `public/style.css`, `public/index.html`, or `server.js`

2. **Test locally** (optional)
   - Run `npm start` on Mac to verify changes

3. **Commit and push to GitHub**
   ```bash
   git add .
   git commit -m "Your change description"
   git push origin main
   ```

### On Your Laptop (Running Server)

1. **Click the "Update" button** in the dashboard header (next to ⚙️)
   - Button shows: "⟳ Update"
   - During update: "⟳ Updating..."
   - On success: "✓ Updated!" (then auto-reloads page)

2. **What happens**:
   - Server runs: `git pull origin main`
   - Pulls latest code from GitHub
   - Page reloads automatically
   - New code is live immediately

3. **If update fails**:
   - Button shows: "✗ Update failed"
   - Check browser console for error
   - Make sure you have internet connection
   - Make sure git is set up with GitHub credentials

## Workflow in Practice

**Scenario:** You add a new feature on your Mac

```bash
# Mac: Make changes
# $ nano public/app.js  # or edit in VS Code

# Mac: Test locally
# $ npm start

# Mac: Push to GitHub
$ git add public/app.js
$ git commit -m "Add new feature"
$ git push origin main

# Then: Go to http://localhost:4000 on your laptop

# Laptop: Click "Update" button
# → "⟳ Updating..." (pulls code)
# → "✓ Updated!" (auto-reloads)
# → See your new feature live!
```

## Troubleshooting

### "Update failed: not a git repository"
- Make sure you ran `git clone` (not just copied files)
- Check: `git status` should work

### "Update failed: Permission denied"
- GitHub credentials not set up
- Try: `git config --global user.email "your@email.com"`
- Try: `git config --global user.name "Your Name"`
- Or use SSH keys for GitHub

### "Update failed: branch 'main' not found"
- Make sure you pushed to `main` branch on Mac
- Check: `git branch -a` to see available branches

### Server won't start
- Check Node.js is installed: `node --version`
- Check port 4000 is free: `lsof -i :4000`
- If occupied, change port in this guide's examples

### Can't access http://localhost:4000
- Make sure server is running: `npm start`
- Check firewall isn't blocking port 4000
- Try: `curl http://localhost:4000`

## Optional: Keeping Server Running

If you want the server to keep running after you close the terminal:

### Option A: Background Process
```bash
nohup npm start > lapser.log 2>&1 &
# To kill: pkill -f "npm start"
```

### Option B: macOS LaunchAgent (Recommended)
Create `~/Library/LaunchAgents/com.lapser.dashboard.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.lapser.dashboard</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/YOUR/PATH/lapser-dashboard/server.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/lapser-dashboard.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/lapser-dashboard-error.log</string>
    <key>WorkingDirectory</key>
    <string>/YOUR/PATH/lapser-dashboard</string>
</dict>
</plist>
```

Then:
```bash
launchctl load ~/Library/LaunchAgents/com.lapser.dashboard.plist
# To check: launchctl list | grep lapser
# To unload: launchctl unload ~/Library/LaunchAgents/com.lapser.dashboard.plist
```

## Next Steps

1. Create GitHub repo at https://github.com/new
2. Run on Mac:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/lapser-dashboard.git
   git push -u origin main
   ```
3. Clone on laptop (follow Step 1 above)
4. Start server (follow Step 2 above)
5. Test Update workflow (follow Step 3 above)

## Support

If something doesn't work:
1. Check the logs: `npm start` shows server output
2. Check browser console: F12 or Cmd+Option+I
3. Check git status: `git status` and `git log`
4. Verify GitHub connection: `git ls-remote origin`

---

**Enjoy your Lapser Dashboard! 🚀**

Every click of the "Update" button syncs your Mac changes to the laptop instantly.
