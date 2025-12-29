#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const entryFile = join(projectRoot, 'src', 'index.ts');

spawn('npx', ['tsx', entryFile, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: projectRoot
}).on('exit', (code) => {
  process.exit(code || 0);
});

