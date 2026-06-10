#!/usr/bin/env bash
# Prisan Beauty — Production Deploy Script
# Usage: bash deploy.sh
set -euo pipefail

APP_DIR="/var/www/prisan-beauty"

cd "$APP_DIR"

echo ""
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

echo ""
echo "✓ Deploy complete — Prisan Beauty is running"
