#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { runCommand } from './runner.js';
import { detectStack } from './detector.js';
import { parseJavaScriptError } from './parser/javascript.js';
import { parseNextJSError } from './parser/nextjs.js';
import { parseMongoError } from './parser/mongo.js';
import { parsePostgresError } from './parser/postgres.js';
import { explainError } from './explainer.js';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function showHelp() {
  console.log(chalk.bold('error-explain - AI-powered error explanation tool\n'));
  console.log('Usage:');
  console.log('  explain <command>     Run command and explain any errors\n');
  console.log('Examples:');
  console.log('  explain npm run build');
  console.log('  explain node script.js');
  console.log('  explain next dev\n');
  console.log('Options:');
  console.log('  --help, -h     Show this help message');
  console.log('  --version, -v  Show version number\n');
  console.log('Environment Variables:');
  console.log('  GEMINI_API_KEY  API key for AI-powered explanations (optional)');
}

function showVersion() {
  try {
    const pkgPath = join(__dirname, '..', 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    console.log(pkg.version);
  } catch {
    console.log('1.0.0');
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  // Handle flags
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }
  
  if (args[0] === '--version' || args[0] === '-v') {
    showVersion();
    process.exit(0);
  }

  // Run the command
  let stdout: string;
  let stderr: string;
  let exitCode: number | null;
  
  try {
    const result = await runCommand(args);
    stdout = result.stdout;
    stderr = result.stderr;
    exitCode = result.exitCode;
  } catch (error) {
    console.error(chalk.red('❌ Failed to execute command:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
  
  // Only process if there's an error (non-zero exit code or stderr)
  if (exitCode === 0 && !stderr) {
    if (stdout) {
      console.log(stdout);
    }
    process.exit(0);
  }

  // Combine stdout and stderr for detection
  const errorOutput = stderr || stdout || 'Unknown error occurred';
  
  // Detect stack
  const stack = detectStack(errorOutput);
  
  // Parse error based on stack
  let parsedError;
  switch (stack) {
    case 'javascript':
      parsedError = parseJavaScriptError(errorOutput);
      break;
    case 'nextjs':
      parsedError = parseNextJSError(errorOutput);
      break;
    case 'mongo':
      parsedError = parseMongoError(errorOutput);
      break;
    case 'postgres':
      parsedError = parsePostgresError(errorOutput);
      break;
    default:
      // For unknown stack, use javascript parser as fallback
      parsedError = parseJavaScriptError(errorOutput);
  }

  // Explain the error
  const explanation = await explainError(parsedError);

  // Pretty-print output
  console.log();
  
  // Error type in red
  if (parsedError.errorType) {
    console.log(chalk.red.bold(`❌ ${parsedError.errorType}`));
  } else {
    console.log(chalk.red.bold('❌ Error'));
  }
  
  // File and line info if available
  if (parsedError.file) {
    const location = parsedError.line 
      ? `${parsedError.file}:${parsedError.line}`
      : parsedError.file;
    console.log(chalk.gray(`   at ${location}`));
  }
  
  // Message if available
  if (parsedError.message) {
    console.log(chalk.gray(`   ${parsedError.message}`));
  }
  
  console.log();
  
  if (explanation) {
    // What happened
    if (explanation.what) {
      console.log(chalk.bold('What happened:'));
      console.log(`  ${explanation.what}`);
      console.log();
    }
    
    // Why it happens (yellow)
    if (explanation.why) {
      console.log(chalk.yellow.bold('Why it happens:'));
      console.log(chalk.yellow(`  ${explanation.why}`));
      console.log();
    }
    
    // How to fix (green)
    if (explanation.fix.length > 0) {
      console.log(chalk.green.bold('✅ How to fix:'));
      for (const fix of explanation.fix) {
        console.log(chalk.green(`  • ${fix}`));
      }
    }
  }
  
  console.log();
  process.exit(exitCode || 1);
}

main().catch((error) => {
  console.error(chalk.red('❌ Unexpected error:'), error);
  process.exit(1);
});
