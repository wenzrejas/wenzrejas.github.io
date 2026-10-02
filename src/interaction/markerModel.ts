import * as THREE from 'three'
import { floatDefines } from '../utils/glsl'
import {
  MARKER_COLOR,
  MARKER_EXTENT,
  MARKER_GAP,
  MARKER_HOVER_CORE,
  MARKER_IDLE_CORE,
  MARKER_OUTLINE,
  MARKER_OUTLINE_COLOR,
  MARKER_OUTLINE_OPACITY,
  MARKER_PULSE_OPACITY,
  MARKER_PULSE_REACH,
  MARKER_PULSE_SWELL,
  MARKER_PULSE_WIDTH,
  MARKER_RING_OUTER,
  MARKER_RING_START,
  MARKER_RING_WIDTH,
} from './constants'
import MARKER_VERT from './shaders/marker.vert.glsl'
import MARKER_FRAG from './shaders/marker.frag.glsl'

export function buildMarkerGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  const tip = MARKER_EXTENT
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([0, tip, 0, -tip, 0, 0, 0, -tip, 0, tip, 0, 0], 3)
  )
  geometry.setIndex([0, 1, 2, 0, 2, 3])
  return geometry
}

export const createMarkerMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: MARKER_VERT,
    fragmentShader: MARKER_FRAG,
    defines: floatDefines({
      IDLE_CORE: MARKER_IDLE_CORE,
      HOVER_CORE: MARKER_HOVER_CORE,
      RING_OUTER: MARKER_RING_OUTER,
      RING_WIDTH: MARKER_RING_WIDTH,
      RING_START: MARKER_RING_START,
      GAP: MARKER_GAP,
      OUTLINE: MARKER_OUTLINE,
      OUTLINE_OPACITY: MARKER_OUTLINE_OPACITY,
      PULSE_REACH: MARKER_PULSE_REACH,
      PULSE_WIDTH: MARKER_PULSE_WIDTH,
      PULSE_OPACITY: MARKER_PULSE_OPACITY,
      PULSE_SWELL: MARKER_PULSE_SWELL,
    }),
    uniforms: {
      uColor: { value: new THREE.Color(MARKER_COLOR) },
      uOutlineColor: { value: new THREE.Color(MARKER_OUTLINE_COLOR) },
      uHover: { value: 0 },
      uPulse: { value: 0 },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
  })
