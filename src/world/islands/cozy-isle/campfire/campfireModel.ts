import * as THREE from 'three'
import { columnBoundingSphere } from '@/utils/bounds'
import { floatDefines } from '@/utils/glsl'
import { rand } from '@/utils/math'
import {
  EMBER_COUNT,
  EMBER_DRIFT,
  EMBER_LIFETIME,
  EMBER_RISE,
  EMBER_SCALE_MAX,
  EMBER_SCALE_MIN,
  EMBER_SPREAD,
  EMBER_SWAY,
  FLARE_EMBER_RISE,
} from './constants'
import EMBERS_VERT from './shaders/campfireEmbers.vert.glsl'
import EMBERS_FRAG from './shaders/campfireEmbers.frag.glsl'

// ── Embers ────────────────────────────────────────────────────────────────────
export function buildEmberGeometry(width: number, height: number): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(EMBER_COUNT * 3)
  const seeds = new Float32Array(EMBER_COUNT * 3)

  for (let i = 0; i < EMBER_COUNT; i++) {
    seeds[i * 3] = i / EMBER_COUNT
    seeds[i * 3 + 1] = Math.random() * Math.PI * 2
    seeds[i * 3 + 2] = rand(EMBER_SCALE_MIN, EMBER_SCALE_MAX)
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3))

  const reach = width * (EMBER_SPREAD + EMBER_DRIFT + EMBER_SWAY * Math.SQRT2)
  geometry.boundingSphere = columnBoundingSphere(
    reach,
    0,
    height * EMBER_RISE * (1 + FLARE_EMBER_RISE)
  )
  return geometry
}

export const createEmberMaterial = () =>
  new THREE.ShaderMaterial({
    defines: floatDefines({ LIFETIME: EMBER_LIFETIME }),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 4 },
      uRise: { value: 1 },
      uSpread: { value: 0 },
      uDrift: { value: 0 },
      uSway: { value: 0 },
      uIntensity: { value: 0 },
    },
    vertexShader: EMBERS_VERT,
    fragmentShader: EMBERS_FRAG,
  })
