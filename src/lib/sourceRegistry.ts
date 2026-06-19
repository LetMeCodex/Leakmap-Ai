export interface SourceRegistryEntry {
  sourceId: string;
  provider: string;
  title: string;
  documentType: string;
  claimSupported: string;
  sourceUrl: string;
  evidenceType: string;
  confidence: "High" | "Medium-High" | "Medium" | "Low";
  lastReviewed: string;
  notes?: string;
}

export const sourceRegistry: SourceRegistryEntry[] = [
  {
    sourceId: "SRC-GEMINI-001",
    provider: "Google Gemini",
    title: "Gemini API Additional Terms of Service",
    documentType: "Official Terms",
    claimSupported: "Unpaid Gemini API services may involve human review of API input/output; users are warned not to submit sensitive, confidential, or personal information to unpaid services.",
    evidenceType: "Disclosed policy evidence",
    confidence: "High",
    sourceUrl: "https://ai.google.dev/gemini-api/terms",
    lastReviewed: "2026-06-20",
    notes: "Applies to unpaid/free tiers of Gemini developer services."
  },
  {
    sourceId: "SRC-GEMINI-002",
    provider: "Google Gemini",
    title: "Gemini API Data Logging and Sharing",
    documentType: "Official Documentation",
    claimSupported: "Explains data logging/sharing behavior and cautions around sensitive/confidential/proprietary information in contributed logs.",
    evidenceType: "Disclosed policy evidence",
    confidence: "Medium-High",
    sourceUrl: "https://ai.google.dev/gemini-api/docs/logs-policy",
    lastReviewed: "2026-06-20",
    notes: "Explains the differences between logging states and telemetry collection boundaries."
  },
  {
    sourceId: "SRC-GOOGLE-001",
    provider: "Google Cloud",
    title: "Google Cloud Platform Subprocessors",
    documentType: "Official Subprocessor List",
    claimSupported: "Google Cloud lists subprocessors, activities, applicable services/regions, processing countries, and registration countries.",
    evidenceType: "Disclosed processor evidence",
    confidence: "High",
    sourceUrl: "https://cloud.google.com/terms/subprocessors",
    lastReviewed: "2026-06-20",
    notes: "Contractual subprocessor disclosure list details regional entities processing data."
  },
  {
    sourceId: "SRC-OPENAI-001",
    provider: "OpenAI",
    title: "OpenAI API Data Controls",
    documentType: "Official API Documentation",
    claimSupported: "OpenAI data residency controls are project configuration options for eligible customers.",
    evidenceType: "Disclosed configuration evidence",
    confidence: "High",
    sourceUrl: "https://developers.openai.com/api/docs/guides/your-data",
    lastReviewed: "2026-06-20",
    notes: "Confirms that regional data residency controls exist under enterprise/tier contracts."
  },
  {
    sourceId: "SRC-OPENAI-002",
    provider: "OpenAI",
    title: "OpenAI Sub-processor List",
    documentType: "Official Subprocessor List",
    claimSupported: "OpenAI lists subprocessors that may process customer data under the OpenAI Data Processing Agreement.",
    evidenceType: "Disclosed processor evidence",
    confidence: "High",
    sourceUrl: "https://openai.com/policies/sub-processor-list/",
    lastReviewed: "2026-06-20",
    notes: "Maintained subprocessor list identifying computing and support entities."
  },
  {
    sourceId: "SRC-OPENAI-003",
    provider: "OpenAI",
    title: "OpenAI Data Processing Addendum",
    documentType: "Official DPA",
    claimSupported: "Defines subprocessors and customer data processing terms under OpenAI services.",
    evidenceType: "Contractual/legal evidence",
    confidence: "High",
    sourceUrl: "https://openai.com/policies/data-processing-addendum/",
    lastReviewed: "2026-06-20",
    notes: "Legal document defining customer data processing boundaries and instructions."
  },
  {
    sourceId: "SRC-CLAUDE-001",
    provider: "Anthropic Claude",
    title: "Claude API and Data Retention",
    documentType: "Official API Documentation",
    claimSupported: "Claude API conversation content is not retained by default; retained data is not used for model training without express permission.",
    evidenceType: "Disclosed retention evidence",
    confidence: "High",
    sourceUrl: "https://platform.claude.com/docs/en/manage-claude/api-and-data-retention",
    lastReviewed: "2026-06-20",
    notes: "Contractual default retention statements for non-promotional Claude API requests."
  },
  {
    sourceId: "SRC-CLAUDE-002",
    provider: "Anthropic",
    title: "Anthropic Subprocessors",
    documentType: "Official Trust Center",
    claimSupported: "Anthropic publishes subprocessor information through its Trust Center.",
    evidenceType: "Disclosed processor evidence",
    confidence: "Medium-High",
    sourceUrl: "https://trust.anthropic.com/subprocessors",
    lastReviewed: "2026-06-20",
    notes: "Third-party host structures and processing entities are registered here."
  },
  {
    sourceId: "SRC-LIMITATION-001",
    provider: "LeakMap Methodology",
    title: "Internal Path Limitation Statement",
    documentType: "Methodology Note",
    claimSupported: "LeakMap cannot externally verify exact hidden internal data center/model server/GPU routing inside black-box AI providers.",
    evidenceType: "Methodology limitation",
    confidence: "High",
    sourceUrl: "/methodology/internal-path-limits",
    lastReviewed: "2026-06-20",
    notes: "Defines the physical boundaries of external cybersecurity/auditing heuristics."
  }
];

export function getSourceById(sourceId: string): SourceRegistryEntry | undefined {
  return sourceRegistry.find(s => s.sourceId === sourceId);
}
