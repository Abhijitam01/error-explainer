import type { ParsedError } from '../core/types.js';

export interface ParsedSolanaError extends ParsedError {
  stack: "solana";
  programId?: string;
  instructionIndex?: number;
}

export function parseSolanaError(stderr: string): ParsedSolanaError {
  const result: ParsedSolanaError = {
    stack: "solana"
  };

  if (!stderr || typeof stderr !== 'string') {
    return result;
  }

  // Anchor errors
  const anchorErrorMatch = stderr.match(/AnchorError:\s*(.+?)(?:\n|$)/);
  if (anchorErrorMatch) {
    result.errorType = "AnchorError";
    result.message = anchorErrorMatch[1].trim();
  }

  // Program errors
  const programErrorMatch = stderr.match(/ProgramError::(\w+)(?::\s*(.+?))?(?:\n|$)/);
  if (programErrorMatch) {
    result.errorType = `ProgramError${programErrorMatch[1]}`;
    result.message = programErrorMatch[2] || programErrorMatch[1];
  }

  // Transaction errors
  if (stderr.includes('TransactionError') || stderr.includes('Transaction failed')) {
    result.errorType = "TransactionError";
    const txMatch = stderr.match(/TransactionError[:\s]+(.+?)(?:\n|$)/);
    if (txMatch) {
      result.message = txMatch[1].trim();
    }
  }

  // Account validation errors
  if (stderr.includes('AccountNotEnoughKeys') || stderr.includes('AccountNotEnoughSigs')) {
    result.errorType = "AccountValidationError";
    result.message = "Account validation failed";
  }

  // Instruction errors
  if (stderr.includes('InstructionError')) {
    result.errorType = "InstructionError";
    const instrMatch = stderr.match(/InstructionError\[(\d+)\]:\s*(.+?)(?:\n|$)/);
    if (instrMatch) {
      result.instructionIndex = parseInt(instrMatch[1], 10);
      result.message = instrMatch[2].trim();
    }
  }

  // Network errors
  if (stderr.includes('Connection refused') || stderr.includes('RPC')) {
    result.errorType = "NetworkError";
    const networkMatch = stderr.match(/(Connection|RPC|Network).+?(?:\n|$)/);
    if (networkMatch) {
      result.message = networkMatch[0].trim();
    }
  }

  // Anchor build errors
  if (stderr.includes('anchor build') || stderr.includes('anchor deploy')) {
    result.errorType = result.errorType || "AnchorBuildError";
    const buildMatch = stderr.match(/error:\s*(.+?)(?:\n|$)/);
    if (buildMatch) {
      result.message = buildMatch[1].trim();
    }
  }

  // Program ID extraction
  const programIdMatch = stderr.match(/Program Id:\s*([A-Za-z0-9]{32,44})/);
  if (programIdMatch) {
    result.programId = programIdMatch[1];
  }

  // File and line extraction
  const fileLineMatch = stderr.match(/([^\s]+\.rs):(\d+):(\d+)/);
  if (fileLineMatch) {
    result.file = fileLineMatch[1];
    result.line = parseInt(fileLineMatch[2], 10);
  }

  // Extract error message if not set
  if (!result.message) {
    const errorMessageMatch = stderr.match(/error:\s*(.+?)(?:\n|$)/);
    if (errorMessageMatch) {
      result.message = errorMessageMatch[1].trim();
    }
  }

  return result;
}

