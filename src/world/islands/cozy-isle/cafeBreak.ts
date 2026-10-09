import { isEngaged } from '@/interaction/hover'
import { mix } from '@/utils/math'
import { stepHoverTimeline, timelineStage, type HoverTimeline } from '../shared/hoverTimeline'
import {
  CAFE_BREAK_RELEASE_SECONDS,
  FLARE_RISE_SECONDS,
  NEON_FLICKER_DELAY_SECONDS,
  NEON_FLICKER_DIM,
  NEON_FLICKER_RATE,
  NEON_FLICKER_SECONDS,
} from './constants'

const NEON_LIT_SECONDS = NEON_FLICKER_DELAY_SECONDS + NEON_FLICKER_SECONDS
const FULL_BREAK_SECONDS = Math.max(FLARE_RISE_SECONDS, NEON_LIT_SECONDS)

export const isBreakEngaged = ({ isHovered }: HoverTimeline) => isEngaged(isHovered, 'support')

export const stepCafeBreak = (cafeBreak: HoverTimeline, dt: number) =>
  stepHoverTimeline(
    cafeBreak,
    isBreakEngaged(cafeBreak),
    dt,
    CAFE_BREAK_RELEASE_SECONDS,
    FULL_BREAK_SECONDS
  )

export const flareLevel = (cafeBreak: HoverTimeline) => timelineStage(cafeBreak, FLARE_RISE_SECONDS)

export const waveLevel = (cafeBreak: HoverTimeline) =>
  timelineStage(cafeBreak, NEON_FLICKER_DELAY_SECONDS)

const flickerNoise = (step: number) => {
  const noise = Math.sin(step * 12.9898) * 43758.5453
  return noise - Math.floor(noise)
}

export function neonLevel({ engagedSeconds, presence }: HoverTimeline) {
  const progress = (engagedSeconds - NEON_FLICKER_DELAY_SECONDS) / NEON_FLICKER_SECONDS
  if (progress < 0 || progress >= 1) return 1
  const isLit = flickerNoise(Math.floor(engagedSeconds * NEON_FLICKER_RATE)) < progress
  return isLit ? 1 : mix(1, NEON_FLICKER_DIM, presence)
}
