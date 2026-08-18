#!/bin/bash
# DeepSeek Harness Desktop - Installation Script
# Usage: ./install.sh [--dev]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
PROFILE_DIR="$DSH_HOME/profiles/desktop"
IS_DEV="${1:---prod}"

echo "=== DeepSeek Harness Desktop Installer ==="
echo ""

# Create DSH home if needed
if [ ! -d "$DSH_HOME" ]; then
  echo "Creating DSH home: $DSH_HOME"
  mkdir -p "$DSH_HOME"
fi

# Create profile directory
if [ ! -d "$PROFILE_DIR" ]; then
  echo "Creating profile: $PROFILE_DIR"
  mkdir -p "$PROFILE_DIR"
fi

# Copy profile configuration
echo "Installing profile configuration..."
cp "$SCRIPT_DIR/profiles/desktop/dsh.profile" "$PROFILE_DIR/"
cp "$SCRIPT_DIR/cordis.desktop.patch.yml" "$PROFILE_DIR/" 2>/dev/null || true

# Create pnpm config to allow build scripts
echo "Configuring pnpm..."
mkdir -p "$SCRIPT_DIR"
cat > "$SCRIPT_DIR/.npmrc" << 'EOF'
only-built-dependencies=electron,koffi,node-pty
EOF

# Install node modules
echo "Installing npm dependencies..."
cd "$SCRIPT_DIR"
if [ "$IS_DEV" = "--dev" ]; then
  pnpm install --ignore-workspace
else
  pnpm install --prod --ignore-workspace
fi

# Build the desktop bundle if needed
if [ ! -f "packages/bundle/desktop-app/lib/index.js" ]; then
  echo "Building desktop bundle..."
  cd packages/bundle/desktop-app
  # Simple build - just create lib directory
  mkdir -p lib
  cp src/index.js lib/
  cp src/invariant.js lib/
  mkdir -p lib/types
  touch lib/types/index.d.ts
  touch lib/types/invariant.d.ts
  cd "$SCRIPT_DIR"
fi

echo ""
echo "=== Installation Complete ==="
echo ""
echo "Profile location: $PROFILE_DIR"
echo ""
echo "To start the desktop app:"
echo "  cd $SCRIPT_DIR && pnpm start"
echo ""
echo "To develop with hot reload:"
echo "  cd $SCRIPT_DIR && pnpm dev"
echo ""
echo "To package for distribution:"
echo "  cd $SCRIPT_DIR && pnpm package:mac   # macOS"
echo "  cd $SCRIPT_DIR && pnpm package:win   # Windows"
echo "  cd $SCRIPT_DIR && pnpm package:linux # Linux"
echo ""
