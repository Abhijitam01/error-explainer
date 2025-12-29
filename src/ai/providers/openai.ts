import type { AIProvider, ExplainOptions, AIProviderConfig } from '../types.js';

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || '';
    this.model = config.model || 'gpt-4-turbo-preview';
    this.baseUrl = config.apiKey ? 'https://api.openai.com/v1' : 'https://api.openai.com/v1';
  }

  async explain(options: ExplainOptions): Promise<string | null> {
    if (!this.apiKey) {
      return null;
    }

    const prompt = this.buildPrompt(options);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a senior engineer. Explain errors briefly with actionable fixes.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch {
      return null;
    }
  }

  async stream(options: ExplainOptions, onChunk: (chunk: string) => void): Promise<void> {
    if (!this.apiKey) {
      return;
    }

    const prompt = this.buildPrompt(options);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a senior engineer. Explain errors briefly with actionable fixes.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          stream: true
        })
      });

      if (!response.ok) {
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch {
      // Ignore errors
    }
  }

  private buildPrompt(options: ExplainOptions): string {
    let prompt = `Explain this error briefly and provide actionable fixes.

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

