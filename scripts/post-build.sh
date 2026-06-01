#!/usr/bin/env bash
set -euo pipefail

echo ""
echo "→ Post-build: preparing standalone output..."
echo ""

STANDALONE_DIR=".next/standalone"

# 1. Copy .next/static into standalone/.next/static
if [ -d ".next/static" ]; then
  echo "  [1/6] Copying .next/static/ → $STANDALONE_DIR/.next/static/..."
  mkdir -p "$STANDALONE_DIR/.next/static"
  cp -r .next/static/* "$STANDALONE_DIR/.next/static/"
fi

# 2. Copy public/ assets into standalone (EXCLUDING uploads/ — handled below)
if [ -d "public" ]; then
  echo "  [2/6] Copying public/ → $STANDALONE_DIR/public/..."
  mkdir -p "$STANDALONE_DIR/public"
  rsync -a --exclude=uploads public/ "$STANDALONE_DIR/public/" 2>/dev/null || cp -r public/* "$STANDALONE_DIR/public/"
fi

# 3. Copy persistent uploads into standalone/public/uploads/
#    UPLOAD_DIR is where the production server stores uploaded images.
UPLOAD_DIR="${UPLOAD_DIR:-public}"
if [ -d "$UPLOAD_DIR/uploads" ]; then
  echo "  [3/6] Copying uploads from $UPLOAD_DIR/uploads/ → $STANDALONE_DIR/public/uploads/..."
  mkdir -p "$STANDALONE_DIR/public/uploads"
  cp -r "$UPLOAD_DIR/uploads/"* "$STANDALONE_DIR/public/uploads/"
fi

# 4. Copy .env for runtime env values
if [ -f ".env" ]; then
  echo "  [4/6] Copying .env → $STANDALONE_DIR/.env..."
  cp .env "$STANDALONE_DIR/.env"
fi

# 5. Copy Prisma client engine
if [ -d "node_modules/.prisma" ]; then
  echo "  [5/6] Copying Prisma client engine → $STANDALONE_DIR/node_modules/..."
  mkdir -p "$STANDALONE_DIR/node_modules"
  cp -r node_modules/.prisma "$STANDALONE_DIR/node_modules/.prisma"
fi

# 6. Copy sharp native addon
if [ -d "node_modules/sharp" ]; then
  echo "  [6/6] Copying sharp → $STANDALONE_DIR/node_modules/..."
  mkdir -p "$STANDALONE_DIR/node_modules/sharp"
  cp -r node_modules/sharp/* "$STANDALONE_DIR/node_modules/sharp/"
fi

echo ""
echo "  ✓ $STANDALONE_DIR/server.js        (server entry point)"
echo "  ✓ $STANDALONE_DIR/.next/           (runtime server code)"
echo "  ✓ $STANDALONE_DIR/.next/static/    (JS, CSS, assets)"
echo "  ✓ $STANDALONE_DIR/public/          (static public files)"
echo "  ✓ $STANDALONE_DIR/public/uploads/  (persistent uploads)"
echo "  ✓ $STANDALONE_DIR/.env             (environment variables)"
echo "  ✓ $STANDALONE_DIR/node_modules/    (Prisma, sharp, deps)"
echo ""
echo "✓ Standalone output ready at $STANDALONE_DIR"
echo ""
