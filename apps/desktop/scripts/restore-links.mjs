/**
 * Restore the pnpm-managed symlinks that ensure-packable.mjs materialized
 * before packaging, so development keeps seeing the live plugin sources.
 * Run after electron-builder completes.
 */
import { lstatSync, rmSync, symlinkSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const projectDir = join(here, '..');
const stateFile = join(projectDir, 'node_modules', '.pack-materialized.json');

let names = [];
try {
  names = JSON.parse(readFileSync(stateFile, 'utf8'));
} catch {
  console.log('[pack] nothing to restore');
  process.exit(0);
}

for (const name of names) {
  const linkPath = join(projectDir, 'node_modules', name);
  const target = join('..', '..', 'packages', 'extension', name);

  if (lstatSync(linkPath).isSymbolicLink()) {
    console.log(`[pack] ${name} is already a symlink`);
    continue;
  }

  rmSync(linkPath, { recursive: true });
  symlinkSync(target, linkPath, 'dir');
  console.log(`[pack] restored symlink ${name}`);
}

rmSync(stateFile, { force: true });