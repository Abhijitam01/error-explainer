import { loadPlugins } from '../core/plugin.js';
import { javascriptPlugin } from './javascript.js';
import { nextjsPlugin } from './nextjs.js';
import { mongoPlugin } from './mongo.js';
import { postgresPlugin } from './postgres.js';
import { rustPlugin } from './rust.js';
import { cppPlugin } from './cpp.js';
import { solanaPlugin } from './solana.js';
import { solidityPlugin } from './solidity.js';
import { unknownPlugin } from './unknown.js';

export function loadAllPlugins(): void {
  loadPlugins([
    solanaPlugin,     // High priority (specific)
    solidityPlugin,   // High priority (specific)
    nextjsPlugin,    // High priority (specific)
    rustPlugin,       // High priority
    cppPlugin,        // High priority
    mongoPlugin,
    postgresPlugin,
    javascriptPlugin,
    unknownPlugin     // Fallback
  ]);
}

