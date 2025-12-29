import type { AIProvider, ExplainOptions, AIProviderConfig } from '../types.js';

export class GeminiProvider implements AIProvider {
  name = 'gemini';
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY || '';
    this.model = config.model || 'gemini-pro';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  async explain(options: ExplainOptions): Promise<string | null> {
    if (!this.apiKey) {
      return null;
    }

    const prompt = this.buildPrompt(options);
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        return data.candidates[0].content.parts[0].text || null;
      }

      return null;
    } catch {
      return null;
    }
  }

  private buildPrompt(options: ExplainOptions): string {
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
          prompt += '\n```\n' + file.contextLines.join('\n') + '\n```\n';
        }
      }
    }

    if (options.context?.dependencies && Object.keys(options.context.dependencies).length > 0) {
      prompt += '\n\nDependencies: ' + Object.keys(options.context.dependencies).slice(0, 10).join(', ');
    }

    prompt += '\n\nFormat your response as:\nWhat happened:\nWhy it happens:\nHow to fix:';

    return prompt;
  }
}

