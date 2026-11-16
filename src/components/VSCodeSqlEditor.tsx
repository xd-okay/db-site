import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, Play, RotateCcw, Terminal, GitBranch, Database } from 'lucide-react';
import { SqlStep, TxBadgeState } from '../data/lessonData';
import { renderHighlightedSqlLine } from '../utils/sqlHighlighter';

interface VSCodeSqlEditorProps {
  filename: string;
  code: string;
  accentColor?: 'cyan' | 'rose' | 'amber' | 'violet' | 'emerald';
  steps?: SqlStep[];
  activeStep?: number; // -1 = idle (all code shown, no line lock)
  onStepChange?: (stepIndex: number) => void;
  projectorXL?: boolean;
  compact?: boolean;
  customBadge?: string;
}

const ACCENT_RING: Record<NonNullable<VSCodeSqlEditorProps['accentColor']>, string> = {
  cyan: 'border-cyan-500/30 shadow-[0_0_45px_-12px_rgba(34,211,238,0.28)]',
  rose: 'border-rose-500/35 shadow-[0_0_45px_-12px_rgba(244,63,94,0.28)]',
  amber: 'border-amber-500/30 shadow-[0_0_45px_-12px_rgba(245,158,11,0.26)]',
  violet: 'border-violet-500/35 shadow-[0_0_45px_-12px_rgba(168,85,247,0.3)]',
  emerald: 'border-emerald-500/30 shadow-[0_0_45px_-12px_rgba(16,185,129,0.26)]',
};

const LINE_HIGHLIGHT_STYLE: Record<NonNullable<VSCodeSqlEditorProps['accentColor']>, string> = {
  cyan: 'bg-cyan-400/12 border-l-[3px] border-cyan-400',
  rose: 'bg-rose-500/14 border-l-[3px] border-rose-400',
  amber: 'bg-amber-400/12 border-l-[3px] border-amber-400',
  violet: 'bg-violet-500/14 border-l-[3px] border-violet-400',
  emerald: 'bg-emerald-400/12 border-l-[3px] border-emerald-400',
};

const TX_BADGE_MAP: Record<TxBadgeState, { label: string; cls: string }> = {
  IDLE: { label: 'READY', cls: 'bg-slate-800 text-slate-300 border-slate-700' },
  ACTIVE: { label: 'IN TRANSACTION', cls: 'bg-amber-500/15 text-amber-300 border-amber-400/40' },
  COMMITTED: { label: 'COMMITTED', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40' },
  ROLLED_BACK: { label: 'ROLLED BACK', cls: 'bg-rose-500/15 text-rose-300 border-rose-400/40' },
  ABORTED: { label: 'TX ABORTED', cls: 'bg-rose-600/25 text-rose-200 border-rose-400/60' },
  SAVEPOINT: { label: 'SAVEPOINT SET', cls: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40' },
  LOCKED: { label: 'ROW LOCKED', cls: 'bg-violet-500/20 text-violet-200 border-violet-400/50' },
};

async function copyTextSafe(text: string): Promise<boolean> {
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

export const VSCodeSqlEditor: React.FC<VSCodeSqlEditorProps> = ({
  filename,
  code,
  accentColor = 'cyan',
  steps,
  activeStep = -1,
  onStepChange,
  projectorXL = false,
  compact = false,
  customBadge,
}) => {
  const [copied, setCopied] = useState(false);

  const lines = code.split('\n');
  const currentStepData =
    steps && activeStep >= 0 && activeStep < steps.length ? steps[activeStep] : null;
  const highlightedLines = new Set(currentStepData?.highlightLines ?? []);
  const txState: TxBadgeState = currentStepData?.txState ?? 'IDLE';
  const txBadge = TX_BADGE_MAP[txState];

  const handleCopy = async () => {
    const ok = await copyTextSafe(code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleNextStep = () => {
    if (!steps || !onStepChange) return;
    if (activeStep < steps.length - 1) {
      onStepChange(activeStep + 1);
    } else {
      onStepChange(-1);
    }
  };

  const codeSizeClass = compact
    ? projectorXL
      ? 'text-base sm:text-[17px]'
      : 'text-sm sm:text-[15px]'
    : projectorXL
      ? 'text-lg sm:text-xl lg:text-[22px]'
      : 'text-base sm:text-[17px] lg:text-[19px]';

  return (
    <div
      className={`rounded-xl border bg-[#0b0f17]/95 backdrop-blur-md overflow-hidden transition-all duration-300 ${ACCENT_RING[accentColor]}`}
    >
      {/* VS Code Title / Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#0f1522] border-b border-slate-800/90">
        <div className="flex items-center gap-3 min-w-0">
          {/* Window dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-3 h-3 rounded-full bg-rose-500/85" />
            <span className="w-3 h-3 rounded-full bg-amber-400/85" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/85" />
          </div>

          {/* Active File Tab */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#0b0f17] border border-slate-800 text-xs sm:text-sm font-mono text-slate-200 truncate">
            <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{filename}</span>
          </div>

          {customBadge && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider bg-slate-800/90 text-slate-300 border border-slate-700/70">
              {customBadge}
            </span>
          )}
        </div>

        {/* Actions: Stepper + Copy */}
        <div className="flex items-center gap-2">
          {steps && onStepChange && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-400/35 transition-colors cursor-pointer"
                title="Step through SQL execution"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {activeStep === -1
                  ? 'Step Run'
                  : activeStep < steps.length - 1
                    ? `Next (${activeStep + 1}/${steps.length})`
                    : 'Restart'}
              </button>

              {activeStep !== -1 && (
                <button
                  type="button"
                  onClick={() => onStepChange(-1)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
                  title="Reset execution"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-medium border transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Clickable Quick Step Pills (for projector speakers!) */}
      {steps && onStepChange && (
        <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 bg-[#0a0e17] border-b border-slate-800/70">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mr-1">
            Trace:
          </span>
          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            const isPast = activeStep > idx;
            return (
              <button
                key={step.label + idx}
                type="button"
                onClick={() => onStepChange(isActive ? -1 : idx)}
                className={`px-2.5 py-0.5 rounded text-xs font-mono transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-cyan-400/20 text-cyan-200 border-cyan-400/60 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                    : isPast
                      ? 'bg-slate-800/70 text-slate-300 border-slate-700'
                      : 'bg-transparent text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                }`}
              >
                {idx + 1}. {step.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Code Area */}
      <div className={`overflow-x-auto ${compact ? 'py-3' : 'py-5'}`}>
        <div className={`font-mono leading-[1.68] min-w-fit ${codeSizeClass}`}>
          {lines.map((line, index) => {
            const lineNum = index + 1;
            const isHighlighted = highlightedLines.has(lineNum);
            const isDimmed = activeStep !== -1 && !isHighlighted && line.trim() !== '';

            return (
              <div
                key={lineNum}
                className={`flex items-start px-4 transition-all duration-200 ${
                  isHighlighted
                    ? LINE_HIGHLIGHT_STYLE[accentColor]
                    : 'border-l-[3px] border-transparent hover:bg-white/[0.02]'
                } ${isDimmed ? 'opacity-50' : 'opacity-100'}`}
              >
                <span className="select-none w-8 sm:w-10 shrink-0 text-right pr-4 text-slate-600 text-[0.82em] pt-[2px]">
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

      {/* Integrated psql Terminal Drawer when stepping */}
      <AnimatePresence>
        {currentStepData?.terminalLines && currentStepData.terminalLines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-800 bg-[#070a10]"
          >
            <div className="px-4 py-2.5 font-mono text-xs sm:text-sm space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>psql output</span>
              </div>
              {currentStepData.terminalLines.map((item, idx) => {
                const toneClass =
                  item.tone === 'success'
                    ? 'text-emerald-300'
                    : item.tone === 'error'
                      ? 'text-rose-400 font-semibold'
                      : item.tone === 'warn'
                        ? 'text-amber-300'
                        : 'text-cyan-300';
                return (
                  <div key={idx} className={`${toneClass} flex items-start gap-2`}>
                    <span className="text-slate-600 select-none">postgres=#</span>
                    <span className="break-words">{item.text}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VS Code Bottom Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-1.5 bg-[#0d1320] border-t border-slate-800/90 text-[11px] sm:text-xs font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-cyan-400/90">
            <GitBranch className="w-3 h-3" />
            main*
          </span>
          <span className="hidden sm:inline">Ln {lines.length}, Col 1</span>
          <span className="hidden sm:inline">UTF-8</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className={`px-2 py-0.5 rounded border text-[10px] sm:text-[11px] font-semibold tracking-wider ${txBadge.cls}`}>
            {txBadge.label}
          </span>
          <span className="text-slate-400">PostgreSQL 17</span>
        </div>
      </div>
    </div>
  );
};
