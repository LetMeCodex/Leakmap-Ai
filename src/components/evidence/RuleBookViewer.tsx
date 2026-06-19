'use client';

import React from 'react';
import { rules, Rule } from '../../lib/ruleBook';
import { ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface RuleBookProps {
  triggeredRuleIds?: string[];
}

export default function RuleBookViewer({ triggeredRuleIds = [] }: RuleBookProps) {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-[#EF2B2B] text-[#EF2B2B] bg-[#EF2B2B]/5';
      case 'high':
        return 'border-[#EF2B2B] text-[#EF2B2B] bg-[#EF2B2B]/5';
      case 'medium':
        return 'border-[#DFA100] text-[#DFA100] bg-[#DFA100]/5';
      case 'protective':
        return 'border-[#00B873] text-[#00B873] bg-[#00B873]/5';
      case 'safe':
        return 'border-[#00B873] text-[#00B873] bg-[#00B873]/5';
      case 'methodology':
      default:
        return 'border-[#77776F] text-[#77776F] bg-[#77776F]/5';
    }
  };

  const getLinkedClaim = (id: string) => {
    switch (id) {
      case 'R-101':
        return 'LM-003';
      case 'R-102':
        return 'LM-001';
      case 'R-103':
        return 'LM-001';
      case 'R-104':
        return 'LM-004';
      case 'R-105':
        return 'LM-002';
      case 'R-107':
        return 'LM-008';
      case 'R-108':
        return 'LM-001';
      case 'R-110':
        return 'LM-008';
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 font-mono select-none">
      <div className="flex items-end justify-between border-b border-black pb-3 select-none">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-[#77776F] uppercase tracking-wider">
            Governance Matrix
          </span>
          <h3 className="text-xl font-black text-black uppercase tracking-tight">
            Compliance Policy Rule Book
          </h3>
        </div>
        {triggeredRuleIds.length > 0 && (
          <span className="text-[9px] font-black bg-[#3B00FF] text-white px-2 py-0.5 border border-black shadow-[1.5px_1.5px_0px_#050505] uppercase">
            Active Triggers: {triggeredRuleIds.length}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => {
          const isTriggered = triggeredRuleIds.includes(rule.id);
          const linkedClaimId = getLinkedClaim(rule.id);

          return (
            <div 
              key={rule.id}
              className={`border-2 border-black p-4 bg-white flex flex-col justify-between gap-3 transition-all relative ${
                isTriggered 
                  ? 'border-[#3B00FF] shadow-[4px_4px_0px_#3B00FF] translate-x-[-1px] translate-y-[-1px]' 
                  : 'shadow-[2px_2px_0px_#050505]'
              }`}
            >
              {/* Trigger Indicator Stamp */}
              {isTriggered && (
                <div className="absolute top-2 right-2 flex items-center gap-1 text-[8px] font-black text-[#3B00FF] border border-[#3B00FF] bg-[#3B00FF]/5 px-2 py-0.5 uppercase tracking-wider animate-pulse">
                  <ShieldAlert size={10} /> TRIGGERED
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-black">{rule.id}</span>
                  <span className="text-xs font-black text-black uppercase">{rule.name}</span>
                </div>
                <span className={`text-[8.5px] font-black uppercase border px-2 py-0.5 self-start ${getSeverityStyles(rule.severity)}`}>
                  {rule.severity}
                </span>
                
                <p className="text-[10px] text-black font-semibold mt-2 uppercase leading-relaxed">
                  <span className="text-[#77776F] font-bold block mb-0.5 text-[8.5px]">Condition:</span>
                  {rule.condition}
                </p>
                <p className="text-[10px] text-black font-semibold uppercase leading-relaxed">
                  <span className="text-[#77776F] font-bold block mb-0.5 text-[8.5px]">Risk Effect:</span>
                  {rule.effect}
                </p>
              </div>

              <div className="border-t border-black/10 pt-3 flex flex-col gap-1.5 mt-1">
                <p className="text-[9px] text-[#77776F] leading-normal font-semibold normal-case">
                  {rule.explanation}
                </p>
                {linkedClaimId && (
                  <div className="flex justify-between items-center text-[9px] font-bold pt-1 border-t border-black/5 mt-1">
                    <span className="text-[#77776F]">Linked Claim: {linkedClaimId}</span>
                    <Link 
                      href={`/evidence?claim=${linkedClaimId}`} 
                      className="text-[#3B00FF] hover:underline"
                    >
                      View Claim →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
