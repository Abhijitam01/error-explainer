import type { Plugin } from '../core/plugin.js';
import { parsePostgresError } from '../parser/postgres.js';

export const postgresPlugin: Plugin = {
  name: 'postgres',
  version: '1.0.0',
  detectors: [{
    name: 'postgres-detector',
    stack: 'postgres',
    priority: 80,
    detect: (errorOutput: string) => {
      const lower = errorOutput.toLowerCase();
      return (
        lower.includes('postgresql') ||
        lower.includes('postgres') ||
        (lower.includes('relation') && lower.includes('does not exist')) ||
        lower.includes('pg_') ||
        lower.includes('psql:')
      );
    }
  }],
  parsers: [{
    name: 'postgres-parser',
    stack: 'postgres',
    parse: parsePostgresError
  }]
};

