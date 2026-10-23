import * as THREE from 'three'
import { ascentShare } from '@/depths/dive/surfacingPace'
import { isRewindChosen } from '@/store/depthsStore'
import type { Timeline } from '../timeline/timeline'

export interface Surfacing {
  isUnderway: boolean
  isRewinding: boolean
  seconds: number
  fromLevel: number
}

export const createSurfacing = (): Surfacing => ({
  isUnderway: false,
  isRewinding: false,
  seconds: 0,
  fromLevel: 0,
})

export function advanceSurfacing(
  surfacing: Surfacing,
  dt: number,
  isSurfacing: boolean,
  timeline: Timeline
) {
  if (!isSurfacing) return
  if (!surfacing.isUnderway) {
    surfacing.isUnderway = true
    surfacing.isRewinding = isRewindChosen()
    surfacing.fromLevel = timeline.viewedLevel
  }
  surfacing.seconds += dt
}

export const rewindShare = ({ seconds }: Surfacing) =>
  THREE.MathUtils.smootherstep(ascentShare(seconds), 0, 1)
