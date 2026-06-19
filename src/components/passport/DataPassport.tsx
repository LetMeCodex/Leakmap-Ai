'use client';

import React, { useRef } from 'react';
import { DataPassportModel } from '../../lib/passportGenerator';
import EvidenceQRCode from '../evidence/EvidenceQRCode';
import { getVerificationUrl } from '../../lib/qr';
import { Printer, Download, Copy, Eye, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface PassportProps {
  passport: DataPassportModel;
}

export default function DataPassport({ passport }: PassportProps) {
  const passportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopyLink = () => {
    const url = getVerificationUrl('passport', passport.id);
    navigator.clipboard.writeText(url).then(() => {
      alert("Verification link copied: " + url);
    });
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(passport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `leakmap-passport-${passport.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Verdict design
  let verdictColor = 'bg-[#00B873] text-white border-[#00B873]';
  if (passport.finalVerdict === 'THREAT WARNING') {
    verdictColor = 'bg-[#EF2B2B] text-white border-[#EF2B2B] animate-pulse';
  } else if (passport.finalVerdict === 'EXPOSURE AUDIT') {
    verdictColor = 'bg-[#DFA100] text-black border-[#DFA100]';
  } else if (passport.finalVerdict === 'ANONYMIZED PASS') {
    verdictColor = 'bg-[#3B00FF] text-white border-[#3B00FF]';
  }

  const formattedDate = new Date(passport.timestamp).toUTCString().toUpperCase();
  const verificationUrl = getVerificationUrl('passport', passport.id);

  return (
    <div className="flex flex-col gap-6 max-w-2xl w-full font-mono text-xs select-none">
      
      {/* Dynamic Brutalist Futuristic Passport */}
      <div 
        ref={passportRef}
        className="bg-white border-4 border-black p-6 relative overflow-hidden flex flex-col gap-6 shadow-[8px_8px_0px_#050505] print:shadow-none print:border-black print:bg-white"
      >
        {/* Holographic Brutalist Accents */}
        <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-[#00AEEF] via-[#3B00FF] to-[#00B873]" />
        
        {/* Stamp Circle Background Watermark */}
        <div className="absolute bottom-[30px] right-[40px] text-[130px] font-black text-black/[0.02] pointer-events-none uppercase tracking-tighter select-none font-display z-0 leading-none">
          AUDIT
        </div>

        {/* Passport Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-black pb-5 z-10">
          <div>
            <span className="text-[9px] text-white font-mono bg-[#050505] border border-black px-2.5 py-0.5 uppercase tracking-widest font-black">
              Geopolitical AI Passport
            </span>
            <h2 className="text-3xl font-black text-black uppercase tracking-tight mt-2.5 font-display leading-none">
              AI DATA PASSPORT
            </h2>
            <p className="text-[9px] text-[#77776F] font-bold uppercase mt-1 tracking-wider">
              REGISTRY ID: {passport.id} // SCAN: {passport.scanId.toUpperCase()}
            </p>
          </div>

          <div className="flex gap-2">
            <span className="border-2 border-black bg-white px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_#050505] text-[#3B00FF]">
              EVIDENCE-BACKED
            </span>
            <span className="border-2 border-black bg-white px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_#050505] text-[#EF2B2B]">
              NOT PHYSICAL ROUTE PROOF
            </span>
          </div>
        </div>

        {/* Identity & Registry Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 z-10 text-xs leading-relaxed uppercase">
          {/* Left Details list */}
          <div className="md:col-span-8 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 font-semibold">
              <div>
                <p className="text-[8.5px] text-[#77776F] font-bold">Target Processor</p>
                <p className="text-sm font-black text-black truncate mt-0.5">{passport.provider}</p>
              </div>
              <div>
                <p className="text-[8.5px] text-[#77776F] font-bold">Processor Mode</p>
                <p className="text-sm font-black text-black mt-0.5">{passport.mode}</p>
              </div>
              <div>
                <p className="text-[8.5px] text-[#77776F] font-bold">Prompt Class</p>
                <p className="text-sm font-black text-black mt-0.5">{passport.sensitivityLevel}</p>
              </div>
              <div>
                <p className="text-[8.5px] text-[#77776F] font-bold">Sovereign Recommendation</p>
                <p className="text-[9px] font-black text-[#3B00FF] truncate mt-0.5">{passport.recommendedRoute}</p>
              </div>
            </div>

            <div className="border-t border-black pt-3 font-semibold grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-[7.5px] text-[#77776F] font-bold">Verified Claims</p>
                <p className="text-xs font-black text-[#00AEEF] mt-0.5">{passport.verifiedClaimsCount}</p>
              </div>
              <div>
                <p className="text-[7.5px] text-[#77776F] font-bold">Disclosed Claims</p>
                <p className="text-xs font-black text-[#3B00FF] mt-0.5">{passport.disclosedClaimsCount}</p>
              </div>
              <div>
                <p className="text-[7.5px] text-[#77776F] font-bold">Inferred Claims</p>
                <p className="text-xs font-black text-[#DFA100] mt-0.5">{passport.inferredClaimsCount}</p>
              </div>
              <div>
                <p className="text-[7.5px] text-[#77776F] font-bold">Unknown Factors</p>
                <p className="text-xs font-black text-[#EF2B2B] mt-0.5">{passport.unknownFactorsCount}</p>
              </div>
            </div>
            
            <div className="border-t border-black pt-3">
              <p className="text-[8.5px] text-[#77776F] font-bold">Triggered Governance Rules</p>
              <p className="text-[10px] text-black font-extrabold mt-1 tracking-tight truncate max-w-full">
                {passport.rulesTriggered.length > 0 ? passport.rulesTriggered.join(' / ') : 'NONE'}
              </p>
            </div>
          </div>

          {/* Right Stamp Seal & QR Stamp */}
          <div className="md:col-span-4 flex flex-col justify-center items-center md:items-end gap-4 shrink-0">
            {/* Custom Stamp */}
            <div className={`border-4 border-double p-3 font-mono font-black text-center uppercase tracking-widest text-[9px] shadow-[3px_3px_0px_#050505] ${verdictColor}`}>
              <div className="text-[6.5px] tracking-tight font-extrabold border-b border-black/10 pb-0.5 mb-1 text-center">OFFICIAL COMPLIANCE</div>
              <div className="text-xs font-black leading-tight py-0.5">{passport.finalVerdict}</div>
            </div>

            <EvidenceQRCode value={verificationUrl} label="VERIFY PASSPORT" size={84} />
          </div>
        </div>

        {/* Differential scoring panel */}
        <div className="border-t border-black py-4 z-10">
          <h4 className="text-[8.5px] text-[#77776F] uppercase font-bold tracking-wider mb-2.5">Threat Score Differential Analysis</h4>
          <div className="grid grid-cols-3 gap-3 text-center text-xs font-semibold uppercase">
            <div className="bg-[#F4F2EC] border border-black p-2.5 shadow-[1.5px_1.5px_0px_#050505]">
              <p className="text-[7px] text-[#77776F] font-bold">Original Risk</p>
              <p className="text-md font-black text-black mt-0.5">{passport.originalRisk} / 100</p>
            </div>
            <div className="bg-[#3B00FF]/5 border-2 border-[#3B00FF] p-2.5 shadow-[2.5px_2.5px_0px_#3B00FF]">
              <p className="text-[7px] text-[#3B00FF] font-bold">Redacted Risk</p>
              <p className="text-md font-black text-[#3B00FF] mt-0.5">{passport.redactedRisk} / 100</p>
            </div>
            <div className="bg-black text-white p-2.5 shadow-[1.5px_1.5px_0px_#050505]">
              <p className="text-[7px] text-brutalist-lime font-bold">Exposure Mitigated</p>
              <p className="text-md font-black text-brutalist-lime mt-0.5">
                -{passport.originalRisk - passport.redactedRisk}%
              </p>
            </div>
          </div>
        </div>

        {/* Certificate stamp warnings */}
        <div className="border-t border-black/10 pt-3 flex flex-wrap gap-2 justify-center font-black text-[8px] uppercase text-[#77776F] tracking-wide select-none">
          <span>● REDACTION RECOMMENDED</span>
          <span>● LOCAL ROUTE SAFER</span>
          <span>● TRANSIT RESIDENCY UNKNOWN</span>
        </div>

        {/* Passport Footer */}
        <div className="border-t-2 border-black pt-4 flex flex-col md:flex-row items-center justify-between text-[9px] text-[#77776F] font-black z-10 uppercase">
          <span>LEAKMAP AI // PASSPORT CONTROL SYSTEM</span>
          <span>ISSUED: {formattedDate}</span>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="flex-1 py-2.5 bg-white hover:bg-black hover:text-white text-black text-xs font-bold uppercase tracking-wider border border-black shadow-[3px_3px_0px_#050505] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#050505] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Printer size={12} /> Print Passport
        </button>
        <button
          onClick={handleExportJSON}
          className="flex-1 py-2.5 bg-white hover:bg-black hover:text-white text-black text-xs font-bold uppercase tracking-wider border border-black shadow-[3px_3px_0px_#050505] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#050505] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Download size={12} /> Export JSON
        </button>
        <button
          onClick={handleCopyLink}
          className="flex-1 py-2.5 bg-white hover:bg-black hover:text-white text-black text-xs font-bold uppercase tracking-wider border border-black shadow-[3px_3px_0px_#050505] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#050505] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Copy size={12} /> Copy Verification Link
        </button>
      </div>

    </div>
  );
}
