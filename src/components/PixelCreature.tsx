import { useState, useEffect, useRef } from 'react'
import type { CreatureData } from '../types'

interface Props {
  creature: CreatureData
  size?: number
  /** Offset the animation start so multiple creatures don't sync */
  phaseOffset?: number
}

/**
 * Renders an animated pixel sprite by cycling through frames.
 * Same visual language as the CV page sprites: CSS grid, rounded pixels, warm feel.
 * Pixel size adapts to the available container space via ResizeObserver.
 */
export default function PixelCreature({ creature, size = 5, phaseOffset = 0 }: Props) {
  const [frameIndex, setFrameIndex] = useState(0)
  const [containerPx, setContainerPx] = useState(160)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const frameCount = creature.frames.length

  // Observe container size so the sprite fills the viewport it lives in
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setContainerPx(Math.floor(Math.min(width, height)))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (frameCount <= 1) return

    let mounted = true
    let interval: ReturnType<typeof setInterval>

    // Vary frame rate slightly per creature so multiple pods drift out of sync
    const frameMs = 200 + Math.floor((phaseOffset * 17) % 100)

    // Stagger start based on phaseOffset
    const delay = setTimeout(() => {
      if (!mounted) return
      interval = setInterval(() => {
        setFrameIndex(prev => (prev + 1) % frameCount)
      }, frameMs)
    }, phaseOffset * 60)

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

  // Derive pixel size from measured container; fall back to explicit `size` override
  const autoPx = Math.max(2, Math.floor((containerPx - 4) / Math.max(rows, cols)))
  const px = size !== 5 ? size : autoPx

  return (
    <div
      ref={wrapperRef}
      style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
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
    </div>
  )
}
