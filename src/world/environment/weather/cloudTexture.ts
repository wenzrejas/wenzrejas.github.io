import * as THREE from 'three'

export const CLOUD_TILE = 620
export const CLOUD_PLANE_SIZE = 2600

const TEX_SIZE = 256
const BASE_FREQ = 3
const OCTAVES = 5
const SHAPE_THRESHOLD = 0.48
const SHAPE_SOFT = 0.22

// ── Tileable value noise ──────────────────────────────────────────────────────

function latticeHash(ix: number, iy: number, period: number): number {
  const x = ((ix % period) + period) % period
  const y = ((iy % period) + period) % period
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

const quintic = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)

function tileNoise(u: number, v: number, freq: number): number {
  const x = u * freq
  const y = v * freq
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = quintic(x - ix)
  const fy = quintic(y - iy)

  const a = latticeHash(ix, iy, freq)
  const b = latticeHash(ix + 1, iy, freq)
  const c = latticeHash(ix, iy + 1, freq)
  const d = latticeHash(ix + 1, iy + 1, freq)

  const top = a + (b - a) * fx
  const bottom = c + (d - c) * fx
  return top + (bottom - top) * fy
}

function tileFbm(u: number, v: number): number {
  let value = 0
  let amp = 0.5
  let freq = BASE_FREQ
  let norm = 0
  for (let o = 0; o < OCTAVES; o++) {
    value += amp * tileNoise(u, v, freq)
    norm += amp
    amp *= 0.5
    freq *= 2
  }
  return value / norm
}

const smootherstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * t * (t * (t * 6 - 15) + 10)
}

// ── The density field ─────────────────────────────────────────────────────────

const density = new Float32Array(TEX_SIZE * TEX_SIZE)

{
  for (let y = 0; y < TEX_SIZE; y++) {
    for (let x = 0; x < TEX_SIZE; x++) {
      const u = x / TEX_SIZE
      const v = y / TEX_SIZE
      const wu = tileFbm(u + 0.31, v + 0.77) - 0.5
      const wv = tileFbm(u + 0.83, v + 0.19) - 0.5
      const n = tileFbm(u + wu * 0.28, v + wv * 0.28)
      density[y * TEX_SIZE + x] = smootherstep(
        SHAPE_THRESHOLD - SHAPE_SOFT,
        SHAPE_THRESHOLD + SHAPE_SOFT,
        n
      )
    }
  }
}

export function createCloudTexture(): THREE.DataTexture {
  const data = new Uint8Array(TEX_SIZE * TEX_SIZE * 4)
  for (let i = 0; i < density.length; i++) {
    data[i * 4] = 255
    data[i * 4 + 1] = 255
    data[i * 4 + 2] = 255
    data[i * 4 + 3] = Math.round(density[i] * 255)
  }
  const tex = new THREE.DataTexture(data, TEX_SIZE, TEX_SIZE, THREE.RGBAFormat)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.generateMipmaps = true
  tex.anisotropy = 4
  tex.needsUpdate = true
  return tex
}
