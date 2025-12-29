export type StackType = 
  | "javascript" 
  | "nextjs" 
  | "mongo" 
  | "postgres" 
  | "rust"
  | "cpp"
  | "solana"
  | "solidity"
  | "unknown";

export interface ParsedError {
  stack: StackType;
  errorType?: string;
  message?: string;
  file?: string;
  line?: number;
  context?: string;
}

export interface StackDetector {
  name: string;
  stack: StackType;
  detect: (errorOutput: string) => boolean;
  priority: number; // Higher priority = checked first
}

export interface ErrorParser {
  name: string;
  stack: StackType;
  parse: (errorOutput: string) => ParsedError;
}

export interface Explanation {
  what: string;
  why: string;
  fix: string[];
}

