export interface ParsedMongoError {
  stack: "mongo";
  errorType?: string;
  message?: string;
  file?: string;
  line?: number;
  context?: string;
}

export function parseMongoError(stderr: string): ParsedMongoError {
  const result: ParsedMongoError = {
    stack: "mongo"
  };

  if (!stderr || typeof stderr !== 'string') {
    return result;
  }

  // Connection refused error
  const connectionRefusedMatch = stderr.match(/connection\s+refused/i);
  if (connectionRefusedMatch) {
    result.errorType = "ConnectionRefused";
    
    // Extract connection details
    const connectionMessageMatch = stderr.match(/(?:connection\s+refused|ECONNREFUSED)[:\s]+(.+?)(?:\n|$)/i);
    if (connectionMessageMatch) {
      result.message = connectionMessageMatch[1].trim();
    }
    
    // Extract connection string or host
    const hostMatch = stderr.match(/mongodb:\/\/(?:[^@]+@)?([^\/\s]+)/);
    if (hostMatch) {
      result.message = (result.message || "") + ` (${hostMatch[1]})`;
    }
    
    // Extract file and line if available
    const connectionFileMatch = stderr.match(/(?:at|in)\s+([^\s]+)\s*\(([^:]+):(\d+):(\d+)\)/);
    if (connectionFileMatch) {
      result.file = connectionFileMatch[2];
      result.line = parseInt(connectionFileMatch[3], 10);
    }
  }

  // Authentication failed error
  const authFailedMatch = stderr.match(/authentication\s+failed|auth\s+failed|unauthorized/i);
  if (authFailedMatch) {
    result.errorType = "AuthenticationFailed";
    
    // Extract auth error message
    const authMessageMatch = stderr.match(/(?:authentication\s+failed|auth\s+failed|unauthorized)[:\s]+(.+?)(?:\n|$)/i);
    if (authMessageMatch) {
      result.message = authMessageMatch[1].trim();
    }
    
    // Extract username if available
    const usernameMatch = stderr.match(/user[:\s]+['"]?([^'"]+)['"]?/i);
    if (usernameMatch) {
      result.message = (result.message || "") + ` (user: ${usernameMatch[1]})`;
    }
    
    // Extract file and line
    const authFileMatch = stderr.match(/(?:at|in)\s+([^\s]+)\s*\(([^:]+):(\d+):(\d+)\)/);
    if (authFileMatch) {
      result.file = authFileMatch[2];
      result.line = parseInt(authFileMatch[3], 10);
    }
  }

  // Schema validation error
  const schemaValidationMatch = stderr.match(/schema\s+validation\s+failed|validation\s+error/i);
  if (schemaValidationMatch) {
    result.errorType = "SchemaValidationError";
    
    // Extract validation message
    const validationMessageMatch = stderr.match(/(?:schema\s+validation\s+failed|validation\s+error)[:\s]+(.+?)(?:\n|$)/i);
    if (validationMessageMatch) {
      result.message = validationMessageMatch[1].trim();
    }
    
    // Extract field name from validation errors
    const fieldMatch = stderr.match(/field[:\s]+['"]?([^'"]+)['"]?/i);
    if (fieldMatch) {
      result.message = (result.message || "") + ` (field: ${fieldMatch[1]})`;
    }
    
    // Extract collection name
    const collectionMatch = stderr.match(/collection[:\s]+['"]?([^'"]+)['"]?/i);
    if (collectionMatch) {
      result.message = (result.message || "") + ` (collection: ${collectionMatch[1]})`;
    }
    
    // Extract file and line
    const validationFileMatch = stderr.match(/(?:at|in)\s+([^\s]+)\s*\(([^:]+):(\d+):(\d+)\)/);
    if (validationFileMatch) {
      result.file = validationFileMatch[2];
      result.line = parseInt(validationFileMatch[3], 10);
    }
  }

  // Extract context lines if available
  const contextMatch = stderr.match(/(\d+\s+\|.*(?:\n\d+\s+\|.*)*)/);
  if (contextMatch) {
    result.context = contextMatch[1].trim();
  }

  // If no specific error type found, try generic MongoDB error patterns
  if (!result.errorType) {
    const mongoErrorMatch = stderr.match(/Mongo(?:Error|ServerError|NetworkError)[:\s]+(.+?)(?:\n|$)/i);
    if (mongoErrorMatch) {
      result.errorType = "MongoError";
      result.message = mongoErrorMatch[1].trim();
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

