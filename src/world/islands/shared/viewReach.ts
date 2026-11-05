import * as THREE from 'three'
import { NEAR_ZERO } from '@/utils/math'

const _direction = new THREE.Vector3()

const frame = { x: 0, z: 0, fwdX: 0, fwdZ: 0, halfW: 0, halfD: 0, lift: 0 }

export function sampleGroundFrame(camera: THREE.Camera, out?: THREE.Vector2): void {
  camera.getWorldDirection(_direction)
  const drop = Math.max(Math.abs(_direction.y), NEAR_ZERO)
  const flat = Math.hypot(_direction.x, _direction.z) || 1

  frame.fwdX = _direction.x / flat
  frame.fwdZ = _direction.z / flat
  frame.lift = flat / drop

  const travel = camera.position.y / drop
  frame.x = camera.position.x + _direction.x * travel
  frame.z = camera.position.z + _direction.z * travel
  if (out) out.set(frame.x, frame.z)

  const orthographic = camera as THREE.OrthographicCamera
  frame.halfW = (orthographic.right - orthographic.left) / (2 * orthographic.zoom)
  frame.halfD = (orthographic.top - orthographic.bottom) / (2 * orthographic.zoom) / drop
}

export function liftOffset(height: number, out: THREE.Vector2): THREE.Vector2 {
  const run = height * frame.lift
  return out.set(frame.fwdX * run, frame.fwdZ * run)
}

export function groundReach(deltaX: number, deltaZ: number): number {
  const length = Math.hypot(deltaX, deltaZ)
  if (length === 0) return Math.min(frame.halfW, frame.halfD)

  const along = Math.abs(deltaX * frame.fwdX + deltaZ * frame.fwdZ) / length
  const across = Math.sqrt(Math.max(0, 1 - along * along))

  return 1 / Math.max(across / frame.halfW, along / frame.halfD)
}
