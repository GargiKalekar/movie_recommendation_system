
## FLOW
```
Create EC2 → SSH → Swap → Node → MongoDB → Clone → Backend → Test → Frontend → PM2 → Done
```

---

## STEP 1 — Create EC2 Instance (AWS Console)

1. Go to **EC2 → Launch Instance**
2. Fill in:
   - Name: `mern-blog-app`
   - AMI: **Ubuntu Server 26.04 LTS (HVM), SSD Volume Type**
   - Instance type: `t3.micro`
3. Key pair: Create new → `mern-key` → RSA → `.pem` → download it
4. Security Group — Inbound Rules:

| Type | Port | Source |
|---|---|---|
| SSH | 22 | My IP |
| Custom TCP | 3000 | Anywhere 0.0.0.0/0 |
| Custom TCP | 5000 | Anywhere 0.0.0.0/0 |

5. Storage: set to **15GB**
6. Click **Launch Instance**
7. Copy the **Public IP** from EC2 dashboard

> ⚠️ Do NOT pick any AMI with "SQL Server", "Deep Learning", "Pro", or "ARM" in the name.

---

## STEP 2 — SSH Into VM (local terminal)

```bash
chmod 400 ~/mern-key.pem
ssh -i ~/mern-key.pem ubuntu@<YOUR_PUBLIC_IP>
```

Type `yes` when asked about authenticity. You are now inside the VM.

---

## STEP 3 — Basic Setup

```bash
sudo apt update && sudo apt install -y git curl build-essential
```

---

## STEP 4 — Add Swap (do this before npm)

```bash
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

> t3.micro has 1GB RAM. Swap prevents VM freeze during npm install.

---

## STEP 5 — Install Node v20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
```

---

## STEP 6 — Install MongoDB

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg

echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
```

---

## STEP 7 — Clone Project

```bash
syntax : git clone <your-repo-url>
git clone https://github.com/capgravity/cc-practical-repos.git

cd mern-blog-app
```

---

## STEP 8 — Run Backend (test mode)

```bash
cd backend
npm install
node server.js
```

---

## STEP 9 — Test Backend (from your LOCAL machine)

Open a new terminal on your laptop and run:

```bash
curl http://<YOUR_PUBLIC_IP>:5000/api/blogs
```

Expected response: `[]` (empty array = working, just no data yet)

If you get `[]` or any JSON back:
```
Backend ✔️
MongoDB ✔️
Port 5000 ✔️
```

## 🧪 TEST POST (VERY IMPORTANT)

```bash
curl -X POST http://<VM-IP>:5000/api/blogs \
-H "Content-Type: application/json" \
-d '{"title":"Test Blog","content":"Sample content","author":"JM"}'
```

---

## 🔁 VERIFY DATA

```bash
curl http://<VM-IP>:5000/api/blogs
```

---
---

## STEP 10 — Stop Test Server

Go back to SSH terminal, press:
```bash
Ctrl + C
```

---

## STEP 11 — Build Frontend

```bash
cd ../frontend
rm -rf node_modules package-lock.json
npm install --no-audit --no-fund --legacy-peer-deps
VITE_API_URL=http://<YOUR_PUBLIC_IP>:5000/api/blogs npm run build
```

---

## STEP 12 — Run with PM2 (production)

```bash
# Install PM2
sudo npm install -g pm2 serve

# Start backend
cd ../backend
pm2 start server.js --name "backend"

# Start frontend
cd ../frontend
pm2 serve dist 3000 --name "frontend" --spa
```

---

## STEP 13 — Visit Your App

Open browser:
```
http://<YOUR_PUBLIC_IP>:3000
```

---

## DEBUGGING

| Problem | Fix |
|---|---|
| Launch failed — SQL Server error | Wrong AMI selected, pick plain Ubuntu |
| SSH permission denied | `chmod 400 mern-key.pem` |
| `node server.js` — mongo error | `sudo systemctl start mongod` |
| `curl` returns nothing | Port 5000 not open in security group |
| npm hangs or VM freezes | Add swap (step 4), use `--no-audit --no-fund` |
| Vite build error | `rm -rf node_modules package-lock.json && npm install` |
| Site not loading on port 3000 | Port 3000 not open in security group |
| VM completely frozen | Stop + Start instance from AWS Console |

---

## Key Concepts

| Term | What it means |
|---|---|
| `t3.micro` | Small VM, 1GB RAM, free tier eligible |
| Swap | Disk space used as extra RAM during npm install |
| `mongod` | MongoDB background service running on the VM |
| `localhost:27017` | How backend talks to MongoDB internally |
| `node server.js` | Run backend for testing only |
| `pm2 start` | Run backend/frontend permanently in background |
| Port 3000 | Where frontend is served |
| Port 5000 | Where backend API is served |
| `[]` from curl | Empty array — backend + MongoDB working fine |