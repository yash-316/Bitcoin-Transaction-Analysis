import React, { useState, useEffect } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';
import {
  Layers,
  Play,
  Activity,
  Cpu,
  RefreshCw,
  GitBranch,
  Info,
  CheckCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import TransactionModal from '../components/TransactionModal';
import { api } from '../services/api';

const CLUSTER_COLORS = ['#8b5cf6', '#f97316', '#0284c7', '#e11d48', '#eab308', '#10b981', '#14b8a6', '#6366f1'];

export default function ClusteringAnalysis() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);

  // K-Means state
  const [kVal, setKVal] = useState(4);
  const [runningKMeans, setRunningKMeans] = useState(false);

  // DBSCAN state
  const [epsVal, setEpsVal] = useState(1.2);
  const [minSamplesVal, setMinSamplesVal] = useState(5);
  const [runningDBSCAN, setRunningDBSCAN] = useState(false);

  // Scatter color mode: 'kmeans' | 'dbscan' | 'anomaly'
  const [colorMode, setColorMode] = useState('kmeans');

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalysisResults();
      setData(res);
      if (res.kmeans?.n_clusters) {
        setKVal(res.kmeans.n_clusters);
      }
      if (res.dbscan?.eps) {
        setEpsVal(res.dbscan.eps);
      }
      if (res.dbscan?.min_samples) {
        setMinSamplesVal(res.dbscan.min_samples);
      }
    } catch (err) {
      console.error('Failed to load analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, []);

  const handleRunKMeans = async () => {
    try {
      setRunningKMeans(true);
      await api.updateKMeans(kVal);
      await loadAnalysis();
    } catch (err) {
      alert(err.message);
    } finally {
      setRunningKMeans(false);
    }
  };

  const handleRunDBSCAN = async () => {
    try {
      setRunningDBSCAN(true);
      await api.updateDBSCAN(epsVal, minSamplesVal);
      await loadAnalysis();
    } catch (err) {
      alert(err.message);
    } finally {
      setRunningDBSCAN(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-7 h-7 text-slate-800 animate-spin" />
        <p className="text-sm text-slate-500 font-sans">Evaluating clustering models &amp; computing PCA projection...</p>
      </div>
    );
  }

  const kmeans = data?.kmeans || {};
  const dbscan = data?.dbscan || {};
  const pcaStats = data?.pca_stats || {};
  const pcaPoints = data?.pca_points || [];
  const comparison = data?.comparison || {};
  const profiles = kmeans.profiles || [];

  const getPointColor = (point) => {
    if (colorMode === 'anomaly') {
      return point.is_anomaly ? '#e11d48' : '#10b981';
    }
    if (colorMode === 'dbscan') {
      if (point.cluster_dbscan === -1) return '#e11d48';
      return CLUSTER_COLORS[point.cluster_dbscan % CLUSTER_COLORS.length];
    }
    return CLUSTER_COLORS[point.cluster_kmeans % CLUSTER_COLORS.length];
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-[#7e1d52] mb-1">
            <span>Machine Learning Benchmark</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-slate-950 tracking-tight">
            Clustering &amp; Dimensionality Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Partition non-labeled Bitcoin transactions into coherent behavioral archetypes and isolate density corridors.
          </p>
        </div>

        {/* Color Projection Pill Bar */}
        <div className="inline-flex items-center bg-[#f3f4f6] p-1 rounded-full border border-slate-200/60">
          <span className="text-[11px] font-semibold text-slate-500 pl-3 pr-2">Projection:</span>
          <button
            onClick={() => setColorMode('kmeans')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
              colorMode === 'kmeans' ? 'bg-[#111111] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            K-Means
          </button>
          <button
            onClick={() => setColorMode('dbscan')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
              colorMode === 'dbscan' ? 'bg-[#111111] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            DBSCAN
          </button>
          <button
            onClick={() => setColorMode('anomaly')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
              colorMode === 'anomaly' ? 'bg-[#111111] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Anomalies
          </button>
        </div>
      </div>

      {/* Main PCA 2D Scatter Projection */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-purple-600" />
              <h3 className="font-serif text-xl font-normal text-slate-900">
                PCA 2D Dimensional Projection
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">
              High-dimensional transaction vector projected to 2 principal components. Click any point to inspect details.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              PC1: <strong>{pcaStats.pc1_variance}%</strong>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              PC2: <strong>{pcaStats.pc2_variance}%</strong>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
              Total: {pcaStats.total_variance}%
            </span>
          </div>
        </div>

        <div className="h-80 sm:h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                type="number"
                dataKey="pca_x"
                name="Principal Component 1"
                tick={{ fill: '#64748b', fontSize: 10 }}
              />
              <YAxis
                type="number"
                dataKey="pca_y"
                name="Principal Component 2"
                tick={{ fill: '#64748b', fontSize: 10 }}
              />
              <ZAxis range={[30, 45]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload;
                    return (
                      <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-lg text-xs space-y-1 font-sans">
                        <div className="font-mono font-semibold text-slate-900">{pt.transaction_id?.slice(0, 14)}...</div>
                        <div className="text-slate-600">Amount: <strong className="text-slate-900 font-mono">{pt.amount_btc} ₿</strong></div>
                        <div className="text-slate-600">K-Means: <strong className="text-purple-700">{pt.cluster_name || `Cluster ${pt.cluster_kmeans}`}</strong></div>
                        <div className="text-slate-600">DBSCAN: <strong className="text-slate-800">{pt.cluster_dbscan === -1 ? 'Noise (-1)' : `Cluster ${pt.cluster_dbscan}`}</strong></div>
                        <div className="text-slate-600">Anomaly: <strong className={pt.is_anomaly ? 'text-rose-600 font-bold' : 'text-emerald-600'}>{pt.is_anomaly ? 'Yes' : 'No'}</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                name="Transactions"
                data={pcaPoints}
                onClick={(pt) => setSelectedTx(pt)}
                className="cursor-pointer"
              >
                {pcaPoints.map((entry, index) => (
                  <Cell
                    key={`point-${index}`}
                    fill={getPointColor(entry)}
                    fillOpacity={0.8}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-100 text-xs font-sans">
          {colorMode === 'kmeans' && (
            profiles.map((p, i) => (
              <div key={i} className="flex items-center space-x-1.5">
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: CLUSTER_COLORS[p.cluster_id % CLUSTER_COLORS.length] }}
                />
                <span className="text-slate-700 font-medium">
                  {p.name} ({p.size})
                </span>
              </div>
            ))
          )}

          {colorMode === 'dbscan' && (
            <>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-500" />
                <span className="text-slate-700 font-medium">Noise Outliers (-1): {dbscan.noise_points}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-600" />
                <span className="text-slate-700 font-medium">Dense Clusters: {dbscan.n_clusters}</span>
              </div>
            </>
          )}

          {colorMode === 'anomaly' && (
            <>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span className="text-slate-700 font-medium">Normal Baseline</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-500" />
                <span className="text-slate-700 font-medium">Flagged Anomaly</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Model Controls: K-Means vs DBSCAN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* K-Means Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-purple-600" />
              <div>
                <h3 className="font-serif text-xl font-normal text-slate-900">K-Means Clustering</h3>
                <p className="text-xs text-slate-500 font-sans">Centroid-based partition optimization</p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {kmeans.execution_time_ms} ms
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-sans">
              <label className="text-slate-700 font-medium">Number of Clusters (k):</label>
              <span className="font-mono text-purple-700 font-bold text-sm">{kVal}</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              step="1"
              value={kVal}
              onChange={(e) => setKVal(Number(e.target.value))}
              className="w-full accent-[#111111] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>k=2</span>
              <span>k=4 (Default)</span>
              <span>k=6</span>
              <span>k=8</span>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-sans">
              <span className="text-slate-500">Silhouette Score:</span>
              <p className="text-lg font-bold font-mono text-purple-700 mt-0.5">
                {kmeans.silhouette_score ?? '0.0'}
              </p>
              <span className="text-[10px] text-slate-400">Separation quality &gt; 0.5 is strong</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-sans">
              <span className="text-slate-500">Inertia (WCSS):</span>
              <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                {kmeans.inertia?.toLocaleString() ?? '0'}
              </p>
              <span className="text-[10px] text-slate-400">Within-cluster sum of squares</span>
            </div>
          </div>

          <button
            onClick={handleRunKMeans}
            disabled={runningKMeans}
            className="w-full py-2.5 rounded-full font-semibold text-xs bg-[#111111] hover:bg-black text-white flex items-center justify-center space-x-2 transition disabled:opacity-50 shadow-sm"
          >
            <Play className={`w-3.5 h-3.5 ${runningKMeans ? 'animate-spin' : ''}`} />
            <span>{runningKMeans ? 'Recalculating Centroids...' : 'Re-cluster with K-Means'}</span>
          </button>
        </div>

        {/* DBSCAN Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-orange-500" />
              <div>
                <h3 className="font-serif text-xl font-normal text-slate-900">DBSCAN Density Clustering</h3>
                <p className="text-xs text-slate-500 font-sans">Arbitrary shape discovery &amp; noise mining</p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {dbscan.execution_time_ms} ms
            </span>
          </div>

          <div className="space-y-3 font-sans">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-700 font-medium">Epsilon (Radius &epsilon;):</label>
              <span className="font-mono text-orange-600 font-bold text-sm">{epsVal}</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.1"
              value={epsVal}
              onChange={(e) => setEpsVal(Number(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer"
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="text-slate-700 font-medium">Min Samples per Core:</label>
              <span className="font-mono text-orange-600 font-bold text-sm">{minSamplesVal}</span>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={minSamplesVal}
              onChange={(e) => setMinSamplesVal(Number(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer"
            />
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-sans">
              <span className="text-slate-500">Dense Clusters:</span>
              <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                {dbscan.n_clusters ?? '0'}
              </p>
              <span className="text-[10px] text-slate-400">Autonomous dense communities</span>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-sans">
              <span className="text-rose-700">Noise Outliers (-1):</span>
              <p className="text-lg font-bold font-mono text-rose-700 mt-0.5">
                {dbscan.noise_points ?? '0'} ({dbscan.noise_percentage}%)
              </p>
              <span className="text-[10px] text-rose-600">Sparse atypical transactions</span>
            </div>
          </div>

          <button
            onClick={handleRunDBSCAN}
            disabled={runningDBSCAN}
            className="w-full py-2.5 rounded-full font-semibold text-xs bg-[#111111] hover:bg-black text-white flex items-center justify-center space-x-2 transition disabled:opacity-50 shadow-sm"
          >
            <Play className={`w-3.5 h-3.5 ${runningDBSCAN ? 'animate-spin' : ''}`} />
            <span>{runningDBSCAN ? 'Mining Density Neighborhoods...' : 'Re-run DBSCAN'}</span>
          </button>
        </div>
      </div>

      {/* Cluster Archetype Profiles */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-slate-900" />
            <h3 className="font-serif text-xl font-normal text-slate-900">
              Cluster Behavioral Archetypes
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Multi-dimensional centroids converted back to natural Bitcoin metrics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {profiles.map((p) => (
            <div
              key={p.cluster_id}
              className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-semibold">
                  Cluster {p.cluster_id}
                </span>
                <span className="text-xs font-bold font-sans text-slate-900">
                  {p.percentage}% ({p.size})
                </span>
              </div>

              <div>
                <h4 className="font-serif text-lg font-normal text-slate-900">{p.name}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-sans">
                  {p.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block font-sans">Avg Amount:</span>
                  <strong className="text-slate-900">{p.avg_amount_btc} ₿</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans">Velocity:</span>
                  <strong className="text-slate-900">{p.avg_frequency} tx/hr</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans">Inputs:</span>
                  <strong className="text-slate-900">{p.avg_inputs}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans">Outputs:</span>
                  <strong className="text-slate-900">{p.avg_outputs}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Algorithm Benchmark Comparison Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-purple-600" />
            <h3 className="font-serif text-xl font-normal text-slate-900">
              Algorithm Benchmark &amp; Comparison
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Direct comparative evaluation of unsupervised methods on current dataset
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] bg-slate-50">
                <th className="py-3 px-3">Algorithm</th>
                <th className="py-3 px-3">Cluster Count</th>
                <th className="py-3 px-3">Noise Points</th>
                <th className="py-3 px-3">Silhouette Score</th>
                <th className="py-3 px-3">Execution Time</th>
                <th className="py-3 px-3">Forensic Application</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              <tr>
                <td className="py-3 px-3 font-bold text-purple-700 font-sans">K-Means</td>
                <td className="py-3 px-3 text-slate-900">{comparison.kmeans_clusters}</td>
                <td className="py-3 px-3 text-slate-500 font-sans">0 (Forces all points)</td>
                <td className="py-3 px-3 text-purple-700 font-bold">{comparison.kmeans_silhouette}</td>
                <td className="py-3 px-3 text-slate-700">{comparison.kmeans_exec_ms} ms</td>
                <td className="py-3 px-3 text-slate-600 font-sans">
                  Broad behavioral segmentation (Whales vs Exchanges vs Retail)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-orange-600 font-sans">DBSCAN</td>
                <td className="py-3 px-3 text-slate-900">{comparison.dbscan_clusters}</td>
                <td className="py-3 px-3 text-rose-600 font-bold">{comparison.dbscan_noise}</td>
                <td className="py-3 px-3 text-orange-600 font-bold">{comparison.dbscan_silhouette}</td>
                <td className="py-3 px-3 text-slate-700">{comparison.dbscan_exec_ms} ms</td>
                <td className="py-3 px-3 text-slate-600 font-sans">
                  Discovering non-linear communities &amp; isolating peeling chains as noise
                </td>
              </tr>
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
