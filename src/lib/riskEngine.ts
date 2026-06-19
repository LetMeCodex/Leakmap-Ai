import { SensitivityLevel } from './redactionEngine';
import { ProviderProfile } from './providerProfiles';

export interface RiskBreakdown {
  promptSensitivity: number; // 0-35
  foreignExposure: number; // 0-15
  subprocessorVisibility: number; // 0-15
  dataResidencyAmbiguity: number; // 0-10
  trainingAmbiguity: number; // 0-10
  humanReviewRisk: number; // 0-5
  redactionPenalty: number; // 0-10
}

export interface RiskScoreResult {
  score: number; // 0-100
  breakdown: RiskBreakdown;
  rating: 'Low' | 'Medium' | 'High' | 'Critical';
  color: string; // Tailwind class
  glowColor: string; // CSS styling variable
}

export function calculateRisk(
  sensitivityLevel: SensitivityLevel,
  provider: ProviderProfile,
  isRedacted: boolean,
  hasEntities: boolean
): RiskScoreResult {
  // 1. Prompt Sensitivity Score (0-35)
  let promptSensitivity = 0;
  switch (sensitivityLevel) {
    case 'Critical':
      promptSensitivity = 35;
      break;
    case 'Sensitive':
      promptSensitivity = 25;
      break;
    case 'Confidential':
      promptSensitivity = 15;
      break;
    case 'Personal':
      promptSensitivity = 8;
      break;
    case 'Public':
    default:
      promptSensitivity = 2;
      break;
  }

  // 2. Foreign Provider Exposure (0-15)
  // Local Sovereign mode has zero foreign exposure
  let foreignExposure = 0;
  if (provider.id !== 'local') {
    foreignExposure = 15;
  }

  // 3. Subprocessor Visibility (0-15)
  // Calculated based on inverse of subprocessor transparency (out of 10)
  // transparency 10 -> subprocessorRisk 0; transparency 0 -> subprocessorRisk 15
  const subprocessorVisibility = Math.round((10 - provider.subprocessorTransparency) * 1.5);

  // 4. Data Residency Clarity (0-10)
  // inverse of dataResidencyClarity
  const dataResidencyAmbiguity = Math.round(10 - provider.dataResidencyClarity);

  // 5. Retention/Training Ambiguity (0-10)
  // inverse of trainingDefaultClarity
  const trainingAmbiguity = Math.round(10 - provider.trainingDefaultClarity);

  // 6. Human Review Possibility (0-5)
  let humanReviewRisk = 0;
  if (provider.id === 'openai') {
    humanReviewRisk = 5; // OpenAI flags for human review
  } else if (provider.id === 'gemini') {
    humanReviewRisk = 3; // Vertex is ZDR, public Gemini has human review sampling
  } else if (provider.id === 'claude') {
    humanReviewRisk = 2; // AWS / Anthropic trust center review
  }

  // 7. Redaction Penalty (0-10)
  // If prompt has PII entities but is NOT redacted, add 10 risk points
  const redactionPenalty = hasEntities && !isRedacted ? 10 : 0;

  // Sum up base risk
  let rawScore =
    promptSensitivity +
    foreignExposure +
    subprocessorVisibility +
    dataResidencyAmbiguity +
    trainingAmbiguity +
    humanReviewRisk +
    redactionPenalty;

  // Guarantee boundaries 0-100
  const score = Math.max(0, Math.min(100, rawScore));

  // Determine Rating
  let rating: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  let color = 'text-emerald-400';
  let glowColor = 'rgba(16, 185, 129, 0.4)'; // Cyber Emerald

  if (score > 75) {
    rating = 'Critical';
    color = 'text-red-500';
    glowColor = 'rgba(239, 68, 68, 0.5)';
  } else if (score > 50) {
    rating = 'High';
    color = 'text-orange-500';
    glowColor = 'rgba(249, 115, 22, 0.5)';
  } else if (score > 25) {
    rating = 'Medium';
    color = 'text-amber-400';
    glowColor = 'rgba(251, 191, 36, 0.4)';
  }

  return {
    score,
    breakdown: {
      promptSensitivity,
      foreignExposure,
      subprocessorVisibility,
      dataResidencyAmbiguity,
      trainingAmbiguity,
      humanReviewRisk,
      redactionPenalty,
    },
    rating,
    color,
    glowColor,
  };
}
