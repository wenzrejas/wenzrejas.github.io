import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import {
  BUBBLE_COLOR,
  BUBBLE_DRAG,
  BUBBLE_RISE_ONSET,
  BUBBLE_STRENGTH,
  BUBBLE_WOBBLE,
  BUBBLE_WOBBLE_RATE,
  FOAM_COLOR,
  FOAM_DRAG,
  FOAM_GROWTH,
  FOAM_RISE,
  FOAM_RISE_ONSET,
  FOAM_SHADE_COLOR,
  FOAM_STRENGTH,
} from './constants'
import BUBBLE_VERT from './shaders/bubble.vert.glsl'
import BUBBLE_FRAG from './shaders/bubble.frag.glsl'
import FOAM_VERT from './shaders/foam.vert.glsl'
import FOAM_FRAG from './shaders/foam.frag.glsl'

const UNBORN = -1e4

export function buildSprayGeometry(capacity: number): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  const slots = (size: number) => new Float32Array(capacity * size)
  geometry.setAttribute('position', new THREE.BufferAttribute(slots(3), 3))
  geometry.setAttribute('velocity', new THREE.BufferAttribute(slots(3), 3))
  geometry.setAttribute('birth', new THREE.BufferAttribute(slots(1).fill(UNBORN), 1))
  geometry.setAttribute('traits', new THREE.BufferAttribute(slots(4), 4))
  return geometry
}

const sprayUniforms = () => ({ uTime: { value: 0 }, uPixelScale: { value: 1 } })

export const createFoamMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: FOAM_VERT,
    fragmentShader: FOAM_FRAG,
    defines: floatDefines({
      DRAG: FOAM_DRAG,
      RISE_ONSET: FOAM_RISE_ONSET,
      RISE: FOAM_RISE,
      GROWTH: FOAM_GROWTH,
      STRENGTH: FOAM_STRENGTH,
    }),
    transparent: true,
    depthWrite: false,
    uniforms: {
      ...sprayUniforms(),
      uColor: { value: displayColorOf(FOAM_COLOR) },
      uShadeColor: { value: displayColorOf(FOAM_SHADE_COLOR) },
    },
  })

export const createBubbleMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: BUBBLE_VERT,
    fragmentShader: BUBBLE_FRAG,
    defines: floatDefines({
      DRAG: BUBBLE_DRAG,
      RISE_ONSET: BUBBLE_RISE_ONSET,
      WOBBLE: BUBBLE_WOBBLE,
      WOBBLE_RATE: BUBBLE_WOBBLE_RATE,
      STRENGTH: BUBBLE_STRENGTH,
    }),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { ...sprayUniforms(), uColor: { value: displayColorOf(BUBBLE_COLOR) } },
  })
