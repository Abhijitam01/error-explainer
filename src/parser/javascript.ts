export interface ParsedJavaScriptError {
  stack: "javascript";
  errorType?: string;
  message?: string;
  file?: string;
  line?: number;
  context?: string;
}

export function parseJavaScriptError(stderr: string): ParsedJavaScriptError {
  const result: ParsedJavaScriptError = {
    stack: "javascript"
  };

  // Match error type: ReferenceError, TypeError, SyntaxError, etc.
  const errorTypeMatch = stderr.match(/^(\w+Error):/m);
  if (errorTypeMatch) {
    result.errorType = errorTypeMatch[1];
  }

  // Extract message after error type
  // Pattern: ErrorType: message
  const messageMatch = stderr.match(/^\w+Error:\s*(.+?)(?:\n|$)/m);
  if (messageMatch) {
    result.message = messageMatch[1].trim();
  }

  // Match file path and line number
  // Pattern: at file:line:column or file:line:column
  const fileLineMatch = stderr.match(/(?:at\s+)?([^\s]+):(\d+):(\d+)/);
  if (fileLineMatch) {
    result.file = fileLineMatch[1];
    result.line = parseInt(fileLineMatch[2], 10);
  }

  // Alternative pattern: (file:line:column)
  if (!result.file) {
    const parenMatch = stderr.match(/\(([^)]+):(\d+):(\d+)\)/);
    if (parenMatch) {
      result.file = parenMatch[1];
      result.line = parseInt(parenMatch[2], 10);
    }
  }

  // Extract context - lines around the error
  // Look for code snippets in the error output
  const contextMatch = stderr.match(/(\d+\s+\|.*)/);
  if (contextMatch) {
    result.context = contextMatch[1].trim();
  }

  // Alternative: extract multiple context lines
  const contextLines = stderr.match(/(\d+\s+\|.*(?:\n\d+\s+\|.*)*)/);
  if (contextLines && !result.context) {
    result.context = contextLines[1].trim();
  }

  return result;
}

