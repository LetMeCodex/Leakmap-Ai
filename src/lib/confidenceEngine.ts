import { EvidenceType } from './evidenceRegistry';

export interface ConfidenceDetails {
  baseConfidence: number;
  runtimeEvidenceWeight: number;
  officialSourceWeight: number;
  configurationClarityWeight: number;
  unknownInternalRoutingPenalty: number;
  noSourcePenalty: number;
  demoModePenalty: number;
  finalScore: number;
}

export function calculateConfidence(
  evidenceType: EvidenceType,
  params: {
    hasRuntimeLogs?: boolean;
    hasOfficialSources?: boolean;
    isConfigExplicit?: boolean;
    isBlackBox?: boolean;
    isDemoMode?: boolean;
    hasEvidenceId?: boolean;
  }
): ConfidenceDetails {
  const {
    hasRuntimeLogs = false,
    hasOfficialSources = false,
    isConfigExplicit = false,
    isBlackBox = false,
    isDemoMode = false,
    hasEvidenceId = true
  } = params;

  // Strict check: if no evidenceId exists, cap confidence at 30% and return unknown state
  if (!hasEvidenceId) {
    return {
      baseConfidence: 15,
      runtimeEvidenceWeight: 0,
      officialSourceWeight: 0,
      configurationClarityWeight: 0,
      unknownInternalRoutingPenalty: 0,
      noSourcePenalty: 15,
      demoModePenalty: 0,
      finalScore: 20
    };
  }

  let baseConfidence = 15;
  if (evidenceType === 'verified') baseConfidence = 80;
  else if (evidenceType === 'disclosed') baseConfidence = 60;
  else if (evidenceType === 'inferred') baseConfidence = 35;
  else if (evidenceType === 'unknown') baseConfidence = 15;

  const runtimeEvidenceWeight = hasRuntimeLogs ? 10 : 0;
  const officialSourceWeight = hasOfficialSources ? 10 : 0;
  const configurationClarityWeight = isConfigExplicit ? 5 : 0;
  const unknownInternalRoutingPenalty = isBlackBox ? 15 : 0;
  const noSourcePenalty = !hasOfficialSources ? 10 : 0;
  const demoModePenalty = isDemoMode ? 5 : 0;

  let finalScore = baseConfidence 
    + runtimeEvidenceWeight 
    + officialSourceWeight 
    + configurationClarityWeight 
    - unknownInternalRoutingPenalty 
    - noSourcePenalty 
    - demoModePenalty;

  // Clamp between 0 and 100
  finalScore = Math.max(0, Math.min(100, finalScore));

  return {
    baseConfidence,
    runtimeEvidenceWeight,
    officialSourceWeight,
    configurationClarityWeight,
    unknownInternalRoutingPenalty,
    noSourcePenalty,
    demoModePenalty,
    finalScore
  };
}
