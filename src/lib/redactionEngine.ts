export interface DetectedEntity {
  type: string;
  match: string;
  token: string;
}

export type SensitivityLevel = 'Public' | 'Personal' | 'Confidential' | 'Sensitive' | 'Critical';

interface RedactionRule {
  type: string;
  pattern: RegExp;
  token: string;
}

const REDACTION_RULES: RedactionRule[] = [
  {
    type: 'EMAIL',
    pattern: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
    token: '[EMAIL]',
  },
  {
    type: 'PHONE',
    pattern: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // Handles standard 10 digit and international formats
    token: '[PHONE]',
  },
  {
    type: 'GOV_ID',
    pattern: /\b\d{4}\s?\d{4}\s?\d{4}\b/g, // Aadhaar (12 digits with spaces)
    token: '[GOV_ID]',
  },
  {
    type: 'GOV_ID',
    pattern: /\b[A-Z]{5}\d{4}[A-Z]\b/g, // PAN Card (India)
    token: '[GOV_ID]',
  },
  {
    type: 'HEALTH_DATA',
    pattern: /\b(?:diabetes|cancer|tumor|chemotherapy|diagnosis|cardiologist|hospital file|medical report|prescription|hiv|illness|syndrome|patient history)\b/gi,
    token: '[HEALTH_DATA]',
  },
  {
    type: 'FINANCIAL',
    pattern: /\b(?:credit card|bank account|routing number|balance sheet|profit margin|revenue growth|cash flow|salary|invoice #|wire transfer|financial ledger)\b/gi,
    token: '[FINANCIAL_DATA]',
  },
  {
    type: 'BUSINESS_CONFIDENTIAL',
    pattern: /\b(?:confidential|proprietary|source code|api key|internal roadmap|merger plan|acquisition deal|nda|password|credential|intellectual property|patent draft)\b/gi,
    token: '[CONFIDENTIAL_BUSINESS_DATA]',
  },
];

// Simple heuristic for names/persons: Capitalized words followed by key structures, 
// or common demo patterns. In an MVP, we combine these rules.
const NAME_PATTERNS = [
  /\b(?:Anish|Aarav|Vihaan|Aditya|Siddharth|Rahul|Priya|Ananya|Karan|Neha|Amit|Jha)\b/g,
  /\b(?:Mr\.|Ms\.|Mrs\.|Dr\.)\s+([A-Z][a-z]+)\b/g,
];

export function scanAndRedact(prompt: string): {
  redactedPrompt: string;
  detectedEntities: DetectedEntity[];
  detectedTypes: string[];
  sensitivityLevel: SensitivityLevel;
} {
  let redacted = prompt;
  const detectedEntities: DetectedEntity[] = [];

  // 1. Run core redaction rules
  for (const rule of REDACTION_RULES) {
    let match;
    // reset regex lastIndex
    rule.pattern.lastIndex = 0;
    
    // We run replacement and extract matches
    const matches = prompt.match(rule.pattern);
    if (matches) {
      for (const m of matches) {
        if (!detectedEntities.some(e => e.match === m)) {
          detectedEntities.push({
            type: rule.type,
            match: m,
            token: rule.token,
          });
        }
      }
      redacted = redacted.replace(rule.pattern, rule.token);
    }
  }

  // 2. Scan for names
  for (const pattern of NAME_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = prompt.match(pattern);
    if (matches) {
      for (const m of matches) {
        // Strip titles from Mr. Rahul etc.
        const cleanedMatch = m.replace(/^(?:Mr\.|Ms\.|Mrs\.|Dr\.)\s+/, '');
        if (!detectedEntities.some(e => e.match === cleanedMatch)) {
          detectedEntities.push({
            type: 'PERSONAL',
            match: cleanedMatch,
            token: '[PERSON]',
          });
        }
        redacted = redacted.replace(m, '[PERSON]');
      }
    }
  }

  // 3. Deduplicate entity list
  const uniqueEntities = detectedEntities.filter(
    (e, index, self) => self.findIndex(t => t.match === e.match) === index
  );

  // 4. Determine sensitivity levels
  const types = uniqueEntities.map(e => e.type);
  const uniqueTypes = Array.from(new Set(types));

  let sensitivityLevel: SensitivityLevel = 'Public';

  if (uniqueTypes.includes('BUSINESS_CONFIDENTIAL') || uniqueTypes.includes('GOV_ID')) {
    sensitivityLevel = 'Critical';
  } else if (uniqueTypes.includes('HEALTH_DATA') || uniqueTypes.includes('FINANCIAL')) {
    sensitivityLevel = 'Sensitive';
  } else if (uniqueTypes.includes('PERSONAL') || uniqueTypes.includes('PHONE') || uniqueTypes.includes('EMAIL')) {
    sensitivityLevel = 'Confidential';
  } else if (prompt.trim().length > 0) {
    sensitivityLevel = 'Personal';
  }

  return {
    redactedPrompt: redacted,
    detectedEntities: uniqueEntities,
    detectedTypes: uniqueTypes,
    sensitivityLevel,
  };
}
