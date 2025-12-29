import { spawn } from 'child_process';

export async function runCommand(args: string[]): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number | null;
}> {
  const [command, ...commandArgs] = args;
  
  return new Promise((resolve) => {
    const child = spawn(command, commandArgs, {
      shell: true
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({
        stdout,
        stderr,
        exitCode: code
      });
    });

    child.on('error', () => {
      resolve({
        stdout,
        stderr,
        exitCode: null
      });
    });
  });
}

