import type { Clock } from 'three'

export const MAX_FRAME_SECONDS = 0.05
export const FALLBACK_FRAME_SECONDS = 0.016

export function resumeClock(clock: Clock) {
  const elapsedSeconds = clock.elapsedTime
  clock.start()
  clock.elapsedTime = elapsedSeconds
}

export interface WallClock {
  elapsed: number
  delta: number
  lastStamp: number | null
}

export const createWallClock = (): WallClock => ({ elapsed: 0, delta: 0, lastStamp: null })

export function tickWallClock(clock: WallClock, isPaused = false) {
  const now = performance.now()
  const frameSeconds = clock.lastStamp === null ? 0 : (now - clock.lastStamp) / 1000
  clock.lastStamp = now
  clock.delta = isPaused ? 0 : Math.min(frameSeconds, MAX_FRAME_SECONDS)
  clock.elapsed += clock.delta
}
