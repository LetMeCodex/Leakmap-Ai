import { NextResponse } from 'next/server';
import { z } from 'zod';
import { scanAndRedact } from '../../../lib/redactionEngine';
import { calculateRisk } from '../../../lib/riskEngine';
import { providerProfiles } from '../../../lib/providerProfiles';

const analyzeSchema = z.object({
  prompt: z.string().min(1, 'Prompt content is required'),
  providerId: z.enum(['gemini', 'openai', 'claude', 'local']),
  isRedacted: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = analyzeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }

    const { prompt, providerId, isRedacted } = result.data;
    const profile = providerProfiles[providerId];

    if (!profile) {
      return NextResponse.json({ error: 'Unknown provider profile' }, { status: 404 });
    }

    const scanData = scanAndRedact(prompt);
    
    const originalRisk = calculateRisk(
      scanData.sensitivityLevel,
      profile,
      false,
      scanData.detectedEntities.length > 0
    );

    const redactedRisk = calculateRisk(
      scanData.sensitivityLevel,
      profile,
      true,
      scanData.detectedEntities.length > 0
    );

    return NextResponse.json({
      originalPrompt: prompt,
      redactedPrompt: scanData.redactedPrompt,
      detectedEntities: scanData.detectedEntities,
      detectedTypes: scanData.detectedTypes,
      sensitivityLevel: scanData.sensitivityLevel,
      originalRisk,
      redactedRisk,
      isRedacted,
      providerId,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error?.message },
      { status: 500 }
    );
  }
}
