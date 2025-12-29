export interface ParsedPostgresError {
  stack: "postgres";
  errorType?: string;
  message?: string;
  file?: string;
  line?: number;
  context?: string;
}

export function parsePostgresError(stderr: string): ParsedPostgresError {
  const result: ParsedPostgresError = {
    stack: "postgres"
  };

  // Relation does not exist error
  const relationNotFoundMatch = stderr.match(/relation\s+["']?([^"']+)["']?\s+does\s+not\s+exist/i);
  if (relationNotFoundMatch) {
    result.errorType = "RelationNotFound";
    result.message = `Relation "${relationNotFoundMatch[1]}" does not exist`;
    
    // Extract schema if available
    const schemaMatch = stderr.match(/schema\s+["']?([^"']+)["']?/i);
    if (schemaMatch) {
      result.message += ` (schema: ${schemaMatch[1]})`;
    }
    
    // Extract file and line if available
    const relationFileMatch = stderr.match(/(?:at|in)\s+([^\s]+)\s*\(([^:]+):(\d+):(\d+)\)/);
    if (relationFileMatch) {
      result.file = relationFileMatch[2];
      result.line = parseInt(relationFileMatch[3], 10);
    }
    
    // Extract SQL statement context if available
    const sqlContextMatch = stderr.match(/(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER).+?(?:\n|$)/i);
    if (sqlContextMatch) {
      result.context = sqlContextMatch[0].trim();
    }
  }

  // Authentication failed error
  const authFailedMatch = stderr.match(/authentication\s+failed|password\s+authentication\s+failed|FATAL.*password/i);
  if (authFailedMatch) {
    result.errorType = "AuthenticationFailed";
    
    // Extract auth error message
    const authMessageMatch = stderr.match(/(?:authentication\s+failed|password\s+authentication\s+failed|FATAL.*password)[:\s]+(.+?)(?:\n|$)/i);
    if (authMessageMatch) {
      result.message = authMessageMatch[1].trim();
    }
    
    // Extract user if available
    const userMatch = stderr.match(/user[:\s]+["']?([^"']+)["']?/i);
    if (userMatch) {
      result.message = (result.message || "") + ` (user: ${userMatch[1]})`;
    }
    
    // Extract database if available
    const databaseMatch = stderr.match(/database[:\s]+["']?([^"']+)["']?/i);
    if (databaseMatch) {
      result.message = (result.message || "") + ` (database: ${databaseMatch[1]})`;
    }
    
    // Extract host if available
    const hostMatch = stderr.match(/host[:\s]+["']?([^"']+)["']?/i);
    if (hostMatch) {
      result.message = (result.message || "") + ` (host: ${hostMatch[1]})`;
    }
    
    // Extract file and line
    const authFileMatch = stderr.match(/(?:at|in)\s+([^\s]+)\s*\(([^:]+):(\d+):(\d+)\)/);
    if (authFileMatch) {
      result.file = authFileMatch[2];
      result.line = parseInt(authFileMatch[3], 10);
    }
  }

  // Syntax error
  const syntaxErrorMatch = stderr.match(/syntax\s+error|parse\s+error/i);
  if (syntaxErrorMatch) {
    result.errorType = "SyntaxError";
    
    // Extract syntax error message
    const syntaxMessageMatch = stderr.match(/(?:syntax\s+error|parse\s+error)[:\s]+(.+?)(?:\n|$)/i);
    if (syntaxMessageMatch) {
      result.message = syntaxMessageMatch[1].trim();
    }
    
    // Extract position if available (LINE X: Y)
    const positionMatch = stderr.match(/LINE\s+(\d+)[:\s]+(\d+)/i);
    if (positionMatch) {
      result.line = parseInt(positionMatch[1], 10);
      result.message = (result.message || "") + ` (LINE ${positionMatch[1]}: ${positionMatch[2]})`;
    }
    
    // Extract SQL statement context
    const sqlSyntaxMatch = stderr.match(/(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER).+?(?:\n|$)/i);
    if (sqlSyntaxMatch) {
      result.context = sqlSyntaxMatch[0].trim();
    }
    
    // Extract file and line
    const syntaxFileMatch = stderr.match(/(?:at|in)\s+([^\s]+)\s*\(([^:]+):(\d+):(\d+)\)/);
    if (syntaxFileMatch) {
      result.file = syntaxFileMatch[2];
      if (!result.line) {
        result.line = parseInt(syntaxFileMatch[3], 10);
      }
    }
  }

  // Extract context lines if available
  const contextMatch = stderr.match(/(\d+\s+\|.*(?:\n\d+\s+\|.*)*)/);
  if (contextMatch) {
    result.context = contextMatch[1].trim();
  }

  // If no specific error type found, try generic PostgreSQL error patterns
  if (!result.errorType) {
    const postgresErrorMatch = stderr.match(/(ERROR|FATAL)[:\s]+(.+?)(?:\n|$)/i);
    if (postgresErrorMatch) {
      result.errorType = postgresErrorMatch[1];
      result.message = postgresErrorMatch[2].trim();
    }
    
    // Extract file and line from generic patterns
    if (!result.file) {
      const genericFileMatch = stderr.match(/(?:at|in)\s+([^\s]+)\s*\(([^:]+):(\d+):(\d+)\)/);
      if (genericFileMatch) {
        result.file = genericFileMatch[2];
        result.line = parseInt(genericFileMatch[3], 10);
      }
    }
  }

  return result;
}

