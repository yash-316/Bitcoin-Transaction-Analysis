import React from 'react';
import {
  Info,
  Shield,
  Layers,
  Cpu,
  GitBranch,
  BookOpen,
  Code2,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function AboutProject() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Editorial Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-[#7e1d52] mb-1">
          <span>Academic &amp; Forensic Research</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-slate-950 tracking-tight">
          About CoinTrace
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-sans">
          Independent Analysis of Bitcoin Transaction Pattern Clustering &amp; Anomaly Detection
        </p>
      </div>

      {/* Problem Statement Card */}
      <div className="bg-white border-l-4 border-l-[#7e1d52] border-y border-r border-slate-200/90 rounded-2xl p-7 shadow-sm space-y-3">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7e1d52]">
          Problem Statement
        </span>
        <blockquote className="font-serif text-2xl sm:text-3xl font-normal text-slate-900 leading-snug">
          &ldquo;Bitcoin&apos;s pseudonymous design allows illicit funds to move through multiple addresses,
          making it difficult to identify suspicious transaction patterns and trace fund movements.&rdquo;
        </blockquote>
        <p className="text-xs text-slate-600 leading-relaxed font-sans pt-1">
          Traditional signature-based surveillance fails when illicit actors utilize mixing pools, peel chains,
          and tumbling operations across fresh addresses. Because public blockchains lack ground-truth forensic labels,
          <strong> unsupervised machine learning</strong> provides the ideal framework to partition transaction spaces
          and detect mathematical outliers without requiring pre-labeled training data.
        </p>
      </div>

      {/* Tech Stack Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-purple-600" />
            <h3 className="font-serif text-xl font-normal text-slate-900">Full-Stack Tech Architecture</h3>
          </div>
          <div className="space-y-2 text-xs font-sans">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Frontend:</span>
              <span className="font-mono text-slate-900 font-semibold">React (Vite) + Tailwind CSS</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Visualizations:</span>
              <span className="font-mono text-purple-700 font-semibold">Recharts + Canvas Graph</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Backend API:</span>
              <span className="font-mono text-slate-900 font-semibold">Python FastAPI + Uvicorn</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Data Engine:</span>
              <span className="font-mono text-slate-900 font-semibold">Pandas, NumPy, SQLite</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-orange-500" />
            <h3 className="font-serif text-xl font-normal text-slate-900">Machine Learning Pipeline</h3>
          </div>
          <div className="space-y-2 text-xs font-sans">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Scaling:</span>
              <span className="font-mono text-purple-700 font-semibold">RobustScaler (IQR Quantiles)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Clustering:</span>
              <span className="font-mono text-slate-900 font-semibold">K-Means (k=2..8) &bull; DBSCAN</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Dimensionality:</span>
              <span className="font-mono text-slate-900 font-semibold">PCA 2D (&gt;95% Variance)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Anomaly Detection:</span>
              <span className="font-mono text-rose-600 font-semibold">Isolation Forest Trees</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Engineering Methodology */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 rounded-sm bg-slate-900" />
          <h3 className="font-serif text-xl font-normal text-slate-900">Feature Engineering Methodology</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-sans">
          To maintain strict unsupervised integrity, non-numeric identifiers (transaction hashes, wallet strings)
          are completely excluded from the mathematical feature matrix. Instead, the models operate across 9 engineered
          behavioral dimensions:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1 font-sans">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-600" />
              <span className="font-bold text-slate-900">Volume &amp; Fees</span>
            </div>
            <ul className="text-slate-600 space-y-1 text-[11px]">
              <li>&bull; <code className="text-slate-900 font-mono">amount_btc</code>: Total transacted value</li>
              <li>&bull; <code className="text-slate-900 font-mono">fee_btc</code>: Miner priority incentive</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
              <span className="font-bold text-slate-900">Graph Topology</span>
            </div>
            <ul className="text-slate-600 space-y-1 text-[11px]">
              <li>&bull; <code className="text-slate-900 font-mono">input_count</code>: Consolidation degree</li>
              <li>&bull; <code className="text-slate-900 font-mono">output_count</code>: Fan-out dispersion</li>
              <li>&bull; <code className="text-slate-900 font-mono">in_degree / out_degree</code>: Graph edges</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
              <span className="font-bold text-slate-900">Activity &amp; Velocity</span>
            </div>
            <ul className="text-slate-600 space-y-1 text-[11px]">
              <li>&bull; <code className="text-slate-900 font-mono">transaction_frequency</code>: Velocity rate</li>
              <li>&bull; <code className="text-slate-900 font-mono">unique_counterparties</code>: Counterparty exposure</li>
              <li>&bull; <code className="text-slate-900 font-mono">wallet_activity_score</code>: Intensity index</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Forensic Disclaimer */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2 font-sans">
        <div className="flex items-center space-x-2 text-slate-900 font-semibold">
          <Shield className="w-4 h-4 text-[#7e1d52]" />
          <span>Academic &amp; Ethical Research Disclaimer</span>
        </div>
        <p className="leading-relaxed">
          This system is an academic implementation for portfolio demonstration and university evaluation.
          Statistical anomaly indicators produced by unsupervised clustering models identify unusual multivariate
          patterns in transaction topologies; they <strong>never constitute conclusive evidence or legal proof</strong> of
          criminal, fraudulent, or sanctioned activity without independent evidentiary verification.
        </p>
      </div>
    </div>
  );
}
