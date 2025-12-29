import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { join } from 'path';

describe('CLI Integration', () => {
  it('should show help message', () => {
    const output = execSync('node dist/index.js --help', { encoding: 'utf-8' });
    expect(output).toContain('error-explain');
  });

  it('should show version', () => {
    const output = execSync('node dist/index.js --version', { encoding: 'utf-8' });
    expect(output.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

