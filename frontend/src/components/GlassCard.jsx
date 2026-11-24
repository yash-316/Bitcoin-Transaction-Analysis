import React from 'react';

export default function GlassCard({ children, className = '', hover = false }) {
  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm ${
        hover ? 'hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
