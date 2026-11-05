import * as THREE from 'three'
import { DRAW_EARLY_TICK_SHARE, LONGEST_TICK_MILLISECONDS, TICK_RISE_SHARE } from './constants'

interface FramePace {
  nextFrameAt: number
  frameStartedAt: number
  lastTickAt: number | null
  tickMilliseconds: number
}

export const createFramePace = (): FramePace => ({
  nextFrameAt: 0,
  frameStartedAt: 0,
  lastTickAt: null,
  tickMilliseconds: 0,
})

export function markFrameStart(pace: FramePace, timestamp: number) {
  pace.frameStartedAt = timestamp
}

const earliestDrawAt = ({ nextFrameAt, tickMilliseconds }: FramePace) =>
  nextFrameAt - tickMilliseconds * DRAW_EARLY_TICK_SHARE

export function measureTick(pace: FramePace, now: number) {
  if (pace.lastTickAt !== null) {
    const gap = Math.min(now - pace.lastTickAt, LONGEST_TICK_MILLISECONDS)
    const isShorter = pace.tickMilliseconds === 0 || gap < pace.tickMilliseconds
    pace.tickMilliseconds = isShorter
      ? gap
      : THREE.MathUtils.lerp(pace.tickMilliseconds, gap, TICK_RISE_SHARE)
  }
  pace.lastTickAt = now
}

export function countDrawnFrame(pace: FramePace, now: number, intervalMilliseconds: number | null) {
  if (intervalMilliseconds === null || now < earliestDrawAt(pace)) return
  pace.nextFrameAt = Math.max(pace.nextFrameAt + intervalMilliseconds, now)
}

export const isNextTickDue = (pace: FramePace, now: number, intervalMilliseconds: number | null) =>
  intervalMilliseconds === null || now + pace.tickMilliseconds >= earliestDrawAt(pace)
