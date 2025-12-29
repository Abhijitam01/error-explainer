import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { explainWithGemini } from './aiGemini.js';
import type { ParsedJavaScriptError } from './parser/javascript.js';
import type { ParsedNextJSError } from './parser/nextjs.js';
import type { ParsedMongoError } from './parser/mongo.js';
import type { ParsedPostgresError } from './parser/postgres.js';

export type ParsedError = 
  | ParsedJavaScriptError 
  | ParsedNextJSError 
  | ParsedMongoError 
  | ParsedPostgresError;

export interface Explanation {
  what: string;
  why: string;
  fix: string[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadRules(stack: string): Record<string, { what: string; why: string; fix: string[] }> | null {
  try {
    const rulesPath = join(__dirname, 'rules', `${stack}.json`);
    const rulesContent = readFileSync(rulesPath, 'utf-8');
    return JSON.parse(rulesContent);
  } catch {
    return null;
  }
}

function parseGeminiResponse(response: string): Explanation | null {
  const lines = response.split('\n');
  let what = '';
  let why = '';
  const fix: string[] = [];
  
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
      }
    }
  }
  
  if (what || why || fix.length > 0) {
    return { what: what || 'Unknown error', why: why || 'Unable to determine cause', fix: fix.length > 0 ? fix : ['Check the error message for details'] };
  }
  
  return null;
}

export async function explainError(error: ParsedError): Promise<Explanation | null> {
  const { stack, errorType, message } = error;
  
  // Try to load rules for this stack
  const rules = loadRules(stack);
  
  // Check if we have a rule for this error type
  if (errorType && rules && rules[errorType]) {
    return rules[errorType];
  }
  
  // Try Gemini AI if available
  const geminiResponse = await explainWithGemini(stack, errorType, message);
  if (geminiResponse) {
    const parsed = parseGeminiResponse(geminiResponse);
    if (parsed) {
      return parsed;
    }
  }
  
  // Generic fallback
  return {
    what: errorType ? `${errorType} occurred` : 'An error occurred',
    why: message || 'Unable to determine the cause',
    fix: [
      'Check the error message for details',
      'Review the code at the specified location',
      'Consult the documentation for your stack'
    ]
  };
}

