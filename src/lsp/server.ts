import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  TextDocumentSyncKind,
  InitializeResult,
  CodeActionKind,
  CodeAction,
  Hover,
  TextDocumentPositionParams
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { registry } from '../core/registry.js';
import { explainError } from '../explainer.js';
import { contextAnalyzer } from '../context/analyzer.js';
import type { ParsedError } from '../core/types.js';

export function startServer() {
  // Create a connection for the server
  const connection = createConnection(ProposedFeatures.all);

  // Create a simple text document manager
  const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      codeActionProvider: {
        codeActionKinds: [CodeActionKind.QuickFix]
      },
      hoverProvider: true
    }
  };

  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true
      }
    };
  }

  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
});

// Handle document diagnostics
documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  const text = textDocument.getText();
  
  // For now, we'll validate on save or manually triggered
  // In a real implementation, you'd run linters/compilers and parse their output
  
  const diagnostics: Diagnostic[] = [];
  
  // Example: Check for common patterns (simplified)
  // In reality, you'd spawn processes and parse error output
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Simple example checks
    if (line.includes('TODO') || line.includes('FIXME')) {
      diagnostics.push({
        severity: DiagnosticSeverity.Information,
        range: {
          start: { line: i, character: 0 },
          end: { line: i, character: line.length }
        },
        message: 'TODO or FIXME comment found',
        source: 'error-explain'
      });
    }
  }
  
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// Handle code actions
connection.onCodeAction(params => {
  const codeActions: CodeAction[] = [];
  const diagnostics = params.context.diagnostics;
  
  for (const diagnostic of diagnostics) {
    if (diagnostic.source === 'error-explain') {
      // Create a code action to explain the error
      const codeAction: CodeAction = {
        title: 'Explain this error',
        kind: CodeActionKind.QuickFix,
        diagnostics: [diagnostic],
        command: {
          title: 'Explain error',
          command: 'error-explain.explain',
          arguments: [params.textDocument.uri, diagnostic]
        }
      };
      codeActions.push(codeAction);
    }
  }
  
  return codeActions;
});

// Handle hover
connection.onHover(async (params: TextDocumentPositionParams): Promise<Hover | null> => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return null;
  }

  const position = params.position;
  const text = document.getText();
  const lines = text.split('\n');
  const line = lines[position.line];

  // Check if hovering over an error indicator
  // In a real implementation, you'd check against actual diagnostics
  
  // For now, return a simple hover
  if (line.includes('error') || line.includes('Error')) {
    return {
      contents: {
        kind: 'markdown',
        value: 'Error detected. Use code action to get explanation.'
      }
    };
  }

  return null;
});

// Make the text document manager listen on the connection
documents.listen(connection);

  // Make the text document manager listen on the connection
  documents.listen(connection);

  // Listen on the connection
  connection.listen();
}

