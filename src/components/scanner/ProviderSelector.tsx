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

  const handleOpenKeys = (id: string) => {
    setShowKeyModal(id);
    setTempKey(id === 'gemini' ? geminiApiKey : openaiApiKey);
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
      modeText: 'Sovereign Local',
      desc: 'Routes prompt to localhost. High privacy score. Simulated or Ollama loopback.',
      hasKey: false,
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
                    {profile.providerName}
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
          </div>
        </div>
      )}
    </div>
  );
}
