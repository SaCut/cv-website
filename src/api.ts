import type { CreatureData } from './types'
import { getRandomCreature } from './data/creatures'

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

/** Generate base sprite (Q1 describe → Q2 structure → Q3 colour). */
export async function generateSprite(name: string): Promise<{
  frame: any
  palette: Record<string, string>
  shapes: any[]
  description: string
  primaryColour: string
  failed: boolean
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
