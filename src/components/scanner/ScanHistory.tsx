'use client';

import React, { useEffect } from 'react';
import { useScanStore, ScanResult } from '../../store/useScanStore';
import { providerProfiles } from '../../lib/providerProfiles';
import Link from 'next/link';

export default function ScanHistory() {
  const { history, loadHistory, activeResult, deleteScan, clearHistory } = useScanStore();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSelectScan = (scan: ScanResult) => {
    useScanStore.setState({ activeResult: scan, prompt: scan.originalPrompt, providerId: scan.providerId, isRedacted: scan.isRedacted });
  };

  const getSensitivityBadge = (level: string) => {
    let colors = 'bg-brutalist-lime text-black';
    if (level === 'Critical' || level === 'Sensitive') {
      colors = 'bg-brutalist-red text-white';
    } else if (level === 'Confidential') {
      colors = 'bg-brutalist-amber text-black';
    } else if (level === 'Personal') {
      colors = 'bg-brutalist-blue text-white';
    }

    return (
      <span className={`border border-black px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${colors}`}>
        {level}
      </span>
    );
  };

  const getRiskBadge = (score: number) => {
    let colors = 'border border-black bg-white text-black';
    if (score > 75) {
      colors = 'border border-black bg-brutalist-red text-white';
    } else if (score > 50) {
      colors = 'border border-black bg-brutalist-amber text-black';
    } else if (score > 25) {
      colors = 'border border-black bg-brutalist-blue text-white';
    }

    return (
      <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold ${colors}`}>
        {score.toString().padStart(3, '0')}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between border-b border-black pb-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-brutalist-muted uppercase tracking-wider">
            Sovereign Ledger
          </span>
          <h3 className="text-xl font-black font-display text-brutalist-text tracking-tight uppercase">
            Audit Registry
          </h3>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="border border-black px-2.5 py-1 text-[10px] font-mono font-bold hover:bg-brutalist-red hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
          >
            Purge Registry
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="w-full bg-white border-2 border-black rounded-none p-8 text-center select-none text-brutalist-muted flex flex-col items-center justify-center min-h-[160px] shadow-[4px_4px_0px_#050505]">
          <span className="text-xs font-mono font-bold tracking-widest text-brutalist-text uppercase">
            [ Audit Trail Empty ]
          </span>
          <p className="text-[10px] text-brutalist-muted mt-2 font-mono max-w-[280px]">
            Run prompt traces above to populate local storage historical records.
          </p>
        </div>
      ) : (
        <div className="border border-black bg-white overflow-hidden shadow-[4px_4px_0px_#050505]">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#F4F2EC] border-b border-black text-[10px] text-brutalist-text font-bold">
                <th className="p-2.5 w-6"></th>
                <th className="p-2.5">AI PROVIDER</th>
                <th className="p-2.5 hidden sm:table-cell">PROMPT SAMPLE</th>
                <th className="p-2.5">SENSITIVITY</th>
                <th className="p-2.5">RISK</th>
                <th className="p-2.5 text-right w-16">TIME</th>
                <th className="p-2.5 text-center w-12">PASS</th>
                <th className="p-2.5 text-center w-8"></th>
              </tr>
            </thead>
            <tbody>
              {history.map((scan) => {
                const profile = providerProfiles[scan.providerId];
                const isSelected = activeResult?.id === scan.id;
                const score = scan.isRedacted ? scan.redactedRisk.score : scan.originalRisk.score;
                const timeStr = new Date(scan.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                });

                return (
                  <tr
                    key={scan.id}
                    onClick={() => handleSelectScan(scan)}
                    className={`border-b border-black last:border-0 cursor-pointer select-none transition-colors ${
                      isSelected 
                        ? 'bg-[#EBE9E2] font-semibold' 
                        : 'hover:bg-[#F4F2EC]'
                    }`}
                  >
                    <td className="p-2.5 text-center">
                      {isSelected ? (
                        <span className="inline-block w-2.5 h-2.5 bg-brutalist-blue" />
                      ) : (
                        <span className="inline-block w-2.5 h-2.5 bg-transparent" />
                      )}
                    </td>
                    <td className="p-2.5 font-bold uppercase tracking-tight text-brutalist-text">
                      {profile?.providerName || 'Unknown AI'}
                    </td>
                    <td className="p-2.5 text-[#55554F] hidden sm:table-cell max-w-[150px] truncate">
                      {scan.originalPrompt}
                    </td>
                    <td className="p-2.5">
                      {getSensitivityBadge(scan.sensitivityLevel)}
                    </td>
                    <td className="p-2.5">
                      {getRiskBadge(score)}
                    </td>
                    <td className="p-2.5 text-right text-[#55554F] font-bold">
                      {timeStr}
                    </td>
                    <td className="p-2.5 text-center">
                      <Link
                        href={`/report/${scan.id}`}
                        className="text-[#3B00FF] font-black uppercase hover:underline text-[9px]"
                        title="View Passport"
                        onClick={(e) => e.stopPropagation()}
                      >
                        VIEW
                      </Link>
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteScan(scan.id);
                        }}
                        className="text-brutalist-red hover:bg-black hover:text-white px-1 py-0.5 text-[10px] font-bold border border-transparent hover:border-black cursor-pointer"
                        title="Delete record"
                      >
                        [X]
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

