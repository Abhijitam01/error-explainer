#!/usr/bin/env node

import { runCommand } from './runner.js';
import { detectStack } from './detector.js';
import { parseJavaScriptError } from './parser/javascript.js';
import { parseNextJSError } from './parser/nextjs.js';
import { parseMongoError } from './parser/mongo.js';
import { parsePostgresError } from './parser/postgres.js';
import { explainError } from './explainer.js';
import chalk from 'chalk';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error(chalk.red('❌ Error: No command provided'));
    console.log('Usage: explain <command>');
    process.exit(1);
  }

  // Run the command
  const { stdout, stderr, exitCode } = await runCommand(args);
  
  // Only process if there's an error (non-zero exit code or stderr)
  if (exitCode === 0 && !stderr) {
    console.log(stdout);
    process.exit(0);
  }

  // Combine stdout and stderr for detection
  const errorOutput = stderr || stdout;
  
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
      parsedError = {
        stack: 'unknown' as const,
        message: errorOutput
      };
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
