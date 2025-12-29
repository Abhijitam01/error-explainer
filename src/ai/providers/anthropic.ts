import type { AIProvider, ExplainOptions, AIProviderConfig } from '../types.js';

export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.model = config.model || 'claude-3-opus-20240229';
    this.baseUrl = 'https://api.anthropic.com/v1';
  }

  async explain(options: ExplainOptions): Promise<string | null> {
    if (!this.apiKey) {
      return null;
    }

    const prompt = this.buildPrompt(options);

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.content?.[0]?.text || null;
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

