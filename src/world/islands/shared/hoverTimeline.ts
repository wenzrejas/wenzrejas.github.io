import * as THREE from 'three'

export interface HoverTimeline {
  isHovered: boolean
  seconds: number
  engagedSeconds: number
  presence: number
}

const { smoothstep } = THREE.MathUtils

export const createHoverTimeline = (): HoverTimeline => ({
  isHovered: false,
  seconds: 0,
  engagedSeconds: 0,
  presence: 0,
})

export function stepHoverTimeline(
  timeline: HoverTimeline,
  isEngaged: boolean,
  dt: number,
  releaseSeconds: number,
  fullSeconds: number
) {
  timeline.engagedSeconds = isEngaged && timeline.presence === 0 ? 0 : timeline.engagedSeconds + dt
  if (isEngaged) {
    if (timeline.presence === 0) timeline.presence = 1
    timeline.presence = Math.min(timeline.presence + dt / releaseSeconds, 1)
    timeline.seconds = Math.min(timeline.seconds + dt, fullSeconds)
  } else {
    timeline.presence = Math.max(timeline.presence - dt / releaseSeconds, 0)
    if (timeline.presence === 0) timeline.seconds = 0
  }
}

export const timelineStage = ({ seconds, presence }: HoverTimeline, length: number) =>
  smoothstep(seconds, 0, length) * presence
