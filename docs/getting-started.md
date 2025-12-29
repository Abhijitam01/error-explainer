# Getting Started with Error Explain

Error Explain is an AI-powered tool that helps developers understand and fix errors quickly.

## Installation

### Global Installation

```bash
npm install -g error-explain
```

### Local Installation

```bash
npm install --save-dev error-explain
```

## Basic Usage

Run any command and get AI-powered error explanations:

```bash
explain npm run build
explain node script.js
explain next dev
```

## Configuration

Create a `.error-explainrc.json` file in your project root:

```json
{
  "aiProvider": "gemini",
  "aiApiKey": "your-api-key",
  "context": {
    "enabled": true,
    "depth": 3,
    "includeCodeSnippets": true
  },
  "fixes": {
    "autoApply": false,
    "preview": true,
    "backup": true
  }
}
```

## Environment Variables

- `GEMINI_API_KEY` - API key for Google Gemini
- `OPENAI_API_KEY` - API key for OpenAI
- `ANTHROPIC_API_KEY` - API key for Anthropic Claude

## Commands

- `explain <command>` - Run command and explain errors
- `explain --history` - Show error history
- `explain --stats` - Show error statistics
- `explain --help` - Show help message

## Next Steps

- Read the [AI Configuration Guide](./ai-configuration.md)
- Learn about [LSP Integration](./lsp-integration.md)
- Check out the [API Documentation](./api.md)

