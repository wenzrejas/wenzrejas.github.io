import type { Clock } from 'three'

export const MAX_FRAME_SECONDS = 0.05
export const FALLBACK_FRAME_SECONDS = 0.016

export function resumeClock(clock: Clock) {
  const elapsedSeconds = clock.elapsedTime
  clock.start()
  clock.elapsedTime = elapsedSeconds
}
