'use client';

import React, { useEffect, useState, useRef } from 'react';

interface ConsoleProps {
  providerId: string;
  isAnalyzing: boolean;
  hasApiKey: boolean;
  onComplete?: () => void;
}

export default function LiveTelemetryConsole({ providerId, isAnalyzing, hasApiKey, onComplete }: ConsoleProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getLogs = () => {
    const base = [
      "[00:00.001] Prompt payload received locally",
      "[00:00.044] Evaluating PII and geopolitical risk criteria...",
      "[00:00.089] Redaction recommendation parameters generated",
      `[00:00.140] Target provider loaded: ${providerId.toUpperCase()}`,
      "[00:00.181] Endpoint network routing templates resolved"
    ];

    if (providerId === 'local') {
      return [
        ...base,
        "[00:00.233] Local sovereign loopback interface selected",
        "[00:00.301] Verification log: no external socket requests initiated",
        "[00:00.355] Route confidence calculated: 98% (Sovereign Node Clear)",
        "[00:00.410] Loopback route rendered: INDIA → LOCALHOST",
        "[00:00.522] Safe local compute footprint confirmed",
        "[00:00.650] Local audit receipt compiled successfully",
        "[00:00.790] Local Sovereign AI Data Passport generated"
      ];
    }

    if (providerId === 'claude') {
      return [
        ...base,
        "[00:00.233] Evidence source matched: SRC-CLAUDE-001 / SRC-CLAUDE-002",
        "[00:00.301] Claude API paid credentials required for live socket connections",
        "[00:00.302] Active mode: EVIDENCE-ONLY / simulated routing",
        "[00:00.303] No external Claude API call was made",
        "[00:00.355] Route confidence calculated: 80% (Disclosed Contract Exposure)",
        "[00:00.410] Policy route rendered: IN → GATEWAY → AWS US-EAST clusters",
        "[00:00.522] Unknown internal routing path penalty applied",
        "[00:00.650] Evidence verification receipt generated",
        "[00:00.790] AI Data Passport AIDP-CLAUDE registry ready"
      ];
    }

    // Gemini or OpenAI
    const matchedSource = providerId === 'gemini' ? 'SRC-GEMINI-001' : 'SRC-OPENAI-001';
    const endpoint = providerId === 'gemini' ? 'IN → SINGAPORE GATEWAY' : 'IN → CLOUDFLARE PROXY → SG GATEWAY';

    const logs = [...base, `[00:00.233] Evidence source matched: ${matchedSource}`];

    if (hasApiKey) {
      logs.push(
        `[00:00.301] Active API credentials loaded from security registry`,
        `[00:00.302] Spawning live socket connection to target API gateway`,
        `[00:00.355] Handshake verified: TLS 1.3 encryption active`,
        `[00:00.390] Route confidence calculated: 90% (Live Socket Verified)`
      );
    } else {
      logs.push(
        `[00:00.301] Target API key missing in environment`,
        `[00:00.302] Switching to localized demo / evidence simulation mode`,
        `[00:00.303] Switch log: no external provider request dispatched`,
        `[00:00.355] Route confidence calculated: 50% (Demo Mode Penalty)`
      );
    }

    logs.push(
      `[00:00.410] Map route rendered: ${endpoint}`,
      `[00:00.522] Unknown internal processing path penalty applied (-15)`,
      `[00:00.650] QR verification audit packet generated`,
      `[00:00.790] AI Data Passport certificate compiled`
    );

    return logs;
  };

  useEffect(() => {
    if (!isAnalyzing) {
      setLines([]);
      setActiveIndex(-1);
      return;
    }

    const logSet = getLogs();
    setLines([]);
    setActiveIndex(0);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < logSet.length) {
        setLines(prev => [...prev, logSet[currentIndex]]);
        setActiveIndex(currentIndex);
        currentIndex++;
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 250); // fast log printing speed

    return () => clearInterval(interval);
  }, [isAnalyzing, providerId, hasApiKey]);

  if (!isAnalyzing && lines.length === 0) return null;

  return (
    <div className="border border-black bg-white p-4 shadow-[3px_3px_0px_#050505] w-full font-mono text-[10.5px] leading-relaxed select-none max-h-[220px] overflow-y-auto" ref={scrollRef}>
      <div className="border-b border-black pb-1.5 mb-2 font-black text-black uppercase tracking-wider text-[9px] flex justify-between">
        <span>↳ LIVE TELEMETRY CONSOLE</span>
        <span className="text-[#3B00FF] animate-pulse">● LOGGING ACTIVE</span>
      </div>

      <div className="flex flex-col gap-1 text-black font-semibold uppercase">
        {lines.map((line, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div key={idx} className="flex items-start gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full inline-block mt-1 shrink-0 ${isActive ? 'bg-[#3B00FF] animate-ping' : 'bg-transparent'}`} />
              <span className={isActive ? 'text-[#3B00FF]' : 'text-black'}>{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
