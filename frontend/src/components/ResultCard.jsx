import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck, FileText, Cpu, BarChart2 } from 'lucide-react';

export default function ResultCard({ result }) {
  const [activeTab, setActiveTab] = useState('original');

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto px-4 text-center py-6">
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-dashed border-white/10 backdrop-blur-md">
          <Cpu className="w-10 h-10 text-[#94A3B8]/40 mx-auto mb-3" />
          <p className="text-sm text-[#94A3B8]">
            No prediction yet. Enter a message above and click <span className="text-white font-medium">Predict Classification</span>.
          </p>
        </div>
      </div>
    );
  }

  const isSpam = result.prediction?.toLowerCase() === 'spam';
  const confidence = (result.confidence || 0) * 100;
  const originalMessage = result.original_message || '';
  const processedMessage = result.processed_message || '';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <div
        className={`rounded-3xl p-6 sm:p-8 bg-white/[0.05] backdrop-blur-2xl border ${
          isSpam
            ? 'border-red-500/40 shadow-2xl shadow-red-500/10'
            : 'border-green-500/40 shadow-2xl shadow-green-500/10'
        } space-y-6 transition-all duration-300`}
      >
        {/* Result Header & Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#06B6D4]" />
              <span className="text-xs uppercase tracking-wider text-[#94A3B8] font-semibold">
                Analysis Verdict
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">Classification Result</h3>
          </div>

          {/* Spam / Ham Badge */}
          <div
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-2xl font-bold text-sm sm:text-base border shadow-lg ${
              isSpam
                ? 'bg-red-500/15 border-red-500/40 text-[#EF4444] shadow-red-500/20'
                : 'bg-green-500/15 border-green-500/40 text-[#22C55E] shadow-green-500/20'
            }`}
          >
            {isSpam ? (
              <>
                <AlertTriangle className="w-5 h-5" />
                <span>SPAM DETECTED</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>HAM (GENUINE EMAIL)</span>
              </>
            )}
          </div>
        </div>

        {/* Confidence Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-[#94A3B8] font-medium">Model Confidence Score</span>
            <span className="font-bold text-white font-mono">{confidence.toFixed(1)}%</span>
          </div>
          <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                isSpam
                  ? 'bg-gradient-to-r from-red-600 to-[#EF4444]'
                  : 'bg-gradient-to-r from-emerald-600 to-[#22C55E]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, confidence))}%` }}
            />
          </div>
        </div>

        {/* Tabs for Original vs Processed Message */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <button
              onClick={() => setActiveTab('original')}
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'original'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Original Message
            </button>
            <button
              onClick={() => setActiveTab('processed')}
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'processed'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              NLP Preprocessed Tokens
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-sm text-[#94A3B8] font-mono leading-relaxed max-h-48 overflow-y-auto">
            {activeTab === 'original' ? (
              <p className="text-white/90 whitespace-pre-wrap">{originalMessage || 'N/A'}</p>
            ) : (
              <p className="text-[#06B6D4] whitespace-pre-wrap">{processedMessage || originalMessage || 'N/A'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
