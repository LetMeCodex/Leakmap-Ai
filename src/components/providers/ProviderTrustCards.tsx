'use client';

import React from 'react';
import { useScanStore } from '../../store/useScanStore';
import { ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface TrustCard {
  id: string;
  name: string;
  liveAvailable: string;
  freeCaution: string;
  visibility: 'HIGH' | 'MEDIUM' | 'LOW';
  subprocessors: 'HIGH' | 'MEDIUM' | 'LOW';
  residency: string;
  bestFor: string;
  avoidFor: string;
  claimLink: string;
  ratingColor: string;
}

const CARDS: TrustCard[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    liveAvailable: 'YES (FREE / DEV KEYS)',
    freeCaution: 'YES (HUMAN REVIEW ACTIVE ON UNPAID)',
    visibility: 'MEDIUM',
    subprocessors: 'MEDIUM',
    residency: 'DEPENDS ON VERTEX CONFIGURATION',
    bestFor: 'NON-SENSITIVE CONVERSATIONAL CHECKS',
    avoidFor: 'HEALTH DATA / GOV IDS / CONFIDENTIAL IP',
    claimLink: 'LM-003',
    ratingColor: 'text-[#DFA100]'
  },
  {
    id: 'openai',
    name: 'OpenAI API',
    liveAvailable: 'OPTIONAL (LIVE / EVIDENCE)',
    freeCaution: 'NO (API STORED 30 DAYS FOR ABUSE)',
    visibility: 'MEDIUM',
    subprocessors: 'HIGH',
    residency: 'PROJECT / ACCOUNT LEVEL RESIDENCY ONLY',
    bestFor: 'CONTROLLED DEVELOPER INTEGRATIONS',
    avoidFor: 'SENSITIVE DATA WITHOUT DPA OR REGION LOCKS',
    claimLink: 'LM-005',
    ratingColor: 'text-[#3B00FF]'
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    liveAvailable: 'PAID API CREDENTIALS REQUIRED',
    freeCaution: 'NO (COMMERCIAL TERMS EXCLUDE TRAINING)',
    visibility: 'HIGH',
    subprocessors: 'HIGH',
    residency: 'US-EAST (AWS CLUSTERS) DEFAULT',
    bestFor: 'STRUCTURED REASONING UNDER DPA AGREEMENTS',
    avoidFor: 'PRETENDING LIVE CONNECTS WITHOUT API KEY',
    claimLink: 'LM-006',
    ratingColor: 'text-[#3B00FF]'
  },
  {
    id: 'local',
    name: 'Local Sovereign Mode',
    liveAvailable: 'YES (LOCALHOST LOOPBACK)',
    freeCaution: 'NO (100% OFFLINE / PRIVATE)',
    visibility: 'HIGH',
    subprocessors: 'HIGH',
    residency: '100% LOCALHOST (IN-COUNTRY)',
    bestFor: 'CRITICAL HEALTH / PII / GOV IDENTIFIERS / SECRETS',
    avoidFor: 'RELIANCE ON HIGH-GPU MULTI-MODAL DOMAINS',
    claimLink: 'LM-008',
    ratingColor: 'text-[#00B873]'
  }
];

export default function ProviderTrustCards() {
  const { setProviderId } = useScanStore();

  return (
    <div className="flex flex-col gap-6 font-mono select-none">
      <div className="border-b border-black pb-2 select-none">
        <span className="text-[10px] font-bold text-[#77776F] uppercase tracking-wider">
          Compliance Catalog
        </span>
        <h3 className="text-xl font-black text-black uppercase tracking-tight">
          Provider Trust & Transparency Cards
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CARDS.map((card) => (
          <div 
            key={card.id}
            className="border-2 border-black bg-white p-5 flex flex-col justify-between gap-5 shadow-[4px_4px_0px_#050505] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#050505] transition-all"
          >
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-black pb-2">
                <span className="font-black text-black text-sm uppercase tracking-tight">{card.name}</span>
                <span className={`text-xs font-black ${card.ratingColor}`}>●</span>
              </div>

              <div className="flex flex-col gap-2 uppercase text-[9.5px] font-semibold text-black leading-relaxed">
                <div>
                  <span className="text-[#77776F] font-bold block text-[8px]">Live Sockets:</span>
                  {card.liveAvailable}
                </div>
                <div>
                  <span className="text-[#77776F] font-bold block text-[8px]">Free Tier Caution:</span>
                  {card.freeCaution}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1 border-t border-b border-black/5 py-1.5">
                  <div>
                    <span className="text-[#77776F] font-bold block text-[8px]">Evidence:</span>
                    {card.visibility}
                  </div>
                  <div>
                    <span className="text-[#77776F] font-bold block text-[8px]">Subprocessors:</span>
                    {card.subprocessors}
                  </div>
                </div>
                <div>
                  <span className="text-[#77776F] font-bold block text-[8px]">Data Residency:</span>
                  {card.residency}
                </div>
                <div className="mt-1 bg-green-50 p-2 border border-green-200 text-green-800">
                  <span className="text-green-950 font-bold block text-[8px]">Best For:</span>
                  {card.bestFor}
                </div>
                <div className="bg-red-50 p-2 border border-red-200 text-red-800">
                  <span className="text-red-950 font-bold block text-[8px]">Avoid For:</span>
                  {card.avoidFor}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-3 border-t border-black/10">
              <button
                onClick={() => setProviderId(card.id)}
                className="w-full py-1.5 bg-[#F4F2EC] hover:bg-black hover:text-white border border-black font-extrabold uppercase text-[9px] transition-all cursor-pointer text-center"
              >
                Select Provider
              </button>
              <Link
                href={`/evidence?claim=${card.claimLink}`}
                className="w-full py-1.5 bg-[#3B00FF] hover:bg-black text-white border border-black font-extrabold uppercase text-[9px] transition-all text-center flex items-center justify-center gap-1 shadow-[2px_2px_0px_#050505]"
              >
                View Evidence <ArrowRight size={10} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
