'use client';

import React, { useState, useEffect } from 'react';
import { useScanStore } from '../../store/useScanStore';
import { providerProfiles } from '../../lib/providerProfiles';
import { 
  routeEvidenceCards, 
  evidenceSources, 
  getRouteEvidenceId, 
  RouteEvidenceCard,
  confidenceLevels
} from '../../lib/evidenceRegistry';
import { X, ExternalLink, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import Link from 'next/link';
import EvidenceQRCode from './EvidenceQRCode';
import { buildEvidenceUrl } from '../../lib/siteUrl';

export default function EvidenceDrawer() {
  const { 
    providerId, 
    activeNodeId, 
    activeEdgeId, 
    drawerOpen, 
    setDrawerOpen,
    setActiveNodeId,
    setActiveEdgeId
  } = useScanStore();

  const [selectedQrType, setSelectedQrType] = useState<string>('evidence');

  const profile = providerProfiles[providerId] || providerProfiles.gemini;

  // Reset QR target selection when node/edge/provider changes
  useEffect(() => {
    setSelectedQrType('evidence');
  }, [activeNodeId, activeEdgeId, providerId]);

  if (!drawerOpen) return null;

  // Locate active data node or edge
  let title = '';
  let subTitle = '';
  let category: 'verified' | 'disclosed' | 'inferred' | 'unknown' = 'unknown';
  let confidence = 30;
  let explanation = '';
  let whatItProves = '';
  let whatItDoesNotProve = '';
  let unknownsList: string[] = [];
  let sourceIds: string[] = [];
  let evidenceCardId = '';
  let evidenceMissing = false;
  let country = '';

  if (activeNodeId) {
    const node = profile.nodes.find(n => n.id === activeNodeId);
    if (node) {
      title = node.label;
      subTitle = `Network Infrastructure Node [${node.id}]`;
      category = (node.type === 'sovereign' ? 'verified' : node.type) as any;
      country = node.country;
      confidence = node.type === 'verified' || node.type === 'sovereign' ? 95 : node.type === 'disclosed' ? 85 : 55;
      
      switch (node.type) {
        case 'verified':
          explanation = `This endpoint was actively resolved and verified via DNS and network trace sockets. Traffic connects to TLS 1.3 encrypted gates.`;
          whatItProves = `Verification indicates that packets terminate at a valid server registered under ${node.label}.`;
          whatItDoesNotProve = `It does not prove which internal server racks within Google or OpenAI proprietary zones process the token payload.`;
          break;
        case 'disclosed':
          explanation = `This infrastructure is explicitly disclosed in the provider's contractual agreements, subprocessor reports, or service documentation.`;
          whatItProves = `Disclosures confirm that this region hosts the compute nodes designated for customer API processing.`;
          whatItDoesNotProve = `It does not verify whether data was stored or cached in secondary failover nodes.`;
          break;
        case 'inferred':
          explanation = `This node is inferred based on global cloud tenancy mapping (e.g. AWS/Azure clusters), fallback routing, and default provider billing configurations. It is not confirmed for all traffic.`;
          whatItProves = `Inference indicates a potential routing edge during high latency or system failure states.`;
          whatItDoesNotProve = `It does not confirm that your specific request traversed this country.`;
          break;
        case 'sovereign':
          explanation = `This compute cluster resides entirely on localhost loopback or a designated in-country sovereign node. No data crosses national boundaries.`;
          whatItProves = `Data never leaves the local loopback interface. Compliance is 100% verified.`;
          whatItDoesNotProve = `It does not prove that third-party plugins loaded by the model did not make outbound network queries.`;
          break;
        default:
          explanation = `This node operates in a black box. Subprocessor visibility and storage jurisdiction could not be verified or contractually resolved.`;
          whatItProves = `Indicates routing paths that are not documented or verifiable.`;
          whatItDoesNotProve = `Does not guarantee security compliance.`;
      }
    }
  } else if (activeEdgeId) {
    // Look up route evidence ID using helper
    const matchedEvidenceId = getRouteEvidenceId(providerId, activeEdgeId.from, activeEdgeId.to);
    
    if (matchedEvidenceId) {
      const card = routeEvidenceCards.find(c => c.id === matchedEvidenceId);
      if (card) {
        evidenceCardId = card.id;
        title = card.routeLabel;
        subTitle = `Data Routing Conduit [${card.id}]`;
        category = card.evidenceType;
        confidence = card.confidenceScore;
        whatItProves = card.whatItProves;
        whatItDoesNotProve = card.whatItDoesNotProve;
        unknownsList = card.unknowns;
        sourceIds = card.sourceIds;
        
        if (providerId === 'gemini') {
          explanation = `This transit route represents the jurisdictional path from India to the Google Gemini API gateway. According to Google's terms of service, unpaid Gemini API prompts are routed through global edge nodes and may be analyzed by human reviewers. Sensitive telemetry and user prompt inputs are processed under Google's cloud governance framework, with data residency locked to regional zones only if specifically configured.`;
        } else if (providerId === 'openai') {
          explanation = `This transit route traces the data flow from India to OpenAI API compute clusters (typically routed to US-based server zones). OpenAI utilizes global subprocessors, including Microsoft Azure infrastructure and scale partners, to process token requests. Standard API prompts do not undergo human review for model training, but metadata logs are retained for 30 days under OpenAI security compliance policies.`;
        } else if (providerId === 'claude') {
          explanation = `This transit route maps prompt telemetry to Anthropic Claude server instances (hosted via AWS US regions). Under Anthropic commercial developer terms, conversation inputs are not retained by default for training purposes. Compute infrastructure is subject to Anthropic's trust-center DPA guidelines and verified subprocessors list, maintaining automated zero-retention policies for standard API endpoints.`;
        } else if (providerId === 'local') {
          explanation = `This closed-loop route retains all data within local boundaries. Prompts are processed locally on-premise or inside local sovereign compute nodes using open weights models. Zero external API calls are dispatched, eliminating subprocessor leak vectors and ensuring complete data containment and compliance.`;
        } else {
          explanation = `Visualizing verified connection flow from ${card.from} to ${card.to}.`;
        }
      }
    } else {
      // Evidence is missing
      evidenceMissing = true;
      category = 'unknown';
      confidence = 30; // Max 30% for missing evidence
      title = `${activeEdgeId.from} → ${activeEdgeId.to}`;
      subTitle = `Data Routing Conduit [EVIDENCE MISSING]`;
      explanation = `LeakMap detected a transit hop from ${activeEdgeId.from} to ${activeEdgeId.to}, but has no official disclosure, registry log, or policy mapping to prove it.`;
      whatItProves = `No verifiable proof exists for this route.`;
      whatItDoesNotProve = `This path cannot be verified as secure, compliant, or active.`;
      unknownsList = [`Exact route validity`, `Legal jurisdiction`, `Provider compliance posture`];
    }
  }

  // Look up source documents details
  const relatedCitations = evidenceSources.filter(src => sourceIds.includes(src.id));

  // Determine dynamic QR value and details based on selected type
  let qrValue = '';
  let qrLabel = 'SCAN EVIDENCE PACKET';
  let qrDestinationType = 'evidence';
  let qrTargetId = '';
  let qrProviderName = '';

  if (evidenceCardId) {
    if (selectedQrType === 'evidence') {
      qrValue = buildEvidenceUrl(evidenceCardId);
      qrLabel = 'SCAN EVIDENCE PACKET';
      qrDestinationType = 'evidence';
      qrTargetId = evidenceCardId;
    } else {
      const matchedSource = relatedCitations.find(src => src.id === selectedQrType);
      if (matchedSource && matchedSource.sourceUrl) {
        qrValue = matchedSource.sourceUrl;
        qrLabel = `SCAN OFFICIAL SOURCE`;
        qrDestinationType = 'sources';
        qrTargetId = matchedSource.id;
        qrProviderName = matchedSource.provider;
      } else {
        qrValue = buildEvidenceUrl(evidenceCardId);
        qrLabel = 'SCAN EVIDENCE PACKET';
        qrDestinationType = 'evidence';
        qrTargetId = evidenceCardId;
      }
    }
  }

  const getCategoryStyles = (cat: string) => {
    switch (cat) {
      case 'verified':
        return 'border-[#00AEEF] text-[#00AEEF] bg-[#00AEEF]/10';
      case 'disclosed':
        return 'border-[#3B00FF] text-[#3B00FF] bg-[#3B00FF]/10';
      case 'inferred':
        return 'border-[#DFA100] text-[#DFA100] bg-[#DFA100]/10';
      case 'unknown':
      default:
        return 'border-[#77776F] text-[#77776F] bg-[#77776F]/10';
    }
  };

  const handleClose = () => {
    setDrawerOpen(false);
    setActiveNodeId(null);
    setActiveEdgeId(null);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[460px] bg-[#F8F7F2] border-l-4 border-black z-50 shadow-[0_0_30px_rgba(0,0,0,0.15)] flex flex-col justify-between select-none font-mono">
      {/* Scrollable Container */}
      <div className="flex-grow overflow-y-auto px-6 py-6 flex flex-col gap-6">
        
        {/* Header Drawer Control */}
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <div>
            <span className="text-[10px] font-black text-[#77776F] uppercase tracking-widest">
              GEOPOLITICAL EVIDENCE
            </span>
            <h3 className="text-[16px] font-black text-black uppercase tracking-tight mt-1 truncate max-w-[300px]">
              {title}
            </h3>
          </div>
          <button 
            onClick={handleClose}
            className="w-8 h-8 border border-black flex items-center justify-center hover:bg-black hover:text-[#F8F7F2] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Warning badge if evidence missing */}
        {evidenceMissing && (
          <div className="bg-red-600 border-2 border-black text-white px-4 py-3 font-extrabold uppercase text-center text-xs tracking-wider animate-pulse shadow-[2px_2px_0px_#050505]">
            ⚠️ WARNING: EVIDENCE MISSING
            <p className="text-[9px] font-normal lowercase mt-1 text-red-100 normal-case font-mono">
              Do not treat this connection as verified. LeakMap has no documentation backing this route.
            </p>
          </div>
        )}

        {/* Diagnostic Badges grid */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="border border-black bg-white py-3 px-2 flex flex-col justify-between items-center gap-1.5 shadow-[2px_2px_0px_#050505]">
            <span className="text-[8px] font-black text-[#77776F] uppercase tracking-wider">Evidence Type</span>
            <span className={`text-[9px] font-extrabold uppercase border px-2.5 py-0.5 ${getCategoryStyles(category)}`}>
              {category}
            </span>
          </div>

          <div className="border border-black bg-white py-3 px-2 flex flex-col justify-between items-center gap-1.5 shadow-[2px_2px_0px_#050505]">
            <span className="text-[8px] font-black text-[#77776F] uppercase tracking-wider">Confidence Score</span>
            <span className="text-xs font-black text-[#050505] font-mono">
              {confidence}%
            </span>
          </div>
        </div>

        {/* Geopolitical location if node */}
        {activeNodeId && country && (
          <div className="flex items-center justify-between border border-black px-4 py-2.5 bg-white text-xs font-bold shadow-[2px_2px_0px_#050505]">
            <span className="text-[#77776F]">Governance Jurisdiction</span>
            <span className="text-black font-black uppercase tracking-wider">{country}</span>
          </div>
        )}

        {/* QR Code Verification stamp */}
        {evidenceCardId && (
          <div className="flex flex-col gap-3 border border-black bg-white p-4 shadow-[2px_2px_0px_#050505]">
            <div className="flex flex-col items-center justify-center">
              <EvidenceQRCode 
                value={qrValue} 
                label={qrLabel}
                destinationType={qrDestinationType as any}
                id={qrTargetId}
                size={110}
                providerName={qrProviderName}
              />
            </div>
            
            {/* Direct Source Toggle Selector if sources exist */}
            {relatedCitations.filter(src => src.sourceUrl?.startsWith('http')).length > 0 && (
              <div className="flex flex-col gap-1.5 border-t border-black/10 pt-3">
                <span className="text-[8px] text-[#77776F] font-black uppercase text-center">
                  Select QR Verification Target:
                </span>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  <button
                    onClick={() => setSelectedQrType('evidence')}
                    className={`px-2 py-1 text-[8.5px] font-bold border border-black uppercase transition-all ${
                      selectedQrType === 'evidence'
                        ? 'bg-black text-[#F8F7F2]'
                        : 'bg-white text-black hover:bg-[#F4F2EC]'
                    }`}
                  >
                    LeakMap Packet
                  </button>
                  {relatedCitations
                    .filter(src => src.sourceUrl?.startsWith('http'))
                    .map(src => (
                      <button
                        key={src.id}
                        onClick={() => setSelectedQrType(src.id)}
                        className={`px-2 py-1 text-[8.5px] font-bold border border-black uppercase transition-all ${
                          selectedQrType === src.id
                            ? 'bg-[#3B00FF] text-white'
                            : 'bg-white text-black hover:bg-[#F4F2EC]'
                        }`}
                      >
                        {src.id}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Description text */}
        <div className="flex flex-col gap-2.5">
          <h4 className="text-[9px] font-black text-[#77776F] uppercase tracking-wider">Overview Assessment</h4>
          <p className="text-[11px] text-black leading-relaxed bg-white p-3 border border-black font-semibold">
            {explanation}
          </p>
        </div>

        {/* What It Proves */}
        <div className="flex flex-col gap-2.5">
          <h4 className="text-[9px] font-black text-[#77776F] uppercase tracking-wider">What it Proves</h4>
          <div className="flex gap-2.5 items-start bg-white border border-black p-3 text-[11px] text-[#050505] leading-relaxed shadow-[2px_2px_0px_#050505]">
            <ShieldCheck size={16} className="shrink-0 mt-0.5 text-green-600" />
            <p className="font-semibold">{whatItProves}</p>
          </div>
        </div>

        {/* What It Does Not Prove */}
        <div className="flex flex-col gap-2.5">
          <h4 className="text-[9px] font-black text-[#77776F] uppercase tracking-wider">What it does NOT prove</h4>
          <div className="flex gap-2.5 items-start bg-white border border-black p-3 text-[11px] text-[#050505] leading-relaxed shadow-[2px_2px_0px_#050505]">
            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-500" />
            <p className="font-semibold">{whatItDoesNotProve}</p>
          </div>
        </div>

        {/* Unknowns List */}
        {unknownsList.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <h4 className="text-[9px] font-black text-[#77776F] uppercase tracking-wider">Key Unknown Vectors</h4>
            <ul className="text-[10px] text-black bg-[#EBE9E2]/50 border border-black p-3 flex flex-col gap-1.5 list-none font-semibold">
              {unknownsList.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-black inline-block shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Evidence documents database citations */}
        {relatedCitations.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-black pt-4">
            <div className="flex items-center gap-1.5">
              <Info size={12} className="text-[#050505]" />
              <h4 className="text-[9px] font-black text-black uppercase tracking-wider">Official Citations & Policies</h4>
            </div>

            <div className="flex flex-col gap-3">
              {relatedCitations.map((cit) => (
                <div key={cit.id} className="border border-black bg-white p-3.5 flex flex-col gap-2 shadow-[2px_2px_0px_#050505]">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-black text-black leading-snug">
                      {cit.title}
                    </p>
                    {cit.sourceUrl && (
                      <a 
                        href={cit.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-5 h-5 border border-black hover:bg-black hover:text-white flex items-center justify-center transition-colors shrink-0"
                      >
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <p className="text-[10px] text-[#77776F] leading-relaxed font-semibold uppercase">
                    [{cit.documentType}] {cit.claimSupported}
                  </p>
                  <div className="flex items-center justify-between text-[8px] font-mono text-[#77776F] pt-2 border-t border-black/10">
                    <span>Reviewed: {cit.lastReviewed}</span>
                    <span className="text-black font-extrabold uppercase">Confidence: {cit.confidence}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drawer Action Bar */}
      <div className="p-4 border-t-2 border-black bg-white flex flex-col gap-2">
        {evidenceCardId && (
          <>
            <Link
              href={`/evidence/${evidenceCardId}`}
              onClick={handleClose}
              className="w-full py-2 bg-[#3B00FF] hover:bg-black text-white text-center text-xs font-bold uppercase tracking-wider border border-black shadow-[2.5px_2.5px_0px_#050505] transition-all block"
            >
              Open Evidence Packet
            </Link>
            <Link
              href="/evidence"
              onClick={handleClose}
              className="w-full py-2 bg-white hover:bg-[#F4F2EC] text-black text-center text-xs font-bold uppercase tracking-wider border border-black shadow-[2.5px_2.5px_0px_#050505] transition-all block"
            >
              Open Source Registry
            </Link>
          </>
        )}
        
        <button
          onClick={handleClose}
          className="w-full py-1.5 bg-[#F4F2EC] hover:bg-black hover:text-white text-black text-[11px] font-bold uppercase tracking-wider border border-black transition-all text-center"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
}
