/**
 * Cloudflare Worker — 5-query pixel art generation pipeline.
 *
 * Q1  Describe  (mini)  — constrained-vocabulary creature description
 * Q2  Structure (4o)    — description → shape primitives on 32×32 canvas
 * Q3  Colour   (mini)  — role names → hex palette
 * Q4  Motion   (mini)  — natural-language idle-animation plan
 * Q5  Animate  (mini)  — shapes + motion plan → per-shape frame deltas
 *
 * Deploy:  cd worker && npm i && npm run deploy
 * Set GITHUB_TOKEN as a secret in the Cloudflare dashboard.
 */

interface Env {
  GITHUB_TOKEN: string
  K3S_API_URL: string
  K3S_TOKEN: string
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const MODEL_QUEUE = ['openai/gpt-4o-mini']
/** Use the best available model for sprite structure. Falls back through the queue. */
const SPRITE_MODEL = 'openai/gpt-4o'
const API_BASE = 'https://models.github.ai/inference'
const MODEL_TIMEOUT_MS = 28_000

/* ═══════════════════════════════════════════════════════
   PROMPTS
   ═══════════════════════════════════════════════════════ */

/** Q1 — Describe: constrained-vocabulary visual breakdown (mini). */
const DESCRIBE_PROMPT = `You are a visual designer for a pixel art game. Given any subject (creature, object, building, or scene), describe its visual appearance as a side-view sprite using ONLY this design vocabulary.

SHAPES: circle, oval, thin rectangle, squat rectangle, wide rectangle, tall rectangle, square, triangle, rhombus, pointed spike, line, dot
SIZES: tiny (1-2px), small (3-5px), medium (6-10px), large (11-16px), huge (17-24px)
COUNTS: one, two, a few (3-4), several (5-7), many (8+)
POSITIONS: centered, above X, below X, left of X, right of X, around X, on top of X, at the tip of X, flanking X, inside X, behind X

Rules:
- SIDE VIEW or best viewing angle for this subject
- Break down into 6-12 component parts
- Be specific — what makes THIS subject instantly recognizable?
- Use TRIANGULAR shapes for ALL pointed/sharp features (spikes, peaks, edges, tips, blades, corners, thorns)
- Order from largest elements to smallest details

Output ONLY this JSON:
{"parts":["one large oval as the body, centered","two small triangles as ears, on top of the body",...]}`

/** Q2 — Structure: vocabulary description → geometric shape primitives (gpt-4o).
 *  This prompt now also contains the design vocabulary so that if Q1 is skipped
 *  or fails, the raw prompt alone is still enough context. */
const STRUCTURE_PROMPT = `You are a pixel artist. Given a subject and an optional natural-language description, produce geometric shape primitives on a 32×32 canvas.

STEP 1 — THINK (internally, don't output this):
Break the subject into 6-12 visual parts using this vocabulary:
  SHAPES: circle, oval, thin rect, squat rect, wide rect, tall rect, square, triangle, rhombus, spike, line, dot
  SIZES: tiny (1-2px), small (3-5px), medium (6-10px), large (11-16px), huge (17-24px)
  COUNTS: one, two, a few (3-4), several (5-7), many (8+)
  POSITIONS: centered, above X, below X, left of X, right of X, around X, on top of X, at the tip of X, flanking X, inside X, behind X
Ask: what POINTED features define this subject? Those MUST be triangles.

STEP 2 — OUTPUT shapes on a 32×32 canvas. (0,0) = top-left. X right, Y down.
Shapes paint in order — later shapes overwrite earlier pixels (painter's algorithm).

Available shapes:
• rect:     {"type":"rect","x":N,"y":N,"w":N,"h":N,"role":"body"}
• ellipse:  {"type":"ellipse","cx":N,"cy":N,"rx":N,"ry":N,"role":"body"}
• triangle: {"type":"triangle","points":[[x1,y1],[x2,y2],[x3,y3]],"role":"fin"}
• line:     {"type":"line","x1":N,"y1":N,"x2":N,"y2":N,"role":"outline"}
• pixels:   {"type":"pixels","coords":[[x,y],...],"role":"pupil"}

Output ONLY this JSON:
{"roles":["outline","body",...],"shapes":[...]}

COMPOSITION ORDER:
1. OUTLINE: Full silhouette in "outline" role — 1-2px bigger than body fill.
2. BODY FILL: Main shape using "body" role, painted on top of outline.
3. COLOUR ZONES: belly, patches, accent areas — overlapping fills.
4. APPENDAGES: Limbs, fins, wings, tail, horns. Use TRIANGLES for ALL pointed features.
5. FACE: eye_white (small rect), pupil (1px), mouth.
6. TEXTURE: Spots, stripes, scales — pixels or small shapes.

Example — turtle (16 shapes):
{"roles":["outline","shell","shell_light","skin","eye_white","pupil"],"shapes":[{"type":"ellipse","cx":15,"cy":17,"rx":10,"ry":7,"role":"outline"},{"type":"ellipse","cx":15,"cy":17,"rx":9,"ry":6,"role":"shell"},{"type":"ellipse","cx":15,"cy":15,"rx":7,"ry":4,"role":"shell_light"},{"type":"ellipse","cx":24,"cy":16,"rx":4,"ry":3,"role":"outline"},{"type":"ellipse","cx":24,"cy":16,"rx":3,"ry":2,"role":"skin"},{"type":"rect","x":27,"y":15,"w":3,"h":2,"role":"skin"},{"type":"triangle","points":[[5,20],[8,15],[8,21]],"role":"shell"},{"type":"triangle","points":[[4,19],[5,17],[6,21]],"role":"shell_light"},{"type":"rect","x":10,"y":22,"w":3,"h":4,"role":"outline"},{"type":"rect","x":10,"y":22,"w":2,"h":3,"role":"skin"},{"type":"rect","x":19,"y":22,"w":3,"h":4,"role":"outline"},{"type":"rect","x":19,"y":22,"w":2,"h":3,"role":"skin"},{"type":"pixels","coords":[[26,15],[27,15]],"role":"eye_white"},{"type":"pixels","coords":[[27,16]],"role":"pupil"},{"type":"ellipse","cx":15,"cy":18,"rx":4,"ry":2,"role":"shell_light"},{"type":"pixels","coords":[[12,18],[18,18],[15,20]],"role":"shell"}]}

Example — sword (15 shapes):
{"roles":["blade_outline","blade","blade_shine","hilt","guard","guard_dark","pommel","grip"],"shapes":[{"type":"rect","x":20,"y":8,"w":10,"h":2,"role":"blade_outline"},{"type":"rect","x":20,"y":9,"w":9,"h":1,"role":"blade"},{"type":"triangle","points":[[30,8],[32,10],[30,11]],"role":"blade_outline"},{"type":"triangle","points":[[30,9],[31,10],[30,10]],"role":"blade"},{"type":"pixels","coords":[[22,9],[24,9]],"role":"blade_shine"},{"type":"rect","x":14,"y":6,"w":7,"h":6,"role":"guard"},{"type":"rect","x":14,"y":7,"w":6,"h":4,"role":"guard_dark"},{"type":"rect","x":8,"y":8,"w":6,"h":3,"role":"grip"},{"type":"ellipse","cx":6,"cy":10,"rx":2,"ry":2,"role":"pommel"}]}

Example — floating island (22 shapes):
{"roles":["outline","landmass","grass","rock","rock_dark","waterfall","tree_trunk","tree_leaves","cloud"],"shapes":[{"type":"ellipse","cx":16,"cy":18,"rx":12,"ry":8,"role":"outline"},{"type":"ellipse","cx":16,"cy":18,"rx":11,"ry":7,"role":"rock"},{"type":"ellipse","cx":16,"cy":12,"rx":10,"ry":4,"role":"grass"},{"type":"rect","x":10,"y":19,"w":3,"h":2,"role":"rock_dark"},{"type":"rect","x":20,"y":20,"w":2,"h":2,"role":"rock_dark"},{"type":"rect","x":4,"y":20,"w":1,"h":8,"role":"waterfall"},{"type":"rect","x":5,"y":22,"w":1,"h":6,"role":"waterfall"},{"type":"rect","x":11,"y":10,"w":2,"h":4,"role":"tree_trunk"},{"type":"triangle","points":[[12,6],[8,10],[16,10]],"role":"tree_leaves"},{"type":"rect","x":19,"y":9,"w":2,"h":5,"role":"tree_trunk"},{"type":"triangle","points":[[20,5],[17,9],[23,9]],"role":"tree_leaves"},{"type":"ellipse","cx":8,"cy":6,"rx":3,"ry":2,"role":"cloud"},{"type":"ellipse","cx":24,"cy":8,"rx":4,"ry":2,"role":"cloud"}]}

Example — potion bottle (18 shapes):
{"roles":["outline","glass","liquid","liquid_dark","bubbles","cork","label","shine"],"shapes":[{"type":"rect","x":12,"y":6,"w":8,"h":3,"role":"outline"},{"type":"rect","x":13,"y":6,"w":6,"h":2,"role":"cork"},{"type":"rect","x":10,"y":9,"w":12,"h":14,"role":"outline"},{"type":"rect","x":11,"y":10,"w":10,"h":12,"role":"glass"},{"type":"rect","x":12,"y":16,"w":8,"h":6,"role":"liquid"},{"type":"rect","x":12,"y":20,"w":8,"h":2,"role":"liquid_dark"},{"type":"pixels","coords":[[14,17],[16,18],[15,19]],"role":"bubbles"},{"type":"rect","x":13,"y":13,"w":6,"h":2,"role":"label"},{"type":"pixels","coords":[[12,11],[13,11]],"role":"shine"}]}

Rules:
- Side view facing right — asymmetric silhouette, NOT a circle or diamond
- 20-28px tall, roughly centred on canvas
- 25-45 shapes — more shapes = more detail = more recognizable
- Use TRIANGLES for ALL pointed features — this is what makes creatures recognizable
- At least 3-5 triangles for pointed features`

/** Q3 — Colour: role names → hex palette (mini). */
const COLOR_PROMPT = `You are a creature colour designer. Given a subject name and a list of body-part roles, assign a hex colour to each role.

Rules:
- Choose colours instantly recognizable for this subject
- Visually distinct from each other
- "outline" or similar edge roles: very dark (#1a-#3a range)
- "eye_white" or highlight roles: bright (#ddd-#fff range)
- "pupil": near black
- Be specific — not generic: a pufferfish is sandy yellow, not plain orange; a dragon is rich green or crimson, not grey; a floating island is mossy green with grey stone, not blue; a sword blade is steel grey with bright highlights, not dull brown

Output ONLY this JSON:
{"colors":{"role_name":"#hex",...},"primaryColour":"#hex"}`

/** Q4 — Motion: natural-language idle-animation plan (mini). */
const MOTION_PROMPT = `You describe how creatures and objects move in subtle idle animation. Given a subject and its visual description, specify which body parts move and how.

Movement types:
- sway: gentle horizontal swing (tails, fins, tentacles, branches)
- bob: vertical float up and down (antennae, floating things, dangling parts)
- flap: pumping motion upward (wings, large fins)
- wag: quick diagonal wiggle (small appendages, ear tufts, feelers)

Rules:
- Only animate parts that would naturally move while idle
- Most subjects have 2-4 moving parts
- Body core, legs (when standing), and outline stay STILL
- If the subject is completely static (rock, building), output: {"motions":["static"]}

Output ONLY this JSON:
{"motions":["tail: sway","wings: flap","antennae: bob",...]}`

/** Q5 — Animate: shapes + motion plan → per-shape frame deltas (mini). */
const ANIMATE_PROMPT = `You are an animation engineer. Given a list of geometric shapes and a motion plan, assign 3 frames of pixel offsets (dx, dy) to each shape that should move.

Offset guidelines per motion type:
- sway: horizontal swing, e.g. [[1,0],[-1,0],[0,0]] or [[2,0],[-2,0],[0,0]]
- bob: vertical float, e.g. [[0,-1],[0,-2],[0,-1]]
- flap: upward pump, e.g. [[1,-2],[0,-3],[-1,-2]]
- wag: diagonal wiggle, e.g. [[-1,1],[1,-1],[0,0]]

Keep offsets small (1-3 pixels). This is subtle idle animation.

Output ONLY this JSON:
{"animated":[
  {"index":0,"offsets":[[dx1,dy1],[dx2,dy2],[dx3,dy3]]},
  ...
]}

"index" = 0-based position in the shapes array.
Only include shapes that should move (3-8 typically).
Match each moving part from the motion plan to the shape with the matching role name.`

/* ═══════════════════════════════════════════════════════
   LLM CALLER
   ═══════════════════════════════════════════════════════ */

/**
 * Call LLM with given system prompt and user message.
 * Retries once on 429 rate-limit after a short backoff.
 */
async function callLLM(
  systemPrompt: string,
  userMessage: string,
  token: string,
  modelOverride?: string,
  maxTokens = 4096,
): Promise<{ parsed: any; model: string } | null> {
  const models = modelOverride ? [modelOverride, ...MODEL_QUEUE] : MODEL_QUEUE
  const maxAttempts = 2

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
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
            max_tokens: maxTokens,
          }),
        })

        clearTimeout(timer)

        if (res.status === 429) {
          const body = await res.text().catch(() => '')
          console.warn(`Model ${model} rate limited (429), trying next model. ${body.slice(0, 120)}`)
          continue   // fall through to the next model in the list
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
          return null
        }
        continue
      }
    }
  }
  return null
}

/* ═══════════════════════════════════════════════════════
   SHAPE RASTERISATION
   ═══════════════════════════════════════════════════════ */

function setPixel(
  grid: (string | null)[][],
  x: number,
  y: number,
  color: string,
  size: number,
) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  if (ix >= 0 && ix < size && iy >= 0 && iy < size) {
    grid[iy][ix] = color
  }
}

/**
 * Convert an ordered list of shape primitives into a pixel grid.
 * Shapes paint in order — later shapes overwrite earlier ones (painter's algorithm).
 */
function rasterizeShapes(
  palette: Record<string, string>,
  shapes: any[],
  size = 32,
): (string | null)[][] {
  const grid: (string | null)[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null),
  )

  for (const shape of shapes) {
    if (!shape || !shape.type) continue
    const color = palette[shape.color] || shape.color
    if (!color) continue

    switch (shape.type) {
      case 'rect': {
        const { x, y, w, h } = shape
        if (x == null || y == null || w == null || h == null) break
        for (let dy = 0; dy < h; dy++) {
          for (let dx = 0; dx < w; dx++) {
            setPixel(grid, x + dx, y + dy, color, size)
          }
        }
        break
      }

      case 'ellipse': {
        const { cx, cy, rx, ry } = shape
        if (cx == null || cy == null || rx == null || ry == null) break
        const safeRx = Math.max(rx, 0.5)
        const safeRy = Math.max(ry, 0.5)
        for (let py = Math.floor(cy - ry); py <= Math.ceil(cy + ry); py++) {
          for (let px = Math.floor(cx - rx); px <= Math.ceil(cx + rx); px++) {
            const ndx = (px - cx) / safeRx
            const ndy = (py - cy) / safeRy
            if (ndx * ndx + ndy * ndy <= 1) {
              setPixel(grid, px, py, color, size)
            }
          }
        }
        break
      }

      case 'line': {
        let { x1, y1, x2, y2 } = shape
        if (x1 == null || y1 == null || x2 == null || y2 == null) break
        const adx = Math.abs(x2 - x1)
        const ady = Math.abs(y2 - y1)
        const sx = x1 < x2 ? 1 : -1
        const sy = y1 < y2 ? 1 : -1
        let err = adx - ady
        const maxSteps = adx + ady + 1
        for (let step = 0; step < maxSteps; step++) {
          setPixel(grid, x1, y1, color, size)
          if (x1 === x2 && y1 === y2) break
          const e2 = 2 * err
          if (e2 > -ady) { err -= ady; x1 += sx }
          if (e2 < adx) { err += adx; y1 += sy }
        }
        break
      }

      case 'triangle': {
        const pts = shape.points
        if (!Array.isArray(pts) || pts.length !== 3) break
        const [p0, p1, p2] = pts
        const minY = Math.floor(Math.min(p0[1], p1[1], p2[1]))
        const maxY = Math.ceil(Math.max(p0[1], p1[1], p2[1]))
        for (let py = minY; py <= maxY; py++) {
          const minX = Math.floor(Math.min(p0[0], p1[0], p2[0]))
          const maxX = Math.ceil(Math.max(p0[0], p1[0], p2[0]))
          for (let px = minX; px <= maxX; px++) {
            const d = (p1[1] - p2[1]) * (p0[0] - p2[0]) + (p2[0] - p1[0]) * (p0[1] - p2[1])
            if (Math.abs(d) < 0.001) continue
            const a = ((p1[1] - p2[1]) * (px - p2[0]) + (p2[0] - p1[0]) * (py - p2[1])) / d
            const b = ((p2[1] - p0[1]) * (px - p2[0]) + (p0[0] - p2[0]) * (py - p2[1])) / d
            const cc = 1 - a - b
            if (a >= -0.01 && b >= -0.01 && cc >= -0.01) {
              setPixel(grid, px, py, color, size)
            }
          }
        }
        break
      }

      case 'pixels': {
        if (Array.isArray(shape.coords)) {
          for (const coord of shape.coords) {
            if (Array.isArray(coord) && coord.length >= 2) {
              setPixel(grid, coord[0], coord[1], color, size)
            }
          }
        }
        break
      }
    }
  }

  return grid
}

/* ═══════════════════════════════════════════════════════
   ANIMATION HELPERS
   ═══════════════════════════════════════════════════════ */

/** Human-readable shape summary for Q5 input. */
function summarizeShapes(shapes: any[]): string {
  return shapes.map((s: any, i: number) => {
    switch (s.type) {
      case 'rect':     return `[${i}] rect (${s.x},${s.y}) ${s.w}×${s.h} role=${s.role}`
      case 'ellipse':  return `[${i}] ellipse (${s.cx},${s.cy}) r=${s.rx}×${s.ry} role=${s.role}`
      case 'triangle': return `[${i}] triangle ${JSON.stringify(s.points)} role=${s.role}`
      case 'line':     return `[${i}] line (${s.x1},${s.y1})→(${s.x2},${s.y2}) role=${s.role}`
      case 'pixels':   return `[${i}] pixels ×${s.coords?.length || 0} role=${s.role}`
      default:         return `[${i}] ${s.type} role=${s.role}`
    }
  }).join('\n')
}

/** Shift a single shape by (dx, dy), returning a new object. */
function shiftShape(shape: any, dx: number, dy: number): any {
  const clone = { ...shape }
  switch (shape.type) {
    case 'rect':
      clone.x = (shape.x ?? 0) + dx
      clone.y = (shape.y ?? 0) + dy
      break
    case 'ellipse':
      clone.cx = (shape.cx ?? 0) + dx
      clone.cy = (shape.cy ?? 0) + dy
      break
    case 'triangle':
      if (Array.isArray(shape.points))
        clone.points = shape.points.map((p: number[]) => [p[0] + dx, p[1] + dy])
      break
    case 'line':
      clone.x1 = (shape.x1 ?? 0) + dx
      clone.y1 = (shape.y1 ?? 0) + dy
      clone.x2 = (shape.x2 ?? 0) + dx
      clone.y2 = (shape.y2 ?? 0) + dy
      break
    case 'pixels':
      if (Array.isArray(shape.coords))
        clone.coords = shape.coords.map((c: number[]) => [c[0] + dx, c[1] + dy])
      break
  }
  return clone
}

/** Apply Q5 animation deltas to produce 3 rasterised frames. */
function buildAnimFrames(
  palette: Record<string, string>,
  shapes: any[],
  animated: { index: number; offsets: [number, number][] }[],
  size = 32,
): (string | null)[][][] {
  const deltaMap = new Map<number, [number, number][]>()
  for (const a of animated) deltaMap.set(a.index, a.offsets)

  return [0, 1, 2].map(frameIdx => {
    const shifted = shapes.map((s, si) => {
      const offsets = deltaMap.get(si)
      if (!offsets || !offsets[frameIdx]) return s
      const [dx, dy] = offsets[frameIdx]
      return shiftShape(s, dx, dy)
    })
    return rasterizeShapes(palette, shifted, size)
  })
}

/* ═══════════════════════════════════════════════════════
   ENDPOINTS
   ═══════════════════════════════════════════════════════ */

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS })
    }

    const url = new URL(request.url)

    // ── Endpoint 1: Generate base sprite  (Q1 → Q2 → Q3 → rasterise) ──
    if (request.method === 'POST' && url.pathname === '/generate-sprite') {
      try {
        const { prompt } = (await request.json()) as { prompt: string }
        if (!prompt || typeof prompt !== 'string' || prompt.length > 100) {
          return Response.json({ error: 'Bad prompt' }, { status: 400, headers: CORS })
        }

        // Q1 (describe, mini) + Q2 (structure, best available) run in PARALLEL
        // If gpt-4o is rate-limited, Q2 falls through to gpt-4o-mini automatically.
        console.log(`Q1+Q2 in parallel for "${prompt}"...`)
        const [descResult, structResult] = await Promise.all([
          callLLM(DESCRIBE_PROMPT, `Describe: ${prompt}`, env.GITHUB_TOKEN, undefined, 512),
          callLLM(STRUCTURE_PROMPT, `Subject: ${prompt}`, env.GITHUB_TOKEN, SPRITE_MODEL),
        ])

        // Build description text for later animation queries
        const description = descResult?.parsed?.parts
          ? (descResult.parsed.parts as string[]).join('\n')
          : prompt

        console.log(`Q1 done — ${description.length} chars`)

        if (!structResult) {
          return Response.json(
            { error: 'Failed to generate sprite', fallback: true },
            { status: 503, headers: CORS },
          )
        }

        const { roles, shapes } = structResult.parsed
        if (!Array.isArray(shapes) || shapes.length < 3) {
          return Response.json(
            { error: 'Invalid sprite format', fallback: true, shapeCount: shapes?.length, parsed: structResult.parsed },
            { status: 503, headers: CORS },
          )
        }

        // Collect unique role names actually used in shapes
        const usedRoles = [...new Set(shapes.map((s: any) => s.role).filter(Boolean))] as string[]
        const roleList = usedRoles.length > 0 ? usedRoles : (roles || ['outline', 'body', 'accent'])

        // Q3: Colour — role list → hex palette (mini)
        console.log(`Q3 colour: ${roleList.length} roles...`)
        const colorResult = await callLLM(
          COLOR_PROMPT,
          `Subject: ${prompt}\nRoles: ${roleList.join(', ')}`,
          env.GITHUB_TOKEN,
          undefined,
          512,
        )

        let palette: Record<string, string> = {}
        let primaryColour = '#00d4ff'
        if (colorResult?.parsed?.colors) {
          palette = colorResult.parsed.colors
          primaryColour = colorResult.parsed.primaryColour || colorResult.parsed.primaryColor || primaryColour
        } else {
          console.warn('Q3 colour failed — using fallback palette')
          const fallbackHues = ['#2a2a2a', '#5a8a5a', '#8aba6a', '#ffffff', '#3a3a3a', '#dddddd']
          roleList.forEach((r: string, i: number) => { palette[r] = fallbackHues[i % fallbackHues.length] })
        }

        // Map shapes: "role" → "color" key for rasteriser
        const coloredShapes = shapes.map((s: any) => ({ ...s, color: s.role }))
        const frame = rasterizeShapes(palette, coloredShapes)

        return Response.json(
          { frame, palette, shapes: coloredShapes, description, primaryColour, model: structResult.model },
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

    // ── Endpoint 2: Animate sprite  (Q4 → Q5 → rasterise frames) ──
    if (request.method === 'POST' && url.pathname === '/animate-sprite') {
      try {
        const { palette, shapes, description, name } = (await request.json()) as {
          palette: Record<string, string>
          shapes: any[]
          description?: string
          name?: string
        }
        if (!palette || !Array.isArray(shapes) || shapes.length < 3) {
          return Response.json({ error: 'Bad sprite data' }, { status: 400, headers: CORS })
        }

        const subject = name || 'creature'
        const desc = description || subject

        // Q4: Motion — idle animation plan (mini)
        console.log(`Q4 motion plan for "${subject}"...`)
        const motionResult = await callLLM(
          MOTION_PROMPT,
          `Subject: ${subject}\nDescription:\n${desc}`,
          env.GITHUB_TOKEN,
          undefined,
          256,
        )

        const motions: string[] = motionResult?.parsed?.motions || []
        const isStatic = motions.length === 0 || motions.some((m: string) => m.toLowerCase().includes('static'))

        if (isStatic) {
          console.log('Q4: subject is static — no animation')
          const base = rasterizeShapes(palette, shapes)
          return Response.json(
            { frames: [base, base, base], model: 'static' },
            { headers: { ...CORS, 'Content-Type': 'application/json' } },
          )
        }

        // Q5: Animate — shapes + motion plan → per-shape deltas (mini)
        console.log(`Q5 animate: ${motions.length} moving parts...`)
        const shapeSummary = summarizeShapes(shapes)
        const animResult = await callLLM(
          ANIMATE_PROMPT,
          `Motion plan:\n${motions.join('\n')}\n\nShapes:\n${shapeSummary}`,
          env.GITHUB_TOKEN,
          undefined,
          512,
        )

        if (!animResult?.parsed?.animated || !Array.isArray(animResult.parsed.animated)) {
          console.warn('Q5 failed — returning static frames')
          const base = rasterizeShapes(palette, shapes)
          return Response.json(
            { frames: [base, base, base], model: 'static-fallback' },
            { headers: { ...CORS, 'Content-Type': 'application/json' } },
          )
        }

        const animFrames = buildAnimFrames(palette, shapes, animResult.parsed.animated)

        return Response.json(
          { frames: animFrames, model: 'llm-animated' },
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

    // -- Endpoint 3: Create creature deployment --
    if (request.method === 'POST' && url.pathname === '/k8s/deploy') {
      return handleCreatureDeploy(request, env)
    }

    // -- Endpoint 4: Get creature pod status --
    if (request.method === 'GET' && url.pathname === '/k8s/pods') {
      const deployment = url.searchParams.get('deployment')
      if (!deployment) {
        return Response.json({ error: 'Missing deployment parameter' }, { status: 400, headers: CORS })
      }
      // Piggyback cleanup as a background task — doesn't add latency
      ctx.waitUntil(cleanupOldDeployments(env))
      return handleCreaturePods(deployment, env)
    }

    // -- Endpoint 5: Tear down creature deployment --
    if (request.method === 'DELETE' && url.pathname.startsWith('/k8s/deploy/')) {
      const name = url.pathname.slice('/k8s/deploy/'.length)
      if (!name) {
        return Response.json({ error: 'Missing deployment name' }, { status: 400, headers: CORS })
      }
      return handleCreatureTeardown(name, env)
    }

    // -- Endpoint 6: Get pod CPU/mem metrics --
    if (request.method === 'GET' && url.pathname === '/k8s/pod-metrics') {
      const deployment = url.searchParams.get('deployment')
      if (!deployment) {
        return Response.json({ error: 'Missing deployment parameter' }, { status: 400, headers: CORS })
      }
      return handlePodMetrics(deployment, env)
    }

    // -- Endpoint 7: Restart (delete) a single pod --
    if (request.method === 'DELETE' && url.pathname.startsWith('/k8s/pods/')) {
      const podName = url.pathname.slice('/k8s/pods/'.length)
      if (!podName) {
        return Response.json({ error: 'Missing pod name' }, { status: 400, headers: CORS })
      }
      return handlePodRestart(podName, env)
    }

    return new Response('Not found', { status: 404, headers: CORS })
  },

  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    await cleanupOldDeployments(env)
  },
}

/* ═══════════════════════════════════════════════════════
   K8S CREATURE DEPLOYMENT
   ═══════════════════════════════════════════════════════ */

const CREATURES_NS = 'creatures'
const MAX_PODS_IN_NAMESPACE = 30
const MAX_REPLICAS = 6
const POD_TTL_SECONDS = 600 // 10 minutes

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
}

function k8sHeaders(env: Env): Record<string, string> {
  return {
    Authorization: `Bearer ${env.K3S_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

async function k8sFetch(env: Env, path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${env.K3S_API_URL}${path}`, {
    ...init,
    headers: { ...k8sHeaders(env), ...(init?.headers || {}) },
    // @ts-expect-error -- Cloudflare-specific fetch option
    cf: { cacheTtl: 0 },
  })
}

/** Count running pods in the creatures namespace. */
async function countPods(env: Env): Promise<number> {
  const res = await k8sFetch(env, `/api/v1/namespaces/${CREATURES_NS}/pods`)
  if (!res.ok) return 0
  const data = (await res.json()) as any
  return (data.items || []).length
}

/** Clean up deployments older than TTL. Runs lazily on each request. */
async function cleanupOldDeployments(env: Env): Promise<void> {
  const res = await k8sFetch(
    env,
    `/apis/apps/v1/namespaces/${CREATURES_NS}/deployments?labelSelector=app=creature`,
  )
  if (!res.ok) return

  const data = (await res.json()) as any
  const now = Date.now()

  for (const dep of data.items || []) {
    const created = dep.metadata?.labels?.['created-at']
    if (created && now - Number(created) * 1000 > POD_TTL_SECONDS * 1000) {
      await k8sFetch(env, `/apis/apps/v1/namespaces/${CREATURES_NS}/deployments/${dep.metadata.name}`, {
        method: 'DELETE',
      })
    }
  }
}

/** POST /k8s/deploy — create a creature deployment. */
async function handleCreatureDeploy(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as any
    const rawName = String(body.name || '').trim()
    const replicas = Math.min(Math.max(Number(body.replicas) || 1, 1), MAX_REPLICAS)
    const strategy = body.strategy === 'Recreate' ? 'Recreate' : 'RollingUpdate'

    if (!rawName) {
      return Response.json({ error: 'Missing creature name' }, { status: 400, headers: CORS })
    }

    // Lazy cleanup before creating new
    await cleanupOldDeployments(env)

    // Check capacity
    const podCount = await countPods(env)
    if (podCount + replicas > MAX_PODS_IN_NAMESPACE) {
      return Response.json(
        { error: `Cluster is busy — ${podCount} pods running. Try fewer replicas or wait.` },
        { status: 429, headers: CORS },
      )
    }

    const safeName = sanitizeName(rawName)
    const suffix = Math.random().toString(36).slice(2, 6)
    const deploymentName = `creature-${safeName}-${suffix}`
    const now = Math.floor(Date.now() / 1000)

    const deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: deploymentName,
        namespace: CREATURES_NS,
        labels: {
          app: 'creature',
          'creature-name': safeName,
          'created-at': String(now),
        },
      },
      spec: {
        replicas,
        strategy: {
          type: strategy,
          ...(strategy === 'RollingUpdate'
            ? { rollingUpdate: { maxUnavailable: 0, maxSurge: 1 } }
            : {}),
        },
        selector: {
          matchLabels: { 'creature-deployment': deploymentName },
        },
        template: {
          metadata: {
            labels: {
              app: 'creature',
              'creature-deployment': deploymentName,
              'creature-name': safeName,
            },
          },
          spec: {
            containers: [
              {
                name: 'creature',
                image: 'busybox:latest',
                command: ['sh', '-c', `echo "creature ${rawName} alive" && sleep ${POD_TTL_SECONDS}`],
                resources: {
                  requests: { cpu: '5m', memory: '8Mi' },
                  limits: { cpu: '10m', memory: '16Mi' },
                },
              },
            ],
          },
        },
      },
    }

    const res = await k8sFetch(
      env,
      `/apis/apps/v1/namespaces/${CREATURES_NS}/deployments`,
      { method: 'POST', body: JSON.stringify(deployment) },
    )

    if (!res.ok) {
      const errText = await res.text()
      console.error(`k8s deploy error: ${res.status} ${errText}`)
      return Response.json(
        { error: 'Failed to create deployment' },
        { status: 502, headers: CORS },
      )
    }

    return Response.json(
      { deployment: deploymentName, replicas, strategy, ttl: POD_TTL_SECONDS },
      { headers: CORS },
    )
  } catch (err) {
    console.error('Deploy handler error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500, headers: CORS })
  }
}

/** GET /k8s/pods?deployment=<name> — list pods for a creature deployment. */
async function handleCreaturePods(deployment: string, env: Env): Promise<Response> {
  try {
    const res = await k8sFetch(
      env,
      `/api/v1/namespaces/${CREATURES_NS}/pods?labelSelector=creature-deployment=${deployment}`,
    )

    if (!res.ok) {
      return Response.json(
        { error: 'Failed to query pods' },
        { status: 502, headers: CORS },
      )
    }

    const data = (await res.json()) as any
    const pods = (data.items || []).map((p: any) => ({
      name: p.metadata?.name || 'unknown',
      phase: p.status?.phase || 'Unknown',
      ready: (p.status?.conditions || []).some(
        (c: any) => c.type === 'Ready' && c.status === 'True',
      ),
      started: p.status?.startTime || null,
      restarts: p.status?.containerStatuses?.[0]?.restartCount ?? 0,
    }))

    // Also get deployment status
    const depRes = await k8sFetch(
      env,
      `/apis/apps/v1/namespaces/${CREATURES_NS}/deployments/${deployment}`,
    )

    let replicas = 0
    let readyReplicas = 0
    let exists = true

    if (depRes.ok) {
      const dep = (await depRes.json()) as any
      replicas = dep.spec?.replicas ?? 0
      readyReplicas = dep.status?.readyReplicas ?? 0
    } else if (depRes.status === 404) {
      exists = false
    }

    return Response.json(
      { deployment, exists, replicas, readyReplicas, pods },
      { headers: { ...CORS, 'Cache-Control': 'no-cache' } },
    )
  } catch (err) {
    console.error('Pods handler error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500, headers: CORS })
  }
}

/** GET /k8s/pod-metrics?deployment=<name> — real CPU/mem from metrics-server. */
async function handlePodMetrics(deployment: string, env: Env): Promise<Response> {
  try {
    const selector = encodeURIComponent(`creature-deployment=${deployment}`)
    const res = await k8sFetch(
      env,
      `/apis/metrics.k8s.io/v1beta1/namespaces/${CREATURES_NS}/pods?labelSelector=${selector}`,
    )
    if (!res.ok) {
      return Response.json({ metrics: [] }, { headers: { ...CORS, 'Cache-Control': 'no-cache' } })
    }
    const data = (await res.json()) as any
    const metrics = (data.items || []).map((item: any) => ({
      podName: item.metadata?.name ?? '',
      cpu: item.containers?.[0]?.usage?.cpu ?? '0m',
      memory: item.containers?.[0]?.usage?.memory ?? '0Mi',
    }))
    return Response.json({ metrics }, { headers: { ...CORS, 'Cache-Control': 'no-cache' } })
  } catch (err) {
    console.error('Pod metrics handler error:', err)
    return Response.json({ metrics: [] }, { status: 500, headers: CORS })
  }
}

/** DELETE /k8s/pods/:podName — delete a single pod so the ReplicaSet respawns it. */
async function handlePodRestart(podName: string, env: Env): Promise<Response> {
  try {
    const res = await k8sFetch(
      env,
      `/api/v1/namespaces/${CREATURES_NS}/pods/${podName}`,
      { method: 'DELETE' },
    )
    if (!res.ok && res.status !== 404) {
      return Response.json({ error: 'Failed to delete pod' }, { status: 502, headers: CORS })
    }
    return Response.json({ restarted: true }, { headers: CORS })
  } catch (err) {
    console.error('Pod restart handler error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500, headers: CORS })
  }
}

/** DELETE /k8s/deploy/:name — tear down a creature deployment. */
async function handleCreatureTeardown(name: string, env: Env): Promise<Response> {
  try {
    const res = await k8sFetch(
      env,
      `/apis/apps/v1/namespaces/${CREATURES_NS}/deployments/${name}`,
      { method: 'DELETE' },
    )

    if (res.status === 404) {
      return Response.json({ deleted: true, message: 'Already gone' }, { headers: CORS })
    }

    if (!res.ok) {
      return Response.json(
        { error: 'Failed to delete deployment' },
        { status: 502, headers: CORS },
      )
    }

    return Response.json({ deleted: true }, { headers: CORS })
  } catch (err) {
    console.error('Teardown handler error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500, headers: CORS })
  }
}
