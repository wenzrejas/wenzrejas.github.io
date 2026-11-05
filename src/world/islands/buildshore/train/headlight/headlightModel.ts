import * as THREE from 'three'
import GLOW_POINT_FRAG from '@/shaders/glowPoint.frag.glsl'
import UV_QUAD_VERT from '@/shaders/uvQuad.vert.glsl'
import { displayColorOf } from '@/utils/color'
import { buildBeamCone } from '@/utils/geometry'
import { floatDefines } from '@/utils/glsl'
import { createBeamConeMaterial } from '@/utils/materials'
import { createAdditiveGlowMaterial } from '@/world/islands/shared/glowMaterial'
import { createAdditiveMaterial } from '@/utils/materials'
import {
  BEAM_EDGE_LEVEL,
  BEAM_FADE_IN,
  BEAM_FALLOFF,
  BEAM_LENGTH,
  BEAM_SEGMENTS,
  BEAM_SPREAD_DEGREES,
  HALO_STRENGTH,
  HEADLIGHT_COLOR,
  LANTERN_HALO_SHARE,
  POOL_NEAR_WIDTH,
} from './constants'
import type { Lamps } from './lamps'
import POOL_FRAG from './shaders/headlightPool.frag.glsl'
import LAMP_HALO_VERT from './shaders/lampHalo.vert.glsl'

const lightUniforms = () => ({
  uColor: { value: displayColorOf(HEADLIGHT_COLOR) },
  uIntensity: { value: 0 },
})

// ── Beam ──────────────────────────────────────────────────────────────────────

export const buildBeamGeometry = (lensRadius: number) =>
  buildBeamCone(lensRadius, BEAM_LENGTH, BEAM_SEGMENTS, BEAM_SPREAD_DEGREES)

export const createBeamMaterial = () =>
  createBeamConeMaterial(displayColorOf(HEADLIGHT_COLOR), {
    fadeIn: BEAM_FADE_IN,
    falloff: BEAM_FALLOFF,
    edgeLevel: BEAM_EDGE_LEVEL,
  })

// ── Track pool ────────────────────────────────────────────────────────────────

export const createPoolMaterial = () =>
  createAdditiveMaterial({
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
