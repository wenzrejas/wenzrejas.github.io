import type { Clock } from 'three'

export const MAX_FRAME_SECONDS = 0.05
const FALLBACK_FRAME_SECONDS = 0.016

export const MILLISECONDS_PER_SECOND = 1000

export const toMilliseconds = (seconds: number) => seconds * MILLISECONDS_PER_SECOND

export const toSeconds = (milliseconds: number) => milliseconds / MILLISECONDS_PER_SECOND

export const nowSeconds = () => toSeconds(performance.now())

export const clampFrameSeconds = (delta: number) =>
  isFinite(delta) && delta >= 0 ? Math.min(delta, MAX_FRAME_SECONDS) : FALLBACK_FRAME_SECONDS

export const waitSeconds = (seconds: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, toMilliseconds(seconds))
  })

export function loopAnimationFrames(onFrame: (milliseconds: number) => void) {
  let frame = requestAnimationFrame(function tick(milliseconds) {
    onFrame(milliseconds)
    frame = requestAnimationFrame(tick)
  })
  return () => cancelAnimationFrame(frame)
}

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
  const seconds = clock.lastStamp === null ? 0 : toSeconds(now - clock.lastStamp)
  clock.lastStamp = now
  clock.delta = isPaused ? 0 : Math.min(seconds, MAX_FRAME_SECONDS)
  clock.elapsed += clock.delta
}
