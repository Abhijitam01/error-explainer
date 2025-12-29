import { describe, it, expect } from 'vitest';
import { explainError } from '../../src/explainer.js';
import type { ParsedError } from '../../src/core/types.js';

describe('explainError', () => {
  it('should return explanation for known error type', async () => {
    const error: ParsedError = {
      stack: 'javascript',
      errorType: 'ReferenceError',
      message: 'x is not defined'
    };

    const explanation = await explainError(error);
    expect(explanation).toBeDefined();
    expect(explanation?.what).toBeDefined();
    expect(explanation?.why).toBeDefined();
    expect(explanation?.fix).toBeDefined();
  });

  it('should handle unknown errors', async () => {
    const error: ParsedError = {
      stack: 'unknown',
      message: 'Some unknown error'
    };

    const explanation = await explainError(error);
    expect(explanation).toBeDefined();
  });
});

