import type { RefObject } from 'react'
import { useResizeEffect } from '@/hooks/useResizeEffect'
import { parchmentPixelRatio } from '@/panels/shared/parchment/parchmentModel'
import { paintMapPaper } from './mapPaperModel'
import './MapPaper.scss'

interface MapPaperProps {
  ref: RefObject<HTMLCanvasElement | null>
}

export default function MapPaper({ ref }: MapPaperProps) {
  useResizeEffect(ref, (width, height) => {
    const canvas = ref.current
    if (!canvas || width === 0 || height === 0) return
    paintMapPaper(canvas, width, height, parchmentPixelRatio())
  })

  return <canvas ref={ref} className="map-paper" aria-hidden="true" />
}
