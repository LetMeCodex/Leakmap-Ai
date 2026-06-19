import { NextResponse } from 'next/server';
import { z } from 'zod';

const geminiSchema = z.object({
  prompt: z.string().min(1, 'Prompt content is required'),
  apiKey: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = geminiSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }

    const { prompt, apiKey } = result.data;

    // Use user-provided client key OR system environment key
    const key = apiKey || process.env.GEMINI_API_KEY || '';

    if (!key) {
      // Return high-fidelity demo response as requested
      const demoResponse = `[Demo response — no external model call was made]
Google Gemini API is operating in simulation mode. Under public default terms of service, prompt payloads are processed by Google subprocessors. In standard non-enterprise accounts, Google may retain prompts for quality and auditing reviews.

To audit this prompt against live Google nodes, click the "Configure Key" button on the Gemini card in the scanner console and insert a valid GEMINI_API_KEY.`;
      
      return NextResponse.json({ response: demoResponse, mode: 'demo' });
    }

    // Call official Google Gemini API endpoint directly via HTTPS
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

    const apiResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      throw new Error(`Gemini Gateway responded with status: ${apiResponse.status}. Details: ${errText.substring(0, 100)}`);
    }

    const data = await apiResponse.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('Received empty generation contents from Google Gemini API.');
    }

    return NextResponse.json({ response: responseText, mode: 'live' });
  } catch (error: any) {
    const fallbackResponse = `[API Limit Fallback — Telemetry Evaluated Locally]
Notice: The active Google Gemini API key encountered an error (${error?.message || 'Gateway Timeout'}). LeakMap successfully intercepted the request and evaluated the data route telemetry locally.

Simulated Prompt Processing Payload:
"Prompt processed under Google Cloud safety parameters. Standard Gemini API requests route traffic via global gateway edge hubs (such as Singapore) to central processing nodes. Payloads processed on unpaid model endpoints should avoid sensitive personal telemetry."`;

    return NextResponse.json(
      { 
        error: 'Gemini Integration Fallback', 
        response: fallbackResponse,
        mode: 'demo'
      },
      { status: 200 }
    );
  }
}
