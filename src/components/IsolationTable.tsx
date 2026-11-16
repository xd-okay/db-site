import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Check, Copy } from 'lucide-react';
import { ISOLATION_LEVELS } from '../data/lessonData';

export const IsolationTable: React.FC<{ projectorXL?: boolean }> = ({
  projectorXL = false,
}) => {
  const [mode, setMode] = useState<'pg' | 'sqlStandard'>('pg');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const snippet = 'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;';

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 1600);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = snippet;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 1600);
    }
  };

  const renderBadge = (prevented: boolean) => {
    if (prevented) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/12 border border-emerald-400/35 text-emerald-300 font-mono text-xs sm:text-sm font-semibold">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          PREVENTED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/12 border border-rose-400/35 text-rose-300 font-mono text-xs sm:text-sm font-semibold">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        POSSIBLE
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex p-1 rounded-xl bg-slate-900/90 border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('pg')}
            className={`px-4 py-1.5 rounded-lg font-mono text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              mode === 'pg'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-[0_0_16px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            PostgreSQL Engine
          </button>
          <button
            type="button"
            onClick={() => setMode('sqlStandard')}
            className={`px-4 py-1.5 rounded-lg font-mono text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              mode === 'sqlStandard'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-[0_0_16px_rgba(34,211,238,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            SQL-92 Standard
          </button>
        </div>

        {/* Copyable 1-line SQL syntax */}
        <button
          type="button"
          onClick={handleCopySnippet}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#0b0f17] border border-slate-800 hover:border-cyan-400/40 font-mono text-xs sm:text-sm text-slate-200 transition-all cursor-pointer"
        >
          <span>
            <span className="text-purple-400 font-semibold">SET TRANSACTION</span>{' '}
            <span className="text-slate-300">ISOLATION LEVEL</span>{' '}
            <span className="text-cyan-300 font-semibold">REPEATABLE READ;</span>
          </span>
          {copiedSnippet ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Copy className="w-4 h-4 text-slate-400 shrink-0" />
          )}
        </button>
      </div>

      {/* Cheat Sheet Matrix */}
      <div className="rounded-2xl border border-slate-800/90 bg-[#0b0f17]/95 backdrop-blur-md overflow-hidden shadow-[0_0_50px_-15px_rgba(16,185,129,0.2)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0f1522]">
                <th className="py-4 px-5 sm:px-6 font-mono text-xs sm:text-sm uppercase tracking-wider text-slate-400">
                  Isolation Level
                </th>
                <th className="py-4 px-5 font-mono text-xs sm:text-sm uppercase tracking-wider text-slate-400">
                  Dirty Read
                </th>
                <th className="py-4 px-5 font-mono text-xs sm:text-sm uppercase tracking-wider text-slate-400">
                  Phantom Read
                </th>
                <th className="py-4 px-5 font-mono text-xs sm:text-sm uppercase tracking-wider text-slate-400">
                  Lost Update
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {ISOLATION_LEVELS.map((row, idx) => {
                const status = mode === 'pg' ? row.pg : row.sqlStandard;
                return (
                  <motion.tr
                    key={row.level}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.06 }}
                    className={`transition-colors ${
                      row.isDefault
                        ? 'bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08]'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="py-5 px-5 sm:px-6">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span
                          className={`font-mono font-bold tracking-tight text-white ${
                            projectorXL ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
                          }`}
                        >
                          {row.level}
                        </span>
                        {row.isDefault && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      {mode === 'pg' && (
                        <div className="text-xs font-mono text-slate-500 mt-1">
                          {row.pgNote}
                        </div>
                      )}
                    </td>

                    <td className="py-5 px-5">{renderBadge(status.dirtyRead)}</td>
                    <td className="py-5 px-5">{renderBadge(status.phantomRead)}</td>
                    <td className="py-5 px-5">{renderBadge(status.lostUpdate)}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
