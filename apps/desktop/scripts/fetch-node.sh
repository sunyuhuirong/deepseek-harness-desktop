#!/bin/bash
# Fetch the official Node.js binaries bundled into the desktop app.
# dsh requires Node >= 22.13 (zstd + stripTypeScriptTypes), which Electron 33's
# bundled Node (20.18) does not provide, and a GUI-launched app cannot rely on
# a system `node` being on PATH. The binaries land in resources/bin/darwin-{arch}
# and are packaged via mac.extraResources (see electron-builder.yml).
#
# Usage: ./scripts/fetch-node.sh [VERSION]
set -euo pipefail

NODE_VERSION="${1:-v24.18.0}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST_DIR="$SCRIPT_DIR/../resources/bin"

BASE_URL="https://nodejs.org/dist/$NODE_VERSION"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

for arch in arm64 x64; do
  tarball="node-$NODE_VERSION-darwin-$arch.tar.gz"
  echo "Fetching $BASE_URL/$tarball ..."
  curl -fL --retry 3 -o "$TMP_DIR/$tarball" "$BASE_URL/$tarball"
  mkdir -p "$DEST_DIR/darwin-$arch"
  tar -xzf "$TMP_DIR/$tarball" -C "$TMP_DIR" "node-$NODE_VERSION-darwin-$arch/bin/node"
  cp "$TMP_DIR/node-$NODE_VERSION-darwin-$arch/bin/node" "$DEST_DIR/darwin-$arch/node"
  chmod +x "$DEST_DIR/darwin-$arch/node"
  echo "Installed $DEST_DIR/darwin-$arch/node ($NODE_VERSION)"
done

echo "Done."
