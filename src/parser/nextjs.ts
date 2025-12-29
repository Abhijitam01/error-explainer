export interface ParsedNextJSError {
  stack: "nextjs";
  errorType?: string;
  message?: string;
  file?: string;
  line?: number;
  context?: string;
}

export function parseNextJSError(stderr: string): ParsedNextJSError {
  const result: ParsedNextJSError = {
    stack: "nextjs"
  };

  if (!stderr || typeof stderr !== 'string') {
    return result;
  }

  // Hydration error detection
  const hydrationMatch = stderr.match(/hydration\s+(?:failed|error|mismatch)/i);
  if (hydrationMatch) {
    result.errorType = "HydrationError";
    
    // Extract hydration message
    const hydrationMessageMatch = stderr.match(/hydration\s+(?:failed|error|mismatch)[\s:]+(.+?)(?:\n|$)/i);
    if (hydrationMessageMatch) {
      result.message = hydrationMessageMatch[1].trim();
    }
    
    // Extract file and line from hydration errors
    const hydrationFileMatch = stderr.match(/(?:at|in)\s+([^\s]+)\s*\(([^:]+):(\d+):(\d+)\)/);
    if (hydrationFileMatch) {
      result.file = hydrationFileMatch[2];
      result.line = parseInt(hydrationFileMatch[3], 10);
    }
  }

  // Module not found error
  const moduleNotFoundMatch = stderr.match(/Module not found[:\s]+(.+?)(?:\n|$)/i);
  if (moduleNotFoundMatch) {
    result.errorType = "ModuleNotFound";
    result.message = moduleNotFoundMatch[1].trim();
    
    // Extract file path from module not found
    const moduleFileMatch = stderr.match(/Cannot find module[:\s]+['"]([^'"]+)['"]/);
    if (moduleFileMatch) {
      result.file = moduleFileMatch[1];
    }
    
    // Alternative pattern: in file:line
    if (!result.file) {
      const altFileMatch = stderr.match(/in\s+([^\s]+):(\d+)/);
      if (altFileMatch) {
        result.file = altFileMatch[1];
        result.line = parseInt(altFileMatch[2], 10);
      }
    }
  }

  // Server/Client mismatch error
  const serverClientMatch = stderr.match(/(?:server|client)\s+(?:and\s+)?(?:client|server)\s+mismatch/i);
  if (serverClientMatch) {
    result.errorType = "ServerClientMismatch";
    
    // Extract mismatch details
    const mismatchMessageMatch = stderr.match(/(?:server|client)\s+(?:and\s+)?(?:client|server)\s+mismatch[:\s]+(.+?)(?:\n|$)/i);
    if (mismatchMessageMatch) {
      result.message = mismatchMessageMatch[1].trim();
    }
    
    // Extract file and line
    const mismatchFileMatch = stderr.match(/(?:at|in)\s+([^\s]+)\s*\(([^:]+):(\d+):(\d+)\)/);
    if (mismatchFileMatch) {
      result.file = mismatchFileMatch[2];
      result.line = parseInt(mismatchFileMatch[3], 10);
    }
  }

  // Extract context lines if available
  const contextMatch = stderr.match(/(\d+\s+\|.*(?:\n\d+\s+\|.*)*)/);
  if (contextMatch) {
    result.context = contextMatch[1].trim();
  }

  // If no specific error type found, try generic Next.js error patterns
  if (!result.errorType) {
    const genericErrorMatch = stderr.match(/^(\w+Error):\s*(.+?)(?:\n|$)/m);
    if (genericErrorMatch) {
      result.errorType = genericErrorMatch[1];
      result.message = genericErrorMatch[2].trim();
    }
    
    // Extract file and line from generic patterns
    if (!result.file) {
      const genericFileMatch = stderr.match(/(?:at|in)\s+([^\s]+)\s*\(([^:]+):(\d+):(\d+)\)/);
      if (genericFileMatch) {
        result.file = genericFileMatch[2];
        result.line = parseInt(genericFileMatch[3], 10);
      }
    }
  }

  return result;
}

