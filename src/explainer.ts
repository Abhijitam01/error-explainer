import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { aiService } from './ai/service.js';
import { cache } from './features/cache.js';
import { contextAnalyzer } from './context/analyzer.js';
import type { ParsedError, Explanation, StackType, FixSuggestion, CodeExample } from './core/types.js';
import { cwd } from 'process';

export type { Explanation } from './core/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadRules(stack: StackType): Record<string, { what: string; why: string; fix: string[] }> | null {
  try {
    const rulesPath = join(__dirname, 'rules', `${stack}.json`);
    const rulesContent = readFileSync(rulesPath, 'utf-8');
    return JSON.parse(rulesContent);
  } catch {
    return null;
  }
}

function parseAIResponse(response: string, errorFile?: string, errorLine?: number): Explanation | null {
  const lines = response.split('\n');
  let what = '';
  let why = '';
  const fix: string[] = [];
  const fixSuggestions: FixSuggestion[] = [];
  
  let currentSection = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.toLowerCase().startsWith('what happened:')) {
      currentSection = 'what';
      what = trimmed.replace(/^what happened:\s*/i, '').trim();
    } else if (trimmed.toLowerCase().startsWith('why it happens:')) {
      currentSection = 'why';
      why = trimmed.replace(/^why it happens:\s*/i, '').trim();
    } else if (trimmed.toLowerCase().startsWith('how to fix:')) {
      currentSection = 'fix';
    } else if (currentSection === 'what' && trimmed) {
      what += (what ? ' ' : '') + trimmed;
    } else if (currentSection === 'why' && trimmed) {
      why += (why ? ' ' : '') + trimmed;
    } else if (currentSection === 'fix' && trimmed) {
      const fixLine = trimmed.replace(/^[-•*]\s*/, '').trim();
      if (fixLine) {
        fix.push(fixLine);
        
        // Try to extract code blocks as fix suggestions
        if (fixLine.includes('```')) {
          // Handle code in fix suggestions
        }
      }
    }
  }
  
  // Try to parse structured fix suggestions from code blocks
  const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
  let match;
  while ((match = codeBlockRegex.exec(response)) !== null) {
    const code = match[1].trim();
    if (code) {
      fixSuggestions.push({
        description: fix[fixSuggestions.length] || 'Code fix',
        code,
        file: errorFile,
        line: errorLine,
        priority: 'medium'
      });
    }
  }
  
  if (what || why || fix.length > 0) {
    const explanation: Explanation = {
      what: what || 'Unknown error',
      why: why || 'Unable to determine cause',
      fix: fixSuggestions.length > 0 ? fixSuggestions : fix.length > 0 ? fix : ['Check the error message for details'],
      confidence: 0.8 // Default confidence for AI responses
    };
    
    // Add code examples if available
    if (fixSuggestions.length > 0) {
      explanation.codeExamples = fixSuggestions.map(s => ({
        before: '', // Could be extracted from context
        after: s.code || '',
        description: s.description
      }));
    }
    
    return explanation;
  }
  
  return null;
}

export async function explainError(
  error: ParsedError,
  workspaceRoot?: string
): Promise<Explanation | null> {
  const { stack, errorType, message, file, line } = error;
  
  // Check cache first
  const cached = cache.get(stack, errorType, message);
  if (cached) {
    return cached.explanation;
  }
  
  // Try to load rules for this stack
  const rules = loadRules(stack);
  
  // Check if we have a rule for this error type
  if (errorType && rules && rules[errorType]) {
    const ruleExplanation = rules[errorType];
    const explanation: Explanation = {
      ...ruleExplanation,
      confidence: 0.95 // High confidence for rule-based explanations
    };
    // Cache the rule-based explanation
    cache.set(stack, errorType, message, explanation);
    return explanation;
  }
  
  // Analyze context if workspace root is provided
  let context: any = undefined;
  if (workspaceRoot || file) {
    try {
      const workspace = workspaceRoot || cwd();
      const codebaseContext = await contextAnalyzer.analyzeContext(
        workspace,
        file,
        line
      );
      
      context = {
        codebase: codebaseContext,
        codeFiles: codebaseContext.relevantFiles,
        dependencies: codebaseContext.dependencies
      };
    } catch {
      // Ignore context analysis errors
    }
  }
  
  // Try AI service if available
  if (aiService.isAvailable()) {
    const aiResponse = await aiService.explain({
      stack,
      errorType,
      message,
      context
    });
    
    if (aiResponse) {
      const parsed = parseAIResponse(aiResponse, file, line);
      if (parsed) {
        // Cache AI response
        cache.set(stack, errorType, message, parsed);
        return parsed;
      }
    }
  }
  
  // Fallback to legacy Gemini API if new service doesn't work
  try {
    const { explainWithGemini } = await import('./aiGemini.js');
    const geminiResponse = await explainWithGemini(stack, errorType, message);
    if (geminiResponse) {
      const parsed = parseAIResponse(geminiResponse, file, line);
      if (parsed) {
        cache.set(stack, errorType, message, parsed);
        return parsed;
      }
    }
  } catch {
    // Ignore legacy API errors
  }
  
  // Generic fallback
  const fallback: Explanation = {
    what: errorType ? `${errorType} occurred` : 'An error occurred',
    why: message || 'Unable to determine the cause',
    fix: [
      'Check the error message for details',
      'Review the code at the specified location',
      'Consult the documentation for your stack'
    ],
    confidence: 0.5
  };
  
  // Cache fallback too
  cache.set(stack, errorType, message, fallback);
  return fallback;
}
