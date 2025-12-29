import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export function analyzeDependencies(workspaceRoot: string): {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
} {
  const packageJsonPath = join(workspaceRoot, 'package.json');
  
  if (!existsSync(packageJsonPath)) {
    return { dependencies: {}, devDependencies: {} };
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return {
      dependencies: packageJson.dependencies || {},
      devDependencies: packageJson.devDependencies || {}
    };
  } catch {
    return { dependencies: {}, devDependencies: {} };
  }
}

