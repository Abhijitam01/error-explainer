import { readdirSync, copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const srcDir = 'src/rules';
const distDir = 'dist/rules';

mkdirSync(distDir, { recursive: true });

const files = readdirSync(srcDir).filter(f => f.endsWith('.json'));
files.forEach(file => {
  copyFileSync(join(srcDir, file), join(distDir, file));
});

console.log(`Copied ${files.length} rule files to dist/rules/`);

