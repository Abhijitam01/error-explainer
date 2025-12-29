import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { ProjectConfig } from './types.js';

export function analyzeProjectConfig(workspaceRoot: string): ProjectConfig {
  const config: ProjectConfig = {
    type: 'unknown',
    configFiles: {}
  };

  // Check for package.json
  const packageJsonPath = join(workspaceRoot, 'package.json');
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      config.configFiles.packageJson = packageJson;

      // Determine project type from dependencies
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps.next) {
        config.type = 'nextjs';
        config.framework = 'nextjs';
        config.version = deps.next;
      } else if (deps.react) {
        config.type = 'react';
        config.framework = 'react';
        config.version = deps.react;
      } else if (deps.vue) {
        config.type = 'vue';
        config.framework = 'vue';
        config.version = deps.vue;
      } else {
        config.type = 'node';
      }
    } catch {
      // Ignore parsing errors
    }
  }

  // Check for tsconfig.json
  const tsconfigPath = join(workspaceRoot, 'tsconfig.json');
  if (existsSync(tsconfigPath)) {
    try {
      config.configFiles.tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
    } catch {
      // Ignore parsing errors
    }
  }

  // Check for Cargo.toml (Rust)
  const cargoPath = join(workspaceRoot, 'Cargo.toml');
  if (existsSync(cargoPath)) {
    config.type = 'rust';
    config.buildTool = 'cargo';
    try {
      // Simple TOML parsing - could use a library for full support
      const cargoContent = readFileSync(cargoPath, 'utf-8');
      config.configFiles.cargo = cargoContent;
    } catch {
      // Ignore parsing errors
    }
  }

  // Check for CMakeLists.txt or Makefile (C/C++)
  const cmakePath = join(workspaceRoot, 'CMakeLists.txt');
  const makefilePath = join(workspaceRoot, 'Makefile');
  if (existsSync(cmakePath) || existsSync(makefilePath)) {
    if (config.type === 'unknown') {
      config.type = 'cpp';
      config.buildTool = existsSync(cmakePath) ? 'cmake' : 'make';
    }
  }

  return config;
}

