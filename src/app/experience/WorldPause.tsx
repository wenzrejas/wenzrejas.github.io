import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { isWorldPaused, useViewStore } from '@/store/viewStore'
import { resumeClock } from '@/utils/time'

export default function WorldPause() {
  const clock = useThree((state) => state.clock)

  useEffect(
    () =>
      useViewStore.subscribe((view, previous) => {
        const isPaused = isWorldPaused(view)
        if (isPaused === isWorldPaused(previous)) return
        if (isPaused) clock.stop()
        else resumeClock(clock)
      }),
    [clock]
  )

  return null
}
