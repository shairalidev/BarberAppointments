# Deployment Guide

## GitHub Actions Deployment Setup

### Required GitHub Secrets testing lets see

Configure these secrets in your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Description | Example |
|------------|-------------|---------|
| `SERVER_HOST` | Your server IP or domain | `123.45.67.89` or `barberpro.com` |
| `SERVER_USER` | SSH username | `ubuntu` or `root` |
| `SSH_PRIVATE_KEY` | Private SSH key for authentication | Your private key content |
| `SERVER_PORT` | SSH port (optional, default: 22) | `22` |
| `DEPLOY_PATH` | Application directory on server | `/var/www/barberpro` |
| `APP_URL` | Application URL for health check | `https://barberpro.com` |

### Server Prerequisites

1. **Install Node.js and npm**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Install PM2 globally**:
```bash
sudo npm install -g pm2
pm2 startup systemd
```

3. **Install MongoDB**:
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

4. **Install Nginx** (for serving frontend):
```bash
sudo apt-get install -y nginx
```

5. **Setup project directory**:
```bash
sudo mkdir -p /var/www/barberpro
sudo chown -R $USER:$USER /var/www/barberpro
cd /var/www/barberpro
git clone <your-repo-url> .
```

6. **Configure production environment**:
```bash
cd /var/www/barberpro/backend
cp .env.production .env
# Edit .env with your production values
nano .env
```

### Nginx Configuration

Create `/etc/nginx/sites-available/barberpro`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html/barberpro;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/barberpro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Certificate and Automatic Renewal

```bash
sudo bash scripts/configure-tls-renewal.sh
systemctl status certbot.timer
sudo certbot renew --dry-run
```

The script covers `ates-barberos.com` and `www.ates-barberos.com`, enables the
twice-daily Certbot timer, and reloads Nginx after successful renewal. Both DNS
names must resolve to this VPS and port 80 must be publicly reachable.

### Manual Deployment

If you prefer manual deployment:

```bash
cd /var/www/barberpro
git pull origin main

# Backend
cd backend
npm ci --production=false
NODE_ENV=production pm2 restart barberpro-backend || pm2 start server.js --name barberpro-backend --env production

# Frontend
cd ../frontend
npm ci
npm run build
sudo rm -rf /var/www/html/barberpro/*
sudo cp -r dist/* /var/www/html/barberpro/
sudo chown -R www-data:www-data /var/www/html/barberpro
```

### PM2 Commands

```bash
# View logs
pm2 logs barberpro-backend

# Monitor
pm2 monit

# Restart
pm2 restart barberpro-backend

# Stop
pm2 stop barberpro-backend

# Status
pm2 status

# Save configuration
pm2 save
```

### Troubleshooting

**Check backend logs**:
```bash
pm2 logs barberpro-backend --lines 100
```

**Check Nginx logs**:
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

**Check MongoDB status**:
```bash
sudo systemctl status mongod
```

**Restart services**:
```bash
pm2 restart barberpro-backend
sudo systemctl restart nginx
```

### Security Checklist

- [ ] Change default admin credentials
- [ ] Update JWT_SECRET in production .env
- [ ] Configure firewall (UFW)
- [ ] Verify `sudo certbot renew --dry-run` succeeds
- [ ] Set up MongoDB authentication
- [ ] Configure CORS properly
- [ ] Set up regular backups
- [ ] Enable PM2 monitoring
- [ ] Configure log rotation

### Monitoring

Set up PM2 monitoring:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

**Deployment Status**: The application will automatically deploy when you push to the `main` or `production` branch.
