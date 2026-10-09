import * as THREE from 'three'
import { connectedParts } from '@/utils/geometry'
import { meshesNamed, positionIn } from '@/utils/meshes'
import { lightGlows, nightGlow, type GlowTarget } from '../shared/nightGlow'
import type { HoverTimeline } from '../shared/hoverTimeline'
import { neonLevel, waveLevel } from './cafeBreak'
import {
  BULB_EMISSION_BOOST,
  BULB_NODES,
  BULB_WAVE_STEP_SECONDS,
  CAFE_NODE,
  NEON_NODES,
} from './constants'

export interface Bulb {
  center: THREE.Vector3
  waveDelay: number
}

export interface CafeGlows {
  bulbs: GlowTarget[]
  neon: GlowTarget[]
  others: GlowTarget[]
}

// ── Bulbs ─────────────────────────────────────────────────────────────────────

function bulbCenters(model: THREE.Object3D, mesh: THREE.Mesh): THREE.Vector3[] {
  const positions = mesh.geometry.getAttribute('position')
  const parts = connectedParts(mesh.geometry)
  const sums = new Map<number, { sum: THREE.Vector3; count: number }>()
  for (let i = 0; i < positions.count; i++) {
    const part = sums.get(parts[i]) ?? { sum: new THREE.Vector3(), count: 0 }
    part.sum.x += positions.getX(i)
    part.sum.y += positions.getY(i)
    part.sum.z += positions.getZ(i)
    part.count++
    sums.set(parts[i], part)
  }

  const toModel = model.matrixWorld.clone().invert().multiply(mesh.matrixWorld)
  return [...sums.values()].map(({ sum, count }) => sum.divideScalar(count).applyMatrix4(toModel))
}

export function findBulbs(model: THREE.Object3D): Bulb[] {
  const cafe = model.getObjectByName(CAFE_NODE)
  if (!cafe) return []

  model.updateMatrixWorld(true)
  const cafeCenter = positionIn(model, cafe)
  return meshesNamed(model, BULB_NODES)
    .flatMap((mesh) => bulbCenters(model, mesh))
    .sort((a, b) => b.distanceTo(cafeCenter) - a.distanceTo(cafeCenter))
    .map((center, rank) => ({ center, waveDelay: rank * BULB_WAVE_STEP_SECONDS }))
}

// ── Emission ──────────────────────────────────────────────────────────────────

export function sortCafeGlows(model: THREE.Object3D, glows: GlowTarget[]): CafeGlows {
  const materialsOf = (names: string[]) =>
    new Set<THREE.Material>(
      meshesNamed(model, names).map((mesh) => mesh.material as THREE.Material)
    )
  const bulbMaterials = materialsOf(BULB_NODES)
  const neonMaterials = materialsOf(NEON_NODES)
  return {
    bulbs: glows.filter(({ mat }) => bulbMaterials.has(mat)),
    neon: glows.filter(({ mat }) => neonMaterials.has(mat)),
    others: glows.filter(({ mat }) => !bulbMaterials.has(mat) && !neonMaterials.has(mat)),
  }
}

export function lightCafeGlows({ bulbs, neon }: CafeGlows, cafeBreak: HoverTimeline) {
  const night = nightGlow()
  lightGlows(bulbs, night * (1 + BULB_EMISSION_BOOST * waveLevel(cafeBreak)))
  lightGlows(neon, night * neonLevel(cafeBreak))
}
