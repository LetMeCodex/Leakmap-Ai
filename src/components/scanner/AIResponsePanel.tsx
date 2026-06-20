'use client';

import React, { useState } from 'react';
import { useScanStore } from '../../store/useScanStore';

export default function AIResponsePanel() {
  const { activeResult, isAnalyzing } = useScanStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!activeResult) return;
    navigator.clipboard.writeText(activeResult.aiResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSimulatedLocal = activeResult && activeResult.mode === 'local' && (
    activeResult.aiResponse.includes('Simulated local route') || 
    activeResult.aiResponse.includes('Simulated Sovereign Node')
  );

  if (isAnalyzing) {
    return (
      <div className="w-full bg-white border-2 border-black rounded-none p-6 min-h-[220px] flex flex-col items-center justify-center text-center select-none shadow-[4px_4px_0px_#050505]">
        {/* Brutalist block spin loader */}
        <div className="w-8 h-8 border-4 border-black border-t-brutalist-blue animate-spin rounded-none mb-4" />
        <p className="text-xs font-mono text-brutalist-text font-bold uppercase tracking-widest">
          (STATUS) INITIATING SOCKET TRACE...
        </p>
        <p className="text-[10px] text-brutalist-muted mt-2 font-mono max-w-[280px]">
          Verifying sovereignty routing protocols & auditing global compute endpoint pipelines.
        </p>
      </div>
    );
  }

  if (!activeResult) {
    return (
      <div className="w-full bg-white border-2 border-black rounded-none p-6 min-h-[220px] flex flex-col items-center justify-center text-center select-none text-brutalist-muted shadow-[4px_4px_0px_#050505]">
        <span className="text-xs font-mono font-bold tracking-widest text-brutalist-text uppercase">
          [ AWAITING PROTOCOL TRACE ]
        </span>
        <p className="text-[10px] text-brutalist-muted mt-2 font-mono max-w-[280px]">
          Enter prompt parameters above and execute trace routing to monitor transmission paths.
        </p>
      </div>
    );
  }

  const getModeBadge = (mode: string) => {
    switch (mode) {
      case 'live':
        return (
          <span className="border border-black px-2 py-0.5 text-[10px] bg-brutalist-blue text-white font-bold uppercase tracking-wider">
            Live API Response
          </span>
        );
      case 'demo':
        return (
          <span className="border border-black px-2 py-0.5 text-[10px] bg-brutalist-amber text-black font-bold uppercase tracking-wider">
            Demo Fallback Response
          </span>
        );
      case 'evidence':
        return (
          <span className="border border-black px-2 py-0.5 text-[10px] bg-[#050505] text-[#F4F2EC] font-bold uppercase tracking-wider">
            Evidence Simulation
          </span>
        );
      case 'local':
      default:
        return (
          <span className="border border-black px-2 py-0.5 text-[10px] bg-brutalist-lime text-black font-bold uppercase tracking-wider">
            Local Sovereign Response
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-white border-2 border-black rounded-none overflow-hidden flex flex-col min-h-[220px] shadow-[4px_4px_0px_#050505]">
      
      {/* Header bar */}
      <div className="px-5 py-3 border-b border-black bg-[#F4F2EC] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-brutalist-blue inline-block" />
          {getModeBadge(activeResult.mode)}
        </div>

        <button
          onClick={handleCopy}
          className="font-mono text-[10px] font-bold border border-black px-2 py-0.5 hover:bg-black hover:text-white transition-colors cursor-pointer"
          title="Copy payload response"
        >
          {copied ? 'COPIED' : 'COPY PAYLOAD'}
        </button>
      </div>

      {isSimulatedLocal && (
        <div className="px-5 py-2.5 border-b border-black bg-brutalist-amber/10 text-brutalist-amber text-[10px] font-mono font-bold uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brutalist-amber animate-pulse shrink-0" />
          <span>Simulated local route — no external API call was made.</span>
        </div>
      )}

      {/* Response content */}
      <div className="p-5 flex-1 select-text bg-white">
        <pre className="text-xs leading-relaxed text-brutalist-text font-mono whitespace-pre-wrap font-medium">
          {activeResult.aiResponse}
        </pre>
      </div>

      {/* Structured Telemetry Metadata */}
      <div className="px-5 py-4 border-t border-black bg-[#F8F7F2] text-[10.5px] font-mono text-black leading-relaxed flex flex-col gap-3">
        <div className="border-b border-black/10 pb-1.5 flex items-center justify-between">
          <span className="font-black uppercase tracking-wider text-[9px] text-[#77776F]">Exposure Model Telemetry</span>
          <span className="font-extrabold text-[9px] text-[#3B00FF] uppercase bg-[#3B00FF]/5 border border-[#3B00FF]/15 px-2 py-0.5">
            MODEL ID: {activeResult.id.substring(0, 10)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10.5px]">
          <div>
            <span className="font-extrabold text-[#77776F] uppercase block text-[8px] tracking-wider mb-0.5">Base Pathway</span>
            <p className="font-bold uppercase leading-tight text-black">{getBasePathwayText(activeResult.providerId)}</p>
          </div>
          <div>
            <span className="font-extrabold text-[#77776F] uppercase block text-[8px] tracking-wider mb-0.5">Prompt Risk Overlay</span>
            <p className="font-bold uppercase leading-tight text-black">{getRiskOverlayText(activeResult.sensitivityLevel)}</p>
          </div>
          <div>
            <span className="font-extrabold text-[#77776F] uppercase block text-[8px] tracking-wider mb-0.5">Trace Limitation</span>
            <p className="font-semibold text-black uppercase leading-tight">Private internal provider routing remains unobservable. This models jurisdictional exposure.</p>
          </div>
          <div>
            <span className="font-extrabold text-[#77776F] uppercase block text-[8px] tracking-wider mb-0.5">Recommendation</span>
            <p className="font-semibold text-black uppercase leading-tight">{getRecommendationText(activeResult.sensitivityLevel)}</p>
          </div>
        </div>
      </div>

      {/* Footer warning */}
      {activeResult.mode !== 'local' && (
        <div className="px-5 py-3 border-t border-black bg-[#FDFBF7] text-[10px] font-mono text-brutalist-text leading-relaxed flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-brutalist-red font-bold">
            <span className="w-2 h-2 bg-brutalist-red inline-block" />
            <span>WARNING: DECRYPTION EXPOSURE</span>
          </div>
          <p className="text-brutalist-muted leading-normal">
            Payload processed under international routing networks. Contractual exclusions prevent training, but standard US clouds (FISA Section 702) allow surveillance capture when endpoints cross jurisdictions.
          </p>
        </div>
      )}
    </div>
  );
}

const getBasePathwayText = (pId: string) => {
  switch (pId) {
    case 'gemini':
      return "India → Singapore Gateway (Verified) → Vertex AI Core (Disclosed) → US East Storage (Unknown)";
    case 'openai':
      return "India → Cloudflare CDN (Verified) → Azure SG Gateway (Verified) → OpenAI US West Backend (Disclosed) → Ireland EU Review Node (Inferred)";
    case 'claude':
      return "India → Cloudflare Proxy (Verified) → AWS SG Endpoint (Verified) → AWS US East Compute (Disclosed)";
    case 'local':
    default:
      return "India → Localhost Sovereign Node (Verified)";
  }
};

const getRiskOverlayText = (level: string) => {
  switch (level) {
    case 'Public':
      return "Low Risk (Cyan) - General academic/public query";
    case 'Personal':
      return "Medium Risk (Amber) - Personal PII identifiers detected";
    case 'Confidential':
    case 'Sensitive':
      return "High Risk (Red-Amber) - Business cash flow/financial secrets detected";
    case 'Critical':
      return "Critical Risk (Pulsing Red) - Aadhaar/Health identifiers detected";
    default:
      return "Low Risk (Cyan)";
  }
};

const getRecommendationText = (level: string) => {
  switch (level) {
    case 'Public':
      return "Route to standard public or enterprise cloud models. Geopolitical leak risk is low.";
    case 'Personal':
      return "Enable pre-anonymization redaction toggle to filter personal PII before API transit.";
    case 'Confidential':
    case 'Sensitive':
      return "Filter business secrets / redact API keys or run locally on sovereign nodes.";
    case 'Critical':
      return "Must execute locally on-premise. Aadhaar/Health data must never enter public cloud APIs.";
    default:
      return "Safe to route.";
  }
};

