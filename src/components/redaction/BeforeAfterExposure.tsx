'use client';

import React from 'react';
import { ArrowRight, ShieldCheck, ShieldAlert, Zap } from 'lucide-react';

interface ComparisonProps {
  originalScore: number;
  redactedScore: number;
  providerId: string;
  detectedEntities: string[];
  onSwitchToLocal?: () => void;
}

export default function BeforeAfterExposure({
  originalScore,
  redactedScore,
  providerId,
  detectedEntities,
  onSwitchToLocal
}: ComparisonProps) {
  const reduction = originalScore - redactedScore;
  const isLocal = providerId === 'local';

  return (
    <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#050505] w-full font-mono text-xs select-none flex flex-col gap-5">
      <div className="border-b border-black pb-2 flex justify-between items-center">
        <h4 className="font-black text-black uppercase tracking-tight">BEFORE / AFTER EXPOSURE COMPARISON</h4>
        <span className="text-[9px] font-black bg-[#EF2B2B] text-white px-2 py-0.5 border border-black uppercase tracking-wider animate-pulse">
          RISK DIFFERENTIAL
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Side: Original Exposure */}
        <div className="border border-black p-4 bg-[#F4F2EC]/40 flex flex-col gap-2 relative shadow-[2px_2px_0px_#050505]">
          <span className="text-[8px] text-[#77776F] font-bold block">01 // PRE-SANITIZATION STATE</span>
          <h5 className="font-black text-[#EF2B2B] uppercase text-[11px]">ORIGINAL PROMPT PAYLOAD</h5>
          
          <div className="mt-2 flex flex-col gap-1 text-black font-semibold uppercase text-[10px]">
            <div className="flex justify-between">
              <span>Threat Score:</span>
              <span className="text-[#EF2B2B] font-black">{originalScore} / 100</span>
            </div>
            <div className="flex justify-between">
              <span>PII Vulnerabilities:</span>
              <span className="truncate max-w-[150px]">{detectedEntities.length > 0 ? detectedEntities.join(', ') : 'NONE'}</span>
            </div>
            <div className="flex justify-between">
              <span>Route exposure:</span>
              <span className="text-right truncate max-w-[140px]">
                {isLocal ? 'LOCALHOST ONLY' : 'INDIA → SG GATEWAY → US CLOUD'}
              </span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-[#EBE9E2] border border-black overflow-hidden mt-3">
            <div className="h-full bg-[#EF2B2B]" style={{ width: `${originalScore}%` }} />
          </div>
        </div>

        {/* Right Side: Redacted Exposure */}
        <div className="border border-[#3B00FF] p-4 bg-[#3B00FF]/5 flex flex-col gap-2 relative shadow-[2px_2px_0px_#3B00FF]">
          <span className="text-[8px] text-[#3B00FF] font-bold block">02 // POST-REDACTION SHIELD</span>
          <h5 className="font-black text-[#3B00FF] uppercase text-[11px]">REDACTED PROMPT PAYLOAD</h5>

          <div className="mt-2 flex flex-col gap-1 text-black font-semibold uppercase text-[10px]">
            <div className="flex justify-between">
              <span>Threat Score:</span>
              <span className="text-[#3B00FF] font-black">{redactedScore} / 100</span>
            </div>
            <div className="flex justify-between">
              <span>Entities Masked:</span>
              <span className="text-[#00B873] font-black">YES</span>
            </div>
            <div className="flex justify-between">
              <span>Route exposure:</span>
              <span className="text-right truncate max-w-[140px]">
                {isLocal ? 'LOCALHOST ONLY' : 'INDIA → SG GATEWAY (REDACTED)'}
              </span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-[#EBE9E2] border border-black overflow-hidden mt-3">
            <div className="h-full bg-[#3B00FF]" style={{ width: `${redactedScore}%` }} />
          </div>
        </div>
      </div>

      {/* Reduction Highlights Callout */}
      <div className="border border-black bg-white p-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[2px_2px_0px_#050505]">
        <div className="flex items-center gap-2 text-black font-extrabold uppercase">
          <Zap size={14} className="text-[#DFA100] animate-bounce" />
          <span>PROMPT TRANSIT RISK REDUCED BY <span className="text-[#3B00FF] font-black text-sm">{reduction} POINTS</span></span>
        </div>

        {onSwitchToLocal && !isLocal && (
          <button
            onClick={onSwitchToLocal}
            className="border border-black bg-white px-3 py-1.5 text-[9px] font-black text-[#00B873] hover:bg-black hover:text-white transition-all uppercase tracking-wider cursor-pointer shadow-[2px_2px_0px_#050505] flex items-center gap-1 shrink-0"
          >
            Switch to Local Sovereign Mode <ArrowRight size={10} />
          </button>
        )}
      </div>
    </div>
  );
}
