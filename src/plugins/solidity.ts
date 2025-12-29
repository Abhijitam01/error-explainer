import type { Plugin } from '../core/plugin.js';
import { parseSolidityError } from '../parser/solidity.js';

export const solidityPlugin: Plugin = {
  name: 'solidity',
  version: '1.0.0',
  detectors: [{
    name: 'solidity-detector',
    stack: 'solidity',
    priority: 95,
    detect: (errorOutput: string) => {
      const lower = errorOutput.toLowerCase();
      return (
        lower.includes('.sol:') ||
        lower.includes('solidity') ||
        lower.includes('solc') ||
        lower.includes('revert') ||
        lower.includes('hardhat') ||
        lower.includes('truffle') ||
        lower.includes('hh') // Hardhat error codes
      );
    }
  }],
  parsers: [{
    name: 'solidity-parser',
    stack: 'solidity',
    parse: parseSolidityError
  }]
};

