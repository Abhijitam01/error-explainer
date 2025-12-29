import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import type { ParsedError, Explanation } from '../core/types.js';

interface HistoryEntry {
  id: string;
  timestamp: number;
  error: ParsedError;
  explanation: Explanation | null;
  command: string;
  count: number;
}

export class ErrorHistory {
  private historyFile: string;
  private history: HistoryEntry[] = [];

  constructor() {
    const historyDir = join(process.cwd(), '.error-explain');
    this.historyFile = join(historyDir, 'history.json');
    
    try {
      mkdirSync(historyDir, { recursive: true });
      if (existsSync(this.historyFile)) {
        const content = readFileSync(this.historyFile, 'utf-8');
        this.history = JSON.parse(content);
      }
    } catch {
      this.history = [];
    }
  }

  private getErrorId(error: ParsedError): string {
    const content = `${error.stack}:${error.errorType || ''}:${error.message || ''}`;
    return createHash('md5').update(content).digest('hex').substring(0, 8);
  }

  add(error: ParsedError, explanation: Explanation | null, command: string): void {
    const id = this.getErrorId(error);
    const existing = this.history.find(e => e.id === id);
    
    if (existing) {
      existing.count++;
      existing.timestamp = Date.now();
      existing.command = command;
      existing.explanation = explanation;
    } else {
      this.history.push({
        id,
        timestamp: Date.now(),
        error,
        explanation,
        command,
        count: 1
      });
    }

    // Keep only last 1000 entries
    if (this.history.length > 1000) {
      this.history = this.history.slice(-1000);
    }

    this.save();
  }

  findSimilar(error: ParsedError): HistoryEntry[] {
    const id = this.getErrorId(error);
    return this.history
      .filter(e => e.id === id)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }

  getMostCommon(limit = 10): HistoryEntry[] {
    return [...this.history]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  private save(): void {
    try {
      writeFileSync(this.historyFile, JSON.stringify(this.history, null, 2));
    } catch {
      // Ignore save errors
    }
  }
}

export const errorHistory = new ErrorHistory();

