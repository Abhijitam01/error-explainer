export interface AIProvider {
  name: string;
  explain(options: ExplainOptions): Promise<string | null>;
  stream?(options: ExplainOptions, onChunk: (chunk: string) => void): Promise<void>;
}

export interface ExplainOptions {
  stack: string;
  errorType?: string;
  message?: string;
  context?: {
    codebase?: any;
    codeFiles?: Array<{
      path: string;
      content: string;
      language: string;
      errorLine?: number;
      contextLines?: string[];
    }>;
    dependencies?: Record<string, string>;
  };
  prompt?: string;
}

export interface AIProviderConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

