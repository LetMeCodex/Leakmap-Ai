'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useScanStore, ScanResult } from '../../../store/useScanStore';
import { providerProfiles } from '../../../lib/providerProfiles';
import { QrCode } from 'lucide-react';
import Link from 'next/link';

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const { history, loadHistory } = useScanStore();
  const [scan, setScan] = useState<ScanResult | null>(null);

  const getPassportClaims = () => {
    const list = [
      { id: 'LM-001', claim: 'User Origin: India', confidence: '95%', status: 'Verified', evidenceId: 'LM-001' }
    ];

    if (scan?.providerId === 'gemini') {
      list.push(
        { id: 'LM-002', claim: 'Google Gemini Endpoint Telemetry', confidence: '90%', status: 'Verified', evidenceId: 'LM-002' },
        { id: 'LM-003', claim: 'Google Unpaid human review warning', confidence: '85%', status: 'Disclosed Policy', evidenceId: 'LM-003' },
        { id: 'LM-008', claim: 'Internal Google cloud processing path', confidence: '100% Unknown', status: 'Policy Limitation', evidenceId: 'LM-008' }
      );
    } else if (scan?.providerId === 'openai') {
      list.push(
        { id: 'LM-004', claim: 'OpenAI data residency parameters', confidence: '85%', status: 'Disclosed Config', evidenceId: 'LM-004' },
        { id: 'LM-005', claim: 'OpenAI subprocessor list DPA', confidence: '80%', status: 'Disclosed Contract', evidenceId: 'LM-005' },
        { id: 'LM-008', claim: 'Internal OpenAI server path', confidence: '100% Unknown', status: 'Policy Limitation', evidenceId: 'LM-008' }
      );
    } else if (scan?.providerId === 'claude') {
      list.push(
        { id: 'LM-006', claim: 'Anthropic default retention rules', confidence: '85%', status: 'Disclosed Policy', evidenceId: 'LM-006' },
        { id: 'LM-007', claim: 'Anthropic trust center subprocessor list', confidence: '80%', status: 'Disclosed Contract', evidenceId: 'LM-007' },
        { id: 'LM-008', claim: 'Internal AWS/Anthropic route', confidence: '100% Unknown', status: 'Policy Limitation', evidenceId: 'LM-008' }
      );
    } else if (scan?.providerId === 'local') {
      list.push(
        { id: 'ROUTE-LOCAL-SOVEREIGN', claim: 'Local Host Loopback Processing', confidence: '98%', status: 'Verified Node', evidenceId: 'ROUTE-LOCAL-SOVEREIGN' }
      );
    }

    return list;
  };


  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const scanId = params.id as string;
    const found = history.find(s => s.id === scanId);
    if (found) {
      setScan(found);
    }
  }, [history, params.id]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (!scan) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[500px] text-center p-6 select-none bg-[#F4F2EC]">
        <div className="w-8 h-8 border-4 border-black border-t-brutalist-red animate-spin rounded-none mb-4" />
        <h2 className="text-xl font-black font-display text-brutalist-text uppercase tracking-wider mt-4">
          Data Passport Not Found
        </h2>
        <p className="text-xs text-brutalist-muted mt-2 max-w-sm font-mono leading-relaxed uppercase">
          The requested compliance passport hash could not be retrieved from local security registers.
        </p>
        <Link
          href="/scanner"
          className="mt-6 brutalist-button text-xs py-2.5 px-6"
        >
          Return to Scanner
        </Link>
      </div>
    );
  }

  const profile = providerProfiles[scan.providerId];
  const dateStr = new Date(scan.timestamp).toUTCString().toUpperCase();
  const originalScore = scan.originalRisk.score;
  const redactedScore = scan.redactedRisk.score;

  // Determine Stamp Color & Seal Text
  let sealColors = 'bg-brutalist-lime text-black';
  let sealText = 'SOVEREIGN PASS';
  if (scan.providerId !== 'local') {
    if (scan.isRedacted) {
      sealColors = 'bg-brutalist-blue text-white';
      sealText = 'ANONYMIZED PASS';
    } else if (scan.sensitivityLevel === 'Critical' || scan.sensitivityLevel === 'Sensitive') {
      sealColors = 'bg-brutalist-red text-white';
      sealText = 'THREAT WARNING';
    } else {
      sealColors = 'bg-brutalist-amber text-black';
      sealText = 'EXPOSURE AUDIT';
    }
  }

  return (
    <div className="flex-grow px-4 py-8 flex flex-col items-center justify-start max-w-3xl mx-auto w-full gap-6 print:p-0 print:m-0 bg-[#F4F2EC]">
      
      {/* Back button & Print Controls */}
      <div className="w-full flex items-center justify-between border-b border-black pb-4 print:hidden select-none">
        <Link
          href="/scanner"
          className="font-mono text-xs font-bold uppercase tracking-wider text-brutalist-text hover:underline"
        >
          &lt;- Back to Scanner
        </Link>

        <button
          onClick={handlePrint}
          className="brutalist-button text-xs py-1.5 px-4 cursor-pointer"
        >
          Print Passport (PDF)
        </button>
      </div>

      {/* The Passport Card Container */}
      <div className="w-full bg-white border-4 border-black p-8 relative overflow-hidden flex flex-col gap-6 shadow-[8px_8px_0px_#050505] print:border-black print:bg-white print:text-black print:shadow-none print:p-6 rounded-none">
        
        {/* Top Header Card */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-black pb-6 z-10 print:border-black">
          <div>
            <span className="text-[10px] text-white font-mono bg-[#050505] border border-black px-2.5 py-0.5 uppercase tracking-widest font-bold print:border-black print:text-black print:bg-white">
              Official Diagnostic Report
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-brutalist-text uppercase tracking-tight mt-3 font-display print:text-black leading-none">
              AI DATA PASSPORT
            </h2>
            <p className="text-[9px] text-brutalist-muted font-mono uppercase mt-1.5 tracking-wider font-bold">
              ID Hash: {scan.id} // SECURE REGISTRY LOG
            </p>
          </div>
          
          {/* Custom QR Code Visual Box */}
          <div className="w-16 h-16 border-2 border-black flex items-center justify-center bg-[#F4F2EC] select-none print:border-black print:bg-white shrink-0">
            <QrCode size={42} className="text-brutalist-text print:text-black" />
          </div>
        </div>

        {/* Passport Identity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 z-10 text-xs font-mono">
          
          {/* Left Data list */}
          <div className="md:col-span-8 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] text-brutalist-muted uppercase tracking-widest font-bold">Target Processor</p>
                <p className="text-sm font-bold text-brutalist-text uppercase mt-0.5 print:text-black">
                  {profile?.providerName || 'Unknown AI'}
                </p>
              </div>
              
              <div>
                <p className="text-[9px] text-brutalist-muted uppercase tracking-widest font-bold">Classification Level</p>
                <p className="text-sm font-bold text-brutalist-text uppercase mt-0.5 print:text-black">
                  {scan.sensitivityLevel}
                </p>
              </div>
            </div>

            <div className="border-t border-black pt-3">
              <p className="text-[9px] text-brutalist-muted uppercase tracking-widest font-bold">Verified Endpoint URL</p>
              <p className="text-xs text-brutalist-text font-bold mt-0.5 truncate max-w-full print:text-black">
                {profile?.endpointDomains[0] || 'localhost:11434'}
              </p>
            </div>
            
            <div className="border-t border-black pt-3">
              <p className="text-[9px] text-brutalist-muted uppercase tracking-widest font-bold">Timestamp (UTC)</p>
              <p className="text-xs text-brutalist-text font-bold mt-0.5 print:text-black">{dateStr}</p>
            </div>
          </div>

          {/* Right Data list (Risk Stamps & Seals) */}
          <div className="md:col-span-4 flex flex-col justify-center items-center md:items-end">
            
            {/* Brutalist Custom Compliance Stamp */}
            <div className={`border-4 border-double border-black p-4 font-mono font-black text-center uppercase tracking-widest text-[10px] select-none rotate-3 shadow-[4px_4px_0px_#050505] ${sealColors} print:border-black print:text-black print:shadow-none max-w-[160px]`}>
              <div className="border-b border-black pb-1 mb-1.5 font-bold text-[7px] tracking-tight">LEAKMAP SECURITY PROTOCOL</div>
              <div className="text-xs font-black leading-tight py-0.5">{sealText}</div>
              <div className="border-t border-black pt-1 mt-1.5 font-bold text-[7px] tracking-tight">OFFICIAL SOVEREIGN SEAL</div>
            </div>
          </div>
        </div>

        {/* Risk Score Differential panel */}
        <div className="border-t border-b-2 border-black py-6 z-10 print:border-black">
          <h3 className="text-[10px] font-mono text-brutalist-muted uppercase tracking-widest font-bold mb-4">
            Threat Score Analysis Matrix
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-xs font-mono">
            <div className="bg-[#F4F2EC] border border-black p-3 shadow-[2px_2px_0px_#050505] print:border-black">
              <p className="text-[8px] text-brutalist-muted uppercase tracking-widest font-bold">Original Risk</p>
              <p className="text-lg font-black text-brutalist-text mt-1 print:text-black">{originalScore.toString().padStart(3, '0')} / 100</p>
            </div>
            <div className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_#3B00FF] print:border-black">
              <p className="text-[8px] text-brutalist-blue uppercase tracking-widest font-bold">Anonymized Risk</p>
              <p className="text-lg font-black text-brutalist-blue mt-1 print:text-black">{redactedScore.toString().padStart(3, '0')} / 100</p>
            </div>
            <div className="bg-[#050505] text-white border border-black p-3 shadow-[2px_2px_0px_#050505] print:border-black print:bg-white print:text-black">
              <p className="text-[8px] text-brutalist-lime uppercase tracking-widest font-bold print:text-black">Mitigation Ratio</p>
              <p className="text-lg font-black text-brutalist-lime mt-1 print:text-black">
                -{originalScore - redactedScore}% EXPOSURE
              </p>
            </div>
          </div>
        </div>

        {/* Detected entity highlights */}
        {scan.detectedEntities.length > 0 && (
          <div className="flex flex-col gap-2.5 z-10 text-xs font-mono border-b border-black pb-6">
            <h3 className="text-[9px] text-brutalist-muted uppercase tracking-widest font-bold">Detected Leak Entities</h3>
            <div className="flex flex-wrap gap-2">
              {scan.detectedEntities.map((e, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 border border-black bg-[#F4F2EC] text-[10px] text-brutalist-text font-bold uppercase tracking-tight"
                >
                  [{e.type}] : {e.match}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* SOVEREIGN CLAIMS EVIDENCE VAULT SUMMARY */}
        <div className="flex flex-col gap-2.5 z-10 text-xs font-mono border-b border-black pb-6">
          <h3 className="text-[9px] text-brutalist-muted uppercase tracking-widest font-bold">
            Sovereign Telemetry & Claims Ledger
          </h3>
          <div className="border border-black overflow-hidden bg-[#F8F7F2] rounded-none">
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="bg-[#EBE9E2] border-b border-black text-[#77776F] font-bold">
                  <th className="p-2 w-16">CLAIM ID</th>
                  <th className="p-2">VERIFIED STATEMENT / CLAIM</th>
                  <th className="p-2 w-16 text-center">CONF.</th>
                  <th className="p-2 w-24 text-right">EVIDENCE</th>
                </tr>
              </thead>
              <tbody>
                {getPassportClaims().map((claim) => (
                  <tr key={claim.id} className="border-b border-black last:border-0 font-semibold bg-white hover:bg-[#F8F7F2]">
                    <td className="p-2 text-[#77776F]">{claim.id}</td>
                    <td className="p-2 text-black font-extrabold uppercase truncate max-w-[150px]">{claim.claim}</td>
                    <td className="p-2 text-center text-[#3B00FF]">{claim.confidence}</td>
                    <td className="p-2 text-right">
                      <Link
                        href={`/evidence?claim=${claim.evidenceId}`}
                        className="text-[#3B00FF] hover:underline uppercase font-extrabold text-[8.5px]"
                      >
                        View Vault →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        {/* Recommended Sovereign Architecture */}
        <div className="flex flex-col gap-2.5 z-10 text-xs font-mono border-b border-black pb-6">
          <h3 className="text-[9px] text-brutalist-muted uppercase tracking-widest font-bold">Sovereignty Strategy</h3>
          <div className="flex gap-4 items-start border-2 border-black bg-brutalist-lime/10 p-4 text-[11px] leading-relaxed text-brutalist-text print:border-black print:text-black print:bg-white">
            <div className="bg-brutalist-lime border border-black text-black px-2 py-0.5 text-[9px] font-bold uppercase shrink-0 mt-0.5">RECOMMENDED</div>
            <div>
              <p className="font-bold uppercase text-[9px] tracking-wider text-brutalist-text">Sovereign Local Tunneling</p>
              <p className="mt-1 font-semibold uppercase text-brutalist-muted text-[10px] leading-normal">
                To guarantee complete digital independence, route payload content using <span className="underline font-bold text-black">Local Sovereign Mode (Ollama loopback)</span>. This reduces external processor exposure to 0% and eliminates compliance liability under foreign surveillance acts.
              </p>
            </div>
          </div>
        </div>

        {/* Input prompt snippet for inspection */}
        <div className="flex flex-col gap-2.5 z-10 text-xs font-mono">
          <h3 className="text-[9px] text-brutalist-muted uppercase tracking-widest font-bold">Audited Sanitized Snippet</h3>
          <div className="bg-[#F4F2EC] border border-black p-4 text-brutalist-text leading-relaxed max-h-[120px] overflow-y-auto select-all print:border-black print:bg-white print:text-black print:overflow-visible font-semibold">
            {scan.redactedPrompt}
          </div>
        </div>

        {/* Compliance details footer */}
        <div className="border-t-2 border-black pt-4 flex flex-col md:flex-row items-center justify-between text-[9px] font-mono text-brutalist-muted font-bold z-10 print:border-black print:text-black">
          <p>LEAKMAP AI // COGNITIVE GEOPOLITICAL SCANNER</p>
          <p className="mt-1 md:mt-0">PASSPORT HASH CODE: {scan.id.toUpperCase()}-VERIFIED</p>
        </div>
      </div>
      
      {/* Print stylesheet override */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            font-size: 10px !important;
          }
          header, footer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

