import * as THREE from 'three'

const _projected = new THREE.Vector3()

export function isOnScreen(position: THREE.Vector3, camera: THREE.Camera, margin: number): boolean {
  _projected.copy(position).project(camera)
  return Math.abs(_projected.x) < margin && Math.abs(_projected.y) < margin
}
