#!/bin/bash
# Quick start script for development
# Usage: ./start-dev.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== DeepSeek Harness Desktop - Dev Mode ==="
echo ""

# Check if electron is installed
if ! command -v electron &> /dev/null; then
  echo "Installing Electron..."
  pnpm add -D electron@latest --ignore-workspace
fi

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
echo ""
echo "Starting Desktop App (dev mode)..."
echo ""

# Start the app
NODE_ENV=development electron .
