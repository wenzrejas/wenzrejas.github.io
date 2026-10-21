import * as THREE from 'three'
import { createAdditiveGlowMaterial } from '../glowMaterial'
import GEM_HALO_VERT from './shaders/gemHalo.vert.glsl'
import GEM_HALO_FRAG from './shaders/gemHalo.frag.glsl'

export interface HaloGem {
  center: THREE.Vector3
  radius: number
  color: THREE.Color
}

export interface GemHaloTuning {
  spread: number
  strength: number
}

// ── Geometry ──────────────────────────────────────────────────────────────────

export function buildGemHaloGeometry(
  gems: HaloGem[],
  { spread }: GemHaloTuning
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(gems.flatMap((gem) => gem.center.toArray())), 3)
  )
  geometry.setAttribute(
    'aRadius',
    new THREE.BufferAttribute(new Float32Array(gems.map((gem) => gem.radius)), 1)
  )
  geometry.setAttribute(
    'aColor',
    new THREE.BufferAttribute(new Float32Array(gems.flatMap((gem) => gem.color.toArray())), 3)
  )

  const reach = new THREE.Box3()
  for (const { center, radius } of gems) {
    const haloSize = new THREE.Vector3().setScalar(radius * spread * 2)
    reach.union(new THREE.Box3().setFromCenterAndSize(center, haloSize))
  }
  geometry.boundingSphere = reach.getBoundingSphere(new THREE.Sphere())
  return geometry
}

// ── Material ──────────────────────────────────────────────────────────────────

export const createGemHaloMaterial = ({ spread, strength }: GemHaloTuning) =>
  createAdditiveGlowMaterial(
    GEM_HALO_VERT,
    GEM_HALO_FRAG,
    { HALO_SPREAD: spread, HALO_STRENGTH: strength },
    { uPixelsPerUnit: { value: 1 } }
  )
