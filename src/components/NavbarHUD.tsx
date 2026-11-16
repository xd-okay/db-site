import React from 'react';
import { MonitorPlay, Terminal } from 'lucide-react';

export interface NavItem {
  id: string;
  num: string;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'hero', num: '01', label: 'ACID' },
  { id: 'cs2', num: '02', label: 'BEGIN / COMMIT' },
  { id: 'marvel', num: '03', label: 'ATOMICITY' },
  { id: 'rpg', num: '04', label: 'SAVEPOINTS' },
  { id: 'valorant', num: '05', label: 'FOR UPDATE' },
  { id: 'isolation', num: '06', label: 'ISOLATION' },
];

interface NavbarHUDProps {
  activeSection: string;
  projectorXL: boolean;
  onToggleProjector: () => void;
}

export const NavbarHUD: React.FC<NavbarHUDProps> = ({
  activeSection,
  projectorXL,
  onToggleProjector,
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#06080f]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          type="button"
          onClick={() => scrollTo('hero')}
          className="flex items-center gap-2.5 text-left cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_16px_rgba(34,211,238,0.25)] group-hover:border-cyan-300 transition-colors">
            <Terminal className="w-4 h-4 text-cyan-300" />
          </div>
          <div className="font-mono text-xs sm:text-sm font-bold tracking-wider">
            <span className="text-slate-100">PG</span>
            <span className="text-cyan-400">::TX</span>
          </div>
        </button>

        {/* Section Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/70 p-1 rounded-xl border border-slate-800/90">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                    : 'text-slate-400 hover:text-slate-100 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-cyan-400' : 'text-slate-600'}>
                  {item.num}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Projector Scale Toggle */}
        <button
          type="button"
          onClick={onToggleProjector}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all cursor-pointer shrink-0 ${
            projectorXL
              ? 'bg-violet-500/20 text-violet-200 border-violet-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
              : 'bg-slate-900 text-slate-300 hover:text-white border-slate-700 hover:border-slate-600'
          }`}
          title="Increase SQL code size for classroom projectors"
        >
          <MonitorPlay className="w-3.5 h-3.5" />
          <span>{projectorXL ? 'Projector XL: ON' : 'Projector XL'}</span>
        </button>
      </div>
    </header>
  );
};
