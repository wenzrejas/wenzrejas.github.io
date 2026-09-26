import * as THREE from 'three'
import { floatDefines } from '../../../utils/glsl'
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
  WAVE_LAYERS,
  WAVE_REACH,
  WAVE_SPEED,
  WAVE_STRENGTH,
  WAVE_WIDTH,
} from './constants'
import type { ShoreField } from './shoreField'
import SHORELINE_VERT from './shaders/shoreline.vert.glsl'
import SHORELINE_FRAG from './shaders/shoreline.frag.glsl'

// ── Geometry ──────────────────────────────────────────────────────────────────

export const buildShorelineGeometry = () => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)

// ── Material ──────────────────────────────────────────────────────────────────

export function createFieldTexture(field: ShoreField): THREE.DataTexture {
  const halfFloats = new Uint16Array(field.distances.length * 2)
  for (let i = 0; i < field.distances.length; i++) {
    halfFloats[i * 2] = THREE.DataUtils.toHalfFloat(field.distances[i])
    halfFloats[i * 2 + 1] = THREE.DataUtils.toHalfFloat(field.smoothedDistances[i])
  }
  const texture = new THREE.DataTexture(
    halfFloats,
    field.resolution,
    field.resolution,
    THREE.RGFormat,
    THREE.HalfFloatType
  )
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.needsUpdate = true
  return texture
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
      WAVE_LAYERS,
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
