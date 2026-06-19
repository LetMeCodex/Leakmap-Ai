'use client';

import React, { useEffect, useState } from 'react';
import { RiskScoreResult } from '../../lib/riskEngine';
import { useScanStore } from '../../store/useScanStore';
import Link from 'next/link';

interface MeterProps {
  riskResult: RiskScoreResult;
}

export default function RiskScoreMeter({ riskResult }: MeterProps) {
  const { score, rating, breakdown } = riskResult;
  const [displayScore, setDisplayScore] = useState(0);
  const providerId = useScanStore((state) => state.providerId);

  // Smooth count-up animation for the score
  useEffect(() => {
    let start = 0;
    const end = score;
    if (start === end) {
      setDisplayScore(end);
      return;
    }

    const duration = 800; // ms
    const stepTime = 16; // ~60fps
    const steps = duration / stepTime;
    const increment = (end - start) / steps;
    let current = start;
    let step = 0;

    const timer = setInterval(() => {
      current += increment;
      step++;
      
      if (step >= steps) {
        setDisplayScore(end);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  // Rating badge color mapping for Swiss Brutalist theme
  const getRatingBadge = (rate: string) => {
    let badgeColors = 'bg-brutalist-blue text-white';
    if (rate === 'Critical') {
      badgeColors = 'bg-brutalist-red text-white';
    } else if (rate === 'High') {
      badgeColors = 'bg-brutalist-red text-white';
    } else if (rate === 'Medium') {
      badgeColors = 'bg-brutalist-amber text-black';
    } else if (rate === 'Low') {
      badgeColors = 'bg-brutalist-lime text-black';
    }

    return (
      <span className={`inline-block border border-black px-2 py-0.5 font-bold uppercase tracking-wider text-[10px] ${badgeColors}`}>
        {rate}
      </span>
    );
  };

  const riskFactors = [
    { label: 'Prompt Content Sensitivity', value: breakdown.promptSensitivity, max: 35 },
    { label: 'Geopolitical Endpoint Exposure', value: breakdown.foreignExposure, max: 15 },
    { label: 'Subprocessor Chain Risks', value: breakdown.subprocessorVisibility, max: 15 },
    { label: 'Data Residency Ambiguity', value: breakdown.dataResidencyAmbiguity, max: 10 },
    { label: 'Model Training Exposure', value: breakdown.trainingAmbiguity, max: 10 },
    { label: 'Human Auditing / Review Risk', value: breakdown.humanReviewRisk, max: 5 },
    { label: 'PII Exposure Surcharge', value: breakdown.redactionPenalty, max: 10 },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Visual Flat Score Section */}
      <div className="border border-black bg-white p-5 shadow-[4px_4px_0px_#050505] flex flex-col gap-4">
        <div className="flex items-baseline justify-between border-b border-black pb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-brutalist-muted uppercase tracking-wider">
              Calculated Threat Vector
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-6xl font-black font-display tracking-tight text-brutalist-text">
                {displayScore.toString().padStart(3, '0')}
              </span>
              <span className="text-xl font-mono text-brutalist-muted font-bold">/100</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold text-brutalist-muted uppercase tracking-wider">
              Classification
            </span>
            {getRatingBadge(rating)}
          </div>
        </div>
        
        {/* Main Flat Progress Gauge */}
        <div className="w-full">
          <div className="h-4 bg-[#EBE9E2] border border-black overflow-hidden relative">
            <div
              className={`h-full transition-all duration-800 ${
                rating === 'Critical' || rating === 'High' ? 'bg-brutalist-red' :
                rating === 'Medium' ? 'bg-brutalist-amber' : 'bg-brutalist-lime'
              }`}
              style={{ width: `${displayScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Breakdown Data table list */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-black pb-2">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-brutalist-text">
            Risk Contribution Breakdown
          </h4>
          <span className="text-[10px] font-mono text-brutalist-muted">WEIGHT_PCT</span>
        </div>

        <div className="flex flex-col gap-3.5">
          {riskFactors.map((f, idx) => {
            const pct = f.max > 0 ? (f.value / f.max) * 100 : 0;
            let barColor = 'bg-brutalist-blue';
            if (pct > 75) {
              barColor = 'bg-brutalist-red';
            } else if (pct > 50) {
              barColor = 'bg-brutalist-red';
            } else if (pct > 25) {
              barColor = 'bg-brutalist-amber';
            }

            return (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono font-medium">
                  <span className="text-brutalist-text uppercase">{f.label}</span>
                  <span className="text-brutalist-text font-bold">
                    +{f.value} <span className="text-brutalist-muted font-normal">/ {f.max}</span>
                  </span>
                </div>
                {/* Visual Flat Bar gauge */}
                <div className="w-full h-2.5 bg-[#EBE9E2] border border-black overflow-hidden">
                  <div
                    className={`h-full ${barColor} transition-all duration-1000`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resolved Evidence Claims Section */}
      <div className="flex flex-col gap-4 border-t border-black pt-5 mt-2">
        <div className="flex items-center justify-between border-b border-black pb-2 select-none">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-black">
            Resolved Evidence Claims
          </h4>
          <span className="text-[10px] font-mono text-[#77776F]">VERIFIED_INDEX</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {(() => {
            const getProviderClaims = (pId: string) => {
              switch (pId) {
                case 'gemini':
                  return [
                    { claim: "User Origin: India", id: "LM-001" },
                    { claim: "Prompt sent to Gemini endpoint", id: "LM-002" },
                    { claim: "Gemini unpaid services warning", id: "LM-003" },
                    { claim: "Exact internal processing route unknown", id: "LM-008" }
                  ];
                case 'openai':
                  return [
                    { claim: "User Origin: India", id: "LM-001" },
                    { claim: "OpenAI data residency controls", id: "LM-004" },
                    { claim: "OpenAI uses subprocessors under DPA", id: "LM-005" },
                    { claim: "Exact internal processing route unknown", id: "LM-008" }
                  ];
                case 'claude':
                  return [
                    { claim: "User Origin: India", id: "LM-001" },
                    { claim: "Claude API default data retention", id: "LM-006" },
                    { claim: "Anthropic trust center subprocessors", id: "LM-007" },
                    { claim: "Exact internal processing route unknown", id: "LM-008" }
                  ];
                case 'local':
                default:
                  return [
                    { claim: "User Origin: India", id: "LM-001" },
                    { claim: "Local Sovereign Route localhost", id: "ROUTE-LOCAL-SOVEREIGN" }
                  ];
              }
            };

            const claims = getProviderClaims(providerId);

            return claims.map((c, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between bg-white border border-black p-2.5 shadow-[2px_2px_0px_#050505] text-[10.5px] font-mono font-semibold hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#050505] transition-all"
              >
                <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                  <span className="w-1.5 h-1.5 bg-[#3B00FF] rounded-full inline-block shrink-0" />
                  <span className="text-black uppercase truncate">{c.claim}</span>
                </div>
                <Link
                  href={`/evidence?claim=${c.id}`}
                  className="text-[#3B00FF] font-black uppercase text-[9px] hover:underline"
                >
                  View Evidence →
                </Link>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}

