import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ChevronRight, Sparkles } from 'lucide-react';
import { NavbarHUD, NAV_ITEMS } from './components/NavbarHUD';
import { SectionHeader } from './components/SectionHeader';
import { VSCodeSqlEditor } from './components/VSCodeSqlEditor';
import { IsolationTable } from './components/IsolationTable';
import { Cs2Hud, MarvelHud, RpgHud, ValorantHud } from './components/LiveStateHuds';
import {
  ACID_CARDS,
  CS2_STEPS_COMMIT,
  CS2_STEPS_ROLLBACK,
  MARVEL_SQL,
  MARVEL_STEPS,
  RPG_SQL,
  RPG_STEPS,
  VALORANT_SQL,
  VALORANT_STEPS,
} from './data/lessonData';

const ACID_CARD_STYLES = {
  cyan: {
    border: 'border-cyan-500/30 hover:border-cyan-400/70',
    glow: 'hover:shadow-[0_0_32px_-8px_rgba(34,211,238,0.45)]',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40',
  },
  emerald: {
    border: 'border-emerald-500/30 hover:border-emerald-400/70',
    glow: 'hover:shadow-[0_0_32px_-8px_rgba(16,185,129,0.45)]',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40',
  },
  violet: {
    border: 'border-violet-500/30 hover:border-violet-400/70',
    glow: 'hover:shadow-[0_0_32px_-8px_rgba(168,85,247,0.45)]',
    badge: 'bg-violet-500/15 text-violet-300 border-violet-400/40',
  },
  amber: {
    border: 'border-amber-500/30 hover:border-amber-400/70',
    glow: 'hover:shadow-[0_0_32px_-8px_rgba(245,158,11,0.45)]',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-400/40',
  },
};

export function App() {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [projectorXL, setProjectorXL] = useState<boolean>(false);

  // Per-section step state (-1 = full overview)
  const [cs2Outcome, setCs2Outcome] = useState<'commit' | 'rollback'>('commit');
  const [cs2Step, setCs2Step] = useState<number>(-1);
  const [marvelStep, setMarvelStep] = useState<number>(-1);
  const [rpgStep, setRpgStep] = useState<number>(-1);
  const [valorantStep, setValorantStep] = useState<number>(-1);

  const cs2SqlDynamic = `BEGIN;

-- Subtract $4750 from 's1mple' to buy an AWP
UPDATE players
SET balance = balance - 4750
WHERE nickname = 's1mple';

INSERT INTO inventory (player, weapon)
VALUES ('s1mple', 'AWP');

${cs2Outcome === 'commit' ? 'COMMIT; -- Save buy permanently' : 'ROLLBACK; -- Cancel buy & refund $4750'}`;

  // Track visible section in navbar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: 0.05 }
    );

    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Keyboard shortcuts 1-6 for effortless projector jumping
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return;
      }
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < NAV_ITEMS.length) {
        const el = document.getElementById(NAV_ITEMS[idx].id);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const containerMaxWidth = projectorXL ? 'max-w-[1440px]' : 'max-w-7xl';

  return (
    <div className="relative min-h-screen bg-[#06080f] text-slate-100">
      {/* Cyberpunk Ambient Background */}
      <div className="pointer-events-none fixed inset-0 cyber-grid opacity-80" />
      <div className="pointer-events-none fixed inset-0 cyber-scanlines opacity-50" />
      <div className="pointer-events-none fixed -top-48 left-1/2 -translate-x-1/2 w-[900px] h-[420px] rounded-full bg-cyan-500/10 blur-[140px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 w-[620px] h-[420px] rounded-full bg-violet-600/10 blur-[140px]" />

      <NavbarHUD
        activeSection={activeSection}
        projectorXL={projectorXL}
        onToggleProjector={() => setProjectorXL((prev) => !prev)}
      />

      <main className={`relative z-10 ${containerMaxWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
        {/* ==================== 1. HERO + ACID ==================== */}
        <section
          id="hero"
          className="min-h-[calc(100vh-3.5rem)] py-14 sm:py-20 flex flex-col justify-center scroll-mt-14"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/35 text-cyan-300 font-mono text-xs uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PostgreSQL // Transaction Engine</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
              PostgreSQL{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400">
                Transactions
              </span>
            </h1>

            <p className="mt-5 font-mono text-base sm:text-xl text-slate-300 tracking-wide">
              ALL OR NOTHING. ZERO PARTIAL STATES.
            </p>
          </motion.div>

          {/* 4 Glowing ACID Cards */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
          >
            {ACID_CARDS.map((card) => {
              const style = ACID_CARD_STYLES[card.accent];
              return (
                <div
                  key={card.letter}
                  className={`rounded-2xl border bg-[#0b0f17]/85 backdrop-blur-md p-5 sm:p-6 transition-all duration-300 ${style.border} ${style.glow}`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center font-mono text-xl font-bold mb-4 ${style.badge}`}
                  >
                    {card.letter}
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 text-sm sm:text-base text-slate-400 font-medium">
                    {card.tagline}
                  </p>
                </div>
              );
            })}
          </motion.div>

          <div className="mt-12 flex flex-wrap items-center gap-5">
            <a
              href="#cs2"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/45 font-mono text-sm font-semibold shadow-[0_0_24px_-6px_rgba(34,211,238,0.45)] transition-all"
            >
              <span>Start SQL Examples</span>
              <ArrowDown className="w-4 h-4" />
            </a>
            <span className="font-mono text-xs text-slate-500 hidden sm:inline">
              Keys <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">1</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">6</kbd> jump slides
            </span>
          </div>
        </section>

        {/* ==================== 2. CS2 ECONOMY ==================== */}
        <motion.section
          id="cs2"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.5 }}
          className="py-16 sm:py-24 border-t border-slate-800/60 scroll-mt-16"
        >
          <SectionHeader
            number="02"
            themeTag="CS2 // Economy Buy Round"
            title="BEGIN, COMMIT, ROLLBACK"
            accent="cyan"
            bullets={[
              'Changes stay temporary & hidden until COMMIT.',
              'ROLLBACK cancels the entire block cleanly.',
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8">
              <VSCodeSqlEditor
                filename="02_cs2_buy_awp.sql"
                code={cs2SqlDynamic}
                accentColor="cyan"
                steps={cs2Outcome === 'commit' ? CS2_STEPS_COMMIT : CS2_STEPS_ROLLBACK}
                activeStep={cs2Step}
                onStepChange={setCs2Step}
                projectorXL={projectorXL}
              />
            </div>
            <div className="lg:col-span-4 flex flex-col">
              <Cs2Hud
                step={cs2Step}
                outcome={cs2Outcome}
                onOutcomeChange={(next) => {
                  setCs2Outcome(next);
                  if (cs2Step === -1) setCs2Step(3);
                }}
              />
            </div>
          </div>
        </motion.section>

        {/* ==================== 3. MARVEL UNIVERSE ==================== */}
        <motion.section
          id="marvel"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.5 }}
          className="py-16 sm:py-24 border-t border-slate-800/60 scroll-mt-16"
        >
          <SectionHeader
            number="03"
            themeTag="Marvel // Stark Armory"
            title="Atomicity & Constraints"
            accent="rose"
            bullets={[
              'Any constraint error aborts the entire transaction.',
              'Earlier queries inside the block are auto-rolled back.',
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8">
              <VSCodeSqlEditor
                filename="03_stark_suits_order.sql"
                code={MARVEL_SQL}
                accentColor="rose"
                steps={MARVEL_STEPS}
                activeStep={marvelStep}
                onStepChange={setMarvelStep}
                projectorXL={projectorXL}
              />
            </div>
            <div className="lg:col-span-4 flex flex-col">
              <MarvelHud step={marvelStep} />
            </div>
          </div>
        </motion.section>

        {/* ==================== 4. RPG TAVERN ==================== */}
        <motion.section
          id="rpg"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.5 }}
          className="py-16 sm:py-24 border-t border-slate-800/60 scroll-mt-16"
        >
          <SectionHeader
            number="04"
            themeTag="Fantasy RPG // Tavern"
            title="Savepoints"
            accent="amber"
            bullets={[
              'Checkpoints inside a running transaction.',
              'Roll back part of the work without losing earlier steps.',
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8">
              <VSCodeSqlEditor
                filename="04_tavern_savepoint.sql"
                code={RPG_SQL}
                accentColor="amber"
                steps={RPG_STEPS}
                activeStep={rpgStep}
                onStepChange={setRpgStep}
                projectorXL={projectorXL}
              />
            </div>
            <div className="lg:col-span-4 flex flex-col">
              <RpgHud step={rpgStep} />
            </div>
          </div>
        </motion.section>

        {/* ==================== 5. VALORANT ROW LOCKS ==================== */}
        <motion.section
          id="valorant"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.5 }}
          className="py-16 sm:py-24 border-t border-slate-800/60 scroll-mt-16"
        >
          <SectionHeader
            number="05"
            themeTag="Valorant // Agent Select"
            title="Row Locks · FOR UPDATE"
            accent="violet"
            bullets={[
              'Prevents two users from claiming the same row at once.',
              'Competing transactions wait until COMMIT or ROLLBACK.',
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <VSCodeSqlEditor
                filename="05_player1_instalock.sql"
                code={VALORANT_SQL}
                accentColor="violet"
                steps={VALORANT_STEPS}
                activeStep={valorantStep}
                onStepChange={setValorantStep}
                projectorXL={projectorXL}
                customBadge="SESSION 1"
              />
            </div>
            <div className="lg:col-span-5">
              <ValorantHud step={valorantStep} projectorXL={projectorXL} />
            </div>
          </div>
        </motion.section>

        {/* ==================== 6. ISOLATION LEVELS ==================== */}
        <motion.section
          id="isolation"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.5 }}
          className="py-16 sm:py-24 border-t border-slate-800/60 scroll-mt-16"
        >
          <SectionHeader
            number="06"
            themeTag="PostgreSQL MVCC // Cheat Sheet"
            title="Isolation Levels"
            accent="emerald"
            bullets={[
              'Controls which concurrency anomalies can occur.',
              'Stricter levels trade concurrency for safety.',
            ]}
          />

          <IsolationTable projectorXL={projectorXL} />
        </motion.section>

        {/* Minimal Footer */}
        <footer className="py-10 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>PostgreSQL Transactions Visual Deck</span>
          </div>
          <a
            href="#hero"
            className="text-slate-400 hover:text-cyan-300 transition-colors"
          >
            ↑ Back to Top
          </a>
        </footer>
      </main>
    </div>
  );
}

export default App;
