# Deployment Guide - Smart Email Triage Tool

This guide explains how to deploy the Smart Email Triage Tool to a production server.

## Prerequisites

- Python 3.8+ installed
- Node.js 18+ and npm installed
- Server with public IP or domain name
- (Optional) Domain name with SSL certificate

## Deployment Options

### Option 1: Single Server (Backend + Frontend)

Deploy both backend and frontend on the same server.

### Option 2: Separate Servers

Deploy backend and frontend on different servers.

---

## Step 1: Prepare Backend

### 1.1 Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 1.2 Configure Environment

Create `.env` file in `backend/` directory:

```bash
# Database
DATABASE_URL=sqlite:///./email_triage.db

# AI Configuration
AI_PROVIDER=mock  # or openai, anthropic
AI_MODEL=gpt-4
AI_TEMPERATURE=0.3

# API Keys (if using real AI)
# OPENAI_API_KEY=your_key_here
# ANTHROPIC_API_KEY=your_key_here

# Server Configuration
HOST=0.0.0.0  # Listen on all interfaces
PORT=8000

# CORS - Set your frontend URL(s)
# For single server: CORS_ORIGINS=http://your-domain.com,https://your-domain.com
# For separate servers: CORS_ORIGINS=https://your-frontend-domain.com
CORS_ORIGINS=*

# Application
DEBUG=False
LOG_LEVEL=INFO
```

### 1.3 Initialize Database

```bash
cd backend
python -c "from app.database import init_db; init_db()"
python load_sample_emails.py
```

### 1.4 Run Backend

**Development:**
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Production (using script):**
```bash
python run_production.py
```

**Production (using uvicorn directly):**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Step 2: Prepare Frontend

### 2.1 Install Dependencies

```bash
cd frontend
npm install
```

### 2.2 Configure API URL

**Option A: Same Server (Recommended)**
- No configuration needed if backend is on same domain
- Frontend will use `window.location.origin` automatically

**Option B: Different Server**
Create `frontend/.env.production`:
```
VITE_API_URL=https://your-backend-domain.com
```

### 2.3 Build for Production

```bash
cd frontend
npm run build
```

This creates a `dist/` folder with production-ready files.

---

## Step 3: Serve Frontend

### Option A: Using Nginx (Recommended)

1. **Install Nginx:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install nginx
   
   # CentOS/RHEL
   sudo yum install nginx
   ```

2. **Configure Nginx:**

   Create `/etc/nginx/sites-available/email-triage`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend
       location / {
           root /path/to/mrit/frontend/dist;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Enable Site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/email-triage /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Option B: Using Python HTTP Server (Simple)

```bash
cd frontend/dist
python -m http.server 80
```

### Option C: Using Node.js Serve

```bash
npm install -g serve
cd frontend
serve -s dist -l 80
```

---

## Step 4: Set Up Process Manager (Backend)

### Using systemd (Linux)

Create `/etc/systemd/system/email-triage.service`:

```ini
[Unit]
Description=Smart Email Triage Tool API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/mrit/backend
Environment="PATH=/usr/bin:/usr/local/bin"
ExecStart=/usr/bin/python3 /path/to/mrit/backend/run_production.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable email-triage
sudo systemctl start email-triage
sudo systemctl status email-triage
```

### Using PM2 (Node.js Process Manager)

```bash
npm install -g pm2
cd backend
pm2 start run_production.py --name email-triage-api --interpreter python3
pm2 save
pm2 startup
```

---

## Step 5: SSL/HTTPS Setup (Recommended)

### Using Let's Encrypt (Free SSL)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

This automatically configures SSL and auto-renewal.

---

## Step 6: Firewall Configuration

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# If backend is on separate server, allow backend port
sudo ufw allow 8000/tcp
```

---

## Environment-Specific Configuration

### Development
- `DEBUG=True`
- `CORS_ORIGINS=*`
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

### Production
- `DEBUG=False`
- `CORS_ORIGINS=https://your-domain.com`
- Backend: `https://your-domain.com/api` (via Nginx proxy)
- Frontend: `https://your-domain.com`

---

## Quick Start Script

Create `deploy.sh`:

```bash
#!/bin/bash

# Backend
cd backend
pip install -r requirements.txt
python -c "from app.database import init_db; init_db()"
python load_sample_emails.py

# Frontend
cd ../frontend
npm install
npm run build

# Start services
cd ../backend
python run_production.py &
cd ../frontend
serve -s dist -l 3000 &
```

Make executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Verification

1. **Backend Health Check:**
   ```bash
   curl http://your-server:8000/health
   ```

2. **Frontend:**
   Open `http://your-domain.com` in browser

3. **API Docs:**
   Open `http://your-domain.com/api/docs`

---

## Troubleshooting

### Backend not accessible
- Check firewall: `sudo ufw status`
- Check if port is listening: `netstat -tulpn | grep 8000`
- Check logs: `journalctl -u email-triage -f`

### CORS errors
- Update `CORS_ORIGINS` in `.env` with your frontend URL
- Restart backend after changing `.env`

### Frontend can't connect to backend
- Check `VITE_API_URL` in frontend `.env.production`
- Verify backend is running: `curl http://localhost:8000/health`
- Check Nginx proxy configuration

---

## Security Checklist

- [ ] Set `DEBUG=False` in production
- [ ] Configure `CORS_ORIGINS` with specific domains
- [ ] Use HTTPS/SSL
- [ ] Keep API keys in `.env` (never commit)
- [ ] Use strong passwords for database (if using PostgreSQL)
- [ ] Set up firewall rules
- [ ] Keep dependencies updated
- [ ] Set up log rotation
- [ ] Configure backup for database

---

## Monitoring

### Logs Location
- Backend: Check process manager logs (systemd/PM2)
- Nginx: `/var/log/nginx/access.log` and `/var/log/nginx/error.log`

### Health Monitoring
- Set up monitoring for `/health` endpoint
- Monitor disk space (SQLite database grows)
- Monitor API response times

---

**Your application is now live!** 🚀

