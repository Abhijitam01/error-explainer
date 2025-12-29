import type { ParsedError } from '../core/types.js';

export interface ParsedCppError extends ParsedError {
  stack: "cpp";
  compiler?: string; // gcc, clang, msvc
  errorCode?: string; // MSVC error codes like C2065
}

export function parseCppError(stderr: string): ParsedCppError {
  const result: ParsedCppError = {
    stack: "cpp"
  };

  if (!stderr || typeof stderr !== 'string') {
    return result;
  }

  // Detect compiler
  if (stderr.includes('gcc') || stderr.includes('g++')) {
    result.compiler = 'gcc';
  } else if (stderr.includes('clang') || stderr.includes('clang++')) {
    result.compiler = 'clang';
  } else if (stderr.includes('MSVC') || stderr.includes('error C')) {
    result.compiler = 'msvc';
  }

  // Compilation errors
  const errorMatch = stderr.match(/([^:]+):(\d+):(\d+):\s*(?:error|fatal error):\s*(.+?)(?:\n|$)/);
  if (errorMatch) {
    result.file = errorMatch[1];
    result.line = parseInt(errorMatch[2], 10);
    result.errorType = "CompilationError";
    result.message = errorMatch[4].trim();
  }

  // Linker errors
  if (stderr.includes('undefined reference') || stderr.includes('undefined symbol')) {
    result.errorType = "LinkerError";
    const linkerMatch = stderr.match(/undefined (?:reference|symbol) to ['"]([^'"]+)['"]/);
    if (linkerMatch) {
      result.message = `Undefined reference to ${linkerMatch[1]}`;
    }
  }

  // Segmentation fault
  if (stderr.includes('segmentation fault') || stderr.includes('segfault')) {
    result.errorType = "SegmentationFault";
    result.message = "Segmentation fault occurred";
    
    // Try to extract stack trace
    const stackMatch = stderr.match(/at\s+([^\s]+):(\d+)/);
    if (stackMatch) {
      result.file = stackMatch[1];
      result.line = parseInt(stackMatch[2], 10);
    }
  }

  // Template errors
  if (stderr.includes('template') && stderr.includes('error')) {
    result.errorType = "TemplateError";
    const templateMatch = stderr.match(/error:\s*(.+?)(?:\n|$)/);
    if (templateMatch) {
      result.message = templateMatch[1].trim();
    }
  }

  // Memory errors (valgrind, sanitizers)
  if (stderr.includes('AddressSanitizer') || stderr.includes('MemorySanitizer')) {
    result.errorType = "MemoryError";
    const sanitizerMatch = stderr.match(/(.+?):(\d+):(\d+):\s*(.+?)(?:\n|$)/);
    if (sanitizerMatch) {
      result.file = sanitizerMatch[1];
      result.line = parseInt(sanitizerMatch[2], 10);
      result.message = sanitizerMatch[4].trim();
    }
  }

  // MSVC specific errors
  if (result.compiler === 'msvc') {
    const msvcMatch = stderr.match(/error C(\d+):\s*(.+?)(?:\n|$)/);
    if (msvcMatch) {
      result.errorCode = `C${msvcMatch[1]}`;
      result.message = msvcMatch[2].trim();
    }
  }

  // Extract file and line if not already set
  if (!result.file) {
    const fileMatch = stderr.match(/([^\s]+\.(?:cpp|cc|cxx|c|h|hpp)):(\d+)/);
    if (fileMatch) {
      result.file = fileMatch[1];
      result.line = parseInt(fileMatch[2], 10);
    }
  }

  // Extract error message if not set
  if (!result.message) {
    const genericErrorMatch = stderr.match(/error:\s*(.+?)(?:\n|$)/);
    if (genericErrorMatch) {
      result.message = genericErrorMatch[1].trim();
    }
  }

  return result;
}

