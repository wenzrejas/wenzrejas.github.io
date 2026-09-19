import * as THREE from 'three'

const _dir = new THREE.Vector3()

const frame = { x: 0, z: 0, fwdX: 0, fwdZ: 0, halfW: 0, halfD: 0, lift: 0 }

export function sampleGroundFrame(camera: THREE.Camera, out?: THREE.Vector2): void {
  camera.getWorldDirection(_dir)
  const drop = Math.max(Math.abs(_dir.y), 1e-3)
  const flat = Math.hypot(_dir.x, _dir.z) || 1

  frame.fwdX = _dir.x / flat
  frame.fwdZ = _dir.z / flat
  frame.lift = flat / drop

  const travel = camera.position.y / drop
  frame.x = camera.position.x + _dir.x * travel
  frame.z = camera.position.z + _dir.z * travel
  if (out) out.set(frame.x, frame.z)

  const cam = camera as THREE.OrthographicCamera
  frame.halfW = (cam.right - cam.left) / (2 * cam.zoom)
  frame.halfD = (cam.top - cam.bottom) / (2 * cam.zoom) / drop
}

export function liftOffset(height: number, out: THREE.Vector2): THREE.Vector2 {
  const run = height * frame.lift
  return out.set(frame.fwdX * run, frame.fwdZ * run)
}

export function groundReach(dx: number, dz: number): number {
  const len = Math.hypot(dx, dz)
  if (len === 0) return Math.min(frame.halfW, frame.halfD)

  const along = Math.abs(dx * frame.fwdX + dz * frame.fwdZ) / len
  const across = Math.sqrt(Math.max(0, 1 - along * along))

  return 1 / Math.max(across / frame.halfW, along / frame.halfD)
}
