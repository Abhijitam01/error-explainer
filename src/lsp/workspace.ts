import { WorkspaceFolder } from 'vscode-languageserver';

export class WorkspaceManager {
  private workspaceFolders: WorkspaceFolder[] = [];
  private rootUri: string | null = null;

  setWorkspaceFolders(folders: WorkspaceFolder[] | null): void {
    this.workspaceFolders = folders || [];
    if (this.workspaceFolders.length > 0) {
      this.rootUri = this.workspaceFolders[0].uri;
    }
  }

  setRootUri(uri: string | null): void {
    this.rootUri = uri;
  }

  getRootUri(): string | null {
    return this.rootUri;
  }

  getWorkspaceFolders(): WorkspaceFolder[] {
    return this.workspaceFolders;
  }
}

export const workspaceManager = new WorkspaceManager();

