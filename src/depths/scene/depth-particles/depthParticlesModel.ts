import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import { pickByShare, randomBetween, seededRandom } from '@/utils/random'
import { ARRIVAL_LEVEL } from '../constants'
import { DEEPEST_LEVEL, levelDepth } from '../timeline/timeline'
import {
  MOTE_BAND,
  MOTE_COUNT,
  MOTE_FADE_DENSITY,
  MOTE_LEVEL_MARGIN,
  MOTE_RISE,
  MOTE_SEED,
  MOTE_SIZE,
  MOTE_SPREAD_ACROSS,
  MOTE_SPREAD_DEEP,
  MOTE_STRENGTH,
  MOTE_SWAY,
  MOTE_SWAY_RATE,
  MOTE_TINTS,
  MOTE_TWINKLE,
  MOTE_TWINKLE_RATE,
} from './constants'
import DEPTH_MOTES_VERT from './shaders/depthMotes.vert.glsl'
import DEPTH_MOTES_FRAG from './shaders/depthMotes.frag.glsl'

const TINTS = MOTE_TINTS.map(({ color, share }) => ({ color: displayColorOf(color), share }))

export function buildMoteGeometry(): THREE.BufferGeometry {
  const random = seededRandom(MOTE_SEED)
  const between = randomBetween(random)
  const positions = new Float32Array(MOTE_COUNT * 3)
  const seeds = new Float32Array(MOTE_COUNT)
  const tints = new Float32Array(MOTE_COUNT * 3)
  for (let i = 0; i < MOTE_COUNT; i++) {
    const level = between(ARRIVAL_LEVEL - MOTE_LEVEL_MARGIN, DEEPEST_LEVEL + MOTE_LEVEL_MARGIN)
    positions.set(
      [
        between(-MOTE_SPREAD_ACROSS, MOTE_SPREAD_ACROSS),
        levelDepth(level) + between(-MOTE_BAND, MOTE_BAND) / 2,
        between(-MOTE_SPREAD_DEEP, MOTE_SPREAD_DEEP),
      ],
      i * 3
    )
    seeds[i] = random()
    pickByShare(TINTS, random()).color.toArray(tints, i * 3)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 1))
  geometry.setAttribute('tint', new THREE.BufferAttribute(tints, 3))
  return geometry
}

export const createMoteMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: DEPTH_MOTES_VERT,
    fragmentShader: DEPTH_MOTES_FRAG,
    defines: floatDefines({
      BAND: MOTE_BAND,
      RISE: MOTE_RISE,
      SWAY: MOTE_SWAY,
      SWAY_RATE: MOTE_SWAY_RATE,
      SIZE: MOTE_SIZE,
      STRENGTH: MOTE_STRENGTH,
      FADE_DENSITY: MOTE_FADE_DENSITY,
      TWINKLE: MOTE_TWINKLE,
      TWINKLE_RATE: MOTE_TWINKLE_RATE,
    }),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelScale: { value: 1 },
    },
  })
