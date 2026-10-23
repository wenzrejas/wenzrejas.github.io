import * as THREE from 'three'
import { mix } from '@/utils/math'
import type { Timeline } from '@/depths/scene/timeline/timeline'
import { WAKE_FADE_LEVELS, WAKE_FULL_LEVELS, WAKE_GLOW_BOOST, WAKE_REST_SHARE } from './constants'

export const wakeShare = ({ viewedLevel }: Timeline, level: number) =>
  1 - THREE.MathUtils.smoothstep(Math.abs(viewedLevel - level), WAKE_FULL_LEVELS, WAKE_FADE_LEVELS)

export const wakeStrength = (wake: number) => mix(WAKE_REST_SHARE, 1, wake)

export const wakeGlow = (wake: number) => 1 + WAKE_GLOW_BOOST * wake
