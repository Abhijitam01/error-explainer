# API Documentation

## Core Types

### ParsedError

```typescript
interface ParsedError {
  stack: StackType;
  errorType?: string;
  message?: string;
  file?: string;
  line?: number;
  context?: string;
}
```

### Explanation

```typescript
interface Explanation {
  what: string;
  why: string;
  fix: string[] | FixSuggestion[];
  relatedErrors?: string[];
  preventionTips?: string[];
  codeExamples?: CodeExample[];
  confidence?: number;
}
```

### FixSuggestion

```typescript
interface FixSuggestion {
  description: string;
  code?: string;
  file?: string;
  line?: number;
  priority: 'high' | 'medium' | 'low';
}
```

## Core Functions

### explainError

```typescript
async function explainError(
  error: ParsedError,
  workspaceRoot?: string
): Promise<Explanation | null>
```

Explains an error with optional codebase context.

### ContextAnalyzer

```typescript
class ContextAnalyzer {
  async analyzeContext(
    workspaceRoot: string,
    errorFile?: string,
    errorLine?: number
  ): Promise<CodebaseContext>
  
  getFileContext(filePath: string, errorLine?: number): CodeFile | null
  clearCache(): void
}
```

Analyzes codebase context for error explanations.

### AIService

```typescript
class AIService {
  async explain(options: ExplainOptions): Promise<string | null>
  async stream(options: ExplainOptions, onChunk: (chunk: string) => void): Promise<void>
  getAvailableProviders(): string[]
  isAvailable(): boolean
}
```

Provides AI-powered error explanations with multi-provider support.

### FixEngine

```typescript
class FixEngine {
  validateFix(filePath: string, fix: FixSuggestion): { valid: boolean; error?: string }
  applyFix(filePath: string, fix: FixSuggestion, options?: FixOptions): FixResult
  backupFile(filePath: string): string
  restoreFromBackup(filePath: string): boolean
}
```

Applies code fixes with validation and backup support.

## Registry

### registerDetector

```typescript
registry.registerDetector(detector: StackDetector): void
```

Register a stack detector.

### registerParser

```typescript
registry.registerParser(parser: ErrorParser): void
```

Register an error parser.

### parseError

```typescript
registry.parseError(errorOutput: string, stack?: StackType): ParsedError
```

Parse error output into structured format.

## Plugin System

### Plugin Interface

```typescript
interface Plugin {
  name: string;
  version: string;
  detectors?: StackDetector[];
  parsers?: ErrorParser[];
}
```

### loadPlugin

```typescript
function loadPlugin(plugin: Plugin): void
```

Load a plugin into the registry.

