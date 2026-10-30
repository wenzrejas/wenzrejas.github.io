import * as THREE from 'three'
import { dimForNight } from '../surface-daylight/surfaceDaylight'
import { depthShare, type Timeline } from '../timeline/timeline'
import {
  LIGHT_COLUMN_ABYSS_STRENGTH,
  LIGHT_COLUMN_NIGHT_LEVEL,
  LIGHT_COLUMN_STRENGTH,
  SURFACE_GLOW_NIGHT_LEVEL,
  WATER_NIGHT_LEVEL,
} from './constants'
import type { DepthEnvironment } from './depthEnvironmentModel'
import { surfaceGlowOf } from './surfaceGlow'

export function fillWater(scene: THREE.Scene, { fog }: DepthEnvironment) {
  scene.fog = fog
}

export function drainWater(scene: THREE.Scene) {
  scene.fog = null
}

export function tintWater(
  environment: DepthEnvironment,
  timeline: Timeline,
  daylight: number,
  aspect: number,
  time: number
) {
  const share = depthShare(timeline)
  const waterLevel = dimForNight(WATER_NIGHT_LEVEL, daylight)
  const { fog, backdrop, shallowColor, abyssColor, shallowEdgeColor, abyssEdgeColor } = environment
  const { uniforms } = backdrop
  fog.color.lerpColors(shallowColor, abyssColor, share).multiplyScalar(waterLevel)
  uniforms.uBodyColor.value.copy(fog.color).convertLinearToSRGB()
  uniforms.uEdgeColor.value
    .lerpColors(shallowEdgeColor, abyssEdgeColor, share)
    .multiplyScalar(waterLevel)
    .convertLinearToSRGB()
  uniforms.uColumnLevel.value =
    THREE.MathUtils.lerp(LIGHT_COLUMN_STRENGTH, LIGHT_COLUMN_ABYSS_STRENGTH, share) *
    dimForNight(LIGHT_COLUMN_NIGHT_LEVEL, daylight)
  uniforms.uSurfaceLevel.value =
    surfaceGlowOf(timeline) * dimForNight(SURFACE_GLOW_NIGHT_LEVEL, daylight)
  uniforms.uAspect.value = aspect
  uniforms.uTime.value = time
}
