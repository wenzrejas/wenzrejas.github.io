import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import { mix } from '@/utils/math'
import { pickByShare, randomBetween, seededRandom } from '@/utils/random'
import { DEEPEST_LEVEL, levelDepth } from '../timeline/timeline'
import {
  SPARKLE_CORE_WHITENESS,
  SPARKLE_COUNT,
  SPARKLE_CYCLE_SECONDS,
  SPARKLE_DEEP_BOOST,
  SPARKLE_DEPTH_RAMP,
  SPARKLE_DRIFT,
  SPARKLE_DRIFT_RATE,
  SPARKLE_FADE_DENSITY,
  SPARKLE_FARTHEST_Z,
  SPARKLE_FLASH_SHARE,
  SPARKLE_FROM_LEVEL,
  SPARKLE_HALO,
  SPARKLE_LEVELS_BELOW,
  SPARKLE_NEAREST_Z,
  SPARKLE_RAY_WIDTH,
  SPARKLE_SEED,
  SPARKLE_SIZE,
  SPARKLE_SPREAD_ACROSS,
  SPARKLE_STRENGTH,
  SPARKLE_TINTS,
} from './constants'
import DEEP_SPARKLES_VERT from './shaders/deepSparkles.vert.glsl'
import DEEP_SPARKLES_FRAG from './shaders/deepSparkles.frag.glsl'

const TINTS = SPARKLE_TINTS.map(({ color, share }) => ({ color: displayColorOf(color), share }))
const LOWEST_LEVEL = DEEPEST_LEVEL + SPARKLE_LEVELS_BELOW

export function buildSparkleGeometry(): THREE.BufferGeometry {
  const random = seededRandom(SPARKLE_SEED)
  const between = randomBetween(random)
  const positions = new Float32Array(SPARKLE_COUNT * 3)
  const timings = new Float32Array(SPARKLE_COUNT * 3)
  const tints = new Float32Array(SPARKLE_COUNT * 3)
  for (let i = 0; i < SPARKLE_COUNT; i++) {
    const depthShare = random() ** (1 / (SPARKLE_DEPTH_RAMP + 1))
    const level = mix(SPARKLE_FROM_LEVEL, LOWEST_LEVEL, depthShare)
    positions.set(
      [
        between(-SPARKLE_SPREAD_ACROSS, SPARKLE_SPREAD_ACROSS),
        levelDepth(level),
        between(SPARKLE_FARTHEST_Z, SPARKLE_NEAREST_Z),
      ],
      i * 3
    )
    timings.set([between(...SPARKLE_CYCLE_SECONDS), random(), depthShare], i * 3)
    pickByShare(TINTS, random()).color.toArray(tints, i * 3)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('timing', new THREE.BufferAttribute(timings, 3))
  geometry.setAttribute('tint', new THREE.BufferAttribute(tints, 3))
  return geometry
}

export const createSparkleMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: DEEP_SPARKLES_VERT,
    fragmentShader: DEEP_SPARKLES_FRAG,
    defines: floatDefines({
      FLASH_SHARE: SPARKLE_FLASH_SHARE,
      DRIFT: SPARKLE_DRIFT,
      DRIFT_RATE: SPARKLE_DRIFT_RATE,
      SIZE: SPARKLE_SIZE,
      RAY_WIDTH: SPARKLE_RAY_WIDTH,
      STRENGTH: SPARKLE_STRENGTH,
      HALO: SPARKLE_HALO,
      CORE_WHITENESS: SPARKLE_CORE_WHITENESS,
      DEEP_BOOST: SPARKLE_DEEP_BOOST,
      FADE_DENSITY: SPARKLE_FADE_DENSITY,
    }),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelScale: { value: 1 },
    },
  })
