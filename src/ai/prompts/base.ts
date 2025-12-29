import type { ExplainOptions } from '../types.js';

export function buildBasePrompt(options: ExplainOptions): string {
  let prompt = `You are a senior engineer. Explain this error briefly and provide actionable fixes.

Rules:
- Bullet points only
- No theory
- No assumptions
- No long explanations
- Provide specific code fixes when possible

Error:
Stack: ${options.stack}
Type: ${options.errorType || 'unknown'}
Message: ${options.message || 'N/A'}`;

  // Add context if available
  if (options.context?.codeFiles && options.context.codeFiles.length > 0) {
    prompt += '\n\nRelevant code:\n';
    for (const file of options.context.codeFiles) {
      prompt += `\nFile: ${file.path}`;
      if (file.errorLine) {
        prompt += ` (Line ${file.errorLine})`;
      }
      if (file.contextLines) {
        prompt += '\n```' + (file.language || '') + '\n' + file.contextLines.join('\n') + '\n```\n';
      }
    }
  }

  if (options.context?.dependencies && Object.keys(options.context.dependencies).length > 0) {
    prompt += '\n\nDependencies: ' + Object.keys(options.context.dependencies).slice(0, 10).join(', ');
  }

  prompt += '\n\nFormat your response as:\nWhat happened:\nWhy it happens:\nHow to fix:';

  return prompt;
}

