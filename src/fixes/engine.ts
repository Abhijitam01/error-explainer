import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { join } from 'path';
import type { FixSuggestion } from '../core/types.js';

export interface FixResult {
  success: boolean;
  message: string;
  originalContent?: string;
  modifiedContent?: string;
}

export class FixEngine {
  /**
   * Validate a fix before applying
   */
  validateFix(filePath: string, fix: FixSuggestion): { valid: boolean; error?: string } {
    if (!fix.code) {
      return { valid: false, error: 'Fix suggestion has no code' };
    }

    if (!existsSync(filePath)) {
      return { valid: false, error: 'File does not exist' };
    }

    // Basic syntax validation could be added here
    // For now, just check if code is not empty
    if (!fix.code.trim()) {
      return { valid: false, error: 'Fix code is empty' };
    }

    return { valid: true };
  }

  /**
   * Backup a file before applying fix
   */
  backupFile(filePath: string): string {
    const backupPath = `${filePath}.backup`;
    if (existsSync(filePath)) {
      copyFileSync(filePath, backupPath);
      return backupPath;
    }
    return backupPath;
  }

  /**
   * Apply a fix suggestion to a file
   */
  applyFix(filePath: string, fix: FixSuggestion, options: {
    backup?: boolean;
    preview?: boolean;
  } = {}): FixResult {
    const validation = this.validateFix(filePath, fix);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.error || 'Validation failed'
      };
    }

    try {
      const originalContent = readFileSync(filePath, 'utf-8');
      
      // If preview mode, return what would be changed
      if (options.preview) {
        return {
          success: true,
          message: 'Preview mode - fix not applied',
          originalContent,
          modifiedContent: this.generateModifiedContent(originalContent, fix)
        };
      }

      // Backup if requested
      if (options.backup) {
        this.backupFile(filePath);
      }

      // Apply the fix
      const modifiedContent = this.generateModifiedContent(originalContent, fix);
      writeFileSync(filePath, modifiedContent, 'utf-8');

      return {
        success: true,
        message: 'Fix applied successfully',
        originalContent,
        modifiedContent
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate modified content from original and fix
   */
  private generateModifiedContent(originalContent: string, fix: FixSuggestion): string {
    if (!fix.code) {
      return originalContent;
    }

    const lines = originalContent.split('\n');

    // If line number is specified, try to replace at that line
    if (fix.line !== undefined && fix.line > 0) {
      const lineIndex = fix.line - 1;
      
      // Simple replacement: replace the line or insert after
      // This is a basic implementation - could be enhanced with AST manipulation
      if (lineIndex < lines.length) {
        // Replace the error line with the fix
        const newLines = [...lines];
        newLines[lineIndex] = fix.code;
        return newLines.join('\n');
      }
    }

    // If no line number, try to find and replace based on context
    // For now, append the fix as a comment (conservative approach)
    return originalContent + '\n\n// Suggested fix:\n' + fix.code;
  }

  /**
   * Restore from backup
   */
  restoreFromBackup(filePath: string): boolean {
    const backupPath = `${filePath}.backup`;
    if (existsSync(backupPath)) {
      try {
        copyFileSync(backupPath, filePath);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export const fixEngine = new FixEngine();

