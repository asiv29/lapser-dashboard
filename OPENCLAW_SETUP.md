# OpenClaw Setup on Laptop - ADHD-Assistant Edition

This guide sets up OpenClaw with the ADHD-assistant skill on your Windows laptop, integrated with WhatsApp for easy access.

## Prerequisites

- Node.js installed (should already have from Lapser setup)
- Git installed
- WhatsApp account
- DeepSeek API key (or your preferred LLM)
- OpenClaw gateway credentials (if using existing setup)

## Step 1: Clone OpenClaw Repository

On your **Windows laptop**, open Command Prompt and run:

```bash
cd Desktop/Projects
git clone https://github.com/openclaw/openclaw.git
cd openclaw
npm install
```

This clones the main OpenClaw repository.

## Step 2: Add ADHD-Assistant Skill

Clone the skills repository:

```bash
cd ../
git clone https://github.com/openclaw/skills.git
cd skills/skills/thinktankmachine/adhd-assistant
```

Copy the ADHD-assistant skill to your OpenClaw installation:

```bash
cp -r . ../../openclaw/skills/adhd-assistant
```

Or manually copy the files from the skills repo to:
```
openclaw/
├── skills/
│   └── adhd-assistant/
│       ├── SKILL.md
│       ├── index.js
│       └── ...
```

## Step 3: Configure OpenClaw

Create a `.env` file in your OpenClaw root:

```bash
cd openclaw
```

Create `.env` with:

```env
# LLM Configuration
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_deepseek_key_here

# WhatsApp Gateway
WHATSAPP_GATEWAY_URL=http://localhost:3001
WHATSAPP_PHONE_NUMBER=your_whatsapp_number

# Optional: Web Dashboard
WEB_PORT=3000
WEB_ENABLED=true

# Skills
ENABLED_SKILLS=adhd-assistant,default
```

Replace with your actual:
- DeepSeek API key
- WhatsApp phone number
- Gateway URL (if using external gateway)

## Step 4: Start OpenClaw

```bash
npm start
```

OpenClaw will start and load the ADHD-assistant skill automatically.

### Expected Output:
```
✓ OpenClaw initialized
✓ Skill loaded: adhd-assistant
✓ WhatsApp gateway connected
✓ Ready for messages!
```

## Step 5: Test the Setup

Send a WhatsApp message to your OpenClaw number:

```
@openclaw help with daily planning
```

Or:

```
@openclaw break down my project
```

The ADHD-assistant should respond with planning guidance, task breakdown, or time management strategies.

---

## What the ADHD-Assistant Does

Once running, you can ask it to:

- **"Plan my day"** → Morning check-in for 1-3 priorities
- **"Break down [project]"** → Decompose into micro-steps
- **"Time blocking for [goal]"** → Create visual schedule
- **"Body doubling session"** → Virtual accountability check-ins
- **"Dopamine menu"** → Build personalized motivation activities
- **"Help with shame/guilt"** → Compassionate reframing

## Integration with Lapser

Once both are running, you can:

1. **Log hours via Lapser UI** → Dashboard updates
2. **Ask OpenClaw for planning help** → Get ADHD-friendly strategies
3. **OpenClaw suggests time blocks** → Plan around your logged hours
4. **Lapser shows progress** → Visual motivation (the glowing border!)

## Troubleshooting

**"Module not found: adhd-assistant"**
- Make sure the skill files are in `openclaw/skills/adhd-assistant/`
- Run: `npm install` in the skill directory

**"WhatsApp not connecting"**
- Verify WHATSAPP_GATEWAY_URL in `.env`
- Make sure gateway service is running (if external)
- Check your WhatsApp phone number is correct

**"DeepSeek API error"**
- Verify your API key is correct in `.env`
- Check you have credits/quota remaining
- Try with a different LLM provider temporarily

**"Port already in use"**
- Change `WEB_PORT` to something else (e.g., 3002)
- Or kill the process: `taskkill /F /IM node.exe`

## Optional: Background Service

To keep OpenClaw running after closing terminal:

```bash
# Install pm2 globally
npm install -g pm2

# Start OpenClaw with pm2
cd openclaw
pm2 start npm --name "openclaw" -- start

# Make it auto-start on reboot
pm2 startup
pm2 save
```

Check status: `pm2 status`

## Architecture Overview

```
Your Laptop
├── Lapser Dashboard (http://localhost:4000)
│   └── Logs hours, shows MRR, displays performance glow
│
├── OpenClaw (WhatsApp via gateway)
│   ├── ADHD-Assistant Skill
│   │   ├── Daily planning
│   │   ├── Task breakdown
│   │   ├── Time management
│   │   └── Emotional support
│   │
│   └── Deepseek LLM (local or API)
│
└── WhatsApp Gateway
    └── Interface between WhatsApp and OpenClaw
```

---

## Next Steps

1. Install OpenClaw following Steps 1-5 above
2. Test with WhatsApp messages
3. Integrate with Lapser (optional: build a webhook)
4. Set up pm2 for persistent background running

## Resources

- OpenClaw GitHub: https://github.com/openclaw/openclaw
- Skills Repo: https://github.com/openclaw/skills
- ADHD-Assistant Skill: https://github.com/openclaw/skills/tree/main/skills/thinktankmachine/adhd-assistant
- DeepSeek API: https://platform.deepseek.com/

---

**Once OpenClaw is running with the ADHD-assistant skill, you'll have:**
- ✅ Lapser Dashboard for tracking hours & MRR
- ✅ OpenClaw for planning & task breakdown
- ✅ ADHD-optimized setup for productivity & motivation
- ✅ Both running locally on your laptop
- ✅ All accessible via familiar interfaces (Lapser web + WhatsApp)

🚀 You'll have a complete ADHD-friendly productivity system!
