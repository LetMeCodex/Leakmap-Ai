'use client';

import React from 'react';
import { useScanStore, ScanResult } from '../../store/useScanStore';
import { Sparkles, Terminal, ArrowRight, ShieldAlert, Award, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

const QUICK_PROMPTS = [
  {
    label: 'Photosynthesis',
    text: 'Explain photosynthesis in simple terms.',
    desc: 'Public / Academic Query (Low Risk)',
  },
  {
    label: 'Resume Rewrite',
    text: 'Rewrite my executive resume. I graduated from Delhi University in 2024. My contact phone is +91-9876543210 and email is anish.jha@gmail.com.',
    desc: 'Contains phone, email, college PII (Medium Risk)',
  },
  {
    label: 'Medical Report Summary',
    text: 'Summarize my father\'s medical file. He has type-2 diabetes and is treated at AIIMS Hospital, Hospital Card #987654321012, Aadhaar ID 1234 5678 9012.',
    desc: 'Contains critical Health & Gov ID data (Critical Risk)',
  },
  {
    label: 'Confidential Fin Plan',
    text: 'Analyze our startup\'s confidential Q3 cash flows: EBITDA is currently at 12%, revenue growth is 35% but we have high server cost of $40,000/mo. Here is our secret API key: sk-live-52x9z.',
    desc: 'Contains business financial secrets & API key (High Risk)',
  },
];

export default function PromptScanner() {
  const {
    prompt,
    setPrompt,
    isRedacted,
    setIsRedacted,
    isAnalyzing,
    runAnalysis,
    activeResult,
  } = useScanStore();

  const handleQuickSelect = (text: string) => {
    setPrompt(text);
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isAnalyzing) return;
    await runAnalysis();
  };

  // Helper to render sovereign recommendation details
  const renderSovereignRecommendation = (result: ScanResult) => {
    const originalScore = result.originalRisk.score;
    const redactedScore = result.redactedRisk.score;
    const level = result.sensitivityLevel;

    let routeText = 'User Device → Local Sovereign Node';
    let riskDrop = `${originalScore} → 10`;
    let tradeoff = 'Lower model parameter capacity; requires local GPU hardware setup.';
    let bestFor = 'Strict compliance audits and intellectual property.';
    let difficulty = 'Medium (Requires Docker/Ollama setup)';

    if (level === 'Public') {
      return (
        <div className="p-4 border-2 border-brutalist-text bg-white text-brutalist-text rounded-none text-xs flex flex-col gap-1 select-none shadow-[4px_4px_0px_#050505]">
          <p className="font-bold flex items-center gap-1.5 uppercase text-[9px] tracking-wider text-brutalist-green">
            <Award size={12} />
            Sovereign Safe Clearance
          </p>
          <p className="text-[11px] leading-relaxed mt-0.5 font-mono">
            This prompt contains no sensitive identifiers. It is safe to route to standard public or enterprise cloud models. Geopolitical leak risk is low.
          </p>
        </div>
      );
    }

    if (level === 'Personal' || level === 'Confidential') {
      routeText = 'User Device → Redaction Firewall → Public AI Gateway';
      riskDrop = `${originalScore} → ${redactedScore}`;
      tradeoff = 'Tokenized inputs might slightly degrade context matching on complex prompts.';
      bestFor = 'Standard workplace tasks, code formatting, and creative drafts.';
      difficulty = 'Low (Click Anonymize Toggle)';
    } else if (level === 'Sensitive' || level === 'Critical') {
      routeText = 'User Device → Localhost / In-Country Sovereign Node';
      riskDrop = `${originalScore} → 12`;
      tradeoff = 'No external API capacity limits. Highly protected. Models are constrained to local weights.';
      bestFor = 'Health records, national security, tax filings, and proprietary trade secrets.';
      difficulty = 'High (Requires local hardware execution)';
    }

    return (
      <div className="bg-white border-2 border-brutalist-text rounded-none p-4 flex flex-col gap-3 shadow-[4px_4px_0px_#050505]">
        <div>
          <span className="text-[9px] font-mono text-brutalist-muted uppercase tracking-widest font-bold">
            Recommended sovereign route
          </span>
          <p className="text-xs font-bold text-brutalist-text mt-0.5 font-mono uppercase">
            {routeText}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-b border-brutalist-text/10 py-3 text-[11px] font-mono">
          <div>
            <p className="text-brutalist-muted uppercase text-[8px] tracking-widest font-bold">Expected Risk Drop</p>
            <p className="text-brutalist-green font-bold mt-0.5">{riskDrop} Score</p>
          </div>
          <div>
            <p className="text-brutalist-muted uppercase text-[8px] tracking-widest font-bold">Setup Difficulty</p>
            <p className="text-brutalist-text font-bold mt-0.5">{difficulty}</p>
          </div>
        </div>

        <div className="text-[11px] font-mono leading-relaxed">
          <p className="text-brutalist-text"><span className="font-bold text-brutalist-muted uppercase text-[8px] tracking-widest block mb-0.5">Integration Tradeoff</span> {tradeoff}</p>
          <p className="text-brutalist-text mt-2"><span className="font-bold text-brutalist-muted uppercase text-[8px] tracking-widest block mb-0.5">Best Suited For</span> {bestFor}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Example Presets Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-[9px] font-mono text-brutalist-muted uppercase tracking-widest font-bold">
          Geopolitical Test Diagnostics (Presets)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickSelect(qp.text)}
              className="text-left p-3 rounded-none border border-brutalist-text bg-white hover:bg-brutalist-bg transition-all flex flex-col justify-between h-[80px] shadow-[2px_2px_0px_#050505] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#050505]"
            >
              <span className="text-[10px] font-mono font-bold text-brutalist-text truncate w-full uppercase tracking-wider">{qp.label}</span>
              <span className="text-[8px] font-mono text-brutalist-muted leading-tight mt-1 line-clamp-2 uppercase font-medium">{qp.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Textarea */}
      <form onSubmit={handleScanSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[9px] font-mono text-brutalist-muted uppercase tracking-widest font-bold">
            <span>Security Payload Entry</span>
            <span>{prompt.length} chars</span>
          </div>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Paste a prompt you are about to send to an AI model..."
              rows={5}
              className="w-full bg-white border-2 border-brutalist-text rounded-none p-4 text-xs leading-relaxed text-brutalist-text focus:outline-none focus:border-brutalist-blue font-mono resize-none focus:ring-1 focus:ring-brutalist-blue/10 shadow-[3px_3px_0px_#050505]"
            />
            {!prompt && (
              <span className="absolute bottom-3 left-4 text-[9px] text-brutalist-muted font-mono flex items-center gap-1 pointer-events-none select-none font-bold">
                <Terminal size={10} />
                READY FOR INPUT AUDITING
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Anonymize Inline Switch */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsRedacted(!isRedacted)}
              className={`flex items-center gap-2 px-3.5 py-1.5 border-2 border-brutalist-text text-[10px] font-mono font-bold uppercase tracking-wider transition-all rounded-none shadow-[2px_2px_0px_#050505] ${
                isRedacted 
                  ? 'bg-brutalist-green text-white' 
                  : 'bg-white text-brutalist-text hover:bg-brutalist-text hover:text-white'
              }`}
            >
              <Sparkles size={12} className={isRedacted ? "animate-pulse" : ""} />
              {isRedacted ? 'Anonymization Active' : 'Pre-Anonymize'}
            </button>
          </div>

          {/* Action Analyze trigger */}
          <button
            type="submit"
            disabled={!prompt.trim() || isAnalyzing}
            className="brutalist-button text-xs py-2 px-6 shadow-[3px_3px_0px_#050505] disabled:bg-brutalist-muted disabled:text-[#F4F2EC] disabled:border-brutalist-muted disabled:shadow-none"
          >
            {isAnalyzing ? 'Running Audits...' : 'Trace Routing'}
            <ArrowRight size={12} />
          </button>
        </div>
      </form>

      {/* Recommendations & Digital Passport Action card */}
      {activeResult && (
        <div className="flex flex-col gap-4 border-t-2 border-brutalist-text pt-4">
          <h4 className="text-[9px] font-mono text-brutalist-muted uppercase tracking-widest font-bold">
            Sovereign Architecture Protocol
          </h4>

          {renderSovereignRecommendation(activeResult)}

          {/* Data Passport Button Link */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-brutalist-lime border-2 border-brutalist-text rounded-none p-4 mt-1 gap-4 shadow-[4px_4px_0px_#050505] select-none text-brutalist-text">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider font-mono">
                Generate Digital AI Data Passport
              </p>
              <p className="text-[10px] font-mono mt-0.5 leading-relaxed font-semibold uppercase text-brutalist-text/80">
                Download the verified telemetry, subprocessor exposure chain, and risk certification logs.
              </p>
            </div>
            <Link
              href={`/report/${activeResult.id}`}
              className="brutalist-button bg-white text-brutalist-text border-2 border-brutalist-text hover:bg-brutalist-text hover:text-white rounded-none py-1.5 px-4 text-[10px]"
            >
              <FileSpreadsheet size={12} />
              Open Passport
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
