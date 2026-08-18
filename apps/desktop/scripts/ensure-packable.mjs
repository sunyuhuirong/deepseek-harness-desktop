/**
 * Ensure the app is in a packable state before electron-builder runs.
 *
 * `dsh-appearance` is a local, unpublished plugin installed through
 * `file:../../packages/extension/dsh-appearance`. pnpm links it into
 * node_modules as a symlink; electron-builder's asar packaging cannot follow
 * a symlink that resolves outside the app dir ("must be under apps/desktop").
 * This script replaces the symlink with a real directory copy so packaging
 * works, leaving the pnpm-managed link untouched for development.
 */
import { lstatSync, rmSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const projectDir = join(here, '..');
const linkPath = join(projectDir, 'node_modules', 'dsh-appearance');
const sourcePath = join(projectDir, '..', '..', 'packages', 'extension', 'dsh-appearance');

let isLink = false;
try {
  isLink = lstatSync(linkPath).isSymbolicLink();
} catch {
  console.error(`[pack] node_modules/dsh-appearance missing; run "pnpm install" first`);
  process.exit(1);
}

if (!isLink) {
  console.log('[pack] dsh-appearance is already a real directory — OK');
  process.exit(0);
}

if (!lstatSync(sourcePath).isDirectory()) {
  console.error(`[pack] dsh-appearance link target missing: ${sourcePath}`);
  process.exit(1);
}

rmSync(linkPath);
cpSync(sourcePath, linkPath, { recursive: true });
console.log(`[pack] materialized dsh-appearance (symlink -> real copy of ${sourcePath})`);