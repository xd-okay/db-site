import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Database,
  Layers,
  LayoutList,
  Lightbulb,
  MonitorPlay,
  Shield,
  Terminal,
} from 'lucide-react';
import {
  ACID_CARDS,
  Difficulty,
  EXAMPLES,
  LessonExample,
  MODULES,
  ModuleId,
} from './data/examplesData';
import { SqlCodePanel } from './components/SqlCodePanel';
import { QueryResultsPanel } from './components/QueryResultsPanel';
import { IsolationTable } from './components/IsolationTable';
import { SetupModal } from './components/SetupModal';

type ViewTab = 'intro' | 'lab' | 'isolation';

const DIFFICULTY_BADGE: Record<Difficulty, string> = {
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-sky-50 text-sky-700 border-sky-200',
  Hard: 'bg-amber-50 text-amber-800 border-amber-200',
  Boss: 'bg-rose-50 text-rose-700 border-rose-200',
};

const ACID_ACCENT = {
  cyan: 'border-blue-200 text-blue-700 bg-blue-50',
  emerald: 'border-emerald-200 text-emerald-700 bg-emerald-50',
  violet: 'border-purple-200 text-purple-700 bg-purple-50',
  amber: 'border-amber-200 text-amber-700 bg-amber-50',
};

interface ExampleSlideProps {
  example: LessonExample;
  step: number;
  onStepChange: (stepIndex: number) => void;
  projectorXL: boolean;
}

const ExampleSlideBlock: React.FC<ExampleSlideProps> = ({
  example,
  step,
  onStepChange,
  projectorXL,
}) => {
  const mod = MODULES.find((m) => m.id === example.module);

  return (
    <div className="space-y-5">
      {/* Header + Badges */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-bold">
            #{example.code}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-md border font-semibold ${DIFFICULTY_BADGE[example.difficulty]}`}
          >
            {example.difficulty}
          </span>
          {mod && (
            <span className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
              {mod.num} · {mod.title}
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-blue-700 font-medium">
            {example.tag}
          </span>
        </div>

        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
          {example.title}
        </h2>

        {/* Compact HINT Bar (inspired by PDF) */}
        <div className="flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50/90 px-4 py-2.5">
          <Lightbulb className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
          <p
            className={`text-slate-800 ${
              projectorXL ? 'text-base sm:text-lg' : 'text-sm sm:text-[15px]'
            }`}
          >
            <span className="font-mono font-bold text-sky-800 mr-2">HINT</span>
            {example.hint}
          </p>
        </div>
      </div>

      {/* Main Split: Left = Lecture SQL Code | Right = Query Results & Expect */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7">
          <SqlCodePanel
            example={example}
            activeStep={step}
            onStepChange={onStepChange}
            projectorXL={projectorXL}
          />
        </div>
        <div className="lg:col-span-5">
          <QueryResultsPanel
            example={example}
            activeStep={step}
            projectorXL={projectorXL}
          />
        </div>
      </div>
    </div>
  );
};

export function App() {
  const [tab, setTab] = useState<ViewTab>('intro');
  const [scrollAll, setScrollAll] = useState<boolean>(false);
  const [projectorXL, setProjectorXL] = useState<boolean>(false);
  const [activeExampleIdx, setActiveExampleIdx] = useState<number>(0);
  const [stepMap, setStepMap] = useState<Record<number, number>>({});
  const [setupOpen, setSetupOpen] = useState<boolean>(false);

  const currentExample = EXAMPLES[activeExampleIdx];
  const currentStep = stepMap[currentExample.id] ?? -1;

  const setExampleStep = (exampleId: number, stepIndex: number) => {
    setStepMap((prev) => ({ ...prev, [exampleId]: stepIndex }));
  };

  const jumpToModule = (moduleId: ModuleId) => {
    const firstIdx = EXAMPLES.findIndex((ex) => ex.module === moduleId);
    if (firstIdx !== -1) {
      setActiveExampleIdx(firstIdx);
      setTab('lab');
      setScrollAll(false);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        setupOpen ||
        scrollAll ||
        tab !== 'lab' ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === 'ArrowRight' && activeExampleIdx < EXAMPLES.length - 1) {
        setActiveExampleIdx((i) => i + 1);
      } else if (e.key === 'ArrowLeft' && activeExampleIdx > 0) {
        setActiveExampleIdx((i) => i - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeExampleIdx, scrollAll, setupOpen, tab]);

  const maxContainer = projectorXL ? 'max-w-[1440px]' : 'max-w-7xl';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Slim Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div
          className={`${maxContainer} mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3`}
        >
          {/* Brand */}
          <button
            type="button"
            onClick={() => {
              setScrollAll(false);
              setTab('intro');
            }}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="font-mono text-sm font-bold tracking-tight text-slate-900">
              PostgreSQL <span className="text-blue-600">/ TX</span>
            </span>
          </button>

          {/* Main Mode Tabs */}
          {!scrollAll && (
            <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setTab('intro')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                  tab === 'intro'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 border border-transparent'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Intro · ACID</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('lab')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                  tab === 'lab'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 border border-transparent'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Examples (01–15)</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('isolation')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                  tab === 'isolation'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 border border-transparent'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Isolation Table</span>
                <span className="sm:hidden">Table</span>
              </button>
            </nav>
          )}

          {/* Right Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSetupOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
              title="Copy one-time practice schema SQL"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Setup SQL</span>
            </button>

            <button
              type="button"
              onClick={() => setScrollAll((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border cursor-pointer transition-colors ${
                scrollAll
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="Switch between focused slides and scrollable full deck"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {scrollAll ? 'Slide Mode' : 'Scroll All'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setProjectorXL((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border cursor-pointer transition-colors ${
                projectorXL
                  ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="Increase font size for projector"
            >
              <MonitorPlay className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {projectorXL ? 'XL: ON' : 'XL Font'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 w-full ${maxContainer} mx-auto px-4 sm:px-6 py-6 sm:py-8`}>
        {scrollAll ? (
          /* ================= SCROLL ALL MODE ================= */
          <div className="space-y-16">
            <section className="space-y-8">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-blue-700 font-semibold">
                  PostgreSQL // Lecture Deck
                </span>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 mt-2">
                  PostgreSQL Transactions
                </h1>
                <p className="mt-2 font-mono text-base text-slate-600">
                  All or nothing. Zero partial states. 15 progressive examples.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ACID_CARDS.map((card) => (
                  <div
                    key={card.letter}
                    className="rounded-xl border border-slate-200 bg-white shadow-xs p-5"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center font-mono text-lg font-bold mb-3 ${ACID_ACCENT[card.accent]}`}
                    >
                      {card.letter}
                    </div>
                    <h3 className="font-display text-lg font-bold text-slate-900">
                      {card.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">{card.tagline}</p>
                  </div>
                ))}
              </div>
            </section>

            {EXAMPLES.map((ex) => (
              <section key={ex.id} className="pt-10 border-t border-slate-200">
                <ExampleSlideBlock
                  example={ex}
                  step={stepMap[ex.id] ?? -1}
                  onStepChange={(s) => setExampleStep(ex.id, s)}
                  projectorXL={projectorXL}
                />
              </section>
            ))}

            <section className="pt-10 border-t border-slate-200 space-y-4">
              <h2 className="font-display text-3xl font-bold text-slate-900">
                Isolation Levels Cheat Sheet
              </h2>
              <IsolationTable projectorXL={projectorXL} />
            </section>
          </div>
        ) : tab === 'intro' ? (
          /* ================= INTRO + ACID + ROADMAP ================= */
          <div className="space-y-10 py-4">
            <div className="rounded-2xl bg-slate-900 text-white p-7 sm:p-10 shadow-sm">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/15 font-mono text-xs uppercase tracking-wider text-sky-300 mb-4">
                PostgreSQL // Transactions Quick Lab
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                PostgreSQL Transactions
              </h1>
              <p className="mt-3 font-mono text-base sm:text-lg text-slate-300 max-w-2xl">
                All or nothing. Safe concurrent updates from basics to deadlocks.
              </p>
            </div>

            {/* 4 ACID Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ACID_CARDS.map((card) => (
                <div
                  key={card.letter}
                  className="rounded-xl border border-slate-200 bg-white shadow-xs p-5"
                >
                  <div
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center font-mono text-lg font-bold mb-3 ${ACID_ACCENT[card.accent]}`}
                  >
                    {card.letter}
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">{card.tagline}</p>
                </div>
              ))}
            </div>

            {/* 5-Module Progressive Roadmap */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Curriculum · Easy → Boss (15 Examples)
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setActiveExampleIdx(0);
                    setTab('lab');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <span>Start Example 01</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {MODULES.map((mod) => {
                  const modExamples = EXAMPLES.filter((e) => e.module === mod.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => jumpToModule(mod.id)}
                      className="text-left rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/30 shadow-xs p-4 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between font-mono text-xs mb-2">
                        <span className="text-blue-700 font-bold">{mod.num}</span>
                        <span className="text-slate-400">
                          {modExamples[0]?.code}–{modExamples[modExamples.length - 1]?.code}
                        </span>
                      </div>
                      <div className="font-display font-bold text-slate-900">
                        {mod.title}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {mod.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : tab === 'isolation' ? (
          /* ================= ISOLATION CHEAT SHEET ================= */
          <div className="space-y-6 py-2">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-blue-700 font-semibold">
                Reference Matrix
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
                Isolation Levels Cheat Sheet
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-1">
                Compare PostgreSQL MVCC behavior against the SQL-92 standard.
              </p>
            </div>
            <IsolationTable projectorXL={projectorXL} />
          </div>
        ) : (
          /* ================= FOCUSED LECTURE SLIDE MODE (01–15) ================= */
          <div className="space-y-6">
            {/* Numbered Slide Strip (01..15) */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-white shadow-xs">
              {EXAMPLES.map((ex, idx) => {
                const isActive = idx === activeExampleIdx;
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => setActiveExampleIdx(idx)}
                    title={`#${ex.code} ${ex.title} (${ex.difficulty})`}
                    className={`px-2.5 py-1 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer border ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {ex.code}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setTab('isolation')}
                className="ml-auto px-3 py-1 rounded-lg font-mono text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 cursor-pointer"
              >
                Isolation Matrix
              </button>
            </div>

            {/* Active Example Content */}
            <ExampleSlideBlock
              example={currentExample}
              step={currentStep}
              onStepChange={(s) => setExampleStep(currentExample.id, s)}
              projectorXL={projectorXL}
            />

            {/* Bottom Prev / Next Bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
              <button
                type="button"
                disabled={activeExampleIdx === 0}
                onClick={() => setActiveExampleIdx((i) => Math.max(0, i - 1))}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-mono text-xs sm:text-sm text-slate-700 cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="font-mono text-xs text-slate-500 text-center">
                <span className="text-slate-900 font-semibold">
                  {activeExampleIdx + 1} / {EXAMPLES.length}
                </span>
                <span className="hidden sm:inline"> · Use ← → keys</span>
              </div>

              {activeExampleIdx < EXAMPLES.length - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setActiveExampleIdx((i) => Math.min(EXAMPLES.length - 1, i + 1))
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-mono text-xs sm:text-sm font-semibold text-white cursor-pointer shadow-xs"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setTab('isolation')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-mono text-xs sm:text-sm font-semibold text-white cursor-pointer shadow-xs"
                >
                  <span>Isolation Table</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <SetupModal open={setupOpen} onClose={() => setSetupOpen(false)} />
    </div>
  );
}

export default App;
