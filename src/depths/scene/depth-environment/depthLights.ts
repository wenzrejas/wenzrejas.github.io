import * as THREE from 'three'
import { dimForNight } from '../surface-daylight/surfaceDaylight'
import {
  FILL_LIGHT_NIGHT_LEVEL,
  FRONT_LIGHT_INTENSITY,
  HEMISPHERE_INTENSITY,
  SURFACE_LIGHT_COLOR,
  SURFACE_LIGHT_INTENSITY,
  SURFACE_LIGHT_NIGHT_COLOR,
  SURFACE_LIGHT_NIGHT_LEVEL,
} from './constants'
import type { DepthLights } from './depthEnvironmentModel'

const SUNLIGHT = new THREE.Color(SURFACE_LIGHT_COLOR)
const MOONLIGHT = new THREE.Color(SURFACE_LIGHT_NIGHT_COLOR)

export function shineLights({ hemisphere, surface, front }: DepthLights, daylight: number) {
  const fill = dimForNight(FILL_LIGHT_NIGHT_LEVEL, daylight)
  surface.intensity = SURFACE_LIGHT_INTENSITY * dimForNight(SURFACE_LIGHT_NIGHT_LEVEL, daylight)
  surface.color.lerpColors(MOONLIGHT, SUNLIGHT, daylight)
  front.intensity = FRONT_LIGHT_INTENSITY * fill
  hemisphere.intensity = HEMISPHERE_INTENSITY * fill
}
