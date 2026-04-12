# 🔄 Auto-Sync Setup for Lapser

Code here in Claude Code automatically syncs to your Mac laptop.

## Option 1: GitHub (Easiest)

```bash
# On your Mac, in the lapser_dashboard folder:
git init
git remote add origin https://github.com/YOUR_USERNAME/lapser-dashboard.git
git branch -M main
git add .
git commit -m "Initial commit"
git push -u origin main

# Then set up auto-pull:
cat > ~/Library/LaunchAgents/com.lapser.sync.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.lapser.sync</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>-c</string>
        <string>cd ~/Desktop/Projects/lapser_dashboard && git pull -q</string>
    </array>
    <key>StartInterval</key>
    <integer>30</integer>
</dict>
</plist>
EOF

launchctl load ~/Library/LaunchAgents/com.lapser.sync.plist
```

## Option 2: Local Git Server (Fastest)

On your Mac:
```bash
# Create a bare repo
mkdir -p ~/.lapser-sync.git && cd ~/.lapser-sync.git
git init --bare

# Clone it to your working folder
cd ~/Desktop/Projects/lapser_dashboard
git init
git remote add origin ~/.lapser-sync.git
git add .
git commit -m "Initial"
git push -u origin main

# Auto-pull every 30 seconds:
while true; do git pull -q 2>/dev/null; sleep 30; done &
```

## Option 3: Simple rsync

On your Mac:
```bash
# Auto-sync from Claude Code to Mac (run on your Mac):
while true; do
  rsync -avz --delete "Claude Code folder" ~/Desktop/Projects/lapser_dashboard/
  sleep 30
done &
```

---

## How to Use

### From Claude Code (this session):
```bash
git add -A
git commit -m "Update: better colors"
git push
```

### On your Mac:
The `git pull` runs automatically every 30 seconds, so changes appear instantly.

To manually sync:
```bash
cd ~/Desktop/Projects/lapser_dashboard
git pull
```

---

**Recommended:** Option 1 (GitHub) for security. Option 2 (Local) for speed.
