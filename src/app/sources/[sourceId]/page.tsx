'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { getSourceById, SourceRegistryEntry } from '../../../lib/sourceRegistry';
import { buildSourceUrl } from '../../../lib/siteUrl';
import EvidenceQRCode from '../../../components/evidence/EvidenceQRCode';
import { 
  ArrowLeft, 
  ExternalLink, 
  FileText, 
  ShieldAlert, 
  BookOpen,
  Calendar,
  Cpu
} from 'lucide-react';

interface PageProps {
  params: Promise<{ sourceId: string }>;
}

export default function SourceDetailPage({ params }: PageProps) {
  const { sourceId } = use(params);
  const [source, setSource] = useState<SourceRegistryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const entry = getSourceById(sourceId);
    if (entry) {
      setSource(entry);
    }
    setLoading(false);
  }, [sourceId]);

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[500px] text-center bg-[#F4F2EC] font-mono">
        <div className="w-8 h-8 border-4 border-black border-t-[#3B00FF] animate-spin rounded-none mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest text-black">
          Locating Source Record {sourceId}...
        </p>
      </div>
    );
  }

  if (!source) {
    return (
      <div className="flex-grow w-full bg-[#F4F2EC] text-[#050505] font-mono py-12 px-6 max-w-3xl mx-auto flex flex-col gap-8 justify-center select-none">
        <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_#050505] text-center flex flex-col gap-6 items-center">
          <ShieldAlert size={48} className="text-red-600 animate-bounce" />
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-black uppercase text-black">SOURCE DOCUMENT NOT FOUND</h1>
            <p className="text-xs text-[#77776F] font-bold uppercase">ID: {sourceId}</p>
          </div>
          <p className="text-sm font-semibold uppercase text-black leading-relaxed max-w-md">
            This source identifier does not match any registered official provider disclosure inside the LeakMap compliance database.
          </p>
          <div className="flex flex-wrap gap-4 mt-2 justify-center w-full">
            <Link 
              href="/evidence"
              className="py-2.5 px-6 border border-black hover:bg-black hover:text-[#F8F7F2] text-xs font-bold uppercase transition-colors bg-white shadow-[2px_2px_0px_#050505]"
            >
              Back to Evidence Vault
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sourceUrl = buildSourceUrl(source.sourceId);

  return (
    <div className="flex-grow w-full bg-[#F4F2EC] text-[#050505] font-mono py-10 px-6 max-w-3xl mx-auto flex flex-col gap-6 select-none print:bg-white print:py-0 print:px-0">
      
      {/* Navigation (Hidden in print) */}
      <div className="border-b border-black pb-4 print:hidden">
        <Link 
          href="/evidence"
          className="flex items-center gap-2 text-xs font-bold uppercase hover:text-[#3B00FF] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Evidence Vault</span>
        </Link>
      </div>

      {/* Main Source card display */}
      <div className="border-4 border-black bg-white p-6 md:p-8 shadow-[6px_6px_0px_#050505] flex flex-col gap-6 relative print:shadow-none print:border-black">
        
        {/* Title row */}
        <div className="border-b-2 border-black pb-4 flex flex-col gap-2">
          <span className="text-[9px] text-[#77776F] font-black uppercase tracking-wider block">
            LEAKMAP SOURCE REGISTRY RECORD
          </span>
          <h2 className="text-2xl font-black text-black uppercase tracking-tight font-display">
            {source.title}
          </h2>
          <div className="flex flex-wrap gap-3 items-center mt-1 text-[9px] font-black uppercase">
            <span className="bg-[#050505] text-white px-2 py-0.5 border border-black">
              ID: {source.sourceId}
            </span>
            <span className="border border-black bg-[#F4F2EC] px-2 py-0.5">
              PROVIDER: {source.provider}
            </span>
            <span className="border border-black bg-[#F4F2EC] px-2 py-0.5">
              CONFIDENCE: {source.confidence}
            </span>
          </div>
        </div>

        {/* Caveat warning block */}
        <div className="border border-black bg-[#FDF2F2] p-4 text-[10.5px] leading-relaxed uppercase font-semibold text-black flex gap-2.5 items-start shadow-[1.5px_1.5px_0px_#050505]">
          <ShieldAlert size={16} className="text-red-600 shrink-0 mt-0.5" />
          <p>
            <span className="font-black text-red-700 block mb-1">Geopolitical Verification Boundary Statement:</span>
            This source supports a policy/configuration/subprocessor claim, not exact internal prompt travel. LeakMap does not claim to observe internal backend routing of blackbox networks.
          </p>
        </div>

        {/* Source Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          <div className="md:col-span-8 flex flex-col gap-5 uppercase">
            
            <div>
              <span className="text-[8px] text-[#77776F] font-bold block mb-1">Document Type</span>
              <p className="text-xs font-black text-black">{source.documentType}</p>
            </div>

            <div>
              <span className="text-[8px] text-[#77776F] font-bold block mb-1">Verification Statement / Claim Supported</span>
              <p className="text-xs font-black text-black leading-relaxed bg-[#F4F2EC] p-3 border border-black font-semibold">
                "{source.claimSupported}"
              </p>
            </div>

            <div>
              <span className="text-[8px] text-[#77776F] font-bold block mb-1">Evidence Type Heuristic</span>
              <p className="text-xs font-black text-[#3B00FF]">{source.evidenceType}</p>
            </div>

            <div className="flex gap-6">
              <div>
                <span className="text-[8px] text-[#77776F] font-bold block mb-0.5">Last Reviewed</span>
                <p className="text-[10px] font-bold flex items-center gap-1 text-[#77776F]">
                  <Calendar size={11} /> {source.lastReviewed}
                </p>
              </div>
              {source.notes && (
                <div>
                  <span className="text-[8px] text-[#77776F] font-bold block mb-0.5">Database Notes</span>
                  <p className="text-[10px] font-semibold text-black lowercase">{source.notes}</p>
                </div>
              )}
            </div>

          </div>

          {/* QR Side card */}
          <div className="md:col-span-4 flex justify-center">
            <EvidenceQRCode 
              value={sourceUrl}
              label="SCAN TO REOPEN SOURCE"
              destinationType="sources"
              id={source.sourceId}
              size={90}
            />
          </div>

        </div>

        {/* Action Button */}
        <div className="border-t border-black pt-5 flex justify-between items-center">
          <span className="text-[8px] font-mono text-[#77776F] uppercase">
            SHA256: {source.sourceId}-REGISTER-CHECK
          </span>
          {source.sourceUrl.startsWith('http') ? (
            <a 
              href={source.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="py-2.5 px-5 bg-[#3B00FF] hover:bg-black text-white text-xs font-bold uppercase transition-all border border-black shadow-[3px_3px_0px_#050505] flex items-center gap-1.5 cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#050505]"
            >
              Open Official Source <ExternalLink size={12} />
            </a>
          ) : (
            <Link 
              href="/evidence"
              className="py-2.5 px-5 bg-[#050505] hover:bg-[#3B00FF] text-white text-xs font-bold uppercase transition-all border border-black shadow-[3px_3px_0px_#050505] flex items-center gap-1.5 cursor-pointer"
            >
              Open Heuristic limits <BookOpen size={12} />
            </Link>
          )}
        </div>

      </div>

    </div>
  );
}
