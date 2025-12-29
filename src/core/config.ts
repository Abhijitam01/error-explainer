import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface Config {
  timeout?: number; // Command timeout in milliseconds
  retries?: number; // Number of retries for failed commands
  aiProvider?: 'gemini' | 'openai' | 'anthropic';
  aiApiKey?: string;
  cacheEnabled?: boolean;
  cacheDir?: string;
  outputFormat?: 'text' | 'json' | 'markdown';
  verbose?: boolean;
  rules?: {
    enabled?: string[]; // List of enabled rule sets
    customPath?: string; // Path to custom rules
  };
}

const defaultConfig: Config = {
  timeout: 30000, // 30 seconds
  retries: 0,
  aiProvider: 'gemini',
  cacheEnabled: true,
  cacheDir: join(process.cwd(), '.error-explain-cache'),
  outputFormat: 'text',
  verbose: false,
  rules: {
    enabled: [],
    customPath: undefined
  }
};

function findConfigFile(): string | null {
  const searchPaths = [
    join(process.cwd(), '.error-explainrc.json'),
    join(process.cwd(), '.error-explainrc'),
    join(process.env.HOME || '', '.error-explainrc.json'),
    join(process.env.HOME || '', '.error-explainrc')
  ];

  for (const path of searchPaths) {
    if (existsSync(path)) {
      return path;
    }
  }

  return null;
}

function loadConfigFile(): Partial<Config> {
  const configPath = findConfigFile();
  if (!configPath) {
    return {};
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Warning: Failed to load config from ${configPath}:`, error);
    return {};
  }
}

function loadEnvConfig(): Partial<Config> {
  const config: Partial<Config> = {};

  if (process.env.GEMINI_API_KEY) {
    config.aiProvider = 'gemini';
    config.aiApiKey = process.env.GEMINI_API_KEY;
  }

  if (process.env.OPENAI_API_KEY) {
    config.aiProvider = 'openai';
    config.aiApiKey = process.env.OPENAI_API_KEY;
  }

  if (process.env.ANTHROPIC_API_KEY) {
    config.aiProvider = 'anthropic';
    config.aiApiKey = process.env.ANTHROPIC_API_KEY;
  }

  if (process.env.ERROR_EXPLAIN_TIMEOUT) {
    config.timeout = parseInt(process.env.ERROR_EXPLAIN_TIMEOUT, 10);
  }

  if (process.env.ERROR_EXPLAIN_VERBOSE) {
    config.verbose = process.env.ERROR_EXPLAIN_VERBOSE === 'true';
  }

  return config;
}

let cachedConfig: Config | null = null;

export function getConfig(): Config {
  if (cachedConfig) {
    return cachedConfig;
  }

  const fileConfig = loadConfigFile();
  const envConfig = loadEnvConfig();

  cachedConfig = {
    ...defaultConfig,
    ...fileConfig,
    ...envConfig,
    // Merge nested objects
    rules: {
      ...defaultConfig.rules,
      ...fileConfig.rules,
      ...envConfig.rules
    }
  };

  return cachedConfig;
}

export function resetConfig(): void {
  cachedConfig = null;
}

