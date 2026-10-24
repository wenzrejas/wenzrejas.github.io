import { useEffect, useRef } from 'react'
import { DEPTHS_COPY } from '@/data/depthsCopy'
import { DEPTH_GAUGE_COPY } from '@/data/hudCopy'
import { useDepthsStore } from '@/store/depthsStore'
import { beginSurfacing } from '@/store/viewStore'
import { MILESTONE_MARKS, tapeOffset } from './milestoneTape'
import './DepthGauge.scss'

interface DepthGaugeProps {
  isTapeShown: boolean
  isLocked: boolean
}

export default function DepthGauge({ isTapeShown, isLocked }: DepthGaugeProps) {
  const tapeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tape = tapeRef.current
    if (!tape) return

    let frame = 0
    const tick = () => {
      const { timeline } = useDepthsStore.getState()
      if (timeline) {
        tape.style.transform = `translateY(${tapeOffset(timeline.viewedLevel)}px)`
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className={isTapeShown ? 'depth-gauge' : 'depth-gauge depth-gauge--bare'} inert={isLocked}>
      <button
        type="button"
        className="depth-gauge__surface"
        aria-label={DEPTHS_COPY.surface}
        onClick={beginSurfacing}
      >
        <span className="depth-gauge__surface-arrow" />
        <span className="depth-gauge__surface-label">{DEPTH_GAUGE_COPY.surface}</span>
      </button>
      <div className="depth-gauge__window">
        <div className="depth-gauge__tape" ref={tapeRef}>
          {MILESTONE_MARKS.map(({ y, label }) => (
            <span key={y} className="depth-gauge__mark" style={{ top: y }}>
              {label}
            </span>
          ))}
        </div>
      </div>
      <span className="depth-gauge__line" />
      <span className="depth-gauge__pointer" />
    </div>
  )
}
