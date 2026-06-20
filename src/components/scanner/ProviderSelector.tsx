'use client';

import React, { useState } from 'react';
import { useScanStore } from '../../store/useScanStore';
import { providerProfiles } from '../../lib/providerProfiles';
import { Shield, Key, Cpu, AlertTriangle, ArrowUpRight } from 'lucide-react';

export default function ProviderSelector() {
  const { 
    providerId, 
    setProviderId, 
    geminiApiKey, 
    setGeminiApiKey, 
    openaiApiKey, 
    setOpenaiApiKey 
  } = useScanStore();

  const [showKeyModal, setShowKeyModal] = useState<string | null>(null);
  const [tempKey, setTempKey] = useState('');

  const localHasKey = typeof window !== 'undefined' && !!(localStorage.getItem('local_ai_api_key') || process.env.NEXT_PUBLIC_LOCAL_AI_API_KEY);
  const localProvider = process.env.NEXT_PUBLIC_LOCAL_AI_PROVIDER || 'ollama';
  const localSimulated = process.env.NEXT_PUBLIC_LOCAL_AI_SIMULATED === 'true' || localProvider === 'demo';
  const localEndpoint = localSimulated ? 'Loopback (Simulated)' : (process.env.NEXT_PUBLIC_OLLAMA_BASE_URL || 'http://127.0.0.1:11434');
  const localModel = localSimulated ? 'Llama-3-8B-Instruct' : (process.env.NEXT_PUBLIC_OLLAMA_MODEL || 'llama3.2:3b');
  const localModeName = localSimulated ? 'Simulated local route' : 'Localhost inference';

  const handleOpenKeys = (id: string) => {
    setShowKeyModal(id);
    if (id === 'gemini') {
      setTempKey(geminiApiKey);
    } else if (id === 'openai') {
      setTempKey(openaiApiKey);
    } else {
      setTempKey('');
    }
  };

  const handleSaveKey = () => {
    if (showKeyModal === 'gemini') {
      setGeminiApiKey(tempKey);
    } else if (showKeyModal === 'openai') {
      setOpenaiApiKey(tempKey);
    }
    setShowKeyModal(null);
  };

  const providers = [
    {
      id: 'gemini',
      icon: Shield,
      modeText: 'Live / Demo',
      desc: 'Connects directly to Gemini API. Falls back to security demonstration mode if key is missing.',
      hasKey: !!geminiApiKey,
    },
    {
      id: 'openai',
      icon: Key,
      modeText: 'Evidence Mode',
      desc: 'Inspects OpenAI subprocessors, data residency, and cloud routes. Live API key is optional.',
      hasKey: !!openaiApiKey,
    },
    {
      id: 'claude',
      icon: Cpu,
      modeText: 'Evidence Only',
      desc: 'AWS infrastructure audits. Live API is deactivated: paid enterprise credentials required.',
      hasKey: false,
    },
    {
      id: 'local',
      icon: Shield,
      modeText: localHasKey ? 'External Gate' : 'Sovereign Local',
      desc: 'No external API key required. Routes prompt to localhost via Ollama. Foreign provider exposure: 0. Best for sensitive prompts.',
      hasKey: localHasKey,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[#050505] pb-2 select-none">
        <h3 className="text-[14px] font-[800] text-[#050505] uppercase tracking-[0.04em]">
          TARGET AI INFRASTRUCTURE SELECTION
        </h3>
        <span className="text-[11px] text-[#55554F] font-mono font-bold uppercase tracking-wider">
          CONFIDENCE MAPPING ENABLED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] items-stretch">
        {providers.map((p) => {
          const profile = providerProfiles[p.id];
          const isSelected = providerId === p.id;
          const displayTitle = (p.id === 'local' && localHasKey) ? 'External Provider Mode' : profile.providerName;

          return (
            <div
              key={p.id}
              className={`relative flex flex-col justify-between p-6 min-h-[220px] h-full w-full border-[1.5px] transition-all duration-200 select-none cursor-pointer rounded-none bg-[#F8F7F2] ${
                isSelected 
                  ? 'border-2 border-[#050505] shadow-[6px_6px_0px_#050505] -translate-y-[3px]' 
                  : 'border-[#B9B7AE] hover:border-[#050505] hover:shadow-[4px_4px_0px_#111111] hover:-translate-y-[3px]'
              }`}
              onClick={() => setProviderId(p.id)}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[15px] font-[900] text-[#050505] uppercase tracking-[0.04em] leading-[1.35]">
                    {displayTitle}
                  </p>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSelected && (
                      <span className="w-2.5 h-2.5 bg-[#3B00FF] inline-block rounded-full" />
                    )}
                    <span className="text-[10px] font-[800] border border-[#050505] px-[10px] py-[6px] rounded-none bg-transparent text-[#050505] uppercase tracking-wider">
                      {p.modeText}
                    </span>
                  </div>
                </div>
                
                <p className="text-[13px] text-[#4B4B45] leading-[1.65] font-mono mt-3">
                  {p.desc}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-[14px] border-t border-[#D8D6CE] text-[11px] font-mono w-full min-w-0">
                {/* Connection detail badge */}
                <div className="flex items-center gap-1.5 text-[#3A3A36] min-w-0 flex-1 mr-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3B00FF] inline-block shrink-0" />
                  <span className="truncate font-semibold text-[10px] uppercase" title={profile.endpointDomains[0]}>
                    {profile.endpointDomains[0]}
                  </span>
                </div>

                {/* API Key Configure Button */}
                {profile.liveSupported && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenKeys(p.id);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 border border-[#050505] font-bold uppercase tracking-wider transition-all duration-150 rounded-none bg-transparent text-[#050505] hover:bg-[#050505] hover:text-[#F8F7F2] cursor-pointer shrink-0"
                  >
                    <Key size={10} className="shrink-0" />
                    <span className="text-[10px]">{p.hasKey ? 'active' : 'config'}</span>
                    <ArrowUpRight size={10} className="shrink-0 ml-0.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* API Key Modal Dialog Overlay */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-[#050505]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-brutalist-bg border-2 border-brutalist-text rounded-none p-6 flex flex-col gap-4 shadow-[8px_8px_0px_#050505]">
            
            {showKeyModal === 'local' ? (
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-sm font-bold text-brutalist-text uppercase tracking-wider flex items-center gap-2">
                    <Cpu size={14} className="text-[#00B873]" />
                    Local Sovereign Configuration
                  </h4>
                  <p className="text-xs text-brutalist-muted mt-1 leading-relaxed font-mono font-medium">
                    Telemetry is routed internally to your machine's hardware loops.
                  </p>
                </div>

                <div className="flex flex-col gap-2 font-mono text-xs text-brutalist-text">
                  <div className="grid grid-cols-3 border-b border-black/10 py-1.5">
                    <span className="font-extrabold text-[#77776F]">Provider:</span>
                    <span className="col-span-2 font-bold">{localSimulated ? 'Simulated Local Mode' : (localProvider.charAt(0).toUpperCase() + localProvider.slice(1))}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-black/10 py-1.5">
                    <span className="font-extrabold text-[#77776F]">Endpoint:</span>
                    <span className="col-span-2 font-bold break-all">{localEndpoint}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-black/10 py-1.5">
                    <span className="font-extrabold text-[#77776F]">Model:</span>
                    <span className="col-span-2 font-bold">{localModel}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-black/10 py-1.5">
                    <span className="font-extrabold text-[#77776F]">API Key:</span>
                    <span className="col-span-2 text-[#00B873] font-bold">Not required</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-black/10 py-1.5">
                    <span className="font-extrabold text-[#77776F]">Mode:</span>
                    <span className="col-span-2 font-bold">{localModeName}</span>
                  </div>
                </div>

                <div className="p-3 border border-brutalist-amber bg-white text-brutalist-amber text-[10px] leading-relaxed font-mono">
                  <AlertTriangle size={14} className="shrink-0 float-left mr-2 mt-0.5 text-brutalist-amber" />
                  <p className="uppercase font-bold">Important Warning:</p>
                  <p>Do NOT set local keys to external provider keys. If an external API key is used, it operates in **External Provider Mode**, not **Local Sovereign Mode**.</p>
                </div>

                <div className="flex items-center justify-end gap-3 mt-2 font-mono">
                  <button
                    onClick={() => setShowKeyModal(null)}
                    className="brutalist-button text-xs py-1.5 px-4 cursor-pointer"
                  >
                    Close Settings
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h4 className="text-sm font-bold text-brutalist-text uppercase tracking-wider flex items-center gap-2">
                    <Key size={14} className="text-brutalist-blue" />
                    Configure {showKeyModal === 'gemini' ? 'Google Gemini' : 'OpenAI'} API Key
                  </h4>
                  <p className="text-xs text-brutalist-muted mt-1 leading-relaxed font-mono font-medium">
                    Your key is stored locally in your browser memory and only transmitted directly to the model gateway endpoints.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-mono text-brutalist-text font-bold uppercase tracking-widest">
                    API Auth Token
                  </label>
                  <input
                    type="password"
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder={showKeyModal === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                    className="w-full font-mono text-xs bg-white border-2 border-brutalist-text rounded-none px-3 py-2 text-brutalist-text focus:outline-none focus:ring-1 focus:ring-brutalist-blue"
                  />
                </div>

                {!tempKey && (
                  <div className="flex gap-2.5 items-start p-3 rounded-none border border-brutalist-amber bg-white text-brutalist-amber text-[10px] leading-relaxed font-mono">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5 text-brutalist-amber" />
                    <p>
                      {showKeyModal === 'gemini' 
                        ? 'No custom key provided. LeakMap will operate in **Demo Mode**, displaying mock responses and pre-computed telemetry routes.'
                        : 'No custom key provided. LeakMap will operate in **Evidence Mode**, displaying cached telemetry and regional network boundaries.'}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 mt-2 font-mono">
                  <button
                    onClick={() => setShowKeyModal(null)}
                    className="px-3 py-1.5 text-xs text-brutalist-muted hover:text-brutalist-text font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveKey}
                    className="brutalist-button text-xs py-1.5 px-4 cursor-pointer"
                  >
                    Apply Token
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
