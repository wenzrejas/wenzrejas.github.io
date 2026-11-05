import * as THREE from 'three'
import {
  CLOUD_HASH_SCALE,
  CLOUD_HASH_X,
  CLOUD_HASH_Y,
  CLOUD_NOISE_FREQUENCY,
  CLOUD_NOISE_OCTAVES,
  CLOUD_OCTAVE_FALLOFF,
  CLOUD_OCTAVE_GROWTH,
  CLOUD_SHAPE_SOFTNESS,
  CLOUD_SHAPE_THRESHOLD,
  CLOUD_TEXTURE_ANISOTROPY,
  CLOUD_TEXTURE_SIZE,
  CLOUD_WARP_STRENGTH,
  CLOUD_WARP_U_OFFSET,
  CLOUD_WARP_V_OFFSET,
} from './constants'

// ── Tileable value noise ──────────────────────────────────────────────────────

function latticeHash(column: number, row: number, period: number): number {
  const wrappedColumn = ((column % period) + period) % period
  const wrappedRow = ((row % period) + period) % period
  const scrambled =
    Math.sin(wrappedColumn * CLOUD_HASH_X + wrappedRow * CLOUD_HASH_Y) * CLOUD_HASH_SCALE
  return scrambled - Math.floor(scrambled)
}

const quintic = (share: number) => share * share * share * (share * (share * 6 - 15) + 10)

function tileNoise(u: number, v: number, frequency: number): number {
  const x = u * frequency
  const y = v * frequency
  const column = Math.floor(x)
  const row = Math.floor(y)
  const blendX = quintic(x - column)
  const blendY = quintic(y - row)

  const topLeft = latticeHash(column, row, frequency)
  const topRight = latticeHash(column + 1, row, frequency)
  const bottomLeft = latticeHash(column, row + 1, frequency)
  const bottomRight = latticeHash(column + 1, row + 1, frequency)

  const top = topLeft + (topRight - topLeft) * blendX
  const bottom = bottomLeft + (bottomRight - bottomLeft) * blendX
  return top + (bottom - top) * blendY
}

function tileFbm(u: number, v: number): number {
  let value = 0
  let amplitude = CLOUD_OCTAVE_FALLOFF
  let frequency = CLOUD_NOISE_FREQUENCY
  let totalAmplitude = 0
  for (let octave = 0; octave < CLOUD_NOISE_OCTAVES; octave++) {
    value += amplitude * tileNoise(u, v, frequency)
    totalAmplitude += amplitude
    amplitude *= CLOUD_OCTAVE_FALLOFF
    frequency *= CLOUD_OCTAVE_GROWTH
  }
  return value / totalAmplitude
}

const smootherstep = (from: number, to: number, value: number) =>
  quintic(Math.min(1, Math.max(0, (value - from) / (to - from))))

// ── Density field ─────────────────────────────────────────────────────────────

function bakeCloudDensity() {
  const density = new Float32Array(CLOUD_TEXTURE_SIZE * CLOUD_TEXTURE_SIZE)
  for (let y = 0; y < CLOUD_TEXTURE_SIZE; y++) {
    for (let x = 0; x < CLOUD_TEXTURE_SIZE; x++) {
      const u = x / CLOUD_TEXTURE_SIZE
      const v = y / CLOUD_TEXTURE_SIZE
      const warpU = tileFbm(u + CLOUD_WARP_U_OFFSET[0], v + CLOUD_WARP_U_OFFSET[1]) - 0.5
      const warpV = tileFbm(u + CLOUD_WARP_V_OFFSET[0], v + CLOUD_WARP_V_OFFSET[1]) - 0.5
      const noise = tileFbm(u + warpU * CLOUD_WARP_STRENGTH, v + warpV * CLOUD_WARP_STRENGTH)
      density[y * CLOUD_TEXTURE_SIZE + x] = smootherstep(
        CLOUD_SHAPE_THRESHOLD - CLOUD_SHAPE_SOFTNESS,
        CLOUD_SHAPE_THRESHOLD + CLOUD_SHAPE_SOFTNESS,
        noise
      )
    }
  }
  return density
}

export function createCloudTexture(): THREE.DataTexture {
  const density = bakeCloudDensity()
  const pixels = new Uint8Array(density.length * 4)
  for (let i = 0; i < density.length; i++) {
    pixels[i * 4] = 255
    pixels[i * 4 + 1] = 255
    pixels[i * 4 + 2] = 255
    pixels[i * 4 + 3] = Math.round(density[i] * 255)
  }
  const texture = new THREE.DataTexture(
    pixels,
    CLOUD_TEXTURE_SIZE,
    CLOUD_TEXTURE_SIZE,
    THREE.RGBAFormat
  )
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  texture.anisotropy = CLOUD_TEXTURE_ANISOTROPY
  texture.needsUpdate = true
  return texture
}
