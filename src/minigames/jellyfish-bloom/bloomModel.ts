import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { dynamicInstancedAttribute } from '@/utils/geometry'
import { floatDefines } from '@/utils/glsl'
import { mix } from '@/utils/math'
import { waveUniforms } from '@/world/environment/ocean/waveUniforms'
import { createAdditiveGlowMaterial } from '@/world/islands/shared/glowMaterial'
import {
  JELLYFISH_BODY_DEFINES,
  setJellyfishBody,
} from '@/world/wildlife/shared/jellyfish-shape/jellyfishShapeModel'
import JELLYFISH_FRAG from '@/world/wildlife/shared/jellyfish-shape/shaders/jellyfish.frag.glsl'
import { bloom } from './bloomState'
import {
  JELLY_BRIGHTNESS,
  JELLY_COUNT,
  JELLY_CREST_BRIGHT,
  JELLY_CREST_DIM,
  JELLY_DEEPEST,
  JELLY_DEEPEST_BRIGHTNESS,
  JELLY_HALO_LIFT,
  JELLY_HALO_SIZE,
  JELLY_HALO_STRENGTH,
  JELLY_LEAN_RATE,
  JELLY_SHALLOWEST,
  JELLY_SINK_DEPTH,
  JELLY_TINT,
  JELLY_WOBBLE_GRAIN,
  JELLY_WOBBLE_RATE,
  JELLY_WOBBLE_SIZE,
} from './constants'
import BLOOM_HALO_VERT from './shaders/bloomHalo.vert.glsl'
import BLOOM_HALO_FRAG from './shaders/bloomHalo.frag.glsl'
import BLOOM_JELLY_VERT from './shaders/bloomJelly.vert.glsl'

const { inverseLerp, smoothstep } = THREE.MathUtils

export function buildBloomGeometry(): THREE.InstancedBufferGeometry {
  const geometry = new THREE.InstancedBufferGeometry()
  setJellyfishBody(geometry)
  geometry.setAttribute('origin', dynamicInstancedAttribute(JELLY_COUNT, 3))
  geometry.setAttribute('aGlow', dynamicInstancedAttribute(JELLY_COUNT))
  geometry.setAttribute('bellRadius', dynamicInstancedAttribute(JELLY_COUNT))
  geometry.setAttribute('seed', dynamicInstancedAttribute(JELLY_COUNT))
  geometry.instanceCount = 0
  return geometry
}

export const createBloomMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: BLOOM_JELLY_VERT,
    fragmentShader: JELLYFISH_FRAG,
    defines: floatDefines({
      ...JELLYFISH_BODY_DEFINES,
      LEAN_RATE: JELLY_LEAN_RATE,
      CREST_DIM: JELLY_CREST_DIM,
      CREST_BRIGHT: JELLY_CREST_BRIGHT,
      WOBBLE_GRAIN: JELLY_WOBBLE_GRAIN,
      WOBBLE_RATE: JELLY_WOBBLE_RATE,
      WOBBLE_SIZE: JELLY_WOBBLE_SIZE,
    }),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      ...waveUniforms,
      uScale: { value: 1 },
      uTint: { value: displayColorOf(JELLY_TINT) },
    },
  })

export function buildBloomHaloGeometry(
  body: THREE.InstancedBufferGeometry
): THREE.InstancedBufferGeometry {
  const quad = new THREE.PlaneGeometry(1, 1)
  const geometry = new THREE.InstancedBufferGeometry()
  geometry.setIndex(quad.getIndex())
  geometry.setAttribute('position', quad.getAttribute('position'))
  geometry.setAttribute('uv', quad.getAttribute('uv'))
  geometry.setAttribute('origin', body.getAttribute('origin'))
  geometry.setAttribute('aGlow', body.getAttribute('aGlow'))
  geometry.setAttribute('bellRadius', body.getAttribute('bellRadius'))
  geometry.instanceCount = 0
  return geometry
}

export const createBloomHaloMaterial = (body: THREE.ShaderMaterial) =>
  createAdditiveGlowMaterial(
    BLOOM_HALO_VERT,
    BLOOM_HALO_FRAG,
    {
      HALO_SIZE: JELLY_HALO_SIZE,
      HALO_LIFT: JELLY_HALO_LIFT,
      HALO_STRENGTH: JELLY_HALO_STRENGTH,
      CREST_DIM: JELLY_CREST_DIM,
      CREST_BRIGHT: JELLY_CREST_BRIGHT,
    },
    { ...waveUniforms, uScale: body.uniforms.uScale, uTint: body.uniforms.uTint }
  )

export function writeBloom(
  geometry: THREE.InstancedBufferGeometry,
  haloGeometry: THREE.InstancedBufferGeometry,
  material: THREE.ShaderMaterial,
  scale: number
): number {
  const origins = geometry.getAttribute('origin') as THREE.InstancedBufferAttribute
  const glows = geometry.getAttribute('aGlow') as THREE.InstancedBufferAttribute
  const radii = geometry.getAttribute('bellRadius') as THREE.InstancedBufferAttribute
  const seeds = geometry.getAttribute('seed') as THREE.InstancedBufferAttribute
  let count = 0
  for (const patch of bloom.patches) {
    if (!patch.isInView) continue
    for (const { x, z, depth, radius, seed, rise } of patch.jellies) {
      if (rise <= 0) continue
      const up = smoothstep(rise, 0, 1)
      const deepShare = inverseLerp(JELLY_SHALLOWEST, JELLY_DEEPEST, depth)
      origins.setXYZ(count, x, -(depth + (1 - up) * JELLY_SINK_DEPTH), z)
      glows.setX(count, up * JELLY_BRIGHTNESS * mix(1, JELLY_DEEPEST_BRIGHTNESS, deepShare))
      radii.setX(count, radius)
      seeds.setX(count, seed)
      count++
    }
  }
  geometry.instanceCount = count
  haloGeometry.instanceCount = count
  if (count === 0) return 0
  origins.needsUpdate = true
  glows.needsUpdate = true
  radii.needsUpdate = true
  seeds.needsUpdate = true
  material.uniforms.uScale.value = scale
  return count
}
