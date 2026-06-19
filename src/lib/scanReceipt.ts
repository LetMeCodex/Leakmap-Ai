export interface ScanReceipt {
  scanId: string;
  provider: string;
  mode: string;
  sensitivityLevel: "low" | "medium" | "high" | "critical" | "Confidential" | "Sensitive" | "Personal" | "Critical";
  originalRisk: number;
  redactedRisk: number;
  verifiedEdgesCount: number;
  disclosedEdgesCount: number;
  inferredEdgesCount: number;
  unknownEdgesCount: number;
  rawPromptStored: "YES" | "NO";
  redactionApplied: "YES" | "NO";
  timestamp: string;
}

export function constructReceipt(params: {
  scanId: string;
  provider: string;
  mode: string;
  sensitivityLevel: any;
  originalRisk: number;
  redactedRisk: number;
  edges: { type: string }[];
  isRedacted: boolean;
  saveFullPrompt: boolean;
  timestamp: string;
}): ScanReceipt {
  let verified = 0;
  let disclosed = 0;
  let inferred = 0;
  let unknown = 0;

  params.edges.forEach(e => {
    if (e.type === 'verified' || e.type === 'sovereign') verified++;
    else if (e.type === 'disclosed') disclosed++;
    else if (e.type === 'inferred') inferred++;
    else unknown++;
  });

  return {
    scanId: params.scanId,
    provider: params.provider,
    mode: params.mode,
    sensitivityLevel: params.sensitivityLevel,
    originalRisk: params.originalRisk,
    redactedRisk: params.redactedRisk,
    verifiedEdgesCount: verified,
    disclosedEdgesCount: disclosed,
    inferredEdgesCount: inferred,
    unknownEdgesCount: unknown,
    rawPromptStored: params.saveFullPrompt ? "YES" : "NO",
    redactionApplied: params.isRedacted ? "YES" : "NO",
    timestamp: params.timestamp
  };
}
