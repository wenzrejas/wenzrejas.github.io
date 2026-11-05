import { useEffect, useMemo } from 'react'
import { addEffect, useFrame, useThree } from '@react-three/fiber'
import { frameIntervalMilliseconds } from '@/store/settingsStore'
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
      if (isNextTickDue(pace, now, frameIntervalMilliseconds())) invalidate()
    })
    return () => cancelAnimationFrame(tick)
  }, [pace, invalidate])

  useFrame(() => {
    const intervalMilliseconds = frameIntervalMilliseconds()
    countDrawnFrame(pace, pace.frameStartedAt, intervalMilliseconds)
    if (isNextTickDue(pace, pace.frameStartedAt, intervalMilliseconds)) invalidate()
  })

  return null
}
