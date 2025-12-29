import { getConfig } from '../core/config.js';
import type { AIProvider, ExplainOptions } from './types.js';
import { GeminiProvider } from './providers/gemini.js';
import { OpenAIProvider } from './providers/openai.js';
import { AnthropicProvider } from './providers/anthropic.js';

export class AIService {
  private providers: Map<string, AIProvider> = new Map();
  private defaultProvider: string;
  private fallbackProviders: string[];

  constructor() {
    const config = getConfig();
    
    // Initialize providers
    if (config.aiApiKey || process.env.GEMINI_API_KEY) {
      this.providers.set('gemini', new GeminiProvider({
        apiKey: config.aiApiKey || process.env.GEMINI_API_KEY
      }));
    }
    
    if (config.aiApiKey || process.env.OPENAI_API_KEY) {
      this.providers.set('openai', new OpenAIProvider({
        apiKey: config.aiApiKey || process.env.OPENAI_API_KEY
      }));
    }
    
    if (config.aiApiKey || process.env.ANTHROPIC_API_KEY) {
      this.providers.set('anthropic', new AnthropicProvider({
        apiKey: config.aiApiKey || process.env.ANTHROPIC_API_KEY
      }));
    }

    // Set default provider and fallback chain
    this.defaultProvider = config.aiProvider || 'gemini';
    this.fallbackProviders = ['openai', 'anthropic', 'gemini'].filter(
      p => p !== this.defaultProvider && this.providers.has(p)
    );
  }

  /**
   * Explain error using AI with fallback support
   */
  async explain(options: ExplainOptions): Promise<string | null> {
    // Try default provider first
    const defaultProvider = this.providers.get(this.defaultProvider);
    if (defaultProvider) {
      const response = await defaultProvider.explain(options);
      if (response) {
        return response;
      }
    }

    // Try fallback providers
    for (const providerName of this.fallbackProviders) {
      const provider = this.providers.get(providerName);
      if (provider) {
        const response = await provider.explain(options);
        if (response) {
          return response;
        }
      }
    }

    return null;
  }

  /**
   * Stream explanation (if provider supports it)
   */
  async stream(options: ExplainOptions, onChunk: (chunk: string) => void): Promise<void> {
    const provider = this.providers.get(this.defaultProvider);
    if (provider && provider.stream) {
      await provider.stream(options, onChunk);
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if AI is available
   */
  isAvailable(): boolean {
    return this.providers.size > 0;
  }
}

export const aiService = new AIService();

