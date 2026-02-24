import type { CreatureData, BgOp } from "./types"
import { getRandomCreature } from "./data/creatures"
import { logSpriteResponse } from "./debug"

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://pipeline-cv-worker.xartab-mail-flare.workers.dev"

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
export async function generateSprite(
  name: string,
  debug = false,
): Promise<{
  frame: any
  palette: Record<string, string>
  shapes: any[]
  description: string
  primaryColour: string
  failed: boolean
  /** Base64 PNG returned by CF Workers AI — skips animation pipeline when present. */
  imageBase64?: string
  /** Background removal operation plan chosen by the vision model. */
  bgOps?: BgOp[]
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
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: name }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok || !res.headers.get("content-type")?.includes("json")) {
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

    // CF Workers AI image path — base64 for frontend rasterisation
    if (data.imageBase64) {
      if (debug) logSpriteResponse(name, data.imageBase64, data).catch(() => {})
      return {
        frame: null,
        palette: {},
        shapes: [],
        description: name,
        primaryColour: data.primaryColour || "#00d4ff",
        imageBase64: data.imageBase64,
        bgOps: Array.isArray(data.bgOps) ? (data.bgOps as BgOp[]) : undefined,
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
      primaryColour: data.primaryColour || "#00d4ff",
      failed: false,
    }
  } catch (err) {
    console.error("Sprite generation error:", err)
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
      notice: "No sprite data to animate.",
    }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    const res = await fetch(`${API_URL}/animate-sprite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ palette, shapes, description, name }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok || !res.headers.get("content-type")?.includes("json")) {
      return {
        frames: [],
        failed: true,
        notice: "Animation service unavailable.",
      }
    }

    const data = await res.json()

    if (!Array.isArray(data.frames) || data.frames.length === 0) {
      return {
        frames: [],
        failed: true,
        notice: "Animation generation failed.",
      }
    }

    return {
      frames: data.frames,
      failed: false,
    }
  } catch (err) {
    console.error("Animation error:", err)
    return {
      frames: [],
      failed: true,
      notice: "Animation generation error.",
    }
  }
}

/* ═══════════════════════════════════════════════════════
   CF AI IMAGE → PIXEL GRID RASTERISATION
   ═══════════════════════════════════════════════════════ */

import type { PixelFrame } from "./types"

/**
 * Unsharp mask over a flat RGBA Uint8ClampedArray.
 * Sharpens edges before colour sampling to produce crisper pixel art.
 * amount=1.5 gives strong sharpening without visible haloing.
 */
function unsharpMask(
  src: Uint8ClampedArray,
  width: number,
  height: number,
  amount = 1.5,
): Uint8ClampedArray {
  const blur = new Uint8ClampedArray(src.length)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rS = 0,
        gS = 0,
        bS = 0,
        cnt = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx,
            ny = y + dy
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
          const ni = (ny * width + nx) * 4
          rS += src[ni]
          gS += src[ni + 1]
          bS += src[ni + 2]
          cnt++
        }
      }
      const ci = (y * width + x) * 4
      blur[ci] = rS / cnt
      blur[ci + 1] = gS / cnt
      blur[ci + 2] = bS / cnt
      blur[ci + 3] = src[ci + 3]
    }
  }

  const out = new Uint8ClampedArray(src.length)
  for (let i = 0; i < src.length; i += 4) {
    out[i] = Math.min(255, Math.max(0, src[i] + amount * (src[i] - blur[i])))
    out[i + 1] = Math.min(
      255,
      Math.max(0, src[i + 1] + amount * (src[i + 1] - blur[i + 1])),
    )
    out[i + 2] = Math.min(
      255,
      Math.max(0, src[i + 2] + amount * (src[i + 2] - blur[i + 2])),
    )
    out[i + 3] = src[i + 3]
  }

  return out
}

/**
 * Draw a base64 image onto a canvas at native resolution and extract a
 * palette-quantised pixel grid. Matches the lab pipeline exactly:
 * single native canvas, per-source-pixel bg mask (default tol=15 + erode 1),
 * unsharp before sampling, inner-block mode colour pick.
 */
export function rasterizeImageToGrid(
  imageBase64: string,
  size = 32,
  bgOps?: BgOp[],
): Promise<PixelFrame> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      // Single native-resolution canvas — matches the lab pipeline exactly.
      // No small-scale pass; bg mask and colour sampling both operate at native scale.
      const nativeSize = Math.max(img.naturalWidth || 512, 512)
      const nCanvas = document.createElement("canvas")
      nCanvas.width = nativeSize
      nCanvas.height = nativeSize
      const nCtx = nCanvas.getContext("2d")!
      nCtx.imageSmoothingEnabled = false
      const nCrop = nativeSize * 0.07
      nCtx.drawImage(
        img,
        -nCrop,
        -nCrop,
        nativeSize + nCrop * 2,
        nativeSize + nCrop * 2,
      )
      const raw = nCtx.getImageData(0, 0, nativeSize, nativeSize).data

      // ── Bg mask at native resolution ─────────────────────────────────────
      // Per-source-pixel mask; checked per-pixel during sampling, not per cell.
      const cornerIdxs = [
        0,
        (nativeSize - 1) * 4,
        nativeSize * (nativeSize - 1) * 4,
        (nativeSize * nativeSize - 1) * 4,
      ]
      const bgR = Math.round(cornerIdxs.reduce((s, i) => s + raw[i], 0) / 4)
      const bgG = Math.round(cornerIdxs.reduce((s, i) => s + raw[i + 1], 0) / 4)
      const bgB = Math.round(cornerIdxs.reduce((s, i) => s + raw[i + 2], 0) / 4)

      const isBgAt = (idx: number, tol: number) =>
        Math.abs(raw[idx] - bgR) +
          Math.abs(raw[idx + 1] - bgG) +
          Math.abs(raw[idx + 2] - bgB) <
        tol * 3

      const nativeMask = new Uint8Array(nativeSize * nativeSize) // 1 = background

      const ops: BgOp[] = bgOps?.length
        ? bgOps
        : [
            { op: "flood_fill", seeds: "edges", tolerance: 15 },
            { op: "erode", passes: 1 },
          ]

      for (const op of ops) {
        switch (op.op) {
          case "flood_fill": {
            const q: number[] = []

            if (op.seeds === "edges") {
              for (let x = 0; x < nativeSize; x++) {
                for (const y of [0, nativeSize - 1]) {
                  const p = y * nativeSize + x
                  if (isBgAt(p * 4, op.tolerance) && !nativeMask[p]) {
                    nativeMask[p] = 1
                    q.push(p)
                  }
                }
              }
              for (let y = 1; y < nativeSize - 1; y++) {
                for (const x of [0, nativeSize - 1]) {
                  const p = y * nativeSize + x
                  if (isBgAt(p * 4, op.tolerance) && !nativeMask[p]) {
                    nativeMask[p] = 1
                    q.push(p)
                  }
                }
              }
            } else {
              const rad = Math.floor(nativeSize * 0.15)
              const cx = Math.floor(nativeSize / 2),
                cy = Math.floor(nativeSize / 2)
              for (let dy = -rad; dy <= rad; dy++) {
                for (let dx = -rad; dx <= rad; dx++) {
                  const sx = cx + dx,
                    sy = cy + dy
                  if (sx < 0 || sx >= nativeSize || sy < 0 || sy >= nativeSize)
                    continue
                  const p = sy * nativeSize + sx
                  if (!isBgAt(p * 4, op.tolerance) && !nativeMask[p]) {
                    nativeMask[p] = 1
                    q.push(p)
                  }
                }
              }
            }

            let qi = 0
            while (qi < q.length) {
              const p = q[qi++]
              const px = p % nativeSize,
                py = Math.floor(p / nativeSize)
              for (const [ndx, ndy] of [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1],
              ]) {
                const nx = px + ndx,
                  ny = py + ndy
                if (nx < 0 || nx >= nativeSize || ny < 0 || ny >= nativeSize)
                  continue
                const np = ny * nativeSize + nx
                const match =
                  op.seeds === "edges"
                    ? isBgAt(np * 4, op.tolerance)
                    : !isBgAt(np * 4, op.tolerance)
                if (!nativeMask[np] && match) {
                  nativeMask[np] = 1
                  q.push(np)
                }
              }
            }

            break
          }

          case "threshold": {
            for (let i = 0; i < nativeSize * nativeSize; i++) {
              const idx = i * 4
              let val: number
              switch (op.channel) {
                case "r":
                  val = raw[idx]
                  break
                case "g":
                  val = raw[idx + 1]
                  break
                case "b":
                  val = raw[idx + 2]
                  break
                case "luminance":
                  val = (raw[idx] + raw[idx + 1] + raw[idx + 2]) / 3
                  break
              }
              const pass = op.compare === ">" ? val > op.value : val < op.value
              if (pass) nativeMask[i] = 1
            }

            break
          }

          case "invert": {
            for (let i = 0; i < nativeSize * nativeSize; i++)
              nativeMask[i] = nativeMask[i] ? 0 : 1

            break
          }

          case "erode": {
            for (let pass = 0; pass < op.passes; pass++) {
              const toErase: number[] = []
              for (let y = 0; y < nativeSize; y++) {
                for (let x = 0; x < nativeSize; x++) {
                  const p = y * nativeSize + x
                  if (nativeMask[p]) continue
                  for (const [ndx, ndy] of [
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1],
                  ]) {
                    const nx = x + ndx,
                      ny = y + ndy
                    if (
                      nx < 0 ||
                      nx >= nativeSize ||
                      ny < 0 ||
                      ny >= nativeSize ||
                      nativeMask[ny * nativeSize + nx]
                    ) {
                      toErase.push(p)
                      break
                    }
                  }
                }
              }
              for (const p of toErase) nativeMask[p] = 1
            }

            break
          }

          case "dilate": {
            for (let pass = 0; pass < op.passes; pass++) {
              const toFill: number[] = []
              for (let y = 0; y < nativeSize; y++) {
                for (let x = 0; x < nativeSize; x++) {
                  const p = y * nativeSize + x
                  if (!nativeMask[p]) continue
                  for (const [ndx, ndy] of [
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1],
                  ]) {
                    const nx = x + ndx,
                      ny = y + ndy
                    if (
                      nx >= 0 &&
                      nx < nativeSize &&
                      ny >= 0 &&
                      ny < nativeSize &&
                      !nativeMask[ny * nativeSize + nx]
                    ) {
                      toFill.push(p)
                      break
                    }
                  }
                }
              }
              for (const p of toFill) nativeMask[p] = 0
            }

            break
          }
        }
      }

      // ── Colour sampling from sharpened native image ───────────────────────
      const nd = unsharpMask(raw, nativeSize, nativeSize, 1.5)

      const blockSize = nativeSize / size
      // Skip outer 30% of each block — avoids sampling straddling pixels.
      const INNER = 0.3

      const grid: PixelFrame = []
      for (let gy = 0; gy < size; gy++) {
        const row: (string | null)[] = []
        for (let gx = 0; gx < size; gx++) {
          const x0 = Math.floor((gx + INNER) * blockSize)
          const x1 = Math.ceil((gx + 1 - INNER) * blockSize)
          const y0 = Math.floor((gy + INNER) * blockSize)
          const y1 = Math.ceil((gy + 1 - INNER) * blockSize)
          const freq = new Map<string, number>()

          for (let sy = y0; sy < y1; sy++) {
            for (let sx = x0; sx < x1; sx++) {
              // Per-source-pixel bg check — matches lab behaviour.
              if (nativeMask[sy * nativeSize + sx]) continue
              const si = (sy * nativeSize + sx) * 4
              if (nd[si + 3] < 128) continue
              const qr = Math.min(Math.round(nd[si] / 32) * 32, 252)
              const qg = Math.min(Math.round(nd[si + 1] / 32) * 32, 252)
              const qb = Math.min(Math.round(nd[si + 2] / 32) * 32, 252)
              const hex =
                "#" +
                qr.toString(16).padStart(2, "0") +
                qg.toString(16).padStart(2, "0") +
                qb.toString(16).padStart(2, "0")
              freq.set(hex, (freq.get(hex) ?? 0) + 1)
            }
          }

          if (freq.size === 0) {
            row.push(null)
          } else {
            let best = "",
              bestCount = 0
            for (const [hex, count] of freq) {
              if (count > bestCount) {
                best = hex
                bestCount = count
              }
            }
            row.push(best)
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
    return { regions: [], failed: true, notice: "No API URL configured." }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    const res = await fetch(`${API_URL}/animate-sprite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, gridMode: true }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok || !res.headers.get("content-type")?.includes("json")) {
      return {
        regions: [],
        failed: true,
        notice: "Grid animation service unavailable.",
      }
    }

    const data = await res.json()
    const regions: GridRegion[] = Array.isArray(data.regions)
      ? data.regions
      : []
    return { regions, failed: regions.length === 0 }
  } catch (err) {
    console.error("Grid animation error:", err)
    return { regions: [], failed: true, notice: "Grid animation error." }
  }
}

/**
 * Apply region pixel-shifts to a base grid to produce 3 animation frames.
 * For each frame: deep-copy the base, clear source regions, paint shifted pixels.
 */
export function buildGridFrames(
  baseGrid: PixelFrame,
  regions: GridRegion[],
): PixelFrame[] {
  const size = baseGrid.length
  if (size === 0 || regions.length === 0) return []

  return [0, 1, 2].map((frameIdx) => {
    // Deep copy base
    const frame: PixelFrame = baseGrid.map((row) => [...row])

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
  strategy: "RollingUpdate" | "Recreate",
): Promise<DeployResult> {
  try {
    const res = await fetch(`${API_URL}/k8s/deploy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, replicas, strategy }),
    })

    const data = (await res.json()) as any

    if (!res.ok) {
      return {
        deployment: "",
        replicas: 0,
        strategy: "",
        ttl: 0,
        error: data.error || `HTTP ${res.status}`,
      }
    }

    return data as DeployResult
  } catch (err) {
    console.error("Deploy error:", err)
    return {
      deployment: "",
      replicas: 0,
      strategy: "",
      ttl: 0,
      error: "Network error",
    }
  }
}

/** Poll pod status for a creature deployment. */
export async function getCreaturePods(deployment: string): Promise<PodsResult> {
  try {
    const res = await fetch(
      `${API_URL}/k8s/pods?deployment=${encodeURIComponent(deployment)}`,
    )
    const data = (await res.json()) as any

    if (!res.ok) {
      return {
        deployment,
        exists: false,
        replicas: 0,
        readyReplicas: 0,
        pods: [],
        error: data.error,
      }
    }

    return data as PodsResult
  } catch (err) {
    console.error("Pod status error:", err)
    return {
      deployment,
      exists: false,
      replicas: 0,
      readyReplicas: 0,
      pods: [],
      error: "Network error",
    }
  }
}

/** Tear down a creature deployment. */
export async function teardownCreature(deployment: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_URL}/k8s/deploy/${encodeURIComponent(deployment)}`,
      {
        method: "DELETE",
      },
    )
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
export async function getCreatureMetrics(
  deployment: string,
): Promise<PodMetric[]> {
  try {
    const res = await fetch(
      `${API_URL}/k8s/pod-metrics?deployment=${encodeURIComponent(deployment)}`,
    )
    const data = (await res.json()) as any
    return (data.metrics || []) as PodMetric[]
  } catch {
    return []
  }
}

/** Delete a single pod so the ReplicaSet respawns it (restart). */
export async function restartPod(podName: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_URL}/k8s/pods/${encodeURIComponent(podName)}`,
      {
        method: "DELETE",
      },
    )
    return res.ok
  } catch {
    return false
  }
}

/**
 * Ping the worker to reset the TTL for this deployment.
 * Called periodically while the user is actively viewing their pod cluster,
 * so the cleanup cron does not cull a deployment that is still being watched.
 * Errors are swallowed — a missed heartbeat is not fatal.
 */
export async function heartbeat(deploymentName: string): Promise<void> {
  try {
    await fetch(`${API_URL}/k8s/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deploymentName }),
    })
  } catch {
    // silent — a missed beat is non-fatal
  }
}
