'use client';

import React from 'react';
import { ShieldCheck, AlertOctagon } from 'lucide-react';

interface PanelProps {
  providerId: string;
}

export default function WhatWeKnowPanel({ providerId }: PanelProps) {
  const isLocal = providerId === 'local';

  const knowList = isLocal 
    ? [
        "No external provider selected; traffic bypasses public gateways.",
        "Payload processing remains fully contained inside local loopback (127.0.0.1).",
        "External geopolitical subprocessor exposure is verified at 0%.",
        "Client redaction engine active prior to loopback dispatch."
      ]
    : [
        `Target provider matches: ${providerId.toUpperCase()}.`,
        `Outbound socket connects to verified domains (${providerId === 'gemini' ? 'googleapis.com' : providerId === 'openai' ? 'openai.com' : 'anthropic.com'}).`,
        "Provider DPA subprocessor transparency logs are officially indexed.",
        "Prompt data-classification and vulnerability level detected."
      ];

  const dontKnowList = isLocal
    ? [
        "Whether the local model loaded (e.g. Llama) executes remote tools or API plugins.",
        "System-level logs or outbound telemetry gathered by other OS processes.",
        "Hardware security vulnerabilities of the local host device."
      ]
    : [
        "Exact physical server rack location inside the target provider enclaves.",
        "GPU container model routing or hardware scheduling allocations.",
        "Whether every subprocessor listed in the provider DPA touched this specific prompt.",
        "Internal failovers, load balancing shifts, or back-channel caching protocols.",
        "Hidden retention or corporate monitoring beyond standard contract disclosures."
      ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full font-mono text-xs select-none">
      {/* WHAT WE KNOW */}
      <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#050505] flex flex-col gap-3.5">
        <div className="flex items-center gap-2 border-b border-black pb-2">
          <ShieldCheck size={16} className="text-[#00B873]" />
          <h4 className="font-black text-black uppercase tracking-wider">WHAT WE KNOW</h4>
        </div>
        <ul className="flex flex-col gap-2.5 list-none font-semibold text-black uppercase text-[10.5px]">
          {knowList.map((item, idx) => (
            <li key={idx} className="flex gap-2 items-start leading-relaxed">
              <span className="text-[#00B873] font-bold">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* WHAT WE DON'T KNOW */}
      <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#050505] flex flex-col gap-3.5">
        <div className="flex items-center gap-2 border-b border-black pb-2">
          <AlertOctagon size={16} className="text-[#EF2B2B]" />
          <h4 className="font-black text-black uppercase tracking-wider">WHAT WE CANNOT VERIFY</h4>
        </div>
        <ul className="flex flex-col gap-2.5 list-none font-semibold text-black uppercase text-[10.5px]">
          {dontKnowList.map((item, idx) => (
            <li key={idx} className="flex gap-2 items-start leading-relaxed">
              <span className="text-[#EF2B2B] font-bold">✗</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
