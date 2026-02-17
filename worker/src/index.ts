/**
 * Cloudflare Worker — proxies creature generation requests to Hugging Face.
 *
 * Deploy:
 *   cd worker && npm i && wrangler secret put HF_TOKEN && npm run deploy
 *
 * Then set VITE_API_URL in the frontend .env to the worker URL.
 */

interface Env {
  HF_TOKEN: string
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const SYSTEM_PROMPT = `You are a voxel art generator. Given a creature or object name, output ONLY valid JSON (no markdown, no explanation) representing it as voxels in a 16x16x16 grid.

Format:
{
  "voxels": [{"x":0,"y":0,"z":0,"color":"#hexhex"}, ...],
  "primaryColor": "#hexhex",
  "scale": 0.7
}

Rules:
- Max 150 voxels
- Coordinates 0-15 for x, y, z
- y=0 is ground level
- Use realistic colors
- Make it recognisable but simple
- Be creative with the shape`

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS })
    }

    const url = new URL(request.url)
    if (request.method !== 'POST' || url.pathname !== '/generate') {
      return new Response('Not found', { status: 404, headers: CORS })
    }

    try {
      const { prompt } = (await request.json()) as { prompt: string }
      if (!prompt || typeof prompt !== 'string' || prompt.length > 100) {
        return Response.json({ error: 'Bad prompt' }, { status: 400, headers: CORS })
      }

      const hfResponse = await fetch(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: `<s>[INST] ${SYSTEM_PROMPT}\n\nGenerate: ${prompt} [/INST]`,
            parameters: {
              max_new_tokens: 2000,
              temperature: 0.7,
              return_full_text: false,
            },
          }),
        },
      )

      if (!hfResponse.ok) {
        const errText = await hfResponse.text()
        console.error('HF error:', errText)
        return Response.json({ error: 'LLM unavailable' }, { status: 502, headers: CORS })
      }

      const hfData = (await hfResponse.json()) as Array<{ generated_text: string }>
      const raw = hfData[0]?.generated_text || ''

      // Extract JSON from response (LLM might wrap it in text)
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return Response.json({ error: 'Bad LLM output' }, { status: 502, headers: CORS })
      }

      const parsed = JSON.parse(jsonMatch[0])

      // Basic validation
      if (!Array.isArray(parsed.voxels) || parsed.voxels.length === 0) {
        return Response.json({ error: 'No voxels generated' }, { status: 502, headers: CORS })
      }

      // Sanitise: keep only valid voxels
      const voxels = parsed.voxels
        .filter((v: any) =>
          typeof v.x === 'number' && typeof v.y === 'number' && typeof v.z === 'number' &&
          typeof v.color === 'string' && v.x >= 0 && v.x <= 15 && v.y >= 0 && v.y <= 15 && v.z >= 0 && v.z <= 15
        )
        .slice(0, 150)

      return Response.json(
        {
          voxels,
          primaryColor: parsed.primaryColor || '#00d4ff',
          scale: parsed.scale || 0.7,
        },
        { headers: { ...CORS, 'Content-Type': 'application/json' } },
      )
    } catch (err) {
      console.error('Worker error:', err)
      return Response.json({ error: 'Internal error' }, { status: 500, headers: CORS })
    }
  },
}
