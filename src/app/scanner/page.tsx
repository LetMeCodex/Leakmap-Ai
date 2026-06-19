'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useScanStore } from '../../store/useScanStore';
import { providerProfiles } from '../../lib/providerProfiles';
import ProviderSelector from '../../components/scanner/ProviderSelector';
import PromptScanner from '../../components/scanner/PromptScanner';
import RedactionFirewall from '../../components/scanner/RedactionFirewall';
import RiskScoreMeter from '../../components/risk/RiskScoreMeter';
import RiskMarketOverview from '../../components/risk/RiskMarketOverview';
import AIResponsePanel from '../../components/scanner/AIResponsePanel';
import JurisdictionGlobe from '../../components/globe/JurisdictionGlobe';
import SubprocessorGraph from '../../components/graph/SubprocessorGraph';
import ProviderComparisonTable from '../../components/scanner/ProviderComparisonTable';
import ScanHistory from '../../components/scanner/ScanHistory';
import EvidenceDrawer from '../../components/evidence/EvidenceDrawer';
import JudgeDemoMode from '../../components/demo/JudgeDemoMode';
import LiveTelemetryConsole from '../../components/telemetry/LiveTelemetryConsole';
import BeforeAfterExposure from '../../components/redaction/BeforeAfterExposure';
import EvidenceReceipt from '../../components/receipt/EvidenceReceipt';

import { savePassportRecord } from '../../lib/db';
import { generatePassport } from '../../lib/passportGenerator';
import { evaluateRules } from '../../lib/ruleBook';
import { constructReceipt } from '../../lib/scanReceipt';

import { ShieldAlert, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

function ScannerConsole() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const { 
    providerId, 
    activeResult, 
    loadHistory, 
    isRedacted, 
    isAnalyzing, 
    setProviderId, 
    saveFullPrompt,
    geminiApiKey,
    openaiApiKey
  } = useScanStore();
  
  const [activeTab, setActiveTab] = useState<'globe' | 'graph' | 'comparison' | 'history'>('globe');

  // Sync url search parameters with active visual tabs
  useEffect(() => {
    loadHistory();
    const tabParam = searchParams.get('tab');
    if (tabParam === 'comparison') {
      setActiveTab('comparison');
    } else if (tabParam === 'history') {
      setActiveTab('history');
    }
  }, [searchParams, loadHistory]);

  const handleGeneratePassport = async () => {
    if (!activeResult) return;
    try {
      const activeProfile = providerProfiles[activeResult.providerId] || providerProfiles.gemini;
      const rulesTriggered = evaluateRules(
        activeResult.originalPrompt,
        activeResult.providerId,
        activeResult.isRedacted,
        activeResult.detectedTypes
      );

      const newPassport = generatePassport({
        scanId: activeResult.id,
        provider: activeResult.providerId === 'local' ? 'Local Sovereign' : activeResult.providerId === 'gemini' ? 'Google Gemini' : activeResult.providerId === 'openai' ? 'OpenAI' : 'Anthropic Claude',
        mode: activeResult.mode,
        sensitivityLevel: activeResult.sensitivityLevel,
        originalRisk: activeResult.originalRisk.score,
        redactedRisk: activeResult.redactedRisk.score,
        rulesTriggered,
        edges: activeProfile.edges,
        timestamp: activeResult.timestamp
      });

      await savePassportRecord(newPassport);
      alert(`AI Data Passport compiled successfully: ${newPassport.id}. Redirecting to secure certificate...`);
      router.push(`/passport/${newPassport.id}`);
    } catch (e) {
      console.error('Failed to generate passport:', e);
      alert('Failed to generate passport. Check console for details.');
    }
  };

  const currentProfile = providerProfiles[activeResult?.providerId || providerId] || providerProfiles.gemini;
  
  const receiptData = activeResult ? constructReceipt({
    scanId: activeResult.id,
    provider: activeResult.providerId === 'local' ? 'Local Sovereign' : activeResult.providerId === 'gemini' ? 'Google Gemini' : activeResult.providerId === 'openai' ? 'OpenAI' : 'Anthropic Claude',
    mode: activeResult.mode,
    sensitivityLevel: activeResult.sensitivityLevel,
    originalRisk: activeResult.originalRisk.score,
    redactedRisk: activeResult.redactedRisk.score,
    edges: currentProfile.edges,
    isRedacted: activeResult.isRedacted,
    saveFullPrompt: saveFullPrompt,
    timestamp: activeResult.timestamp
  }) : null;

  return (
    <div className="flex-grow w-full bg-[#F4F2EC] flex relative">
      {/* 1. Minimal LeakMap Utility Rail (Desktop Only) */}
      <div className="hidden lg:flex flex-col items-center py-8 w-16 border-r border-[#050505] bg-[#F8F7F2] shrink-0 gap-10 min-h-[620px] select-none">
        <div className="flex flex-col gap-10 items-center w-full">
          {/* SCAN */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group flex flex-col items-center gap-1.5 text-brutalist-text font-bold cursor-pointer transition-colors"
            title="SCAN"
          >
            <ShieldAlert size={20} className="text-[#3B00FF] group-hover:scale-110 transition-transform" />
            <span className="text-[7px] font-mono font-extrabold tracking-widest uppercase">SCAN</span>
          </button>
          
          {/* MAP */}
          <button 
            onClick={() => setActiveTab('globe')}
            className={`group flex flex-col items-center gap-1.5 cursor-pointer transition-colors ${activeTab === 'globe' ? 'text-[#00AEEF]' : 'text-brutalist-muted hover:text-brutalist-text'}`}
            title="MAP"
          >
            <ShieldAlert size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-[7px] font-mono font-extrabold tracking-widest uppercase">MAP</span>
          </button>
          
          {/* EVIDENCE */}
          <button 
            onClick={() => {
              setActiveTab('comparison');
              router.push('/evidence');
            }}
            className="group flex flex-col items-center gap-1.5 text-brutalist-muted hover:text-brutalist-text cursor-pointer transition-colors"
            title="EVIDENCE"
          >
            <ShieldAlert size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-[7px] font-mono font-extrabold tracking-widest uppercase">EVID</span>
          </button>
          
          {/* PASSPORT */}
          <button 
            onClick={() => {
              setActiveTab('history');
              router.push('/passport');
            }}
            className="group flex flex-col items-center gap-1.5 text-brutalist-muted hover:text-brutalist-text cursor-pointer transition-colors"
            title="PASSPORT"
          >
            <ShieldAlert size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-[7px] font-mono font-extrabold tracking-widest uppercase">PASS</span>
          </button>
        </div>
        
        <div className="mt-auto flex flex-col gap-6 items-center w-full">
          {/* SETTINGS */}
          <button 
            onClick={() => {
              alert("Settings Module: Configuration parameters are automatically loaded from local environment variables (.env.local).");
            }}
            className="group flex flex-col items-center gap-1.5 text-brutalist-muted hover:text-brutalist-text cursor-pointer transition-colors"
            title="SETTINGS"
          >
            <ShieldAlert size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-[7px] font-mono font-extrabold tracking-widest uppercase">SETT</span>
          </button>
        </div>
      </div>

      {/* 2. Main Page Layout Wrapper */}
      <div className="flex-grow w-full max-w-[1680px] mx-auto lg:px-[72px] px-6 py-6 flex flex-col">
        
        {/* Top Banner Warning Disclaimer */}
        <div className="border-b border-[#050505] py-4 w-full flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] font-mono text-[#111] leading-[1.5] select-none min-h-[56px]">
          <div className="flex items-center gap-2 max-w-4xl">
            <ShieldAlert size={16} className="text-[#DFA100] shrink-0" />
            <p>
              <span className="font-black text-[#050505] uppercase">Security Telemetry Notice:</span> LeakMap routes prompt traces through open compliance heuristics. Exact processing paths inside proprietary neural weights remain black-box boundaries.
            </p>
          </div>
          <div className="text-[#111] font-extrabold uppercase text-right leading-[1.3] shrink-0 whitespace-nowrap">
            TRACE CONFIDENCE: 90% VERIFIED ENDPOINTS
          </div>
        </div>

        {/* Presentation-Ready Judge Demo Mode banner */}
        <div className="w-full mt-6">
          <JudgeDemoMode />
        </div>

        {/* Two-Column Workspace Grid */}
        <div className="lg:mt-[56px] mt-8 flex flex-col lg:flex-row gap-[56px] w-full items-start">
          
          {/* Left Column: Auditing Console (32% width) */}
          <section className="w-full lg:w-[32%] flex flex-col gap-6 shrink-0">
            <div className="flex flex-col gap-1 border-b border-[#B9B7AE] pb-4 mb-2 select-none">
              <h2 className="text-[20px] font-black text-[#050505] uppercase tracking-[0.04em] leading-tight flex items-center gap-2">
                <Cpu size={18} className="text-[#3B00FF]" />
                <span>AUDITING CONSOLE</span>
              </h2>
              <p className="text-[13px] text-[#3A3A36] leading-[1.7] mt-1 font-mono font-medium">
                Paste prompt payloads to calculate jurisdictional compliance vectors.
              </p>
            </div>
            
            <ProviderSelector />
            
            <div className="bg-[#F8F7F2] border border-[#B9B7AE] p-6 rounded-none shadow-[2px_2px_8px_rgba(0,0,0,0.02)]">
              <PromptScanner />
            </div>

            {/* Live Typing Telemetry Console */}
            <LiveTelemetryConsole 
              providerId={providerId} 
              isAnalyzing={isAnalyzing} 
              hasApiKey={providerId === 'gemini' ? !!geminiApiKey : !!openaiApiKey} 
            />

            {activeResult && (
              <div className="bg-[#F8F7F2] border border-[#B9B7AE] p-6 rounded-none shadow-[2px_2px_8px_rgba(0,0,0,0.02)] animate-fade-in">
                <RedactionFirewall />
              </div>
            )}
          </section>

          {/* Right Column: Geopolitical Workspace (68% width) */}
          <section className="w-full lg:w-[68%] flex flex-col gap-6 relative">
            
            {/* Header tab navigation */}
            <div className="flex items-center justify-between border-b border-[#B9B7AE] pb-4 mb-8 select-none w-full">
              <h3 className="text-[20px] font-black text-[#050505] uppercase tracking-[0.04em] leading-tight">
                GEOPOLITICAL WORKSPACE
              </h3>
              
              <div className="flex items-center gap-2.5 z-10">
                {(['globe', 'graph', 'comparison', 'history'] as const).map((tab) => {
                  const labelMap = {
                    globe: '3D Globe',
                    graph: 'Graph Node',
                    comparison: 'Matrix',
                    history: 'Registry',
                  };
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? 'text-[#00AEEF] font-[900]' 
                          : 'text-[#111] opacity-70 hover:opacity-100 hover:underline hover:underline-offset-6 hover:decoration-2 hover:decoration-[#00AEEF]'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="workspaceTabPill"
                          className="absolute inset-0 bg-[#D7F2F7] border border-[#89B8C4] rounded-none -z-10"
                          transition={{ type: 'spring' as const, stiffness: 350, damping: 25 }}
                        />
                      )}
                      {labelMap[tab]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Workspace content */}
            <div className="md:min-h-[620px] min-h-[420px] w-full relative z-10 flex flex-col justify-start">
              
              {/* Background Word and Section Number Overlay */}
              <div className="absolute top-[30px] right-[40px] text-[150px] font-[900] text-[#050505]/[0.035] pointer-events-none uppercase tracking-tighter select-none font-display z-0 leading-none">
                ROUTES
              </div>
              <div className="absolute top-[20px] right-[24px] text-[52px] font-[900] text-[#050505] pointer-events-none select-none font-display z-0 leading-none">
                (03)
              </div>

              <div className="z-10 relative flex-1 flex flex-col h-full w-full">
                {activeTab === 'globe' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#F8F7F2] border border-[#B9B7AE] p-4 shadow-[2px_2px_8px_rgba(0,0,0,0.02)]">
                    <JurisdictionGlobe providerId={providerId} />
                  </div>
                )}
                {activeTab === 'graph' && (
                  <div className="w-full h-[620px] p-6 flex-1 flex flex-col justify-center bg-[#F8F7F2] border border-[#B9B7AE] shadow-[2px_2px_8px_rgba(0,0,0,0.02)]">
                    <SubprocessorGraph />
                  </div>
                )}
                {activeTab === 'comparison' && (
                  <div className="w-full h-full flex-1">
                    <ProviderComparisonTable />
                  </div>
                )}
                {activeTab === 'history' && (
                  <div className="w-full h-full p-6 flex-1 bg-[#F8F7F2] border border-[#B9B7AE] shadow-[2px_2px_8px_rgba(0,0,0,0.02)]">
                    <ScanHistory />
                  </div>
                )}
              </div>
            </div>

            {/* Under panel metrics: radial meter & response payload */}
            {activeResult && (
              <div className="flex flex-col gap-6 mt-6">
                
                {/* Score & Output Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Threat Vector Meter Card (5/12) */}
                  <div className="md:col-span-5 bg-[#F8F7F2] border border-[#B9B7AE] p-6 rounded-none shadow-[2px_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                    <RiskScoreMeter riskResult={isRedacted ? activeResult.redactedRisk : activeResult.originalRisk} />
                  </div>

                  {/* Response output terminal box (7/12) */}
                  <div className="md:col-span-7 flex flex-col justify-between">
                    <AIResponsePanel />
                  </div>
                </div>

                {/* Before / After Exposure Differential Comparison */}
                <BeforeAfterExposure 
                  originalScore={activeResult.originalRisk.score}
                  redactedScore={activeResult.redactedRisk.score}
                  providerId={activeResult.providerId}
                  detectedEntities={activeResult.detectedTypes}
                  onSwitchToLocal={() => setProviderId('local')}
                />

                {/* Audit slip / printable receipt panel */}
                {receiptData && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mt-4">
                    <div className="md:col-span-5 flex flex-col gap-4 py-4 border-t border-black/10">
                      <h4 className="text-sm font-black text-black uppercase tracking-tight">
                        VULNERABILITY AUDIT SLIP
                      </h4>
                      <p className="text-xs text-[#77776F] uppercase leading-relaxed font-semibold">
                        Every LeakMap prompt scan yields a QR-verifiable ledger receipt. You can print this slip physically or compile the AI Data Passport.
                      </p>
                    </div>
                    <div className="md:col-span-7 flex justify-center md:justify-end">
                      <EvidenceReceipt 
                        receipt={receiptData} 
                        onGeneratePassport={handleGeneratePassport}
                      />
                    </div>
                  </div>
                )}

              </div>
            )}
          </section>
        </div>

        {/* Risk Market Overview Analytics */}
        <section className="w-full mt-8">
          <RiskMarketOverview />
        </section>

        {/* Global Slide-out Drawer Panel */}
        <EvidenceDrawer />
      </div>
    </div>
  );
}

export default function ScannerPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] text-center select-none bg-[#F4F2EC]">
        <div className="w-8 h-8 border-4 border-black border-t-brutalist-blue animate-spin rounded-none mb-4" />
        <p className="text-xs font-mono text-brutalist-text font-bold uppercase tracking-widest">
          Loading Security Console...
        </p>
      </div>
    }>
      <ScannerConsole />
    </Suspense>
  );
}
