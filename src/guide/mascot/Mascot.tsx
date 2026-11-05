import { useEffect, useRef } from 'react'
import { animated, useSpring } from '@react-spring/web'
import { currentPage, useGuideStore } from '@/store/guideStore'
import { useResizeEffect } from '@/hooks/useResizeEffect'
import { loopAnimationFrames, toSeconds } from '@/utils/time'
import { BOX_CLOSE_SPRING } from '../dialogue-box/constants'
import { MAX_MASCOT_PIXEL_RATIO } from './constants'
import { createPlayback, stepPlayback } from './mascotPlayback'
import { drawMascotFrame } from './mascotSheets'
import './Mascot.scss'

export default function Mascot({ isMirrored }: { isMirrored: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playback = useRef(createPlayback())
  const isSpeaking = useGuideStore((state) => state.dialogue !== null)
  const isDismissed = useGuideStore((state) => state.isDismissed)
  const { opacity } = useSpring({
    opacity: isSpeaking ? 1 : 0,
    immediate: isSpeaking || isDismissed,
    config: BOX_CLOSE_SPRING,
  })

  useResizeEffect(canvasRef, (width, height) => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const ratio = Math.min(window.devicePixelRatio, MAX_MASCOT_PIXEL_RATIO)
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    drawMascotFrame(context, playback.current)
  })

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d')
    if (!context) return
    return loopAnimationFrames((milliseconds) => {
      const guide = useGuideStore.getState()
      const page = currentPage(guide)
      if (stepPlayback(playback.current, page, guide.isDismissed, toSeconds(milliseconds))) {
        drawMascotFrame(context, playback.current)
      }
    })
  }, [])

  return (
    <animated.canvas
      ref={canvasRef}
      className={isMirrored ? 'mascot mascot--mirrored' : 'mascot'}
      style={{ opacity }}
      aria-hidden="true"
    />
  )
}
