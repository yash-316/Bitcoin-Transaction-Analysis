import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Layers,
  ShieldAlert,
  Share2,
  Sparkles,
  Database,
  Info,
  Download,
  RotateCcw
} from 'lucide-react';

const navItems = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Clustering Analysis', path: '/clustering', icon: Layers, badge: 'K-Means' },
  { name: 'Anomaly Detection', path: '/anomaly', icon: ShieldAlert, badge: 'IsoForest' },
  { name: 'Network Graph', path: '/network', icon: Share2 },
  { name: 'AI Insights', path: '/insights', icon: Sparkles, badge: 'AI' },
  { name: 'Transaction Explorer', path: '/explorer', icon: Search },
  { name: 'Dataset Manager', path: '/dataset', icon: Database },
  { name: 'About Project', path: '/about', icon: Info },
];

export default function Sidebar({ onResetData, isResetting }) {
  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col border-r border-slate-200 bg-[#fbfbfb] min-h-[calc(100vh-4.5rem)]">
      {/* Navigation links */}
      <div className="flex-1 py-6 px-3.5 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-sans">
          Analytics &amp; Models
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-105" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-slate-200/70 text-slate-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Quick Tools */}
      <div className="p-4 border-t border-slate-200 space-y-2.5 bg-white">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center justify-between text-slate-700 text-[11px] font-semibold mb-1">
            <span>Model Preprocessing</span>
            <span className="text-purple-700 font-mono">RobustScaler</span>
          </div>
          <div className="text-[11px] text-slate-500 leading-relaxed">
            Unsupervised clustering on 9 multi-dimensional Bitcoin metrics.
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-1">
          <button
            onClick={onResetData}
            disabled={isResetting}
            className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            title="Reset to default synthetic Bitcoin dataset"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Reset Data'}</span>
          </button>

          <a
            href="/api/reports/export?format=json"
            download="cointrace_report.json"
            className="flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            title="Download JSON Report"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>
    </aside>
  );
}
