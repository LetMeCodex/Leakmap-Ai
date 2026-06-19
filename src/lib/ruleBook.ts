export interface Rule {
  id: string;
  name: string;
  condition: string;
  effect: string;
  severity: "critical" | "high" | "medium" | "methodology" | "safe" | "protective";
  explanation: string;
}

export const rules: Rule[] = [
  {
    id: "R-101",
    name: "Health Data Detected",
    condition: "Prompt contains health-related terms or detected health entity",
    effect: "+25 risk score",
    severity: "critical",
    explanation: "Health data is sensitive and should not be routed to external AI providers without proper data security controls."
  },
  {
    id: "R-102",
    name: "Government ID Detected",
    condition: "Prompt contains Aadhaar-like 12-digit ID or government ID terms",
    effect: "+30 risk score",
    severity: "critical",
    explanation: "National identifiers are subject to strict regulatory laws (like DPDP in India) and carry high leakage risks."
  },
  {
    id: "R-103",
    name: "Phone or Email Detected",
    condition: "Prompt contains phone numbers or email addresses",
    effect: "+10 risk score",
    severity: "medium",
    explanation: "Standard personal contact details should be redacted to prevent user profiling by external systems."
  },
  {
    id: "R-104",
    name: "Business Confidential Data",
    condition: "Prompt contains startup plan, financial forecast, internal strategy, API key, secret, or confidential terms",
    effect: "+20 risk score",
    severity: "high",
    explanation: "Proprietary corporate intelligence or secrets exposed to external LLMs can lead to corporate intellectual property leaks."
  },
  {
    id: "R-105",
    name: "External Provider Exposure",
    condition: "Provider is Gemini, OpenAI, or Claude, and not Local Sovereign Mode",
    effect: "+15 risk score",
    severity: "medium",
    explanation: "Standard API gateways dispatch packets to external networks, exposing prompt contents to foreign jurisdictions."
  },
  {
    id: "R-106",
    name: "Evidence-only Provider Mode",
    condition: "Provider mode is evidence-only and no live API call happened",
    effect: "Do not render verified endpoint route on the map",
    severity: "methodology",
    explanation: "Visual pathways reflect default disclosed routes. Local telemetry is simulated since no direct network handshake is active."
  },
  {
    id: "R-107",
    name: "Missing Evidence Cap",
    condition: "Route segment has no evidenceId or sourceIds linked in policy mapping",
    effect: "Cap confidence at 30% and mark route type as UNKNOWN",
    severity: "methodology",
    explanation: "Ensures the system never publishes visual routing pathways that lack official document verification or logs."
  },
  {
    id: "R-108",
    name: "Local Sovereign Reduction",
    condition: "Local Sovereign Mode is active",
    effect: "Reduce foreign exposure risk score component to 0",
    severity: "safe",
    explanation: "Local hosting routes traffic exclusively through the 127.0.0.1 interface, eliminating external endpoint risks."
  },
  {
    id: "R-109",
    name: "Redaction Applied",
    condition: "Sensitive entities replaced with placeholders",
    effect: "Reduce prompt sensitivity risk score component by 30 to 60 points",
    severity: "protective",
    explanation: "Replacing private entities with neutral variables decreases the privacy leakage footprint prior to network transit."
  },
  {
    id: "R-110",
    name: "Unknown Internal Routing Penalty",
    condition: "Provider is a black-box external model API",
    effect: "Subtract confidence weight from internal route claims; show unknown route segments",
    severity: "methodology",
    explanation: "Proprietary networks operate as a black-box. Internal failovers and GPU scheduling cannot be validated by third parties."
  }
];

export function evaluateRules(
  prompt: string,
  providerId: string,
  isRedacted: boolean,
  detectedEntities: string[] = []
): string[] {
  const triggered: string[] = [];
  const lowerPrompt = prompt.toLowerCase();

  // R-101 Health Data
  const healthTerms = ["diabetes", "medical", "blood", "health", "hospital", "patient", "doctor", "prescription", "disease", "treatment"];
  const hasHealthTerm = healthTerms.some(t => lowerPrompt.includes(t)) || detectedEntities.includes("HEALTH_DATA");
  if (hasHealthTerm) triggered.push("R-101");

  // R-102 Gov ID
  const govTerms = ["aadhaar", "passport", "social security", "ssn", "pan card", "driving license", "government id"];
  const hasAadhaarMatch = /\b\d{4}\s?\d{4}\s?\d{4}\b/.test(prompt); // 12-digit format
  const hasGovTerm = govTerms.some(t => lowerPrompt.includes(t)) || hasAadhaarMatch || detectedEntities.includes("GOV_ID");
  if (hasGovTerm) triggered.push("R-102");

  // R-103 Phone or Email
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(prompt) || detectedEntities.includes("EMAIL");
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(prompt) || detectedEntities.includes("PHONE");
  if (hasEmail || hasPhone) triggered.push("R-103");

  // R-104 Business Confidential
  const confidentialTerms = ["startup plan", "financial forecast", "internal strategy", "api key", "secret", "confidential", "budget", "salary", "acquisition", "merge"];
  const hasConfidentialTerm = confidentialTerms.some(t => lowerPrompt.includes(t)) || detectedEntities.includes("API_KEY") || detectedEntities.includes("SECRET");
  if (hasConfidentialTerm) triggered.push("R-104");

  // R-105 External Provider Exposure
  if (providerId !== "local") {
    triggered.push("R-105");
  }

  // R-108 Local Sovereign Reduction
  if (providerId === "local") {
    triggered.push("R-108");
  }

  // R-109 Redaction Applied
  if (isRedacted) {
    triggered.push("R-109");
  }

  // R-110 Unknown Routing Penalty
  if (providerId !== "local") {
    triggered.push("R-110");
  }

  return triggered;
}
