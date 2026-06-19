export interface EvidenceItem {
  id: string;
  title: string;
  url: string;
  summary: string;
  confidence: number; // 0 to 100
  lastReviewed: string;
  type: 'verified' | 'disclosed' | 'inferred' | 'unknown';
}

export interface ProviderProfile {
  id: string;
  providerName: string;
  tagline: string;
  defaultMode: 'live' | 'evidence' | 'evidence-only' | 'local';
  liveSupported: boolean;
  paidRequired: boolean;
  endpointDomains: string[];
  dataResidencyClarity: number; // 0 to 10
  subprocessorTransparency: number; // 0 to 10
  retentionClarity: number; // 0 to 10
  trainingDefaultClarity: number; // 0 to 10
  possibleJurisdictions: string[];
  riskModifiers: {
    baseScore: number;
    subprocessorRisk: number;
    jurisdictionRisk: number;
    trainingRisk: number;
  };
  evidenceItems: EvidenceItem[];
  // Graph visual representation
  nodes: { id: string; label: string; type: 'verified' | 'disclosed' | 'inferred' | 'unknown' | 'sovereign'; country: string }[];
  edges: { from: string; to: string; type: 'verified' | 'disclosed' | 'inferred'; label: string; confidence: number }[];
}

export const providerProfiles: Record<string, ProviderProfile> = {
  gemini: {
    id: 'gemini',
    providerName: 'Google Gemini',
    tagline: 'Global scale infrastructure with region-specific compliance features.',
    defaultMode: 'live',
    liveSupported: true,
    paidRequired: false,
    endpointDomains: ['generativelanguage.googleapis.com', 'vertexai.googleapis.com'],
    dataResidencyClarity: 7,
    subprocessorTransparency: 6,
    retentionClarity: 8,
    trainingDefaultClarity: 8,
    possibleJurisdictions: ['India (User Origin)', 'US (Central Processing)', 'EU (Regional Option)', 'Global Edge Nodes'],
    riskModifiers: {
      baseScore: 15,
      subprocessorRisk: 10,
      jurisdictionRisk: 12,
      trainingRisk: 8,
    },
    nodes: [
      { id: 'user', label: 'User Device', type: 'verified', country: 'India' },
      { id: 'dns', label: 'Anycast DNS / Edge', type: 'verified', country: 'India' },
      { id: 'gateway', label: 'Google API Gateway', type: 'verified', country: 'Singapore' },
      { id: 'vertex', label: 'Vertex AI / Gemini Core', type: 'disclosed', country: 'United States' },
      { id: 'storage', label: 'Persistent Logs / Storage', type: 'inferred', country: 'United States' },
      { id: 'training', label: 'Google Model Training Pipeline', type: 'inferred', country: 'United States' },
    ],
    edges: [
      { from: 'user', to: 'dns', type: 'verified', label: 'Verified endpoint (TLS 1.3)', confidence: 98 },
      { from: 'dns', to: 'gateway', type: 'verified', label: 'Verified Network Route', confidence: 95 },
      { from: 'gateway', to: 'vertex', type: 'disclosed', label: 'Disclosed processor chain', confidence: 80 },
      { from: 'vertex', to: 'storage', type: 'inferred', label: 'May travel (Config Dependent)', confidence: 60 },
      { from: 'vertex', to: 'training', type: 'inferred', label: 'Possible contractual exposure (Opt-Out dependent)', confidence: 50 },
    ],
    evidenceItems: [
      {
        id: 'gem-1',
        title: 'Google Cloud Vertex AI Data Commitment',
        url: 'https://cloud.google.com/vertex-ai/docs/generative-ai/data-governance',
        summary: 'Vertex AI guarantees customer data is not used to train Google foundation models by default. Region-specific endpoints are available, but global fallbacks may happen during high-load periods.',
        confidence: 90,
        lastReviewed: '2026-03-10',
        type: 'disclosed',
      },
      {
        id: 'gem-2',
        title: 'Google Subprocessor List & Infrastructure Map',
        url: 'https://cloud.google.com/terms/subprocessors',
        summary: 'Identifies third-party vendors and Google subsidiaries involved in storage, customer support, and logging across the US, EU, and Asia Pacific.',
        confidence: 85,
        lastReviewed: '2026-01-15',
        type: 'disclosed',
      },
      {
        id: 'gem-3',
        title: 'Network Telemetry: Endpoint Verification',
        url: 'self://network-telemetry-log',
        summary: 'Verified endpoint logs show prompt traffic connecting to Google Generative Language APIs. Exact internal server routes are not publicly auditable.',
        confidence: 100,
        lastReviewed: '2026-06-19',
        type: 'verified',
      },
    ],
  },
  openai: {
    id: 'openai',
    providerName: 'OpenAI API',
    tagline: 'Industry benchmark models with evolving enterprise boundary features.',
    defaultMode: 'evidence',
    liveSupported: true,
    paidRequired: false,
    endpointDomains: ['api.openai.com'],
    dataResidencyClarity: 5,
    subprocessorTransparency: 7,
    retentionClarity: 7,
    trainingDefaultClarity: 9,
    possibleJurisdictions: ['India (User Origin)', 'US East (Microsoft Azure)', 'US West (OpenAI Backend)', 'Global Subprocessors'],
    riskModifiers: {
      baseScore: 20,
      subprocessorRisk: 12,
      jurisdictionRisk: 15,
      trainingRisk: 5,
    },
    nodes: [
      { id: 'user', label: 'User Device', type: 'verified', country: 'India' },
      { id: 'cloudflare', label: 'Cloudflare Proxy Node', type: 'verified', country: 'India' },
      { id: 'azure-gateway', label: 'Microsoft Azure (Host Endpoint)', type: 'verified', country: 'Singapore' },
      { id: 'openai-core', label: 'OpenAI Central Processing', type: 'disclosed', country: 'United States' },
      { id: 'azure-storage', label: 'Azure Blob Storage (30-day Retention)', type: 'disclosed', country: 'United States' },
      { id: 'human-review', label: 'Third-party Moderation Reviewers', type: 'inferred', country: 'Global (Scale AI / Remotasks)' },
    ],
    edges: [
      { from: 'user', to: 'cloudflare', type: 'verified', label: 'Verified endpoint (Edge Proxy)', confidence: 99 },
      { from: 'cloudflare', to: 'azure-gateway', type: 'verified', label: 'Verified Network Route', confidence: 92 },
      { from: 'azure-gateway', to: 'openai-core', type: 'disclosed', label: 'Disclosed processor chain', confidence: 85 },
      { from: 'openai-core', to: 'azure-storage', type: 'disclosed', label: 'Contractual storage residency', confidence: 80 },
      { from: 'openai-core', to: 'human-review', type: 'inferred', label: 'Possible contractual exposure (Abuse monitoring flag)', confidence: 45 },
    ],
    evidenceItems: [
      {
        id: 'oa-1',
        title: 'OpenAI Enterprise Privacy Policy',
        url: 'https://openai.com/enterprise-privacy',
        summary: 'API data is not used for model training, but stored for up to 30 days for abuse detection unless zero-data retention (ZDR) is approved.',
        confidence: 90,
        lastReviewed: '2026-05-01',
        type: 'disclosed',
      },
      {
        id: 'oa-2',
        title: 'OpenAI Subprocessor Disclosures',
        url: 'https://openai.com/policies/subprocessors',
        summary: 'Lists Microsoft Azure as the primary infrastructure provider, alongside third-party service vendors like Scale AI and outsourcing firms located globally.',
        confidence: 85,
        lastReviewed: '2026-02-28',
        type: 'disclosed',
      },
      {
        id: 'oa-3',
        title: 'Azure OpenAI Geopolitical Placement',
        url: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/data-residency',
        summary: 'Highlights that Azure OpenAI may process data outside the local region during global capacity failures, leading to inferred jurisdiction risk.',
        confidence: 75,
        lastReviewed: '2026-04-12',
        type: 'inferred',
      },
    ],
  },
  claude: {
    id: 'claude',
    providerName: 'Anthropic Claude',
    tagline: 'Safety-first models with robust privacy commitments.',
    defaultMode: 'evidence-only',
    liveSupported: false,
    paidRequired: true,
    endpointDomains: ['api.anthropic.com'],
    dataResidencyClarity: 6,
    subprocessorTransparency: 8,
    retentionClarity: 8,
    trainingDefaultClarity: 9,
    possibleJurisdictions: ['India (User Origin)', 'US (AWS Server Nodes)', 'AWS Regional Sovereignty Clusters'],
    riskModifiers: {
      baseScore: 18,
      subprocessorRisk: 8,
      jurisdictionRisk: 14,
      trainingRisk: 5,
    },
    nodes: [
      { id: 'user', label: 'User Device', type: 'verified', country: 'India' },
      { id: 'cloudflare-claude', label: 'Cloudflare Network Shield', type: 'verified', country: 'India' },
      { id: 'aws-endpoint', label: 'AWS API Gateway', type: 'verified', country: 'Singapore' },
      { id: 'anthropic-aws', label: 'Anthropic VPC (AWS US)', type: 'disclosed', country: 'United States' },
      { id: 'anthropic-db', label: 'AWS DB (28-day Retention Policy)', type: 'disclosed', country: 'United States' },
    ],
    edges: [
      { from: 'user', to: 'cloudflare-claude', type: 'verified', label: 'Verified endpoint', confidence: 99 },
      { from: 'cloudflare-claude', to: 'aws-endpoint', type: 'verified', label: 'Verified Network Route', confidence: 90 },
      { from: 'aws-endpoint', to: 'anthropic-aws', type: 'disclosed', label: 'Disclosed processor chain', confidence: 85 },
      { from: 'anthropic-aws', to: 'anthropic-db', type: 'disclosed', label: 'Contractual storage residency', confidence: 85 },
    ],
    evidenceItems: [
      {
        id: 'cl-1',
        title: 'Anthropic Commercial Terms of Service',
        url: 'https://www.anthropic.com/legal/commercial-terms',
        summary: 'Explicitly states Anthropic does not use customer API inputs/outputs to train models. Commercial customer data is retained for a maximum of 28 days unless legally required otherwise.',
        confidence: 95,
        lastReviewed: '2026-05-15',
        type: 'disclosed',
      },
      {
        id: 'cl-2',
        title: 'Anthropic Trust & Security Portal',
        url: 'https://www.anthropic.com/trust',
        summary: 'Details VPC hosting constraints, encryption mechanisms, and subprocessor rosters. Core compute runs exclusively within secure AWS enclaves.',
        confidence: 88,
        lastReviewed: '2026-03-20',
        type: 'disclosed',
      },
    ],
  },
  local: {
    id: 'local',
    providerName: 'Local Sovereign Mode',
    tagline: 'Complete digital sovereignty. Compute stays under local governance.',
    defaultMode: 'local',
    liveSupported: true,
    paidRequired: false,
    endpointDomains: ['localhost:11434', '127.0.0.1'],
    dataResidencyClarity: 10,
    subprocessorTransparency: 10,
    retentionClarity: 10,
    trainingDefaultClarity: 10,
    possibleJurisdictions: ['India (Localhost Device Only)', 'Sovereign Compute Node (In-Country)'],
    riskModifiers: {
      baseScore: 0,
      subprocessorRisk: 0,
      jurisdictionRisk: 0,
      trainingRisk: 0,
    },
    nodes: [
      { id: 'user', label: 'User Device (Compute Node)', type: 'sovereign', country: 'India' },
      { id: 'localhost', label: 'Localhost Ollama / vLLM', type: 'sovereign', country: 'India' },
    ],
    edges: [
      { from: 'user', to: 'localhost', type: 'verified', label: 'Sovereign local bus loopback (No API Exposure)', confidence: 100 },
    ],
    evidenceItems: [
      {
        id: 'loc-1',
        title: 'Network Telemetry: Loopback Protocol',
        url: 'self://loopback-verification',
        summary: 'Verified traffic trace shows packages remain fully internal to local network interfaces (`127.0.0.1` / `::1`). Outbound socket connections were blocked or not initiated.',
        confidence: 100,
        lastReviewed: '2026-06-19',
        type: 'verified',
      },
      {
        id: 'loc-2',
        title: 'Sovereign Compute Compliance Guarantee',
        url: 'self://sovereignty-policy',
        summary: 'No external subprocessors are engaged. Data retention, model updates, and storage are entirely controlled by the operating system user.',
        confidence: 100,
        lastReviewed: '2026-06-19',
        type: 'verified',
      },
    ],
  },
};
