import React from 'react';

const TX_KEYWORDS = new Set([
  'BEGIN',
  'COMMIT',
  'ROLLBACK',
  'SAVEPOINT',
  'RELEASE',
]);

const SQL_KEYWORDS = new Set([
  'TO',
  'SELECT',
  'FROM',
  'WHERE',
  'UPDATE',
  'SET',
  'INSERT',
  'INTO',
  'VALUES',
  'FOR',
  'CHECK',
  'TRANSACTION',
  'ISOLATION',
  'LEVEL',
  'READ',
  'UNCOMMITTED',
  'COMMITTED',
  'REPEATABLE',
  'SERIALIZABLE',
  'AND',
  'OR',
  'NOT',
  'NULL',
  'INT',
  'TEXT',
  'BOOLEAN',
  'TRUE',
  'FALSE',
  'DELETE',
  'CREATE',
  'DROP',
  'SCHEMA',
  'IF',
  'EXISTS',
  'CASCADE',
  'TABLE',
  'PRIMARY',
  'KEY',
  'REFERENCES',
  'GENERATED',
  'ALWAYS',
  'AS',
  'IDENTITY',
  'SHOW',
  'WITH',
  'RETURNING',
  'ORDER',
  'BY',
  'COUNT',
]);

interface Token {
  type:
    | 'comment'
    | 'error-comment'
    | 'string'
    | 'number'
    | 'tx-keyword'
    | 'keyword'
    | 'operator'
    | 'plain';
  value: string;
}

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    if (line[i] === '-' && line[i + 1] === '-') {
      const rest = line.slice(i);
      const isErrorComment =
        rest.includes('ERROR') ||
        rest.includes('DEADLOCK') ||
        rest.includes('40001') ||
        rest.includes('40P01') ||
        rest.includes('UPDATE 0');
      tokens.push({
        type: isErrorComment ? 'error-comment' : 'comment',
        value: rest,
      });
      break;
    }

    if (line[i] === "'") {
      let j = i + 1;
      while (j < line.length && line[j] !== "'") {
        j++;
      }
      if (j < line.length) j++;
      tokens.push({ type: 'string', value: line.slice(i, j) });
      i = j;
      continue;
    }

    if (/[0-9]/.test(line[i]) && (i === 0 || !/[a-zA-Z_]/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && /[0-9.]/.test(line[j])) {
        j++;
      }
      tokens.push({ type: 'number', value: line.slice(i, j) });
      i = j;
      continue;
    }

    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) {
        j++;
      }
      const word = line.slice(i, j);
      const upper = word.toUpperCase();
      if (TX_KEYWORDS.has(upper)) {
        tokens.push({ type: 'tx-keyword', value: word });
      } else if (SQL_KEYWORDS.has(upper)) {
        tokens.push({ type: 'keyword', value: word });
      } else {
        tokens.push({ type: 'plain', value: word });
      }
      i = j;
      continue;
    }

    if (/[;=(),+\-*<>!]/.test(line[i])) {
      let j = i + 1;
      while (j < line.length && /[;=(),+\-*<>!]/.test(line[j])) {
        if (line[j] === '-' && line[j + 1] === '-') break;
        j++;
      }
      tokens.push({ type: 'operator', value: line.slice(i, j) });
      i = j;
      continue;
    }

    let j = i + 1;
    while (j < line.length && !/['0-9a-zA-Z_;=(),+\-*<>!-]/.test(line[j])) {
      j++;
    }
    tokens.push({ type: 'plain', value: line.slice(i, j) });
    i = j;
  }

  return tokens;
}

const TOKEN_CLASSES: Record<Token['type'], string> = {
  'tx-keyword': 'text-blue-700 font-bold',
  keyword: 'text-purple-700 font-semibold',
  string: 'text-amber-700',
  number: 'text-teal-700 font-medium',
  operator: 'text-slate-600',
  comment: 'text-slate-500 italic',
  'error-comment': 'text-rose-600 font-semibold not-italic',
  plain: 'text-slate-900',
};

export function renderHighlightedSqlLine(line: string): React.ReactNode {
  if (!line) return '\u00A0';
  const tokens = tokenizeLine(line);
  return tokens.map((token, idx) => (
    <span key={idx} className={TOKEN_CLASSES[token.type]}>
      {token.value}
    </span>
  ));
}

export async function copyTextSafe(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
