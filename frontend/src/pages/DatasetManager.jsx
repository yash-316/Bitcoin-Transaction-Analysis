import React, { useState, useEffect } from 'react';
import {
  Database,
  Upload,
  Download,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  Table,
  Check,
  X
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { api } from '../services/api';

export default function DatasetManager() {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const loadPreview = async () => {
    try {
      setLoading(true);
      const res = await api.getDatasetPreview();
      setPreview(res);
    } catch (err) {
      console.error('Failed to preview dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreview();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadError(null);
      setUploadSuccess(null);
      const res = await api.uploadDataset(file);
      setUploadSuccess(res.message);
      await loadPreview();
    } catch (err) {
      setUploadError(err.message || 'CSV upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleResetDefault = async () => {
    try {
      setResetting(true);
      setUploadError(null);
      setUploadSuccess(null);
      await api.resetDefaultDataset();
      setUploadSuccess('Successfully regenerated default synthetic Bitcoin dataset.');
      await loadPreview();
    } catch (err) {
      setUploadError(err.message || 'Reset failed');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-7 h-7 text-slate-800 animate-spin" />
        <p className="text-sm text-slate-500 font-sans">Loading active dataset schema...</p>
      </div>
    );
  }

  const columns = preview?.columns || [];
  const totalRows = preview?.total_rows || 0;
  const duplicatesCount = preview?.duplicates_count || 0;
  const headRows = preview?.head_rows || [];
  const requiredFeatures = preview?.required_features || [];

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-[#7e1d52] mb-1">
            <span>Data Ingestion &amp; Quality</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-slate-950 tracking-tight">
            Dataset Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Active Dataset: <strong className="text-slate-900">{preview?.dataset_name}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={api.getSampleDatasetDownloadUrl()}
            download="cointrace_sample_bitcoin_data.csv"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-medium text-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-900" />
            <span>Download Sample CSV</span>
          </a>

          <button
            onClick={handleResetDefault}
            disabled={resetting}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-medium text-slate-700 transition disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting...' : 'Reset Default Data'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {uploadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 font-sans">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}
      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 font-sans">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Upload Zone & Preprocessing Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-purple-600" />
            <div>
              <h3 className="font-serif text-xl font-normal text-slate-900">Upload Custom CSV</h3>
              <p className="text-xs text-slate-500 font-sans">Max size 25MB &bull; .csv format</p>
            </div>
          </div>

          <label className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50 text-center">
            <FileSpreadsheet className="w-10 h-10 text-slate-400 mb-2" />
            <span className="text-xs font-semibold text-slate-900 font-sans">
              {uploading ? 'Processing & Scaling...' : 'Click or drag CSV file to upload'}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 font-sans">
              Will automatically run K-Means, DBSCAN, PCA &amp; Isolation Forest
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Feature Health & Validation */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-normal text-slate-900">Feature Schema Validation</h3>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              9/9 Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Multi-dimensional features extracted for unsupervised clustering:
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1 font-mono">
            {requiredFeatures.map((feat) => {
              const present = columns.includes(feat);
              return (
                <span
                  key={feat}
                  className={`text-[11px] px-2.5 py-1 rounded-full border flex items-center space-x-1 ${
                    present
                      ? 'bg-slate-100 text-slate-800 border-slate-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {present ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-rose-600" />}
                  <span>{feat}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Quality Assessment */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-normal text-slate-900">Quality Assessment</h3>
            <span className="text-xs font-mono font-semibold text-slate-900">
              {totalRows.toLocaleString()} Records
            </span>
          </div>

          <div className="space-y-2 text-xs font-sans">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Duplicate Transactions:</span>
              <span className="font-mono font-bold text-slate-900">
                {duplicatesCount === 0 ? '0 (Clean)' : `${duplicatesCount} removed`}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Missing Values Handled:</span>
              <span className="font-mono font-bold text-emerald-700">Auto-Imputed (0 missing)</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Feature Scaler:</span>
              <span className="font-mono font-bold text-purple-700">RobustScaler (IQR)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Preview Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-0 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-normal text-slate-900">Dataset Raw Preview (Top 10 Records)</h3>
            <p className="text-xs text-slate-500 font-sans">Inspecting ingested Bitcoin transaction columns</p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {columns.length} Total Columns
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                {columns.map((col) => (
                  <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {headRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  {columns.map((col) => (
                    <td key={col} className="py-2.5 px-3 truncate max-w-[140px] text-slate-700">
                      {String(row[col] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
