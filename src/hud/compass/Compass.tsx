import { useEffect, useRef } from 'react'
import { useShipStore } from '@/store/shipStore'
import { TAPE_MARKS, tapeOffset } from './tape'
import './Compass.scss'

export default function Compass() {
  const tapeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tape = tapeRef.current
    if (!tape) return

    let frame = 0
    const tick = () => {
      tape.style.transform = `translateX(${tapeOffset(useShipStore.getState().heading)}px)`
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="compass">
      <div className="compass__window">
        <div className="compass__tape" ref={tapeRef}>
          {TAPE_MARKS.map(({ x, label }) => (
            <span key={x} className="compass__mark" style={{ left: x }}>
              {label}
            </span>
          ))}
        </div>
      </div>
      <span className="compass__line" />
      <span className="compass__pointer" />
    </div>
  )
}
