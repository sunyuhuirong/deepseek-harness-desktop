#!/bin/bash
# Quick start script for development
# Usage: ./start-dev.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== DeepSeek Harness Desktop - Dev Mode ==="
echo ""

# Use system Electron from Qoder CN
export ELECTRON_PATH="/Applications/Qoder CN.app/Contents/MacOS/Electron"

# Check if dsh is available
DSH_BIN="${DSH_HOME:-$HOME/.dsh}/node_modules/@deepseek-ai/dsh/lib/bin.js"
if [ ! -f "$DSH_BIN" ]; then
  DSH_BIN="/Users/xianshengzaiqiyue/.npm/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai/dsh/lib/bin.js"
fi

if [ ! -f "$DSH_BIN" ]; then
  echo "Error: DSH binary not found at $DSH_BIN"
  echo "Please run: npm install -g @deepseek-ai/dsh"
  exit 1
fi

echo "DSH binary: $DSH_BIN"
echo "Electron: $ELECTRON_PATH"
echo ""
echo "Starting Desktop App (dev mode)..."
echo ""

# Redirect QoderCN data directories to writable locations
export QODER_CN_PORTABLE_DIR="/tmp/qoder-cn-portable"
mkdir -p "$QODER_CN_PORTABLE_DIR" 2>/dev/null || true

# Copy original data to portable dir if not exists
if [ ! -d "$QODER_CN_PORTABLE_DIR/QoderCN" ]; then
  cp -r "/Users/xianshengzaiqiyue/Library/Application Support/QoderCN" "$QODER_CN_PORTABLE_DIR/" 2>/dev/null || true
fi

# Make writable
chmod -R u+w "$QODER_CN_PORTABLE_DIR/QoderCN" 2>/dev/null || true

# Start the app in portable mode
NODE_ENV=development ELECTRON_RUN_AS_NODE=1 VSCODEPortableMode=1 "$ELECTRON_PATH" --user-data-dir="$QODER_CN_PORTABLE_DIR/QoderCN" .
