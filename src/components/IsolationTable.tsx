import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Check, Copy } from 'lucide-react';
import { ISOLATION_LEVELS } from '../data/examplesData';
import { copyTextSafe } from '../utils/sqlHighlighter';

export const IsolationTable: React.FC<{ projectorXL?: boolean }> = ({
  projectorXL = false,
}) => {
  const [mode, setMode] = useState<'pg' | 'sqlStandard'>('pg');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const snippet = 'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;';

  const handleCopySnippet = async () => {
    const ok = await copyTextSafe(snippet);
    if (ok) {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 1600);
    }
  };

  const renderBadge = (prevented: boolean) => {
    if (prevented) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs sm:text-sm font-semibold">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          PREVENTED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-mono text-xs sm:text-sm font-semibold">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        POSSIBLE
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Mode Switcher + 1-line snippet */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setMode('pg')}
            className={`px-4 py-1.5 rounded-lg font-mono text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              mode === 'pg'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 border border-transparent'
            }`}
          >
            PostgreSQL Engine
          </button>
          <button
            type="button"
            onClick={() => setMode('sqlStandard')}
            className={`px-4 py-1.5 rounded-lg font-mono text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              mode === 'sqlStandard'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 border border-transparent'
            }`}
          >
            SQL-92 Standard
          </button>
        </div>

        <button
          type="button"
          onClick={handleCopySnippet}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-300 shadow-xs font-mono text-xs sm:text-sm text-slate-800 transition-colors cursor-pointer"
        >
          <span>
            <span className="text-purple-700 font-semibold">SET TRANSACTION</span>{' '}
            <span className="text-slate-700">ISOLATION LEVEL</span>{' '}
            <span className="text-blue-700 font-semibold">REPEATABLE READ;</span>
          </span>
          {copiedSnippet ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <Copy className="w-4 h-4 text-slate-400 shrink-0" />
          )}
        </button>
      </div>

      {/* Cheat Sheet Matrix */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="py-3.5 px-5 font-mono text-xs sm:text-sm uppercase tracking-wider text-slate-600">
                  Isolation Level
                </th>
                <th className="py-3.5 px-5 font-mono text-xs sm:text-sm uppercase tracking-wider text-slate-600">
                  Dirty Read
                </th>
                <th className="py-3.5 px-5 font-mono text-xs sm:text-sm uppercase tracking-wider text-slate-600">
                  Phantom Read
                </th>
                <th className="py-3.5 px-5 font-mono text-xs sm:text-sm uppercase tracking-wider text-slate-600">
                  Lost Update
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ISOLATION_LEVELS.map((row) => {
                const status = mode === 'pg' ? row.pg : row.sqlStandard;
                return (
                  <tr
                    key={row.level}
                    className={
                      row.isDefault
                        ? 'bg-blue-50/40'
                        : 'hover:bg-slate-50/70'
                    }
                  >
                    <td className="py-4 px-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-mono font-bold text-slate-900 ${
                            projectorXL ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'
                          }`}
                        >
                          {row.level}
                        </span>
                        {row.isDefault && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      {mode === 'pg' && (
                        <div className="text-xs font-mono text-slate-500 mt-0.5">
                          {row.pgNote}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-5">{renderBadge(status.dirtyRead)}</td>
                    <td className="py-4 px-5">{renderBadge(status.phantomRead)}</td>
                    <td className="py-4 px-5">{renderBadge(status.lostUpdate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tiny useful PDF tip */}
      <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 font-mono text-xs sm:text-sm text-slate-700">
        <span className="text-sky-800 font-bold mr-2">PG NOTE:</span>
        PostgreSQL never permits dirty reads (even at READ UNCOMMITTED). Under REPEATABLE READ, phantom reads are also prevented.
      </div>
    </div>
  );
};
