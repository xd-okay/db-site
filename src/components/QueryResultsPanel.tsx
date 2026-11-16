import React from 'react';
import { CheckCircle2, Table2, Terminal } from 'lucide-react';
import { CellTone, LessonExample, TxBadge } from '../data/examplesData';

interface QueryResultsPanelProps {
  example: LessonExample;
  activeStep: number;
  projectorXL: boolean;
}

const TX_BADGE_STYLES: Record<TxBadge, string> = {
  COMMITTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'IN TX': 'bg-amber-50 text-amber-800 border-amber-200',
  'ROLLED BACK': 'bg-rose-50 text-rose-700 border-rose-200',
  ABORTED: 'bg-rose-100 text-rose-800 border-rose-300',
  SAVEPOINT: 'bg-blue-50 text-blue-700 border-blue-200',
  LOCKED: 'bg-purple-50 text-purple-700 border-purple-200',
  DEADLOCK: 'bg-rose-100 text-rose-800 border-rose-300',
  'SERIALIZATION ERR': 'bg-rose-100 text-rose-800 border-rose-300',
};

const CELL_TONE_STYLES: Record<CellTone, string> = {
  normal: 'text-slate-800',
  changed: 'text-amber-700 font-semibold bg-amber-50/70',
  added: 'text-emerald-700 font-semibold bg-emerald-50/70',
  error: 'text-rose-700 font-semibold bg-rose-50/70',
  locked: 'text-purple-700 font-semibold bg-purple-50/70',
  muted: 'text-slate-400 italic',
};

export const QueryResultsPanel: React.FC<QueryResultsPanelProps> = ({
  example,
  activeStep,
  projectorXL,
}) => {
  const resolvedIndex =
    activeStep >= 0 && activeStep < example.steps.length
      ? activeStep
      : example.steps.length - 1;
  const stepData = example.steps[resolvedIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* Query Output Tables */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-slate-600 font-semibold">
            <Table2 className="w-4 h-4 text-emerald-600" />
            <span>
              {activeStep === -1
                ? 'Query Result'
                : `Step ${activeStep + 1}: ${stepData.label}`}
            </span>
          </div>

          <span
            className={`px-2 py-0.5 rounded border font-mono text-[11px] font-semibold ${TX_BADGE_STYLES[stepData.txBadge]}`}
          >
            {stepData.txBadge}
          </span>
        </div>

        <div className="p-4 space-y-4">
          {stepData.tables.map((table) => (
            <div
              key={table.title}
              className="rounded-lg border border-slate-200 bg-white overflow-hidden"
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-200">
                <span className="font-mono text-xs font-semibold text-slate-700">
                  {table.title}
                </span>
                {table.badge && (
                  <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[10px] font-mono font-bold text-blue-700 uppercase">
                    {table.badge}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] uppercase text-slate-500">
                      {table.columns.map((col) => (
                        <th key={col} className="py-2 px-3 font-semibold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {table.rows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`py-2.5 px-3 ${
                              projectorXL ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
                            } ${CELL_TONE_STYLES[cell.tone ?? 'normal']}`}
                          >
                            {cell.value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* psql Console Output */}
          {stepData.console.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs sm:text-[13px] space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
                <Terminal className="w-3 h-3 text-blue-600" />
                <span>psql output</span>
              </div>
              {stepData.console.map((line, i) => {
                const cls =
                  line.tone === 'success'
                    ? 'text-emerald-700 font-medium'
                    : line.tone === 'error'
                      ? 'text-rose-700 font-semibold'
                      : line.tone === 'warn'
                        ? 'text-amber-700 font-medium'
                        : 'text-blue-700';
                return (
                  <div key={i} className={`${cls} flex items-start gap-2`}>
                    <span className="text-slate-400 select-none">#</span>
                    <span className="break-words">{line.text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* EXPECT Callout */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3.5">
        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Expect</span>
        </div>
        <p
          className={`text-slate-800 leading-snug ${
            projectorXL ? 'text-base sm:text-lg' : 'text-sm sm:text-[15px]'
          }`}
        >
          {example.expect}
        </p>
      </div>
    </div>
  );
};
