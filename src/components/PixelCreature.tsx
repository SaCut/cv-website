import { useState, useEffect } from 'react'
import type { CreatureData } from '../types'

interface Props {
  creature: CreatureData
  size?: number
  /** Offset the animation start so multiple creatures don't sync */
  phaseOffset?: number
}

/**
 * Renders an animated pixel sprite by cycling through frames.
 * Same visual language as the CV page sprites — CSS grid, rounded pixels, warm feel.
 */
export default function PixelCreature({ creature, size = 5, phaseOffset = 0 }: Props) {
  const [frameIndex, setFrameIndex] = useState(0)
  const frameCount = creature.frames.length

  useEffect(() => {
    if (frameCount <= 1) return

    let mounted = true
    let interval: ReturnType<typeof setInterval>

    // Stagger start based on phaseOffset
    const delay = setTimeout(() => {
      if (!mounted) return
      interval = setInterval(() => {
        setFrameIndex(prev => (prev + 1) % frameCount)
      }, 250) // 4 FPS — smooth enough for pixel art, charming tempo
    }, phaseOffset * 60) // slight stagger between pods

    return () => {
      mounted = false
      clearTimeout(delay)
      if (interval) clearInterval(interval)
    }
  }, [frameCount, phaseOffset])

  const frame = creature.frames[frameIndex] || creature.frames[0]
  if (!frame) return null

  const rows = frame.length
  const cols = frame[0]?.length || 16
  // Auto-size pixels: target ~160px across, clamped 4-10px
  const autoSize = Math.max(4, Math.min(10, Math.floor(160 / Math.max(rows, cols))))
  const px = size !== 5 ? size : autoSize  // respect explicit override, otherwise compute

  return (
    <div
      className="pixel-creature"
      aria-label={`Pixel art ${creature.name}`}
      role="img"
      style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${cols}, ${px}px)`,
        gridTemplateRows: `repeat(${rows}, ${px}px)`,
        gap: '0.5px',
      }}
    >
      {frame.map((row, y) =>
        row.map((colour, x) =>
          colour ? (
            <span
              key={`${y}-${x}`}
              className="vx"
              style={{
                gridRow: y + 1,
                gridColumn: x + 1,
                background: colour,
                display: 'block',
                borderRadius: '1px',
              }}
            />
          ) : null,
        ),
      )}
    </div>
  )
}
