import type { ParsedError } from '../core/types.js';

export interface ParsedSolidityError extends ParsedError {
  stack: "solidity";
  compiler?: string; // solc version
}

export function parseSolidityError(stderr: string): ParsedSolidityError {
  const result: ParsedSolidityError = {
    stack: "solidity"
  };

  // Solidity compiler errors
  const solcErrorMatch = stderr.match(/Error:\s*(.+?)(?:\n|$)/);
  if (solcErrorMatch) {
    result.errorType = "CompilationError";
    result.message = solcErrorMatch[1].trim();
  }

  // Revert errors
  if (stderr.includes('revert') || stderr.includes('VM revert')) {
    result.errorType = "RevertError";
    const revertMatch = stderr.match(/revert\s+(.+?)(?:\n|$)/i);
    if (revertMatch) {
      result.message = `Revert: ${revertMatch[1].trim()}`;
    } else {
      result.message = "Transaction reverted";
    }
  }

  // Require failures
  if (stderr.includes('require(') || stderr.includes('Requirement')) {
    result.errorType = "RequireError";
    const requireMatch = stderr.match(/require\(.+?\):\s*(.+?)(?:\n|$)/);
    if (requireMatch) {
      result.message = requireMatch[1].trim();
    }
  }

  // Gas estimation errors
  if (stderr.includes('gas') && (stderr.includes('estimate') || stderr.includes('exceeded'))) {
    result.errorType = "GasError";
    const gasMatch = stderr.match(/gas\s+(.+?)(?:\n|$)/i);
    if (gasMatch) {
      result.message = gasMatch[1].trim();
    }
  }

  // Deployment errors
  if (stderr.includes('deploy') && stderr.includes('error')) {
    result.errorType = "DeploymentError";
    const deployMatch = stderr.match(/deploy.*?error:\s*(.+?)(?:\n|$)/i);
    if (deployMatch) {
      result.message = deployMatch[1].trim();
    }
  }

  // Hardhat errors
  if (stderr.includes('hardhat') || stderr.includes('HH')) {
    result.errorType = result.errorType || "HardhatError";
    const hardhatMatch = stderr.match(/HH\d+:\s*(.+?)(?:\n|$)/);
    if (hardhatMatch) {
      result.message = hardhatMatch[1].trim();
    }
  }

  // Truffle errors
  if (stderr.includes('truffle')) {
    result.errorType = result.errorType || "TruffleError";
    const truffleMatch = stderr.match(/Error:\s*(.+?)(?:\n|$)/);
    if (truffleMatch) {
      result.message = truffleMatch[1].trim();
    }
  }

  // File and line extraction
  const fileLineMatch = stderr.match(/([^\s]+\.sol):(\d+):(\d+)/);
  if (fileLineMatch) {
    result.file = fileLineMatch[1];
    result.line = parseInt(fileLineMatch[2], 10);
  }

  // Compiler version
  const compilerMatch = stderr.match(/solc\s+([\d.]+)/);
  if (compilerMatch) {
    result.compiler = compilerMatch[1];
  }

  // Extract error message if not set
  if (!result.message) {
    const errorMessageMatch = stderr.match(/Error:\s*(.+?)(?:\n|$)/);
    if (errorMessageMatch) {
      result.message = errorMessageMatch[1].trim();
    }
  }

  return result;
}

