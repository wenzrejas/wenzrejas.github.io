import * as THREE from 'three'

export const FULL_TURN = Math.PI * 2

export function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export const rand = (min: number, max: number) => mix(min, max, Math.random())

export const wrapAngle = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle))

export function turnToward(from: number, to: number, maxStep: number): number {
  return from + THREE.MathUtils.clamp(wrapAngle(to - from), -maxStep, maxStep)
}

const _ca = new THREE.Color()
const _cb = new THREE.Color()

export function lerpColor(a: string, b: string, t: number, out: THREE.Color): void {
  _ca.set(a)
  _cb.set(b)
  out.lerpColors(_ca, _cb, t)
}

export function lerpVec3(
  lo: readonly [number, number, number],
  hi: readonly [number, number, number],
  t: number,
  out: THREE.Vector3
): void {
  out.set(lo[0] + (hi[0] - lo[0]) * t, lo[1] + (hi[1] - lo[1]) * t, lo[2] + (hi[2] - lo[2]) * t)
}
