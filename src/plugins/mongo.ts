import type { Plugin } from '../core/plugin.js';
import { parseMongoError } from '../parser/mongo.js';

export const mongoPlugin: Plugin = {
  name: 'mongo',
  version: '1.0.0',
  detectors: [{
    name: 'mongo-detector',
    stack: 'mongo',
    priority: 80,
    detect: (errorOutput: string) => {
      const lower = errorOutput.toLowerCase();
      return (
        lower.includes('mongoerror') ||
        lower.includes('mongodb') ||
        lower.includes('mongo') ||
        lower.includes('mongosh') ||
        lower.includes('connection to mongodb')
      );
    }
  }],
  parsers: [{
    name: 'mongo-parser',
    stack: 'mongo',
    parse: parseMongoError
  }]
};

