import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import { mix } from '@/utils/math'
import { seededRandom } from '@/utils/random'
import {
  RAY_COLOR,
  RAY_COUNT,
  RAY_FAN_DEGREES,
  RAY_FARTHEST_Z,
  RAY_LENGTH,
  RAY_NEAREST_Z,
  RAY_REACH,
  RAY_SEED,
  RAY_SHIMMER_RATE,
  RAY_SLANT_DEGREES,
  RAY_SLANT_JITTER_DEGREES,
  RAY_SPREAD_ACROSS,
  RAY_STRENGTH,
  RAY_SWAY,
  RAY_TOP,
  RAY_TOP_WIDTH_MAX,
  RAY_TOP_WIDTH_MIN,
  RAY_WIDENING,
} from './constants'
import LIGHT_RAYS_VERT from './shaders/lightRays.vert.glsl'
import LIGHT_RAYS_FRAG from './shaders/lightRays.frag.glsl'

const { degToRad } = THREE.MathUtils

const CORNERS: [number, number][] = [
  [-1, 0],
  [1, 0],
  [1, 1],
  [-1, 1],
]

export function buildRayGeometry(): THREE.BufferGeometry {
  const random = seededRandom(RAY_SEED)
  const between = (min: number, max: number) => mix(min, max, random())
  const positions: number[] = []
  const shafts: number[] = []
  const seeds: number[] = []
  const indices: number[] = []

  for (let ray = 0; ray < RAY_COUNT; ray++) {
    const topX = between(-RAY_SPREAD_ACROSS, RAY_SPREAD_ACROSS)
    const z = between(RAY_FARTHEST_Z, RAY_NEAREST_Z)
    const topWidth = between(RAY_TOP_WIDTH_MIN, RAY_TOP_WIDTH_MAX)
    const fan = (topX / RAY_SPREAD_ACROSS) * RAY_FAN_DEGREES
    const slant = degToRad(RAY_SLANT_DEGREES - fan + between(-1, 1) * RAY_SLANT_JITTER_DEGREES)
    const seed = random()
    const first = ray * 4
    for (const [across, along] of CORNERS) {
      const halfWidth = (topWidth / 2) * mix(1, RAY_WIDENING, along)
      const drop = along * RAY_LENGTH
      positions.push(topX + across * halfWidth - Math.tan(slant) * drop, RAY_TOP - drop, z)
      shafts.push(across, along)
      seeds.push(seed)
    }
    indices.push(first, first + 1, first + 2, first, first + 2, first + 3)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('shaft', new THREE.Float32BufferAttribute(shafts, 2))
  geometry.setAttribute('seed', new THREE.Float32BufferAttribute(seeds, 1))
  geometry.setIndex(indices)
  return geometry
}

export const createRayMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: LIGHT_RAYS_VERT,
    fragmentShader: LIGHT_RAYS_FRAG,
    defines: floatDefines({
      TOP: RAY_TOP,
      REACH: RAY_REACH,
      STRENGTH: RAY_STRENGTH,
      SHIMMER_RATE: RAY_SHIMMER_RATE,
      SWAY: RAY_SWAY,
    }),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: displayColorOf(RAY_COLOR) },
    },
  })
