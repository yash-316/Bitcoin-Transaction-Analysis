import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Play,
  Activity,
  Cpu,
  Info,
  TrendingUp,
  Download,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import StatCard from '../components/StatCard';
import TransactionModal from '../components/TransactionModal';
import { api } from '../services/api';

export default function AnomalyDetection() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [topAnomalies, setTopAnomalies] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [contamination, setContamination] = useState(0.05);
  const [running, setRunning] = useState(false);

  const loadAnomalies = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalysisResults();
      setData(res);
      if (res.isolation_forest?.contamination) {
        setContamination(res.isolation_forest.contamination);
      }
      const anomalies = (res.pca_points || [])
        .filter((p) => p.is_anomaly)
        .sort((a, b) => (b.anomaly_score ?? 0) - (a.anomaly_score ?? 0));
      setTopAnomalies(anomalies);
    } catch (err) {
      console.error('Failed to load anomalies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnomalies();
  }, []);

  const handleTuneContamination = async () => {
    try {
      setRunning(true);
      const res = await api.updateAnomalyDetection(contamination);
      setTopAnomalies(res.top_anomalies || []);
      const fullRes = await api.getAnalysisResults();
      setData(fullRes);
    } catch (err) {
      alert(err.message);
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-7 h-7 text-slate-800 animate-spin" />
        <p className="text-sm text-slate-500 font-sans">Evaluating Isolation Forest anomaly trees...</p>
      </div>
    );
  }

  const iso = data?.isolation_forest || {};
  const totalAnomalies = iso.total_anomalies || topAnomalies.length;
  const anomalyPct = iso.anomaly_percentage || '5.0';

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-[#7e1d52] mb-1">
            <span>Forensic Triage Benchmark</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-slate-950 tracking-tight">
            Isolation Forest Anomaly Detection
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Detect irregular Bitcoin transaction patterns that mathematically deviate from standard network baselines.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-semibold px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            Flagged: {totalAnomalies} ({anomalyPct}%)
          </span>
        </div>
      </div>

      {/* Forensic Disclaimer Banner */}
      <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-amber-900 text-xs flex items-start space-x-3.5 shadow-sm">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 font-sans">
          <strong className="text-amber-950 font-semibold text-sm block">
            Important Forensic Analytics Notice
          </strong>
          <p className="leading-relaxed text-amber-800">
            An anomaly flag is a mathematical indicator of multivariate deviation (such as sudden velocity bursts,
            massive fan-out distributions, or extreme BTC volume spikes) and <strong>is not proof of criminal or illicit activity</strong>.
            CoinTrace models highlight non-standard behavioral patterns for operational triage and regulatory review.
          </p>
        </div>
      </div>

      {/* Contamination Tuning & Algorithm Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contamination Slider Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-rose-500" />
              <div>
                <h3 className="font-serif text-xl font-normal text-slate-900">Isolation Forest Parameters</h3>
                <p className="text-xs text-slate-500 font-sans">Tree partition sensitivity</p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {iso.execution_time_ms ?? 12} ms
            </span>
          </div>

          <div className="space-y-3 font-sans">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-700 font-medium">Contamination Rate (&nu;):</label>
              <span className="font-mono text-rose-600 font-bold text-sm">
                {(contamination * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.15"
              step="0.01"
              value={contamination}
              onChange={(e) => setContamination(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1% (Strict)</span>
              <span>5% (Balanced)</span>
              <span>15% (Sensitive)</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            Contamination specifies the expected proportion of outliers in the dataset. Isolation Forest constructs 100
            random decision trees; anomalies require significantly fewer path splits to be isolated.
          </p>

          <button
            onClick={handleTuneContamination}
            disabled={running}
            className="w-full py-2.5 rounded-full font-semibold text-xs bg-[#111111] hover:bg-black text-white flex items-center justify-center space-x-2 transition disabled:opacity-50 shadow-sm"
          >
            <Play className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
            <span>{running ? 'Re-scoring Ensemble Trees...' : 'Re-run Anomaly Isolation'}</span>
          </button>
        </div>

        {/* Behavioral Explanation Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-purple-600" />
              <div>
                <h3 className="font-serif text-xl font-normal text-slate-900">How Outliers are Triaged</h3>
                <p className="text-xs text-slate-500 font-sans">Multi-feature contribution breakdown</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
                <span className="text-[11px] font-sans font-semibold text-slate-900 uppercase">Velocity Bursts</span>
              </div>
              <p className="text-xs text-slate-500 font-sans mt-1">
                Transactions with frequency &gt;3 standard deviations above normal peer-to-peer behavior.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
                <span className="text-[11px] font-sans font-semibold text-slate-900 uppercase">Fan-Out Dispersion</span>
              </div>
              <p className="text-xs text-slate-500 font-sans mt-1">
                Unusual output counts (&gt;25 outputs per tx) characteristic of dusting attacks or peeling chain hops.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                <span className="text-[11px] font-sans font-semibold text-slate-900 uppercase">Volume Outliers</span>
              </div>
              <p className="text-xs text-slate-500 font-sans mt-1">
                Extreme value transfers (&gt;50 ₿) that deviate sharply from the median transaction size.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-sans leading-relaxed">
            <strong className="text-slate-900">Explainability Engine:</strong> Each flagged transaction receives a computed
            normalized anomaly score from 0.0 to 1.0 (where scores &gt; 0.65 represent high statistical deviation), alongside
            specific human-readable z-score explanations for investigator triage.
          </div>
        </div>
      </div>

      {/* Top Flagged Anomalies Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-rose-500" />
              <h3 className="font-serif text-xl font-normal text-slate-900">
                Top Suspicious Pattern Leads
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">
              Ranked by normalized Isolation Forest anomaly score
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Showing top {topAnomalies.length} anomalous records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] bg-slate-50">
                <th className="py-3 px-3">Transaction ID</th>
                <th className="py-3 px-3">Sender Address</th>
                <th className="py-3 px-3">Receiver Address</th>
                <th className="py-3 px-3 text-right">Amount (BTC)</th>
                <th className="py-3 px-3 text-center">Score</th>
                <th className="py-3 px-3">Primary Anomaly Reason</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {topAnomalies.map((tx) => (
                <tr
                  key={tx.transaction_id}
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-semibold text-slate-900 truncate max-w-[130px]">
                    {tx.transaction_id.slice(0, 10)}...{tx.transaction_id.slice(-6)}
                  </td>
                  <td className="py-3 px-3 text-slate-500 truncate max-w-[120px]">
                    {tx.sender_address.slice(0, 8)}...
                  </td>
                  <td className="py-3 px-3 text-slate-500 truncate max-w-[120px]">
                    {tx.receiver_address.slice(0, 8)}...
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    {Number(tx.amount_btc).toFixed(4)} ₿
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-rose-50 border border-rose-200 text-rose-700">
                      {Number(tx.anomaly_score ?? 0).toFixed(4)}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-700 text-[11px]">
                    {tx.anomaly_explanation || 'Multivariate deviation across input/output features.'}
                  </td>
                  <td className="py-3 px-3 text-center font-sans">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Modal Detail */}
      <TransactionModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
}
