import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
  // The server is implemented in node
  const serverModule = context.asAbsolutePath(
    '../../dist/bin/error-explain-lsp.js'
  );

  // The debug options for the server
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.stdio },
    debug: {
      module: serverModule,
      transport: TransportKind.stdio,
      options: debugOptions
    }
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: [
      { scheme: 'file', language: 'javascript' },
      { scheme: 'file', language: 'typescript' },
      { scheme: 'file', language: 'javascriptreact' },
      { scheme: 'file', language: 'typescriptreact' }
    ],
    synchronize: {
      // Notify the server about file changes to files contained in the workspace
      fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
    }
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    'errorExplain',
    'Error Explain',
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();

  // Register commands
  const explainCommand = vscode.commands.registerCommand(
    'error-explain.explain',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      // Get diagnostics at cursor position
      const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
      const position = editor.selection.active;

      const diagnosticAtCursor = diagnostics.find(d => {
        return (
          position.line >= d.range.start.line &&
          position.line <= d.range.end.line
        );
      });

      if (diagnosticAtCursor) {
        vscode.window.showInformationMessage(
          diagnosticAtCursor.message
        );
      } else {
        vscode.window.showInformationMessage('No error at cursor position');
      }
    }
  );

  context.subscriptions.push(explainCommand);
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}

