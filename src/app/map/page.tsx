'use client';

import React, { Suspense } from 'react';
import JurisdictionGlobe from '../../components/globe/JurisdictionGlobe';
import ProviderSelector from '../../components/scanner/ProviderSelector';
import EvidenceDrawer from '../../components/evidence/EvidenceDrawer';
import { useScanStore } from '../../store/useScanStore';
import { ShieldAlert } from 'lucide-react';

function MapContent() {
  const { providerId } = useScanStore();

  return (
    <div className="flex-grow w-full bg-[#F4F2EC] flex flex-col relative select-none">
      
      {/* Swiss Editorial Banner Disclaimer */}
      <div className="border-b-2 border-black py-4 px-6 w-full flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[#050505] leading-relaxed">
        <div className="flex items-center gap-2 max-w-4xl">
          <ShieldAlert size={16} className="text-[#DFA100] shrink-0" />
          <p>
            <span className="font-black uppercase text-black">Map Evidence Notice:</span> Visual routes model potential jurisdictional exposure based on policy and subprocessor registry data. Hidden internal processing paths are unobservable.
          </p>
        </div>
        <div className="font-extrabold uppercase text-right leading-none shrink-0 whitespace-nowrap">
          LAT 20.59N LON 78.96E // ACTIVE VECTOR: {providerId.toUpperCase()}
        </div>
      </div>

      {/* Methodology Notice Banner */}
      <div className="bg-[#FFF4E5] border-b-2 border-black py-3 px-6 w-full text-[11px] font-mono text-[#663C00] leading-relaxed">
        <span className="font-black uppercase text-[#B25E00]">METHODOLOGY NOTICE:</span> LeakMap AI models potential jurisdictional exposure based on official provider subprocessors, known API gateways, data residency configurations, and inference rules. Because proprietary AI networks remain unobservable, we do not trace exact physical server routes or sniff real-time prompt packets.
      </div>

      <div className="flex-grow flex flex-col lg:flex-row border-b-2 border-black">
        {/* Left Column: Selector controls */}
        <div className="w-full lg:w-[320px] p-6 border-r-2 border-black bg-[#F8F7F2] flex flex-col gap-6 shrink-0">
          <div className="border-b border-black pb-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">ROUTING CONSOLE</h2>
            <p className="text-[11px] text-[#77776F] font-semibold mt-1 uppercase">Select provider to inspect active jurisdictional exposure pathways.</p>
          </div>

          <ProviderSelector />

          {/* FOR JUDGES Expandable Mini-Tutorial */}
          <details className="border border-black bg-white shadow-[2px_2px_0px_#050505] group">
            <summary className="p-3.5 font-black uppercase text-[11px] cursor-pointer hover:bg-[#F4F2EC] flex items-center justify-between select-none">
              <span>FOR JUDGES: HOW IT WORKS</span>
              <span className="group-open:rotate-180 transition-transform font-bold text-xs inline-block">▼</span>
            </summary>
            <div className="px-3.5 pb-3.5 pt-1 text-[10.5px] leading-relaxed text-[#050505] font-semibold flex flex-col gap-2 border-t border-black/10">
              <p>
                <strong className="text-[#3B00FF]">Why is this evidence-backed?</strong> Because third-party AI providers do not disclose exact GPU/datacenter routing for single prompts. Our pathways represent maximum potential jurisdictional exposure based on registered subprocessors (DPA), active DNS gateways, and policy rules.
              </p>
              <p>
                Every segment belongs to a strict 3-layer architecture: solid cyan segments denote verified endpoints, dashed lines denote contractually disclosed subprocessors, and dotted red/amber segments denote inferred risk or unknown internal routing nodes.
              </p>
            </div>
          </details>

          <div className="border border-black bg-white p-4 shadow-[2px_2px_0px_#050505] text-[10px] leading-relaxed uppercase text-[#77776F] font-semibold">
            <p className="text-black font-extrabold mb-1">Interactive Telemetry</p>
            <p>Click on any route segment or destination node directly on the 3D globe to load official policy citations, proof parameters, and unknown risk variables in the audit drawer.</p>
          </div>
        </div>

        {/* Right Column: Globe Map Canvas */}
        <div className="flex-grow relative bg-white flex items-center justify-center min-h-[500px]">
          {/* Global label overlay above 3D Globe */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-[#EF2B2B] text-white border-2 border-black px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_#050505] text-center">
            TRACE TYPE: EXPOSURE MODEL (NOT PHYSICAL ROUTE)
          </div>
          <JurisdictionGlobe providerId={providerId} />
        </div>
      </div>

      {/* Global Slide-out Drawer Panel */}
      <EvidenceDrawer />
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex flex-col items-center justify-center min-h-[500px] text-center bg-[#F4F2EC]">
        <div className="w-8 h-8 border-4 border-black border-t-brutalist-blue animate-spin rounded-none mb-4" />
        <p className="text-xs font-mono text-[#050505] font-bold uppercase tracking-widest">
          Resolving Geopolitical Map...
        </p>
      </div>
    }>
      <MapContent />
    </Suspense>
  );
}
