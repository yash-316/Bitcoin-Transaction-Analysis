import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Activity,
  Layers,
  ShieldAlert,
  Wallet,
  Coins,
  TrendingUp,
  Download,
  ExternalLink,
  RefreshCw,
  FileSpreadsheet,
  ArrowUpRight
} from 'lucide-react';
import StatCard from '../components/StatCard';
import GlassCard from '../components/GlassCard';
import TransactionModal from '../components/TransactionModal';
import { api } from '../services/api';

const CLUSTER_COLORS = ['#8b5cf6', '#f97316', '#0284c7', '#e11d48', '#eab308', '#10b981'];

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboardStats();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-7 h-7 text-slate-800 animate-spin" />
        <p className="text-sm text-slate-500 font-sans">Evaluating unsupervised transaction models...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
          {error}
        </div>
        <button
          onClick={loadStats}
          className="px-5 py-2 rounded-full text-xs font-semibold bg-[#111111] text-white"
        >
          Retry Load
        </button>
      </div>
    );
  }

  const stats = data?.stats || {};
  const volumeData = data?.volume_over_time || [];
  const clusterData = data?.cluster_distribution || [];
  const valueData = data?.value_distribution || [];
  const anomalySummary = data?.anomaly_summary || {};
  const recentTransactions = data?.recent_transactions || [];

  const pieAnomalyData = [
    { name: 'Normal Baseline', value: anomalySummary.normal || 0, color: '#10b981' },
    { name: 'Flagged Anomalies', value: anomalySummary.anomaly || 0, color: '#e11d48' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-[#7e1d52] mb-1">
            <span>Blockchain Analytics Benchmark</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-slate-950 tracking-tight">
            Transaction Pattern Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Unsupervised evaluation across {stats.total_transactions?.toLocaleString()} Bitcoin transaction records.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={loadStats}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Refresh Analysis"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <a
            href={api.getExportReportUrl('csv')}
            download="cointrace_dataset.csv"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </a>

          <a
            href={api.getExportReportUrl('json')}
            download="cointrace_report.json"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#111111] hover:bg-black text-white shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </a>
        </div>
      </div>

      {/* Pill Category Switcher */}
      <div className="inline-flex items-center bg-[#f3f4f6] p-1 rounded-full border border-slate-200/60 overflow-x-auto max-w-full">
        {['All Patterns', 'Whale Settlements', 'Exchange Sweeps', 'Retail P2P', 'Anomaly Triage'].map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedCategory(tab.toLowerCase())}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
              selectedCategory === tab.toLowerCase() || (idx === 0 && selectedCategory === 'all')
                ? 'bg-[#111111] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stat Cards with Color Swatches */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Transactions"
          value={stats.total_transactions?.toLocaleString()}
          subtitle="Evaluated records"
          color="purple"
        />
        <StatCard
          title="Unique Wallets"
          value={stats.unique_addresses?.toLocaleString()}
          subtitle="Graph address nodes"
          color="blue"
        />
        <StatCard
          title="Detected Clusters"
          value={stats.detected_clusters}
          subtitle="K-Means archetypes"
          color="cyan"
        />
        <StatCard
          title="Suspicious Patterns"
          value={stats.suspicious_patterns}
          subtitle="Outlier scored"
          color="rose"
        />
        <StatCard
          title="Anomaly Rate"
          value={`${stats.anomaly_percentage}%`}
          subtitle="Multivariate ratio"
          color="orange"
        />
        <StatCard
          title="Transacted Volume"
          value={`${stats.total_volume_btc?.toLocaleString()} ₿`}
          subtitle={`Avg: ${stats.avg_amount_btc} ₿`}
          color="yellow"
        />
      </div>

      {/* Main Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Volume Over Time */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-sm bg-blue-600" />
                <h3 className="font-serif text-xl font-normal text-slate-900">
                  Transaction Volume Over Time
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">
                Daily aggregate transacted Bitcoin across evaluated temporal window
              </p>
            </div>
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              BTC Daily Sum
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="btcVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={(val) => val.slice(5)}
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  }}
                  itemStyle={{ color: '#2563eb' }}
                />
                <Area
                  type="monotone"
                  dataKey="volume_btc"
                  name="Volume (BTC)"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#btcVolumeGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cluster Distribution Donut */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-sm bg-purple-600" />
                <h3 className="font-serif text-xl font-normal text-slate-900">
                  Cluster Archetypes
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">
                K-Means behavioral partitioning
              </p>
            </div>
            <Link to="/clustering" className="text-xs font-semibold text-slate-800 hover:text-black">
              Analyze →
            </Link>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={clusterData}
                  dataKey="size"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {clusterData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CLUSTER_COLORS[index % CLUSTER_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Cluster Legend */}
          <div className="space-y-1.5 mt-2 max-h-24 overflow-y-auto text-xs font-sans">
            {clusterData.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-slate-600">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: CLUSTER_COLORS[i % CLUSTER_COLORS.length] }}
                  />
                  <span className="truncate max-w-[140px] font-medium text-slate-800">{c.name}</span>
                </div>
                <span className="font-mono text-slate-500">{c.percentage}% ({c.size})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Value Distribution Histogram */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-sm bg-orange-500" />
                <h3 className="font-serif text-xl font-normal text-slate-900">
                  Transaction Value Distribution
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">
                Frequency histogram across logarithmic BTC amount tiers
              </p>
            </div>
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Histogram
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="bin" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  }}
                  itemStyle={{ color: '#ea580c' }}
                />
                <Bar dataKey="count" name="Transactions" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly Detection Status */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-sm bg-rose-500" />
                <h3 className="font-serif text-xl font-normal text-slate-900">
                  Anomaly Triage Ratio
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">
                Isolation Forest outlier detection classification
              </p>
            </div>
            <Link to="/anomaly" className="text-xs font-semibold text-rose-600 hover:underline">
              Inspect Anomalies →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center h-60">
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieAnomalyData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                  >
                    {pieAnomalyData.map((entry, index) => (
                      <Cell key={`ano-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                    Normal Patterns
                  </span>
                  <span className="font-mono text-slate-900 font-bold">
                    {anomalySummary.normal?.toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Conforms to standard network velocity and input/output fan-outs.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                <div className="flex items-center justify-between text-rose-900 mb-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                    Flagged Anomalies
                  </span>
                  <span className="font-mono text-rose-700 font-bold">
                    {anomalySummary.anomaly?.toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] text-rose-700/80">
                  Outliers with abnormal velocity, high fan-outs, or volume spikes.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transaction Activity Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-slate-900" />
              <h3 className="font-serif text-xl font-normal text-slate-900">
                Recent Transaction Activity
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">
              Click any transaction row to open the complete multi-dimensional forensic profile
            </p>
          </div>
          <Link
            to="/explorer"
            className="text-xs font-semibold text-slate-900 hover:text-black flex items-center gap-1"
          >
            <span>Open Explorer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] bg-slate-50">
                <th className="py-3 px-3">Transaction ID</th>
                <th className="py-3 px-3">Sender Address</th>
                <th className="py-3 px-3">Receiver Address</th>
                <th className="py-3 px-3 text-right">Amount (BTC)</th>
                <th className="py-3 px-3">Cluster Archetype</th>
                <th className="py-3 px-3 text-center">Anomaly Score</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {recentTransactions.map((tx) => {
                const isAno = Boolean(tx.is_anomaly);
                return (
                  <tr
                    key={tx.transaction_id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-semibold text-slate-900 truncate max-w-[130px]">
                      {tx.transaction_id.slice(0, 10)}...{tx.transaction_id.slice(-6)}
                    </td>
                    <td className="py-3 px-3 text-slate-500 truncate max-w-[130px]">
                      {tx.sender_address.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-3 text-slate-500 truncate max-w-[130px]">
                      {tx.receiver_address.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {Number(tx.amount_btc).toFixed(4)} ₿
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                        {tx.cluster_name || `Cluster ${tx.cluster_kmeans}`}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-purple-700">
                      {Number(tx.anomaly_score ?? 0).toFixed(3)}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      {isAno ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 border border-rose-200 text-rose-700">
                          Suspicious
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 border border-emerald-200 text-emerald-700">
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
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
