'use client';

import React, { useState, useEffect } from 'react';
import { useScanStore, ScanResult } from '../../store/useScanStore';
import { Play, RotateCcw, ShieldCheck, Zap, Layers, RefreshCw } from 'lucide-react';
import { saveScanRecord } from '../../lib/db';

export default function JudgeDemoMode() {
  const { setPrompt, setProviderId, setIsRedacted, setActiveNodeId, setActiveEdgeId, setDrawerOpen } = useScanStore();
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>("JUDGE DEMO MODE INACTIVE");

  const stepsList = [
    "1. Load critical clinical PII file & set Gemini provider",
    "2. Run telemetry analysis console (score counts to 94)",
    "3. Draw map arcs (India → Singapore Gateway → US)",
    "4. Slide open Evidence Drawer (Proves vs Does Not Prove)",
    "5. Apply PII redaction shield (score drops 94 → 41)",
    "6. Switch to Local Sovereign Mode (score drops to 18)",
    "7. Generate verification receipt and AI Data Passport",
    "8. Final Audit Verification Pitch"
  ];

  const handleStartDemo = () => {
    setIsPlaying(true);
    setDemoStep(1);
  };

  const handleResetDemo = () => {
    setIsPlaying(false);
    setDemoStep(0);
    setStatusMsg("DEMO RESET. IDLE.");
    setPrompt("");
    setProviderId("gemini");
    setIsRedacted(false);
    setActiveNodeId(null);
    setActiveEdgeId(null);
    setDrawerOpen(false);
    useScanStore.setState({ activeResult: null, isAnalyzing: false });
  };

  useEffect(() => {
    if (!isPlaying) return;

    let timeout: NodeJS.Timeout;

    const runStep = async () => {
      switch (demoStep) {
        case 1:
          setStatusMsg("LOADING DEMO DATA & GEMINI TARGET");
          setPrompt("Summarize my father's diabetes report (Name: Rajesh Kumar, age 58) and Aadhaar-linked hospital file: 4882-9901-4412.");
          setProviderId("gemini");
          setIsRedacted(false);
          setActiveNodeId(null);
          setActiveEdgeId(null);
          setDrawerOpen(false);
          
          timeout = setTimeout(() => setDemoStep(2), 2000);
          break;

        case 2:
          setStatusMsg("ANALYZING PROMPT & COUNTING RISK TO 94");
          useScanStore.setState({ isAnalyzing: true });
          
          timeout = setTimeout(() => {
            const mockResult: ScanResult = {
              id: "LMX-29A8-77C1",
              timestamp: new Date().toISOString(),
              originalPrompt: "Summarize my father's diabetes report (Name: Rajesh Kumar, age 58) and Aadhaar-linked hospital file: 4882-9901-4412.",
              redactedPrompt: "Summarize my father's [HEALTH_DATA_1] report (Name: [PERSONAL_NAME_1], age [PERSONAL_AGE_1]) and Aadhaar-linked hospital file: [GOV_ID_1].",
              detectedEntities: [
                { type: "HEALTH_DATA", match: "diabetes report", token: "[HEALTH_DATA]" },
                { type: "GOV_ID", match: "4882-9901-4412", token: "[GOV_ID]" },
                { type: "PERSONAL", match: "Rajesh Kumar", token: "[PERSON]" }
              ],
              detectedTypes: ["HEALTH_DATA", "GOV_ID", "PERSONAL"],
              sensitivityLevel: "Critical",
              originalRisk: {
                score: 94,
                rating: "Critical",
                color: "text-red-500",
                glowColor: "rgba(239, 68, 68, 0.5)",
                breakdown: { promptSensitivity: 35, foreignExposure: 15, subprocessorVisibility: 14, dataResidencyAmbiguity: 10, trainingAmbiguity: 10, humanReviewRisk: 5, redactionPenalty: 5 }
              },
              redactedRisk: {
                score: 41,
                rating: "Medium",
                color: "text-amber-400",
                glowColor: "rgba(251, 191, 36, 0.4)",
                breakdown: { promptSensitivity: 10, foreignExposure: 15, subprocessorVisibility: 10, dataResidencyAmbiguity: 6, trainingAmbiguity: 0, humanReviewRisk: 0, redactionPenalty: 0 }
              },
              isRedacted: false,
              aiResponse: "[Demo Simulation Mode] Rajesh Kumar's diabetes audit completed. Disclaimer: Telemetry logs indicate potential transit over Singapore and United States jurisdictions. Human audit reviews are warnings on unpaid credentials.",
              providerId: "gemini",
              mode: "demo"
            };
            useScanStore.setState({ isAnalyzing: false, activeResult: mockResult });
            saveScanRecord(mockResult);
            setDemoStep(3);
          }, 3000);
          break;

        case 3:
          setStatusMsg("DRAWING ARC TELEMETRY DATA PATHS");
          // Renders routing arcs on globe
          timeout = setTimeout(() => setDemoStep(4), 2000);
          break;

        case 4:
          setStatusMsg("OPENING ROUTE EVIDENCE PACKET DRAWER");
          setActiveEdgeId({ from: "gateway", to: "vertex" }); // ROUTE-GEMINI-SUBPROCESSOR
          setDrawerOpen(true);
          
          timeout = setTimeout(() => setDemoStep(5), 3500);
          break;

        case 5:
          setStatusMsg("REDACTION FIREWALL APPLIED. RISK DROPS TO 41.");
          setIsRedacted(true);
          setDrawerOpen(false);
          setActiveNodeId(null);
          setActiveEdgeId(null);
          // Update result redacted state
          useScanStore.setState((state: any) => {
            if (state.activeResult) {
              return {
                activeResult: { ...state.activeResult, isRedacted: true }
              };
            }
            return {};
          });
          
          timeout = setTimeout(() => setDemoStep(6), 2500);
          break;

        case 6:
          setStatusMsg("ROUTING TO LOCAL SOVEREIGN INFRASTRUCTURE");
          setProviderId("local");
          // Render local mock
          useScanStore.setState((state: any) => {
            if (state.activeResult) {
              const localMock = {
                ...state.activeResult,
                providerId: "local",
                isRedacted: false,
                originalRisk: {
                  score: 18,
                  rating: "Low",
                  color: "text-emerald-400",
                  glowColor: "rgba(16, 185, 129, 0.4)",
                  breakdown: { promptSensitivity: 10, foreignExposure: 0, subprocessorVisibility: 0, dataResidencyAmbiguity: 0, trainingAmbiguity: 0, humanReviewRisk: 0, redactionPenalty: 8 }
                },
                redactedRisk: {
                  score: 18,
                  rating: "Low",
                  color: "text-emerald-400",
                  glowColor: "rgba(16, 185, 129, 0.4)",
                  breakdown: { promptSensitivity: 10, foreignExposure: 0, subprocessorVisibility: 0, dataResidencyAmbiguity: 0, trainingAmbiguity: 0, humanReviewRisk: 0, redactionPenalty: 8 }
                },
                aiResponse: "[Local Sovereign Node (127.0.0.1)] Llama-3-8B-Instruct processing Rajesh Kumar's hospital file: loopback route validated. Outbound network exposure reduced to 0%."
              };
              saveScanRecord(localMock);
              return { activeResult: localMock };
            }
            return {};
          });
          
          timeout = setTimeout(() => setDemoStep(7), 3000);
          break;

        case 7:
          setStatusMsg("GENERATING COMPLIANCE AUDIT PACKETS");
          // Triggers passport generation in history/registry
          
          timeout = setTimeout(() => setDemoStep(8), 2500);
          break;

        case 8:
          setStatusMsg("PITCH READY. COMPLETED SUCCESSFULLY!");
          setIsPlaying(false);
          break;

        default:
          setIsPlaying(false);
      }
    };

    runStep();

    return () => clearTimeout(timeout);
  }, [demoStep, isPlaying]);

  return (
    <div className="border-2 border-black bg-white p-5 shadow-[6px_6px_0px_#050505] w-full font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-black pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-[#3B00FF]" />
          <h3 className="text-sm font-black text-black uppercase tracking-tight">
            JUDGE PRESENTATION MODULE
          </h3>
        </div>
        <div className="flex gap-2">
          {!isPlaying && demoStep === 0 && (
            <button
              onClick={handleStartDemo}
              className="border border-black bg-[#00B873] text-white px-3 py-1 font-bold flex items-center gap-1 hover:bg-black hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_#050505]"
            >
              <Play size={12} /> Start Demo
            </button>
          )}
          {demoStep > 0 && (
            <button
              onClick={handleResetDemo}
              className="border border-black bg-white text-black px-3 py-1 font-bold flex items-center gap-1 hover:bg-[#EF2B2B] hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_#050505]"
            >
              <RotateCcw size={12} /> Reset Demo
            </button>
          )}
        </div>
      </div>

      {/* Progress display */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center bg-[#F4F2EC] p-3 border border-black shadow-[2px_2px_0px_#050505]">
          <span className="font-extrabold text-[#77776F] uppercase">STATUS:</span>
          <span className="font-black text-black uppercase tracking-wider text-right">{statusMsg}</span>
        </div>

        {/* Steps track list */}
        <div className="flex flex-col gap-2 mt-1">
          {stepsList.map((step, idx) => {
            const stepNum = idx + 1;
            const isCurrent = demoStep === stepNum;
            const isPassed = demoStep > stepNum;

            return (
              <div 
                key={idx} 
                className={`border p-2 flex items-center justify-between transition-all ${
                  isCurrent 
                    ? 'border-[#3B00FF] bg-[#3B00FF]/5 text-[#3B00FF] font-black' 
                    : isPassed 
                      ? 'border-gray-200 opacity-40 text-gray-500 line-through' 
                      : 'border-black/10 text-black/60'
                }`}
              >
                <span>{step}</span>
                {isCurrent && <RefreshCw size={12} className="animate-spin shrink-0" />}
                {isPassed && <span className="text-green-600 font-bold shrink-0">✓</span>}
              </div>
            );
          })}
        </div>

        {demoStep === 8 && (
          <div className="border border-black bg-[#00B873]/10 p-3 mt-2 text-[10.5px] leading-relaxed text-black font-semibold uppercase animate-fade-in shadow-[2px_2px_0px_#050505]">
            <p className="font-black border-b border-black/10 pb-1 mb-1.5 text-black">FINAL PRESENTATION PITCH:</p>
            "LeakMap AI does not ask users to trust the map. Every route, warning, and score is backed by an Evidence ID, rule, source, confidence score, and QR-verifiable audit packet."
          </div>
        )}
      </div>
    </div>
  );
}
