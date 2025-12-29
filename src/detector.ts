export function detectStack(stderr: string): "javascript" | "nextjs" | "mongo" | "postgres" | "unknown" {
  const lowerStderr = stderr.toLowerCase();

  // Next.js detection (check first as it's a subset of JavaScript)
  if (
    lowerStderr.includes('next') ||
    lowerStderr.includes('pages/') ||
    lowerStderr.includes('app/') ||
    lowerStderr.includes('next.config') ||
    lowerStderr.includes('nextjs')
  ) {
    return "nextjs";
  }

  // MongoDB detection
  if (
    lowerStderr.includes('mongoerror') ||
    lowerStderr.includes('mongodb') ||
    lowerStderr.includes('mongo') ||
    lowerStderr.includes('mongosh') ||
    lowerStderr.includes('connection to mongodb')
  ) {
    return "mongo";
  }

  // PostgreSQL detection
  if (
    lowerStderr.includes('postgresql') ||
    lowerStderr.includes('postgres') ||
    lowerStderr.includes('relation') && lowerStderr.includes('does not exist') ||
    lowerStderr.includes('pg_') ||
    lowerStderr.includes('psql:')
  ) {
    return "postgres";
  }

  // JavaScript detection (common error types)
  if (
    lowerStderr.includes('referenceerror') ||
    lowerStderr.includes('typeerror') ||
    lowerStderr.includes('syntaxerror') ||
    lowerStderr.includes('rangeerror') ||
    lowerStderr.includes('urlerror') ||
    lowerStderr.includes('evalerror') ||
    lowerStderr.includes('cannot read property') ||
    lowerStderr.includes('is not defined') ||
    lowerStderr.includes('unexpected token') ||
    lowerStderr.includes('node:') ||
    lowerStderr.includes('npm err') ||
    lowerStderr.includes('yarn error')
  ) {
    return "javascript";
  }

  return "unknown";
}

