import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CoinTracePreloader from './components/CoinTracePreloader';
import LandingPage from './pages/LandingPage';
import DashboardOverview from './pages/DashboardOverview';
import TransactionExplorer from './pages/TransactionExplorer';
import ClusteringAnalysis from './pages/ClusteringAnalysis';
import AnomalyDetection from './pages/AnomalyDetection';
import NetworkVisualization from './pages/NetworkVisualization';
import AIInsights from './pages/AIInsights';
import DatasetManager from './pages/DatasetManager';
import AboutProject from './pages/AboutProject';
import { api } from './services/api';

function AppLayout({ children }) {
  const [isResetting, setIsResetting] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const handleResetData = async () => {
    try {
      setIsResetting(true);
      await api.resetDefaultDataset();
      window.location.reload();
    } catch (err) {
      alert('Failed to reset dataset: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  if (isLanding) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar onResetData={handleResetData} isResetting={isResetting} />
        <main className="flex-1 p-5 sm:p-7 lg:p-9 xl:p-12 overflow-y-auto w-full max-w-[1850px] mx-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <CoinTracePreloader />
      <BrowserRouter>
        <AppLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/clustering" element={<ClusteringAnalysis />} />
          <Route path="/anomaly" element={<AnomalyDetection />} />
          <Route path="/network" element={<NetworkVisualization />} />
          <Route path="/insights" element={<AIInsights />} />
          <Route path="/explorer" element={<TransactionExplorer />} />
          <Route path="/dataset" element={<DatasetManager />} />
          <Route path="/about" element={<AboutProject />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  </>
  );
}
