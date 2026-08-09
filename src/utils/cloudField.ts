import type * as THREE from 'three'

const fract = (x: number) => x - Math.floor(x)

function cHash(x: number, y: number): number {
  return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453)
}

function cGnoise(px: number, py: number): number {
  const ix = Math.floor(px)
  const iy = Math.floor(py)
  const fx = px - ix
  const fy = py - iy

  const grad = (gx: number, gy: number, dx: number, dy: number) => {
    const h = cHash(gx, gy) * 6.28318
    return Math.cos(h) * dx + Math.sin(h) * dy
  }

  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10)
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10)

  const n00 = grad(ix, iy, fx, fy)
  const n10 = grad(ix + 1, iy, fx - 1, fy)
  const n01 = grad(ix, iy + 1, fx, fy - 1)
  const n11 = grad(ix + 1, iy + 1, fx - 1, fy - 1)

  const nx0 = n00 + (n10 - n00) * ux
  const nx1 = n01 + (n11 - n01) * ux
  return (nx0 + (nx1 - nx0) * uy) * 0.5 + 0.5
}

function cFbm(px: number, py: number): number {
  let v = 0
  let a = 0.5
  for (let i = 0; i < 3; i++) {
    v += a * cGnoise(px, py)
    const rx = 0.8 * px - 0.6 * py
    const ry = 0.6 * px + 0.8 * py
    px = rx * 2.1 + 1.7
    py = ry * 2.1 + 9.2
    a *= 0.5
  }
  return v
}

const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

export function cloudCoverageAt(
  x: number,
  z: number,
  offset: THREE.Vector2,
  time: number,
  cover: number
): number {
  const ux = x * 0.006 + offset.x
  const uz = z * 0.006 + offset.y
  const t = time * 0.015
  const wx = (cGnoise(ux * 0.5 + t, uz * 0.5 + 1.9) - 0.5) * 0.35
  const wz = (cGnoise(ux * 0.5 + 9.7, uz * 0.5 + 6.4 + t * 0.7) - 0.5) * 0.35
  const n = cFbm(ux + wx, uz + wz)

  const threshold = 0.64 + (0.4 - 0.64) * cover
  const soft = 0.2
  return smoothstep(threshold - soft, threshold + soft, n)
}
