import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Share2, Menu, X, ArrowUpRight } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Clustering', path: '/clustering' },
    { name: 'Anomalies', path: '/anomaly' },
    { name: 'Network', path: '/network' },
    { name: 'AI Insights', path: '/insights' },
    { name: 'Explorer', path: '/explorer' },
    { name: 'Dataset', path: '/dataset' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 h-18 py-3.5 flex items-center justify-between">
        {/* Logo - Black Pill as seen in reference */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="inline-flex items-center space-x-2 bg-[#111111] text-white px-4 py-2 rounded-full hover:bg-black transition-colors duration-200 shadow-sm">
            <span className="text-sm font-mono text-cyan-400 font-bold">❖</span>
            <span className="font-semibold text-sm tracking-tight">CoinTrace</span>
          </div>
        </Link>

        {/* Center Pill Navigation Container */}
        <nav className="hidden lg:flex items-center bg-[#f3f4f6] p-1 rounded-full border border-slate-200/60">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-1.5 rounded-full text-xs transition-all duration-150 ${
                  isActive
                    ? 'bg-[#111111] text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center space-x-2">
          {/* Plum Accent Badge Pill */}
          <Link
            to="/insights"
            className="inline-flex items-center space-x-1.5 bg-[#7e1d52] hover:bg-[#701a45] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-colors"
          >
            <span>Benchmark v1.0</span>
          </Link>

          {/* Black Primary Action Button */}
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-1.5 bg-[#111111] hover:bg-black text-white px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-colors"
          >
            <span>Dashboard</span>
          </Link>

          {/* Icon Buttons (Search & Share) */}
          <Link
            to="/explorer"
            className="p-2 rounded-full bg-[#f3f4f6] hover:bg-slate-200 text-slate-700 transition"
            title="Search Transactions"
          >
            <Search className="w-4 h-4" />
          </Link>

          <a
            href="/api/reports/export?format=json"
            download="cointrace_report.json"
            className="p-2 rounded-full bg-[#f3f4f6] hover:bg-slate-200 text-slate-700 transition"
            title="Export Report"
          >
            <Share2 className="w-4 h-4" />
          </a>
        </div>

        {/* Mobile Hamburger */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-black focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3.5 py-2 rounded-xl text-sm ${
                location.pathname === link.path
                  ? 'bg-[#111111] text-white font-medium'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
