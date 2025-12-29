import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { getConfig } from '../core/config.js';

interface CacheEntry {
  explanation: {
    what: string;
    why: string;
    fix: string[];
  };
  timestamp: number;
  stack: string;
  errorType?: string;
}

export class Cache {
  private cacheDir: string;
  private enabled: boolean;

  constructor() {
    const config = getConfig();
    this.enabled = config.cacheEnabled !== false;
    this.cacheDir = config.cacheDir || join(process.cwd(), '.error-explain-cache');
    
    if (this.enabled) {
      try {
        mkdirSync(this.cacheDir, { recursive: true });
      } catch {
        // Ignore errors
      }
    }
  }

  private getCacheKey(stack: string, errorType?: string, message?: string): string {
    const content = `${stack}:${errorType || ''}:${message || ''}`;
    return createHash('md5').update(content).digest('hex');
  }

  private getCachePath(key: string): string {
    return join(this.cacheDir, `${key}.json`);
  }

  get(stack: string, errorType?: string, message?: string): CacheEntry | null {
    if (!this.enabled) {
      return null;
    }

    try {
      const key = this.getCacheKey(stack, errorType, message);
      const path = this.getCachePath(key);
      
      if (existsSync(path)) {
        const content = readFileSync(path, 'utf-8');
        const entry: CacheEntry = JSON.parse(content);
        
        // Cache expires after 7 days
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (entry.timestamp > weekAgo) {
          return entry;
        }
      }
    } catch {
      // Ignore cache errors
    }

    return null;
  }

  set(stack: string, errorType: string | undefined, message: string | undefined, explanation: CacheEntry['explanation']): void {
    if (!this.enabled) {
      return;
    }

    try {
      const key = this.getCacheKey(stack, errorType, message);
      const path = this.getCachePath(key);
      
      const entry: CacheEntry = {
        explanation,
        timestamp: Date.now(),
        stack,
        errorType
      };

      writeFileSync(path, JSON.stringify(entry, null, 2));
    } catch {
      // Ignore cache errors
    }
  }

  clear(): void {
    if (!this.enabled) {
      return;
    }

    try {
      // Clear cache by removing directory
      const { rmSync } = require('fs');
      if (existsSync(this.cacheDir)) {
        rmSync(this.cacheDir, { recursive: true, force: true });
        mkdirSync(this.cacheDir, { recursive: true });
      }
    } catch {
      // Ignore errors
    }
  }
}

export const cache = new Cache();

