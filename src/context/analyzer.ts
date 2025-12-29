import { resolve } from 'path';
import type { CodebaseContext, CodeFile } from './types.js';
import { analyzeProjectConfig } from './config.js';
import { analyzeDependencies } from './dependencies.js';
import { analyzeFileStructure, readCodeFile } from './codebase.js';

export class ContextAnalyzer {
  private cache: Map<string, CodebaseContext> = new Map();
  private cacheTimestamps: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Analyze codebase context for error explanation
   */
  async analyzeContext(
    workspaceRoot: string,
    errorFile?: string,
    errorLine?: number
  ): Promise<CodebaseContext> {
    const resolvedRoot = resolve(workspaceRoot);
    const cacheKey = `${resolvedRoot}:${errorFile || ''}:${errorLine || ''}`;

    // Check cache with TTL
    if (this.cache.has(cacheKey)) {
      const timestamp = this.cacheTimestamps.get(cacheKey) || 0;
      const now = Date.now();
      if (now - timestamp < this.CACHE_TTL) {
        return this.cache.get(cacheKey)!;
      } else {
        // Cache expired, remove it
        this.cache.delete(cacheKey);
        this.cacheTimestamps.delete(cacheKey);
      }
    }

    const config = analyzeProjectConfig(resolvedRoot);
    const { dependencies, devDependencies } = analyzeDependencies(resolvedRoot);
    const fileStructure = analyzeFileStructure(resolvedRoot, 2); // Limit depth for performance

    const relevantFiles: CodeFile[] = [];

    // Read the file with the error if provided
    if (errorFile) {
      const resolvedErrorFile = resolve(resolvedRoot, errorFile);
      const codeFile = readCodeFile(resolvedErrorFile, errorLine, 10);
      if (codeFile) {
        relevantFiles.push(codeFile);
      }
    }

    const context: CodebaseContext = {
      projectType: config.type,
      dependencies,
      devDependencies,
      config,
      fileStructure,
      relevantFiles,
      workspaceRoot: resolvedRoot
    };

    // Cache with timestamp
    this.cache.set(cacheKey, context);
    this.cacheTimestamps.set(cacheKey, Date.now());

    return context;
  }

  /**
   * Get context for a specific file
   */
  getFileContext(filePath: string, errorLine?: number): CodeFile | null {
    return readCodeFile(filePath, errorLine, 10);
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const contextAnalyzer = new ContextAnalyzer();

