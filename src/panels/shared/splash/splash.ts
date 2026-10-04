import * as THREE from 'three'
import {
  addNoiseOctaves,
  noiseGrid,
  seededRandom,
  type NoiseOctave,
  type Random,
} from '../procedural/valueNoise'
import {
  SPLASH_BODY,
  SPLASH_EDGE_SOFTNESS,
  SPLASH_LOBE_COUNT,
  SPLASH_LOBE_STRENGTH,
  SPLASH_MOTTLE,
  SPLASH_MOTTLE_OCTAVES,
  SPLASH_PIXELS,
  SPLASH_RADIUS,
  SPLASH_RAGGED_OCTAVES,
  SPLASH_RAGGEDNESS,
  SPLASH_RIM_BOOST,
  SPLASH_RIM_WIDTH,
  SPLASH_SEED,
  SPLASH_VARIANTS,
} from './constants'

const { clamp, smoothstep } = THREE.MathUtils

function octaveNoise(octaves: NoiseOctave[], random: Random) {
  const grid = noiseGrid(SPLASH_PIXELS, SPLASH_PIXELS)
  addNoiseOctaves(grid, octaves, random)
  return grid.values
}

function splashLobes(random: Random) {
  return Array.from({ length: SPLASH_LOBE_COUNT }, (_, i) => ({
    frequency: i + 2,
    strength: (SPLASH_LOBE_STRENGTH * (0.4 + 0.6 * random())) / Math.sqrt(i + 1),
    phase: random() * Math.PI * 2,
  }))
}

function splashAlpha(random: Random) {
  const ragged = octaveNoise(SPLASH_RAGGED_OCTAVES, random)
  const mottle = octaveNoise(SPLASH_MOTTLE_OCTAVES, random)
  const lobes = splashLobes(random)
  const center = SPLASH_PIXELS / 2
  const radius = SPLASH_PIXELS * SPLASH_RADIUS
  const alphas = new Uint8ClampedArray(SPLASH_PIXELS * SPLASH_PIXELS)

  for (let y = 0; y < SPLASH_PIXELS; y++) {
    for (let x = 0; x < SPLASH_PIXELS; x++) {
      const index = y * SPLASH_PIXELS + x
      const dx = x + 0.5 - center
      const dy = y + 0.5 - center
      const angle = Math.atan2(dy, dx)
      let edge = 1 + (ragged[index] - 0.5) * SPLASH_RAGGEDNESS
      for (const { frequency, strength, phase } of lobes) {
        edge += strength * Math.sin(frequency * angle + phase)
      }
      const gap = edge - Math.hypot(dx, dy) / radius
      const coverage = smoothstep(gap, 0, SPLASH_EDGE_SOFTNESS)
      const rim = 1 - smoothstep(gap, 0, SPLASH_RIM_WIDTH)
      const density = SPLASH_BODY + (mottle[index] - 0.5) * SPLASH_MOTTLE + rim * SPLASH_RIM_BOOST
      alphas[index] = coverage * clamp(density, 0, 1) * 255
    }
  }
  return alphas
}

export function splashAlphas() {
  const random = seededRandom(SPLASH_SEED)
  return Array.from({ length: SPLASH_VARIANTS }, () => splashAlpha(random))
}
