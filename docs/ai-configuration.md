# AI Configuration

Error Explain supports multiple AI providers for error explanations.

## Supported Providers

### Google Gemini (Default)

Set your API key:

```bash
export GEMINI_API_KEY=your-api-key
```

Or in config:

```json
{
  "aiProvider": "gemini",
  "aiApiKey": "your-api-key"
}
```

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

### OpenAI

Set your API key:

```bash
export OPENAI_API_KEY=your-api-key
```

Or in config:

```json
{
  "aiProvider": "openai",
  "aiApiKey": "your-api-key",
  "aiModel": "gpt-4-turbo-preview"
}
```

### Anthropic Claude

Set your API key:

```bash
export ANTHROPIC_API_KEY=your-api-key
```

Or in config:

```json
{
  "aiProvider": "anthropic",
  "aiApiKey": "your-api-key",
  "aiModel": "claude-3-opus-20240229"
}
```

## Provider Fallback

If the primary provider fails, Error Explain will automatically try fallback providers:

1. Primary provider (from config)
2. OpenAI (if available)
3. Anthropic (if available)
4. Gemini (if available)

## Context-Aware Explanations

Error Explain includes codebase context in AI prompts:

- Relevant code files
- Dependencies
- Project configuration
- Code snippets around error lines

This provides more accurate and relevant explanations.

## Cost Considerations

- Rule-based explanations are free and cached
- AI explanations use API credits
- Responses are cached to minimize API calls
- Context analysis is performed locally

