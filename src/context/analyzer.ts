import { resolve } from 'path';
import type { CodebaseContext, CodeFile } from './types.js';
import { analyzeProjectConfig } from './config.js';
import { analyzeDependencies } from './dependencies.js';
import { analyzeFileStructure, readCodeFile } from './codebase.js';

export class ContextAnalyzer {
  private cache: Map<string, CodebaseContext> = new Map();

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

    // Check cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
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

    // Cache for a short time (could be improved with TTL)
    this.cache.set(cacheKey, context);

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
  }
}

export const contextAnalyzer = new ContextAnalyzer();

