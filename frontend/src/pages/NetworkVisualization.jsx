import React, { useState, useEffect, useRef } from 'react';
import {
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldAlert,
  Wallet,
  Activity,
  ArrowRight,
  Filter,
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { api } from '../services/api';

export default function NetworkVisualization() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterMode, setFilterMode] = useState('all');
  const [maxNodes, setMaxNodes] = useState(70);

  const canvasRef = useRef(null);
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const draggingRef = useRef({ isDragging: false, startX: 0, startY: 0 });
  const draggedNodeRef = useRef(null);

  const fetchGraph = async () => {
    try {
      setLoading(true);
      const res = await api.getNetworkGraph(maxNodes);
      setGraphData(res);
      if (res.nodes.length > 0 && !selectedNode) {
        setSelectedNode(res.nodes[0]);
      }
    } catch (err) {
      console.error('Failed to load network graph:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [maxNodes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight || 550);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight || 550;
    };
    window.addEventListener('resize', handleResize);

    if (transformRef.current.x === 0 && transformRef.current.y === 0) {
      transformRef.current.x = width / 2 - 500;
      transformRef.current.y = height / 2 - 400;
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.translate(transformRef.current.x, transformRef.current.y);
      ctx.scale(transformRef.current.scale, transformRef.current.scale);

      const filteredNodes = graphData.nodes.filter((n) => {
        if (filterMode === 'anomalies') return n.is_anomaly;
        return true;
      });
      const nodeMap = new Map(filteredNodes.map((n) => [n.id, n]));

      // 1. Draw Edges
      graphData.edges.forEach((edge) => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        if (!sourceNode || !targetNode) return;

        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);

        if (edge.is_anomaly) {
          ctx.strokeStyle = 'rgba(225, 29, 72, 0.45)';
          ctx.lineWidth = 1.8;
        } else {
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.25)';
          ctx.lineWidth = 1.0;
        }
        ctx.stroke();

        // Edge marker
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;
        ctx.beginPath();
        ctx.arc(midX, midY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = edge.is_anomaly ? '#e11d48' : '#64748b';
        ctx.fill();
      });

      // 2. Draw Nodes
      filteredNodes.forEach((node) => {
        const isSelected = selectedNode && selectedNode.id === node.id;
        const radius = isSelected ? node.size + 4 : node.size;

        if (node.is_anomaly || isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 7, 0, Math.PI * 2);
          ctx.fillStyle = node.is_anomaly
            ? 'rgba(225, 29, 72, 0.15)'
            : 'rgba(124, 58, 237, 0.15)';
          ctx.fill();
        }

        // Main Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color || '#0284c7';
        ctx.fill();

        // Inner Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Label
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = isSelected ? '#0f172a' : '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + radius + 13);
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [graphData, selectedNode, filterMode]);

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = (mouseX - transformRef.current.x) / transformRef.current.scale;
    const worldY = (mouseY - transformRef.current.y) / transformRef.current.scale;

    const clickedNode = graphData.nodes.find((n) => {
      const dx = n.x - worldX;
      const dy = n.y - worldY;
      return Math.sqrt(dx * dx + dy * dy) <= n.size + 4;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
      draggedNodeRef.current = clickedNode;
    } else {
      draggingRef.current = {
        isDragging: true,
        startX: mouseX - transformRef.current.x,
        startY: mouseY - transformRef.current.y,
      };
    }
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (draggedNodeRef.current) {
      draggedNodeRef.current.x = (mouseX - transformRef.current.x) / transformRef.current.scale;
      draggedNodeRef.current.y = (mouseY - transformRef.current.y) / transformRef.current.scale;
    } else if (draggingRef.current.isDragging) {
      transformRef.current.x = mouseX - draggingRef.current.startX;
      transformRef.current.y = mouseY - draggingRef.current.startY;
    }
  };

  const handleMouseUp = () => {
    draggingRef.current.isDragging = false;
    draggedNodeRef.current = null;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(2.5, Math.max(0.35, transformRef.current.scale * zoomFactor));
    transformRef.current.scale = newScale;
  };

  const handleZoom = (direction) => {
    const factor = direction === 'in' ? 1.25 : 0.8;
    transformRef.current.scale = Math.min(2.5, Math.max(0.35, transformRef.current.scale * factor));
  };

  const handleResetView = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    transformRef.current = {
      x: canvas.width / 2 - 500,
      y: canvas.height / 2 - 400,
      scale: 1,
    };
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const connectedEdges = selectedNode
    ? graphData.edges.filter(
        (e) => e.source === selectedNode.id || e.target === selectedNode.id
      )
    : [];

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-[#7e1d52] mb-1">
            <span>Graph Analytics Benchmark</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-slate-950 tracking-tight">
            Blockchain Network Topology
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Interactive transaction flow graph mapping wallet addresses as nodes and Bitcoin movements as directed edges.
          </p>
        </div>

        {/* Filter Pill Switcher */}
        <div className="flex items-center space-x-2">
          <div className="inline-flex items-center bg-[#f3f4f6] p-1 rounded-full border border-slate-200/60 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition ${
                filterMode === 'all'
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Wallets ({graphData.node_count})
            </button>
            <button
              onClick={() => setFilterMode('anomalies')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition ${
                filterMode === 'anomalies'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Anomalies Only
            </button>
          </div>

          <button
            onClick={fetchGraph}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Refresh Graph"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas & Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Network Graph Interactive Canvas */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-0 relative overflow-hidden h-[580px] flex flex-col shadow-sm lg:col-span-3">
          {/* Canvas Floating Toolbar */}
          <div className="absolute top-4 left-4 z-10 flex items-center space-x-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-md text-xs font-sans">
            <button
              onClick={() => handleZoom('in')}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-700"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom('out')}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-700"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-500 font-mono">
              Pan: Drag Canvas &bull; Move Node: Drag
            </span>
          </div>

          {/* Canvas Element */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            className="flex-1 w-full h-full cursor-grab active:cursor-grabbing bg-[#f8fafc]"
          />

          {/* Bottom Graph Stats Footer */}
          <div className="p-3.5 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500 font-sans">
            <div>
              Nodes: <strong className="text-slate-900 font-mono">{graphData.node_count}</strong> &bull; Edges:{' '}
              <strong className="text-slate-900 font-mono">{graphData.edge_count}</strong>
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-600" />
                Cluster Corridors
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                Suspicious Node
              </span>
            </div>
          </div>
        </div>

        {/* Selected Node Inspector Side Drawer */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7e1d52]">
              Address Forensic Profile
            </span>
            <h3 className="font-serif text-xl font-normal text-slate-900 mt-1">Wallet Inspector</h3>
          </div>

          {selectedNode ? (
            <div className="space-y-4 flex-1 overflow-y-auto text-xs font-sans">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500">Wallet Address:</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-900 truncate max-w-[170px] select-all font-semibold">
                    {selectedNode.full_address}
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedNode.full_address)}
                    className="p-1 text-slate-400 hover:text-black"
                    title="Copy Address"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  selectedNode.is_anomaly
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-purple-50 border-purple-200 text-purple-900'
                }`}
              >
                <div className="text-[10px] uppercase font-mono tracking-wider opacity-80 font-bold">
                  Cluster Membership
                </div>
                <div className="text-sm font-bold mt-0.5">
                  Cluster {selectedNode.cluster}
                  {selectedNode.is_anomaly && ' (Outlier Anomaly)'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 font-mono">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-sans">Transactions:</span>
                  <strong className="text-slate-900 text-sm">{selectedNode.tx_count}</strong>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-sans">Total Volume:</span>
                  <strong className="text-slate-900 text-sm">{selectedNode.total_btc} ₿</strong>
                </div>
              </div>

              {/* Connected Transactions List */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-semibold block">
                  Active Connections ({connectedEdges.length})
                </span>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {connectedEdges.map((edge, i) => {
                    const isOutgoing = edge.source === selectedNode.id;
                    return (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className={isOutgoing ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                            {isOutgoing ? '→ Out' : '← In'}
                          </span>
                          <span className="text-slate-800">
                            {edge.amount_btc} ₿
                          </span>
                        </div>
                        <span className="text-slate-400 text-[10px]">
                          {edge.transaction_id.slice(0, 8)}...
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs font-sans">
              Click any node in the graph to view its detailed transaction history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
