import type { Plugin } from '../core/plugin.js';
import type { ParsedError } from '../core/types.js';

export const unknownPlugin: Plugin = {
  name: 'unknown',
  version: '1.0.0',
  parsers: [{
    name: 'unknown-parser',
    stack: 'unknown',
    parse: (errorOutput: string): ParsedError => {
      return {
        stack: 'unknown',
        message: errorOutput.split('\n').filter(l => l.trim())[0] || 'Unknown error occurred'
      };
    }
  }]
};

