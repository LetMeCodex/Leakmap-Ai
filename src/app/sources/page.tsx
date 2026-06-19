'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { sourceRegistry, SourceItem } from '../../lib/sourceRegistry';
import { buildSourceUrl } from '../../lib/siteUrl';
import EvidenceQRCode from '../../components/evidence/EvidenceQRCode';
import { ArrowLeft, ExternalLink, Copy, Check, ShieldAlert, Library, BookOpen } from 'lucide-react';

function SourcesVaultContent() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Group sources by provider category
  const categories = [
    {
      name: "Google / Gemini",
      sources: sourceRegistry.filter(s => s.provider === "Google Gemini")
    },
    {
      name: "Google Cloud",
      sources: sourceRegistry.filter(s => s.provider === "Google Cloud")
    },
    {
      name: "OpenAI",
      sources: sourceRegistry.filter(s => s.provider === "OpenAI")
    },
    {
      name: "Anthropic / Claude",
      sources: sourceRegistry.filter(s => s.provider === "Anthropic Claude" || s.provider === "Anthropic")
    },
    {
      name: "LeakMap Methodology",
      sources: sourceRegistry.filter(s => s.provider === "LeakMap Methodology")
    }
  ];

  const getBadgeText = (type: string) => {
    switch (type) {
      case 'official-policy':
        return 'OFFICIAL POLICY';
      case 'subprocessor-disclosure':
        return 'PROCESSOR DISCLOSURE';
      case 'configuration-evidence':
        return 'CONFIGURATION EVIDENCE';
      case 'retention-evidence':
        return 'RETENTION EVIDENCE';
      case 'methodology-limit':
      default:
        return 'METHODOLOGY LIMITATION';
    }
  };

  const getBadgeColors = (type: string) => {
    switch (type) {
      case 'official-policy':
        return 'bg-[#00AEEF]/10 text-[#00AEEF] border-[#00AEEF]';
      case 'subprocessor-disclosure':
        return 'bg-[#3B00FF]/10 text-[#3B00FF] border-[#3B00FF]';
      case 'configuration-evidence':
        return 'bg-[#DFA100]/10 text-[#DFA100] border-[#DFA100]';
      case 'retention-evidence':
        return 'bg-[#00B873]/10 text-[#00B873] border-[#00B873]';
      case 'methodology-limit':
      default:
        return 'bg-[#77776F]/10 text-[#77776F] border-[#77776F]';
    }
  };

  const getConfidenceText = (conf: string, id: string) => {
    if (id === 'SRC-LIMITATION-001') return 'METHODOLOGY';
    switch (conf) {
      case 'high':
        return 'HIGH';
      case 'medium-high':
        return 'MEDIUM-HIGH';
      case 'medium':
      default:
        return 'MEDIUM';
    }
  };

  return (
    <div className="flex-grow w-full bg-[#F4F2EC] text-[#050505] font-mono py-10 px-6 max-w-7xl mx-auto flex flex-col gap-10 select-none">
      
      {/* Navigation */}
      <div className="border-b border-black pb-4 print:hidden">
        <Link 
          href="/"
          className="flex items-center gap-2 text-xs font-bold uppercase hover:text-[#3B00FF] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Landing Page</span>
        </Link>
      </div>

      {/* Header Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b-2 border-black pb-8 items-start">
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#77776F]">
            <span>[00] SOURCE VAULT / POLICY LEDGER / SYSTEM LIMITATIONS</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black font-display tracking-tight leading-[0.85] uppercase text-black">
            OFFICIAL<br />
            SOURCE VAULT
          </h1>
          <p className="text-sm font-semibold text-black leading-relaxed max-w-2xl mt-2 border-l-2 border-black pl-4">
            All public sources used to support LeakMap’s provider profiles, exposure model, risk rules, and methodology boundaries.
          </p>
        </div>
        
        <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-between gap-4 h-full">
          <span className="border-4 border-double border-black p-3 font-mono font-black text-center uppercase tracking-widest text-[9px] bg-white shadow-[3px_3px_0px_#050505]">
            <div className="text-[6px] tracking-tight font-extrabold border-b border-black pb-0.5 mb-1.5 text-[#77776F]">CREDIBILITY ENGINE</div>
            <div className="text-xs font-black">SOURCE VERIFICATION</div>
            <div className="text-[8px] text-[#3B00FF] font-bold mt-1">SOURCES REGISTERED: 09</div>
          </span>
        </div>
      </section>

      {/* Methodology Warning Banner */}
      <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#050505] flex gap-4 items-start leading-relaxed uppercase font-semibold text-[11px] text-[#050505]">
        <ShieldAlert size={20} className="text-[#DFA100] shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-black block mb-1">Methodology Notice Statement:</span> 
          <p>
            Sources listed here support policy, retention, subprocessor, data residency, or methodology claims. They do not prove exact physical processing paths for individual prompts.
          </p>
        </div>
      </div>

      {/* Categories & Source Cards */}
      <div className="flex flex-col gap-12">
        {categories.map((cat) => (
          <div key={cat.name} className="flex flex-col gap-6">
            
            {/* Category Header */}
            <div className="border-b border-black pb-2 flex items-center gap-2">
              <Library size={16} className="text-[#3B00FF]" />
              <h2 className="text-lg font-black text-black uppercase tracking-tight">{cat.name}</h2>
            </div>

            {/* Grid of source cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.sources.map((source) => {
                const individualSourceUrl = buildSourceUrl(source.id);
                
                return (
                  <div 
                    key={source.id}
                    className="border-[1.5px] border-[#050505] bg-[#F8F7F2] p-6 flex flex-col justify-between gap-6 shadow-none hover:shadow-[5px_5px_0px_#050505] hover:-translate-y-0.5 transition-all duration-200 uppercase"
                  >
                    
                    {/* Header ID */}
                    <div className="flex justify-between items-center border-b border-black/10 pb-2">
                      <span className="text-[9px] font-mono text-[#77776F] font-bold">
                        {source.id}
                      </span>
                      <span className={`px-2 py-0.5 text-[8.5px] font-black border uppercase ${getBadgeColors(source.evidenceType)}`}>
                        {getBadgeText(source.evidenceType)}
                      </span>
                    </div>

                    {/* Main details */}
                    <div className="flex flex-col gap-4 flex-grow">
                      <div>
                        <span className="text-[7.5px] text-[#77776F] font-bold block">Provider</span>
                        <h3 className="text-xs font-black text-black tracking-tight">{source.provider.toUpperCase()}</h3>
                      </div>

                      <div>
                        <span className="text-[7.5px] text-[#77776F] font-bold block">Document</span>
                        <h4 className="text-xs font-black text-black leading-snug tracking-tight">{source.title.toUpperCase()}</h4>
                      </div>

                      <div>
                        <span className="text-[7.5px] text-[#77776F] font-bold block mb-1">Claim Supported</span>
                        <p className="text-[10px] text-black font-semibold bg-white p-3 border border-black/10 leading-relaxed normal-case">
                          "{source.claimSupported}"
                        </p>
                      </div>
                    </div>

                    {/* QR Code visual */}
                    <div className="flex justify-center border-t border-black/10 pt-4">
                      <EvidenceQRCode 
                        value={individualSourceUrl} 
                        label={`VERIFY ${source.id}`}
                        destinationType="sources"
                        id={source.id}
                        size={80}
                        providerName={source.provider}
                      />
                    </div>

                    {/* Bottom Metadata & Actions */}
                    <div className="border-t border-black/10 pt-4 flex flex-col gap-3.5">
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <div>
                          <span className="text-[#77776F] text-[7.5px] block font-bold">Confidence</span>
                          <span className="text-[#3B00FF] font-black">{getConfidenceText(source.confidence, source.id)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[#77776F] text-[7.5px] block font-bold">Reviewed</span>
                          <span className="text-black">{source.lastReviewed}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {source.sourceUrl.startsWith('http') ? (
                          <a 
                            href={source.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full py-2 bg-[#3B00FF] hover:bg-black text-white text-center text-[10px] font-black uppercase tracking-wider border border-black shadow-[2px_2px_0px_#050505] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            Open Official Source <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="w-full py-2 bg-white text-black text-center text-[10px] font-black uppercase border border-black flex items-center justify-center gap-1">
                            Heuristic Limits <BookOpen size={10} />
                          </span>
                        )}

                        <button 
                          onClick={() => handleCopyId(source.id)}
                          className="w-full py-1.5 bg-white hover:bg-[#F4F2EC] text-black text-center text-[10px] font-black uppercase border border-black transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {copiedId === source.id ? (
                            <>
                              <Check size={10} className="text-green-600" />
                              <span>COPIED ID</span>
                            </>
                          ) : (
                            <>
                              <Copy size={10} />
                              <span>COPY SOURCE ID</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default function SourcesVaultPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex flex-col items-center justify-center min-h-[500px] text-center bg-[#F4F2EC] font-mono">
        <div className="w-8 h-8 border-4 border-black border-t-[#3B00FF] animate-spin rounded-none mb-4" />
        <p className="text-xs font-mono text-[#050505] font-bold uppercase tracking-widest">
          Resolving Source Vault...
        </p>
      </div>
    }>
      <SourcesVaultContent />
    </Suspense>
  );
}
