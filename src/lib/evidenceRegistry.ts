export type EvidenceType = "verified" | "disclosed" | "inferred" | "unknown";

export interface EvidenceSource {
  id: string;
  provider: string;
  title: string;
  documentType: string;
  claimSupported: string;
  sourceUrl?: string;
  lastReviewed: string;
  confidence: "high" | "medium" | "low";
}

export interface ClaimLedgerItem {
  id: string;
  uiClaim: string;
  evidenceType: EvidenceType;
  confidenceScore: number;
  sourceIds: string[];
  status: string;
  whatItProves: string;
  whatItDoesNotProve: string;
}

export interface RouteEvidenceCard {
  id: string;
  routeLabel: string;
  from: string;
  to: string;
  evidenceType: EvidenceType;
  confidenceScore: number;
  sourceIds: string[];
  ruleIds: string[];
  whatItProves: string;
  whatItDoesNotProve: string;
  unknowns: string[];
}

export const evidenceSources: EvidenceSource[] = [
  {
    id: "SRC-GEMINI-001",
    provider: "Google Gemini",
    title: "Google Terms of Service & Privacy Policy",
    documentType: "Gemini API Terms",
    claimSupported: "Unpaid services may involve human review; avoid sensitive/confidential/personal info",
    sourceUrl: "https://ai.google.dev/gemini-api/terms",
    lastReviewed: "2026-06-20",
    confidence: "high"
  },
  {
    id: "SRC-OPENAI-001",
    provider: "OpenAI",
    title: "OpenAI Enterprise Privacy Policy",
    documentType: "API Data Controls / Data Residency Docs",
    claimSupported: "Data residency controls depend on project/account configuration",
    sourceUrl: "https://openai.com/enterprise-privacy",
    lastReviewed: "2026-06-20",
    confidence: "high"
  },
  {
    id: "SRC-OPENAI-002",
    provider: "OpenAI",
    title: "OpenAI Subprocessor Disclosures",
    documentType: "Data Processing Addendum / Subprocessor List",
    claimSupported: "Subprocessors may process customer data as listed",
    sourceUrl: "https://openai.com/policies/subprocessors",
    lastReviewed: "2026-06-20",
    confidence: "high"
  },
  {
    id: "SRC-CLAUDE-001",
    provider: "Anthropic Claude",
    title: "Anthropic Commercial Terms of Service",
    documentType: "API Data Retention Docs",
    claimSupported: "Claude API content retention/training behavior depends on API docs/settings",
    sourceUrl: "https://www.anthropic.com/commercial-terms",
    lastReviewed: "2026-06-20",
    confidence: "high"
  },
  {
    id: "SRC-CLAUDE-002",
    provider: "Anthropic",
    title: "Anthropic Subprocessor List",
    documentType: "Trust Center / Subprocessors",
    claimSupported: "Anthropic publishes subprocessors used to host compute and perform audits",
    sourceUrl: "https://www.anthropic.com/subprocessors",
    lastReviewed: "2026-06-20",
    confidence: "medium"
  },
  {
    id: "SRC-RUNTIME-001",
    provider: "LeakMap Runtime",
    documentType: "Runtime Telemetry",
    title: "LeakMap Session Metadata Tracker",
    claimSupported: "User selected origin/provider/mode",
    lastReviewed: "live",
    confidence: "high"
  },
  {
    id: "SRC-RUNTIME-002",
    provider: "LeakMap Backend",
    documentType: "Endpoint Request Log",
    title: "LeakMap Active Network Sockets Monitor",
    claimSupported: "Backend attempted request to selected endpoint",
    lastReviewed: "live",
    confidence: "high"
  },
  {
    id: "SRC-LIMITATION-001",
    provider: "LeakMap Methodology",
    documentType: "Technical Limitation Statement",
    title: "LeakMap Audit Limitation Ledger",
    claimSupported: "Exact hidden internal provider path is not externally observable",
    lastReviewed: "2026-06-20",
    confidence: "high"
  }
];

export const claimLedger: ClaimLedgerItem[] = [
  {
    id: "LM-001",
    uiClaim: "User origin is India",
    evidenceType: "verified",
    confidenceScore: 95,
    sourceIds: ["SRC-RUNTIME-001"],
    status: "Verified within app context",
    whatItProves: "Browser session metadata, local system locale, and client timezones confirm prompt payload is initialized from India.",
    whatItDoesNotProve: "Does not prove the precise physical street coordinate of the user's end device if they load through third-party network proxies."
  },
  {
    id: "LM-002",
    uiClaim: "Prompt sent to Gemini endpoint",
    evidenceType: "verified",
    confidenceScore: 90,
    sourceIds: ["SRC-RUNTIME-002"],
    status: "Verified only if live Gemini call happened",
    whatItProves: "Network API logs record active outgoing socket calls dispatched to Google Gemini API servers.",
    whatItDoesNotProve: "Does not identify the specific processing rack inside Google's global node clusters."
  },
  {
    id: "LM-003",
    uiClaim: "Gemini unpaid services may involve human review",
    evidenceType: "disclosed",
    confidenceScore: 85,
    sourceIds: ["SRC-GEMINI-001"],
    status: "Disclosed policy evidence",
    whatItProves: "Google terms explicitly disclose that human reviewers may read, annotate, and process unpaid API request content.",
    whatItDoesNotProve: "Does not prove this specific prompt was reviewed by a human auditor (sampling rate is proprietary)."
  },
  {
    id: "LM-004",
    uiClaim: "OpenAI data residency depends on project/account configuration",
    evidenceType: "disclosed",
    confidenceScore: 85,
    sourceIds: ["SRC-OPENAI-001"],
    status: "Disclosed configuration evidence",
    whatItProves: "OpenAI supports regional data residency locks only for enterprise accounts configured with explicit region selections.",
    whatItDoesNotProve: "Does not confirm regional locking for standard developer keys, which default to global processing."
  },
  {
    id: "LM-005",
    uiClaim: "OpenAI uses subprocessors listed under DPA",
    evidenceType: "disclosed",
    confidenceScore: 80,
    sourceIds: ["SRC-OPENAI-002"],
    status: "Disclosed contractual evidence",
    whatItProves: "OpenAI publishes their subprocessor roster confirming customer payloads are processed by Azure and Scale AI.",
    whatItDoesNotProve: "Does not guarantee that every listed subprocessor company handled this specific user query."
  },
  {
    id: "LM-006",
    uiClaim: "Claude API conversation content is not retained by default",
    evidenceType: "disclosed",
    confidenceScore: 85,
    sourceIds: ["SRC-CLAUDE-001"],
    status: "Disclosed policy evidence",
    whatItProves: "Anthropic's developer terms clarify that inputs are not saved for model training and are kept for maximum 28 days.",
    whatItDoesNotProve: "Does not guarantee zero short-term cache persistence if user input triggers safety moderation filters."
  },
  {
    id: "LM-007",
    uiClaim: "Anthropic has a public subprocessor trust center",
    evidenceType: "disclosed",
    confidenceScore: 80,
    sourceIds: ["SRC-CLAUDE-002"],
    status: "Disclosed processor evidence",
    whatItProves: "Anthropic publishes and maintains their active third-party hosting partners (such as AWS US clusters).",
    whatItDoesNotProve: "Does not reveal the internal VPC routing parameters utilized during network capacity balance states."
  },
  {
    id: "LM-008",
    uiClaim: "Exact hidden internal model processing path is unknown",
    evidenceType: "unknown",
    confidenceScore: 100,
    sourceIds: ["SRC-LIMITATION-001"],
    status: "Unknown / not observable",
    whatItProves: "Confirms that private neural network weight calculations and server-to-server routing inside providers remain unobservable.",
    whatItDoesNotProve: "Does not verify whether providers violate their published storage boundaries or GDPR rules."
  }
];

export const providerEvidenceProfiles = {
  gemini: {
    providerName: "Google Gemini",
    mode: "Live / Demo",
    endpointDomain: "generativelanguage.googleapis.com",
    claimLevel: "Disclosed",
    confidence: "80-85%",
    unknown: "Exact internal data center path for this specific prompt",
    evidence: [
      "Gemini API terms contain warnings for unpaid services",
      "Human reviewers may read, annotate, and process API input and output for unpaid services",
      "Sensitive, confidential, or personal information should not be submitted to unpaid services"
    ]
  },
  openai: {
    providerName: "OpenAI API",
    mode: "Evidence / Optional Live",
    endpointDomain: "api.openai.com",
    claimLevel: "Disclosed",
    confidence: "75-85%",
    unknown: "Exact internal inference path unless provider contract/config explicitly guarantees it",
    evidence: [
      "API data residency controls are project/account configuration based",
      "Data Processing Addendum (DPA) references subprocessors used to process customer data",
      "Regional residency depends on eligible configuration"
    ]
  },
  claude: {
    providerName: "Anthropic Claude",
    mode: "Evidence-only",
    endpointDomain: "api.anthropic.com",
    claimLevel: "Disclosed",
    confidence: "75-85%",
    unknown: "Exact internal route/path for a specific request",
    evidence: [
      "Claude API docs say conversation content is not retained by default",
      "Retained data is not used for model training without express permission",
      "Some features/models have special retention requirements",
      "Anthropic has a public subprocessor trust center"
    ]
  },
  local: {
    providerName: "Local Sovereign Mode",
    mode: "Local / Simulated",
    endpointDomain: "localhost / local inference node",
    claimLevel: "Verified within app runtime if no network call is made",
    confidence: "90-100%",
    unknown: "Only unknown if local model pulls remote tools/plugins",
    evidence: [
      "No external API call if local mode is active",
      "Route remains inside local environment"
    ]
  }
};

export const routeEvidenceCards: RouteEvidenceCard[] = [
  {
    id: "ROUTE-GEMINI-001",
    routeLabel: "India → Gemini Endpoint",
    from: "India (User)",
    to: "Singapore (Edge Gateway)",
    evidenceType: "verified",
    confidenceScore: 90,
    sourceIds: ["SRC-GEMINI-001", "SRC-GOOGLE-001", "SRC-LIMITATION-001"],
    ruleIds: ["R-105", "R-110"],
    whatItProves: "LeakMap selected Gemini as provider and matched the route to Gemini/Google official policy and subprocessor evidence.",
    whatItDoesNotProve: "It does not prove the exact internal Google model server or data center used for this prompt.",
    unknowns: [
      "exact internal processing region",
      "exact model worker server",
      "exact GPU location",
      "whether every listed subprocessor touched this exact prompt",
      "provider failover path"
    ]
  },
  {
    id: "ROUTE-OPENAI-001",
    routeLabel: "India → OpenAI API",
    from: "India (User)",
    to: "US West (OpenAI Backend)",
    evidenceType: "disclosed",
    confidenceScore: 82,
    sourceIds: ["SRC-OPENAI-001", "SRC-OPENAI-002", "SRC-OPENAI-003", "SRC-LIMITATION-001"],
    ruleIds: ["R-105", "R-110"],
    whatItProves: "OpenAI publishes data controls/data residency documentation and subprocessor information.",
    whatItDoesNotProve: "It does not prove exact internal routing for this specific prompt.",
    unknowns: [
      "exact internal processing region",
      "exact model worker server",
      "exact GPU location",
      "whether every listed subprocessor touched this exact prompt",
      "provider failover path"
    ]
  },
  {
    id: "ROUTE-CLAUDE-001",
    routeLabel: "India → Claude API",
    from: "India (User)",
    to: "US East (Anthropic AWS)",
    evidenceType: "disclosed",
    confidenceScore: 80,
    sourceIds: ["SRC-CLAUDE-001", "SRC-CLAUDE-002", "SRC-LIMITATION-001"],
    ruleIds: ["R-105", "R-110"],
    whatItProves: "Anthropic publishes Claude API retention documentation and subprocessor/trust-center information.",
    whatItDoesNotProve: "It does not prove exact internal routing for this specific prompt.",
    unknowns: [
      "exact internal processing region",
      "exact model worker server",
      "exact GPU location",
      "whether every listed subprocessor touched this exact prompt",
      "provider failover path"
    ]
  },
  {
    id: "ROUTE-LOCAL-001",
    routeLabel: "India → Localhost / Sovereign Node",
    from: "India (User)",
    to: "Local Host (Delhi)",
    evidenceType: "verified",
    confidenceScore: 95,
    sourceIds: ["SRC-LIMITATION-001"],
    ruleIds: ["R-108"],
    whatItProves: "No external API request is dispatched over the public internet; the prompt was evaluated on local loopback nodes.",
    whatItDoesNotProve: "It does not prove that secondary dependencies (like plugins or live search tools) didn't execute remote lookups.",
    unknowns: [
      "local hardware configuration vulnerabilities",
      "exact software dependency version leaks"
    ]
  }
];

export const confidenceLevels = {
  verified: {
    label: "VERIFIED",
    definition: "Evidence generated by LeakMap runtime logs, backend endpoint, DNS/domain, API mode, timestamp, selected provider, selected route.",
    example: "Backend sent request to generativelanguage.googleapis.com.",
    confidenceRange: "80-100%",
    color: "#00AEEF"
  },
  disclosed: {
    label: "DISCLOSED",
    definition: "Evidence from public provider docs, privacy policy, DPA, subprocessor list, trust center, data residency docs.",
    example: "Provider documentation says subprocessors may process customer data.",
    confidenceRange: "50-85%",
    color: "#3B00FF"
  },
  inferred: {
    label: "INFERRED",
    definition: "Risk estimated from ambiguous policy language, missing residency controls, unclear retention, or possible cross-border processing.",
    example: "Provider mentions service providers but does not disclose exact country path for this request.",
    confidenceRange: "20-60%",
    color: "#DFA100"
  },
  unknown: {
    label: "UNKNOWN",
    definition: "Information LeakMap cannot verify.",
    example: "Exact internal data center / model server path.",
    confidenceRange: "0-30%",
    color: "#77776F"
  }
};

export function getRouteEvidenceId(providerId: string, from: string, to: string): string | undefined {
  if (providerId === "gemini") return "ROUTE-GEMINI-001";
  if (providerId === "openai") return "ROUTE-OPENAI-001";
  if (providerId === "claude") return "ROUTE-CLAUDE-001";
  if (providerId === "local") return "ROUTE-LOCAL-001";
  return undefined;
}
