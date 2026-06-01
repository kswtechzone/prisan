#!/usr/bin/env bash
# Prisan Beauty — Production Deploy Script
# Usage: bash deploy.sh
set -euo pipefail

cd /home/kswms/apps/prisan

echo ""
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

echo "→ Restarting application..."
PORT=3005 pm2 restart prisan

echo ""
echo "✓ Deploy complete — Prisan Beauty is running on port 3005"
