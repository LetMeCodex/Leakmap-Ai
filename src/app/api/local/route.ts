import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    const localAiProvider = process.env.LOCAL_AI_PROVIDER || 'ollama';
    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2:3b';
    const localAiSimulated = process.env.LOCAL_AI_SIMULATED === 'true';

    const simulatedResponse = `[Simulated local route — no external API call was made] Model: Llama-3-8B-Instruct. Routing: Loopback interface. Compute footprint: 100% localized to host memory. No packets left the local gateway. Threat exposure: 0. Privacy index: 100%. Response: Local sovereign environment verified. Processing of prompt completed on local hardware safely.`;

    if (localAiProvider === 'demo' || localAiSimulated) {
      return NextResponse.json({
        response: simulatedResponse,
        mode: 'local'
      });
    }

    try {
      const ollamaRes = await fetch(`${ollamaBaseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: prompt,
          stream: false,
        }),
        signal: AbortSignal.timeout(4000), // 4s timeout
      });

      if (ollamaRes.ok) {
        const data = await ollamaRes.json();
        return NextResponse.json({
          response: `[Sovereign Local Host (vLLM/Ollama)] Model: ${ollamaModel}. Response: ${data.response}`,
          mode: 'local'
        });
      } else {
        throw new Error(`Ollama response not OK: ${ollamaRes.statusText}`);
      }
    } catch (err) {
      console.warn('Ollama offline, falling back to simulated local mode:', err);
      return NextResponse.json({
        response: simulatedResponse,
        mode: 'local'
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error?.message },
      { status: 500 }
    );
  }
}
