import { stepHoverTimeline, timelineStage, type HoverTimeline } from '../shared/hoverTimeline'
import {
  AWAKEN_ECHO_SECONDS,
  AWAKEN_GLOW_SECONDS,
  AWAKEN_RELEASE_SECONDS,
  AWAKEN_SPIRAL_SECONDS,
  FRAGMENT_RISE_SECONDS,
  RIPPLE_SECONDS,
} from './constants'

const FULL_AWAKE_SECONDS = Math.max(
  AWAKEN_GLOW_SECONDS,
  AWAKEN_SPIRAL_SECONDS,
  AWAKEN_ECHO_SECONDS,
  FRAGMENT_RISE_SECONDS
)

export const stepAwakening = (awakening: HoverTimeline, dt: number) =>
  stepHoverTimeline(awakening, awakening.isHovered, dt, AWAKEN_RELEASE_SECONDS, FULL_AWAKE_SECONDS)

export const glowLevel = (awakening: HoverTimeline) => timelineStage(awakening, AWAKEN_GLOW_SECONDS)

export const spiralLevel = (awakening: HoverTimeline) =>
  timelineStage(awakening, AWAKEN_SPIRAL_SECONDS)

export const echoLevel = (awakening: HoverTimeline) => timelineStage(awakening, AWAKEN_ECHO_SECONDS)

export const riseLevel = (awakening: HoverTimeline) =>
  timelineStage(awakening, FRAGMENT_RISE_SECONDS)

export const ripplePhase = ({ engagedSeconds }: HoverTimeline) => engagedSeconds / RIPPLE_SECONDS
