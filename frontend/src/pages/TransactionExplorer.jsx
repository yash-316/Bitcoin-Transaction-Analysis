import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  CheckCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Coins
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import TransactionModal from '../components/TransactionModal';
import { api } from '../services/api';

export default function TransactionExplorer() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [clusterFilter, setClusterFilter] = useState('all');
  const [anomalyFilter, setAnomalyFilter] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        page_size: pageSize,
        search,
        cluster: clusterFilter,
        is_anomaly: anomalyFilter === 'all' ? undefined : anomalyFilter,
        min_amount: minAmount ? parseFloat(minAmount) : undefined,
        max_amount: maxAmount ? parseFloat(maxAmount) : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      const res = await api.getTransactions(params);
      setTransactions(res.transactions || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, pageSize, clusterFilter, anomalyFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleResetFilters = () => {
    setSearch('');
    setClusterFilter('all');
    setAnomalyFilter('all');
    setMinAmount('');
    setMaxAmount('');
    setSortBy('timestamp');
    setSortOrder('desc');
    setPage(1);
  };

  const copyToClipboard = (text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-[#7e1d52] mb-1">
            <span>Granular Forensic Search</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-slate-950 tracking-tight">
            Transaction Explorer
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Search, filter, and inspect {total.toLocaleString()} multi-dimensional Bitcoin transactions.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
          <span className="px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200">
            Total Results: <strong className="text-slate-900">{total}</strong>
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-3.5">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by transaction hash or wallet address..."
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 font-sans"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 font-sans">
            <select
              value={clusterFilter}
              onChange={(e) => {
                setClusterFilter(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">All Clusters</option>
              <option value="0">Cluster 0</option>
              <option value="1">Cluster 1</option>
              <option value="2">Cluster 2</option>
              <option value="3">Cluster 3</option>
            </select>

            <select
              value={anomalyFilter}
              onChange={(e) => {
                setAnomalyFilter(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="true">Anomalies Only</option>
              <option value="false">Normal Only</option>
            </select>

            <input
              type="number"
              step="0.001"
              placeholder="Min ₿"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-20 px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />

            <input
              type="number"
              step="0.001"
              placeholder="Max ₿"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-20 px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />

            <button
              type="submit"
              className="px-5 py-2 rounded-full text-xs font-semibold bg-[#111111] text-white hover:bg-black transition shadow-sm"
            >
              Filter
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Sorting row */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 font-sans">
          <div className="flex items-center space-x-2">
            <span>Sort By:</span>
            <button
              onClick={() => {
                setSortBy('timestamp');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-3 py-1 rounded-full border transition ${
                sortBy === 'timestamp'
                  ? 'bg-[#111111] text-white border-black font-medium'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Time ({sortBy === 'timestamp' ? sortOrder : 'desc'})
            </button>
            <button
              onClick={() => {
                setSortBy('amount_btc');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-3 py-1 rounded-full border transition ${
                sortBy === 'amount_btc'
                  ? 'bg-[#111111] text-white border-black font-medium'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Amount ₿ ({sortBy === 'amount_btc' ? sortOrder : 'desc'})
            </button>
            <button
              onClick={() => {
                setSortBy('anomaly_score');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-3 py-1 rounded-full border transition ${
                sortBy === 'anomaly_score'
                  ? 'bg-[#111111] text-white border-black font-medium'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Anomaly ({sortBy === 'anomaly_score' ? sortOrder : 'desc'})
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-800"
            >
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-0 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-16 space-x-3 text-slate-800">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-xs font-mono">Filtering transactions...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center p-16 space-y-2 font-sans">
            <p className="text-sm font-semibold text-slate-900">No transactions matched your filters</p>
            <p className="text-xs text-slate-500">Try clearing your search query or relaxing filter criteria.</p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Transaction Hash</th>
                  <th className="py-3 px-4">Sender Address</th>
                  <th className="py-3 px-4">Receiver Address</th>
                  <th className="py-3 px-4 text-right">Amount (BTC)</th>
                  <th className="py-3 px-4">Cluster Archetype</th>
                  <th className="py-3 px-4 text-center">Anomaly Score</th>
                  <th className="py-3 px-4 text-center">Classification</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {transactions.map((tx) => {
                  const isAno = Boolean(tx.is_anomaly);
                  return (
                    <tr
                      key={tx.transaction_id}
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center space-x-1.5">
                          <span className="truncate max-w-[120px]">
                            {tx.transaction_id.slice(0, 10)}...{tx.transaction_id.slice(-6)}
                          </span>
                          <button
                            onClick={(e) => copyToClipboard(tx.transaction_id, e)}
                            className="text-slate-400 hover:text-black p-0.5"
                            title="Copy Hash"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <span className="truncate max-w-[120px] block">
                          {tx.sender_address.slice(0, 10)}...
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <span className="truncate max-w-[120px] block">
                          {tx.receiver_address.slice(0, 10)}...
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {Number(tx.amount_btc).toFixed(4)} ₿
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                          {tx.cluster_name || `Cluster ${tx.cluster_kmeans}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-purple-700">
                        {Number(tx.anomaly_score ?? 0).toFixed(4)}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        {isAno ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 border border-rose-200 text-rose-700">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            <span>Suspicious</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 border border-emerald-200 text-emerald-700">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Normal</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {tx.timestamp.slice(0, 16).replace('T', ' ')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-slate-50 text-xs text-slate-600 font-sans">
          <span>
            Page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{totalPages}</strong>
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
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
