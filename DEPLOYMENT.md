# Deployment Guide

## Option 1: Render.com (Free Tier)

### Prerequisites
- GitHub account
- Render.com account (free)

### Steps

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/whatsapp-bot.git
   git push -u origin main
   ```

2. **Create Render account**
   - Go to https://render.com
   - Sign up with GitHub

3. **Create Web Service**
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: whatsapp-bot
     - Runtime: Node
     - Build Command: `npm install`
     - Start Command: `node index.js`
     - Instance Type: Free

4. **Add Environment Variables**
   - In Render dashboard, go to your service
   - Add environment variable:
     - Key: `CHROME_EXECUTABLE_PATH`
     - Value: `/usr/bin/google-chrome`

5. **Deploy**
   - Render will auto-deploy from GitHub
   - Wait for deployment to complete

6. **Get QR Code**
   - View logs in Render dashboard
   - Look for "QR Code saved to: qr.png"
   - Download the QR code image from the Render file browser
   - Scan with WhatsApp

### Important Notes
- Free tier spins down after 15 minutes of inactivity
- Bot will disconnect when spun down
- Need to manually wake up by visiting the service URL
- For 24/7 operation, upgrade to paid tier ($7/month)

---

## Option 2: Oracle Cloud Always Free (Recommended for 24/7)

### Prerequisites
- Oracle Cloud account (free)

### Steps

1. **Create Oracle Cloud Account**
   - Go to https://www.oracle.com/cloud/free/
   - Sign up (requires credit card but won't be charged)

2. **Create ARM VM**
   - Go to Compute → Instances
   - Click "Create Instance"
   - Configure:
     - Name: whatsapp-bot
     - Shape: Ampere A1 (Always Free)
     - Operating System: Oracle Linux or Ubuntu
     - SSH key: Add your public key

3. **Connect to VM**
   ```bash
   ssh -i your-key.pem ubuntu@your-vm-ip
   ```

4. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

5. **Install Chrome**
   ```bash
   sudo apt-get update
   sudo apt-get install -y google-chrome-stable
   ```

6. **Upload your bot files**
   ```bash
   # From your local machine
   scp -i your-key.pem -r /path/to/whatapp1 ubuntu@your-vm-ip:/home/ubuntu/
   ```

7. **Install dependencies**
   ```bash
   cd /home/ubuntu/whatapp1
   npm install
   ```

8. **Run the bot**
   ```bash
   node index.js
   ```

9. **Run with PM2 (for 24/7 operation)**
   ```bash
   npm install -g pm2
   pm2 start index.js --name whatsapp-bot
   pm2 save
   pm2 startup
   ```

### Advantages
- Truly free forever
- 24/7 uptime
- Full control
- No spin-down issues

---

## Option 3: Fly.io (Free Tier)

### Prerequisites
- Fly.io account (free, requires credit card)
- Fly CLI installed

### Steps

1. **Install Fly CLI**
   ```bash
   # Windows
   pwsh -Command "iwr https://fly.io/install.ps1 | iex"
   
   # Or download from https://fly.io/docs/hands-on/install-flyctl/
   ```

2. **Create Fly account**
   - Go to https://fly.io
   - Sign up (requires credit card for verification)

3. **Login**
   ```bash
   flyctl auth login
   ```

4. **Initialize Fly app**
   ```bash
   cd /path/to/whatapp1
   flyctl launch
   ```
   - Follow prompts
   - Select region
   - Don't deploy yet

5. **Create fly.toml** (if not created automatically):
   ```toml
   app = "whatsapp-bot"
   primary_region = "iad"

   [build]
   builder = "heroku/buildpacks:20"

   [env]
   CHROME_EXECUTABLE_PATH = "/usr/bin/google-chrome"

   [[services]]
   http_checks = []
   internal_port = 8080
   processes = ["app"]
   protocol = "tcp"

   [[services.concurrency]]
   hard_limit = 25
   soft_limit = 20
   type = "connections"

   [[vm]]
   cpu_kind = "shared"
   cpus = 1
   memory_mb = 256
   ```

6. **Set environment variable**
   ```bash
   flyctl secrets set CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome
   ```

7. **Deploy**
   ```bash
   flyctl deploy
   ```

8. **Get QR Code**
   ```bash
   flyctl logs
   ```
   - Look for "QR Code saved to: qr.png"
   - Download from Fly dashboard or use:
   ```bash
   flyctl ssh sftp get /app/qr.png ./qr.png
   ```

9. **Scan QR code** with WhatsApp

### Important Notes
- Free tier: 3 shared-cpu-1x VMs
- 3GB volume storage
- 160GB outbound data/month
- Requires credit card for verification
- Apps sleep after inactivity (can be prevented with keepalive)

### Keep App Awake (Optional)
Create `keepalive.sh`:
```bash
#!/bin/bash
while true; do
  curl https://your-app.fly.dev
  sleep 300
done
```

---

## Option 4: Railway.app

### Steps

1. **Create Railway account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - "Deploy from GitHub repo"
   - Select your repository

3. **Configure**
   - Railway will auto-detect Node.js
   - Add environment variable: `CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome`

4. **Deploy**
   - Railway will deploy automatically
   - View logs for QR code

### Notes
- Free tier: $5 credit/month
- May need paid tier for Puppeteer
- Sleeps after inactivity

---

## Troubleshooting

### Chrome not found on Render
- Add build script to package.json:
  ```json
  "scripts": {
    "build": "apt-get update && apt-get install -y google-chrome-stable"
  }
  ```

### QR code not visible
- Check logs in dashboard
- Download from file browser if available

### Bot disconnects frequently
- Free tiers spin down
- Upgrade to paid tier or use Oracle Cloud

### Memory issues
- Add to bot.js args:
  ```javascript
  '--disable-extensions',
  '--disable-background-networking'
  ```
