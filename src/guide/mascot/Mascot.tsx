import { useEffect, useRef } from 'react'
import { currentPage, useGuideStore } from '@/store/guideStore'
import { createPlayback, stepPlayback } from './mascotPlayback'
import { drawMascotFrame } from './mascotSheets'
import './Mascot.scss'

export default function Mascot({ isMirrored }: { isMirrored: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    canvas.width = Math.round(canvas.clientWidth * window.devicePixelRatio)
    canvas.height = Math.round(canvas.clientHeight * window.devicePixelRatio)

    const playback = createPlayback()
    let frame = 0
    const tick = (milliseconds: number) => {
      const guide = useGuideStore.getState()
      const page = currentPage(guide)
      if (stepPlayback(playback, page, guide.isDismissed, milliseconds / 1000)) {
        drawMascotFrame(context, playback)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={isMirrored ? 'mascot mascot--mirrored' : 'mascot'}
      aria-hidden="true"
    />
  )
}
