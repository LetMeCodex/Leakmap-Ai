import { NextResponse } from 'next/server';
import { z } from 'zod';
import { scanAndRedact } from '../../../lib/redactionEngine';

const redactSchema = z.object({
  prompt: z.string().min(1, 'Prompt content is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = redactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }

    const { prompt } = result.data;
    const redactedData = scanAndRedact(prompt);

    return NextResponse.json(redactedData);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error?.message },
      { status: 500 }
    );
  }
}
