/**
 * Cloudflare Worker — proxies creature generation requests to GitHub Models.
 * Tries models from a static priority list with per-call timeouts.
 *
 * Deploy:
 *   cd worker && npm i && npm run deploy
 *
 * Set GITHUB_TOKEN as a secret in the Cloudflare dashboard.
 */

interface Env {
  GITHUB_TOKEN: string
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

/**
 * Models to try, in order of preference.
 * Uses {publisher}/{model_name} format required by the new GitHub Models API.
 * Static list — avoids the /models discovery call.
 */
const MODEL_QUEUE = [
  'openai/gpt-4o-mini',
  'mistralai/Mistral-Nemo',
  'meta/Meta-Llama-3.1-8B-Instruct',
]

/** New GitHub Models API (the Azure endpoint was sunset Oct 2025). */
const API_BASE = 'https://models.github.ai/inference'

/** Per-model timeout in ms. Workers have 30 s wall-clock; leave room for ≥2 attempts. */
const MODEL_TIMEOUT_MS = 22_000

const SYSTEM_PROMPT = `You are an expert pixel artist. Given a subject, create a recognisable 20×20 animated sprite.

CRITICAL: YOU MUST CREATE 6 DIFFERENT FRAMES WITH VISIBLE ANIMATION. DO NOT REPEAT THE SAME FRAME.

Format (palette-indexed to save tokens):

{
  "palette": ["#colour0", "#colour1", ...up to 10 colours],
  "frames": [
    ["..1122..............", "..1331..............", ...20 strings of 20 chars],
    ...6 DIFFERENT frames
  ],
  "primaryColour": "#hexhex"
}

Each frame: 20 strings of 20 chars. Each char: digit 0-9 (palette index) or "." (transparent).

ANIMATION IS MANDATORY - each frame must show the subject in a DIFFERENT POSITION OR POSE:
- Frame 1: neutral stance
- Frame 2: start moving (shift weight, lean, eyes blink)
- Frame 3: mid-motion (arms/legs/body clearly displaced from frame 1)
- Frame 4: maximum motion (furthest from neutral)
- Frame 5: returning (different from all previous frames)
- Frame 6: almost back to neutral (transitions to frame 1)

Example animations:
- Cactus: slight sway left → lean further left → return centre → lean right → lean further right → return centre
- Character: idle → lean forward → step forward → peak of step → pull back leg → settle back
- Animal: sit → ears perk → start standing → fully standing → lowering → sitting again

REQUIREMENTS:
- Create a CLEAR, RECOGNISABLE shape (not just a rectangle)
- Use realistic colours appropriate to the subject
- Centre subject with 2-4 pixel border
- Make defining features obvious (eyes, limbs, spines, etc.)
- Show volume with shading
- Think classic SNES/Game Boy pixel art

Verify: Are all 6 frames visibly different? If not, revise them.

Output ONLY the JSON.`

/**
 * Try each model in the queue until one returns valid pixel frames.
 * Each call gets its own AbortController timeout so a hanging model
 * doesn't eat the entire Worker budget.
 */
async function tryGenerate(
  prompt: string,
  token: string,
): Promise<{ parsed: any; model: string; fallbackModel: boolean } | null> {
  for (let i = 0; i < MODEL_QUEUE.length; i++) {
    const model = MODEL_QUEUE[i]
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS)

    try {
      const res = await fetch(`${API_BASE}/chat/completions`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Generate: ${prompt}` },
          ],
          model,
          temperature: 0.7,
          max_tokens: 4096,
        }),
      })

      clearTimeout(timer)

      if (!res.ok) {
        console.warn(`Model ${model} returned ${res.status}, trying next…`)
        continue
      }

      const data = (await res.json()) as {
        choices: Array<{ message: { content: string } }>
      }
      const raw = data.choices[0]?.message?.content || ''

      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.warn(`Model ${model}: no JSON in response, trying next…`)
        continue
      }

      const parsed = JSON.parse(jsonMatch[0])

      // Accept both palette-indexed format (new) and legacy direct-colour format
      if (Array.isArray(parsed.palette) && Array.isArray(parsed.frames) && parsed.frames.length > 0) {
        return { parsed, model, fallbackModel: i > 0 }
      }
      // Legacy: frames as arrays of arrays of colour strings
      if (Array.isArray(parsed.frames) && parsed.frames.length > 0 && Array.isArray(parsed.frames[0])) {
        return { parsed, model, fallbackModel: i > 0 }
      }

      console.warn(`Model ${model}: invalid format in response, trying next…`)
      continue
    } catch (err) {
      clearTimeout(timer)
      console.warn(`Model ${model} error:`, err)
      // If first model timed out, we probably don't have budget for another
      if (controller.signal.aborted) break
      continue
    }
  }
  return null
}

/**
 * Expand palette-indexed frames into full colour grids.
 * Handles both palette-indexed (string rows with digit indices)
 * and legacy (arrays of colour strings) formats.
 */
function expandFrames(parsed: any): (string | null)[][][] {
  const palette: string[] = Array.isArray(parsed.palette) ? parsed.palette : []
  const rawFrames: any[] = Array.isArray(parsed.frames) ? parsed.frames.slice(0, 6) : []

  const frames = rawFrames.map((frame: any) => {
    if (!Array.isArray(frame)) return emptyFrame()

    // Palette-indexed: frame is string[]
    if (typeof frame[0] === 'string' && palette.length > 0) {
      return frame.slice(0, 20).map((rowStr: string) => {
        const row: (string | null)[] = []
        for (let c = 0; c < 20; c++) {
          const ch = rowStr[c]
          if (ch && ch !== '.') {
            const idx = parseInt(ch, 10)
            row.push(!isNaN(idx) && idx < palette.length ? palette[idx] : null)
          } else {
            row.push(null)
          }
        }
        while (row.length < 20) row.push(null)
        return row
      })
    }

    // Legacy: frame is (string|null)[][]
    return frame.slice(0, 20).map((row: any[]) => {
      if (!Array.isArray(row)) return Array(20).fill(null)
      const cells = row.slice(0, 20).map((pixel: any) =>
        typeof pixel === 'string' && pixel.startsWith('#') ? pixel : null,
      )
      while (cells.length < 20) cells.push(null)
      return cells
    })
  })

  // Pad rows and frames
  for (const frame of frames) {
    while (frame.length < 20) frame.push(Array(20).fill(null))
  }
  while (frames.length < 1) frames.push(emptyFrame())

  return frames
}

function emptyFrame(): (string | null)[][] {
  return Array.from({ length: 20 }, () => Array(20).fill(null))
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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

      const result = await tryGenerate(prompt, env.GITHUB_TOKEN)

      if (!result) {
        return Response.json(
          { error: 'All models exhausted', fallback: true },
          { status: 503, headers: CORS },
        )
      }

      const frames = expandFrames(result.parsed)

      return Response.json(
        {
          frames,
          primaryColour: result.parsed.primaryColour || result.parsed.primaryColor || '#00d4ff',
          model: result.model,
          fallbackModel: result.fallbackModel,
        },
        { headers: { ...CORS, 'Content-Type': 'application/json' } },
      )
    } catch (err) {
      console.error('Worker error:', err)
      return Response.json(
        { error: 'Internal error', fallback: true },
        { status: 500, headers: CORS },
      )
    }
  },
}
