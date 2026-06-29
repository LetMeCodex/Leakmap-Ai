'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Copy, 
  Check, 
  Cpu, 
  Server, 
  Lock, 
  EyeOff, 
  CornerDownRight, 
  FileText, 
  Fingerprint, 
  Zap, 
  RefreshCw,
  Info
} from 'lucide-react';

const PROVIDERS = [
  'OpenAI',
  'Gemini',
  'Claude',
  'Groq',
  'Perplexity',
  'Mistral',
  'Custom Provider'
];

const USE_CASES = [
  'General Chat',
  'Resume / Career',
  'Legal Document',
  'Medical / Health',
  'Academic',
  'Company / Startup',
  'Code / API Debugging',
  'Finance / Tax',
  'Other'
];

const STAGES = [
  'ASI:ONE Agent Council activated',
  'Privacy Prosecutor scanning sensitive data',
  'Cloud Investigator checking AI boundary risk',
  'Redaction Engineer preparing safer prompt',
  'Evidence Judge issuing verdict'
];

const DEMO_PROMPT = 'Summarize this employment agreement for Rahul Sharma. His Aadhaar number is 1234-5678-9012, salary is ₹18L, client is based in Germany, and the document includes termination clauses.';

interface SensitiveEntity {
  type: string;
  masked_example: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
}

interface UnsafeFragment {
  masked_fragment: string;
  why_risky: string;
  suggested_replacement: string;
}

interface AgentOpinion {
  summary: string;
  findings?: string[];
  exposure_notes?: string[];
  evidence_labels?: string[];
  changes_made?: string[];
  final_reason?: string;
}

interface InspectionResult {
  verdict: 'SAFE' | 'CAUTION' | 'HIGH_RISK' | 'BLOCK';
  risk_score: number;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  provider: string;
  use_case: string;
  sensitive_entities: SensitiveEntity[];
  agent_opinions: {
    privacy_prosecutor: AgentOpinion;
    cloud_investigator: AgentOpinion;
    redaction_engineer: AgentOpinion;
    evidence_judge: AgentOpinion;
  };
  safe_rewrite: string;
  unsafe_fragments: UnsafeFragment[];
  recommended_action: string;
  recommended_mode: string;
  evidence_level: string;
  data_passport: {
    summary: string;
    risk_badges: string[];
    recommended_next_step: string;
  };
  disclaimer: string;
}

export default function DataBorderControl() {
  const [provider, setProvider] = useState('OpenAI');
  const [useCase, setUseCase] = useState('General Chat');
  const [userPrompt, setUserPrompt] = useState('');
  const [isInspecting, setIsInspecting] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [copiedRewrite, setCopiedRewrite] = useState(false);
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cycle through loading stages sequentially
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInspecting) {
      setLoadingStage(0);
      interval = setInterval(() => {
        setLoadingStage((prev) => {
          if (prev < STAGES.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1800); // 1.8 seconds per stage for dramatic cyber scan effect
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInspecting]);

  const handleInspect = async () => {
    if (!userPrompt.trim()) {
      setError('Please enter a prompt to inspect.');
      return;
    }

    setIsInspecting(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/asi-risk-court', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          useCase,
          userPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ASI:ONE inspection failed. Check API key/server logs.');
      }

      if (!data || !data.verdict || typeof data.risk_score !== 'number') {
        throw new Error('ASI:ONE inspection failed. Response is missing verdict or risk score.');
      }

      // Briefly wait to ensure the user gets to see the final loading stages before rendering results
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'ASI:ONE inspection failed. Check API key/server logs.');
    } finally {
      setIsInspecting(false);
    }
  };

  const handleCopy = (text: string, type: 'rewrite' | 'original') => {
    navigator.clipboard.writeText(text);
    if (type === 'rewrite') {
      setCopiedRewrite(true);
      setTimeout(() => setCopiedRewrite(false), 2000);
    } else {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    }
  };

  const loadDemo = () => {
    setUserPrompt(DEMO_PROMPT);
    setError(null);
  };

  const getVerdictStyles = (verdict: string) => {
    switch (verdict) {
      case 'SAFE':
        return {
          bg: 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
          icon: <ShieldCheck className="text-emerald-400 w-5 h-5 animate-pulse" />
        };
      case 'CAUTION':
        return {
          bg: 'bg-amber-950/40 border-amber-500/50 text-amber-400',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
          icon: <AlertTriangle className="text-amber-400 w-5 h-5 animate-pulse" />
        };
      case 'HIGH_RISK':
        return {
          bg: 'bg-orange-950/40 border-orange-500/50 text-orange-400',
          glow: 'shadow-[0_0_20px_rgba(249,115,22,0.15)]',
          icon: <ShieldAlert className="text-orange-400 w-5 h-5 animate-pulse" />
        };
      case 'BLOCK':
      default:
        return {
          bg: 'bg-red-950/40 border-red-500/50 text-red-400',
          glow: 'shadow-[0_0_30px_rgba(239,68,68,0.2)]',
          icon: <ShieldAlert className="text-red-400 w-5 h-5 animate-bounce" />
        };
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-950/60 border border-red-500/30 text-red-400';
      case 'high':
        return 'bg-orange-950/60 border border-orange-500/30 text-orange-400';
      case 'medium':
        return 'bg-amber-950/60 border border-amber-500/30 text-amber-400';
      case 'low':
      default:
        return 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-400';
    }
  };

  return (
    <div className="flex-grow w-full bg-[#0A0A09] text-zinc-100 flex flex-col relative select-none pb-12 font-mono">
      {/* Glow Ambient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-[#3B00FF]/5 to-transparent blur-[120px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-6 py-8 flex flex-col">
        {/* Terminal Header Banner */}
        <div className="border-b border-zinc-800 py-4 w-full flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400 leading-[1.5] select-none min-h-[56px]">
          <div className="flex items-center gap-2">
            <Fingerprint className="text-[#3B00FF] animate-pulse w-4 h-4 shrink-0" />
            <p>
              <span className="font-black text-white uppercase tracking-wider">DATA RESIDENCY CONTROL TOWER:</span> INSPECTING OUTBOUND FLOWS SECURED BY ASI:ONE HEURISTICS
            </p>
          </div>
          <div className="text-[#3B00FF] font-extrabold uppercase text-right leading-[1.3] shrink-0 whitespace-nowrap">
            ASI:ONE COUNCIL ACTIVE // PORT: 443
          </div>
        </div>

        {/* Feature Title */}
        <div className="mt-8 mb-10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#3B00FF] shadow-[0_0_10px_#3B00FF]" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Feature // Security Checkpoint</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase leading-none font-display">
            DATA BORDER CONTROL
          </h1>
          <p className="text-xs text-zinc-400 font-mono tracking-wide mt-1 italic">
            “Inspect your prompt before it crosses an AI boundary.”
          </p>
        </div>

        {/* Console Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel: Checkpoint Parameters (5/12 grid) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#121211]/80 border border-zinc-800 p-6 rounded-none relative overflow-hidden backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
              {/* Corner calibration marks */}
              <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-zinc-700 pointer-events-none" />
              <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-zinc-700 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-zinc-700 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-zinc-700 pointer-events-none" />

              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Cpu size={16} className="text-[#3B00FF]" />
                <span>COUNCIL PARAMETERS</span>
              </h2>

              <div className="flex flex-col gap-5">
                {/* AI Provider dropdown */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                    Target AI Provider (Boundary Point)
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    disabled={isInspecting}
                    className="w-full bg-[#1A1A19] border border-zinc-800 px-3 py-2.5 text-xs text-white rounded-none focus:outline-none focus:border-[#3B00FF] cursor-pointer"
                  >
                    {PROVIDERS.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Use Case dropdown */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                    Classification / Use Case
                  </label>
                  <select
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    disabled={isInspecting}
                    className="w-full bg-[#1A1A19] border border-zinc-800 px-3 py-2.5 text-xs text-white rounded-none focus:outline-none focus:border-[#3B00FF] cursor-pointer"
                  >
                    {USE_CASES.map((uc) => (
                      <option key={uc} value={uc}>
                        {uc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prompt textarea */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                      Raw Payload Content (Prompt)
                    </label>
                    <span className="text-[9px] text-zinc-500">{userPrompt.length}/4000 chars</span>
                  </div>
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    disabled={isInspecting}
                    placeholder="Paste your prompt to inspect for geopolitical boundary risks and sensitive leaks..."
                    className="w-full h-44 bg-[#1A1A19] border border-zinc-800 p-3 text-xs text-white rounded-none focus:outline-none focus:border-[#3B00FF] resize-none font-mono placeholder-zinc-600 leading-relaxed"
                  />
                </div>

                {/* Demo Prompt Trigger */}
                <div className="flex justify-between items-center gap-2 pt-2">
                  <button
                    onClick={loadDemo}
                    disabled={isInspecting}
                    className="text-[10px] text-zinc-400 hover:text-white uppercase font-bold border border-zinc-800 hover:border-zinc-500 bg-[#1A1A19] px-3 py-1.5 transition-all shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                  >
                    Try risky demo prompt
                  </button>

                  {userPrompt.trim() && (
                    <button
                      onClick={() => setUserPrompt('')}
                      disabled={isInspecting}
                      className="text-[9px] text-zinc-500 hover:text-red-400 uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Main Action Button */}
                <button
                  onClick={handleInspect}
                  disabled={isInspecting || !userPrompt.trim()}
                  className={`w-full mt-4 py-3 border border-black shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    !userPrompt.trim()
                      ? 'bg-zinc-800 text-zinc-600 border-zinc-950 cursor-not-allowed shadow-none hover:translate-x-0 hover:translate-y-0'
                      : 'bg-[#3B00FF] hover:bg-[#F4F2EC] text-white hover:text-black'
                  }`}
                >
                  {isInspecting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>INSPECTING PAYLOAD...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      <span>INSPECT WITH ASI:ONE</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="border border-red-500/30 bg-red-950/20 p-4 text-xs text-red-400 leading-normal flex items-start gap-2 shadow-[2px_2px_0px_rgba(239,68,68,0.1)]">
                <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-extrabold uppercase block mb-1">BOUNDARY CHECK FAILED</span>
                  <p>{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Result Dashboard (7/12 grid) */}
          <div className="lg:col-span-7 flex flex-col justify-start min-h-[550px] relative">
            <AnimatePresence mode="wait">
              {/* 1. Loading Heuristics Animation */}
              {isInspecting && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#121211]/80 border border-zinc-800 p-8 h-full flex flex-col justify-center items-center backdrop-blur-md text-center min-h-[500px] shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
                >
                  <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-zinc-800 border-t-[#3B00FF] animate-spin" />
                    <Fingerprint className="text-[#3B00FF] w-8 h-8 animate-pulse" />
                  </div>

                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                    ASI:ONE PRIVACY COUNCIL CONNECTED
                  </h3>
                  
                  <div className="max-w-md w-full border border-zinc-800 bg-[#1A1A19] p-4 text-left shadow-[2px_2px_0px_#000] relative">
                    <div className="absolute top-1 right-1 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#3B00FF] animate-ping" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#3B00FF]" />
                    </div>
                    <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-black block mb-2">SCANNING STAGE</span>
                    
                    <ul className="flex flex-col gap-2">
                      {STAGES.map((stage, idx) => (
                        <li 
                          key={stage}
                          className={`text-xs flex items-center gap-2 transition-all duration-300 font-mono ${
                            idx === loadingStage 
                              ? 'text-[#3B00FF] font-extrabold scale-[1.02] origin-left' 
                              : idx < loadingStage 
                                ? 'text-zinc-500 line-through' 
                                : 'text-zinc-600 opacity-40'
                          }`}
                        >
                          <span className="text-[10px] shrink-0">
                            {idx < loadingStage ? '✓' : idx === loadingStage ? '↳' : '•'}
                          </span>
                          <span className="uppercase text-[10px] tracking-wide">{stage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mt-6 leading-relaxed max-w-sm">
                    Checking endpoints, scanning for names/credentials, generating sovereign rewrites and auditing provider routing risk.
                  </p>
                </motion.div>
              )}

              {/* 2. Ideal Result Dashboard */}
              {!isInspecting && result && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="flex flex-col gap-6"
                >
                  {/* Verdict & Score Header */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    {/* Verdict Card (7/12) */}
                    {(() => {
                      const styles = getVerdictStyles(result.verdict);
                      return (
                        <div className={`md:col-span-7 ${styles.bg} ${styles.glow} border p-6 flex flex-col justify-between relative`}>
                          <div className="absolute top-3 right-3 flex items-center gap-2">
                            <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-none">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block shrink-0" />
                              <span>ASI:ONE CONNECTED</span>
                            </div>
                            <div className="text-[9px] font-bold text-zinc-400 bg-black/40 px-2 py-0.5 border border-zinc-800">
                              VERDICT RECORDED
                            </div>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-widest font-black block text-zinc-400 mb-1">
                              DECISION VERDICT
                            </span>
                            <div className="flex items-center gap-3">
                              {styles.icon}
                              <h3 className="text-3xl font-black tracking-widest leading-none font-display">
                                {result.verdict}
                              </h3>
                            </div>
                          </div>
                          <div className="border-t border-zinc-800/40 pt-4 mt-6 flex flex-col gap-1.5 text-[10px] text-zinc-400">
                            <div>
                              <span className="text-white font-extrabold uppercase">ACTION PLAN:</span>{' '}
                              <span className="text-white font-black">{result.recommended_action}</span>
                            </div>
                            <div>
                              <span className="text-white font-extrabold uppercase">OPERATION MODE:</span>{' '}
                              <span className="text-[#3B00FF] font-black">{result.recommended_mode}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Risk Score Meter (5/12) */}
                    <div className="md:col-span-5 bg-[#121211]/80 border border-zinc-800 p-6 flex flex-col justify-between relative">
                      <div className="absolute top-3 right-3 text-[9px] font-bold text-zinc-400 bg-black/40 px-2 py-0.5 border border-zinc-800">
                        RISK: {result.risk_level}
                      </div>

                      <div>
                        <span className="text-[9px] uppercase tracking-widest font-black block text-zinc-500 mb-1">
                          BOUNDARY THREAT INDEX
                        </span>
                        <div className="text-3xl font-black text-white font-display">
                          {result.risk_score}<span className="text-[#3B00FF] text-lg">/100</span>
                        </div>
                      </div>

                      {/* Micro visual progress meter */}
                      <div className="mt-4 flex flex-col gap-1">
                        <div className="w-full bg-zinc-900 h-2 border border-zinc-800 relative">
                          <div 
                            className="bg-gradient-to-r from-[#3B00FF] to-red-600 h-full transition-all duration-1000"
                            style={{ width: `${result.risk_score}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[8px] text-zinc-500 font-bold uppercase mt-1">
                          <span>LOW (0)</span>
                          <span>MODERATE</span>
                          <span>HIGH</span>
                          <span>CRITICAL (100)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sensitive Entities Panel */}
                  {result.sensitive_entities && result.sensitive_entities.length > 0 ? (
                    <div className="bg-[#121211]/80 border border-zinc-800 p-6">
                      <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2.5 flex items-center gap-2">
                        <EyeOff size={14} className="text-red-500" />
                        <span>PII / EXPOSURES DETECTED ({result.sensitive_entities.length})</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.sensitive_entities.map((ent, idx) => (
                          <div key={idx} className="bg-[#1A1A19] border border-zinc-800 p-3.5 flex flex-col gap-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-white font-extrabold uppercase">{ent.type}</span>
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 ${getSeverityBadge(ent.severity)}`}>
                                {ent.severity}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-400 font-semibold bg-black/40 px-2 py-1 font-mono break-all border border-zinc-900 leading-normal">
                              MASKED: {ent.masked_example}
                            </div>
                            <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold">
                              ↳ {ent.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#121211]/80 border border-zinc-800 p-5 text-center text-xs text-zinc-500 uppercase font-bold flex items-center justify-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-500" />
                      <span>NO PERSONAL IDENTIFIERS OR CONFIDENTIAL FRAGMENTS DETECTED</span>
                    </div>
                  )}

                  {/* Safe Rewrite Panel */}
                  {result.safe_rewrite && (
                    <div className="bg-[#121211]/80 border border-[#3B00FF]/30 p-6 shadow-[0_0_20px_rgba(59,0,255,0.05)] relative">
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(result.safe_rewrite, 'rewrite')}
                          className="text-[9px] text-zinc-400 hover:text-white uppercase font-bold border border-zinc-800 hover:border-zinc-600 bg-black/50 px-2.5 py-1 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedRewrite ? <Check size={10} className="text-[#3B00FF]" /> : <Copy size={10} />}
                          <span>{copiedRewrite ? 'COPIED' : 'COPY REWRITE'}</span>
                        </button>
                      </div>

                      <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2.5 flex items-center gap-2">
                        <Lock size={14} className="text-[#3B00FF]" />
                        <span>SOVEREIGN CLOUD SAFE REWRITE</span>
                      </h3>

                      <div className="bg-black/60 border border-zinc-900 p-4 text-xs text-zinc-300 font-mono leading-relaxed select-text whitespace-pre-wrap">
                        {result.safe_rewrite}
                      </div>

                      <div className="mt-4 bg-[#1A1A19] border border-zinc-800 p-3 text-[10px] leading-relaxed uppercase text-zinc-400">
                        <span className="text-white font-extrabold">REDACTION NOTE:</span> THIS REWRITE PRESERVES THE ORIGINAL INTENT WHILE ELIMINATING GEOPOLITICAL COMPLIANCE THREATS.
                      </div>
                    </div>
                  )}

                  {/* 4-Agent Opinions Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Privacy Prosecutor Card */}
                    <div className="bg-[#121211]/80 border border-zinc-800 p-5 flex flex-col gap-3 relative">
                      <div className="text-[8px] font-bold text-zinc-400 bg-black/40 px-2 py-0.5 border border-zinc-800 absolute top-3 right-3">
                        AGENT 1
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#3B00FF] rounded-full inline-block animate-pulse" />
                        <span>PRIVACY PROSECUTOR</span>
                      </h4>
                      <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
                        {result.agent_opinions?.privacy_prosecutor?.summary}
                      </p>
                      {result.agent_opinions?.privacy_prosecutor?.findings && (
                        <ul className="flex flex-col gap-1 border-t border-zinc-900 pt-2 text-[9px] text-zinc-500 font-bold uppercase">
                          {result.agent_opinions.privacy_prosecutor.findings.map((f, i) => (
                            <li key={i} className="flex gap-1.5 items-start">
                              <span className="text-[#3B00FF] font-black">▸</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Cloud Investigator Card */}
                    <div className="bg-[#121211]/80 border border-zinc-800 p-5 flex flex-col gap-3 relative">
                      <div className="text-[8px] font-bold text-zinc-400 bg-black/40 px-2 py-0.5 border border-zinc-800 absolute top-3 right-3">
                        AGENT 2
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#3B00FF] rounded-full inline-block animate-pulse" />
                        <span>CLOUD INVESTIGATOR</span>
                      </h4>
                      <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
                        {result.agent_opinions?.cloud_investigator?.summary}
                      </p>
                      {result.agent_opinions?.cloud_investigator?.exposure_notes && (
                        <ul className="flex flex-col gap-1 border-t border-zinc-900 pt-2 text-[9px] text-zinc-500 font-bold uppercase">
                          {result.agent_opinions.cloud_investigator.exposure_notes.map((n, i) => (
                            <li key={i} className="flex gap-1.5 items-start">
                              <span className="text-[#3B00FF] font-black">▸</span>
                              <span>{n}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Redaction Engineer Card */}
                    <div className="bg-[#121211]/80 border border-zinc-800 p-5 flex flex-col gap-3 relative">
                      <div className="text-[8px] font-bold text-zinc-400 bg-black/40 px-2 py-0.5 border border-zinc-800 absolute top-3 right-3">
                        AGENT 3
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#3B00FF] rounded-full inline-block animate-pulse" />
                        <span>REDACTION ENGINEER</span>
                      </h4>
                      <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
                        {result.agent_opinions?.redaction_engineer?.summary}
                      </p>
                      {result.agent_opinions?.redaction_engineer?.changes_made && (
                        <ul className="flex flex-col gap-1 border-t border-zinc-900 pt-2 text-[9px] text-zinc-500 font-bold uppercase">
                          {result.agent_opinions.redaction_engineer.changes_made.map((c, i) => (
                            <li key={i} className="flex gap-1.5 items-start">
                              <span className="text-[#3B00FF] font-black">▸</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Evidence Judge Card */}
                    <div className="bg-[#121211]/80 border border-zinc-800 p-5 flex flex-col gap-3 relative">
                      <div className="text-[8px] font-bold text-zinc-400 bg-black/40 px-2 py-0.5 border border-zinc-800 absolute top-3 right-3">
                        AGENT 4
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#3B00FF] rounded-full inline-block animate-pulse" />
                        <span>EVIDENCE JUDGE</span>
                      </h4>
                      <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
                        {result.agent_opinions?.evidence_judge?.summary}
                      </p>
                      {result.agent_opinions?.evidence_judge?.final_reason && (
                        <div className="border-t border-zinc-900 pt-2 text-[9px] text-zinc-500 font-bold uppercase flex gap-1.5 items-start">
                          <span className="text-red-500 font-black">⚖</span>
                          <span>{result.agent_opinions.evidence_judge.final_reason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Data Passport Card */}
                  {result.data_passport && (
                    <div className="bg-[#121211]/80 border border-zinc-800 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B00FF]/5 rounded-full blur-2xl pointer-events-none" />

                      <div className="flex flex-col gap-2 max-w-xl">
                        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <Fingerprint size={14} className="text-[#3B00FF] animate-pulse" />
                          <span>DATA PASSPORT CERTIFICATE INCIDENT</span>
                        </h3>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
                          {result.data_passport.summary}
                        </p>
                        {result.data_passport.risk_badges && result.data_passport.risk_badges.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {result.data_passport.risk_badges.map((badge, i) => (
                              <span key={i} className="text-[8px] font-black uppercase bg-[#1A1A19] border border-zinc-850 px-2 py-0.5 text-[#3b00ff] shadow-[1px_1px_0px_#000]">
                                {badge}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 flex flex-col gap-1 text-right text-[10px] w-full md:w-auto font-mono">
                        <span className="text-zinc-500 uppercase font-bold block mb-1">RECOMMENDED ACTION:</span>
                        <span className="text-[#3B00FF] font-black uppercase text-sm border-b border-zinc-800 pb-1.5 mb-1.5">
                          {result.data_passport.recommended_next_step || 'SOVEREIGN LOCAL SHIELDING'}
                        </span>
                        <span className="text-[8px] text-zinc-500 uppercase">EVIDENCE CONFIDENCE: {result.evidence_level || 'INFERRED'}</span>
                      </div>
                    </div>
                  )}

                  {/* Disclaimer block */}
                  <div className="border border-zinc-900 bg-black/40 p-4 text-[10px] leading-relaxed uppercase text-zinc-500 flex gap-2 items-start">
                    <Info size={14} className="text-zinc-500 shrink-0 mt-0.5" />
                    <p>{result.disclaimer}</p>
                  </div>
                </motion.div>
              )}

              {/* 3. Empty State Checkpoint */}
              {!isInspecting && !result && (
                <div className="bg-[#121211]/80 border border-zinc-800 p-8 h-full flex flex-col justify-center items-center text-center backdrop-blur-md min-h-[500px] shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
                  <div className="border border-zinc-800 bg-[#1A1A19] p-4 mb-6 shadow-[3px_3px_0px_#000]">
                    <ShieldAlert size={36} className="text-[#3B00FF]" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                    AWAITING SECURITY SCANNING
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm leading-relaxed mb-6 font-semibold uppercase">
                    Provide a prompt payload on the left parameter console and initiate “Inspect with ASI:ONE” to analyze your data border boundaries.
                  </p>
                  
                  <div className="border border-dashed border-zinc-800 p-4 max-w-md w-full text-left font-mono text-[10px] text-zinc-500 font-semibold uppercase leading-relaxed">
                    <span className="text-white font-extrabold block mb-1">🔍 DETECTABLE BOUNDARY HAZARDS:</span>
                    • Cross-border endpoint routing and foreign cloud storage residency.<br />
                    • Identification of direct personal identity indices (PII) & salaries.<br />
                    • Disclosed subprocessors list and retention periods.
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
