import chalk from 'chalk';
import { errorHistory } from '../features/history.js';

export function showHistory(limit = 10): void {
  const mostCommon = errorHistory.getMostCommon(limit);
  
  if (mostCommon.length === 0) {
    console.log(chalk.gray('No error history found.'));
    return;
  }

  console.log(chalk.bold(`\nError History (Top ${limit}):\n`));
  
  for (const entry of mostCommon) {
    console.log(chalk.red.bold(`${entry.count}x ${entry.error.errorType || 'Error'}`));
    if (entry.error.message) {
      console.log(chalk.gray(`  ${entry.error.message.substring(0, 100)}`));
    }
    if (entry.error.file) {
      console.log(chalk.gray(`  at ${entry.error.file}${entry.error.line ? `:${entry.error.line}` : ''}`));
    }
    console.log();
  }
}

