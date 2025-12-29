import type { Diagnostic, CodeAction, Hover } from 'vscode-languageserver';
import type { ParsedError, Explanation } from '../core/types.js';

export interface DiagnosticWithExplanation extends Diagnostic {
  explanation?: Explanation;
  parsedError?: ParsedError;
}

export function createDiagnostic(
  parsedError: ParsedError,
  explanation: Explanation | null,
  range: { start: { line: number; character: number }; end: { line: number; character: number } }
): DiagnosticWithExplanation {
  const diagnostic: DiagnosticWithExplanation = {
    severity: 1, // Error
    range,
    message: parsedError.message || 'Unknown error',
    source: 'error-explain'
  };

  if (explanation) {
    diagnostic.explanation = explanation;
  }
  diagnostic.parsedError = parsedError;

  return diagnostic;
}

export function createCodeAction(
  diagnostic: DiagnosticWithExplanation,
  title: string = 'Explain error'
): CodeAction {
  return {
    title,
    kind: 'quickfix',
    diagnostics: [diagnostic],
    command: {
      title: 'Explain error',
      command: 'error-explain.explain',
      arguments: [diagnostic]
    }
  };
}

export function createHover(
  explanation: Explanation | null
): Hover | null {
  if (!explanation) {
    return null;
  }

  let content = `**${explanation.what}**\n\n`;
  content += `*${explanation.why}*\n\n`;
  
  if (Array.isArray(explanation.fix)) {
    content += '**How to fix:**\n';
    for (const fix of explanation.fix) {
      if (typeof fix === 'string') {
        content += `- ${fix}\n`;
      } else {
        content += `- ${fix.description}\n`;
      }
    }
  }

  return {
    contents: {
      kind: 'markdown',
      value: content
    }
  };
}

