import * as THREE from 'three'
import { DRAW_EARLY_TICK_SHARE, LONGEST_TICK_MS, TICK_RISE_SHARE } from './constants'

interface FramePace {
  nextFrameAt: number
  frameStartedAt: number
  lastTickAt: number | null
  tickMs: number
}

export const createFramePace = (): FramePace => ({
  nextFrameAt: 0,
  frameStartedAt: 0,
  lastTickAt: null,
  tickMs: 0,
})

export function markFrameStart(pace: FramePace, timestamp: number) {
  pace.frameStartedAt = timestamp
}

const earliestDrawAt = ({ nextFrameAt, tickMs }: FramePace) =>
  nextFrameAt - tickMs * DRAW_EARLY_TICK_SHARE

export function measureTick(pace: FramePace, now: number) {
  if (pace.lastTickAt !== null) {
    const gap = Math.min(now - pace.lastTickAt, LONGEST_TICK_MS)
    const isShorter = pace.tickMs === 0 || gap < pace.tickMs
    pace.tickMs = isShorter ? gap : THREE.MathUtils.lerp(pace.tickMs, gap, TICK_RISE_SHARE)
  }
  pace.lastTickAt = now
}

export function countDrawnFrame(pace: FramePace, now: number, intervalMs: number | null) {
  if (intervalMs === null || now < earliestDrawAt(pace)) return
  pace.nextFrameAt = Math.max(pace.nextFrameAt + intervalMs, now)
}

export const isNextTickDue = (pace: FramePace, now: number, intervalMs: number | null) =>
  intervalMs === null || now + pace.tickMs >= earliestDrawAt(pace)
