import { spawn, ChildProcess } from 'child_process';
import { getConfig } from './core/config.js';

export async function runCommand(args: string[], retries = 0): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number | null;
}> {
  const config = getConfig();
  const timeout = config.timeout || 30000;
  const maxRetries = config.retries || 0;
  
  const [command, ...commandArgs] = args;
  
  return new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout | null = null;
    let child: ChildProcess | null = null;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (child) {
        child.kill('SIGTERM');
        child = null;
      }
    };

    const run = (attempt: number): void => {
      child = spawn(command, commandArgs, {
        shell: true
      });

      let stdout = '';
      let stderr = '';

      // Set timeout
      timeoutId = setTimeout(() => {
        cleanup();
        if (attempt < maxRetries) {
          // Retry on timeout
          run(attempt + 1);
        } else {
          resolve({
            stdout,
            stderr: stderr || 'Command timed out',
            exitCode: null
          });
        }
      }, timeout);

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        cleanup();
        // Retry on non-zero exit code if retries configured
        if (code !== 0 && attempt < maxRetries && maxRetries > 0) {
          run(attempt + 1);
        } else {
          resolve({
            stdout,
            stderr,
            exitCode: code
          });
        }
      });

      child.on('error', (error) => {
        cleanup();
        if (attempt < maxRetries) {
          run(attempt + 1);
        } else {
          resolve({
            stdout,
            stderr: stderr || error.message,
            exitCode: null
          });
        }
      });
    };

    run(retries);
  });
}

