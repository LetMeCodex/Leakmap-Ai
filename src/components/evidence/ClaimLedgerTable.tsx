'use client';

import React from 'react';
import { claimLedger, ClaimLedgerItem } from '../../lib/evidenceRegistry';
import Link from 'next/link';
import { Eye, ExternalLink } from 'lucide-react';

interface LedgerProps {
  highlightedClaimId?: string | null;
}

export default function ClaimLedgerTable({ highlightedClaimId }: LedgerProps) {
  const getBadgeStyles = (type: string) => {
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

  return (
    <div className="border border-black overflow-hidden shadow-[4px_4px_0px_#050505] bg-white font-mono select-none">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#F4F2EC] border-b border-black text-[#77776F] font-black uppercase text-[10px] select-none">
            <th className="p-3 w-20">CLAIM ID</th>
            <th className="p-3">UI CLAIM STATEMENT</th>
            <th className="p-3 w-32">EVIDENCE TYPE</th>
            <th className="p-3 w-20 text-center">CONF.</th>
            <th className="p-3">SOURCE REF</th>
            <th className="p-3 w-24 text-right">PACKET</th>
          </tr>
        </thead>
        <tbody>
          {claimLedger.map((claim) => {
            const isHighlighted = highlightedClaimId === claim.id;

            return (
              <tr 
                key={claim.id} 
                className={`border-b border-black last:border-0 transition-colors bg-white hover:bg-[#F8F7F2] font-semibold text-[11px] uppercase ${
                  isHighlighted ? 'bg-[#3B00FF]/5 outline outline-2 outline-[#3B00FF]' : ''
                }`}
              >
                <td className="p-3 text-[#77776F] font-extrabold">{claim.id}</td>
                <td className="p-3 text-black font-extrabold tracking-tight truncate max-w-[200px]" title={claim.uiClaim}>
                  {claim.uiClaim}
                </td>
                <td className="p-3">
                  <span className={`px-2.5 py-0.5 text-[8.5px] font-black ${getBadgeStyles(claim.evidenceType)}`}>
                    {claim.evidenceType}
                  </span>
                </td>
                <td className="p-3 text-center text-[#3B00FF] font-black">{claim.confidenceScore}%</td>
                <td className="p-3 text-[#77776F] lowercase tracking-wide truncate max-w-[120px]" title={claim.sourceIds.join(', ')}>
                  {claim.sourceIds.join(', ')}
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/evidence/${claim.id}`}
                    className="inline-flex items-center gap-1 border border-black bg-white hover:bg-black hover:text-white px-2 py-1 text-[9px] font-black shadow-[1.5px_1.5px_0px_#050505] transition-all"
                  >
                    <Eye size={10} /> VIEW
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
