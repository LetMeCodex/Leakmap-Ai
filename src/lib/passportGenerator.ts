export interface DataPassportModel {
  id: string; // AIDP-LMX-xxxx
  scanId: string;
  provider: string;
  mode: string;
  sensitivityLevel: string;
  originalRisk: number;
  redactedRisk: number;
  recommendedRoute: string;
  verifiedClaimsCount: number;
  disclosedClaimsCount: number;
  inferredClaimsCount: number;
  unknownFactorsCount: number;
  rulesTriggered: string[];
  sourceIds: string[];
  finalVerdict: string;
  timestamp: string;
}

export function generatePassport(params: {
  scanId: string;
  provider: string;
  mode: string;
  sensitivityLevel: string;
  originalRisk: number;
  redactedRisk: number;
  rulesTriggered: string[];
  edges: { type: string }[];
  timestamp: string;
}): DataPassportModel {
  const shortId = params.scanId.replace("scan-", "").substring(0, 8).toUpperCase();
  const id = `AIDP-${shortId}`;

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

  // Simple verdict logic
  let finalVerdict = "COMPLIANT PASS";
  if (params.provider === 'local') {
    finalVerdict = "SOVEREIGN PASS";
  } else if (params.redactedRisk < 50) {
    finalVerdict = "ANONYMIZED PASS";
  } else if (params.originalRisk > 75) {
    finalVerdict = "THREAT WARNING";
  } else {
    finalVerdict = "EXPOSURE AUDIT";
  }

  // Source IDs compilation based on provider
  let sourceIds: string[] = ["SRC-RUNTIME-001"];
  if (params.provider === 'gemini') {
    sourceIds.push("SRC-GEMINI-001", "SRC-RUNTIME-002");
  } else if (params.provider === 'openai') {
    sourceIds.push("SRC-OPENAI-001", "SRC-OPENAI-002");
  } else if (params.provider === 'claude') {
    sourceIds.push("SRC-CLAUDE-001", "SRC-CLAUDE-002");
  } else {
    sourceIds.push("SRC-LIMITATION-001");
  }

  return {
    id,
    scanId: params.scanId,
    provider: params.provider,
    mode: params.mode,
    sensitivityLevel: params.sensitivityLevel,
    originalRisk: params.originalRisk,
    redactedRisk: params.redactedRisk,
    recommendedRoute: params.provider === 'local' ? "LOCAL LOOPBACK" : "REDACTED PROMPT GATEWAY OR LOCAL SOVEREIGN MODE",
    verifiedClaimsCount: verified,
    disclosedClaimsCount: disclosed,
    inferredClaimsCount: inferred,
    unknownFactorsCount: unknown + 1, // blackbox penalty
    rulesTriggered: params.rulesTriggered,
    sourceIds,
    finalVerdict,
    timestamp: params.timestamp
  };
}
