import { build } from 'esbuild';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const entry = join(root, 'src/client/index.jsx');
const temp = join(root, '.tmp-client.js');
const out = join(root, 'lib/client.js');
const id = 'dsh-appearance';

await build({
  entryPoints: [entry],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  jsx: 'automatic',
  target: ['es2022'],
  external: [
    'react',
    'react/*',
    '@deepseek-ai/*'
  ],
  outfile: temp,
  sourcemap: false,
  minify: false
});

const code = await readFile(temp, 'utf8');
const wrapped = [
  `window.__ModuleLoader__.load({`,
  `\tid: "${id}",`,
  `\tfactory: (require) => {`,
  `\t\tvar module = { exports: {} };`,
  `\t\tvar exports = module.exports;`,
  `\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });`,
  code,
  `\t\treturn module.exports;`,
  `\t}`,
  `});`
].join('\n');

await mkdir(dirname(out), { recursive: true });
await writeFile(out, wrapped);
await rm(temp, { force: true });

console.log(`built ${out}`);
