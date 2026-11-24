import React from 'react';

const SWATCH_COLORS = {
  purple: 'bg-purple-600',
  orange: 'bg-orange-500',
  yellow: 'bg-amber-400',
  blue: 'bg-blue-600',
  cyan: 'bg-cyan-500',
  rose: 'bg-rose-500',
  emerald: 'bg-emerald-500',
};

export default function StatCard({ title, value, subtitle, color = 'purple', change, isHighlight }) {
  const swatch = SWATCH_COLORS[color] || 'bg-slate-900';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-200">
      {/* Title with Swatch */}
      <div className="flex items-center space-x-2.5">
        <span className={`w-3.5 h-3.5 rounded-sm ${swatch} flex-shrink-0`} />
        <h3 className="font-serif text-lg font-normal text-slate-900 tracking-tight">
          {title}
        </h3>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-slate-500 mt-1 font-sans">
          {subtitle}
        </p>
      )}

      {/* Metric Value */}
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-semibold font-sans text-slate-900 tracking-tight">
          {value}
        </span>
        {change && (
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
