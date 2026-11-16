import React, { useState } from 'react';
import { Check, Copy, Database, X } from 'lucide-react';
import { SETUP_SCHEMA_SQL } from '../data/examplesData';
import { copyTextSafe, renderHighlightedSqlLine } from '../utils/sqlHighlighter';

interface SetupModalProps {
  open: boolean;
  onClose: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ open, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleCopy = async () => {
    const ok = await copyTextSafe(SETUP_SCHEMA_SQL);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] rounded-2xl border border-slate-200 bg-white flex flex-col overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-blue-600" />
            <span className="font-mono text-sm font-bold text-slate-900">
              SETUP — Run Once in Practice DB
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy SQL'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 text-xs font-mono text-amber-900">
          CAREFUL: Drops and recreates schema <span className="font-bold">txlab</span>. Use a practice database only.
        </div>

        <div className="p-5 overflow-y-auto font-mono text-xs sm:text-sm leading-relaxed bg-white">
          {SETUP_SCHEMA_SQL.split('\n').map((line, i) => (
            <pre key={i} className="whitespace-pre-wrap">
              {renderHighlightedSqlLine(line)}
            </pre>
          ))}
        </div>
      </div>
    </div>
  );
};
