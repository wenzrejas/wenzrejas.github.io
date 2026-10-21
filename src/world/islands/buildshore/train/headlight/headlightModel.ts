import * as THREE from 'three'
import GLOW_POINT_FRAG from '@/shaders/glowPoint.frag.glsl'
import UV_QUAD_VERT from '@/shaders/uvQuad.vert.glsl'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import { createAdditiveGlowMaterial } from '@/world/islands/shared/glowMaterial'
import {
  BEAM_LENGTH,
  BEAM_SEGMENTS,
  BEAM_SPREAD_DEG,
  HALO_STRENGTH,
  HEADLIGHT_COLOR,
  LANTERN_HALO_SHARE,
  POOL_NEAR_WIDTH,
} from './constants'
import type { Lamps } from './lamps'
import BEAM_VERT from './shaders/headlightBeam.vert.glsl'
import BEAM_FRAG from './shaders/headlightBeam.frag.glsl'
import POOL_FRAG from './shaders/headlightPool.frag.glsl'
import LAMP_HALO_VERT from './shaders/lampHalo.vert.glsl'

const HALF_SPREAD = THREE.MathUtils.degToRad(BEAM_SPREAD_DEG) / 2

const lightUniforms = () => ({
  uColor: { value: displayColorOf(HEADLIGHT_COLOR) },
  uIntensity: { value: 0 },
})

// ── Beam ──────────────────────────────────────────────────────────────────────

export function buildBeamGeometry(lensRadius: number): THREE.CylinderGeometry {
  const startRadius = lensRadius / BEAM_LENGTH
  const geometry = new THREE.CylinderGeometry(
    startRadius,
    startRadius + Math.tan(HALF_SPREAD),
    1,
    BEAM_SEGMENTS,
    1,
    true
  )
  geometry.rotateZ(Math.PI / 2)
  geometry.translate(0.5, 0, 0)
  return geometry
}

export const createBeamMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: BEAM_VERT,
    fragmentShader: BEAM_FRAG,
    uniforms: lightUniforms(),
  })

// ── Track pool ────────────────────────────────────────────────────────────────

export const createPoolMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: UV_QUAD_VERT,
    fragmentShader: POOL_FRAG,
    defines: floatDefines({ NEAR_WIDTH: POOL_NEAR_WIDTH }),
    uniforms: lightUniforms(),
  })

// ── Halos ─────────────────────────────────────────────────────────────────────

export function buildHaloGeometry({ headlight, lantern }: Lamps): THREE.BufferGeometry {
  const lamps = lantern ? [headlight, lantern] : [headlight]
  const brightness = lantern ? [1, LANTERN_HALO_SHARE] : [1]
  const geometry = new THREE.BufferGeometry().setFromPoints(lamps)
  geometry.setAttribute('aBrightness', new THREE.BufferAttribute(Float32Array.from(brightness), 1))
  return geometry
}

export const createHaloMaterial = () =>
  createAdditiveGlowMaterial(
    LAMP_HALO_VERT,
    GLOW_POINT_FRAG,
    { STRENGTH: HALO_STRENGTH },
    { uSize: { value: 1 }, uColor: { value: displayColorOf(HEADLIGHT_COLOR) } }
  )
