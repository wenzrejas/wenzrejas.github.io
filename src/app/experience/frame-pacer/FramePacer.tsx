import { useEffect, useMemo } from 'react'
import { addEffect, useFrame, useThree } from '@react-three/fiber'
import { frameIntervalMs } from '@/store/settingsStore'
import {
  countDrawnFrame,
  createFramePace,
  isNextTickDue,
  markFrameStart,
  measureTick,
} from './framePacing'

export default function FramePacer() {
  const invalidate = useThree((state) => state.invalidate)
  const pace = useMemo(() => createFramePace(), [])

  useEffect(() => addEffect((timestamp) => markFrameStart(pace, timestamp)), [pace])

  useEffect(() => {
    let tick = requestAnimationFrame(function wake(now) {
      tick = requestAnimationFrame(wake)
      measureTick(pace, now)
      if (isNextTickDue(pace, now, frameIntervalMs())) invalidate()
    })
    return () => cancelAnimationFrame(tick)
  }, [pace, invalidate])

  useFrame(({ invalidate }) => {
    const intervalMs = frameIntervalMs()
    countDrawnFrame(pace, pace.frameStartedAt, intervalMs)
    if (isNextTickDue(pace, pace.frameStartedAt, intervalMs)) invalidate()
  })

  return null
}
