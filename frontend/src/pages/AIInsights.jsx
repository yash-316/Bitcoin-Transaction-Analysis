import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Cpu,
  Layers,
  ShieldAlert,
  GitBranch,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
  FileText
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { api } from '../services/api';

const EXAMPLE_QUESTIONS = [
  'What are the most unusual transaction patterns?',
  'Explain Cluster 2',
  'Which transactions have the highest anomaly scores?',
  'What is the difference between K-Means and DBSCAN results?',
  'Summarize the dataset',
];

export default function AIInsights() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your CoinTrace AI Intelligence Assistant. I analyze the unsupervised machine learning clustering models, density corridors, and anomaly trees for your active Bitcoin dataset. How can I assist your investigation today?",
      source: 'CoinTrace Engine',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [copied, setCopied] = useState(false);

  const chatEndRef = useRef(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await api.getAIInsights();
      setInsights(res);
    } catch (err) {
      console.error('Failed to load AI insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAsking]);

  const handleAsk = async (questionText) => {
    const q = questionText || inputQuestion;
    if (!q.trim()) return;

    const userMsg = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsAsking(true);

    try {
      const res = await api.sendAIChat(q);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.answer,
          source: res.source,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Encountered an issue generating AI response. Please try again.',
          source: 'System Error',
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const copyReport = () => {
    if (!insights) return;
    const fullText = `# CoinTrace AI Intelligence Summary\n\n${insights.summary}\n\n## Cluster Breakdowns\n${insights.cluster_summaries
      ?.map((c) => `### ${c.name}\n${c.explanation}`)
      .join('\n\n')}\n\n## DBSCAN Density Analysis\n${insights.dbscan_explanation}\n\n## Anomaly Assessment\n${
      insights.anomaly_breakdown
    }\n\n## Key Takeaways\n${insights.key_takeaways?.map((t) => `- ${t}`).join('\n')}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Sparkles className="w-7 h-7 text-slate-800 animate-spin" />
        <p className="text-sm text-slate-500 font-sans">Synthesizing multi-model AI insights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-[#7e1d52] mb-1">
            <span>Natural Language Synthesis</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-slate-950 tracking-tight">
            AI-Powered Forensic Insights
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Natural-language synthesis of K-Means clusters, DBSCAN noise boundaries, and Isolation Forest outliers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={copyReport}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-200 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Markdown' : 'Copy AI Report'}</span>
          </button>

          <button
            onClick={fetchInsights}
            className="p-2 rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200"
            title="Refresh Insights"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: AI Report on Left, Interactive Chat on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Natural-Language Analysis Report */}
        <div className="lg:col-span-7 space-y-6">
          {/* Executive Summary */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-[#7e1d52]">
              <FileText className="w-4 h-4" />
              <span>Executive Model Synthesis</span>
            </div>
            <h3 className="font-serif text-2xl font-normal text-slate-900 tracking-tight">
              Cluster &amp; Anomaly Narrative
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 font-sans">
              {insights?.summary}
            </p>
          </div>

          {/* Cluster Explanations */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-purple-700">
              <Layers className="w-4 h-4" />
              <span>K-Means Behavioral Explanations</span>
            </div>
            <h3 className="font-serif text-2xl font-normal text-slate-900 tracking-tight">
              Cluster Behavioral Archetypes
            </h3>

            <div className="space-y-3 pt-2">
              {insights?.cluster_summaries?.map((c) => (
                <div key={c.cluster_id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg font-normal text-slate-900">
                      Cluster {c.cluster_id}: {c.name}
                    </span>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                      {c.percentage}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {c.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* DBSCAN & Anomaly Deep Dives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-2">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-purple-700">
                <GitBranch className="w-3.5 h-3.5" />
                <span>DBSCAN Noise Rationale</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {insights?.dbscan_explanation}
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-2">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-rose-600">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Isolation Forest Triage</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {insights?.anomaly_breakdown}
              </p>
            </div>
          </div>

          {/* Key Forensic Takeaways */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
              <Lightbulb className="w-4 h-4" />
              <span>Key Forensic Takeaways</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 font-sans">
              {insights?.key_takeaways?.map((takeaway, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-[#111111] font-bold">&bull;</span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Interactive AI Assistant Chat */}
        <div className="lg:col-span-5 flex flex-col h-[750px] bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-normal text-slate-900">
                  CoinTrace Intelligence Chat
                </h3>
                <p className="text-[11px] text-slate-500 font-sans">Context-aware ML reasoning engine</p>
              </div>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-3.5 border-b border-slate-200 bg-white">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
              Suggested Prompts
            </span>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleAsk(q)}
                  className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 transition font-sans"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans">
            {messages.map((msg, i) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={i}
                  className={`flex items-start space-x-2.5 ${isAi ? '' : 'flex-row-reverse space-x-reverse'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                      isAi
                        ? 'bg-slate-100 text-slate-800 border border-slate-200'
                        : 'bg-[#111111] text-white'
                    }`}
                  >
                    {isAi ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                      isAi
                        ? 'bg-slate-50 border border-slate-200 text-slate-800'
                        : 'bg-[#111111] text-white'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>
                    {msg.source && (
                      <div className="mt-1.5 text-[9px] font-mono text-slate-400">
                        Source: {msg.source}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isAsking && (
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-mono p-2">
                <Sparkles className="w-4 h-4 animate-spin text-slate-700" />
                <span>Evaluating ML metrics and formulating answer...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="p-3 border-t border-slate-200 bg-slate-50 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask about clusters, anomalies, or models..."
              className="flex-1 px-4 py-2.5 rounded-full bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 font-sans"
            />
            <button
              type="submit"
              disabled={isAsking || !inputQuestion.trim()}
              className="p-2.5 rounded-full bg-[#111111] hover:bg-black text-white disabled:opacity-40 transition shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
