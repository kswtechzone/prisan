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

# 2. Copy public/ assets into standalone
if [ -d "public" ]; then
  echo "  [2/6] Copying public/ → $STANDALONE_DIR/public/..."
  cp -r public/* "$STANDALONE_DIR/public/"
fi

# 3. Copy .env for runtime env values
if [ -f ".env" ]; then
  echo "  [3/6] Copying .env → $STANDALONE_DIR/.env..."
  cp .env "$STANDALONE_DIR/.env"
fi

# 4. Copy Prisma schema + client engine
if [ -d "node_modules/.prisma" ]; then
  echo "  [4/6] Copying Prisma client engine → $STANDALONE_DIR/node_modules/..."
  mkdir -p "$STANDALONE_DIR/node_modules"
  cp -r node_modules/.prisma "$STANDALONE_DIR/node_modules/.prisma"
fi

# 5. Copy sharp native addon into standalone node_modules
#    Sharp's binary (libvips) must be available at runtime.
if [ -d "node_modules/sharp" ]; then
  echo "  [5/6] Copying sharp → $STANDALONE_DIR/node_modules/..."
  mkdir -p "$STANDALONE_DIR/node_modules/sharp"
  cp -r node_modules/sharp/* "$STANDALONE_DIR/node_modules/sharp/"
fi

echo "  [6/6] Verifying output..."
echo ""
echo "  ✓ $STANDALONE_DIR/server.js        (server entry point)"
echo "  ✓ $STANDALONE_DIR/.next/           (runtime server code)"
echo "  ✓ $STANDALONE_DIR/.next/static/    (JS, CSS, assets)"
echo "  ✓ $STANDALONE_DIR/public/          (static public files)"
echo "  ✓ $STANDALONE_DIR/.env             (environment variables)"
echo "  ✓ $STANDALONE_DIR/node_modules/    (Prisma, sharp, deps)"
echo ""
echo "✓ Standalone output ready at $STANDALONE_DIR"
echo ""
