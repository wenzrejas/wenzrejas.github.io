import * as THREE from 'three'

const _projected = new THREE.Vector3()
const _viewProjection = new THREE.Matrix4()
const _view = new THREE.Frustum()

export function isOnScreen(position: THREE.Vector3, camera: THREE.Camera, margin: number): boolean {
  _projected.copy(position).project(camera)
  return Math.abs(_projected.x) < margin && Math.abs(_projected.y) < margin
}

export function isSphereInView(sphere: THREE.Sphere, camera: THREE.Camera): boolean {
  _viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  return _view.setFromProjectionMatrix(_viewProjection).intersectsSphere(sphere)
}
