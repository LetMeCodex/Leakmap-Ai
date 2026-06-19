'use client';

import React from 'react';
import { providerProfiles } from '../../lib/providerProfiles';
import { Shield, Info } from 'lucide-react';

export default function ProviderComparisonTable() {
  const providers = [
    {
      id: 'gemini',
      profile: providerProfiles.gemini,
      training: 'Excluded (Vertex API) / Opt-out (Public UI)',
      retention: 'None (Vertex API) / Configurable',
      humanReview: 'No (Vertex) / Yes (Public AI free)',
      host: 'Google Cloud Platform (GCP)',
      complianceScore: '7.25 / 10',
      seal: 'SOC2, HIPAA',
    },
    {
      id: 'openai',
      profile: providerProfiles.openai,
      training: 'Excluded (API) / Opt-out (ChatGPT)',
      retention: '30 days (Abuse monitoring archive)',
      humanReview: 'Yes (Standard abuse flagging)',
      host: 'Microsoft Azure (US Cloud)',
      complianceScore: '6.50 / 10',
      seal: 'SOC2, ISO 27001',
    },
    {
      id: 'claude',
      profile: providerProfiles.claude,
      training: 'Excluded by default (All APIs)',
      retention: '28 days (Max default deletion window)',
      humanReview: 'No (Standard trust policies)',
      host: 'Amazon Web Services (AWS VPC)',
      complianceScore: '7.75 / 10',
      seal: 'SOC2 Type II, HIPAA',
    },
    {
      id: 'local',
      profile: providerProfiles.local,
      training: 'Fully Excluded (Localized compute)',
      retention: '0 days (Transient memory execution)',
      humanReview: 'No (Compute fully self-hosted)',
      host: 'Internal Local Hardware',
      complianceScore: '10.00 / 10',
      seal: 'Absolute Sovereignty',
    },
  ];

  // Color logic for scores
  // 0–4 red (#EF2B2B), 5–6 amber (#DFA100), 7–8 cyan/blue (#00AEEF), 9–10 green (#00B873)
  const getScoreStyle = (score: number) => {
    if (score <= 4) return 'text-[#EF2B2B]';
    if (score <= 6) return 'text-[#DFA100]';
    if (score <= 8) return 'text-[#00AEEF]';
    return 'text-[#00B873]';
  };

  const getComplianceScoreStyle = (scoreStr: string) => {
    const val = parseFloat(scoreStr);
    if (isNaN(val)) return 'text-[#00AEEF]';
    if (val <= 4) return 'text-[#EF2B2B]';
    if (val <= 6) return 'text-[#DFA100]';
    if (val <= 8) return 'text-[#00AEEF]';
    return 'text-[#00B873]';
  };

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* Title section with improved visual hierarchy */}
      <div className="flex flex-col gap-1 text-left">
        <h3 className="text-[17px] font-[900] text-[#050505] uppercase tracking-[0.04em] flex items-center gap-2">
          <Shield size={18} className="text-[#00AEEF] shrink-0" />
          GEOPOLITICAL AI SOVEREIGNTY AUDIT MATRIX
        </h3>
        <p className="text-[14px] text-[#55554F] mt-1 leading-[1.7] max-w-[850px]">
          Comparing data boundary constraints, subprocessor visibility indices, and regional routing policies.
        </p>
      </div>

      {/* The main table container - brutalist grid lines */}
      <div className="overflow-x-auto mt-[42px] bg-transparent border-t-[1.5px] border-b-[1.5px] border-[#111111]">
        <table className="w-full text-left border-collapse select-none">
          <thead>
            <tr className="border-b border-[#B9B7AE] text-[#050505] uppercase tracking-[0.08em] text-[11px] font-[900]">
              <th className="pb-[18px] pt-3 px-4 w-[180px] text-left text-[#050505] font-[900]">COMPLIANCE INDEX</th>
              {providers.map(p => (
                <th key={p.id} className="pb-[18px] pt-3 px-4 border-l border-[#B9B7AE] text-center min-w-[130px] font-[900] text-[#050505]">
                  {p.profile.providerName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[#3A3A36]">
            {/* Row 1 */}
            <tr className="border-b border-[#DDDAD1] hover:bg-[rgba(5,5,5,0.025)] transition-colors group">
              <td className="py-6 px-4 w-[180px] text-left text-[13px] font-bold text-[#3A3A36] leading-[1.4] transition-colors group-hover:text-[#050505]">
                Data Residency Clarity
              </td>
              {providers.map(p => (
                <td key={p.id} className="py-6 px-4 border-l border-[#DDDAD1] text-center">
                  <span className={`text-[14px] font-black font-mono transition-transform duration-200 group-hover:scale-[1.02] inline-block ${getScoreStyle(p.profile.dataResidencyClarity)}`}>
                    {p.profile.dataResidencyClarity} / 10
                  </span>
                </td>
              ))}
            </tr>
            {/* Row 2 */}
            <tr className="border-b border-[#DDDAD1] hover:bg-[rgba(5,5,5,0.025)] transition-colors group">
              <td className="py-6 px-4 w-[180px] text-left text-[13px] font-bold text-[#3A3A36] leading-[1.4] transition-colors group-hover:text-[#050505]">
                Subprocessor Transparency
              </td>
              {providers.map(p => (
                <td key={p.id} className="py-6 px-4 border-l border-[#DDDAD1] text-center">
                  <span className={`text-[14px] font-black font-mono transition-transform duration-200 group-hover:scale-[1.02] inline-block ${getScoreStyle(p.profile.subprocessorTransparency)}`}>
                    {p.profile.subprocessorTransparency} / 10
                  </span>
                </td>
              ))}
            </tr>
            {/* Row 3 */}
            <tr className="border-b border-[#DDDAD1] hover:bg-[rgba(5,5,5,0.025)] transition-colors group">
              <td className="py-6 px-4 w-[180px] text-left text-[13px] font-bold text-[#3A3A36] leading-[1.4] transition-colors group-hover:text-[#050505]">
                Model Training Protection
              </td>
              {providers.map(p => (
                <td key={p.id} className="py-6 px-4 border-l border-[#DDDAD1] text-center font-mono text-[12px] text-[#4B4B45] leading-[1.5]">
                  <div className="max-w-[160px] mx-auto text-center font-semibold">
                    {p.training}
                  </div>
                </td>
              ))}
            </tr>
            {/* Row 4 */}
            <tr className="border-b border-[#DDDAD1] hover:bg-[rgba(5,5,5,0.025)] transition-colors group">
              <td className="py-6 px-4 w-[180px] text-left text-[13px] font-bold text-[#3A3A36] leading-[1.4] transition-colors group-hover:text-[#050505]">
                Standard Retention Log
              </td>
              {providers.map(p => (
                <td key={p.id} className="py-6 px-4 border-l border-[#DDDAD1] text-center font-mono text-[12px] text-[#4B4B45] leading-[1.5]">
                  <div className="max-w-[160px] mx-auto text-center font-semibold">
                    {p.retention}
                  </div>
                </td>
              ))}
            </tr>
            {/* Row 5 */}
            <tr className="border-b border-[#DDDAD1] hover:bg-[rgba(5,5,5,0.025)] transition-colors group">
              <td className="py-6 px-4 w-[180px] text-left text-[13px] font-bold text-[#3A3A36] leading-[1.4] transition-colors group-hover:text-[#050505]">
                Human Audit
              </td>
              {providers.map(p => (
                <td key={p.id} className="py-6 px-4 border-l border-[#DDDAD1] text-center font-mono text-[12px] text-[#4B4B45] leading-[1.5]">
                  <div className="max-w-[160px] mx-auto text-center font-semibold">
                    {p.humanReview}
                  </div>
                </td>
              ))}
            </tr>
            {/* Row 6 */}
            <tr className="border-b border-[#DDDAD1] hover:bg-[rgba(5,5,5,0.025)] transition-colors group">
              <td className="py-6 px-4 w-[180px] text-left text-[13px] font-bold text-[#3A3A36] leading-[1.4] transition-colors group-hover:text-[#050505]">
                Infrastructure Tenancy
              </td>
              {providers.map(p => (
                <td key={p.id} className="py-6 px-4 border-l border-[#DDDAD1] text-center font-mono text-[12px] text-[#4B4B45] leading-[1.5] font-semibold">
                  <div className="max-w-[160px] mx-auto text-center">
                    {p.host}
                  </div>
                </td>
              ))}
            </tr>
            {/* Row 7 */}
            <tr className="border-b border-[#DDDAD1] hover:bg-[rgba(5,5,5,0.025)] transition-colors group">
              <td className="py-6 px-4 w-[180px] text-left text-[13px] font-bold text-[#3A3A36] leading-[1.4] transition-colors group-hover:text-[#050505]">
                Compliance Certification
              </td>
              {providers.map(p => (
                <td key={p.id} className="py-6 px-4 border-l border-[#DDDAD1] text-center font-mono text-[12px] text-[#4B4B45] leading-[1.5]">
                  <div className="max-w-[160px] mx-auto text-center">
                    <span className="border border-black px-2.5 py-1 rounded-none bg-[#F4F2EC] text-[#050505] font-bold uppercase tracking-wider text-[10px]">
                      {p.seal}
                    </span>
                  </div>
                </td>
              ))}
            </tr>
            {/* Row 8 (Unified Score) */}
            <tr className="bg-[#BDEAF4]/20 hover:bg-[#BDEAF4]/30 transition-colors group font-bold">
              <td className="py-6 px-4 w-[180px] text-left text-[13px] font-black text-[#050505] leading-[1.4]">
                Unified Compliance Score
              </td>
              {providers.map(p => (
                <td key={p.id} className="py-6 px-4 border-l border-[#DDDAD1] text-center">
                  <span className={`text-[14px] font-black font-mono transition-transform duration-200 group-hover:scale-[1.02] inline-block ${getComplianceScoreStyle(p.complianceScore)}`}>
                    {p.complianceScore}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Info notice block */}
      <div className="flex gap-2.5 items-start border border-[#B9B7AE] p-4 rounded-none text-[11px] leading-relaxed text-[#77776F] bg-brutalist-panel">
        <Info size={16} className="shrink-0 mt-0.5 text-[#050505]" />
        <p className="uppercase font-semibold">
          Score criteria calculations: Weighted average of data residency clarity (25%), subprocessor transparency (25%), model training exclusions (30%), and standard security seals (20%). Evaluations are based on public provider disclosures as of June 2026.
        </p>
      </div>
    </div>
  );
}
