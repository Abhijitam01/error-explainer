import type { Plugin } from '../core/plugin.js';
import { parseRustError } from '../parser/rust.js';

export const rustPlugin: Plugin = {
  name: 'rust',
  version: '1.0.0',
  detectors: [{
    name: 'rust-detector',
    stack: 'rust',
    priority: 90,
    detect: (errorOutput: string) => {
      const lower = errorOutput.toLowerCase();
      return (
        lower.includes('error[e') ||
        lower.includes('rustc') ||
        lower.includes('cargo') ||
        lower.includes('panicked at') ||
        lower.includes('.rs:') ||
        lower.includes('cannot borrow') ||
        lower.includes('does not live long enough')
      );
    }
  }],
  parsers: [{
    name: 'rust-parser',
    stack: 'rust',
    parse: parseRustError
  }]
};

