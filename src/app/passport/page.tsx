'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useScanStore, ScanResult } from '../../store/useScanStore';
import { providerProfiles } from '../../lib/providerProfiles';
import { QrCode, ShieldAlert, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import Link from 'next/link';

function PassportRegistry() {
  const { history, loadHistory, deleteScan, clearHistory } = useScanStore();
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Default select first item if available
  useEffect(() => {
    if (history.length > 0 && !selectedScan) {
      setSelectedScan(history[0]);
    }
  }, [history, selectedScan]);

  const handleSelectScan = (scan: ScanResult) => {
    setSelectedScan(scan);
  };

  const getSensitivityBadge = (level: string) => {
    let colors = 'bg-brutalist-lime text-black';
    if (level === 'Critical' || level === 'Sensitive') {
      colors = 'bg-brutalist-red text-white';
    } else if (level === 'Confidential') {
      colors = 'bg-[#DFA100] text-black';
    } else if (level === 'Personal') {
      colors = 'bg-[#3B00FF] text-white';
    }

    return (
      <span className={`border border-black px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${colors}`}>
        {level}
      </span>
    );
  };

  const getRiskBadge = (score: number) => {
    let colors = 'border border-black bg-white text-black';
    if (score > 75) {
      colors = 'border border-black bg-brutalist-red text-white';
    } else if (score > 50) {
      colors = 'border border-black bg-[#DFA100] text-black';
    } else if (score > 25) {
      colors = 'border border-black bg-[#3B00FF] text-white';
    }

    return (
      <span className={`px-2 py-0.5 text-[9px] font-mono font-black ${colors}`}>
        {score.toString().padStart(3, '0')}
      </span>
    );
  };

  // Generate claims dynamic list for passport details linking
  const getPassportClaims = (scan: ScanResult) => {
    const list = [
      { id: 'LM-001', claim: 'User Origin: India', confidence: '95%', status: 'Verified', evidenceId: 'LM-001' }
    ];

    if (scan.providerId === 'gemini') {
      list.push(
        { id: 'LM-002', claim: 'Google Gemini Endpoint Telemetry', confidence: '90%', status: 'Verified', evidenceId: 'LM-002' },
        { id: 'LM-003', claim: 'Google Unpaid human review warning', confidence: '85%', status: 'Disclosed Policy', evidenceId: 'LM-003' },
        { id: 'LM-008', claim: 'Internal Google cloud processing path', confidence: '100% Unknown', status: 'Policy Limitation', evidenceId: 'LM-008' }
      );
    } else if (scan.providerId === 'openai') {
      list.push(
        { id: 'LM-004', claim: 'OpenAI data residency parameters', confidence: '85%', status: 'Disclosed Config', evidenceId: 'LM-004' },
        { id: 'LM-005', claim: 'OpenAI subprocessor list DPA', confidence: '80%', status: 'Disclosed Contract', evidenceId: 'LM-005' },
        { id: 'LM-008', claim: 'Internal OpenAI server path', confidence: '100% Unknown', status: 'Policy Limitation', evidenceId: 'LM-008' }
      );
    } else if (scan.providerId === 'claude') {
      list.push(
        { id: 'LM-006', claim: 'Anthropic default retention rules', confidence: '85%', status: 'Disclosed Policy', evidenceId: 'LM-006' },
        { id: 'LM-007', claim: 'Anthropic trust center subprocessor list', confidence: '80%', status: 'Disclosed Contract', evidenceId: 'LM-007' },
        { id: 'LM-008', claim: 'Internal AWS/Anthropic route', confidence: '100% Unknown', status: 'Policy Limitation', evidenceId: 'LM-008' }
      );
    } else if (scan.providerId === 'local') {
      list.push(
        { id: 'ROUTE-LOCAL-SOVEREIGN', claim: 'Local Host Loopback Processing', confidence: '98%', status: 'Verified Node', evidenceId: 'ROUTE-LOCAL-SOVEREIGN' }
      );
    }

    return list;
  };

  return (
    <div className="flex-grow w-full bg-[#F4F2EC] flex flex-col relative select-none font-mono">
      
      {/* Swiss Navigation Header Title */}
      <div className="border-b-2 border-black py-4 px-6 w-full flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-black leading-relaxed">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#3B00FF] shrink-0" />
          <p>
            <span className="font-black uppercase">Sovereign Compliance Ledger:</span> Every generated Data Passport maps PII vulnerabilities, local proxy handshakes, and subprocessor entities.
          </p>
        </div>
        <div className="font-extrabold uppercase shrink-0 whitespace-nowrap">
          TOTAL CERTIFICATES: {history.length.toString().padStart(2, '0')} // ARCHIVE ACTIVE
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-0 border-b-2 border-black">
        
        {/* Left Column: Ledger Registry list (5/12 grid) */}
        <div className="lg:col-span-5 p-6 border-r-2 border-black bg-[#F8F7F2] flex flex-col gap-6 overflow-y-auto max-h-[85vh]">
          <div className="flex items-end justify-between border-b border-black pb-4">
            <div>
              <h2 className="text-xl font-black text-black uppercase tracking-tight">PASSPORT REGISTRY</h2>
              <p className="text-[11px] text-[#77776F] font-semibold mt-1 uppercase">Historical compliance records list</p>
            </div>
            
            {history.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to purge all certificates? This action is irreversible.")) {
                    clearHistory();
                    setSelectedScan(null);
                  }
                }}
                className="border border-black px-2.5 py-1.5 text-[9px] font-bold bg-white hover:bg-red-600 hover:text-white transition-colors uppercase tracking-wider cursor-pointer shadow-[2px_2px_0px_#050505]"
              >
                Purge Registry
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="bg-white border-2 border-black p-8 text-center text-[#77776F] flex flex-col items-center justify-center min-h-[220px] shadow-[4px_4px_0px_#050505]">
              <span className="text-xs font-black uppercase text-black">[ Audit Trail Empty ]</span>
              <p className="text-[10px] mt-2 max-w-[240px] leading-relaxed uppercase">
                Go to the Scanner, input your prompt, and run analyses to issue official compliance passports.
              </p>
              <Link href="/scanner" className="mt-5 brutalist-button text-xs py-2 px-5">
                Scan Prompt Now
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((scan) => {
                const profile = providerProfiles[scan.providerId];
                const isSelected = selectedScan?.id === scan.id;
                const score = scan.isRedacted ? scan.redactedRisk.score : scan.originalRisk.score;
                const dateStr = new Date(scan.timestamp).toLocaleDateString([], { month: 'short', day: '2-digit' }).toUpperCase();
                
                return (
                  <div
                    key={scan.id}
                    onClick={() => handleSelectScan(scan)}
                    className={`border border-black p-3.5 bg-white cursor-pointer select-none transition-all flex items-center justify-between shadow-[2px_2px_0px_#050505] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#050505] ${
                      isSelected ? 'border-[#3B00FF] shadow-[4px_4px_0px_#3B00FF] translate-x-[-2px] translate-y-[-2px]' : ''
                    }`}
                  >
                    <div className="flex flex-col gap-1 max-w-[70%]">
                      <span className="text-[8px] text-[#77776F] font-bold">HASH: {scan.id.toUpperCase()}</span>
                      <span className="text-xs font-black text-black uppercase tracking-tight truncate">
                        {profile?.providerName || 'Unknown AI'}
                      </span>
                      <span className="text-[9px] text-[#77776F] truncate max-w-[200px]">
                        {scan.redactedPrompt}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-[8px] font-bold text-[#77776F]">{dateStr}</span>
                      <div className="flex items-center gap-1.5">
                        {getSensitivityBadge(scan.sensitivityLevel)}
                        {getRiskBadge(score)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Passport Detail Certificate (7/12 grid) */}
        <div className="lg:col-span-7 p-6 bg-white flex flex-col justify-start overflow-y-auto max-h-[85vh]">
          {selectedScan ? (
            <div className="w-full flex flex-col gap-6">
              
              {/* Standalone Report Link Button */}
              <div className="flex justify-between items-center border-b border-black pb-4 select-none">
                <span className="text-[10px] text-[#77776F] font-extrabold">PASSPORT DETAILED INSPECTION</span>
                <Link
                  href={`/report/${selectedScan.id}`}
                  className="border border-black px-3 py-1.5 text-[9px] font-extrabold bg-[#EBE9E2] hover:bg-[#3B00FF] hover:text-white transition-all flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_#050505]"
                >
                  Open Full Certificate Page <ArrowRight size={10} />
                </Link>
              </div>

              {/* The Certificate box */}
              <div className="border-4 border-black p-6 bg-white relative overflow-hidden flex flex-col gap-5 shadow-[6px_6px_0px_#050505]">
                
                {/* Stamp color and text */}
                {(() => {
                  let sealColors = 'bg-brutalist-lime text-black';
                  let sealText = 'SOVEREIGN PASS';
                  if (selectedScan.providerId !== 'local') {
                    if (selectedScan.isRedacted) {
                      sealColors = 'bg-[#3B00FF] text-white';
                      sealText = 'ANONYMIZED PASS';
                    } else if (selectedScan.sensitivityLevel === 'Critical' || selectedScan.sensitivityLevel === 'Sensitive') {
                      sealColors = 'bg-brutalist-red text-white';
                      sealText = 'THREAT WARNING';
                    } else {
                      sealColors = 'bg-[#DFA100] text-black';
                      sealText = 'EXPOSURE AUDIT';
                    }
                  }

                  const dateStr = new Date(selectedScan.timestamp).toUTCString().toUpperCase();
                  const profile = providerProfiles[selectedScan.providerId];

                  return (
                    <>
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-black pb-4">
                        <div>
                          <span className="text-[8px] text-white font-mono bg-[#050505] border border-black px-2 py-0.5 uppercase tracking-widest font-black">
                            Security Registration Seal
                          </span>
                          <h3 className="text-2xl font-black text-black uppercase tracking-tight mt-2 font-display leading-none">
                            AI DATA PASSPORT
                          </h3>
                          <p className="text-[9px] text-[#77776F] font-mono uppercase mt-1 tracking-wider font-bold">
                            HASH ID: {selectedScan.id}
                          </p>
                        </div>
                        <div className="w-12 h-12 border-2 border-black flex items-center justify-center bg-[#F4F2EC] select-none shrink-0 shadow-[2px_2px_0px_#050505]">
                          <QrCode size={30} className="text-black" />
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                        <div className="flex flex-col gap-2">
                          <div>
                            <p className="text-[8px] text-[#77776F] uppercase font-bold tracking-wider">AI Provider</p>
                            <p className="text-sm font-black text-black uppercase truncate mt-0.5">{profile?.providerName || 'Unknown AI'}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-[#77776F] uppercase font-bold tracking-wider">Security Tier</p>
                            <p className="text-sm font-black text-black uppercase mt-0.5">{selectedScan.sensitivityLevel}</p>
                          </div>
                        </div>

                        <div className="flex flex-col justify-center items-start md:items-end">
                          <div className={`border-4 border-double border-black p-3 font-mono font-black text-center uppercase tracking-wider text-[8px] select-none shadow-[2px_2px_0px_#050505] ${sealColors} max-w-[140px]`}>
                            <div className="text-[6px] tracking-tight font-extrabold border-b border-black pb-0.5 mb-1">LEAKMAP SECURITY</div>
                            <div className="text-[10px] font-black leading-tight py-0.5">{sealText}</div>
                          </div>
                        </div>
                      </div>

                      {/* Threat differential panel */}
                      <div className="border-t border-b border-black py-4">
                        <h4 className="text-[9px] text-[#77776F] uppercase font-bold tracking-wider mb-2">Exposure Differential</h4>
                        <div className="grid grid-cols-3 gap-3 text-center text-[11px] font-semibold">
                          <div className="bg-[#F4F2EC] border border-black p-2 shadow-[1px_1px_0px_#050505]">
                            <p className="text-[7px] text-[#77776F] uppercase font-bold">Original Risk</p>
                            <p className="text-sm font-black text-black mt-0.5">{selectedScan.originalRisk.score.toString().padStart(3, '0')}</p>
                          </div>
                          <div className="bg-[#3B00FF]/5 border-2 border-[#3B00FF] p-2 shadow-[2px_2px_0px_#3B00FF]">
                            <p className="text-[7px] text-[#3B00FF] uppercase font-bold">Anonymized Risk</p>
                            <p className="text-sm font-black text-[#3B00FF] mt-0.5">{selectedScan.redactedRisk.score.toString().padStart(3, '0')}</p>
                          </div>
                          <div className="bg-black text-white p-2 shadow-[1px_1px_0px_#050505]">
                            <p className="text-[7px] text-brutalist-lime uppercase font-bold">Mitigation</p>
                            <p className="text-sm font-black text-brutalist-lime mt-0.5">
                              -{selectedScan.originalRisk.score - selectedScan.redactedRisk.score}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* SOVEREIGN CLAIMS EVIDENCE VAULT SUMMARY */}
                      <div className="border-b border-black pb-4">
                        <h4 className="text-[9px] text-[#77776F] uppercase font-bold tracking-wider mb-2.5">
                          Sovereign Telemetry & Claims Ledger
                        </h4>
                        <div className="border border-black overflow-hidden bg-[#F8F7F2]">
                          <table className="w-full text-left border-collapse text-[10px]">
                            <thead>
                              <tr className="bg-[#EBE9E2] border-b border-black text-[#77776F] font-bold">
                                <th className="p-2 w-16">CLAIM ID</th>
                                <th className="p-2">VERIFIED STATEMENT / CLAIM</th>
                                <th className="p-2 w-16 text-center">CONF.</th>
                                <th className="p-2 w-28 text-right">EVIDENCE VAULT</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getPassportClaims(selectedScan).map((claim) => (
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

                      {/* Sanitzed Prompt snippet */}
                      <div className="flex flex-col gap-1.5">
                        <h4 className="text-[9px] text-[#77776F] uppercase font-bold tracking-wider">Sanitized Prompt Payload</h4>
                        <div className="bg-[#F4F2EC] border border-black p-3 text-[10px] text-black max-h-[80px] overflow-y-auto select-all leading-normal font-bold">
                          {selectedScan.redactedPrompt}
                        </div>
                      </div>
                    </>
                  );
                })()}

              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 select-none text-[#77776F] min-h-[300px]">
              <ShieldAlert size={36} className="text-[#77776F] mb-3" />
              <span className="text-xs font-black uppercase text-black">No Certificate Selected</span>
              <p className="text-[10px] mt-1 max-w-[260px] uppercase">
                Select an issued audit passport hash from the registry list to inspect its verified compliance claims and source citations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PassportPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex flex-col items-center justify-center min-h-[500px] text-center bg-[#F4F2EC]">
        <div className="w-8 h-8 border-4 border-black border-t-brutalist-blue animate-spin rounded-none mb-4" />
        <p className="text-xs font-mono text-[#050505] font-bold uppercase tracking-widest">
          Resolving Compliance Ledgers...
        </p>
      </div>
    }>
      <PassportRegistry />
    </Suspense>
  );
}
