import type { ParsedError } from '../core/types.js';

export interface ParsedRustError extends ParsedError {
  stack: "rust";
  errorCode?: string; // e.g., E0382
}

export function parseRustError(stderr: string): ParsedRustError {
  const result: ParsedRustError = {
    stack: "rust"
  };

  // Rust compiler error codes: error[E0382], error[E0425], etc.
  const errorCodeMatch = stderr.match(/error\[E(\d+)\]/);
  if (errorCodeMatch) {
    result.errorCode = `E${errorCodeMatch[1]}`;
    result.errorType = `RustError${result.errorCode}`;
  }

  // Panic errors
  const panicMatch = stderr.match(/thread '[^']+' panicked at '([^']+)'/);
  if (panicMatch) {
    result.errorType = "Panic";
    result.message = panicMatch[1];
  }

  // Borrow checker errors
  if (stderr.includes('cannot borrow') || stderr.includes('borrow of moved value')) {
    result.errorType = result.errorType || "BorrowCheckerError";
    const borrowMatch = stderr.match(/cannot borrow (.+?) as (.+?) because (.+?)(?:\n|$)/);
    if (borrowMatch) {
      result.message = `Cannot borrow ${borrowMatch[1]} as ${borrowMatch[2]}: ${borrowMatch[3]}`;
    }
  }

  // Lifetime errors
  if (stderr.includes('lifetime') || stderr.includes('does not live long enough')) {
    result.errorType = result.errorType || "LifetimeError";
    const lifetimeMatch = stderr.match(/(.+?) does not live long enough/);
    if (lifetimeMatch) {
      result.message = lifetimeMatch[1] + " does not live long enough";
    }
  }

  // Type mismatch errors
  if (stderr.includes('mismatched types') || stderr.includes('expected')) {
    result.errorType = result.errorType || "TypeMismatch";
    const typeMatch = stderr.match(/expected (.+?), found (.+?)(?:\n|$)/);
    if (typeMatch) {
      result.message = `Expected ${typeMatch[1]}, found ${typeMatch[2]}`;
    }
  }

  // Cargo build errors
  if (stderr.includes('cargo') && stderr.includes('error:')) {
    result.errorType = result.errorType || "CargoError";
    const cargoMatch = stderr.match(/error:\s*(.+?)(?:\n|$)/);
    if (cargoMatch) {
      result.message = cargoMatch[1].trim();
    }
  }

  // File and line extraction
  const fileLineMatch = stderr.match(/([^\s]+\.rs):(\d+):(\d+)/);
  if (fileLineMatch) {
    result.file = fileLineMatch[1];
    result.line = parseInt(fileLineMatch[2], 10);
  }

  // Extract error message if not already set
  if (!result.message) {
    const errorMessageMatch = stderr.match(/error:\s*(.+?)(?:\n|$)/);
    if (errorMessageMatch) {
      result.message = errorMessageMatch[1].trim();
    }
  }

  // Extract context (code snippets)
  const contextMatch = stderr.match(/(\d+\s+\|\s+.+)/);
  if (contextMatch) {
    result.context = contextMatch[1].trim();
  }

  return result;
}

