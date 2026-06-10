# VPS Deployment Guide — Prisan Beauty

Comprehensive guide for deploying Prisan Beauty to a production Ubuntu server with Nginx reverse proxy, PostgreSQL, PM2 process management, and SSL.

---

## Table of Contents

1. [Server Prerequisites](#1-server-prerequisites)
2. [Database Setup (PostgreSQL)](#2-database-setup-postgresql)
3. [Application Setup](#3-application-setup)
4. [Environment Variables](#4-environment-variables)
5. [Build & Deploy](#5-build--deploy)
6. [Nginx Reverse Proxy](#6-nginx-reverse-proxy)
7. [SSL with Certbot](#7-ssl-with-certbot)
8. [PM2 Process Management](#8-pm2-process-management)
9. [Image Uploads](#9-image-uploads)
10. [Maintenance & Troubleshooting](#10-maintenance--troubleshooting)

---

## 1. Server Prerequisites

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify versions
node -v    # should be v20.x
npm -v     # should be 10.x

# Install build tools (for sharp, Prisma, etc.)
sudo apt-get install -y build-essential libvips-dev git

# Install PM2 globally
npm install -g pm2

# Install Nginx
sudo apt-get install -y nginx

# Install Certbot for SSL
sudo apt-get install -y certbot python3-certbot-nginx
```

---

## 2. Database Setup (PostgreSQL)

```bash
# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user
sudo -i -u postgres

# Create database and user
psql -c "CREATE USER kswms WITH PASSWORD 'your-strong-password';"
psql -c "CREATE DATABASE prisan_beauty OWNER kswms;"
psql -c "GRANT ALL PRIVILEGES ON DATABASE prisan_beauty TO kswms;"

# Exit postgres user
exit
```

---

## 3. Application Setup

```bash
# Create application directory
sudo mkdir -p /var/www/prisan-beauty
sudo chown $USER:$USER /var/www/prisan-beauty

# Clone repository
cd /var/www/prisan-beauty
git clone <your-repo-url> .

# Create uploads directory (persistent storage)
mkdir -p public/uploads
```

---

## 4. Environment Variables

```bash
# Generate a JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Create .env file
cat > .env << 'ENVEOF'
DATABASE_URL="postgresql://kswms:your-strong-password@localhost:5432/prisan_beauty?schema=public"
JWT_SECRET="$JWT_SECRET"

# SMTP (Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=prisanbeauty@gmail.com
SMTP_PASS=your-gmail-app-password
MAIL_FROM="Prisan Beauty <noreply@prisanbeauty.com>"
ADMIN_EMAIL=prisanbeauty@gmail.com

# Site URL (no trailing slash)
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Upload directory (absolute path — persistent storage outside standalone)
UPLOAD_DIR=/var/www/prisan-beauty/public
ENVEOF
```

> **Gmail App Password**: Generate one at https://myaccount.google.com/apppasswords (requires 2FA enabled).

---

## 5. Build & Deploy

### First-time setup

```bash
cd /var/www/prisan-beauty

# Install dependencies
npm install

# Run database migrations
npx prisma migrate deploy

# Seed the database (optional — creates admin user, sample data)
npm run db:seed

# Build the application
npm run build

# Run post-build script (copies assets to standalone output)
bash scripts/post-build.sh
```

### Deploy script

Save as `deploy.sh` and run it for every update:

```bash
#!/usr/bin/env bash
set -euo pipefail

cd /var/www/prisan-beauty

echo "→ Pulling latest code..."
git pull

echo "→ Installing dependencies..."
npm install

echo "→ Running database migrations..."
npx prisma migrate deploy

echo "→ Building..."
npm run build

echo "→ Preparing standalone output..."
bash scripts/post-build.sh

echo "→ Restarting application..."
pm2 restart prisan-beauty

echo "✓ Deploy complete"
```

Make it executable:

```bash
chmod +x deploy.sh
```

---

## 6. Nginx Reverse Proxy

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/prisan-beauty
```

Paste the following:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Increase max body size for image uploads
    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded files directly (bypass Node)
    location /uploads/ {
        alias /var/www/prisan-beauty/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/prisan-beauty /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. SSL with Certbot

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

---

## 8. PM2 Process Management

### Start the application

```bash
cd /var/www/prisan-beauty
PORT=3005 pm2 start .next/standalone/server.js --name prisan-beauty
```

### Save PM2 process list (auto-restart on reboot)

```bash
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
```

### Common commands

```bash
pm2 status                    # List all processes
pm2 logs prisan-beauty        # View logs
pm2 monit                     # Monitor CPU/memory
pm2 restart prisan-beauty     # Restart the app
pm2 stop prisan-beauty        # Stop the app
pm2 delete prisan-beauty      # Remove from PM2
```

### Log rotation (prevent disks from filling up)

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 7
```

---

## 9. Image Uploads

### How it works

1. The upload API route (`/api/upload`) accepts images via `multipart/form-data`.
2. Images are resized to max 1200px width and compressed (JPEG, 70% quality).
3. Files are saved to `$UPLOAD_DIR/uploads/{subDir}/` — this is configured via `UPLOAD_DIR` in `.env`.
4. Nginx directly serves `/uploads/` URLs for performance (bypasses Node.js).

### Storage locations

| Environment | Upload path |
|---|---|
| Development | `project-root/public/uploads/` |
| Production | `/var/www/prisan-beauty/public/uploads/` |

### Allowed image types

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/avif`

---

## 10. Maintenance & Troubleshooting

### Check application health

```bash
curl -I http://localhost:3005
curl -I https://your-domain.com
```

### View real-time logs

```bash
pm2 logs prisan-beauty --lines 100
```

### Database backup

```bash
pg_dump -U kswms prisan_beauty > backup_$(date +%Y%m%d).sql
```

### Restore database

```bash
psql -U kswms prisan_beauty < backup_file.sql
```

### Clear Next.js cache

```bash
cd /var/www/prisan-beauty
rm -rf .next
```

### Increase Node memory limit (if needed)

```bash
PORT=3005 NODE_OPTIONS="--max-old-space-size=4096" pm2 start .next/standalone/server.js --name prisan-beauty
```

### Check disk space

```bash
df -h
du -sh /var/www/prisan-beauty/public/uploads/
```

### Update Node.js

```bash
sudo bash -c "$(curl -fsSL https://deb.nodesource.com/setup_20.x)"
sudo apt-get install -y nodejs
```

### PM2 startup fails on some systems

If `pm2 startup` doesn't work after reboot:

```bash
sudo crontab -e
# Add this line:
@reboot /usr/bin/pm2 resurrect
```

---

## Architecture Summary

```
User → HTTPS (443) → Nginx → TCP (3005) → Node.js (PM2)
                        │
                        └──→ /uploads/ → /var/www/prisan-beauty/public/uploads/
```

- **Nginx**: Reverse proxy, SSL termination, static file serving
- **PM2**: Process manager (auto-restart, clustering, log rotation)
- **Next.js standalone**: Self-contained Node.js server
- **PostgreSQL**: Database (Prisma ORM)
- **UPLOAD_DIR**: Persistent storage outside standalone output
