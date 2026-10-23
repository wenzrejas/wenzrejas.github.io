import * as THREE from 'three'
import { ARRIVAL_LEVEL, DEPTH_LEVEL_COUNT, LEVEL_DROP, LEVEL_ZIGZAG } from '../constants'
import {
  KEY_SCROLL_LEVELS_PER_SECOND,
  SCROLL_EASE_RATE,
  SCROLL_LEVELS_PER_PIXEL,
  WHEEL_LINE_PIXELS,
} from './constants'

export interface Timeline {
  targetLevel: number
  viewedLevel: number
  levelsPerSecond: number
}

export const DEEPEST_LEVEL = DEPTH_LEVEL_COUNT - 1

function levelAcross(level: number) {
  if (level === DEEPEST_LEVEL) return 0
  return level % 2 === 0 ? -LEVEL_ZIGZAG : LEVEL_ZIGZAG
}

export const levelDepth = (level: number) => -level * LEVEL_DROP

export const levelSpot = (level: number, out: THREE.Vector3) =>
  out.set(levelAcross(level), levelDepth(level), 0)

export const deepestDepth = () => levelDepth(DEEPEST_LEVEL)

export const createTimeline = (): Timeline => ({
  targetLevel: ARRIVAL_LEVEL,
  viewedLevel: ARRIVAL_LEVEL,
  levelsPerSecond: 0,
})

export function scrollTimeline(timeline: Timeline, levels: number) {
  timeline.targetLevel = THREE.MathUtils.clamp(
    timeline.targetLevel + levels,
    ARRIVAL_LEVEL,
    DEEPEST_LEVEL
  )
}

export const wheelLevels = ({ deltaY, deltaMode }: WheelEvent) =>
  (deltaMode === WheelEvent.DOM_DELTA_LINE ? deltaY * WHEEL_LINE_PIXELS : deltaY) *
  SCROLL_LEVELS_PER_PIXEL

export function stepTimeline(timeline: Timeline, heldDirection: number, dt: number) {
  scrollTimeline(timeline, heldDirection * KEY_SCROLL_LEVELS_PER_SECOND * dt)
  const previous = timeline.viewedLevel
  timeline.viewedLevel = THREE.MathUtils.damp(previous, timeline.targetLevel, SCROLL_EASE_RATE, dt)
  timeline.levelsPerSecond = dt > 0 ? (timeline.viewedLevel - previous) / dt : 0
}

export function rewindTimeline(timeline: Timeline, fromLevel: number, share: number) {
  timeline.viewedLevel = THREE.MathUtils.lerp(fromLevel, ARRIVAL_LEVEL, share)
  timeline.targetLevel = timeline.viewedLevel
  timeline.levelsPerSecond = 0
}

export const hasReachedBottom = ({ targetLevel }: Timeline) => targetLevel >= DEEPEST_LEVEL

export const depthShare = ({ viewedLevel }: Timeline) =>
  THREE.MathUtils.clamp(viewedLevel / DEEPEST_LEVEL, 0, 1)
