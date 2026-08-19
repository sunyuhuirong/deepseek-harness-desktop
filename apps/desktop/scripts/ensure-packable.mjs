/**
 * Ensure the app is in a packable state before electron-builder runs.
 *
 * Local plugins installed via `file:../../packages/extension/<name>` are
 * pnpm-managed symlinks. electron-builder's asar packaging cannot follow a
 * symlink that resolves outside the app dir ("must be under apps/desktop").
 * This script replaces each symlink with a real directory copy so packaging
 * works, leaving the pnpm-managed link untouched for development.
 */
import { lstatSync, rmSync, cpSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const projectDir = join(here, '..');
const plugins = [
  { link: 'dsh-appearance', source: '../../packages/extension/dsh-appearance' },
  { link: 'dsh-plugin-manager', source: '../../packages/extension/dsh-plugin-manager' },
];
const stateFile = join(projectDir, 'node_modules', '.pack-materialized.json');

const materialized = [];

for (const p of plugins) {
  const linkPath = join(projectDir, 'node_modules', p.link);
  const sourcePath = join(projectDir, '..', '..', 'packages', 'extension', p.link);

  let isLink = false;
  try {
    isLink = lstatSync(linkPath).isSymbolicLink();
  } catch {
    console.error(`[pack] node_modules/${p.link} missing; run "pnpm install" first`);
    process.exit(1);
  }

  if (!isLink) {
    console.log(`[pack] ${p.link} is already a real directory — OK`);
    continue;
  }

  if (!lstatSync(sourcePath).isDirectory()) {
    console.error(`[pack] ${p.link} link target missing: ${sourcePath}`);
    process.exit(1);
  }

  rmSync(linkPath);
  cpSync(sourcePath, linkPath, { recursive: true });
  materialized.push(p.link);
  console.log(`[pack] materialized ${p.link} (symlink -> real copy of ${sourcePath})`);
}

writeFileSync(stateFile, JSON.stringify(materialized));
