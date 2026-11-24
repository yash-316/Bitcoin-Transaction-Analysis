import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Shield,
  Layers,
  Share2,
  Cpu,
  Sparkles,
  TrendingUp,
  Database,
  CheckCircle2,
  Search,
  Sliders,
  BarChart2
} from 'lucide-react';

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Patterns' },
    { id: 'whales', label: 'Whale Settlements' },
    { id: 'exchanges', label: 'Exchange Sweeps' },
    { id: 'retail', label: 'Retail P2P' },
    { id: 'anomalies', label: 'Anomaly Triage' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-hidden">
      {/* Hero Section matching artificialanalysis.ai */}
      <section className="pt-14 pb-12 sm:pt-16 sm:pb-16 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 w-full max-w-[1850px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Big Editorial Serif Headline & Subtitle */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-6">
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[5.2rem] font-normal text-slate-950 leading-[1.04] tracking-tight">
              Independent<br />analysis of Bitcoin
            </h1>

            <p className="text-slate-600 text-lg sm:text-xl font-sans max-w-3xl leading-relaxed">
              Understand the Bitcoin transaction landscape to choose the best clustering model and identify suspicious fund movements
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-2 bg-[#111111] hover:bg-black text-white px-6 py-3 rounded-full text-sm font-semibold shadow-sm transition-all hover:scale-[1.01]"
              >
                <span>Explore Benchmark</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/clustering"
                className="inline-flex items-center space-x-2 bg-[#f3f4f6] hover:bg-slate-200 text-slate-800 px-6 py-3 rounded-full text-sm font-semibold transition"
              >
                <span>Clustering Models</span>
              </Link>

              <Link
                to="/network"
                className="inline-flex items-center space-x-2 bg-[#f3f4f6] hover:bg-slate-200 text-slate-800 px-6 py-3 rounded-full text-sm font-semibold transition"
              >
                <span>Network Graph</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Stacked Editorial UPDATE Cards */}
          <div className="lg:col-span-4 xl:col-span-4 space-y-6 lg:border-l lg:border-slate-200 lg:pl-10 pt-2">
            {/* Update Card 1 */}
            <div className="group space-y-1.5 pb-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold tracking-wider text-[#7e1d52] uppercase">
                  Update
                </span>
                <Link to="/clustering" className="text-slate-400 group-hover:text-black transition">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              <h3 className="font-semibold text-slate-900 text-sm tracking-tight group-hover:text-[#7e1d52] transition">
                Clustering Benchmark v1.0
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                K-Means &amp; DBSCAN evaluated with silhouette score of 0.7496 across 1,200 multi-dimensional Bitcoin records.
              </p>
            </div>

            {/* Update Card 2 */}
            <div className="group space-y-1.5 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold tracking-wider text-[#7e1d52] uppercase">
                  Update
                </span>
                <Link to="/anomaly" className="text-slate-400 group-hover:text-black transition">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              <h3 className="font-semibold text-slate-900 text-sm tracking-tight group-hover:text-[#7e1d52] transition">
                Isolation Forest Triage
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Unsupervised outlier isolation detecting high-frequency peeling chains, dusting bursts, and abnormal volume.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pill-shaped Category Switcher Bar matching screenshot */}
      <section className="px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 w-full max-w-[1850px] mx-auto pb-8">
        <div className="inline-flex items-center bg-[#f3f4f6] p-1 rounded-full border border-slate-200/60 overflow-x-auto max-w-full">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-[#111111] text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Key Metric & Benchmark Cards matching the swatch style */}
      <section className="px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 w-full max-w-[1850px] mx-auto pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {/* Card 1: Purple Swatch - Whale Settlements */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-7 xl:p-8 shadow-sm hover:border-slate-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between min-h-[530px] group">
            <div>
              {/* Header */}
              <div className="flex items-center space-x-2.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-purple-600 flex-shrink-0" />
                <h3 className="font-serif text-2xl font-normal text-slate-900 tracking-tight">
                  Whale Settlements
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-sans">
                Volume Archetype Elo · Higher is better
              </p>

              {/* Primary Stat */}
              <div className="mt-5 flex items-baseline justify-between">
                <span className="text-4xl font-semibold text-slate-900 font-sans tracking-tight">14.0%</span>
                <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  168 Records · 142.5 ₿ avg
                </span>
              </div>

              {/* Benchmark Visualizer Bars */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Transaction Spectrum Benchmark
                </div>

                {/* Sub-item 1 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-slate-800 font-medium">OTC Desk &gt;500 ₿</span>
                    <span className="font-mono text-slate-500">1,280 Elo · 78 txs</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-sm overflow-hidden relative">
                    <div className="h-full bg-purple-600 rounded-sm" style={{ width: '92%' }} />
                    <div className="absolute top-0 bottom-0 right-[8%] w-0.5 bg-purple-800/60" />
                  </div>
                </div>

                {/* Sub-item 2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-slate-800 font-medium">Custody Relocation 100-500 ₿</span>
                    <span className="font-mono text-slate-500">1,195 Elo · 54 txs</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-sm overflow-hidden relative">
                    <div className="h-full bg-purple-500/85 rounded-sm" style={{ width: '74%' }} />
                    <div className="absolute top-0 bottom-0 right-[26%] w-0.5 bg-purple-800/60" />
                  </div>
                </div>

                {/* Sub-item 3 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-slate-800 font-medium">Treasury Rebalance 50-100 ₿</span>
                    <span className="font-mono text-slate-500">1,110 Elo · 36 txs</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-sm overflow-hidden relative">
                    <div className="h-full bg-purple-400/80 rounded-sm" style={{ width: '56%' }} />
                    <div className="absolute top-0 bottom-0 right-[44%] w-0.5 bg-purple-800/60" />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Characteristics */}
            <div className="pt-5 mt-6 border-t border-slate-100">
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono text-slate-600 mb-3 bg-slate-50 py-2 px-1 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">AVG IN</span>
                  <span className="font-bold text-slate-900">1.2</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">AVG OUT</span>
                  <span className="font-bold text-slate-900">2.1</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">FEE RATE</span>
                  <span className="font-bold text-slate-900">18 sat/vB</span>
                </div>
              </div>
              <Link
                to="/clustering"
                className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center justify-between group-hover:translate-x-0.5 transition-transform"
              >
                <span>Analyze Whale Centroids</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Orange Swatch - Exchange Sweeps */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-7 xl:p-8 shadow-sm hover:border-slate-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between min-h-[530px] group">
            <div>
              {/* Header */}
              <div className="flex items-center space-x-2.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-orange-500 flex-shrink-0" />
                <h3 className="font-serif text-2xl font-normal text-slate-900 tracking-tight">
                  Exchange Sweeps
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-sans">
                Fan-in Consolidation Index · Higher is better
              </p>

              {/* Primary Stat */}
              <div className="mt-5 flex items-baseline justify-between">
                <span className="text-4xl font-semibold text-slate-900 font-sans tracking-tight">24.0%</span>
                <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  288 Records · 12.4 ₿ avg
                </span>
              </div>

              {/* Benchmark Visualizer Bars */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Aggregation Fan-In Distribution
                </div>

                {/* Sub-item 1 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-slate-800 font-medium">Hot Wallet Consolidation (&gt;10 in)</span>
                    <span className="font-mono text-slate-500">96.4 Index · 142 txs</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-sm overflow-hidden relative">
                    <div className="h-full bg-orange-500 rounded-sm" style={{ width: '90%' }} />
                    <div className="absolute top-0 bottom-0 right-[10%] w-0.5 bg-orange-700/60" />
                  </div>
                </div>

                {/* Sub-item 2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-slate-800 font-medium">Batch Withdrawal Pipelines</span>
                    <span className="font-mono text-slate-500">84.1 Index · 86 txs</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-sm overflow-hidden relative">
                    <div className="h-full bg-orange-400/85 rounded-sm" style={{ width: '68%' }} />
                    <div className="absolute top-0 bottom-0 right-[32%] w-0.5 bg-orange-700/60" />
                  </div>
                </div>

                {/* Sub-item 3 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-slate-800 font-medium">Arbitrage Vault Transit</span>
                    <span className="font-mono text-slate-500">68.5 Index · 60 txs</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-sm overflow-hidden relative">
                    <div className="h-full bg-orange-300/80 rounded-sm" style={{ width: '50%' }} />
                    <div className="absolute top-0 bottom-0 right-[50%] w-0.5 bg-orange-700/60" />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Characteristics */}
            <div className="pt-5 mt-6 border-t border-slate-100">
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono text-slate-600 mb-3 bg-slate-50 py-2 px-1 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">AVG IN</span>
                  <span className="font-bold text-slate-900">8.6</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">AVG OUT</span>
                  <span className="font-bold text-slate-900">1.8</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">FEE RATE</span>
                  <span className="font-bold text-slate-900">46 sat/vB</span>
                </div>
              </div>
              <Link
                to="/clustering"
                className="text-xs font-semibold text-orange-700 hover:text-orange-900 flex items-center justify-between group-hover:translate-x-0.5 transition-transform"
              >
                <span>Inspect Sweeping Corridors</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Yellow Swatch - Retail P2P Payments */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-7 xl:p-8 shadow-sm hover:border-slate-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between min-h-[530px] group">
            <div>
              {/* Header */}
              <div className="flex items-center space-x-2.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-amber-400 flex-shrink-0" />
                <h3 className="font-serif text-2xl font-normal text-slate-900 tracking-tight">
                  Retail P2P Payments
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-sans">
                Script Standardness Elo · Higher is better
              </p>

              {/* Primary Stat */}
              <div className="mt-5 flex items-baseline justify-between">
                <span className="text-4xl font-semibold text-slate-900 font-sans tracking-tight">46.0%</span>
                <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  552 Records · 0.084 ₿ med
                </span>
              </div>

              {/* Benchmark Visualizer Bars */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Script Standard &amp; Address Type
                </div>

                {/* Sub-item 1 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-slate-800 font-medium">Native SegWit (bc1q / P2WPKH)</span>
                    <span className="font-mono text-slate-500">1,240 Elo · 464 txs</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-sm overflow-hidden relative">
                    <div className="h-full bg-amber-400 rounded-sm" style={{ width: '84%' }} />
                    <div className="absolute top-0 bottom-0 right-[16%] w-0.5 bg-amber-600/60" />
                  </div>
                </div>

                {/* Sub-item 2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-slate-800 font-medium">Taproot Key-Path (bc1p / P2TR)</span>
                    <span className="font-mono text-slate-500">1,175 Elo · 287 txs</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-sm overflow-hidden relative">
                    <div className="h-full bg-amber-300 rounded-sm" style={{ width: '62%' }} />
                    <div className="absolute top-0 bottom-0 right-[38%] w-0.5 bg-amber-600/60" />
                  </div>
                </div>

                {/* Sub-item 3 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-slate-800 font-medium">Legacy &amp; Nested SegWit (1/3)</span>
                    <span className="font-mono text-slate-500">980 Elo · 154 txs</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-sm overflow-hidden relative">
                    <div className="h-full bg-amber-200/90 rounded-sm" style={{ width: '38%' }} />
                    <div className="absolute top-0 bottom-0 right-[62%] w-0.5 bg-amber-600/60" />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Characteristics */}
            <div className="pt-5 mt-6 border-t border-slate-100">
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono text-slate-600 mb-3 bg-slate-50 py-2 px-1 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">AVG IN</span>
                  <span className="font-bold text-slate-900">1.4</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">AVG OUT</span>
                  <span className="font-bold text-slate-900">2.0</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">FEE RATE</span>
                  <span className="font-bold text-slate-900">12 sat/vB</span>
                </div>
              </div>
              <Link
                to="/clustering"
                className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center justify-between group-hover:translate-x-0.5 transition-transform"
              >
                <span>View P2P Retail Baseline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 4: Rose Swatch - Anomaly Triage */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-7 xl:p-8 shadow-sm hover:border-slate-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between min-h-[530px] group">
            <div>
              {/* Header */}
              <div className="flex items-center space-x-2.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-rose-500 flex-shrink-0" />
                <h3 className="font-serif text-2xl font-normal text-slate-900 tracking-tight">
                  Anomaly Triage
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-sans">
                Isolation Forest Deviation · Higher outlier is worse
              </p>

              {/* Primary Stat */}
              <div className="mt-5 flex items-baseline justify-between">
                <span className="text-4xl font-semibold text-rose-600 font-sans tracking-tight">5.0%</span>
                <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  60 Flagged · -0.284 avg
                </span>
              </div>

              {/* Benchmark Visualizer Bars */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Suspicious Fingerprint Severity
                </div>

                {/* Sub-item 1 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-slate-800 font-medium">Rapid Peeling Chains (Velocity Hop)</span>
                    <span className="font-mono text-rose-600">-0.362 Dev · 24 cases</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-sm overflow-hidden relative">
                    <div className="h-full bg-rose-600 rounded-sm" style={{ width: '88%' }} />
                    <div className="absolute top-0 bottom-0 right-[12%] w-0.5 bg-rose-800/60" />
                  </div>
                </div>

                {/* Sub-item 2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-slate-800 font-medium">Dusting Attack Address Dispersal</span>
                    <span className="font-mono text-rose-600">-0.288 Dev · 19 cases</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-sm overflow-hidden relative">
                    <div className="h-full bg-rose-500/85 rounded-sm" style={{ width: '66%' }} />
                    <div className="absolute top-0 bottom-0 right-[34%] w-0.5 bg-rose-800/60" />
                  </div>
                </div>

                {/* Sub-item 3 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-slate-800 font-medium">Multi-hop Mixing / Tumbling</span>
                    <span className="font-mono text-rose-600">-0.214 Dev · 17 cases</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-sm overflow-hidden relative">
                    <div className="h-full bg-rose-400/80 rounded-sm" style={{ width: '48%' }} />
                    <div className="absolute top-0 bottom-0 right-[52%] w-0.5 bg-rose-800/60" />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Characteristics */}
            <div className="pt-5 mt-6 border-t border-slate-100">
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono text-slate-600 mb-3 bg-rose-50/60 py-2 px-1 rounded-lg border border-rose-100">
                <div>
                  <span className="text-rose-400 block text-[10px]">RISK</span>
                  <span className="font-bold text-rose-700">CRITICAL</span>
                </div>
                <div>
                  <span className="text-rose-400 block text-[10px]">SPLITS</span>
                  <span className="font-bold text-rose-700">4.2 avg</span>
                </div>
                <div>
                  <span className="text-rose-400 block text-[10px]">ENTROPY</span>
                  <span className="font-bold text-rose-700">0.94</span>
                </div>
              </div>
              <Link
                to="/anomaly"
                className="text-xs font-semibold text-rose-700 hover:text-rose-900 flex items-center justify-between group-hover:translate-x-0.5 transition-transform"
              >
                <span>Triage Outlier Transactions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Forensic Research Capabilities Section */}
      <section className="bg-slate-50 border-t border-b border-slate-200/80 py-20 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="w-full max-w-[1850px] mx-auto">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7e1d52]">
              Methodology &amp; Unsupervised Models
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-normal text-slate-900 mt-2 tracking-tight">
              Designed for Rigorous Blockchain Forensics
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base font-sans leading-relaxed">
              Without needing labeled illicit datasets, CoinTrace identifies communities, measures topological density, and isolates multi-dimensional outliers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-sm bg-purple-600" />
                <h3 className="font-serif text-xl font-normal text-slate-900">K-Means Pattern Clustering</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Segments non-labeled transactions into centroid archetypes by minimizing within-cluster variance across 9 behavioral dimensions.
              </p>
              <div className="pt-2 text-xs font-semibold text-slate-900 flex items-center gap-1">
                <Link to="/clustering" className="hover:underline flex items-center gap-1">
                  Analyze Centroids <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-sm bg-blue-600" />
                <h3 className="font-serif text-xl font-normal text-slate-900">DBSCAN Density Corridors</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Detects arbitrarily-shaped transaction flows using density reachability radius &epsilon; and flags non-conforming mixing trails as noise (-1).
              </p>
              <div className="pt-2 text-xs font-semibold text-slate-900 flex items-center gap-1">
                <Link to="/clustering" className="hover:underline flex items-center gap-1">
                  Inspect Density Corridors <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-sm bg-rose-500" />
                <h3 className="font-serif text-xl font-normal text-slate-900">Isolation Forest Anomaly Triage</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Constructs random decision trees; anomalies require fewer splits to isolate, providing explainable multivariate deviation indicators.
              </p>
              <div className="pt-2 text-xs font-semibold text-slate-900 flex items-center gap-1">
                <Link to="/anomaly" className="hover:underline flex items-center gap-1">
                  View Anomaly Scores <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 w-full max-w-[1850px] mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 border-t border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-900">❖ CoinTrace</span>
          <span>&mdash; Independent Analysis of Bitcoin Transaction Patterns</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="hover:text-black">Dashboard</Link>
          <Link to="/clustering" className="hover:text-black">Clustering</Link>
          <Link to="/about" className="hover:text-black">Methodology</Link>
        </div>
      </footer>
    </div>
  );
}
