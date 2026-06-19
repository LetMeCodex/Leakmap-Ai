'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { getEvidencePacket, getPassportRecord } from '../../../lib/db';
import { routeEvidenceCards, RouteEvidenceCard, confidenceLevels } from '../../../lib/evidenceRegistry';
import { getSourceById, SourceRegistryEntry } from '../../../lib/sourceRegistry';
import { rules, Rule } from '../../../lib/ruleBook';
import { buildEvidenceUrl } from '../../../lib/siteUrl';
import EvidenceQRCode from '../../../components/evidence/EvidenceQRCode';
import { 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle, 
  Printer, 
  Download, 
  ExternalLink, 
  Share2,
  Calendar,
  Layers,
  Cpu
} from 'lucide-react';

interface PageProps {
  params: Promise<{ evidenceId: string }>;
}

export default function EvidencePacketPage({ params }: PageProps) {
  const { evidenceId } = use(params);
  
  const [packet, setPacket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPacket() {
      try {
        setLoading(true);
        // 1. Try local storage / firestore
        const dbPacket = await getEvidencePacket(evidenceId);
        if (dbPacket) {
          setPacket(dbPacket);
        } else {
          // 2. Try registry fallback
          const registryPacket = routeEvidenceCards.find(c => c.id === evidenceId);
          if (registryPacket) {
            setPacket(registryPacket);
          }
        }
      } catch (e) {
        console.error('Failed to load evidence packet:', e);
      } finally {
        setLoading(false);
      }
    }
    loadPacket();
  }, [evidenceId]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadJSON = () => {
    if (!packet) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(packet, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `leakmap-evidence-${packet.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = buildEvidenceUrl(evidenceId);
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[500px] text-center bg-[#F4F2EC] font-mono">
        <div className="w-8 h-8 border-4 border-black border-t-[#3B00FF] animate-spin rounded-none mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest text-black">
          Decrypting Evidence Packet {evidenceId}...
        </p>
      </div>
    );
  }

  if (!packet) {
    return (
      <div className="flex-grow w-full bg-[#F4F2EC] text-[#050505] font-mono py-12 px-6 max-w-3xl mx-auto flex flex-col gap-8 justify-center select-none">
        <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_#050505] text-center flex flex-col gap-6 items-center">
          <AlertTriangle size={48} className="text-red-600 animate-bounce" />
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-black uppercase text-black">EVIDENCE PACKET NOT FOUND</h1>
            <p className="text-xs text-[#77776F] font-bold uppercase">ID: {evidenceId}</p>
          </div>
          <p className="text-sm font-semibold uppercase text-black leading-relaxed max-w-md">
            This evidence packet could not be verified by the LeakMap ledger. It may have expired, been cleared, or never registered in the system.
          </p>
          <div className="flex flex-wrap gap-4 mt-2 justify-center w-full">
            <Link 
              href="/evidence"
              className="py-2.5 px-6 border border-black hover:bg-black hover:text-[#F8F7F2] text-xs font-bold uppercase transition-colors"
            >
              Back to Evidence Vault
            </Link>
            <Link 
              href="/scanner"
              className="py-2.5 px-6 bg-[#3B00FF] hover:bg-black text-white text-xs font-bold uppercase transition-colors border border-black shadow-[3px_3px_0px_#050505]"
            >
              Open Active Scanner
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get matching sources from official source registry helper
  const linkedSources: SourceRegistryEntry[] = (packet.sourceIds || []).map((srcId: string) => 
    getSourceById(srcId)
  ).filter(Boolean) as SourceRegistryEntry[];

  // Get matching rules
  const linkedRules: Rule[] = rules.filter(r => 
    packet.ruleIds?.includes(r.id)
  );

  const getBadgeColors = (type: string) => {
    switch (type) {
      case 'verified':
        return 'bg-[#00AEEF] text-white border border-[#00AEEF]';
      case 'disclosed':
        return 'bg-[#3B00FF] text-white border border-[#3B00FF]';
      case 'inferred':
        return 'bg-[#DFA100] text-black border border-[#DFA100]';
      case 'unknown':
      default:
        return 'bg-[#77776F] text-white border border-[#77776F]';
    }
  };

  const selfVerificationUrl = buildEvidenceUrl(packet.id);

  return (
    <div className="flex-grow w-full bg-[#F4F2EC] text-[#050505] font-mono py-10 px-6 max-w-5xl mx-auto flex flex-col gap-8 select-none print:bg-white print:py-0 print:px-0">
      
      {/* Navigation & Print Actions (Hidden in print) */}
      <div className="flex justify-between items-center border-b border-black pb-4 print:hidden">
        <Link 
          href="/evidence"
          className="flex items-center gap-2 text-xs font-bold uppercase hover:text-[#3B00FF] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Evidence Vault</span>
        </Link>

        <div className="flex gap-2">
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-black hover:bg-black hover:text-white text-[10px] font-bold uppercase transition-colors bg-white shadow-[2px_2px_0px_#050505]"
          >
            <Share2 size={12} />
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
          <button 
            onClick={handleDownloadJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-black hover:bg-black hover:text-white text-[10px] font-bold uppercase transition-colors bg-white shadow-[2px_2px_0px_#050505]"
          >
            <Download size={12} />
            <span>Export JSON</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-black hover:bg-black hover:text-white text-[10px] font-bold uppercase transition-colors bg-white shadow-[2px_2px_0px_#050505]"
          >
            <Printer size={12} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Evidence Certificate Layout */}
      <div className="border-4 border-black bg-white p-6 md:p-8 shadow-[8px_8px_0px_#050505] flex flex-col gap-8 relative print:border-0 print:shadow-none">
        
        {/* Hologram stamp/watermark on top right */}
        <div className="absolute top-6 right-6 hidden md:flex flex-col items-center border-2 border-dashed border-[#3B00FF] p-2 bg-[#3B00FF]/5 text-[9px] uppercase tracking-wider text-[#3B00FF] font-black pointer-events-none select-none">
          <span>AI SECURITY PASSPORT</span>
          <span>VERIFIED LOG</span>
          <span className="text-xs mt-1">✓ INTEGRITY</span>
        </div>

        {/* Certificate Title Header */}
        <div className="border-b-2 border-black pb-6 flex flex-col gap-3">
          <span className="text-[10px] text-[#77776F] font-bold uppercase tracking-widest">
            LEAKMAP AI // PROOF AUDIT RECORD
          </span>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-black tracking-tight leading-tight">
            EVIDENCE PACKET: {packet.id}
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 text-xs font-semibold uppercase">
            <div>
              <span className="text-[7.5px] text-[#77776F] block font-bold">EVIDENCE TYPE</span>
              <span className={`px-2 py-0.5 text-[9px] font-black inline-block mt-0.5 ${getBadgeColors(packet.evidenceType)}`}>
                {packet.evidenceType}
              </span>
            </div>
            <div>
              <span className="text-[7.5px] text-[#77776F] block font-bold">CONFIDENCE SCORE</span>
              <span className="text-[#3B00FF] font-black text-sm mt-0.5 inline-block">{packet.confidenceScore}%</span>
            </div>
            <div>
              <span className="text-[7.5px] text-[#77776F] block font-bold">REGISTRY STATUS</span>
              <span className="text-black font-extrabold mt-0.5 inline-block">{packet.status || 'Active Ledger Log'}</span>
            </div>
            <div>
              <span className="text-[7.5px] text-[#77776F] block font-bold">LAST VERIFIED</span>
              <span className="text-[#77776F] mt-0.5 inline-block flex items-center gap-1"><Calendar size={11} /> 2026-06-20</span>
            </div>
          </div>
        </div>

        {/* Details row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          <div className="md:col-span-7 flex flex-col gap-6">
            
            {/* Conduit Details block */}
            <div className="border border-black bg-[#F4F2EC] p-4 flex flex-col gap-3 uppercase">
              <span className="text-[9px] text-[#77776F] font-bold">CONDUIT IDENTIFIER / JURISDICTION TARGET</span>
              <div className="text-md font-black text-black tracking-tight">
                {packet.routeLabel || `${packet.from} → ${packet.to}`}
              </div>
              <div className="grid grid-cols-2 gap-4 text-[10px] font-bold border-t border-black/15 pt-3">
                <div>
                  <span className="text-[#77776F] block text-[8px]">FROM (ORIGIN):</span>
                  <span className="text-black font-black">{packet.from}</span>
                </div>
                <div>
                  <span className="text-[#77776F] block text-[8px]">TO (TARGET):</span>
                  <span className="text-black font-black">{packet.to}</span>
                </div>
              </div>
            </div>

            {/* WHAT THIS PROVES */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-green-700 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} />
                <span>WHAT THIS PROVES</span>
              </span>
              <p className="text-xs text-black leading-relaxed bg-[#EAF7EC] border border-green-700 p-4 font-semibold uppercase">
                {packet.whatItProves || "LeakMap matched this route/warning to official provider documentation or runtime endpoint telemetry."}
              </p>
            </div>

            {/* WHAT THIS DOES NOT PROVE */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-red-600 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={14} />
                <span>WHAT THIS DOES NOT PROVE</span>
              </span>
              <p className="text-xs text-black leading-relaxed bg-[#FDF2F2] border border-red-600 p-4 font-semibold uppercase">
                {packet.whatItDoesNotProve || "This does not prove the exact hidden internal data center, GPU, server, or subprocessor path for this specific prompt."}
              </p>
            </div>

          </div>

          {/* Verification QR Section */}
          <div className="md:col-span-5 flex flex-col items-center gap-4">
            <span className="text-[9px] text-[#77776F] font-bold uppercase tracking-wider">Verification QR</span>
            <EvidenceQRCode 
              value={selfVerificationUrl}
              label="SCAN LEAKMAP EVIDENCE PACKET"
              destinationType="evidence"
              id={packet.id}
              size={120}
            />
          </div>

        </div>

        {/* Section: Linked Official Sources */}
        <div className="border-t border-black pt-6 flex flex-col gap-4">
          <span className="text-[10px] text-[#77776F] font-bold uppercase tracking-widest">
            OFFICIAL SOURCES CITATIONS
          </span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {linkedSources.map((source) => (
              <div 
                key={source.sourceId}
                className="border-2 border-black bg-[#F8F7F2] p-4 flex flex-col justify-between gap-4 shadow-[4px_4px_0px_#050505] print:shadow-none print:border-black"
              >
                <div className="border-b border-black/10 pb-2">
                  <span className="text-[8px] text-[#77776F] font-black">SOURCE ID: {source.sourceId}</span>
                  <h4 className="text-xs font-black text-black uppercase mt-0.5 truncate" title={source.title}>{source.title}</h4>
                  <div className="flex gap-2 items-center mt-1 text-[8px] font-black uppercase text-[#77776F]">
                    <span>{source.provider}</span>
                    <span>•</span>
                    <span>{source.documentType}</span>
                  </div>
                </div>

                <p className="text-[10px] text-black font-semibold uppercase leading-normal">
                  {source.claimSupported}
                </p>

                {/* Direct QR links options */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-black/10 items-start">
                  
                  {/* Left option: internal registry source page */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[7.5px] text-[#77776F] font-bold uppercase">LeakMap Portal</span>
                    <Link
                      href={`/sources/${source.sourceId}`}
                      className="py-1 px-2 border border-black bg-white hover:bg-black hover:text-white text-[9px] font-bold uppercase tracking-wider text-center transition-all shadow-[1px_1px_0px_#050505]"
                    >
                      View Source Slip
                    </Link>
                  </div>

                  {/* Right option: external URL check */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[7.5px] text-[#77776F] font-bold uppercase">External Source</span>
                    {source.sourceUrl.startsWith('http') ? (
                      <a
                        href={source.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1 px-2 border border-black bg-[#3B00FF] hover:bg-black text-white text-[9px] font-bold uppercase tracking-wider text-center transition-all shadow-[1px_1px_0px_#050505] flex items-center justify-center gap-1"
                      >
                        Open Source <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-[9px] text-[#77776F] uppercase italic text-center py-1">Internal Limits</span>
                    )}
                  </div>

                </div>

                {/* Two side-by-side direct QRs */}
                <div className="flex flex-col items-center gap-3 pt-3 border-t border-dashed border-black/10">
                  <span className="text-[7.5px] text-[#77776F] font-bold uppercase">Scan Direct Source Links</span>
                  <div className="flex gap-4 justify-center items-center w-full">
                    {/* Option A: internal route */}
                    <div className="flex flex-col items-center">
                      <EvidenceQRCode 
                        value={buildEvidenceUrl(packet.id)}
                        label="SCAN LEAKMAP EVIDENCE"
                        destinationType="evidence"
                        id={packet.id}
                        size={64}
                      />
                    </div>
                    {/* Option B: direct official external source */}
                    <div className="flex flex-col items-center">
                      <EvidenceQRCode 
                        value={source.sourceUrl.startsWith('http') ? source.sourceUrl : buildEvidenceUrl(packet.id)}
                        label="SCAN OFFICIAL SOURCE"
                        destinationType="sources"
                        id={source.sourceId}
                        size={64}
                        providerName={source.provider}
                      />
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Section: Applicable Rules Triggered */}
        <div className="border-t border-black pt-6 flex flex-col gap-4">
          <span className="text-[10px] text-[#77776F] font-bold uppercase tracking-widest">
            RULES APPLIED
          </span>
          {linkedRules.length > 0 ? (
            <div className="flex flex-col gap-3">
              {linkedRules.map((rule) => (
                <div 
                  key={rule.id}
                  className="border border-black p-4 bg-[#F4F2EC] flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center border-b border-black/10 pb-1.5">
                    <span className="text-xs font-black text-black uppercase">
                      Rule: {rule.id} — {rule.name}
                    </span>
                    <span className="px-2 py-0.5 text-[8.5px] font-black uppercase bg-white border border-black text-black">
                      Severity: {rule.severity}
                    </span>
                  </div>
                  <p className="text-[10px] text-black leading-relaxed font-semibold uppercase font-mono">
                    {rule.explanation}
                  </p>
                  <div className="text-[9px] text-[#3B00FF] font-bold mt-1 uppercase">
                    EFFECT: {rule.effect}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#77776F] font-semibold uppercase">
              No compliance rules were triggered or applied for this route segment evaluation.
            </p>
          )}
        </div>

        {/* Section: Observability Unknowns */}
        <div className="border-t border-black pt-6 flex flex-col gap-4">
          <span className="text-[10px] text-[#77776F] font-bold uppercase tracking-widest">
            KEY OBSERVABILITY UNKNOWNS
          </span>
          <div className="bg-[#F8F7F2] border border-black p-4 flex flex-col gap-3">
            <p className="text-xs font-semibold text-black leading-relaxed uppercase">
              Proprietary network routing pipelines are subject to black-box parameters. LeakMap flags the following variables as contractually unobservable for this segment:
            </p>
            <ul className="text-[10.5px] text-[#050505] font-semibold flex flex-col gap-2 list-none uppercase pl-1 font-mono">
              <li className="flex gap-2 items-start">
                <span className="text-red-600 font-black mt-0.5">↳ [X]</span>
                <span>exact internal processing region</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-red-600 font-black mt-0.5">↳ [X]</span>
                <span>exact model worker server</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-red-600 font-black mt-0.5">↳ [X]</span>
                <span>exact GPU location</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-red-600 font-black mt-0.5">↳ [X]</span>
                <span>whether every listed subprocessor touched this exact prompt</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-red-600 font-black mt-0.5">↳ [X]</span>
                <span>provider failover path</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer info stamp */}
        <div className="border-t-2 border-black pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[8px] text-[#77776F] uppercase font-semibold gap-4 leading-normal border-dashed">
          <div>
            <span>SYSTEM AUDIT SIGNATURE</span>
            <span className="text-black font-extrabold block">LEAKMAP_SYSTEM_HASH_VALIDATOR_V1.0</span>
          </div>
          <div className="text-left sm:text-right">
            <span>VERIFICATION LEDGER ID</span>
            <span className="text-black font-extrabold block">SHA256: {packet.id.toUpperCase()}-SECURE-HASH</span>
          </div>
        </div>

      </div>

      {/* Back home buttons */}
      <div className="flex gap-4 justify-center print:hidden">
        <Link 
          href="/scanner"
          className="py-2.5 px-6 border-2 border-black hover:bg-black hover:text-[#F8F7F2] text-xs font-bold uppercase transition-all shadow-[4px_4px_0px_#050505] bg-white"
        >
          Open Prompt Scanner
        </Link>
        <Link 
          href="/map"
          className="py-2.5 px-6 bg-[#3B00FF] hover:bg-black text-white text-xs font-bold uppercase transition-all border-2 border-black shadow-[4px_4px_0px_#050505]"
        >
          View Exposure Map
        </Link>
      </div>

    </div>
  );
}
