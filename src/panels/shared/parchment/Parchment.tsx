import { useRef, type CSSProperties } from 'react'
import { useResizeEffect } from '@/hooks/useResizeEffect'
import { PARCHMENT_MARGIN } from './constants'
import { paintParchment, parchmentPixelRatio } from './parchmentModel'
import './Parchment.scss'

const CANVAS_BLEED: CSSProperties = {
  top: -PARCHMENT_MARGIN,
  left: -PARCHMENT_MARGIN,
  width: `calc(100% + ${PARCHMENT_MARGIN * 2}px)`,
  height: `calc(100% + ${PARCHMENT_MARGIN * 2}px)`,
}

export default function Parchment() {
  const frameRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useResizeEffect(frameRef, (width, height) => {
    const canvas = canvasRef.current
    if (!canvas || width === 0 || height === 0) return
    paintParchment(canvas, width, height, parchmentPixelRatio())
  })

  return (
    <div ref={frameRef} className="parchment" aria-hidden="true">
      <canvas ref={canvasRef} className="parchment__canvas" style={CANVAS_BLEED} />
    </div>
  )
}
