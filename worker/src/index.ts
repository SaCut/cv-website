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
]

/** Use a bigger model for sprite generation (better spatial reasoning). */
const SPRITE_MODEL = 'openai/gpt-4o'

/** New GitHub Models API (the Azure endpoint was sunset Oct 2025). */
const API_BASE = 'https://models.github.ai/inference'

/** Per-model timeout in ms. Split budget between two calls. */
const MODEL_TIMEOUT_MS = 28_000

const SPRITE_PROMPT = `You are a pixel artist. Draw a 32×32 side-view sprite facing right.

Think step by step before drawing:
1. What 3 features make this creature recognisable? (e.g. dragon → horns, bat-wings, scaly tail)
2. Plan the silhouette row by row:
   - Where is the head? (rows 2-8) What shape? How big?
   - Where are distinctive parts? (wings row 6-14, tail row 18-28, etc.)
   - Where are legs? (rows 22-27)
3. Now draw the grid to match your plan.

Your thinking text will be ignored — only the JSON matters.

JSON format (put it after your reasoning):
{
  "legend": { "A": "#hex", "B": "#hex", "C": "#hex", "D": "#hex", "E": "#hex" },
  "rows": [ 32 strings, each exactly 32 chars ],
  "primaryColour": "#hex"
}

"." = transparent. Letters A-E = legend keys.

LEGEND — pick 5 colours the creature actually needs:
  • Choose colours appropriate for the specific creature
  • Every colour you define MUST appear at least 10 times in the grid
  • Include at least one dark (#111-#444) for outlines/pupils
  • Include at least one light (#CCC-#FFF) for eyes/highlights
  • Use all 5 colours meaningfully — do NOT define a colour you won't use

RULES:
- SIDE VIEW facing right — shape must be ASYMMETRIC, not a diamond or column
- 22-28 pixels tall, vertically centred
- HEAD should be visible and distinct from body (narrower neck, ears/horns above)
- BODY is the widest zone
- LEGS or base visible below body
- Eyes: at least 2×2 bright area with 1×1 dark pupil
- At least 3 colours inside the body — no mono-fill`

const ANIMATION_PROMPT = `You are a pixel animator. Given a 32×32 static sprite (side view, facing right), create 3 animation frames showing subtle idle motion.

Rules:
- Output 3 frames using the SAME legend (same letter→colour mapping)
- Each frame: exactly 32 rows × 32 chars
- Frame 1: slight movement (tail flick, ear twitch — shift 1-2 px)
- Frame 2: peak movement (shift 2-3 px)
- Frame 3: returning toward rest
- Only move a small part (tail, limbs, wings). Keep head and body stable.
- Do NOT redesign — keep the same overall silhouette.

{
  "legend": { ...same as input... },
  "frames": [
    [ ...32 rows of 32 chars... ],
    [ ...32 rows of 32 chars... ],
    [ ...32 rows of 32 chars... ]
  ]
}

Output ONLY the JSON.`

/**
 * Call LLM with given system prompt and user message.
 * Retries once on 429 rate-limit after a short backoff.
 */
async function callLLM(
  systemPrompt: string,
  userMessage: string,
  token: string,
  modelOverride?: string,
): Promise<{ parsed: any; model: string } | null> {
  const models = modelOverride ? [modelOverride, ...MODEL_QUEUE] : MODEL_QUEUE
  const maxAttempts = 2  // 1 initial + 1 retry

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      // Back off before retry
      console.log(`Retrying after backoff (attempt ${attempt + 1})...`)
      await new Promise(r => setTimeout(r, 3000))
    }

    for (let i = 0; i < models.length; i++) {
      const model = models[i]
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
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
            model,
            temperature: 0.4,
            max_tokens: 4096,
          }),
        })

        clearTimeout(timer)

        if (res.status === 429) {
          const body = await res.text().catch(() => '')
          console.warn(`Model ${model} rate limited (429): ${body.slice(0, 200)}`)
          break  // break inner loop to trigger retry with backoff
        }

        if (!res.ok) {
          const body = await res.text().catch(() => '')
          console.warn(`Model ${model} returned ${res.status}: ${body.slice(0, 300)}`)
          continue
        }

        const data = (await res.json()) as {
          choices: Array<{ message: { content: string } }>
        }
        const raw = data.choices[0]?.message?.content || ''
        console.log(`Model ${model}: got ${raw.length} chars of content`)

        const jsonMatch = raw.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          console.warn(`Model ${model}: no JSON in response. Raw start: ${raw.slice(0, 200)}`)
          continue
        }

        const parsed = JSON.parse(jsonMatch[0])
        return { parsed, model }
      } catch (err: any) {
        clearTimeout(timer)
        const msg = err?.message || String(err)
        console.warn(`Model ${model} error: ${msg}`)
        if (controller.signal.aborted) {
          console.warn(`Model ${model}: request was aborted (timeout)`)
          return null  // timeout = no point retrying
        }
        continue
      }
    }
  }
  return null
}

/**
 * Parse character-grid format into colour grid.
 * legend: { "A": "#colour", ... }
 * rows: ["..AAA..", "..ABA..", ...]
 */
function parseCharGrid(
  legend: Record<string, string>,
  rows: string[],
  size = 32,
): (string | null)[][] {
  const frame: (string | null)[][] = []
  for (let y = 0; y < size; y++) {
    const rowStr = rows[y] || ''
    const row: (string | null)[] = []
    for (let x = 0; x < size; x++) {
      const ch = rowStr[x]
      if (ch && ch !== '.' && legend[ch]) {
        row.push(legend[ch])
      } else {
        row.push(null)
      }
    }
    frame.push(row)
  }
  return frame
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS })
    }

    const url = new URL(request.url)

    // ── Endpoint 1: Generate base sprite ──
    if (request.method === 'POST' && url.pathname === '/generate-sprite') {
      try {
        const { prompt } = (await request.json()) as { prompt: string }
        if (!prompt || typeof prompt !== 'string' || prompt.length > 100) {
          return Response.json({ error: 'Bad prompt' }, { status: 400, headers: CORS })
        }

        const result = await callLLM(SPRITE_PROMPT, `Draw: ${prompt}`, env.GITHUB_TOKEN, SPRITE_MODEL)

        if (!result) {
          return Response.json(
            { error: 'Failed to generate sprite', fallback: true },
            { status: 503, headers: CORS },
          )
        }

        const { legend, rows } = result.parsed
        if (!legend || !Array.isArray(rows) || rows.length < 10) {
          return Response.json(
            { error: 'Invalid sprite format', fallback: true },
            { status: 503, headers: CORS },
          )
        }

        // Normalise to exactly 32 rows of 32 chars
        const normalised: string[] = []
        for (let i = 0; i < 32; i++) {
          const r = (rows[i] || '').slice(0, 32)
          normalised.push(r.padEnd(32, '.'))
        }

        const baseFrame = parseCharGrid(legend, normalised)

        return Response.json(
          {
            frame: baseFrame,
            legend,
            spriteRows: normalised,
            primaryColour: result.parsed.primaryColour || result.parsed.primaryColor || '#00d4ff',
            model: result.model,
          },
          { headers: { ...CORS, 'Content-Type': 'application/json' } },
        )
      } catch (err) {
        console.error('Sprite generation error:', err)
        return Response.json(
          { error: 'Internal error', fallback: true },
          { status: 500, headers: CORS },
        )
      }
    }

    // ── Endpoint 2: Animate sprite ──
    if (request.method === 'POST' && url.pathname === '/animate-sprite') {
      try {
        const { legend, spriteRows } = (await request.json()) as {
          legend: Record<string, string>
          spriteRows: string[]
        }
        if (!legend || !Array.isArray(spriteRows) || spriteRows.length < 10) {
          return Response.json({ error: 'Bad sprite data' }, { status: 400, headers: CORS })
        }

        const legendStr = JSON.stringify(legend)
        const rowsStr = spriteRows.map(r => `"${r}"`).join(',\n    ')
        const userMessage = `Base sprite:\n{\n  "legend": ${legendStr},\n  "rows": [\n    ${rowsStr}\n  ]\n}\n\nGenerate 3 animation frames.`

        const result = await callLLM(ANIMATION_PROMPT, userMessage, env.GITHUB_TOKEN)

        if (!result) {
          console.warn('Animation: LLM returned null (all models failed)')
          return Response.json(
            { error: 'Failed to animate sprite', fallback: true },
            { status: 503, headers: CORS },
          )
        }

        const parsedFrames = result.parsed.frames
        if (!Array.isArray(parsedFrames)) {
          console.warn(`Animation: 'frames' is not an array. Keys: ${Object.keys(result.parsed)}`)
          return Response.json(
            { error: 'Failed to animate sprite', fallback: true },
            { status: 503, headers: CORS },
          )
        }
        if (parsedFrames.length < 3) {
          console.warn(`Animation: only ${parsedFrames.length} frames returned (need 3)`)
          return Response.json(
            { error: 'Failed to animate sprite', fallback: true },
            { status: 503, headers: CORS },
          )
        }

        // Use legend from response if provided, otherwise fall back to input legend
        const animLegend = result.parsed.legend || legend
        const animFrames = parsedFrames.slice(0, 3).map(
          (frameRows: string[]) => {
            // Normalise each frame to 32×32
            const norm: string[] = []
            for (let i = 0; i < 32; i++) {
              const r = (frameRows[i] || '').slice(0, 32)
              norm.push(r.padEnd(32, '.'))
            }
            return parseCharGrid(animLegend, norm)
          },
        )

        return Response.json(
          {
            frames: animFrames,
            model: result.model,
          },
          { headers: { ...CORS, 'Content-Type': 'application/json' } },
        )
      } catch (err) {
        console.error('Animation error:', err)
        return Response.json(
          { error: 'Internal error', fallback: true },
          { status: 500, headers: CORS },
        )
      }
    }

    return new Response('Not found', { status: 404, headers: CORS })
  },
}
