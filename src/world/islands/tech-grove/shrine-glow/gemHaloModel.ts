import * as THREE from 'three'
import { createAdditiveGlowMaterial } from '@/world/islands/shared/glowMaterial'
import { GEM_HALO_SPREAD, GEM_HALO_STRENGTH } from './constants'
import type { ShrineGem } from '../shrines'
import GEM_HALO_VERT from './shaders/gemHalo.vert.glsl'
import GEM_HALO_FRAG from './shaders/gemHalo.frag.glsl'

// ── Geometry ──────────────────────────────────────────────────────────────────

export function buildGemHaloGeometry(gems: ShrineGem[]): THREE.BufferGeometry {
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
    const haloSize = new THREE.Vector3().setScalar(radius * GEM_HALO_SPREAD * 2)
    reach.union(new THREE.Box3().setFromCenterAndSize(center, haloSize))
  }
  geometry.boundingSphere = reach.getBoundingSphere(new THREE.Sphere())
  return geometry
}

// ── Material ──────────────────────────────────────────────────────────────────

export const createGemHaloMaterial = () =>
  createAdditiveGlowMaterial(
    GEM_HALO_VERT,
    GEM_HALO_FRAG,
    { HALO_SPREAD: GEM_HALO_SPREAD, HALO_STRENGTH: GEM_HALO_STRENGTH },
    { uPixelsPerUnit: { value: 1 } }
  )
