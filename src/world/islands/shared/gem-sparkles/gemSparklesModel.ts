import * as THREE from 'three'
import { rand } from '@/utils/math'
import { createAdditiveGlowMaterial } from '../glowMaterial'
import type { SparkleSpots } from './sparkleSpots'
import GEM_SPARKLES_VERT from './shaders/gemSparkles.vert.glsl'
import GEM_SPARKLES_FRAG from './shaders/gemSparkles.frag.glsl'

export interface GemSparkleTuning {
  periodMinSeconds: number
  periodMaxSeconds: number
  flashShare: number
  lift: number
  rayWidth: number
  tintShare: number
}

// ── Geometry ──────────────────────────────────────────────────────────────────

export function buildSparkleGeometry(
  { starts, ends }: SparkleSpots,
  { periodMinSeconds, periodMaxSeconds, lift }: GemSparkleTuning
): THREE.BufferGeometry {
  const count = starts.length / 3
  const seeds = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    seeds.set([rand(periodMinSeconds, periodMaxSeconds), Math.random(), Math.random()], i * 3)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(starts, 3))
  geometry.setAttribute('aEnd', new THREE.BufferAttribute(ends, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3))

  const reach = new THREE.Box3().setFromArray(starts).union(new THREE.Box3().setFromArray(ends))
  reach.min.multiplyScalar(lift)
  reach.max.multiplyScalar(lift)
  geometry.boundingSphere = reach.getBoundingSphere(new THREE.Sphere())
  return geometry
}

// ── Material ──────────────────────────────────────────────────────────────────

export const createSparkleMaterial = (
  color: THREE.Color,
  { flashShare, lift, rayWidth, tintShare }: GemSparkleTuning
) =>
  createAdditiveGlowMaterial(
    GEM_SPARKLES_VERT,
    GEM_SPARKLES_FRAG,
    { FLASH_SHARE: flashShare, LIFT: lift, RAY_WIDTH: rayWidth },
    {
      uTime: { value: 0 },
      uSize: { value: 1 },
      uColor: { value: new THREE.Color(1, 1, 1).lerp(color, tintShare) },
    }
  )
