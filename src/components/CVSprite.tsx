import { useEffect, useRef, useState } from 'react'
import { CV_SPRITES } from '../data/cv-sprites'

interface Props {
  name: string
  className?: string
  size?: number
}

/**
 * Frame-cycling pixel sprite for CV section illustrations.
 * Each sprite has multiple frames with actual pixel-level changes
 * (blinking lights, rising bubbles, cursor blink, etc.).
 */
export default function CVSprite({ name, className, size = 6 }: Props) {
  const sprite = CV_SPRITES[name]
  const [frameIndex, setFrameIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    if (!sprite || sprite.frames.length <= 1) return
    intervalRef.current = setInterval(() => {
      setFrameIndex(i => (i + 1) % sprite.frames.length)
    }, sprite.interval)
    return () => clearInterval(intervalRef.current)
  }, [sprite])

  if (!sprite) return null

  const frame = sprite.frames[frameIndex]
  const cols = frame[0]?.length ?? 16
  const rows = frame.length

  return (
    <div
      className={`cv-sprite ${className ?? ''}`}
      aria-label={`Pixel art ${sprite.label}`}
      role="img"
      style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${cols}, ${size}px)`,
        gridTemplateRows: `repeat(${rows}, ${size}px)`,
        gap: '0.5px',
        flexShrink: 0,
      }}
    >
      {frame.map((row, y) =>
        row.map((color, x) =>
          color ? (
            <span
              key={`${y}-${x}`}
              style={{
                display: 'block',
                gridRow: y + 1,
                gridColumn: x + 1,
                background: color,
                borderRadius: '1px',
                transition: 'background 0.15s ease',
              }}
            />
          ) : null,
        ),
      )}
    </div>
  )
}
