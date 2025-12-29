# LSP Integration

Error Explain provides Language Server Protocol (LSP) support for real-time error detection and explanations in your IDE.

## VS Code Extension

### Installation

1. Install the Error Explain extension from the VS Code marketplace
2. Or install from source:
   ```bash
   cd packages/vscode-extension
   npm install
   npm run compile
   ```

### Configuration

Add to your VS Code settings:

```json
{
  "errorExplain.aiProvider": "gemini",
  "errorExplain.geminiApiKey": "your-api-key"
}
```

### Features

- Real-time error detection
- Inline error explanations
- Quick fix suggestions
- Hover tooltips with explanations
- Code actions for common errors

## LSP Server

The LSP server can be used with any LSP-compatible editor.

### Running the Server

```bash
node dist/bin/error-explain-lsp.js
```

### LSP Protocol Support

- `textDocument/publishDiagnostics` - Error diagnostics
- `textDocument/codeAction` - Fix suggestions
- `textDocument/hover` - Explanation tooltips
- `workspace/didChangeWatchedFiles` - File change notifications

## Custom Integration

To integrate with other editors, connect to the LSP server using stdio transport.

