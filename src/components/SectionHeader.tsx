import React from 'react';

interface SectionHeaderProps {
  number: string;
  themeTag: string;
  title: string;
  bullets: string[];
  accent: 'cyan' | 'rose' | 'amber' | 'violet' | 'emerald';
}

const TAG_STYLE: Record<SectionHeaderProps['accent'], string> = {
  cyan: 'text-cyan-300 bg-cyan-500/10 border-cyan-400/30',
  rose: 'text-rose-300 bg-rose-500/10 border-rose-400/30',
  amber: 'text-amber-300 bg-amber-500/10 border-amber-400/30',
  violet: 'text-violet-300 bg-violet-500/10 border-violet-400/30',
  emerald: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30',
};

const DOT_STYLE: Record<SectionHeaderProps['accent'], string> = {
  cyan: 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]',
  rose: 'bg-rose-400 shadow-[0_0_10px_#fb7185]',
  amber: 'bg-amber-400 shadow-[0_0_10px_#fbbf24]',
  violet: 'bg-violet-400 shadow-[0_0_10px_#a78bfa]',
  emerald: 'bg-emerald-400 shadow-[0_0_10px_#34d399]',
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  number,
  themeTag,
  title,
  bullets,
  accent,
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="font-mono text-sm font-bold text-slate-500 tracking-widest">
          // {number}
        </span>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest border ${TAG_STYLE[accent]}`}
        >
          {themeTag}
        </span>
      </div>

      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
        {title}
      </h2>

      <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-x-8 gap-y-2">
        {bullets.map((bullet, idx) => (
          <li
            key={idx}
            className="flex items-center gap-2.5 text-base sm:text-lg text-slate-300 font-medium"
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${DOT_STYLE[accent]}`} />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
