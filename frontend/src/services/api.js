const API_BASE = '/api';

export const api = {
  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  async getTransactions(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await fetch(`${API_BASE}/transactions?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async getTransactionDetail(txId) {
    const res = await fetch(`${API_BASE}/transactions/${txId}`);
    if (!res.ok) throw new Error('Failed to fetch transaction details');
    return res.json();
  },

  async getAnalysisResults() {
    const res = await fetch(`${API_BASE}/analysis/results`);
    if (!res.ok) throw new Error('Failed to fetch ML analysis results');
    return res.json();
  },

  async updateKMeans(k) {
    const res = await fetch(`${API_BASE}/cluster/kmeans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ k }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'K-Means clustering failed');
    }
    return res.json();
  },

  async updateDBSCAN(eps, min_samples) {
    const res = await fetch(`${API_BASE}/cluster/dbscan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eps: parseFloat(eps), min_samples: parseInt(min_samples, 10) }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'DBSCAN clustering failed');
    }
    return res.json();
  },

  async updateAnomalyDetection(contamination) {
    const res = await fetch(`${API_BASE}/anomaly/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contamination: parseFloat(contamination) }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Anomaly detection failed');
    }
    return res.json();
  },

  async getNetworkGraph(maxNodes = 75) {
    const res = await fetch(`${API_BASE}/network/graph?max_nodes=${maxNodes}`);
    if (!res.ok) throw new Error('Failed to fetch network graph');
    return res.json();
  },

  async getAIInsights() {
    const res = await fetch(`${API_BASE}/ai/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to generate AI insights');
    return res.json();
  },

  async sendAIChat(question) {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error('Failed to get AI answer');
    return res.json();
  },

  async getDatasetPreview() {
    const res = await fetch(`${API_BASE}/dataset/preview`);
    if (!res.ok) throw new Error('Failed to preview dataset');
    return res.json();
  },

  async uploadDataset(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/dataset/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'CSV upload failed');
    }
    return res.json();
  },

  async resetDefaultDataset() {
    const res = await fetch(`${API_BASE}/dataset/reset-default`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset dataset');
    return res.json();
  },

  getSampleDatasetDownloadUrl() {
    return `${API_BASE}/dataset/download-sample`;
  },

  getExportReportUrl(format = 'json') {
    return `${API_BASE}/reports/export?format=${format}`;
  }
};
