import type { Plugin } from '../core/plugin.js';
import { detectStack as detectJS } from '../detector.js';
import { parseJavaScriptError } from '../parser/javascript.js';

export const javascriptPlugin: Plugin = {
  name: 'javascript',
  version: '1.0.0',
  detectors: [{
    name: 'javascript-detector',
    stack: 'javascript',
    priority: 50,
    detect: (errorOutput: string) => {
      const lower = errorOutput.toLowerCase();
      return (
        lower.includes('referenceerror') ||
        lower.includes('typeerror') ||
        lower.includes('syntaxerror') ||
        lower.includes('rangeerror') ||
        lower.includes('urlerror') ||
        lower.includes('evalerror') ||
        lower.includes('cannot read property') ||
        lower.includes('is not defined') ||
        lower.includes('unexpected token') ||
        lower.includes('node:') ||
        lower.includes('npm err') ||
        lower.includes('yarn error')
      );
    }
  }],
  parsers: [{
    name: 'javascript-parser',
    stack: 'javascript',
    parse: parseJavaScriptError
  }]
};

