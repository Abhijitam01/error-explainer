import type { Plugin } from '../core/plugin.js';
import { parseCppError } from '../parser/cpp.js';

export const cppPlugin: Plugin = {
  name: 'cpp',
  version: '1.0.0',
  detectors: [{
    name: 'cpp-detector',
    stack: 'cpp',
    priority: 90,
    detect: (errorOutput: string) => {
      const lower = errorOutput.toLowerCase();
      return (
        lower.includes('error:') && (lower.includes('.cpp') || lower.includes('.c') || lower.includes('.h')) ||
        lower.includes('gcc') ||
        lower.includes('clang') ||
        lower.includes('undefined reference') ||
        lower.includes('segmentation fault') ||
        lower.includes('addresssanitizer') ||
        lower.includes('error c') // MSVC
      );
    }
  }],
  parsers: [{
    name: 'cpp-parser',
    stack: 'cpp',
    parse: parseCppError
  }]
};

