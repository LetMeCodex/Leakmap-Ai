'use client';

import React, { useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  evidenceSources, 
  claimLedger, 
  providerEvidenceProfiles, 
  routeEvidenceCards, 
  confidenceLevels 
} from '../../lib/evidenceRegistry';
import { ShieldAlert, ExternalLink, HelpCircle, ArrowUpRight, Scale, Info, CheckCircle } from 'lucide-react';
import { getSiteUrl } from '../../lib/siteUrl';

function EvidenceVaultContent() {
  const searchParams = useSearchParams();
  const highlightedClaim = searchParams.get('claim');
  
  // Refs to trace elements for auto-scrolling
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (highlightedClaim) {
      const element = cardRefs.current[highlightedClaim];
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }
  }, [highlightedClaim]);

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

  const siteUrl = getSiteUrl();
  const isLocalhost = siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1');

  return (
    <div className="flex-grow w-full bg-[#F4F2EC] text-[#050505] font-mono py-10 px-6 max-w-7xl mx-auto flex flex-col gap-12 select-none">
      
      {/* Top Section / Header */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b-2 border-black pb-8 items-start">
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#77776F]">
            <span>[05] CLAIM LEDGER / PROVIDER DISCLOSURE / ROUTE CONFIDENCE</span>
          </div>
          <h1 className="text-6xl sm:text-7xl font-black font-display tracking-tight leading-[0.85] uppercase text-black">
            EVIDENCE<br />
            VAULT
          </h1>
          <p className="text-sm font-semibold text-black leading-relaxed max-w-2xl mt-2 border-l-2 border-black pl-4">
            Every route, risk score, and provider claim is linked to verified endpoint telemetry, public provider disclosures, or clearly marked inference.
          </p>
        </div>
        
        <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-between gap-4 h-full">
          <span className="border-4 border-double border-black p-3 font-mono font-black text-center uppercase tracking-widest text-[9px] bg-white shadow-[3px_3px_0px_#050505]">
            <div className="text-[6px] tracking-tight font-extrabold border-b border-black pb-0.5 mb-1.5 text-[#77776F]">LEAKMAP AUDIT METHOD</div>
            <div className="text-xs font-black">TRACE CONFIDENCE MODEL</div>
            <div className="text-[8px] text-[#3B00FF] font-bold mt-1">VERIFIED / DISCLOSED / INFERRED</div>
          </span>
        </div>
      </section>

      {/* Deployment Check & Disclaimer Banner Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warning Notice Banner */}
        <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#050505] flex gap-4 items-start leading-relaxed uppercase font-semibold text-[11px] text-[#050505]">
          <ShieldAlert size={20} className="text-[#DFA100] shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-black block mb-1">Observation Boundary Disclaimer:</span> 
            <p>
              LeakMap does not claim to observe hidden internal processing paths inside AI providers. It separates verified network evidence, disclosed policy evidence, and inferred jurisdictional risk.
            </p>
          </div>
        </div>

        {/* Deployment Check Panel */}
        <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#050505] flex flex-col gap-3 font-semibold text-[11px] text-[#050505] uppercase">
          <div className="flex items-center gap-2 border-b border-black pb-2 justify-between">
            <span className="font-extrabold text-black block">Deployment Gateway Check</span>
            {isLocalhost ? (
              <span className="bg-amber-100 text-amber-800 border border-amber-800 px-2 py-0.5 text-[8.5px] font-black tracking-wider animate-pulse">
                ⚠️ LOCALHOST DEMO LIMIT
              </span>
            ) : (
              <span className="bg-green-100 text-green-800 border border-green-800 px-2 py-0.5 text-[8.5px] font-black tracking-wider">
                ✓ PUBLIC GATEWAY ACTIVE
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2 font-mono">
            <div>
              <span className="text-[8px] text-[#77776F] block font-bold">Resolved Verification Base URL:</span>
              <code className="text-black font-black text-xs break-all lowercase">{siteUrl}</code>
            </div>
            {isLocalhost ? (
              <p className="text-red-600 text-[10px] leading-snug tracking-tight font-medium">
                Warning: Mobile devices scanning verification QRs will fail to connect locally. Deploy to Vercel/Firebase, or run <code className="lowercase bg-gray-100 px-1 border border-black/10">ngrok http 3000</code> and configure <code className="lowercase bg-gray-100 px-1 border border-black/10">NEXT_PUBLIC_SITE_URL</code> to resolve this.
              </p>
            ) : (
              <p className="text-green-700 text-[10px] leading-snug tracking-tight font-medium">
                Gateway active. All external mobile scanners will successfully resolve and verify QR-encoded compliance certificates.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 1: Claim Ledger */}
      <section className="flex flex-col gap-4">
        <div className="border-b border-black pb-2">
          <span className="text-[9px] text-[#77776F] font-bold">SECTION 01</span>
          <h2 className="text-xl font-black text-black uppercase tracking-tight">Claim Ledger</h2>
        </div>

        <div className="border border-black overflow-hidden shadow-[4px_4px_0px_#050505] bg-white">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#F4F2EC] border-b border-black text-[#77776F] font-black uppercase text-[10px]">
                <th className="p-3 w-20">CLAIM ID</th>
                <th className="p-3">UI CLAIM</th>
                <th className="p-3 w-32">EVIDENCE TYPE</th>
                <th className="p-3 w-20 text-center">CONF.</th>
                <th className="p-3">SOURCE CITATIONS</th>
                <th className="p-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {claimLedger.map((claim) => (
                <tr 
                  key={claim.id} 
                  ref={el => { cardRefs.current[claim.id] = el as any; }}
                  className={`border-b border-black last:border-0 transition-colors bg-white hover:bg-[#F8F7F2] font-semibold text-[11px] uppercase ${
                    highlightedClaim === claim.id ? 'bg-[#3B00FF]/5 outline outline-2 outline-[#3B00FF]' : ''
                  }`}
                >
                  <td className="p-3 text-[#77776F] font-extrabold">{claim.id}</td>
                  <td className="p-3 text-black font-extrabold tracking-tight">{claim.uiClaim}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-[8.5px] font-black ${getBadgeColors(claim.evidenceType)}`}>
                      {claim.evidenceType}
                    </span>
                  </td>
                  <td className="p-3 text-center text-[#3B00FF] font-black">{claim.confidenceScore}%</td>
                  <td className="p-3 text-[#77776F] lowercase tracking-wide">{claim.sourceIds.join(', ')}</td>
                  <td className="p-3 text-right text-black font-extrabold">{claim.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 2: Evidence Type System */}
      <section className="flex flex-col gap-4">
        <div className="border-b border-black pb-2">
          <span className="text-[9px] text-[#77776F] font-bold">SECTION 02</span>
          <h2 className="text-xl font-black text-black uppercase tracking-tight">Evidence Type System</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(confidenceLevels).map(([key, level]) => (
            <div 
              key={key}
              className="border-2 border-black bg-white p-5 flex flex-col justify-between gap-4 shadow-[4px_4px_0px_#050505]"
            >
              <div className="flex flex-col gap-2">
                <span 
                  className="px-2 py-0.5 text-[9px] font-black uppercase inline-block self-start"
                  style={{ backgroundColor: level.color + '20', color: level.color, border: `1px solid ${level.color}` }}
                >
                  {level.label}
                </span>
                <p className="text-xs font-semibold text-black leading-relaxed mt-2 uppercase">
                  {level.definition}
                </p>
              </div>

              <div className="border-t border-black/10 pt-3 flex flex-col gap-1">
                <span className="text-[8px] text-[#77776F] font-bold">EXAMPLE CONDUIT:</span>
                <p className="text-[10px] text-black font-semibold uppercase leading-normal">
                  "{level.example}"
                </p>
                <div className="flex justify-between items-center text-[10px] font-black text-black mt-2 pt-2 border-t border-black/10">
                  <span>CONFIDENCE:</span>
                  <span className="text-[#3B00FF]">{level.confidenceRange}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Provider Evidence Profiles */}
      <section className="flex flex-col gap-4">
        <div className="border-b border-black pb-2">
          <span className="text-[9px] text-[#77776F] font-bold">SECTION 03</span>
          <h2 className="text-xl font-black text-black uppercase tracking-tight">Provider Evidence Profiles</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(providerEvidenceProfiles).map(([key, profile]) => (
            <div 
              key={key} 
              className="border-2 border-black bg-white p-6 flex flex-col gap-4 shadow-[4px_4px_0px_#050505]"
            >
              <div className="flex justify-between items-start border-b border-black pb-3">
                <div>
                  <h3 className="text-md font-black text-black uppercase tracking-tight">{profile.providerName}</h3>
                  <span className="text-[9px] text-[#77776F] font-semibold uppercase block mt-0.5">ENDPOINT: {profile.endpointDomain}</span>
                </div>
                <span className="border border-black bg-[#F4F2EC] px-2 py-0.5 text-[9px] font-bold uppercase">
                  {profile.mode}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className="text-[8.5px] text-[#77776F] font-bold uppercase tracking-wider">Policy Disclosures & Telemetry</span>
                <ul className="text-[10.5px] font-semibold text-black leading-relaxed flex flex-col gap-2 uppercase">
                  {profile.evidence.map((bullet, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span className="w-1.5 h-1.5 bg-black inline-block mt-1 shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-black pt-4 grid grid-cols-3 gap-2 text-[10px] font-bold">
                <div>
                  <span className="text-[7.5px] text-[#77776F] font-bold uppercase block">Claim Level</span>
                  <span className="text-black uppercase font-black">{profile.claimLevel}</span>
                </div>
                <div>
                  <span className="text-[7.5px] text-[#77776F] font-bold uppercase block">Confidence</span>
                  <span className="text-[#3B00FF] font-black">{profile.confidence}</span>
                </div>
                <div>
                  <span className="text-[7.5px] text-[#77776F] font-bold uppercase block">Core Unknown</span>
                  <span className="text-black font-black block truncate" title={profile.unknown}>{profile.unknown}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Route Evidence Cards */}
      <section className="flex flex-col gap-4">
        <div className="border-b border-black pb-2">
          <span className="text-[9px] text-[#77776F] font-bold">SECTION 04</span>
          <h2 className="text-xl font-black text-black uppercase tracking-tight">Route Evidence Cards</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {routeEvidenceCards.map((card) => {
            const isHighlighted = highlightedClaim === card.id;

            return (
              <div 
                key={card.id}
                ref={el => { cardRefs.current[card.id] = el as any; }}
                className={`border-2 border-black bg-white p-6 flex flex-col gap-4 transition-all duration-300 ${
                  isHighlighted 
                    ? 'border-[#3B00FF] shadow-[8px_8px_0px_#3B00FF] translate-x-[-2px] translate-y-[-2px]' 
                    : 'shadow-[4px_4px_0px_#050505]'
                }`}
              >
                <div className="flex justify-between items-start border-b border-black pb-3">
                  <div>
                    <span className="text-[8.5px] text-[#77776F] font-bold uppercase block">ROUTE EDGE ID: {card.id}</span>
                    <h3 className="text-sm font-black text-black uppercase mt-0.5">{card.routeLabel}</h3>
                  </div>
                  <span className={`px-2 py-0.5 text-[8.5px] font-black uppercase ${getBadgeColors(card.evidenceType)}`}>
                    {card.evidenceType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold bg-[#F4F2EC] p-3 border border-black uppercase text-[10px]">
                  <div>
                    <span className="text-[7.5px] text-[#77776F] font-bold">FROM ORIGIN:</span>
                    <p className="text-black font-black mt-0.5">{card.from}</p>
                  </div>
                  <div>
                    <span className="text-[7.5px] text-[#77776F] font-bold">TO DESTINATION:</span>
                    <p className="text-black font-black mt-0.5">{card.to}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 font-semibold text-[11px] leading-relaxed uppercase mt-2">
                  <div>
                    <span className="text-[8px] text-green-700 font-bold block mb-0.5">What this proves:</span>
                    <p className="text-black">{card.whatItProves}</p>
                  </div>
                  <div>
                    <span className="text-[8px] text-red-600 font-bold block mb-0.5">What this does NOT prove:</span>
                    <p className="text-black">{card.whatItDoesNotProve}</p>
                  </div>
                </div>

                <div className="border-t border-black/10 pt-3 flex flex-col gap-2">
                  <span className="text-[8px] text-[#77776F] font-bold uppercase">Linked Citations & Unknowns</span>
                  <div className="flex flex-wrap gap-2 text-[8.5px] font-extrabold">
                    {card.sourceIds.map((srcId) => (
                      <span key={srcId} className="border border-black bg-white px-2 py-0.5 text-black">
                        REF: {srcId}
                      </span>
                    ))}
                    <span className="border border-[#3B00FF] bg-[#3B00FF]/5 text-[#3B00FF] px-2 py-0.5 ml-auto">
                      CONFIDENCE: {card.confidenceScore}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 5: Source Registry */}
      <section className="flex flex-col gap-4">
        <div className="border-b border-black pb-2">
          <span className="text-[9px] text-[#77776F] font-bold">SECTION 05</span>
          <h2 className="text-xl font-black text-black uppercase tracking-tight">Source Registry</h2>
        </div>

        <div className="border border-black overflow-hidden shadow-[4px_4px_0px_#050505] bg-white">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#F4F2EC] border-b border-black text-[#77776F] font-black uppercase text-[10px]">
                <th className="p-3 w-32">SOURCE ID</th>
                <th className="p-3">PROVIDER</th>
                <th className="p-3">DOCUMENT TYPE</th>
                <th className="p-3">CLAIM SUPPORTED</th>
                <th className="p-3 w-28 text-center">LAST REVIEW</th>
                <th className="p-3 w-28 text-center">TRUST LEVEL</th>
                <th className="p-3 w-16 text-center">LINK</th>
              </tr>
            </thead>
            <tbody>
              {evidenceSources.map((source) => (
                <tr 
                  key={source.id} 
                  ref={el => { cardRefs.current[source.id] = el as any; }}
                  className={`border-b border-black last:border-0 bg-white hover:bg-[#F8F7F2] font-semibold text-[11px] uppercase ${
                    highlightedClaim === source.id ? 'bg-[#3B00FF]/5 outline outline-2 outline-[#3B00FF]' : ''
                  }`}
                >
                  <td className="p-3 text-black font-extrabold">{source.id}</td>
                  <td className="p-3 text-black font-black">{source.provider}</td>
                  <td className="p-3 text-[#77776F] font-bold">{source.documentType}</td>
                  <td className="p-3 text-black font-extrabold normal-case">{source.claimSupported}</td>
                  <td className="p-3 text-center text-[#77776F]">{source.lastReviewed}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 text-[8.5px] font-black ${
                      source.confidence === 'high' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {source.confidence}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {source.sourceUrl ? (
                      <a 
                        href={source.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex w-6 h-6 border border-black hover:bg-black hover:text-white items-center justify-center transition-colors shadow-[1px_1px_0px_#050505]"
                      >
                        <ArrowUpRight size={12} />
                      </a>
                    ) : (
                      <span className="text-[#77776F]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 6: What We Cannot Claim */}
      <section className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#050505]">
        <div className="border-b border-black pb-3 mb-4 flex items-center gap-2">
          <ShieldAlert size={20} className="text-red-600 shrink-0" />
          <h2 className="text-xl font-black text-black uppercase tracking-tight">WHAT LEAKMAP CANNOT CLAIM</h2>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-black leading-relaxed list-none uppercase">
          <li className="flex gap-2.5 items-start">
            <span className="text-red-600 font-extrabold mt-0.5">↳ [X]</span>
            <p>Exact physical server path inside proprietary provider firewalls.</p>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="text-red-600 font-extrabold mt-0.5">↳ [X]</span>
            <p>Exact model worker machine or active GPU container location.</p>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="text-red-600 font-extrabold mt-0.5">↳ [X]</span>
            <p>Whether every listed subprocessor actively touched this specific prompt.</p>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="text-red-600 font-extrabold mt-0.5">↳ [X]</span>
            <p>Real-time internal provider routing and fallback overrides.</p>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="text-red-600 font-extrabold mt-0.5">↳ [X]</span>
            <p>Hidden caching or storage duration beyond public disclosures.</p>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="text-red-600 font-extrabold mt-0.5">↳ [X]</span>
            <p>Classified government subpoena or intelligence access requests.</p>
          </li>
        </ul>
      </section>

      {/* Section 7: Confidence Explainer */}
      <section className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#050505] flex flex-col gap-4">
        <div className="border-b border-black pb-3 mb-2 flex items-center gap-2">
          <Scale size={20} className="text-[#3B00FF]" />
          <h2 className="text-xl font-black text-black uppercase tracking-tight">Confidence Score Explainer</h2>
        </div>

        <div className="bg-[#F4F2EC] border border-black p-4 text-center font-bold text-sm md:text-md leading-relaxed uppercase shadow-[2px_2px_0px_#050505]">
          <p className="text-[#77776F] text-xs font-black mb-2">TELEMETRY FORMULA</p>
          <p className="text-black font-extrabold tracking-tight">
            Final Route Confidence = <br />
            Runtime Evidence Weight (50%) <br />
            + Provider Disclosure Weight (25%) <br />
            + Configuration Clarity (25%) <br />
            - Unknown Internal Routing Penalty <br />
            - Policy Ambiguity Penalty
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 text-xs leading-relaxed uppercase font-semibold">
          <div className="border border-black p-4 bg-white shadow-[2px_2px_0px_#050505]">
            <span className="text-[9px] text-green-700 font-bold block mb-1">EXAMPLE 01: VERIFIED ENDPOINT ROUTE</span>
            <p className="text-black">
              Runtime evidence verified: <span className="text-green-700">+50%</span><br />
              Endpoint domain resolved: <span className="text-green-700">+25%</span><br />
              Provider config known: <span className="text-green-700">+15%</span><br />
              Unknown internal path: <span className="text-red-600">-10%</span><br />
              <span className="font-extrabold text-black mt-2 inline-block pt-1 border-t border-black/10 w-full">Final confidence: 80%</span>
            </p>
          </div>
          <div className="border border-black p-4 bg-white shadow-[2px_2px_0px_#050505]">
            <span className="text-[9px] text-[#3B00FF] font-bold block mb-1">EXAMPLE 02: DISCLOSED SUBPROCESSOR ROUTE</span>
            <p className="text-black">
              Official subprocessor list disclosure: <span className="text-green-700">+45%</span><br />
              Country/entity known: <span className="text-green-700">+20%</span><br />
              Not request-specific list: <span className="text-red-600">-25%</span><br />
              <span className="font-extrabold text-black mt-2 inline-block pt-1 border-t border-black/10 w-full">Final confidence: 40%</span>
            </p>
          </div>
        </div>
      </section>
      
    </div>
  );
}

export default function EvidencePage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex flex-col items-center justify-center min-h-[500px] text-center bg-[#F4F2EC]">
        <div className="w-8 h-8 border-4 border-black border-t-brutalist-blue animate-spin rounded-none mb-4" />
        <p className="text-xs font-mono text-[#050505] font-bold uppercase tracking-widest">
          Resolving Evidence Vault...
        </p>
      </div>
    }>
      <EvidenceVaultContent />
    </Suspense>
  );
}
