import * as THREE from 'three'

/** Linear interpolation between two numbers. */
export function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// Scratch instances — avoids per-frame heap allocation in hot paths
const _ca = new THREE.Color()
const _cb = new THREE.Color()

/** Lerp between two CSS-color strings, writing the result into `out`. */
export function lerpColor(a: string, b: string, t: number, out: THREE.Color): void {
  _ca.set(a)
  _cb.set(b)
  out.lerpColors(_ca, _cb, t)
}

/** Lerp between two [x, y, z] tuples, writing the result into `out`. */
export function lerpVec3(
  lo: readonly [number, number, number],
  hi: readonly [number, number, number],
  t: number,
  out: THREE.Vector3
): void {
  out.set(lo[0] + (hi[0] - lo[0]) * t, lo[1] + (hi[1] - lo[1]) * t, lo[2] + (hi[2] - lo[2]) * t)
}
