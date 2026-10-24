import type * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { dimForNight } from '../surface-daylight/surfaceDaylight'
import { RAY_COLOR, RAY_NIGHT_COLOR, RAY_NIGHT_LEVEL } from './constants'

const DAY_RAYS = displayColorOf(RAY_COLOR)
const NIGHT_RAYS = displayColorOf(RAY_NIGHT_COLOR)

export function shimmerRays(material: THREE.ShaderMaterial, time: number, daylight: number) {
  const { uniforms } = material
  uniforms.uTime.value = time
  uniforms.uShine.value = dimForNight(RAY_NIGHT_LEVEL, daylight)
  uniforms.uColor.value.lerpColors(NIGHT_RAYS, DAY_RAYS, daylight)
}
