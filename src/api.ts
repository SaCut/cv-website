import type { CreatureData } from './types'
import { getRandomCreature } from './data/creatures'
import { logSpriteResponse } from './debug'

const API_URL = import.meta.env.VITE_API_URL || 'https://pipeline-cv-worker.xartab-mail-flare.workers.dev'

export interface GenerateResult {
  creature: CreatureData
  /** The AI was entirely unavailable — using a pre-baked fallback creature. */
  aiFailed: boolean
  /** The preferred model was unavailable — a different model stepped in. */
  fallbackModel: boolean
  /** Human-readable notice for the pipeline log. */
  notice?: string
}

const FALLBACK_QUIPS = [
  `Oops — looks like the bot is sleeping! We'll grab a pre-baked creature from the warehouse instead.`,
  `The AI is off on a tea break. Good thing we keep spare creatures in the back!`,
  `Well, the robot artist called in sick. Luckily the warehouse has some classics.`,
  `AI unavailable — but no worries, we planned for this. Fetching a pre-built creature!`,
  `The model's having a lie-down. Time to rummage through the creature archives!`,
]

const MODEL_SWAP_QUIPS = [
  `Preferred model was busy — a backup model stepped in. Teamwork!`,
  `Primary model unavailable — another one picked up the brush. Seamless.`,
  `Our first-choice model was napping, so a colleague covered the shift.`,
]

function pickQuip(quips: string[]): string {
  return quips[Math.floor(Math.random() * quips.length)]
}

/** Generate base sprite (CF Workers AI image, or Q1 describe → Q2 structure → Q3 colour fallback). */
export async function generateSprite(name: string, debug = false): Promise<{
  frame: any
  palette: Record<string, string>
  shapes: any[]
  description: string
  primaryColour: string
  failed: boolean
  /** Base64 PNG returned by CF Workers AI — skips animation pipeline when present. */
  imageBase64?: string
  notice?: string
}> {
  if (!API_URL) {
    const fallback = getRandomCreature(name)
    return {
      frame: fallback.frames[0],
      palette: {},
      shapes: [],
      description: name,
      primaryColour: fallback.primaryColour,
      failed: true,
      notice: pickQuip(FALLBACK_QUIPS),
    }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    const res = await fetch(`${API_URL}/generate-sprite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: name }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok || !res.headers.get('content-type')?.includes('json')) {
      const fallback = getRandomCreature(name)
      return {
        frame: fallback.frames[0],
        palette: {},
        shapes: [],
        description: name,
        primaryColour: fallback.primaryColour,
        failed: true,
        notice: pickQuip(FALLBACK_QUIPS),
      }
    }

    const data = await res.json()

    // CF Workers AI image path — base64 PNG for frontend rasterisation
    if (data.imageBase64) {
      // Fire-and-forget: log to debug-sprites/ if debug mode is on.
      if (debug) logSpriteResponse(name, data.imageBase64, data).catch(() => {})
      return {
        frame: null,
        palette: {},
        shapes: [],
        description: name,
        primaryColour: data.primaryColour || '#00d4ff',
        imageBase64: data.imageBase64,
        failed: false,
      }
    }

    if (!data.frame || !data.palette || !data.shapes) {
      const fallback = getRandomCreature(name)
      return {
        frame: fallback.frames[0],
        palette: {},
        shapes: [],
        description: name,
        primaryColour: fallback.primaryColour,
        failed: true,
        notice: pickQuip(FALLBACK_QUIPS),
      }
    }

    return {
      frame: data.frame,
      palette: data.palette,
      shapes: data.shapes,
      description: data.description || name,
      primaryColour: data.primaryColour || '#00d4ff',
      failed: false,
    }
  } catch (err) {
    console.error('Sprite generation error:', err)
    const fallback = getRandomCreature(name)
    return {
      frame: fallback.frames[0],
      palette: {},
      shapes: [],
      description: name,
      primaryColour: fallback.primaryColour,
      failed: true,
      notice: pickQuip(FALLBACK_QUIPS),
    }
  }
}

/** Animate existing sprite (Q4 motion → Q5 animate). */
export async function animateSprite(
  palette: Record<string, string>,
  shapes: any[],
  description: string,
  name: string,
): Promise<{
  frames: any[]
  failed: boolean
  notice?: string
}> {
  if (!API_URL || !shapes || shapes.length === 0) {
    return {
      frames: [],
      failed: true,
      notice: 'No sprite data to animate.',
    }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    const res = await fetch(`${API_URL}/animate-sprite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ palette, shapes, description, name }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok || !res.headers.get('content-type')?.includes('json')) {
      return {
        frames: [],
        failed: true,
        notice: 'Animation service unavailable.',
      }
    }

    const data = await res.json()

    if (!Array.isArray(data.frames) || data.frames.length === 0) {
      return {
        frames: [],
        failed: true,
        notice: 'Animation generation failed.',
      }
    }

    return {
      frames: data.frames,
      failed: false,
    }
  } catch (err) {
    console.error('Animation error:', err)
    return {
      frames: [],
      failed: true,
      notice: 'Animation generation error.',
    }
  }
}

/* ═══════════════════════════════════════════════════════
   CF AI IMAGE → PIXEL GRID RASTERISATION
   ═══════════════════════════════════════════════════════ */

import type { PixelFrame } from './types'

/**
 * Draw a base64 image onto a hidden 32×32 canvas and extract a
 * palette-quantised pixel grid. Near-black pixels are treated as
 * transparent background (the CF AI prompt requests #000 bg).
 */
export function rasterizeImageToGrid(imageBase64: string, size = 32): Promise<PixelFrame> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!

      // Smoothing ON: browser averages the source block per output pixel instead
      // of picking a single random sample (nearest-neighbour = rainbow noise).
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      // Draw slightly zoomed in (~7%) to clip the vignette/dark-border artifact
      // that SDXL Lightning consistently adds around the edges.
      const crop = size * 0.07
      ctx.drawImage(img, -crop, -crop, size + crop * 2, size + crop * 2)
      const data = ctx.getImageData(0, 0, size, size).data

      // --- Adaptive flood-fill background removal ---
      // Sample the four corners to find what colour the model actually used as
      // background (it often ignores the magenta prompt and uses light/white).
      // If the corners score highly as magenta (R+B-G*2 > 80) use chroma-key;
      // otherwise fall back to Euclidean distance from the sampled corner colour.
      const cornerIdxs = [0, (size-1)*4, size*(size-1)*4, (size*size-1)*4]
      const bgR = Math.round(cornerIdxs.reduce((s,i) => s + data[i],   0) / 4)
      const bgG = Math.round(cornerIdxs.reduce((s,i) => s + data[i+1], 0) / 4)
      const bgB = Math.round(cornerIdxs.reduce((s,i) => s + data[i+2], 0) / 4)

      const magentaScore = bgR + bgB - bgG * 2
      const TOLERANCE = magentaScore > 80 ? 80 : 45  // tighter for plain colours

      const isBg = (idx: number) => {
        const r = data[idx], g = data[idx+1], b = data[idx+2]
        if (magentaScore > 80) return (r + b - g * 2) > TOLERANCE
        return Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB) < TOLERANCE * 3
      }

      const visited = new Uint8Array(size * size) // 1 = background

      // Seed flood-fill from every edge pixel that matches background.
      const queue: number[] = []
      for (let x = 0; x < size; x++) {
        for (const y of [0, size - 1]) {
          const p = y * size + x
          if (isBg(p * 4) && !visited[p]) { visited[p] = 1; queue.push(p) }
        }
      }
      for (let y = 1; y < size - 1; y++) {
        for (const x of [0, size - 1]) {
          const p = y * size + x
          if (isBg(p * 4) && !visited[p]) { visited[p] = 1; queue.push(p) }
        }
      }

      // BFS — spread to 4-connected neighbours that also look like background.
      let qi = 0
      while (qi < queue.length) {
        const p = queue[qi++]
        const px = p % size, py = Math.floor(p / size)
        for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
          const nx = px + dx, ny = py + dy
          if (nx < 0 || nx >= size || ny < 0 || ny >= size) continue
          const np = ny * size + nx
          if (!visited[np] && isBg(np * 4)) { visited[np] = 1; queue.push(np) }
        }
      }

      // Build the grid: background pixels → null, sprite pixels → quantised hex.
      const grid: PixelFrame = []
      for (let y = 0; y < size; y++) {
        const row: (string | null)[] = []
        for (let x = 0; x < size; x++) {
          const p = y * size + x
          if (visited[p] || data[p * 4 + 3] < 128) {
            row.push(null)
          } else {
            // 8 levels per channel (step 36): 512 possible colours — enough for
            // a sprite, few enough to look like deliberate pixel art.
            const qr = Math.min(Math.round(data[p * 4]     / 36) * 36, 255)
            const qg = Math.min(Math.round(data[p * 4 + 1] / 36) * 36, 255)
            const qb = Math.min(Math.round(data[p * 4 + 2] / 36) * 36, 255)
            row.push(
              '#' +
              qr.toString(16).padStart(2, '0') +
              qg.toString(16).padStart(2, '0') +
              qb.toString(16).padStart(2, '0'),
            )
          }
        }
        grid.push(row)
      }
      resolve(grid)
    }
    img.onerror = () => resolve([])
    img.src = imageBase64
  })
}

export interface GridRegion {
  x: number
  y: number
  w: number
  h: number
  offsets: [number, number][]
}

/**
 * Ask the Worker for region-based animation data (single LLM call).
 * Returns bounding boxes + per-frame offsets for the frontend to apply.
 */
export async function animateGrid(name: string): Promise<{
  regions: GridRegion[]
  failed: boolean
  notice?: string
}> {
  if (!API_URL) {
    return { regions: [], failed: true, notice: 'No API URL configured.' }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    const res = await fetch(`${API_URL}/animate-sprite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, gridMode: true }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok || !res.headers.get('content-type')?.includes('json')) {
      return { regions: [], failed: true, notice: 'Grid animation service unavailable.' }
    }

    const data = await res.json()
    const regions: GridRegion[] = Array.isArray(data.regions) ? data.regions : []
    return { regions, failed: regions.length === 0 }
  } catch (err) {
    console.error('Grid animation error:', err)
    return { regions: [], failed: true, notice: 'Grid animation error.' }
  }
}

/**
 * Apply region pixel-shifts to a base grid to produce 3 animation frames.
 * For each frame: deep-copy the base, clear source regions, paint shifted pixels.
 */
export function buildGridFrames(baseGrid: PixelFrame, regions: GridRegion[]): PixelFrame[] {
  const size = baseGrid.length
  if (size === 0 || regions.length === 0) return []

  return [0, 1, 2].map(frameIdx => {
    // Deep copy base
    const frame: PixelFrame = baseGrid.map(row => [...row])

    for (const region of regions) {
      const [dx, dy] = region.offsets[frameIdx] || [0, 0]
      if (dx === 0 && dy === 0) continue

      // Collect pixels from the region (read from BASE, not current frame)
      const pixels: { x: number; y: number; color: string | null }[] = []
      for (let ry = region.y; ry < region.y + region.h && ry < size; ry++) {
        for (let rx = region.x; rx < region.x + region.w && rx < size; rx++) {
          if (ry >= 0 && rx >= 0 && baseGrid[ry]?.[rx]) {
            pixels.push({ x: rx, y: ry, color: baseGrid[ry][rx] })
          }
        }
      }

      // Clear source positions in this frame
      for (const p of pixels) {
        frame[p.y][p.x] = null
      }

      // Paint at shifted positions
      for (const p of pixels) {
        const nx = p.x + dx
        const ny = p.y + dy
        if (nx >= 0 && nx < size && ny >= 0 && ny < size && p.color) {
          frame[ny][nx] = p.color
        }
      }
    }

    return frame
  })
}

/* ═══════════════════════════════════════════════════════
   K8S CREATURE DEPLOYMENT
   ═══════════════════════════════════════════════════════ */

export interface DeployResult {
  deployment: string
  replicas: number
  strategy: string
  ttl: number
  error?: string
}

export interface PodStatus {
  name: string
  phase: string
  ready: boolean
  started: string | null
  restarts?: number
}

export interface PodsResult {
  deployment: string
  exists: boolean
  replicas: number
  readyReplicas: number
  pods: PodStatus[]
  error?: string
}

/** Create a real creature deployment on k3s. */
export async function deployCreature(
  name: string,
  replicas: number,
  strategy: 'RollingUpdate' | 'Recreate',
): Promise<DeployResult> {
  try {
    const res = await fetch(`${API_URL}/k8s/deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, replicas, strategy }),
    })

    const data = await res.json() as any

    if (!res.ok) {
      return {
        deployment: '',
        replicas: 0,
        strategy: '',
        ttl: 0,
        error: data.error || `HTTP ${res.status}`,
      }
    }

    return data as DeployResult
  } catch (err) {
    console.error('Deploy error:', err)
    return { deployment: '', replicas: 0, strategy: '', ttl: 0, error: 'Network error' }
  }
}

/** Poll pod status for a creature deployment. */
export async function getCreaturePods(deployment: string): Promise<PodsResult> {
  try {
    const res = await fetch(`${API_URL}/k8s/pods?deployment=${encodeURIComponent(deployment)}`)
    const data = await res.json() as any

    if (!res.ok) {
      return { deployment, exists: false, replicas: 0, readyReplicas: 0, pods: [], error: data.error }
    }

    return data as PodsResult
  } catch (err) {
    console.error('Pod status error:', err)
    return { deployment, exists: false, replicas: 0, readyReplicas: 0, pods: [], error: 'Network error' }
  }
}

/** Tear down a creature deployment. */
export async function teardownCreature(deployment: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/k8s/deploy/${encodeURIComponent(deployment)}`, {
      method: 'DELETE',
    })
    return res.ok
  } catch {
    return false
  }
}

export interface PodMetric {
  podName: string
  cpu: string
  memory: string
}

/** Fetch real CPU/mem metrics for pods in a deployment (metrics-server). */
export async function getCreatureMetrics(deployment: string): Promise<PodMetric[]> {
  try {
    const res = await fetch(`${API_URL}/k8s/pod-metrics?deployment=${encodeURIComponent(deployment)}`)
    const data = await res.json() as any
    return (data.metrics || []) as PodMetric[]
  } catch {
    return []
  }
}

/** Delete a single pod so the ReplicaSet respawns it (restart). */
export async function restartPod(podName: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/k8s/pods/${encodeURIComponent(podName)}`, {
      method: 'DELETE',
    })
    return res.ok
  } catch {
    return false
  }
}
