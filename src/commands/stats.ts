import chalk from 'chalk';
import { errorHistory } from '../features/history.js';

export function showStats(): void {
  const mostCommon = errorHistory.getMostCommon(50);
  
  if (mostCommon.length === 0) {
    console.log(chalk.gray('No error statistics available.'));
    return;
  }

  // Group by error type
  const byType: Record<string, number> = {};
  const byStack: Record<string, number> = {};
  let totalCount = 0;

  for (const entry of mostCommon) {
    const type = entry.error.errorType || 'Unknown';
    const stack = entry.error.stack || 'unknown';
    
    byType[type] = (byType[type] || 0) + entry.count;
    byStack[stack] = (byStack[stack] || 0) + entry.count;
    totalCount += entry.count;
  }

  console.log(chalk.bold('\nError Statistics:\n'));
  console.log(chalk.cyan(`Total Errors: ${totalCount}`));
  console.log(chalk.cyan(`Unique Error Types: ${Object.keys(byType).length}`));
  console.log();

  console.log(chalk.bold('By Error Type:'));
  const sortedTypes = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  for (const [type, count] of sortedTypes) {
    const percentage = ((count / totalCount) * 100).toFixed(1);
    const bar = '█'.repeat(Math.floor((count / totalCount) * 50));
    console.log(chalk.gray(`  ${type.padEnd(30)} ${chalk.yellow(bar)} ${count} (${percentage}%)`));
  }

  console.log();
  console.log(chalk.bold('By Stack:'));
  const sortedStacks = Object.entries(byStack)
    .sort((a, b) => b[1] - a[1]);
  
  for (const [stack, count] of sortedStacks) {
    const percentage = ((count / totalCount) * 100).toFixed(1);
    const bar = '█'.repeat(Math.floor((count / totalCount) * 50));
    console.log(chalk.gray(`  ${stack.padEnd(30)} ${chalk.blue(bar)} ${count} (${percentage}%)`));
  }

  console.log();
}

