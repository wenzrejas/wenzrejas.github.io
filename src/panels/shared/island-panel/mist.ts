import * as THREE from 'three'
import { addNoiseOctaves, noiseGrid, seededRandom } from '../procedural/valueNoise'
import {
  MIST_EDGE,
  MIST_HEIGHT,
  MIST_OCTAVES,
  MIST_REACH,
  MIST_SEED,
  MIST_SOFTNESS,
  MIST_SOLID_DEPTH,
  MIST_TAIL_START,
  MIST_WIDTH,
} from './constants'

export interface MistAlphas {
  top: Uint8ClampedArray<ArrayBuffer>
  bottom: Uint8ClampedArray<ArrayBuffer>
}

const { smoothstep } = THREE.MathUtils

function mistDensities() {
  const random = seededRandom(MIST_SEED)
  const billows = noiseGrid(MIST_WIDTH, MIST_HEIGHT)
  addNoiseOctaves(billows, MIST_OCTAVES, random)

  const densities = new Float32Array(MIST_WIDTH * MIST_HEIGHT)
  for (let y = 0; y < MIST_HEIGHT; y++) {
    const depth = y / (MIST_HEIGHT - 1)
    const solid = 1 - smoothstep(depth, 0, MIST_SOLID_DEPTH)
    const tail = 1 - smoothstep(depth, MIST_TAIL_START, 1)
    for (let x = 0; x < MIST_WIDTH; x++) {
      const index = y * MIST_WIDTH + x
      const reach = depth + (billows.values[index] - 0.5) * MIST_REACH
      const billow = 1 - smoothstep(reach, MIST_EDGE - MIST_SOFTNESS, MIST_EDGE + MIST_SOFTNESS)
      densities[index] = Math.max(solid, billow * tail)
    }
  }
  return densities
}

export function mistAlphas(): MistAlphas {
  const densities = mistDensities()
  const top = new Uint8ClampedArray(densities.length)
  const bottom = new Uint8ClampedArray(densities.length)
  for (let y = 0; y < MIST_HEIGHT; y++) {
    const flippedRow = MIST_HEIGHT - 1 - y
    for (let x = 0; x < MIST_WIDTH; x++) {
      top[y * MIST_WIDTH + x] = (1 - densities[y * MIST_WIDTH + x]) * 255
      bottom[y * MIST_WIDTH + x] = (1 - densities[flippedRow * MIST_WIDTH + x]) * 255
    }
  }
  return { top, bottom }
}
