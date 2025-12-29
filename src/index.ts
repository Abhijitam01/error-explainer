#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { runCommand } from './runner.js';
import { registry } from './core/registry.js';
import { loadAllPlugins } from './plugins/index.js';
import { explainError } from './explainer.js';
import type { ParsedError, Explanation } from './core/types.js';
import chalk from 'chalk';

// Load all plugins on startup
loadAllPlugins();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function showHelp() {
  console.log(chalk.bold('error-explain - AI-powered error explanation tool\n'));
  console.log('Usage:');
  console.log('  explain <command>        Run command and explain any errors');
  console.log('  explain --history        Show error history');
  console.log('  explain --stats          Show error statistics');
  console.log('  explain --context        Show context analysis for last error\n');
  console.log('Examples:');
  console.log('  explain npm run build');
  console.log('  explain node script.js');
  console.log('  explain next dev\n');
  console.log('Options:');
  console.log('  --help, -h           Show this help message');
  console.log('  --version, -v        Show version number');
  console.log('  --json, -j           Output in JSON format');
  console.log('  --format <fmt>       Output format: text, json, markdown');
  console.log('  --history            Show error history');
  console.log('  --stats              Show error statistics');
  console.log('  --context            Show context analysis');
  console.log('  --fix                Show and apply fixes interactively\n');
  console.log('Environment Variables:');
  console.log('  GEMINI_API_KEY       API key for Gemini AI');
  console.log('  OPENAI_API_KEY       API key for OpenAI');
  console.log('  ANTHROPIC_API_KEY    API key for Anthropic Claude');
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

function getOutputFormat(args: string[]): 'text' | 'json' | 'markdown' {
  const formatIndex = args.indexOf('--format');
  if (formatIndex !== -1 && args[formatIndex + 1]) {
    const format = args[formatIndex + 1].toLowerCase();
    if (format === 'json' || format === 'markdown' || format === 'text') {
      return format as 'text' | 'json' | 'markdown';
    }
  }
  if (args.includes('--json') || args.includes('-j')) {
    return 'json';
  }
  return 'text';
}

function outputJSON(parsedError: ParsedError, explanation: Explanation | null, exitCode: number | null): void {
  const output = {
    error: {
      stack: parsedError.stack,
      type: parsedError.errorType,
      message: parsedError.message,
      file: parsedError.file,
      line: parsedError.line,
      context: parsedError.context
    },
    explanation: explanation || null,
    exitCode: exitCode
  };
  console.log(JSON.stringify(output, null, 2));
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

  // Handle history command
  if (args[0] === '--history') {
    const { showHistory } = await import('./commands/history.js');
    showHistory(parseInt(args[1]) || 10);
    process.exit(0);
  }

  // Handle stats command
  if (args[0] === '--stats') {
    const { showStats } = await import('./commands/stats.js');
    showStats();
    process.exit(0);
  }

  const outputFormat = getOutputFormat(args);
  // Remove format flags from args before running command
  const commandArgs = args.filter((arg, i) => 
    arg !== '--json' && arg !== '-j' && 
    arg !== '--format' && (i === 0 || args[i - 1] !== '--format')
  );

  // Run the command
  let stdout: string;
  let stderr: string;
  let exitCode: number | null;
  
  try {
    const result = await runCommand(commandArgs);
    stdout = result.stdout;
    stderr = result.stderr;
    exitCode = result.exitCode;
  } catch (error) {
    if (outputFormat === 'json') {
      console.log(JSON.stringify({
        error: {
          message: error instanceof Error ? error.message : String(error),
          type: 'CommandExecutionError'
        },
        explanation: null,
        exitCode: 1
      }, null, 2));
    } else {
      console.error(chalk.red('❌ Failed to execute command:'), error instanceof Error ? error.message : String(error));
    }
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
  
  // Use registry to detect and parse error
  const parsedError = registry.parseError(errorOutput);

  // Explain the error with context
  const workspaceRoot = process.cwd();
  const explanation = await explainError(parsedError, workspaceRoot);

  // Save to history
  const { errorHistory } = await import('./features/history.js');
  errorHistory.add(parsedError, explanation, commandArgs.join(' '));

  // Check for similar errors
  const similar = errorHistory.findSimilar(parsedError);
  if (similar.length > 0 && similar[0].count > 1) {
    // Show note about recurring error
    if (outputFormat !== 'json') {
      console.log(chalk.yellow(`\n⚠️  You've seen this error ${similar[0].count} time(s) before\n`));
    }
  }

  // Output in requested format
  if (outputFormat === 'json') {
    outputJSON(parsedError, explanation, exitCode);
    process.exit(exitCode || 1);
    return;
  }

  // Pretty-print output (text format)
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
  } else if (errorOutput && errorOutput !== 'Unknown error occurred') {
    // Show original error if no message was parsed
    const errorLines = errorOutput.split('\n').filter(l => l.trim()).slice(0, 3);
    console.log(chalk.gray(`   ${errorLines.join('\n   ')}`));
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
        if (typeof fix === 'string') {
          console.log(chalk.green(`  • ${fix}`));
        } else {
          // Structured fix suggestion
          const priorityColor = fix.priority === 'high' ? chalk.red : fix.priority === 'medium' ? chalk.yellow : chalk.gray;
          console.log(priorityColor(`  • [${fix.priority.toUpperCase()}] ${fix.description}`));
          if (fix.code) {
            console.log(chalk.gray(`    Code fix:`));
            console.log(chalk.gray(`    ${fix.code.split('\n').map(l => '    ' + l).join('\n')}`));
          }
          if (fix.file) {
            console.log(chalk.gray(`    File: ${fix.file}${fix.line ? `:${fix.line}` : ''}`));
          }
        }
      }
    }
    
    // Code examples if available
    if (explanation.codeExamples && explanation.codeExamples.length > 0) {
      console.log();
      console.log(chalk.bold('Code Examples:'));
      for (const example of explanation.codeExamples) {
        if (example.before && example.after) {
          console.log(chalk.gray('  Before:'));
          console.log(chalk.red(`  ${example.before.split('\n').map(l => '  ' + l).join('\n')}`));
          console.log(chalk.gray('  After:'));
          console.log(chalk.green(`  ${example.after.split('\n').map(l => '  ' + l).join('\n')}`));
        }
      }
    }
    
    // Prevention tips if available
    if (explanation.preventionTips && explanation.preventionTips.length > 0) {
      console.log();
      console.log(chalk.bold('Prevention Tips:'));
      for (const tip of explanation.preventionTips) {
        console.log(chalk.blue(`  • ${tip}`));
      }
    }
    
    // Confidence score if available
    if (explanation.confidence !== undefined && outputFormat === 'text') {
      const confidenceBar = '█'.repeat(Math.floor(explanation.confidence * 10));
      const confidenceColor = explanation.confidence > 0.8 ? chalk.green : explanation.confidence > 0.6 ? chalk.yellow : chalk.red;
      console.log();
      console.log(chalk.gray(`Confidence: ${confidenceColor(confidenceBar)} ${(explanation.confidence * 100).toFixed(0)}%`));
    }
  }
  
  console.log();
  process.exit(exitCode || 1);
}

main().catch((error) => {
  console.error(chalk.red('❌ Unexpected error:'), error);
  process.exit(1);
});
