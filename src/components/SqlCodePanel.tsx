import React, { useState } from 'react';
import { Check, Copy, Database, Play, RotateCcw, Columns2 } from 'lucide-react';
import { LessonExample } from '../data/examplesData';
import { copyTextSafe, renderHighlightedSqlLine } from '../utils/sqlHighlighter';

interface SqlCodePanelProps {
  example: LessonExample;
  activeStep: number;
  onStepChange: (stepIndex: number) => void;
  projectorXL: boolean;
}

export const SqlCodePanel: React.FC<SqlCodePanelProps> = ({
  example,
  activeStep,
  onStepChange,
  projectorXL,
}) => {
  const [copied, setCopied] = useState(false);

  const steps = example.steps;
  const currentStep =
    activeStep >= 0 && activeStep < steps.length ? steps[activeStep] : null;

  const fullCopyText =
    example.mode === 'single'
      ? example.sql ?? ''
      : [
          example.resetSql ? `-- Reset:\n${example.resetSql}\n` : '',
          ...(example.dualRows ?? []).map(
            (r) =>
              `-- STEP ${r.step}\n-- [Window A]\n${r.windowA}\n-- [Window B]\n${r.windowB}\n`
          ),
        ]
          .filter(Boolean)
          .join('\n');

  const handleCopy = async () => {
    const ok = await copyTextSafe(fullCopyText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  const handleNextStep = () => {
    if (activeStep === -1) {
      onStepChange(0);
    } else if (activeStep < steps.length - 1) {
      onStepChange(activeStep + 1);
    } else {
      onStepChange(-1);
    }
  };

  const codeSize = projectorXL
    ? 'text-[16px] sm:text-[18px] lg:text-[19px]'
    : 'text-[14px] sm:text-[15px] lg:text-[16px]';

  const dualCodeSize = projectorXL
    ? 'text-[14px] sm:text-[15px] lg:text-[16px]'
    : 'text-[13px] sm:text-[14px]';

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col">
      {/* Editor Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-mono text-slate-700 truncate">
            {example.mode === 'dual' ? (
              <Columns2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            ) : (
              <Database className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            )}
            <span className="truncate font-medium">{example.filename}</span>
          </div>

          {example.mode === 'dual' && (
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-mono text-[11px] font-medium">
              2 Windows (A &amp; B)
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNextStep}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            {activeStep === -1
              ? 'Step Run'
              : activeStep < steps.length - 1
                ? `Next (${activeStep + 1}/${steps.length})`
                : 'Show All'}
          </button>

          {activeStep !== -1 && (
            <button
              type="button"
              onClick={() => onStepChange(-1)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200 bg-white transition-colors cursor-pointer"
              title="Reset to full view"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Step Selector Bar */}
      <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 bg-slate-50/60 border-b border-slate-200">
        <button
          type="button"
          onClick={() => onStepChange(-1)}
          className={`px-2.5 py-0.5 rounded text-xs font-mono border cursor-pointer transition-colors ${
            activeStep === -1
              ? 'bg-slate-900 text-white border-slate-900 font-semibold'
              : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
          }`}
        >
          Final Result
        </button>
        {steps.map((step, idx) => {
          const isActive = activeStep === idx;
          return (
            <button
              key={step.label + idx}
              type="button"
              onClick={() => onStepChange(isActive ? -1 : idx)}
              className={`px-2.5 py-0.5 rounded text-xs font-mono border cursor-pointer transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
                  : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
              }`}
            >
              {idx + 1}. {step.label}
            </button>
          );
        })}
      </div>

      {/* Optional Reset Query Banner for 2-window labs */}
      {example.resetSql && (
        <div className="px-4 py-2 bg-amber-50/60 border-b border-slate-200 font-mono text-xs text-slate-700 flex flex-wrap items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase">
            Reset
          </span>
          <span>{renderHighlightedSqlLine(example.resetSql)}</span>
        </div>
      )}

      {/* Code Body */}
      {example.mode === 'single' ? (
        <div className="py-4 overflow-x-auto flex-1 bg-white">
          <div className={`font-mono leading-[1.68] min-w-fit ${codeSize}`}>
            {(example.sql ?? '').split('\n').map((line, idx) => {
              const lineNum = idx + 1;
              const isHighlighted =
                currentStep?.highlightLines?.includes(lineNum) ?? false;
              const isDimmed =
                activeStep !== -1 && !isHighlighted && line.trim() !== '';

              return (
                <div
                  key={lineNum}
                  className={`flex items-start px-4 transition-opacity duration-150 ${
                    isHighlighted
                      ? 'bg-blue-50/90 border-l-[3px] border-blue-600'
                      : 'border-l-[3px] border-transparent'
                  } ${isDimmed ? 'opacity-40' : 'opacity-100'}`}
                >
                  <span className="select-none w-7 shrink-0 text-right pr-4 text-slate-400 text-[0.82em] pt-[2px]">
                    {lineNum}
                  </span>
                  <pre className="whitespace-pre font-mono flex-1">
                    {renderHighlightedSqlLine(line)}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Dual-Window Step Table */
        <div className="overflow-x-auto flex-1 bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-mono text-xs uppercase tracking-wider text-slate-600">
                <th className="py-2.5 px-3 w-14 text-center border-r border-slate-200">
                  Step
                </th>
                <th className="py-2.5 px-4 w-1/2 border-r border-slate-200 text-blue-700">
                  Window A
                </th>
                <th className="py-2.5 px-4 w-1/2 text-purple-700">
                  Window B
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(example.dualRows ?? []).map((row) => {
                const isActiveRow = currentStep?.activeDualStep === row.step;
                const isDimmed = activeStep !== -1 && !isActiveRow;

                return (
                  <tr
                    key={row.step}
                    onClick={() => {
                      const matchIdx = steps.findIndex(
                        (s) => s.activeDualStep === row.step
                      );
                      if (matchIdx !== -1) onStepChange(matchIdx);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isActiveRow
                        ? 'bg-blue-50/80'
                        : 'hover:bg-slate-50/80'
                    } ${isDimmed ? 'opacity-45' : 'opacity-100'}`}
                  >
                    <td
                      className={`py-3.5 px-3 text-center font-mono text-xs font-bold border-r border-slate-200 align-top ${
                        isActiveRow
                          ? 'text-blue-700 border-l-[3px] border-l-blue-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {row.step}
                    </td>
                    <td className="py-3.5 px-4 border-r border-slate-200 align-top">
                      <div className={`font-mono leading-relaxed space-y-0.5 ${dualCodeSize}`}>
                        {row.windowA.split('\n').map((line, i) => (
                          <pre key={i} className="whitespace-pre-wrap break-words font-mono">
                            {renderHighlightedSqlLine(line)}
                          </pre>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <div className={`font-mono leading-relaxed space-y-0.5 ${dualCodeSize}`}>
                        {row.windowB.split('\n').map((line, i) => (
                          <pre key={i} className="whitespace-pre-wrap break-words font-mono">
                            {renderHighlightedSqlLine(line)}
                          </pre>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
