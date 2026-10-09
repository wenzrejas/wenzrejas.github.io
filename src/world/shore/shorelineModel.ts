import * as THREE from 'three'
import { floatDefines } from '@/utils/glsl'
import {
  FOAM_CONTRACTED_WIDTH,
  FOAM_EXPANDED_WIDTH,
  FOAM_GRAIN,
  FOAM_JAG,
  FOAM_RECEDE_SHARE,
  FOAM_TUCK,
  WAVE_DASH_GRAIN,
  WAVE_DASH_LONG,
  WAVE_DASH_SHORT,
  WAVE_DASH_TAPER,
  WAVE_INSET,
  WAVE_LAG,
  WAVE_LAG_GRAIN,
  WAVE_REACH,
  WAVE_SPEED,
  WAVE_STRENGTH,
  WAVE_WIDTH,
} from './constants'
import type { DistanceField, ShoreField } from './shoreField'
import SHORELINE_VERT from './shaders/shoreline.vert.glsl'
import SHORELINE_FRAG from './shaders/shoreline.frag.glsl'

// ── Geometry ──────────────────────────────────────────────────────────────────

// ── Material ──────────────────────────────────────────────────────────────────

function createHalfFloatTexture(
  halfFloats: Uint16Array,
  resolution: number,
  format: THREE.PixelFormat
): THREE.DataTexture {
  const texture = new THREE.DataTexture(
    halfFloats,
    resolution,
    resolution,
    format,
    THREE.HalfFloatType
  )
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.needsUpdate = true
  return texture
}

export function createFieldTexture(field: ShoreField): THREE.DataTexture {
  const halfFloats = new Uint16Array(field.distances.length * 2)
  for (let i = 0; i < field.distances.length; i++) {
    halfFloats[i * 2] = THREE.DataUtils.toHalfFloat(field.distances[i])
    halfFloats[i * 2 + 1] = THREE.DataUtils.toHalfFloat(field.smoothedDistances[i])
  }
  return createHalfFloatTexture(halfFloats, field.resolution, THREE.RGFormat)
}

export function createDistanceTexture({ distances, resolution }: DistanceField): THREE.DataTexture {
  const halfFloats = new Uint16Array(distances.length)
  for (let i = 0; i < distances.length; i++) {
    halfFloats[i] = THREE.DataUtils.toHalfFloat(distances[i])
  }
  return createHalfFloatTexture(halfFloats, resolution, THREE.RedFormat)
}

export function bindFieldTexture(material: THREE.ShaderMaterial, texture: THREE.Texture) {
  material.uniforms.uField.value = texture
}

export function createShorelineMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: SHORELINE_VERT,
    fragmentShader: SHORELINE_FRAG,
    defines: floatDefines({
      FOAM_EXPANDED_WIDTH,
      FOAM_CONTRACTED_WIDTH,
      FOAM_RECEDE_SHARE,
      FOAM_JAG,
      FOAM_GRAIN,
      FOAM_TUCK,
      WAVE_REACH,
      WAVE_INSET,
      WAVE_WIDTH,
      WAVE_SPEED,
      WAVE_STRENGTH,
      WAVE_DASH_GRAIN,
      WAVE_DASH_SHORT,
      WAVE_DASH_LONG,
      WAVE_DASH_TAPER,
      WAVE_LAG,
      WAVE_LAG_GRAIN,
    }),
    transparent: true,
    depthWrite: false,
    uniforms: {
      uField: { value: null },
      uFieldSize: { value: 1 },
      uIslandScale: { value: 1 },
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(1, 1, 1) },
    },
  })
}
