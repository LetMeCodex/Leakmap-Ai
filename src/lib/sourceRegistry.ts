export type SourceItem = {
  id: string;
  sourceId: string; // for backwards compatibility
  provider: string;
  title: string;
  documentType: string;
  claimSupported: string;
  evidenceType: "official-policy" | "subprocessor-disclosure" | "configuration-evidence" | "retention-evidence" | "methodology-limit";
  confidence: "high" | "medium-high" | "medium";
  sourceUrl: string;
  lastReviewed: string;
  notes?: string;
};

// Aliased for compatibility
export type SourceRegistryEntry = SourceItem;

export const sourceRegistry: SourceItem[] = [
  {
    id: "SRC-GEMINI-001",
    sourceId: "SRC-GEMINI-001",
    provider: "Google Gemini",
    title: "Google Gemini API Terms",
    documentType: "Official Terms",
    claimSupported: "Gemini API terms, unpaid service caution, human review/sensitive data warnings where applicable.",
    evidenceType: "official-policy",
    confidence: "high",
    sourceUrl: "https://ai.google.dev/gemini-api/terms",
    lastReviewed: "2026-06-20",
    notes: "Applies to unpaid/free tiers of Gemini developer services."
  },
  {
    id: "SRC-GEMINI-002",
    sourceId: "SRC-GEMINI-002",
    provider: "Google Gemini",
    title: "Gemini API Logs / Data Logging Policy",
    documentType: "Official Documentation",
    claimSupported: "Gemini API logging/sharing behavior where applicable.",
    evidenceType: "official-policy",
    confidence: "medium-high",
    sourceUrl: "https://ai.google.dev/gemini-api/docs/logs-policy",
    lastReviewed: "2026-06-20",
    notes: "Explains the differences between logging states and telemetry collection boundaries."
  },
  {
    id: "SRC-GOOGLE-001",
    sourceId: "SRC-GOOGLE-001",
    provider: "Google Cloud",
    title: "Google Cloud Platform Subprocessors",
    documentType: "Official Subprocessor List",
    claimSupported: "Google Cloud subprocessor disclosure, service/region/activity and processing country information where listed.",
    evidenceType: "subprocessor-disclosure",
    confidence: "high",
    sourceUrl: "https://cloud.google.com/terms/subprocessors",
    lastReviewed: "2026-06-20",
    notes: "Contractual subprocessor disclosure list details regional entities processing data."
  },
  {
    id: "SRC-OPENAI-001",
    sourceId: "SRC-OPENAI-001",
    provider: "OpenAI",
    title: "OpenAI API Data Controls",
    documentType: "Official API Documentation",
    claimSupported: "OpenAI API data controls and data residency configuration claims.",
    evidenceType: "configuration-evidence",
    confidence: "high",
    sourceUrl: "https://developers.openai.com/api/docs/guides/your-data",
    lastReviewed: "2026-06-20",
    notes: "Confirms that regional data residency controls exist under enterprise/tier contracts."
  },
  {
    id: "SRC-OPENAI-002",
    sourceId: "SRC-OPENAI-002",
    provider: "OpenAI",
    title: "OpenAI Subprocessor List",
    documentType: "Official Subprocessor List",
    claimSupported: "OpenAI disclosed subprocessor evidence.",
    evidenceType: "subprocessor-disclosure",
    confidence: "high",
    sourceUrl: "https://openai.com/policies/sub-processor-list/",
    lastReviewed: "2026-06-20",
    notes: "Maintained subprocessor list identifying computing and support entities."
  },
  {
    id: "SRC-OPENAI-003",
    sourceId: "SRC-OPENAI-003",
    provider: "OpenAI",
    title: "OpenAI Data Processing Addendum",
    documentType: "Official DPA",
    claimSupported: "OpenAI customer data processing and subprocessor processing terms.",
    evidenceType: "official-policy",
    confidence: "high",
    sourceUrl: "https://openai.com/policies/data-processing-addendum/",
    lastReviewed: "2026-06-20",
    notes: "Legal document defining customer data processing boundaries and instructions."
  },
  {
    id: "SRC-CLAUDE-001",
    sourceId: "SRC-CLAUDE-001",
    provider: "Anthropic Claude",
    title: "Claude API Data Retention",
    documentType: "Official API Documentation",
    claimSupported: "Claude API retention and training-use caveats.",
    evidenceType: "retention-evidence",
    confidence: "high",
    sourceUrl: "https://platform.claude.com/docs/en/manage-claude/api-and-data-retention",
    lastReviewed: "2026-06-20",
    notes: "Contractual default retention statements for non-promotional Claude API requests."
  },
  {
    id: "SRC-CLAUDE-002",
    sourceId: "SRC-CLAUDE-002",
    provider: "Anthropic",
    title: "Anthropic Subprocessors / Trust Center",
    documentType: "Official Trust Center",
    claimSupported: "Anthropic subprocessor disclosure.",
    evidenceType: "subprocessor-disclosure",
    confidence: "medium-high",
    sourceUrl: "https://trust.anthropic.com/subprocessors",
    lastReviewed: "2026-06-20",
    notes: "Third-party host structures and processing entities are registered here."
  },
  {
    id: "SRC-LIMITATION-001",
    sourceId: "SRC-LIMITATION-001",
    provider: "LeakMap Methodology",
    title: "LeakMap Internal Path Limitation Statement",
    documentType: "Methodology Note",
    claimSupported: "Methodology statement that exact hidden provider internal routing cannot be externally verified.",
    evidenceType: "methodology-limit",
    confidence: "high",
    sourceUrl: "/sources",
    lastReviewed: "2026-06-20",
    notes: "Defines the physical boundaries of external cybersecurity/auditing heuristics."
  }
];

export function getSourceById(sourceId: string): SourceRegistryEntry | undefined {
  return sourceRegistry.find(s => s.id === sourceId || s.sourceId === sourceId);
}
