import React from 'react';
import { Crosshair, ShieldAlert, Beer, Lock, Clock, CheckCircle2, XCircle, Flag } from 'lucide-react';
import { VSCodeSqlEditor } from './VSCodeSqlEditor';
import { VALORANT_P2_SQL } from '../data/lessonData';

/* -------------------- 2. CS2 Economy HUD -------------------- */
interface Cs2HudProps {
  step: number;
  outcome: 'commit' | 'rollback';
  onOutcomeChange: (outcome: 'commit' | 'rollback') => void;
}

export const Cs2Hud: React.FC<Cs2HudProps> = ({
  step,
  outcome,
  onOutcomeChange,
}) => {
  const moneySubtracted = step >= 1;
  const awpAdded = step >= 2;
  const isFinal = step === 3;
  const isCommitted = isFinal && outcome === 'commit';
  const isRolledBack = isFinal && outcome === 'rollback';

  const sessionBalance = isRolledBack ? 5200 : moneySubtracted ? 450 : 5200;
  const serverBalance = isCommitted ? 450 : 5200;
  const sessionHasAwp = awpAdded && !isRolledBack;
  const serverHasAwp = isCommitted;

  return (
    <div className="rounded-xl border border-cyan-500/25 bg-[#0b0f17]/90 p-5 flex flex-col justify-between gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-cyan-300">
          <Crosshair className="w-4 h-4" />
          <span>Live DB State</span>
        </div>

        <div className="inline-flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => onOutcomeChange('commit')}
            className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
              outcome === 'commit'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            COMMIT
          </button>
          <button
            type="button"
            onClick={() => onOutcomeChange('rollback')}
            className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
              outcome === 'rollback'
                ? 'bg-rose-500/20 text-rose-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ROLLBACK
          </button>
        </div>
      </div>

      {/* Session 1: s1mple */}
      <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Your Session (s1mple)</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              isCommitted
                ? 'bg-emerald-500/20 text-emerald-300'
                : isRolledBack
                  ? 'bg-rose-500/20 text-rose-300'
                  : step >= 1
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isCommitted
              ? 'SAVED'
              : isRolledBack
                ? 'REVERTED'
                : step >= 1
                  ? 'UNCOMMITTED'
                  : 'READY'}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-xs font-mono text-slate-500">balance</span>
          <span className="font-mono text-2xl font-bold text-emerald-400">
            ${sessionBalance.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500">inventory</span>
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Knife</span>
            {sessionHasAwp && (
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 font-bold">
                + AWP
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Session 2: Other Players */}
      <div className="rounded-lg bg-[#080b12] border border-slate-800/80 p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Other Sessions View</span>
          <span className="text-[10px] uppercase text-slate-500">
            {isCommitted ? 'Visible now' : 'Isolated'}
          </span>
        </div>
        <div className="flex items-center justify-between font-mono text-sm">
          <span className="text-slate-300">s1mple balance:</span>
          <span className={isCommitted ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
            ${serverBalance.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between font-mono text-sm">
          <span className="text-slate-300">AWP in inventory:</span>
          <span className={serverHasAwp ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
            {serverHasAwp ? 'YES' : 'NO'}
          </span>
        </div>
      </div>
    </div>
  );
};

/* -------------------- 3. Marvel Universe HUD -------------------- */
export const MarvelHud: React.FC<{ step: number }> = ({ step }) => {
  const stagedOrder = step === 1 || step === 2;
  const crashed = step >= 2;
  const rolledBack = step === 3;

  return (
    <div className="rounded-xl border border-rose-500/25 bg-[#0b0f17]/90 p-5 flex flex-col justify-between gap-4">
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-rose-300">
        <span className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          Stark Armory DB
        </span>
        <span className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-400/30 text-[10px]">
          CHECK (stock &gt;= 0)
        </span>
      </div>

      {/* suits_stock */}
      <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-3.5 space-y-2">
        <div className="flex items-center justify-between font-mono text-xs text-slate-400">
          <span>suits_stock</span>
          <span>Mark LXXXV</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-mono text-slate-500">stock</span>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-2xl font-bold text-white">10</span>
            {step === 2 && (
              <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-400/40">
                10 - 50 = -40 ❌
              </span>
            )}
          </div>
        </div>
      </div>

      {/* orders */}
      <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-3.5 space-y-2">
        <div className="flex items-center justify-between font-mono text-xs text-slate-400">
          <span>orders</span>
          <span>Atomicity Check</span>
        </div>
        <div className="flex items-center justify-between font-mono text-sm">
          <span className="text-slate-300">Tony Stark (50x):</span>
          {rolledBack ? (
            <span className="inline-flex items-center gap-1 text-rose-300 font-bold">
              <XCircle className="w-4 h-4" />
              WIPED (0 rows)
            </span>
          ) : stagedOrder ? (
            <span className="text-amber-300 font-semibold">
              {crashed ? 'ABORTED' : 'STAGED...'}
            </span>
          ) : (
            <span className="text-slate-500">0 rows</span>
          )}
        </div>
      </div>

      {/* Outcome Banner */}
      <div
        className={`rounded-lg px-3.5 py-2.5 border font-mono text-xs flex items-center justify-between ${
          crashed
            ? 'bg-rose-500/15 border-rose-400/40 text-rose-200'
            : 'bg-slate-900/70 border-slate-800 text-slate-400'
        }`}
      >
        <span>TX Status</span>
        <span className="font-bold">
          {rolledBack
            ? 'ALL ROLLED BACK'
            : step === 2
              ? 'CONSTRAINT FAILED'
              : step === 1
                ? 'IN PROGRESS'
                : 'READY'}
        </span>
      </div>
    </div>
  );
};

/* -------------------- 4. Fantasy RPG Tavern HUD -------------------- */
export const RpgHud: React.FC<{ step: number }> = ({ step }) => {
  const hasBeers = step >= 1;
  const savepointActive = step >= 2;
  const isWrecked = step === 3;
  const isCommitted = step === 5;

  const chairs = isWrecked ? 0 : 12;
  const tables = isWrecked ? 0 : 4;

  return (
    <div className="rounded-xl border border-amber-500/25 bg-[#0b0f17]/90 p-5 flex flex-col justify-between gap-4">
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-amber-300">
        <span className="flex items-center gap-2">
          <Beer className="w-4 h-4" />
          Tavern Ledger
        </span>
        {savepointActive && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-[10px]">
            <Flag className="w-3 h-3" />
            pre_brawl
          </span>
        )}
      </div>

      {/* Party Order */}
      <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-3.5 flex items-center justify-between">
        <div>
          <div className="text-xs font-mono text-slate-400">orders</div>
          <div className="font-mono text-sm font-bold text-white mt-0.5">
            {hasBeers ? '🍺 3x Beers' : 'Empty'}
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold ${
            isCommitted
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
              : hasBeers
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-slate-800 text-slate-500'
          }`}
        >
          {isCommitted ? 'COMMITTED' : hasBeers ? 'KEPT' : 'NONE'}
        </span>
      </div>

      {/* Furniture */}
      <div
        className={`rounded-lg border p-3.5 transition-colors ${
          isWrecked
            ? 'bg-rose-500/12 border-rose-400/45'
            : 'bg-slate-900/80 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between font-mono text-xs text-slate-400 mb-2">
          <span>tavern_inventory</span>
          {step === 4 && (
            <span className="text-cyan-300 font-semibold">↺ Restored!</span>
          )}
          {isWrecked && (
            <span className="text-rose-300 font-semibold">💥 BRAWL!</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 font-mono">
          <div className="rounded bg-[#080b12] px-3 py-2 border border-slate-800">
            <div className="text-[11px] text-slate-500">chairs</div>
            <div
              className={`text-xl font-bold ${
                isWrecked ? 'text-rose-400' : 'text-emerald-300'
              }`}
            >
              {chairs}
            </div>
          </div>
          <div className="rounded bg-[#080b12] px-3 py-2 border border-slate-800">
            <div className="text-[11px] text-slate-500">tables</div>
            <div
              className={`text-xl font-bold ${
                isWrecked ? 'text-rose-400' : 'text-emerald-300'
              }`}
            >
              {tables}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------- 5. Valorant Row Lock HUD -------------------- */
export const ValorantHud: React.FC<{ step: number; projectorXL?: boolean }> = ({
  step,
  projectorXL = false,
}) => {
  const isRowLocked = step === 1 || step === 2;
  const isCommitted = step === 3;
  const owner = step >= 2 ? 'Player1' : 'NULL';

  return (
    <div className="flex flex-col gap-4">
      {/* Agent Status Card */}
      <div className="rounded-xl border border-violet-500/30 bg-[#0b0f17]/90 p-5 space-y-3.5">
        <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-violet-300">
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            agents Row State
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isRowLocked
                ? 'bg-violet-500/20 text-violet-200 border-violet-400/50'
                : isCommitted
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isRowLocked ? 'ROW LOCKED' : isCommitted ? 'INSTA-LOCKED' : 'AVAILABLE'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 font-mono">
          <div className="rounded-lg bg-slate-900/80 border border-slate-800 px-3 py-2.5">
            <div className="text-[11px] text-slate-500">agent</div>
            <div className="text-lg font-bold text-white">Jett</div>
          </div>
          <div className="rounded-lg bg-slate-900/80 border border-slate-800 px-3 py-2.5">
            <div className="text-[11px] text-slate-500">owner</div>
            <div
              className={`text-lg font-bold ${
                owner === 'Player1' ? 'text-cyan-300' : 'text-slate-500'
              }`}
            >
              {owner}
            </div>
          </div>
        </div>

        {/* Player 2 Queue Indicator */}
        <div
          className={`rounded-lg px-3.5 py-2.5 border font-mono text-xs flex items-center justify-between ${
            isRowLocked
              ? 'bg-amber-500/15 border-amber-400/40 text-amber-200'
              : isCommitted
                ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200'
                : 'bg-slate-900/70 border-slate-800 text-slate-400'
          }`}
        >
          <span className="flex items-center gap-1.5">
            {isRowLocked ? (
              <Clock className="w-3.5 h-3.5 animate-pulse text-amber-300" />
            ) : isCommitted ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            ) : null}
            Player 2:
          </span>
          <span className="font-bold">
            {isRowLocked
              ? 'WAITING ON LOCK...'
              : isCommitted
                ? "UNBLOCKED -> 'Player1' owns Jett"
                : 'IDLE'}
          </span>
        </div>
      </div>

      {/* Competing Player 2 Mini Editor */}
      <VSCodeSqlEditor
        filename="player2_competing.sql"
        code={VALORANT_P2_SQL}
        accentColor="violet"
        compact
        projectorXL={projectorXL}
        customBadge="SESSION 2"
      />
    </div>
  );
};
