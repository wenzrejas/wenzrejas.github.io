import * as THREE from 'three'
import { FULL_TURN } from '@/utils/math'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import {
  BLOSSOM_COUNT,
  BLOSSOM_GATHER,
  BLOSSOM_HEART_COLOR,
  BLOSSOM_LIFE_SECONDS,
  BLOSSOM_PETAL_COLOR,
  BLOSSOM_RISE,
  BLOSSOM_SPAWN_RADII,
  BLOSSOM_SPIN_RATE,
  BLOSSOM_SWAY,
  BLOSSOM_SWAY_RATE,
  BLOSSOM_SWIRL,
  BLOSSOM_TUMBLE_RATE,
  PLAZA_CENTRE,
} from './constants'
import BLOSSOM_VERT from './shaders/blossom.vert.glsl'
import BLOSSOM_FRAG from './shaders/blossom.frag.glsl'

export function buildBlossomGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(BLOSSOM_COUNT * 3), 3)
  )
  geometry.setAttribute(
    'aSeed',
    new THREE.BufferAttribute(
      Float32Array.from({ length: BLOSSOM_COUNT }, () => Math.random()),
      1
    )
  )
  geometry.setAttribute(
    'aSpawnAngle',
    new THREE.BufferAttribute(
      Float32Array.from(
        { length: BLOSSOM_COUNT },
        (_, blossom) => (blossom / BLOSSOM_COUNT) * FULL_TURN
      ),
      1
    )
  )
  return geometry
}

export const createBlossomMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: BLOSSOM_VERT,
    fragmentShader: BLOSSOM_FRAG,
    defines: floatDefines({
      LIFE_SECONDS: BLOSSOM_LIFE_SECONDS,
      RISE: BLOSSOM_RISE,
      GATHER: BLOSSOM_GATHER,
      SWIRL: BLOSSOM_SWIRL,
      SWAY: BLOSSOM_SWAY,
      SWAY_RATE: BLOSSOM_SWAY_RATE,
      SPIN_RATE: BLOSSOM_SPIN_RATE,
      TUMBLE_RATE: BLOSSOM_TUMBLE_RATE,
    }),
    transparent: true,
    depthWrite: false,
    uniforms: {
      uClock: { value: 0 },
      uPresence: { value: 0 },
      uSize: { value: 1 },
      uCentre: { value: new THREE.Vector3(...PLAZA_CENTRE) },
      uSpawnRadii: { value: new THREE.Vector2(...BLOSSOM_SPAWN_RADII) },
      uPetalColor: { value: displayColorOf(BLOSSOM_PETAL_COLOR) },
      uHeartColor: { value: displayColorOf(BLOSSOM_HEART_COLOR) },
    },
  })
