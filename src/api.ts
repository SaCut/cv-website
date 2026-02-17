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

export async function generateCreature(name: string): Promise<GenerateResult> {
  if (!API_URL) {
    return {
      creature: getRandomCreature(name),
      aiFailed: true,
      fallbackModel: false,
      notice: pickQuip(FALLBACK_QUIPS),
    }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30s for LLM

    const res = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: name }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      return {
        creature: getRandomCreature(name),
        aiFailed: true,
        fallbackModel: false,
        notice: pickQuip(FALLBACK_QUIPS),
      }
    }

    const data = await res.json()

    if (!Array.isArray(data.frames) || data.frames.length === 0) {
      return {
        creature: getRandomCreature(name),
        aiFailed: true,
        fallbackModel: false,
        notice: pickQuip(FALLBACK_QUIPS),
      }
    }

    return {
      creature: {
        name,
        frames: data.frames,
        primaryColour: data.primaryColour || '#00d4ff',
      },
      aiFailed: false,
      fallbackModel: !!data.fallbackModel,
      notice: data.fallbackModel ? pickQuip(MODEL_SWAP_QUIPS) : undefined,
    }
  } catch {
    return {
      creature: getRandomCreature(name),
      aiFailed: true,
      fallbackModel: false,
      notice: pickQuip(FALLBACK_QUIPS),
    }
  }
}
