import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import type { CodeFile, FileStructure } from './types.js';

const CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.rs', '.cpp', '.c', '.h', '.hpp',
  '.sol', '.go', '.java', '.kt', '.swift'
]);

const LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.py': 'python',
  '.rs': 'rust',
  '.cpp': 'cpp',
  '.c': 'c',
  '.h': 'c',
  '.hpp': 'cpp',
  '.sol': 'solidity',
  '.go': 'go',
  '.java': 'java',
  '.kt': 'kotlin',
  '.swift': 'swift'
};

export function analyzeFileStructure(workspaceRoot: string, maxDepth = 3, maxFiles = 100): FileStructure {
  const files: string[] = [];
  const directories: string[] = [];
  let fileCount = 0;

  function traverse(dir: string, depth: number) {
    if (depth > maxDepth || fileCount >= maxFiles) return;

    try {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        // Skip node_modules, .git, dist, build, etc.
        if (entry.startsWith('.') || 
            entry === 'node_modules' || 
            entry === 'dist' || 
            entry === 'build' ||
            entry === '.next' ||
            entry === 'target') {
          continue;
        }

        const fullPath = join(dir, entry);
        try {
          const stat = statSync(fullPath);
          if (stat.isDirectory()) {
            directories.push(fullPath);
            traverse(fullPath, depth + 1);
          } else if (stat.isFile() && CODE_EXTENSIONS.has(extname(entry))) {
            if (fileCount < maxFiles) {
              files.push(fullPath);
              fileCount++;
            }
          }
        } catch {
          // Ignore permission errors
        }
      }
    } catch {
      // Ignore directory read errors
    }
  }

  traverse(workspaceRoot, 0);

  return {
    root: workspaceRoot,
    files,
    directories
  };
}

export function readCodeFile(filePath: string, errorLine?: number, contextLines = 5): CodeFile | null {
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const ext = extname(filePath);
    const language = LANGUAGE_MAP[ext] || 'unknown';

    // Extract imports/exports (basic patterns)
    const imports: string[] = [];
    const exports: string[] = [];

    const lines = content.split('\n');
    
    // Extract imports (JavaScript/TypeScript)
    if (language === 'javascript' || language === 'typescript') {
      for (const line of lines) {
        const importMatch = line.match(/^import\s+.+\s+from\s+['"](.+)['"]/);
        if (importMatch) {
          imports.push(importMatch[1]);
        }
        const requireMatch = line.match(/require\(['"](.+)['"]\)/);
        if (requireMatch) {
          imports.push(requireMatch[1]);
        }
        
        if (line.match(/^export\s+/)) {
          exports.push(line.trim());
        }
      }
    }

    // Extract context around error line
    let contextLinesArray: string[] | undefined;
    if (errorLine !== undefined && errorLine > 0) {
      const start = Math.max(0, errorLine - contextLines - 1);
      const end = Math.min(lines.length, errorLine + contextLines);
      contextLinesArray = lines.slice(start, end);
    }

    return {
      path: filePath,
      content,
      language,
      imports,
      exports,
      errorLine,
      contextLines: contextLinesArray
    };
  } catch {
    return null;
  }
}

