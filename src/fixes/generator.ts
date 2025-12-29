import type { ParsedError, FixSuggestion } from '../core/types.js';

/**
 * Generate fix suggestions based on error type
 */
export class FixGenerator {
  /**
   * Generate fix suggestions for common error patterns
   */
  generateFixes(error: ParsedError): FixSuggestion[] {
    const fixes: FixSuggestion[] = [];

    // JavaScript/TypeScript specific fixes
    if (error.stack === 'javascript' || error.stack === 'nextjs') {
      if (error.errorType === 'ReferenceError' && error.message?.includes('is not defined')) {
        const varName = error.message.match(/(\w+) is not defined/)?.[1];
        if (varName) {
          fixes.push({
            description: `Declare variable '${varName}' using const, let, or var`,
            code: `const ${varName} = /* your value here */;`,
            file: error.file,
            line: error.line,
            priority: 'high'
          });
        }
      }

      if (error.errorType === 'TypeError' && error.message?.includes('Cannot read property')) {
        const property = error.message.match(/Cannot read property '(\w+)'/)?.[1];
        if (property) {
          fixes.push({
            description: `Add optional chaining for property '${property}'`,
            code: `// Change: obj.${property}\n// To: obj?.${property}`,
            file: error.file,
            line: error.line,
            priority: 'high'
          });
        }
      }

      if (error.errorType === 'SyntaxError') {
        fixes.push({
          description: 'Check for missing brackets, parentheses, or semicolons',
          code: '// Review syntax around the error line',
          file: error.file,
          line: error.line,
          priority: 'high'
        });
      }
    }

    // Import/export errors
    if (error.message?.includes('Cannot find module') || error.message?.includes('Module not found')) {
      const moduleName = error.message.match(/Cannot find module ['"]([^'"]+)['"]/)?.[1] || 
                        error.message.match(/Module not found: (.+)/)?.[1];
      if (moduleName) {
        fixes.push({
          description: `Install missing module: ${moduleName}`,
          code: `npm install ${moduleName}`,
          priority: 'high'
        });
      }
    }

    return fixes;
  }
}

export const fixGenerator = new FixGenerator();

