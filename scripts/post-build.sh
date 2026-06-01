#!/usr/bin/env bash
set -euo pipefail

echo ""
echo "→ Post-build: preparing standalone output..."
echo ""

STANDALONE_DIR=".next/standalone"

# 1. Copy .next/static into standalone/.next/static
#    Next.js 15 standalone mode does NOT auto-copy static assets.
if [ -d ".next/static" ]; then
  echo "  [1/5] Copying .next/static/ → $STANDALONE_DIR/.next/static/..."
  mkdir -p "$STANDALONE_DIR/.next/static"
  cp -r .next/static/* "$STANDALONE_DIR/.next/static/"
fi

# 2. Copy public/ assets into standalone
if [ -d "public" ]; then
  echo "  [2/5] Copying public/ → $STANDALONE_DIR/public/..."
  cp -r public/* "$STANDALONE_DIR/public/"
fi

# 3. Copy .env for runtime env values
if [ -f ".env" ]; then
  echo "  [3/5] Copying .env → $STANDALONE_DIR/.env..."
  cp .env "$STANDALONE_DIR/.env"
fi

# 4. Copy Prisma schema (for reference, not strictly needed at runtime)
mkdir -p "$STANDALONE_DIR/prisma"
if [ -f "prisma/schema.prisma" ]; then
  cp prisma/schema.prisma "$STANDALONE_DIR/prisma/schema.prisma"
fi

# 5. Ensure Prisma client is present in standalone node_modules
#    (Next.js bundles it but the runtime engine may need it)
if [ -d "node_modules/.prisma" ]; then
  echo "  [4/5] Copying Prisma client engine → $STANDALONE_DIR/node_modules/..."
  mkdir -p "$STANDALONE_DIR/node_modules"
  cp -r node_modules/.prisma "$STANDALONE_DIR/node_modules/.prisma"
fi

echo "  [5/5] Verifying output..."
echo ""
echo "  ✓ $STANDALONE_DIR/server.js        (server entry point)"
echo "  ✓ $STANDALONE_DIR/.next/           (runtime server code)"
echo "  ✓ $STANDALONE_DIR/.next/static/    (JS, CSS, assets)"
echo "  ✓ $STANDALONE_DIR/public/          (static public files)"
echo "  ✓ $STANDALONE_DIR/.env             (environment variables)"
echo "  ✓ $STANDALONE_DIR/node_modules/    (Prisma + Next.js deps)"
echo ""
echo "✓ Standalone output ready at $STANDALONE_DIR"
echo ""
