import type { Plugin } from '../core/plugin.js';
import { parseNextJSError } from '../parser/nextjs.js';

export const nextjsPlugin: Plugin = {
  name: 'nextjs',
  version: '1.0.0',
  detectors: [{
    name: 'nextjs-detector',
    stack: 'nextjs',
    priority: 100, // Higher priority than javascript
    detect: (errorOutput: string) => {
      const lower = errorOutput.toLowerCase();
      return (
        lower.includes('next') ||
        lower.includes('pages/') ||
        lower.includes('app/') ||
        lower.includes('next.config') ||
        lower.includes('nextjs')
      );
    }
  }],
  parsers: [{
    name: 'nextjs-parser',
    stack: 'nextjs',
    parse: parseNextJSError
  }]
};

