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
            <span className="font-black uppercase text-black">Map Evidence Notice:</span> Visual routes prove verified gateway endpoints or disclosed subprocessor contract locations. Hidden internal processing paths are unobservable.
          </p>
        </div>
        <div className="font-extrabold uppercase text-right leading-none shrink-0 whitespace-nowrap">
          LAT 20.59N LON 78.96E // ACTIVE VECTOR: {providerId.toUpperCase()}
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row border-b-2 border-black">
        {/* Left Column: Selector controls */}
        <div className="w-full lg:w-[320px] p-6 border-r-2 border-black bg-[#F8F7F2] flex flex-col gap-6 shrink-0">
          <div className="border-b border-black pb-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">ROUTING CONSOLE</h2>
            <p className="text-[11px] text-[#77776F] font-semibold mt-1 uppercase">Select provider to inspect active data routing paths.</p>
          </div>

          <ProviderSelector />

          <div className="border border-black bg-white p-4 shadow-[2px_2px_0px_#050505] text-[10px] leading-relaxed uppercase text-[#77776F] font-semibold">
            <p className="text-black font-extrabold mb-1">Interactive Telemetry</p>
            <p>Click on any route segment or destination node directly on the 3D globe to load official policy citations, proof parameters, and unknown risk variables in the audit drawer.</p>
          </div>
        </div>

        {/* Right Column: Globe Map Canvas */}
        <div className="flex-grow relative bg-white flex items-center justify-center min-h-[500px]">
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
