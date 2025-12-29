export interface CodeFile {
  path: string;
  content: string;
  language: string;
  imports: string[];
  exports: string[];
  errorLine?: number;
  contextLines?: string[]; // Lines around error
}

export interface FileStructure {
  root: string;
  files: string[];
  directories: string[];
}

export interface ProjectConfig {
  type: 'node' | 'nextjs' | 'react' | 'vue' | 'rust' | 'cpp' | 'unknown';
  framework?: string;
  version?: string;
  buildTool?: string;
  configFiles: Record<string, any>;
}

export interface CodebaseContext {
  projectType: 'node' | 'nextjs' | 'react' | 'vue' | 'rust' | 'cpp' | 'unknown';
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  config: ProjectConfig;
  fileStructure: FileStructure;
  relevantFiles: CodeFile[];
  workspaceRoot: string;
}

