import type { StackDetector, ErrorParser, StackType, ParsedError } from './types.js';

class Registry {
  private detectors: StackDetector[] = [];
  private parsers: Map<StackType, ErrorParser> = new Map();

  registerDetector(detector: StackDetector): void {
    // Remove existing detector with same name
    this.detectors = this.detectors.filter(d => d.name !== detector.name);
    this.detectors.push(detector);
    // Sort by priority (higher first)
    this.detectors.sort((a, b) => b.priority - a.priority);
  }

  registerParser(parser: ErrorParser): void {
    this.parsers.set(parser.stack, parser);
  }

  detectStack(errorOutput: string): StackType {
    for (const detector of this.detectors) {
      if (detector.detect(errorOutput)) {
        return detector.stack;
      }
    }
    return "unknown";
  }

  getParser(stack: StackType): ErrorParser | null {
    return this.parsers.get(stack) || null;
  }

  getAllStacks(): StackType[] {
    return Array.from(this.parsers.keys());
  }

  parseError(errorOutput: string, stack?: StackType): ParsedError {
    const detectedStack = stack || this.detectStack(errorOutput);
    const parser = this.getParser(detectedStack);
    
    if (parser) {
      try {
        return parser.parse(errorOutput);
      } catch (error) {
        // Fallback to unknown parser if parsing fails
        const unknownParser = this.parsers.get("unknown");
        if (unknownParser) {
          return unknownParser.parse(errorOutput);
        }
        // Last resort fallback
        return {
          stack: "unknown",
          message: errorOutput
        };
      }
    }

    // Fallback if no parser found
    return {
      stack: "unknown",
      message: errorOutput
    };
  }
}

export const registry = new Registry();

