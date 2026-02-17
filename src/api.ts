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

/** Generate base sprite only (step 1 of 2) */
export async function generateSprite(name: string): Promise<{
  frame: any
  legend: Record<string, string>
  spriteRows: string[]
  primaryColour: string
  failed: boolean
  notice?: string
}> {
  if (!API_URL) {
    const fallback = getRandomCreature(name)
    return {
      frame: fallback.frames[0],
      legend: {},
      spriteRows: [],
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
        legend: {},
        spriteRows: [],
        primaryColour: fallback.primaryColour,
        failed: true,
        notice: pickQuip(FALLBACK_QUIPS),
      }
    }

    const data = await res.json()

    if (!data.frame || !data.legend || !data.spriteRows) {
      const fallback = getRandomCreature(name)
      return {
        frame: fallback.frames[0],
        legend: {},
        spriteRows: [],
        primaryColour: fallback.primaryColour,
        failed: true,
        notice: pickQuip(FALLBACK_QUIPS),
      }
    }

    return {
      frame: data.frame,
      legend: data.legend,
      spriteRows: data.spriteRows,
      primaryColour: data.primaryColour || '#00d4ff',
      failed: false,
    }
  } catch (err) {
    console.error('Sprite generation error:', err)
    const fallback = getRandomCreature(name)
    return {
      frame: fallback.frames[0],
      legend: {},
      spriteRows: [],
      primaryColour: fallback.primaryColour,
      failed: true,
      notice: pickQuip(FALLBACK_QUIPS),
    }
  }
}

/** Animate existing sprite (step 2 of 2) */
export async function animateSprite(
  legend: Record<string, string>,
  spriteRows: string[],
): Promise<{
  frames: any[]
  failed: boolean
  notice?: string
}> {
  if (!API_URL || !spriteRows || spriteRows.length === 0) {
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
      body: JSON.stringify({ legend, spriteRows }),
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
