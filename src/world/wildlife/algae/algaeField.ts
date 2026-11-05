import * as THREE from 'three'
import {
  GLOW_COLOR,
  MAX_GLOW_HITS,
  MAX_PATCHES,
  PATCH_EDGE_SHARE,
  PATCH_FADE_START_SHARE,
} from './constants'

export const algaeUniforms = {
  uAlgaePatches: {
    value: Array.from({ length: MAX_PATCHES }, () => new THREE.Vector4()),
  },
  uAlgaeGlow: { value: new THREE.Color(GLOW_COLOR) },
  uAlgaeIntensity: { value: 0 },
  uAlgaeAmbient: { value: 1 },
}

export const algaeDefines = { ALGAE_MAX_PATCHES: MAX_PATCHES }

export const glowHits: THREE.Vector2[] = []

export function queueGlowHit(x: number, z: number): void {
  if (glowHits.length < MAX_GLOW_HITS) glowHits.push(new THREE.Vector2(x, z))
}

export type PatchOrder = 'atShip' | 'clear'

export const patchOrders: PatchOrder[] = []

export const orderPatch = (order: PatchOrder) => patchOrders.push(order)

export function algaeAt(x: number, z: number): number {
  const intensity = algaeUniforms.uAlgaeIntensity.value
  if (intensity <= 0) return 0
  let coverage = 0
  for (const zone of algaeUniforms.uAlgaePatches.value) {
    if (zone.w <= 0) continue
    const edge = zone.z * PATCH_EDGE_SHARE
    const reach =
      1 -
      THREE.MathUtils.smoothstep(
        Math.hypot(x - zone.x, z - zone.y),
        edge * PATCH_FADE_START_SHARE,
        edge
      )
    coverage = Math.max(coverage, reach * zone.w)
  }
  return coverage * intensity
}
