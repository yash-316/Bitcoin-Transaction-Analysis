import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, CheckCircle, Copy, Cpu, Activity, Clock, Database } from 'lucide-react';

export default function TransactionModal({ transaction, onClose }) {
  if (!transaction) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const isAno = Boolean(transaction.is_anomaly);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center space-x-3">
              <span className={`w-3.5 h-3.5 rounded-sm ${isAno ? 'bg-rose-500' : 'bg-purple-600'}`} />
              <div>
                <h3 className="font-serif text-lg font-normal text-slate-900">
                  Transaction Forensic Card
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {transaction.transaction_id.slice(0, 16)}...{transaction.transaction_id.slice(-8)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-5 text-sm">
            {/* Status & Cluster Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                className={`p-3.5 rounded-xl border ${
                  isAno
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Behavioral Classification
                </div>
                <div className="text-base font-semibold mt-0.5 flex items-center gap-1.5 font-sans">
                  {isAno ? (
                    <>
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      Suspicious Pattern Flagged
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Normal Baseline Transaction
                    </>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Assigned Cluster
                </div>
                <div className="text-base font-semibold mt-0.5 font-sans">
                  {transaction.cluster_name || `Cluster ${transaction.cluster_kmeans ?? 'N/A'}`}
                </div>
              </div>
            </div>

            {/* Anomaly Rationale */}
            {isAno && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                <div className="text-xs font-semibold uppercase tracking-wider text-rose-700 mb-1 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Isolation Forest Outlier Rationale
                </div>
                <p className="text-xs leading-relaxed text-rose-800 font-sans">
                  {transaction.anomaly_explanation || 'Multivariate deviation identified across multiple input-output topological dimensions.'}
                </p>
                <div className="mt-2 text-[11px] text-rose-600 italic">
                  Note: Anomaly markers reflect mathematical deviation from baseline transaction corridors and do not constitute verified illegal activities.
                </div>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Amount</span>
                <p className="text-base font-mono font-bold text-slate-900 mt-0.5">
                  {Number(transaction.amount_btc).toFixed(4)} ₿
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Anomaly Score</span>
                <p className="text-base font-mono font-bold text-purple-700 mt-0.5">
                  {Number(transaction.anomaly_score ?? 0).toFixed(4)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Inputs / Outputs</span>
                <p className="text-base font-mono font-bold text-slate-900 mt-0.5">
                  {transaction.input_count ?? 1} in → {transaction.output_count ?? 2} out
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Frequency</span>
                <p className="text-base font-mono font-bold text-slate-900 mt-0.5">
                  {transaction.transaction_frequency ?? '3.2'} tx/hr
                </p>
              </div>
            </div>

            {/* Addresses */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-medium text-slate-600">Sender Address</span>
                <div className="flex items-center justify-between mt-1 p-2 rounded-lg bg-white border border-slate-200">
                  <span className="font-mono text-xs text-slate-700 break-all select-all">
                    {transaction.sender_address}
                  </span>
                  <button
                    onClick={() => copyToClipboard(transaction.sender_address)}
                    className="p-1 hover:text-black text-slate-400 ml-2"
                    title="Copy address"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-600">Receiver Address</span>
                <div className="flex items-center justify-between mt-1 p-2 rounded-lg bg-white border border-slate-200">
                  <span className="font-mono text-xs text-slate-700 break-all select-all">
                    {transaction.receiver_address}
                  </span>
                  <button
                    onClick={() => copyToClipboard(transaction.receiver_address)}
                    className="p-1 hover:text-black text-slate-400 ml-2"
                    title="Copy address"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Dimensional Features */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-sans">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Timestamp:</span>
                <div className="font-mono text-slate-800 mt-0.5">{transaction.timestamp}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Counterparties:</span>
                <div className="font-mono text-slate-800 mt-0.5">{transaction.unique_counterparties ?? 2}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Wallet Activity:</span>
                <div className="font-mono text-slate-800 mt-0.5">{transaction.wallet_activity_score ?? '45.0'} / 100</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">PCA Coordinates:</span>
                <div className="font-mono text-purple-700 mt-0.5">
                  ({transaction.pca_x ?? 0}, {transaction.pca_y ?? 0})
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">DBSCAN Cluster:</span>
                <div className="font-mono text-slate-800 mt-0.5">
                  {transaction.cluster_dbscan === -1 ? 'Noise Outlier (-1)' : `Cluster ${transaction.cluster_dbscan}`}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Estimated Fee:</span>
                <div className="font-mono text-slate-800 mt-0.5">{transaction.fee_btc ?? 0.0001} BTC</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-slate-50">
            <button
              onClick={() => copyToClipboard(transaction.transaction_id)}
              className="text-xs text-slate-500 hover:text-black flex items-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Full TXID
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#111111] hover:bg-black text-white transition shadow-sm"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
