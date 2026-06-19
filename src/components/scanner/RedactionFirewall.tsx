'use client';

import React from 'react';
import { useScanStore } from '../../store/useScanStore';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export default function RedactionFirewall() {
  const { prompt, isRedacted, setIsRedacted, activeResult, providerId } = useScanStore();

  const isLocal = providerId === 'local';

  // Helper to highlight sensitive words in original prompt text
  const renderHighlightedPrompt = (text: string) => {
    if (!activeResult || activeResult.detectedEntities.length === 0) {
      return <p className="text-brutalist-text leading-relaxed font-mono">{text}</p>;
    }

    let elements: React.ReactNode[] = [];
    let keyIdx = 0;

    // Create a sorted list of matches by index to split text sequentially
    const matches = activeResult.detectedEntities.map(entity => {
      const index = text.indexOf(entity.match);
      return { ...entity, index };
    }).filter(m => m.index !== -1).sort((a, b) => a.index - b.index);

    let currentIndex = 0;
    matches.forEach((match) => {
      const matchPos = match.index;
      // Add standard text before match
      if (matchPos > currentIndex) {
        elements.push(
          <span key={`txt-${keyIdx++}`} className="text-brutalist-text leading-relaxed font-mono">
            {text.substring(currentIndex, matchPos)}
          </span>
        );
      }
      // Add highlighted entity
      elements.push(
        <span
          key={`ent-${keyIdx++}`}
          className="relative inline px-0.5 text-xs font-mono font-bold text-brutalist-text border-b-2 border-brutalist-text underline decoration-2 cursor-help select-all bg-[#B6FF00]/20 group"
          title={`Sensitive Entity Detected: ${match.type}`}
        >
          {match.match}
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-brutalist-text text-[8px] border border-white/10 px-1 py-0.5 rounded-none whitespace-nowrap text-white font-mono z-30">
            {match.type}
          </span>
        </span>
      );
      currentIndex = matchPos + match.match.length;
    });

    // Add trailing text
    if (currentIndex < text.length) {
      elements.push(
        <span key={`txt-${keyIdx++}`} className="text-brutalist-text leading-relaxed font-mono">
          {text.substring(currentIndex)}
        </span>
      );
    }

    return <p className="leading-relaxed">{elements}</p>;
  };

  if (!activeResult) return null;

  const hasEntities = activeResult.detectedEntities.length > 0;
  const originalScore = activeResult.originalRisk.score;
  const redactedScore = activeResult.redactedRisk.score;
  const reduction = originalScore - redactedScore;

  return (
    <div className="flex flex-col gap-4 font-mono select-none">
      {/* Header bar with Shield Status */}
      <div className="flex items-center justify-between border-b-2 border-brutalist-text pb-3">
        <div className="flex items-center gap-2">
          {isRedacted ? (
            <ShieldCheck className="text-brutalist-green animate-pulse" size={16} />
          ) : (
            <ShieldAlert className={hasEntities ? "text-brutalist-red animate-pulse" : "text-brutalist-muted"} size={16} />
          )}
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-brutalist-text">
            PII Redaction Firewall
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-brutalist-muted font-bold uppercase tracking-wider">
            {isRedacted ? 'Anonymized' : 'Raw Content'}
          </span>
          <button
            onClick={() => setIsRedacted(!isRedacted)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-none border-2 border-brutalist-text transition-colors duration-200 ease-in-out focus:outline-none ${
              isRedacted ? 'bg-brutalist-green' : 'bg-white'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-none border border-brutalist-text bg-brutalist-text transition duration-200 ease-in-out ${
                isRedacted ? 'translate-x-4 bg-white border-white' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Warnings & Notices */}
      {hasEntities && (
        <div className={`p-3 border-2 text-[11px] leading-relaxed flex gap-2.5 rounded-none font-semibold ${
          isRedacted 
            ? 'border-brutalist-green bg-white text-brutalist-green' 
            : isLocal 
              ? 'border-brutalist-blue bg-white text-brutalist-blue' 
              : 'border-brutalist-red bg-white text-brutalist-red'
        }`}>
          <div>
            {isRedacted ? (
              <>
                <span className="font-bold uppercase tracking-wider">[SANITY CLEAR]</span> Prompt contents have been tokenized. Leak risk reduced. Local loopback verification completed.
              </>
            ) : isLocal ? (
              <>
                <span className="font-bold uppercase tracking-wider">[LOCAL LOOP]</span> Prompt has sensitive fields but is routed internally (`localhost`). Redaction is recommended but not mandatory.
              </>
            ) : (
              <>
                <span className="font-bold uppercase tracking-wider">[LEAK WARNING]</span> You are routing raw, sensitive PII to an external cloud model without anonymization. Redaction is strongly recommended.
              </>
            )}
          </div>
        </div>
      )}

      {/* Entity Chips list */}
      {hasEntities && (
        <div className="flex flex-wrap gap-1.5">
          {Array.from(new Set(activeResult.detectedEntities.map(e => e.type))).map((type) => (
            <span
              key={type}
              className="text-[9px] font-mono border-2 border-brutalist-red text-brutalist-red px-2.5 py-0.5 rounded-none uppercase tracking-wider bg-white font-bold"
            >
              [{type}]
            </span>
          ))}
        </div>
      )}

      {/* Before / After Risk Score Card */}
      {hasEntities && (
        <div className="flex flex-col gap-1 border-t-2 border-b-2 border-brutalist-text py-4 select-none">
          <p className="text-[8px] font-mono text-brutalist-muted uppercase tracking-widest font-bold">Threat Mitigation Vector</p>
          <div className="flex items-baseline gap-4 font-display">
            <span className="text-4xl md:text-5xl lg:text-6xl font-black text-brutalist-text font-display">{originalScore}</span>
            <span className="text-2xl text-brutalist-muted font-bold font-mono">→</span>
            <span className="text-4xl md:text-5xl lg:text-6xl font-black text-brutalist-blue font-display">{redactedScore}</span>
            <span className="text-[9px] font-mono text-brutalist-green border-2 border-brutalist-green px-2 py-0.5 font-bold uppercase tracking-wider bg-white ml-2">
              -{reduction} risk points
            </span>
          </div>
        </div>
      )}

      {/* Side-by-side or Toggled Prompt Preview Box */}
      <div className="flex flex-col gap-2">
        <label className="text-[9px] font-mono text-brutalist-muted uppercase tracking-widest font-bold">
          {isRedacted ? 'Anonymized Input Stream' : 'Exposed Input Stream'}
        </label>
        <div className="w-full bg-white border-2 border-brutalist-text rounded-none p-4 min-h-[100px] text-xs font-mono select-text shadow-[3px_3px_0px_#050505] text-brutalist-text leading-relaxed">
          {isRedacted ? (
            <p className="text-brutalist-blue leading-relaxed font-bold">
              {activeResult.redactedPrompt}
            </p>
          ) : (
            renderHighlightedPrompt(activeResult.originalPrompt)
          )}
        </div>
      </div>
    </div>
  );
}
