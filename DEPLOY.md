# Deployment Guide

This document contains the exact commands for deploying the Prisan Beauty application to a production Ubuntu server.

## Prerequisites

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
npm i -g pm2

# Clone/repo setup
mkdir -p /home/kswms/apps
cd /home/kswms/apps
git clone <repo-url> prisan
cd prisan

# Create environment file
cat > .env << 'EOF'
DATABASE_URL="postgresql://user:password@localhost:5432/prisan_beauty?schema=public"
JWT_SECRET="<generate-a-random-secret>"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=prisanbeauty@gmail.com
SMTP_PASS=<app-password>
MAIL_FROM="Prisan Beauty <noreply@prisanbeauty.com>"
ADMIN_EMAIL=prisanbeauty@gmail.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
UPLOAD_DIR=/var/www/prisan-beauty/uploads
EOF

# Run database setup
npx prisma migrate deploy
npm run db:seed
```

## Standard Deploy

Run these steps every time you deploy a new build:

```bash
cd /home/kswms/apps/prisan

# 1. Install any new dependencies and build the fresh code
npm install
npm run build

# 2. Sync the production asset directories cleanly
rm -rf .next/standalone/public .next/standalone/.next/static
mkdir -p .next/standalone/public
mkdir -p .next/standalone/.next/static

cp -r public/* .next/standalone/public/
cp -r .next/static/* .next/standalone/.next/static/

# 3. Re-link your persistent uploads folder path structure
rm -rf .next/standalone/public/uploads
ln -s /home/kswms/apps/prisan/public/uploads /home/kswms/apps/prisan/.next/standalone/public/uploads

# 4. Force restart the application process on the active Nginx port (3005)
PORT=3005 pm2 restart prisan
```

## First-Time PM2 Setup

```bash
# Start the app with PM2 (from project root)
cd /home/kswms/apps/prisan
PORT=3005 pm2 start .next/standalone/server.js --name prisan

# Save the PM2 process list for auto-restart on reboot
pm2 save
pm2 startup
```

## Restart / Logs

```bash
pm2 restart prisan           # Restart the app
pm2 stop prisan              # Stop the app
pm2 logs prisan              # View logs
pm2 monit                    # Monitor CPU/memory
```

## Quick Deploy Script

Save the following as `/home/kswms/apps/prisan/deploy.sh` and make it executable:

```bash
#!/usr/bin/env bash
set -euo pipefail

cd /home/kswms/apps/prisan

echo "→ Installing dependencies..."
npm install

echo "→ Building..."
npm run build

echo "→ Syncing assets..."
rm -rf .next/standalone/public .next/standalone/.next/static
mkdir -p .next/standalone/public
mkdir -p .next/standalone/.next/static
cp -r public/* .next/standalone/public/
cp -r .next/static/* .next/standalone/.next/static/

echo "→ Re-linking uploads..."
rm -rf .next/standalone/public/uploads
ln -s /home/kswms/apps/prisan/public/uploads /home/kswms/apps/prisan/.next/standalone/public/uploads

echo "→ Restarting..."
PORT=3005 pm2 restart prisan

echo "✓ Deploy complete"
```

Then run: `bash deploy.sh`
