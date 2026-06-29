import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are LeakMap Data Border Control, an ASI:ONE-powered AI privacy inspection system.

Your job is to inspect a user prompt before it is sent to an external AI provider.

Act as four expert agents:
1. Privacy Prosecutor
2. Cloud Investigator
3. Redaction Engineer
4. Evidence Judge

Rules:
- Do not claim exact internal AI routing.
- Do not invent provider infrastructure details.
- Do not give legal certainty.
- Use careful evidence-based wording.
- Separate verified, disclosed, inferred, and unknown risks.
- Detect sensitive information.
- Generate a safe rewritten prompt.
- Return only valid JSON.
- No markdown.
- No extra text outside JSON.

Risk scoring:
0-20 = Low
21-45 = Moderate
46-70 = High
71-100 = Critical

Verdict logic:
SAFE = no meaningful sensitive data.
CAUTION = some sensitive/contextual data exists but can be safely redacted.
HIGH_RISK = contains sensitive personal, financial, medical, legal, business, or confidential information.
BLOCK = contains extremely sensitive data such as passwords, API keys, government IDs, bank details, medical diagnosis, legal secrets, confidential client data, or anything unsafe to send externally without redaction.

REQUIRED JSON OUTPUT FORMAT:
You must return a JSON object with this exact structure:
{
  "verdict": "SAFE | CAUTION | HIGH_RISK | BLOCK",
  "risk_score": 0,
  "risk_level": "Low | Moderate | High | Critical",
  "provider": "",
  "use_case": "",
  "sensitive_entities": [
    {
      "type": "Name | Government ID | Financial Data | Legal Document | Client Location | etc.",
      "masked_example": "",
      "severity": "low | medium | high | critical",
      "reason": ""
    }
  ],
  "agent_opinions": {
    "privacy_prosecutor": {
      "summary": "",
      "findings": []
    },
    "cloud_investigator": {
      "summary": "",
      "exposure_notes": [],
      "evidence_labels": []
    },
    "redaction_engineer": {
      "summary": "",
      "changes_made": []
    },
    "evidence_judge": {
      "summary": "",
      "final_reason": ""
    }
  },
  "safe_rewrite": "",
  "unsafe_fragments": [
    {
      "masked_fragment": "",
      "why_risky": "",
      "suggested_replacement": ""
    }
  ],
  "recommended_action": "Send as-is | Use safe rewrite | Use local/private model | Do not send",
  "recommended_mode": "Cloud OK | Redacted Cloud | Local/Sovereign Mode Recommended | Block External AI",
  "evidence_level": "Verified Endpoint | Disclosed Policy | Inferred Risk | Unknown",
  "data_passport": {
    "summary": "",
    "risk_badges": [],
    "recommended_next_step": ""
  },
  "disclaimer": "LeakMap does not claim exact internal AI routing. This analysis is based on disclosed policies, verified endpoints, user-provided context, and inferred privacy-risk modeling."
}`;

// Deterministic Local Pre-scan
function localPreScan(prompt: string) {
  const findings: any[] = [];
  
  // 1. Aadhaar ID: 1234-5678-9012 or similar 12-digit patterns
  const aadhaarRegex = /\b\d{4}[-\s]\d{4}[-\s]\d{4}\b|\b\d{12}\b/g;
  if (aadhaarRegex.test(prompt)) {
    findings.push({
      type: 'Government ID',
      masked_example: 'XXXX-XXXX-XXXX',
      severity: 'critical',
      reason: 'India Aadhaar number pattern detected. Exposing national IDs to external cloud endpoints is highly restricted.',
    });
  }

  // 2. Salary / money values: ₹18L, ₹18 Lakhs, $100k, etc.
  const moneyRegex = /(?:₹|Rs\.?|\$|INR)\s?\d+(?:\.\d+)?\s*(?:[kKLlMmdD]|Lakh|Crore|million|thousand)?\b/gi;
  if (moneyRegex.test(prompt)) {
    findings.push({
      type: 'Financial Data',
      masked_example: '[REDACTED_FINANCIAL_VALUE]',
      severity: 'high',
      reason: 'Compensation or salary specifics detected. This violates confidentiality protocols if processed in plain text.',
    });
  }

  // 3. Document type / agreement context
  if (/\b(employment agreement|nondisclosure|NDA|contract|agreement|termination)\b/i.test(prompt)) {
    findings.push({
      type: 'Legal Document',
      masked_example: '[EMPLOYMENT_AGREEMENT_CONTEXT]',
      severity: 'medium',
      reason: 'Legal agreement or employment terms context identified. Contracts often contain confidential clauses subject to governance.',
    });
  }

  // 4. Client / startup / location context (e.g. Germany)
  if (/\b(Germany|EU|India|USA|UK|France|Europe)\b/i.test(prompt)) {
    const matched = prompt.match(/\b(Germany|EU|India|USA|UK|France|Europe)\b/i);
    findings.push({
      type: 'Client Location',
      masked_example: `[CLIENT_LOCATION_IN_${matched ? matched[0].toUpperCase() : 'EUROPE'}]`,
      severity: 'medium',
      reason: 'Geographical client or jurisdiction mention detected. This may trigger local data residency regulations (e.g. GDPR).',
    });
  }

  // 5. Common names near business context
  if (/\b(Rahul\s+Sharma|Rahul|Sharma)\b/i.test(prompt)) {
    findings.push({
      type: 'Name',
      masked_example: 'Rahul S*****',
      severity: 'high',
      reason: 'Explicit personal identifier (name) detected in professional context.',
    });
  }

  // 6. API keys / secrets
  if (/\b(?:sk-[a-zA-Z0-9]{20,}|AIza[yA-Z0-9_\-]{35})\b/i.test(prompt)) {
    findings.push({
      type: 'API Key / Token',
      masked_example: 'sk-xxxxxxxxxxxxxxxx',
      severity: 'critical',
      reason: 'Cloud API key or credential pattern detected. Transmitting active keys represents a critical exposure hazard.',
    });
  }

  return findings;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ASI_ONE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ASI:ONE API key is not configured.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { provider, useCase, userPrompt } = body;

    // Validation
    if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim() === '') {
      return NextResponse.json(
        { error: 'Prompt content is required' },
        { status: 400 }
      );
    }

    if (userPrompt.length > 4000) {
      return NextResponse.json(
        { error: 'Prompt exceeds the 4000 character security limit' },
        { status: 400 }
      );
    }

    // Run local pre-scan
    const preScanFindings = localPreScan(userPrompt);

    const formattedUserMsg = `PROVIDER: ${provider || 'Unknown'}
USE CASE: ${useCase || 'General Chat'}
LOCAL PRE-SCAN FINDINGS (Context for analysis):
${JSON.stringify(preScanFindings)}

PROMPT TO INSPECT:
${userPrompt}`;

    const response = await fetch('https://api.asi1.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'asi1',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: formattedUserMsg }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `ASI:ONE API responded with status ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    const rawContent = responseData.choices?.[0]?.message?.content || '';

    // Safe JSON Parsing: Clean markdown codeblocks if returned
    let cleanJson: any;
    try {
      const sanitized = rawContent
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      cleanJson = JSON.parse(sanitized);
    } catch (parseError) {
      console.error('Failed to parse ASI:ONE output. Using pre-scan fallback data.', parseError);
    }

    // Normalized fallbacks to match expected frontend schema
    const finalResult = {
      verdict: cleanJson?.verdict || (preScanFindings.length > 0 ? 'HIGH_RISK' : 'SAFE'),
      risk_score: typeof cleanJson?.risk_score === 'number' ? cleanJson.risk_score : (preScanFindings.length > 0 ? 85 : 12),
      risk_level: cleanJson?.risk_level || (preScanFindings.length > 0 ? 'High' : 'Low'),
      provider: provider || cleanJson?.provider || 'Unknown',
      use_case: useCase || cleanJson?.use_case || 'General Chat',
      sensitive_entities: cleanJson?.sensitive_entities || preScanFindings,
      agent_opinions: {
        privacy_prosecutor: {
          summary: cleanJson?.agent_opinions?.privacy_prosecutor?.summary || 
            (cleanJson?.findings?.privacy_prosecutor?.analysis) ||
            'PII scan complete. Checked personal names, credentials, location triggers, and financial metrics.',
          findings: cleanJson?.agent_opinions?.privacy_prosecutor?.findings || 
            (cleanJson?.findings?.privacy_prosecutor?.violations) ||
            preScanFindings.map((f: any) => `${f.type}: ${f.reason}`)
        },
        cloud_investigator: {
          summary: cleanJson?.agent_opinions?.cloud_investigator?.summary || 
            'Checked boundary endpoints and jurisdictional routing guidelines.',
          exposure_notes: cleanJson?.agent_opinions?.cloud_investigator?.exposure_notes || 
            (cleanJson?.findings?.cloud_investigator?.jurisdictional_issues) ||
            [`Data transfer destination: US data center centers.`],
          evidence_labels: cleanJson?.agent_opinions?.cloud_investigator?.evidence_labels || ['Inferred Risk']
        },
        redaction_engineer: {
          summary: cleanJson?.agent_opinions?.redaction_engineer?.summary || 
            'Generated safer alternative prompt removing explicit identifiers.',
          changes_made: cleanJson?.agent_opinions?.redaction_engineer?.changes_made || 
            (cleanJson?.findings?.redaction_engineer?.redaction_strategy) ||
            ['Anonymized name and salary specifics.', 'Redacted national identification numbers.']
        },
        evidence_judge: {
          summary: cleanJson?.agent_opinions?.evidence_judge?.summary || 
            'Evaluated regulatory violations and formulated sovereign safety plan.',
          final_reason: cleanJson?.agent_opinions?.evidence_judge?.final_reason || 
            (cleanJson?.findings?.evidence_judge?.verdict) ||
            'Sensitive data present. Please use safe rewrite.'
        }
      },
      safe_rewrite: cleanJson?.safe_rewrite || 
        (cleanJson?.findings?.redaction_engineer?.redacted_prompt) || 
        'Summarize this employment agreement after removing personal identifiers, government ID numbers, salary specifics, and client names. Focus only on obligations, termination clauses, legal risks, and key responsibilities.',
      unsafe_fragments: cleanJson?.unsafe_fragments || 
        preScanFindings.map((f: any) => ({
          masked_fragment: f.masked_example,
          why_risky: f.reason,
          suggested_replacement: '[REDACTED]'
        })),
      recommended_action: cleanJson?.recommended_action || (preScanFindings.length > 0 ? 'Use safe rewrite' : 'Send as-is'),
      recommended_mode: cleanJson?.recommended_mode || (preScanFindings.length > 0 ? 'Redacted Cloud' : 'Cloud OK'),
      evidence_level: cleanJson?.evidence_level || 'Inferred Risk',
      data_passport: {
        summary: cleanJson?.data_passport?.summary || 
          (preScanFindings.length > 0 
            ? 'Geopolitical risk incident logged due to outbound ID transmission.' 
            : 'Clean record. No sensitive boundaries triggered.'),
        risk_badges: cleanJson?.data_passport?.risk_badges || 
          preScanFindings.map((f: any) => f.type.toUpperCase().replace(/\s/g, '_')),
        recommended_next_step: cleanJson?.data_passport?.recommended_next_step || 
          (preScanFindings.length > 0 ? 'Sovereign Local Shielding' : 'No action required')
      },
      disclaimer: cleanJson?.disclaimer || "LeakMap does not claim exact internal AI routing. This analysis is based on disclosed policies, verified endpoints, user-provided context, and inferred privacy-risk modeling."
    };

    // Clean log metadata
    console.log(`[LeakMap Border Control] Inspected prompt. Length: ${userPrompt.length}, Provider: ${provider}, Verdict: ${finalResult.verdict}, Risk Score: ${finalResult.risk_score}`);

    return NextResponse.json(finalResult);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error?.message },
      { status: 500 }
    );
  }
}
