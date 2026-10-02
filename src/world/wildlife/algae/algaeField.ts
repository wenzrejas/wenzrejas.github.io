import * as THREE from 'three'
import { GLOW_COLOR, MAX_PATCHES, MAX_RAIN_HITS } from './constants'

export const algaeUniforms = {
  uAlgaePatches: {
    value: Array.from({ length: MAX_PATCHES }, () => new THREE.Vector4()),
  },
  uAlgaeGlow: { value: new THREE.Color(GLOW_COLOR) },
  uAlgaeIntensity: { value: 0 },
  uAlgaeAmbient: { value: 1 },
}

export const algaeDefines = { ALGAE_MAX_PATCHES: MAX_PATCHES }

export const rainHits: THREE.Vector2[] = []

export function queueRainHit(x: number, z: number): void {
  if (rainHits.length < MAX_RAIN_HITS) rainHits.push(new THREE.Vector2(x, z))
}

export function algaeAt(x: number, z: number): number {
  const intensity = algaeUniforms.uAlgaeIntensity.value
  if (intensity <= 0) return 0
  let coverage = 0
  for (const zone of algaeUniforms.uAlgaePatches.value) {
    if (zone.w <= 0) continue
    const edge = zone.z * 0.95
    const reach =
      1 - THREE.MathUtils.smoothstep(Math.hypot(x - zone.x, z - zone.y), edge * 0.55, edge)
    coverage = Math.max(coverage, reach * zone.w)
  }
  return coverage * intensity
}
