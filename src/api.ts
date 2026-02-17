import type { CreatureData } from './types'
import { getRandomCreature } from './data/creatures'

const API_URL = import.meta.env.VITE_API_URL || ''

export async function generateCreature(name: string): Promise<CreatureData> {
  if (!API_URL) return getRandomCreature(name)

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: name }),
      signal: controller.signal,
    })

    clearTimeout(timeout)
    if (!res.ok) throw new Error('API error')

    const data = await res.json()
    if (!Array.isArray(data.voxels) || data.voxels.length === 0) throw new Error('Bad data')

    return {
      name,
      voxels: data.voxels,
      primaryColor: data.primaryColor || '#00d4ff',
      scale: data.scale || 1,
      animation: data.animation || 'hover',
    }
  } catch {
    return getRandomCreature(name)
  }
}
