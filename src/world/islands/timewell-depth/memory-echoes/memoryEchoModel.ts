import * as THREE from 'three'
import GLOW_POINT_FRAG from '@/shaders/glowPoint.frag.glsl'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import { rand } from '@/utils/math'
import { createAdditiveGlowMaterial } from '@/world/islands/shared/glowMaterial'
import {
  CRYSTAL_ANGLE_JITTER,
  CRYSTAL_BODY_BOTTOM,
  CRYSTAL_BODY_TOP,
  CRYSTAL_BOTTOM_TIP,
  CRYSTAL_BRIGHT_COLOR,
  CRYSTAL_BRIGHT_FROM,
  CRYSTAL_DEEP_COLOR,
  CRYSTAL_DEEP_UNTIL,
  CRYSTAL_GLINT_START,
  CRYSTAL_GOLD_COLOR,
  CRYSTAL_GOLD_FROM,
  CRYSTAL_LIGHT_DIRECTION,
  CRYSTAL_RADIUS,
  CRYSTAL_RADIUS_JITTER,
  CRYSTAL_RIM_GLOW,
  CRYSTAL_SIDES,
  CRYSTAL_TAPER,
  CRYSTAL_TIP_GLOW,
  CRYSTAL_TIP_JITTER,
  CRYSTAL_TOP_TIP,
  FRAGMENT_COUNT,
  FRAGMENT_HALO_SIZE,
  FRAGMENT_HALO_STRENGTH,
} from './constants'
import MEMORY_FRAGMENT_VERT from './shaders/memoryFragment.vert.glsl'
import MEMORY_FRAGMENT_FRAG from './shaders/memoryFragment.frag.glsl'
import FRAGMENT_HALO_VERT from './shaders/fragmentHalo.vert.glsl'

// ── Crystal ───────────────────────────────────────────────────────────────────

function crystalRing(y: number, angles: number[], radii: number[], share: number) {
  return angles.map(
    (angle, i) =>
      new THREE.Vector3(Math.cos(angle) * radii[i] * share, y, Math.sin(angle) * radii[i] * share)
  )
}

const tipAt = (y: number) =>
  new THREE.Vector3(
    rand(-CRYSTAL_TIP_JITTER, CRYSTAL_TIP_JITTER),
    y,
    rand(-CRYSTAL_TIP_JITTER, CRYSTAL_TIP_JITTER)
  )

export function buildCrystalGeometry(): THREE.BufferGeometry {
  const angles = Array.from(
    { length: CRYSTAL_SIDES },
    (_, i) =>
      ((i + rand(-CRYSTAL_ANGLE_JITTER, CRYSTAL_ANGLE_JITTER)) / CRYSTAL_SIDES) * Math.PI * 2
  )
  const radii = angles.map(
    () => CRYSTAL_RADIUS * (1 + rand(-CRYSTAL_RADIUS_JITTER, CRYSTAL_RADIUS_JITTER))
  )
  const bottom = crystalRing(CRYSTAL_BODY_BOTTOM, angles, radii, 1)
  const top = crystalRing(CRYSTAL_BODY_TOP, angles, radii, CRYSTAL_TAPER)
  const topTip = tipAt(CRYSTAL_TOP_TIP)
  const bottomTip = tipAt(CRYSTAL_BOTTOM_TIP)

  const corners: THREE.Vector3[] = []
  for (let i = 0; i < CRYSTAL_SIDES; i++) {
    const next = (i + 1) % CRYSTAL_SIDES
    corners.push(bottom[i], top[next], bottom[next], bottom[i], top[i], top[next])
    corners.push(top[i], topTip, top[next], bottom[next], bottomTip, bottom[i])
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(corners)
  geometry.computeVertexNormals()
  return geometry
}

export const createCrystalMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: MEMORY_FRAGMENT_VERT,
    fragmentShader: MEMORY_FRAGMENT_FRAG,
    defines: floatDefines({
      GLINT_START: CRYSTAL_GLINT_START,
      DEEP_UNTIL: CRYSTAL_DEEP_UNTIL,
      GOLD_FROM: CRYSTAL_GOLD_FROM,
      BRIGHT_FROM: CRYSTAL_BRIGHT_FROM,
      RIM_GLOW: CRYSTAL_RIM_GLOW,
      TIP_GLOW: CRYSTAL_TIP_GLOW,
      TIP_START: CRYSTAL_BODY_TOP,
      TIP_END: CRYSTAL_TOP_TIP,
    }),
    uniforms: {
      uDeep: { value: displayColorOf(CRYSTAL_DEEP_COLOR) },
      uGold: { value: displayColorOf(CRYSTAL_GOLD_COLOR) },
      uBright: { value: displayColorOf(CRYSTAL_BRIGHT_COLOR) },
      uLight: { value: new THREE.Vector3(...CRYSTAL_LIGHT_DIRECTION).normalize() },
    },
  })

// ── Halos ─────────────────────────────────────────────────────────────────────

export function buildFragmentHaloGeometry(): THREE.BufferGeometry {
  const positions = new THREE.BufferAttribute(new Float32Array(FRAGMENT_COUNT * 3), 3)
  positions.setUsage(THREE.DynamicDrawUsage)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', positions)
  return geometry
}

export const createFragmentHaloMaterial = () =>
  createAdditiveGlowMaterial(
    FRAGMENT_HALO_VERT,
    GLOW_POINT_FRAG,
    { SIZE: FRAGMENT_HALO_SIZE, STRENGTH: FRAGMENT_HALO_STRENGTH },
    {
      uColor: { value: displayColorOf(CRYSTAL_GOLD_COLOR) },
      uPixelsPerUnit: { value: 1 },
      uRise: { value: 0 },
    }
  )
