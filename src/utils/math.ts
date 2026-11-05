import * as THREE from 'three'

export const FULL_TURN = Math.PI * 2

export function mix(from: number, to: number, blend: number): number {
  return from + (to - from) * blend
}

export const rand = (min: number, max: number) => mix(min, max, Math.random())

export const wrapAngle = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle))

export function turnToward(from: number, to: number, maxStep: number): number {
  return from + THREE.MathUtils.clamp(wrapAngle(to - from), -maxStep, maxStep)
}

export function lerpVector3(
  from: readonly [number, number, number],
  to: readonly [number, number, number],
  blend: number,
  out: THREE.Vector3
): void {
  out.set(
    from[0] + (to[0] - from[0]) * blend,
    from[1] + (to[1] - from[1]) * blend,
    from[2] + (to[2] - from[2]) * blend
  )
}
