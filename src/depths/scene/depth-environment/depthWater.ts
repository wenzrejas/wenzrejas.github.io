import * as THREE from 'three'
import { ARRIVAL_LEVEL } from '../constants'
import { depthShare, type Timeline } from '../timeline/timeline'
import {
  LIGHT_COLUMN_ABYSS_STRENGTH,
  LIGHT_COLUMN_STRENGTH,
  SURFACE_GLOW_LEVELS,
} from './constants'
import type { DepthEnvironment } from './depthEnvironmentModel'

export function fillWater(scene: THREE.Scene, { fog }: DepthEnvironment) {
  scene.fog = fog
}

export function drainWater(scene: THREE.Scene) {
  scene.fog = null
}

const surfaceGlowOf = ({ viewedLevel }: Timeline) =>
  Math.exp(-Math.max(viewedLevel - ARRIVAL_LEVEL, 0) / SURFACE_GLOW_LEVELS)

export function tintWater(
  environment: DepthEnvironment,
  timeline: Timeline,
  aspect: number,
  time: number
) {
  const share = depthShare(timeline)
  const { fog, backdrop, shallowColor, abyssColor, shallowEdgeColor, abyssEdgeColor } = environment
  const { uniforms } = backdrop
  fog.color.lerpColors(shallowColor, abyssColor, share)
  uniforms.uBodyColor.value.copy(fog.color).convertLinearToSRGB()
  uniforms.uEdgeColor.value
    .lerpColors(shallowEdgeColor, abyssEdgeColor, share)
    .convertLinearToSRGB()
  uniforms.uColumnLevel.value = THREE.MathUtils.lerp(
    LIGHT_COLUMN_STRENGTH,
    LIGHT_COLUMN_ABYSS_STRENGTH,
    share
  )
  uniforms.uSurfaceLevel.value = surfaceGlowOf(timeline)
  uniforms.uAspect.value = aspect
  uniforms.uTime.value = time
}
