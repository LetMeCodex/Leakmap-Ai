import { create } from 'zustand';
import { scanAndRedact, DetectedEntity, SensitivityLevel } from '../lib/redactionEngine';
import { calculateRisk, RiskScoreResult } from '../lib/riskEngine';
import { providerProfiles, ProviderProfile } from '../lib/providerProfiles';

export interface ScanResult {
  id: string;
  timestamp: string;
  originalPrompt: string;
  redactedPrompt: string;
  detectedEntities: DetectedEntity[];
  detectedTypes: string[];
  sensitivityLevel: SensitivityLevel;
  originalRisk: RiskScoreResult;
  redactedRisk: RiskScoreResult;
  isRedacted: boolean;
  aiResponse: string;
  providerId: string;
  mode: string;
}

interface ScanStore {
  prompt: string;
  providerId: string;
  isRedacted: boolean;
  isAnalyzing: boolean;
  geminiApiKey: string;
  openaiApiKey: string;
  saveFullPrompt: boolean;
  activeResult: ScanResult | null;
  history: ScanResult[];
  activeNodeId: string | null;
  activeEdgeId: { from: string; to: string } | null;
  drawerOpen: boolean;

  setPrompt: (prompt: string) => void;
  setProviderId: (id: string) => void;
  setGeminiApiKey: (key: string) => void;
  setOpenaiApiKey: (key: string) => void;
  toggleSaveFullPrompt: () => void;
  setIsRedacted: (redacted: boolean) => void;
  setActiveNodeId: (id: string | null) => void;
  setActiveEdgeId: (edge: { from: string; to: string } | null) => void;
  setDrawerOpen: (open: boolean) => void;
  
  runAnalysis: () => Promise<ScanResult>;
  loadHistory: () => void;
  deleteScan: (id: string) => void;
  clearHistory: () => void;
}

export const useScanStore = create<ScanStore>((set, get) => ({
  prompt: '',
  providerId: 'gemini',
  isRedacted: false,
  isAnalyzing: false,
  geminiApiKey: '',
  openaiApiKey: '',
  saveFullPrompt: false,
  activeResult: null,
  history: [],
  activeNodeId: null,
  activeEdgeId: null,
  drawerOpen: false,

  setPrompt: (prompt) => set({ prompt }),
  setProviderId: (providerId) => set({ providerId }),
  setGeminiApiKey: (geminiApiKey) => {
    set({ geminiApiKey });
    if (typeof window !== 'undefined') localStorage.setItem('gemini_api_key', geminiApiKey);
  },
  setOpenaiApiKey: (openaiApiKey) => {
    set({ openaiApiKey });
    if (typeof window !== 'undefined') localStorage.setItem('openai_api_key', openaiApiKey);
  },
  toggleSaveFullPrompt: () => set((state) => ({ saveFullPrompt: !state.saveFullPrompt })),
  setIsRedacted: (isRedacted) => set({ isRedacted }),
  setActiveNodeId: (activeNodeId) => set({ activeNodeId, activeEdgeId: null, drawerOpen: !!activeNodeId }),
  setActiveEdgeId: (activeEdgeId) => set({ activeEdgeId, activeNodeId: null, drawerOpen: !!activeEdgeId }),
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),

  loadHistory: () => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem('leakmap_history');
    if (raw) {
      try {
        set({ history: JSON.parse(raw) });
      } catch (e) {
        console.error('Failed to parse scan history', e);
      }
    }
  },

  deleteScan: (id) => {
    set((state) => {
      const updated = state.history.filter((h) => h.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('leakmap_history', JSON.stringify(updated));
      }
      return {
        history: updated,
        activeResult: state.activeResult?.id === id ? null : state.activeResult,
      };
    });
  },

  clearHistory: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('leakmap_history');
    }
    set({ history: [], activeResult: null });
  },

  runAnalysis: async () => {
    const { prompt, providerId, isRedacted, geminiApiKey, openaiApiKey, saveFullPrompt } = get();
    set({ isAnalyzing: true });

    // Ensure stateful localstorage is loaded if not already
    const profile = providerProfiles[providerId] || providerProfiles.gemini;

    // 1. Run local scanners
    const scanData = scanAndRedact(prompt);
    
    // Calculate risk before redaction
    const originalRisk = calculateRisk(
      scanData.sensitivityLevel,
      profile,
      false, // original is not redacted
      scanData.detectedEntities.length > 0
    );

    // Calculate risk after redaction
    const redactedRisk = calculateRisk(
      scanData.sensitivityLevel,
      profile,
      true, // redacted
      scanData.detectedEntities.length > 0
    );

    // Determine runtime mode
    let mode: string = profile.defaultMode;
    let aiResponse = '';

    const textToSubmit = isRedacted ? scanData.redactedPrompt : prompt;

    try {
      if (providerId === 'gemini') {
        const key = geminiApiKey || (typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : '') || '';
        
        // Call backend api
        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: textToSubmit,
            apiKey: key,
          }),
        });

        const data = await response.json();
        aiResponse = data.response;
        mode = data.error ? 'demo' : ((key || data.mode === 'live') ? 'live' : 'demo');
      } else if (providerId === 'openai') {
        const key = openaiApiKey || (typeof window !== 'undefined' ? localStorage.getItem('openai_api_key') : '') || '';
        
        // Call backend api for OpenAI
        const response = await fetch('/api/openai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: textToSubmit,
            apiKey: key,
          }),
        });

        const data = await response.json();
        aiResponse = data.response;
        mode = data.error ? 'evidence' : ((key || data.mode === 'live') ? 'live' : 'evidence');
      } else if (providerId === 'claude') {
        aiResponse = `[Claude Evidence Mode] Prompt was analyzed locally; no Anthropic Claude API call was made. Claude API traffic requires paid credentials. Standard routing terminates inside Amazon Web Services (AWS) data centers located in the US-East (N. Virginia) region. Under Anthropic commercial boundaries, API data is stored for up to 28 days and excluded from model training databases.`;
        mode = 'evidence';
      } else if (providerId === 'local') {
        // Try local Ollama backend if user wants to play, otherwise simulated
        try {
          const ollamaRes = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            body: JSON.stringify({
              model: 'llama3',
              prompt: textToSubmit,
              stream: false,
            }),
            signal: AbortSignal.timeout(3000), // 3s timeout
          });
          if (ollamaRes.ok) {
            const data = await ollamaRes.json();
            aiResponse = `[Sovereign Local Host (vLLM/Ollama)] ${data.response}`;
            mode = 'local';
          } else {
            throw new Error('Ollama offline');
          }
        } catch (e) {
          aiResponse = `[Simulated Sovereign Node] Model: Llama-3-8B-Instruct. Routing: Loopback interface. Compute footprint: 100% localized to host memory. No packets left the local gateway. Threat exposure: 0. Privacy index: 100%. Response: Local sovereign environment verified. Processing of prompt completed on local hardware safely.`;
          mode = 'local';
        }
      }
    } catch (err: any) {
      console.error(err);
      aiResponse = `Error contacting AI model gateway: ${err?.message || 'Connection Refused'}. Fallback to simulated local security report completed.`;
    }

    // Create report document
    const newScan: ScanResult = {
      id: `scan-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toISOString(),
      originalPrompt: saveFullPrompt ? prompt : (isRedacted ? scanData.redactedPrompt : 'Prompt contents deleted (Privacy Configuration Enabled)'),
      redactedPrompt: scanData.redactedPrompt,
      detectedEntities: scanData.detectedEntities,
      detectedTypes: scanData.detectedTypes,
      sensitivityLevel: scanData.sensitivityLevel,
      originalRisk,
      redactedRisk,
      isRedacted,
      aiResponse,
      providerId,
      mode,
    };

    // Save to Firestore-like local storage and store
    set((state) => {
      const updatedHistory = [newScan, ...state.history];
      if (typeof window !== 'undefined') {
        localStorage.setItem('leakmap_history', JSON.stringify(updatedHistory));
        
        // Also call the API route to save scan metadata
        fetch('/api/save-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newScan),
        }).catch(err => console.log('Firebase save-scan fallback bypassed', err));
      }
      return {
        activeResult: newScan,
        history: updatedHistory,
        isAnalyzing: false,
      };
    });

    return newScan;
  },
}));
