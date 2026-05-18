# MERN Student System Deployment — AWS EC2

---

## FLOW

```
Create VM → SSH → Setup → Clone → Backend → Frontend → Run → Test → Done
```

---

## EC2 INSTANCE SETUP

Go to: AWS Console → EC2 → Launch Instance

| Setting | Value |
|---|---|
| Name | mern-student-system |
| AMI | Ubuntu Server 22.04 LTS (HVM), SSD Volume Type |
| Instance type | t3.micro |
| Key pair | Create new → RSA → .pem → download it |
| Storage | 15 GiB, gp3 |

Security Group — Inbound Rules:

| Type | Port | Source |
|---|---|---|
| SSH | 22 | My IP |
| Custom TCP | 3000 | Anywhere 0.0.0.0/0 |
| Custom TCP | 5000 | Anywhere 0.0.0.0/0 |

Click Launch. Copy the Public IPv4 address from the EC2 dashboard.

---

## 0. SSH KEY

```bash
chmod 400 ~/mern-key.pem
```

Connect:

```bash
ssh -i ~/mern-key.pem ubuntu@<EC2-PUBLIC-IP>
```

---

## 1. BASIC SETUP

```bash
sudo apt update && sudo apt install -y git curl build-essential
```

---

## 2. ADD SWAP (do this before npm)

```bash
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 3. INSTALL NODE v20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
```

---

## 4. INSTALL MONGODB

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg

echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
```

---

## 5. CLONE PROJECT

```bash
git clone https://github.com/capgravity/cc-practical-repos
cd cc-practical-repos/mern-student-system

```

---

## 6. BACKEND — test run

```bash
cd backend
npm install
node server.js
```

Test from inside VM (new SSH terminal):

```bash
curl http://localhost:5000/api/students
```

Test from your laptop:

```bash
curl http://<EC2-PUBLIC-IP>:5000/api/students
```

Test POST:

```bash
curl -X POST http://<PUBLIC IP ADD>:5000/api/students \
-H "Content-Type: application/json" \
-d '{"name":"Test Student","rollNumber":"101","department":"Computer","email":"test@test.com"}'

example:
curl -X POST http://54.85.196.186:5000/api/students \
-H "Content-Type: application/json" \
-d '{"name":"Test Student","rollNumber":"101","department":"Computer","email":"test@test.com"}'
Verify data saved:
```

```bash
curl http://<EC2-PUBLIC-IP>:5000/api/students
```
INSIDE THE VM:
Stop test server:

```bash
Ctrl + C
```

---

## 7. FRONTEND

```bash
INSIDE THE VM:
cd ../frontend
rm -rf node_modules package-lock.json
npm install --no-audit --no-fund --legacy-peer-deps
```

Build:

```bash
VITE_API_URL=http://<EC2-PUBLIC-IP>:5000/api/students npm run build
```

---

## 8. RUN WITH PM2

Install PM2:

```bash
sudo npm install -g pm2 serve
```

Start backend:

```bash
cd ../backend
pm2 start server.js --name "backend"
```

Start frontend:

```bash
cd ../frontend
pm2 serve dist 3000 --name "frontend" --spa
```

---

## 9. ACCESS

Open in browser:

```
http://<EC2-PUBLIC-IP>:3000
```

---

## 10. AWS SECURITY GROUP — Inbound Rules

Go to: EC2 → Security Groups → Inbound Rules → Edit

| Type | Port | Source |
|---|---|---|
| SSH | 22 | My IP |
| Custom TCP | 3000 | Anywhere 0.0.0.0/0 |
| Custom TCP | 5000 | Anywhere 0.0.0.0/0 |

---

## DEBUGGING

| Problem | Fix |
|---|---|
| SSH key error | `chmod 400 mern-key.pem`, check path |
| Mongo install fail | Use `jammy` repo (already in step 4) |
| npm error ENOENT | Wrong folder — go into backend/ or frontend/ |
| curl fails from laptop | Port 5000 not open in Security Group |
| Node version error | Use Node 20 (step 3) |
| Site not opening | Port 3000 not open in Security Group |
| Vite error | `rm -rf node_modules package-lock.json && npm install` |
| npm hang | Add swap (step 2) + use `--no-audit --no-fund` |
| VM freeze | Stop + Start instance from AWS Console |
| VM dead | Terminate + create new EC2 instance |

---



