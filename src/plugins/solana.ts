import type { Plugin } from '../core/plugin.js';
import { parseSolanaError } from '../parser/solana.js';

export const solanaPlugin: Plugin = {
  name: 'solana',
  version: '1.0.0',
  detectors: [{
    name: 'solana-detector',
    stack: 'solana',
    priority: 95,
    detect: (errorOutput: string) => {
      const lower = errorOutput.toLowerCase();
      return (
        lower.includes('anchorerror') ||
        lower.includes('programerror') ||
        lower.includes('transactionerror') ||
        lower.includes('anchor build') ||
        lower.includes('solana') ||
        lower.includes('instructionerror')
      );
    }
  }],
  parsers: [{
    name: 'solana-parser',
    stack: 'solana',
    parse: parseSolanaError
  }]
};

